// Contrato v1 · rubros, pedidos, media y especialistas visibles para el usuario.
import { z } from 'zod';
import { Centavos, FechaLocal, HoraLocal, Id, Instante, Texto, Version } from './comunes.ts';
import { Ubicacion } from './cuenta.ts';

/** Mismos ids que RUBROS de la landing (Handy-landing-page-be/src/schemas/preregistro.ts). */
export const RUBROS = [
  'electricidad',
  'plomeria',
  'gas',
  'cerrajeria',
  'albanileria',
  'aire_acondicionado',
] as const;
export const Rubro = z.enum(RUBROS);
export type Rubro = z.infer<typeof Rubro>;

export const TIPOS_PEDIDO = ['urgente', 'programado', 'obra'] as const;
export const TipoPedido = z.enum(TIPOS_PEDIDO);

export const ESTADOS_PEDIDO = [
  'buscando',
  'con_propuestas',
  'sin_respuesta',
  'busqueda_manual',
  'contratado',
  'cancelado',
  'vencido',
] as const;
export const EstadoPedido = z.enum(ESTADOS_PEDIDO);
export type EstadoPedido = z.infer<typeof EstadoPedido>;

/** Imagen privada: URL firmada y temporal. Tipos y tamaño limitados en servidor (ver docs/api/contratos.md). */
export const TIPOS_MEDIA = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_BYTES_MEDIA = 5 * 1024 * 1024;
export const MediaRef = z
  .object({
    id: Id,
    tipo: z.enum(TIPOS_MEDIA),
    bytes: z.int().min(1).max(MAX_BYTES_MEDIA),
    url: z.url({ protocol: /^https$/ }),
    expiraEn: Instante,
  })
  .strict();

/** Fecha pedida: es una solicitud, no un turno confirmado. */
export const FechaSolicitada = z
  .object({ fecha: FechaLocal, desde: HoraLocal, hasta: HoraLocal.nullable() })
  .strict();

/** Autoaceptación (PROD-23): solo si el usuario la eligió antes, apagada por defecto. */
export const Autoaceptacion = z.object({ montoMaximoCentavos: Centavos }).strict();

const camposPedido = {
  rubro: Rubro,
  tipo: TipoPedido,
  descripcion: Texto(1000),
  ubicacion: Ubicacion,
  fechaSolicitada: FechaSolicitada.nullable(),
  /** Precio que propone el usuario al pedir (opcional): abre la negociación, no es un acuerdo. */
  precioPropuestoCentavos: Centavos.nullable(),
  autoaceptacion: Autoaceptacion.nullable(),
};

const fechaSegunTipo = (p: { tipo: string; fechaSolicitada: unknown }) =>
  p.tipo === 'urgente' ? p.fechaSolicitada === null : p.fechaSolicitada !== null;

export const PedidoEntrada = z
  .object({ ...camposPedido, fotos: z.array(Id).max(5) })
  .strict()
  .refine(fechaSegunTipo, { path: ['fechaSolicitada'], message: 'rango' });

export const EdicionPedidoEntrada = z
  .object({
    version: Version,
    descripcion: Texto(1000).optional(),
    fotos: z.array(Id).max(5).optional(),
    fechaSolicitada: FechaSolicitada.optional(),
  })
  .strict();

export const AccionPedidoEntrada = z.object({ version: Version }).strict();
export const CancelacionEntrada = z
  .object({
    version: Version,
    motivo: z.enum(['ya_no_lo_necesito', 'lo_resolvi_por_otro_lado', 'otro']),
  })
  .strict();

/** Ventana de búsqueda calculada por el servidor. Sin ETA: no se promete cuándo aparece un especialista. */
export const Busqueda = z
  .object({
    iniciadaEn: Instante,
    ventanaHasta: Instante,
    intento: z.int().min(1),
    maxIntentos: z.int().min(1),
  })
  .strict();

export const Pedido = z
  .object({
    id: Id,
    ...camposPedido,
    fotos: z.array(MediaRef).max(5),
    estado: EstadoPedido,
    busqueda: Busqueda,
    propuestasPendientes: z.int().min(0),
    trabajoId: Id.nullable(),
    version: Version,
    creadoEn: Instante,
    actualizadoEn: Instante,
  })
  .strict();
export type Pedido = z.infer<typeof Pedido>;

export const VERIFICACIONES = ['identidad', 'antecedentes', 'matricula'] as const;
/**
 * Datos profesionales autorizados de un especialista. `verificaciones` solo lista lo que Operations verificó de verdad;
 * sin rankings, superlativos ni "matriculado" sin dato real.
 */
export const EspecialistaResumen = z
  .object({
    id: Id,
    nombrePublico: Texto(80),
    rubros: z.array(Rubro).min(1),
    verificaciones: z.array(
      z.object({ tipo: z.enum(VERIFICACIONES), verificadoEn: Instante }).strict(),
    ),
    trabajosRealizados: z.int().min(0).nullable(),
  })
  .strict();
export type EspecialistaResumen = z.infer<typeof EspecialistaResumen>;
