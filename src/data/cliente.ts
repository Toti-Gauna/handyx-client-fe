// Interfaz única de datos. Las pantallas solo conocen `ClienteApi`; nunca importan fixtures ni hacen `fetch`.
// Dos adaptadores con el mismo contrato (src/contracts/v1): mock (vista de prueba) y HTTP (handyx-client-be).
import type { CodigoError, ErrorApi, MotivoConflicto } from '../contracts/v1/comunes.ts';
import type { ConsultaDe, CuerpoDe, EndpointId, RespuestaDe } from '../contracts/v1/endpoints.ts';

export interface Llamada<I extends EndpointId> {
  readonly parametros?: Readonly<Record<string, string>>;
  readonly consulta?: ConsultaDe<I>;
  readonly cuerpo?: CuerpoDe<I>;
  /** Reusar la misma clave al reintentar el mismo envío (doble tap, red caída): el servidor no duplica. */
  readonly claveIdempotencia?: string;
  readonly senal?: AbortSignal;
}

export interface ClienteApi {
  readonly modo: 'mock' | 'http';
  llamar<I extends EndpointId>(id: I, llamada?: Llamada<I>): Promise<RespuestaDe<I>>;
}

type CampoRechazado = NonNullable<ErrorApi['campos']>[number];

const RECUPERABLES = new Set<CodigoError>(['no_disponible', 'limite', 'error_interno']);

/** Error normalizado: lo que muestra la pantalla sale de acá, nunca de la excepción original. */
export class ErrorCliente extends Error {
  readonly codigo: CodigoError;
  readonly mensaje: string;
  readonly requestId: string | null;
  readonly campos: readonly CampoRechazado[];
  readonly conflicto: MotivoConflicto | null;

  constructor(datos: {
    codigo: CodigoError;
    mensaje: string;
    requestId?: string | null;
    campos?: readonly CampoRechazado[];
    conflicto?: MotivoConflicto | null;
  }) {
    super(datos.codigo);
    this.name = 'ErrorCliente';
    this.codigo = datos.codigo;
    this.mensaje = datos.mensaje;
    this.requestId = datos.requestId ?? null;
    this.campos = datos.campos ?? [];
    this.conflicto = datos.conflicto ?? null;
  }

  /** Red, límite o 5xx: se puede ofrecer "Reintentar" con la misma clave de idempotencia. */
  get recuperable(): boolean {
    return RECUPERABLES.has(this.codigo);
  }

  /** La sesión ya no vale: volver a ingresar sin perder lo tipeado. */
  get requiereIngreso(): boolean {
    return this.codigo === 'no_autenticado' || this.codigo === 'sesion_vencida';
  }

  static desdeApi(cuerpo: ErrorApi): ErrorCliente {
    return new ErrorCliente({
      codigo: cuerpo.error,
      mensaje: cuerpo.mensaje,
      requestId: cuerpo.requestId,
      campos: cuerpo.campos ?? [],
      conflicto: cuerpo.conflicto ?? null,
    });
  }
}

export const MENSAJES_LOCALES = {
  sinRed: 'No hay conexión. Revisá tu internet y probá de nuevo.',
  tiempo: 'El servidor tardó demasiado. Probá de nuevo.',
  fueraDeContrato: 'Recibimos una respuesta inesperada. Probá de nuevo en un rato.',
  mockPendiente: 'Esta parte de la vista de prueba todavía no tiene datos ficticios.',
} as const;
