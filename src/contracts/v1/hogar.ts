// Contrato v1 · Mi hogar: la ficha privada de la casa (ambientes y equipos), lo que se comparte por pedido y los
// recordatorios de mantenimiento. Nada se comparte sin que la persona lo elija; cada compartido se puede revocar y
// vence solo cuando termina el pedido.
import { z } from 'zod';
import { FechaLocal, Id, Instante, Texto, Version } from './comunes.ts';
import { MediaRef } from './pedidos.ts';

export const TIPOS_VIVIENDA = ['casa', 'departamento', 'ph'] as const;
export const TipoVivienda = z.enum(TIPOS_VIVIENDA);

export const TIPOS_AMBIENTE = [
  'bano',
  'cocina',
  'living',
  'dormitorio',
  'lavadero',
  'patio',
  'otro',
] as const;
export const TipoAmbiente = z.enum(TIPOS_AMBIENTE);

export const TIPOS_EQUIPO = [
  'calefon',
  'termotanque',
  'anafe',
  'horno',
  'aire_acondicionado',
  'tablero_electrico',
  'canilla',
  'inodoro',
  'ducha',
  'cerradura',
  'otro',
] as const;
export const TipoEquipo = z.enum(TIPOS_EQUIPO);

/** Medidas aproximadas en centímetros (medidas con la cámara o a mano). */
export const Medidas = z
  .object({
    anchoCm: z.int().min(1).max(10000),
    largoCm: z.int().min(1).max(10000),
    altoCm: z.int().min(1).max(2000).nullable(),
  })
  .strict();

export const Ambiente = z
  .object({
    id: Id,
    tipo: TipoAmbiente,
    nombre: Texto(60),
    medidas: Medidas.nullable(),
    materiales: Texto(300).nullable(),
    notas: Texto(500).nullable(),
    fotos: z.array(MediaRef).max(8),
    /** 0 a 100: cuánto de la ficha está completo (fotos, medidas, materiales, equipos). Lo calcula el servidor. */
    completitud: z.int().min(0).max(100),
    version: Version,
  })
  .strict();
export type Ambiente = z.infer<typeof Ambiente>;

export const Equipo = z
  .object({
    id: Id,
    ambienteId: Id,
    tipo: TipoEquipo,
    nombre: Texto(60),
    marca: Texto(60).nullable(),
    modelo: Texto(60).nullable(),
    instaladoEn: FechaLocal.nullable(),
    ultimoMantenimiento: FechaLocal.nullable(),
    garantiaHasta: FechaLocal.nullable(),
    etiqueta: MediaRef.nullable(),
    version: Version,
  })
  .strict();
export type Equipo = z.infer<typeof Equipo>;

export const Hogar = z
  .object({
    vivienda: TipoVivienda.nullable(),
    ambientes: z.array(Ambiente).max(30),
    equipos: z.array(Equipo).max(100),
    completitud: z.int().min(0).max(100),
    version: Version,
  })
  .strict();
export type Hogar = z.infer<typeof Hogar>;

export const HogarEntrada = z.object({ vivienda: TipoVivienda, version: Version }).strict();
export const AmbienteEntrada = z
  .object({
    tipo: TipoAmbiente,
    nombre: Texto(60),
    medidas: Medidas.nullable().optional(),
    materiales: Texto(300).nullable().optional(),
    notas: Texto(500).nullable().optional(),
    fotoIds: z.array(Id).max(8).optional(),
  })
  .strict();
export const AmbienteEdicion = AmbienteEntrada.partial().extend({ version: Version }).strict();
export const EquipoEntrada = z
  .object({
    ambienteId: Id,
    tipo: TipoEquipo,
    nombre: Texto(60),
    marca: Texto(60).nullable().optional(),
    modelo: Texto(60).nullable().optional(),
    instaladoEn: FechaLocal.nullable().optional(),
    etiquetaId: Id.nullable().optional(),
  })
  .strict();
export const EquipoEdicion = EquipoEntrada.partial().extend({ version: Version }).strict();

/** Qué parte de la ficha se comparte con los especialistas de un pedido. La dirección exacta nunca va acá. */
export const ItemCompartido = z
  .object({
    tipo: z.enum(['ambiente_fotos', 'ambiente_medidas', 'equipo', 'informe']),
    refId: Id,
  })
  .strict();
export const Compartido = z
  .object({
    id: Id,
    pedidoId: Id,
    items: z.array(ItemCompartido).min(1).max(20),
    estado: z.enum(['activo', 'revocado', 'vencido']),
    creadoEn: Instante,
    /** Vence cuando el pedido termina o se cancela; antes, si la persona lo revoca. */
    finalizadoEn: Instante.nullable(),
  })
  .strict();
export type Compartido = z.infer<typeof Compartido>;
export const CompartirEntrada = z
  .object({ items: z.array(ItemCompartido).min(1).max(20) })
  .strict();

export const Recordatorio = z
  .object({
    id: Id,
    titulo: Texto(80),
    equipoId: Id.nullable(),
    fecha: FechaLocal,
    cadaMeses: z.int().min(1).max(60).nullable(),
    activo: z.boolean(),
    origen: z.enum(['informe', 'sugerido', 'usuario']),
    /** Nada se pide solo: el recordatorio avisa y la persona decide. */
    hechoEn: FechaLocal.nullable(),
  })
  .strict();
export type Recordatorio = z.infer<typeof Recordatorio>;
export const RecordatorioEntrada = z
  .object({
    titulo: Texto(80),
    equipoId: Id.nullable(),
    fecha: FechaLocal,
    cadaMeses: z.int().min(1).max(60).nullable(),
  })
  .strict();
export const RecordatorioEdicion = z
  .object({ activo: z.boolean().optional(), hecho: z.boolean().optional() })
  .strict();
