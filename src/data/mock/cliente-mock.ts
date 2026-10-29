// Adaptador mock de la vista de prueba: mismo contrato que el HTTP, mundo en memoria (nunca en el navegador),
// reglas de servidor reproducidas, latencia y fallas configurables. Los 18 escenarios se activan con `?escenario=`.
import type { CodigoError } from '../../contracts/v1/comunes.ts';
import { ESTADO_HTTP } from '../../contracts/v1/comunes.ts';
import { type EndpointId, type RespuestaDe, endpoint } from '../../contracts/v1/endpoints.ts';
import { type ClienteApi, ErrorCliente, type Llamada, MENSAJES_LOCALES } from '../cliente.ts';
import { escenarioDeUrl, prueba } from '../prueba.ts';
import { camposDeZod } from '../validacion.ts';
import { CONSTRUCTORES, aplicarEscenario } from './escenarios-mundo.ts';
import { crearMundo } from './mundo.ts';
import { sincronizar } from './reglas.ts';
import { MANEJADORES, exigirSesion } from './servidor.ts';
import { ACCIONES, ejecutarAccion } from './simulador.ts';
import type { Mundo } from './tipos.ts';

export interface OpcionesMock {
  /** Demora de cada respuesta (ms). 0 en pruebas. */
  readonly latenciaMs?: number;
  /** Forzar un error por endpoint para ver su estado (p. ej. `{ pedidos: 'no_disponible' }`). */
  readonly fallas?: Partial<Record<EndpointId, CodigoError>>;
  /** Escenario (ver src/mapa/escenarios.ts). Por defecto, el de `?escenario=` o `nuevo-usuario`. */
  readonly escenario?: string;
  /** Reloj congelado: solo avanza con las acciones de prueba (tests deterministas). */
  readonly congelado?: boolean;
}

export interface ClienteMock extends ClienteApi {
  readonly modo: 'mock';
  readonly mundo: Mundo;
  readonly acciones: typeof ACCIONES;
  /** Ejecuta una acción de la contraparte/entorno; devuelve un mensaje para el panel. */
  ejecutar(id: string): string;
  readonly entorno: { red: boolean };
}

const esperar = (ms: number, senal?: AbortSignal) =>
  new Promise<void>((resolver, rechazar) => {
    if (ms <= 0) return resolver();
    const t = setTimeout(resolver, ms);
    senal?.addEventListener(
      'abort',
      () => (
        clearTimeout(t),
        rechazar(new ErrorCliente({ codigo: 'no_disponible', mensaje: MENSAJES_LOCALES.sinRed }))
      ),
      { once: true },
    );
  });

export function crearClienteMock(opciones: OpcionesMock = {}): ClienteMock {
  const escenario = opciones.escenario ?? escenarioDeUrl() ?? 'nuevo-usuario';
  const m = crearMundo({
    escenario: CONSTRUCTORES[escenario] ? escenario : 'nuevo-usuario',
    congelado: opciones.congelado ?? false,
  });
  prueba.escenario = m.escenario;
  aplicarEscenario(m, m.escenario);
  const latencia = opciones.latenciaMs ?? 350;
  const entorno = { red: true };

  return {
    modo: 'mock',
    mundo: m,
    acciones: ACCIONES,
    entorno,
    ejecutar: (id) => ejecutarAccion(m, entorno, id),
    async llamar<I extends EndpointId>(id: I, llamada: Llamada<I> = {}): Promise<RespuestaDe<I>> {
      const ep = endpoint(id);
      await esperar(latencia, llamada.senal);
      if (!entorno.red)
        throw new ErrorCliente({ codigo: 'no_disponible', mensaje: MENSAJES_LOCALES.sinRed });
      const falla = opciones.fallas?.[id];
      if (falla)
        throw new ErrorCliente({
          codigo: falla,
          mensaje: `Error simulado (${ESTADO_HTTP[falla]}).`,
        });
      sincronizar(m);
      if (ep.acceso === 'sesion') exigirSesion(m);

      let c: unknown = llamada.cuerpo;
      if (ep.cuerpo && ep.cuerpo !== 'multipart') {
        const valido = ep.cuerpo.safeParse(llamada.cuerpo);
        if (!valido.success)
          throw new ErrorCliente({
            codigo: 'validacion',
            mensaje: 'Revisá los datos marcados.',
            campos: camposDeZod(valido.error),
          });
        c = valido.data;
      }
      let q: Record<string, unknown> = {};
      if ('consulta' in ep && ep.consulta) {
        const valida = ep.consulta.safeParse(llamada.consulta ?? {});
        if (!valida.success)
          throw new ErrorCliente({
            codigo: 'validacion',
            mensaje: 'Revisá los datos marcados.',
            campos: camposDeZod(valida.error),
          });
        q = valida.data as Record<string, unknown>;
      }

      // Idempotencia: la misma clave devuelve la misma respuesta sin repetir el efecto.
      const claveCache =
        ep.metodo !== 'GET' && ep.idempotente && llamada.claveIdempotencia
          ? `${id}|${llamada.claveIdempotencia}`
          : null;
      if (claveCache && m.idem.has(claveCache))
        return structuredClone(m.idem.get(claveCache)) as RespuestaDe<I>;

      const salida = MANEJADORES[id](m, { p: llamada.parametros ?? {}, q, c });
      const respuesta =
        ep.respuesta === null ? undefined : structuredClone(ep.respuesta.parse(salida));
      if (claveCache) m.idem.set(claveCache, structuredClone(respuesta));
      return respuesta as RespuestaDe<I>;
    },
  };
}
