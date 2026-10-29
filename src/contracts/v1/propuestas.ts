// Contrato v1 · propuestas, contrapropuestas y trabajos (acuerdo aceptado).
// Las dos partes proponen; la otra acepta o rechaza. No hay acuerdo hasta aceptar las MISMAS condiciones
// (misma versión). Un acuerdo aceptado no cambia unilateralmente: cambiarlo exige otra propuesta aceptada.
import { z } from 'zod';
import { Actor, Centavos, Id, Importe, Instante, Rol, Texto, Version } from './comunes.ts';
import { ComisionHandy } from './fee.ts';
import { EspecialistaResumen } from './pedidos.ts';

export const ESTADOS_PROPUESTA = [
  'pendiente',
  'aceptada',
  'rechazada',
  'reemplazada',
  'vencida',
  'retirada',
] as const;
export const EstadoPropuesta = z.enum(ESTADOS_PROPUESTA);
export type EstadoPropuesta = z.infer<typeof EstadoPropuesta>;

/** `cotizacion`: antes del trabajo. `cambio_acuerdo` y `adicional`: sobre un trabajo ya contratado. */
export const TIPOS_PROPUESTA = ['cotizacion', 'cambio_acuerdo', 'adicional'] as const;

export const Horario = z.object({ inicio: Instante, fin: Instante.nullable() }).strict();

export const Propuesta = z
  .object({
    id: Id,
    pedidoId: Id,
    trabajoId: Id.nullable(),
    conversacionId: Id,
    tipo: z.enum(TIPOS_PROPUESTA),
    autorRol: Rol,
    especialista: EspecialistaResumen,
    /** Importe total del especialista: es lo que se le paga a él, directo. */
    monto: Importe,
    comisionHandy: ComisionHandy,
    alcance: Texto(1000),
    /** `null` en urgencias "ahora": el horario lo declara el especialista al aceptar el pedido. */
    horario: Horario.nullable(),
    venceEn: Instante,
    estado: EstadoPropuesta,
    reemplazaA: Id.nullable(),
    respondidaEn: Instante.nullable(),
    version: Version,
    creadaEn: Instante,
  })
  .strict();
export type Propuesta = z.infer<typeof Propuesta>;

/** Contrapropuesta del usuario sobre una pendiente. La vigencia la fija el servidor. */
export const ContrapropuestaEntrada = z
  .object({
    reemplazaA: Id,
    versionAnterior: Version,
    montoCentavos: Centavos,
    alcance: Texto(1000),
    horario: Horario.nullable(),
  })
  .strict();
/** El usuario propone cambiar un acuerdo vigente (turno, alcance o monto). Mientras tanto vale el acuerdo actual. */
export const PropuestaCambioEntrada = z
  .object({ montoCentavos: Centavos, alcance: Texto(1000), horario: Horario.nullable() })
  .strict();
/** Aceptar o rechazar: con `Idempotency-Key` y la versión vista (409 `version`/`vencida`/`ya_resuelta`). */
export const RespuestaPropuestaEntrada = z.object({ version: Version }).strict();

export const ESTADOS_TRABAJO = [
  'agendado',
  'en_camino',
  'en_sitio',
  'en_curso',
  'terminado_por_especialista',
  'finalizado',
  'cancelado',
] as const;
export const EstadoTrabajo = z.enum(ESTADOS_TRABAJO);
export type EstadoTrabajo = z.infer<typeof EstadoTrabajo>;

export const ESTADOS_ETAPA = [
  'pendiente',
  'en_curso',
  'terminada_por_especialista',
  'confirmada',
] as const;
export const Etapa = z
  .object({
    id: Id,
    orden: z.int().min(1),
    titulo: Texto(120),
    monto: Importe,
    estado: z.enum(ESTADOS_ETAPA),
    version: Version,
  })
  .strict();

/** Copia inmutable de lo aceptado: si la propuesta original cambiara, el acuerdo no. */
export const Acuerdo = z
  .object({
    propuestaId: Id,
    monto: Importe,
    comisionHandy: ComisionHandy,
    alcance: Texto(1000),
    horario: Horario.nullable(),
    aceptadoEn: Instante,
  })
  .strict();

export const Trabajo = z
  .object({
    id: Id,
    pedidoId: Id,
    conversacionId: Id,
    especialista: EspecialistaResumen,
    acuerdo: Acuerdo,
    historialAcuerdos: z.array(Acuerdo),
    estado: EstadoTrabajo,
    etapas: z.array(Etapa),
    version: Version,
    creadoEn: Instante,
    actualizadoEn: Instante,
  })
  .strict();
export type Trabajo = z.infer<typeof Trabajo>;

export const EventoTrabajo = z
  .object({
    id: Id,
    de: EstadoTrabajo.nullable(),
    a: EstadoTrabajo,
    actor: Actor,
    ocurridoEn: Instante,
  })
  .strict();

export const ConfirmacionEntrada = z.object({ version: Version }).strict();
export const CancelacionTrabajoEntrada = z
  .object({ version: Version, motivo: z.enum(['cambio_de_planes', 'no_se_presento', 'otro']) })
  .strict();
