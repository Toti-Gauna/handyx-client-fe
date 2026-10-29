// Contrato v1 de la API de usuario de Handyx · piezas comunes.
// Dueño: handyx-client-be (docs/adr/ADR-0001-dueno-del-esquema.md). Se copia byte a byte a handyx-client-fe
// (src/contracts/v1/) y a handyx-specialist-be; ahí no se edita. Cambios: acá, con versión nueva.
import { z } from 'zod';

export const ZONA_HORARIA = 'America/Argentina/Buenos_Aires';

export const Id = z.uuid();
export type Id = z.infer<typeof Id>;

/** Instante en UTC con `Z`. Se muestra siempre en la zona de Buenos Aires. */
export const Instante = z.iso.datetime({ offset: false });
/** Fecha calendario de Buenos Aires: "2026-11-17". */
export const FechaLocal = z.iso.date();
/** Hora de Buenos Aires: "03:00". */
export const HoraLocal = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

/** Importes en centavos enteros. Nunca floats. */
export const Centavos = z.int().min(0).max(Number.MAX_SAFE_INTEGER);
export const Moneda = z.literal('ARS');
export const Importe = z.object({ centavos: Centavos, moneda: Moneda }).strict();
export type Importe = z.infer<typeof Importe>;
/** Porcentajes en puntos básicos enteros: 0 = 0 %, 500 = 5 %. */
export const PuntosBasicos = z.int().min(0).max(10000);

/** Control de concurrencia optimista: cada escritura manda la versión que vio. */
export const Version = z.int().min(0);
/** Cabecera `Idempotency-Key` (UUIDv4, se reusa al reintentar el mismo envío). */
export const ClaveIdempotencia = z.uuid({ version: 'v4' });

export const ROLES = ['usuario', 'especialista'] as const;
export const Rol = z.enum(ROLES);
export type Rol = z.infer<typeof Rol>;
/** Quién hizo algo en un historial. `operaciones` es el equipo interno (auth propia, sin cuenta de usuario). */
export const Actor = z.enum([...ROLES, 'operaciones', 'sistema']);

export const Texto = (max: number) => z.string().trim().min(1).max(max);

/** Listas paginadas en servidor con cursor opaco. `siguiente: null` = no hay más. */
export const paginado = <T extends z.ZodType>(item: T) =>
  z.object({ items: z.array(item), siguiente: z.string().min(1).max(512).nullable() }).strict();
export const ConsultaPaginada = z
  .object({
    cursor: z.string().min(1).max(512).optional(),
    limite: z.coerce.number().int().min(1).max(50).optional(),
  })
  .strict();

export const CODIGOS_ERROR = [
  'validacion',
  'no_autenticado',
  'sesion_vencida',
  'sin_permiso',
  'csrf_invalido',
  'origen_no_permitido',
  'no_encontrado',
  'conflicto',
  'payload_grande',
  'tipo_no_permitido',
  'limite',
  'funcion_inactiva',
  'no_disponible',
  'error_interno',
] as const;
export const CodigoError = z.enum(CODIGOS_ERROR);
export type CodigoError = z.infer<typeof CodigoError>;

/** 409: qué cambió y qué tiene que refrescar o decidir el cliente. */
export const MOTIVOS_CONFLICTO = [
  'version',
  'transicion',
  'idempotencia',
  'vencida',
  'ya_resuelta',
] as const;
export const MotivoConflicto = z.enum(MOTIVOS_CONFLICTO);
export type MotivoConflicto = z.infer<typeof MotivoConflicto>;

/** Error de campo: nombre y motivo, nunca el valor recibido. */
export const ErrorCampo = z
  .object({
    campo: z.string().regex(/^[a-zA-Z][a-zA-Z0-9.]{0,63}$/),
    motivo: z.enum(['requerido', 'formato', 'rango', 'longitud', 'no_permitido']),
  })
  .strict();

/**
 * Cuerpo de todo error. `mensaje` es seguro para mostrar y no lleva datos internos.
 * Un recurso ajeno responde igual que uno inexistente (404 `no_encontrado`): no se revela que existe.
 */
export const ErrorApi = z
  .object({
    error: CodigoError,
    mensaje: z.string().max(200),
    requestId: z.uuid(),
    campos: z.array(ErrorCampo).max(50).optional(),
    conflicto: MotivoConflicto.optional(),
  })
  .strict();
export type ErrorApi = z.infer<typeof ErrorApi>;

export const ESTADO_HTTP: Readonly<Record<CodigoError, number>> = {
  validacion: 400,
  no_autenticado: 401,
  sesion_vencida: 401,
  sin_permiso: 403,
  csrf_invalido: 403,
  origen_no_permitido: 403,
  no_encontrado: 404,
  conflicto: 409,
  payload_grande: 413,
  tipo_no_permitido: 415,
  limite: 429,
  funcion_inactiva: 503,
  no_disponible: 503,
  error_interno: 500,
};
