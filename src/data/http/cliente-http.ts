// Adaptador HTTP contra handyx-client-be. Reglas (AGENTS.md):
// - Sesión en cookie HttpOnly del backend (`credentials: 'include'`); el CSRF vive solo en esta memoria.
// - Escrituras: `X-CSRF-Token` y, si son idempotentes, `Idempotency-Key`.
// - Toda respuesta se valida contra el contrato: si no cumple, es error (nunca se cae a datos de prueba).
import { ErrorApi } from '../../contracts/v1/comunes.ts';
import {
  CABECERAS,
  type EndpointId,
  type RespuestaDe,
  endpoint,
  rutaDe,
} from '../../contracts/v1/endpoints.ts';
import { type ClienteApi, ErrorCliente, type Llamada, MENSAJES_LOCALES } from '../cliente.ts';
import { camposDeZod } from '../validacion.ts';

export interface OpcionesHttp {
  readonly baseUrl: string;
  readonly fetch?: typeof globalThis.fetch;
  readonly timeoutMs?: number;
  readonly nuevaClave?: () => string;
}

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

  return { modo: 'http', llamar: (id, llamada = {}) => enviar(id, llamada) };
}
