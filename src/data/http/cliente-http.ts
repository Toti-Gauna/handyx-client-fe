// Adaptador HTTP contra handyx-client-be. Reglas (AGENTS.md):
// - Sesión en cookie HttpOnly del backend (`credentials: 'include'`); el CSRF vive solo en esta memoria.
// - Escrituras: `X-CSRF-Token` y, si son idempotentes, `Idempotency-Key`.
// - Toda respuesta se valida contra el contrato: si no cumple, es error (nunca se cae a datos de prueba).
// - Transmisiones en vivo (SSE, `formato: 'sse'`): `EventSource` con la misma cookie (`withCredentials`), sin CSRF
//   porque solo leen; cada mensaje se valida igual y, si la transmisión se cierra, se pregunta por JSON el error real.
import { ErrorApi } from '../../contracts/v1/comunes.ts';
import {
  CABECERAS,
  type EndpointId,
  type RespuestaDe,
  endpoint,
  rutaDe,
} from '../../contracts/v1/endpoints.ts';
import { SSE_VIAJE } from '../../contracts/v1/viaje.ts';
import {
  type ClienteApi,
  type EndpointVivo,
  ErrorCliente,
  type Escucha,
  type Llamada,
  MENSAJES_LOCALES,
} from '../cliente.ts';
import { camposDeZod } from '../validacion.ts';

export interface OpcionesHttp {
  readonly baseUrl: string;
  readonly fetch?: typeof globalThis.fetch;
  readonly timeoutMs?: number;
  readonly nuevaClave?: () => string;
  /** `EventSource` del navegador (inyectable en pruebas). */
  readonly EventSource?: typeof globalThis.EventSource;
}

/** Cada transmisión: el nombre del evento y su consulta JSON equivalente (para saber por qué se cerró). */
const VIVOS: Readonly<Record<EndpointVivo, { evento: string; json: 'trabajoViaje' }>> = {
  trabajoViajeEnVivo: { evento: SSE_VIAJE.evento, json: 'trabajoViaje' },
};
const CERRADA = 2; // EventSource.CLOSED

/** Endpoints cuya respuesta trae un `csrfToken` nuevo para la memoria. */
const ENTREGAN_CSRF = new Set<EndpointId>([
  'csrf',
  'login',
  'registro',
  'sesion',
  'perfil',
  'aceptacion',
]);

