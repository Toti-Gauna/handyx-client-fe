// Adaptador mock de la vista de prueba: mismo contrato que el HTTP, datos en memoria (nunca en el navegador),
// latencia y fallas configurables para recorrer estados de carga, error y reintento.
// Fase 1: cuenta, fee, rubros, cobertura y listas vacías. La Fase 2 suma el resto y los 18 escenarios.
import type { CodigoError } from '../../contracts/v1/comunes.ts';
import { ESTADO_HTTP } from '../../contracts/v1/comunes.ts';
import { type EndpointId, type RespuestaDe, endpoint } from '../../contracts/v1/endpoints.ts';
import { type ClienteApi, ErrorCliente, type Llamada, MENSAJES_LOCALES } from '../cliente.ts';
import { camposDeZod } from '../validacion.ts';
import { type DatosMock, datosIniciales } from './fixtures.ts';

export interface OpcionesMock {
  /** Demora de cada respuesta (ms). 0 en pruebas. */
  readonly latenciaMs?: number;
  /** Forzar un error por endpoint para ver su estado (p. ej. `{ pedidos: 'no_disponible' }`). */
  readonly fallas?: Partial<Record<EndpointId, CodigoError>>;
  readonly datos?: DatosMock;
}

/** Vista simple de la llamada para los manejadores (ya validada contra el contrato). */
interface VistaLlamada {
  readonly parametros?: Readonly<Record<string, string>>;
  readonly consulta?: unknown;
  readonly cuerpo?: unknown;
}
type Manejador = (datos: DatosMock, llamada: VistaLlamada) => unknown;

const vacio = { items: [], siguiente: null };

const MANEJADORES: Partial<Record<EndpointId, Manejador>> = {
  version: () => ({ contrato: 'mock' }),
  csrf: (d) => ({ csrfToken: d.sesion.csrfToken }),
  sesion: (d) => d.sesion,
  fee: (d) => d.fee,
  feeAceptar: (d) => {
    const vigente = d.fee.vigente;
    if (vigente)
      d.fee = {
        ...d.fee,
        aceptada: { politicaId: vigente.id, version: vigente.version, aceptadaEn: d.fee.ahora },
      };
    return d.fee;
  },
  rubros: (d) => ({ items: d.rubros }),
  cobertura: (d, llamada) => {
    const ciudad = String(
      (llamada.consulta as { ciudad?: unknown } | undefined)?.ciudad ?? '',
    ).trim();
    return { ciudad, cubierta: d.ciudadesConCobertura.includes(ciudad.toLocaleLowerCase('es-AR')) };
  },
  pedidos: (d) => ({ items: d.pedidos, siguiente: null }),
  trabajos: () => vacio,
  conversaciones: () => vacio,
  notificaciones: () => vacio,
  reclamos: () => vacio,
};

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

export function crearClienteMock(opciones: OpcionesMock = {}): ClienteApi {
  const datos = opciones.datos ?? datosIniciales();
  const latencia = opciones.latenciaMs ?? 450;

  return {
    modo: 'mock',
    async llamar<I extends EndpointId>(id: I, llamada: Llamada<I> = {}): Promise<RespuestaDe<I>> {
      const ep = endpoint(id);
      await esperar(latencia, llamada.senal);
      const falla = opciones.fallas?.[id];
      if (falla)
        throw new ErrorCliente({
          codigo: falla,
          mensaje: `Error simulado (${ESTADO_HTTP[falla]}).`,
        });
      if (ep.cuerpo && ep.cuerpo !== 'multipart') {
        const valido = ep.cuerpo.safeParse(llamada.cuerpo);
        if (!valido.success)
          throw new ErrorCliente({
            codigo: 'validacion',
            mensaje: 'Revisá los datos marcados.',
            campos: camposDeZod(valido.error),
          });
      }
      const manejar = MANEJADORES[id];
      if (!manejar)
        throw new ErrorCliente({
          codigo: 'funcion_inactiva',
          mensaje: MENSAJES_LOCALES.mockPendiente,
        });
      const respuesta = manejar(datos, llamada);
      // Los fixtures cumplen el contrato o la vista de prueba falla a la vista (no se tapan desvíos).
      return (ep.respuesta === null ? undefined : ep.respuesta.parse(respuesta)) as RespuestaDe<I>;
    },
  };
}