export function crearClienteHttp(opciones: OpcionesHttp): ClienteApi {
  const fetcher = opciones.fetch ?? globalThis.fetch.bind(globalThis);
  const timeoutMs = opciones.timeoutMs ?? 15000;
  const nuevaClave = opciones.nuevaClave ?? (() => crypto.randomUUID());
  let csrf: string | null = null;

  async function enviar<I extends EndpointId>(id: I, llamada: Llamada<I>): Promise<RespuestaDe<I>> {
    const ep = endpoint(id);
    if (ep.formato === 'sse') throw new Error(`${id} es una transmisión: se usa escuchar()`);
    const url = new URL(rutaDe(id, llamada.parametros ?? {}), opciones.baseUrl);
    for (const [clave, valor] of Object.entries(llamada.consulta ?? {}))
      if (valor !== undefined && valor !== null) url.searchParams.set(clave, String(valor));

    const cabeceras = new Headers({ Accept: 'application/json' });
    let cuerpo: BodyInit | undefined;
    if (ep.cuerpo === 'multipart') {
      cuerpo = llamada.cuerpo as FormData;
    } else if (ep.cuerpo) {
      // Misma validación que el servidor: los errores de campo se marcan sin hacer el pedido.
      const valido = ep.cuerpo.safeParse(llamada.cuerpo);
      if (!valido.success)
        throw new ErrorCliente({
          codigo: 'validacion',
          mensaje: 'Revisá los datos marcados.',
          campos: camposDeZod(valido.error),
        });
      cuerpo = JSON.stringify(valido.data);
      cabeceras.set('Content-Type', 'application/json');
    }

    if (ep.metodo !== 'GET' && id !== 'csrf') {
      if (csrf === null) await pedirCsrf();
      cabeceras.set(CABECERAS.csrf, csrf ?? '');
      if (ep.idempotente)
        cabeceras.set(CABECERAS.idempotencia, llamada.claveIdempotencia ?? nuevaClave());
    }

    const control = new AbortController();
    const reloj = setTimeout(() => control.abort('tiempo'), timeoutMs);
    llamada.senal?.addEventListener('abort', () => control.abort(llamada.senal?.reason), {
      once: true,
    });
    let respuesta: Response;
    try {
      respuesta = await fetcher(url, {
        method: ep.metodo,
        headers: cabeceras,
        body: cuerpo ?? null,
        credentials: 'include',
        cache: 'no-store',
        redirect: 'error',
        signal: control.signal,
      });
    } catch {
      throw new ErrorCliente({
        codigo: 'no_disponible',
        mensaje:
          control.signal.reason === 'tiempo' ? MENSAJES_LOCALES.tiempo : MENSAJES_LOCALES.sinRed,
      });
    } finally {
      clearTimeout(reloj);
    }

    const datos: unknown =
      respuesta.status === 204 ? undefined : await respuesta.json().catch(() => undefined);
    if (!respuesta.ok) {
      const error = ErrorApi.safeParse(datos);
      if (error.success) {
        if (error.data.error === 'csrf_invalido' || error.data.error === 'sesion_vencida')
          csrf = null;
        throw ErrorCliente.desdeApi(error.data);
      }
      throw new ErrorCliente({
        codigo: respuesta.status >= 500 ? 'no_disponible' : 'error_interno',
        mensaje: MENSAJES_LOCALES.fueraDeContrato,
      });
    }
    if (ep.respuesta === null) {
      if (id === 'logout') csrf = null;
      return undefined as RespuestaDe<I>;
    }
    const valida = ep.respuesta.safeParse(datos);
    if (!valida.success)
      throw new ErrorCliente({
        codigo: 'error_interno',
        mensaje: MENSAJES_LOCALES.fueraDeContrato,
      });
    if (ENTREGAN_CSRF.has(id)) csrf = (valida.data as { csrfToken: string }).csrfToken;
    return valida.data as RespuestaDe<I>;
  }

  async function pedirCsrf(): Promise<void> {
    await enviar('csrf', {});
  }

  function escuchar<I extends EndpointVivo>(
    id: I,
    llamada: Pick<Llamada<I>, 'parametros'>,
    escucha: Escucha<I>,
  ): () => void {
    const Fuente = opciones.EventSource ?? globalThis.EventSource;
    const ep = endpoint(id);
    const vivo = VIVOS[id];
    if (!Fuente || ep.respuesta === null) {
      escucha.alError(
        new ErrorCliente({ codigo: 'no_disponible', mensaje: MENSAJES_LOCALES.vivoCortado }),
      );
      return () => undefined;
    }
    const url = new URL(rutaDe(id, llamada.parametros ?? {}), opciones.baseUrl);
    const fuente = new Fuente(url.toString(), { withCredentials: true });
    let cerrada = false;
    const cerrar = () => {
      cerrada = true;
      fuente.close();
    };
    fuente.addEventListener(vivo.evento, (e) => {
      if (cerrada) return;
      let datos: unknown;
      try {
        datos = JSON.parse((e as MessageEvent<string>).data);
      } catch {
        datos = undefined;
      }
      const valido = ep.respuesta!.safeParse(datos);
      if (!valido.success) {
        cerrar();
        escucha.alError(
          new ErrorCliente({ codigo: 'error_interno', mensaje: MENSAJES_LOCALES.fueraDeContrato }),
        );
        return;
      }
      escucha.alMensaje(valido.data as RespuestaDe<I>);
      if ((valido.data as { estado?: string }).estado === 'terminado') cerrar();
    });
    fuente.onerror = () => {
      if (cerrada) return;
      // Conectando de nuevo (corte de red o latido perdido): el navegador reintenta solo.
      if (fuente.readyState !== CERRADA) {
        escucha.alError(
          new ErrorCliente({ codigo: 'no_disponible', mensaje: MENSAJES_LOCALES.vivoCortado }),
        );
        return;
      }
      // Cerrada sin reintento (respuesta que no es una transmisión: 401, 404, 409, 429…): la consulta JSON dice por qué.
      cerrar();
      enviar(vivo.json, { parametros: llamada.parametros ?? {} } as Llamada<typeof vivo.json>)
        .then((datos) => {
          escucha.alMensaje(datos as RespuestaDe<I>);
          escucha.alError(
            new ErrorCliente({ codigo: 'no_disponible', mensaje: MENSAJES_LOCALES.vivoCortado }),
          );
        })
        .catch((error: unknown) =>
          escucha.alError(
            error instanceof ErrorCliente
              ? error
              : new ErrorCliente({
                  codigo: 'no_disponible',
                  mensaje: MENSAJES_LOCALES.vivoCortado,
                }),
          ),
        );
    };
    return cerrar;
  }

  return { modo: 'http', llamar: (id, llamada = {}) => enviar(id, llamada), escuchar };
}
