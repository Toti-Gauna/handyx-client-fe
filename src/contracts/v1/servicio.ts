// Contrato v1 · chat, pagos directos, reclamos y notificaciones.
import { z } from 'zod';
import { Actor, Centavos, Id, Importe, Instante, Rol, Texto, Version } from './comunes.ts';
import { EspecialistaResumen, MediaRef } from './pedidos.ts';

// ── Chat: ligado al pedido desde la primera cotización y al trabajo después ──────────────────────────
export const Conversacion = z
  .object({
    id: Id,
    pedidoId: Id,
    trabajoId: Id.nullable(),
    especialista: EspecialistaResumen,
    ultimoMensajeEn: Instante.nullable(),
    noLeidos: z.int().min(0),
  })
  .strict();

/** `clienteId` lo genera el celular (UUIDv4): reintentar el mismo mensaje no lo duplica. */
export const Mensaje = z
  .object({
    id: Id,
    conversacionId: Id,
    clienteId: Id.nullable(),
    autor: z.enum(['usuario', 'especialista', 'sistema']),
    tipo: z.enum(['texto', 'foto', 'evento']),
    texto: Texto(2000).nullable(),
    media: MediaRef.nullable(),
    creadoEn: Instante,
    leidoEn: Instante.nullable(),
  })
  .strict();
export type Mensaje = z.infer<typeof Mensaje>;

export const MensajeEntrada = z.discriminatedUnion('tipo', [
  z.object({ clienteId: Id, tipo: z.literal('texto'), texto: Texto(2000) }).strict(),
  z.object({ clienteId: Id, tipo: z.literal('foto'), mediaId: Id }).strict(),
]);

// ── Pagos: directos del usuario al especialista. Handy no recibe ni distribuye ese dinero ────────────
export const METODOS_PAGO = ['mercado_pago_directo', 'efectivo'] as const;
export const ESTADOS_PAGO = [
  'pendiente',
  'reportado',
  'verificado',
  'fallido',
  'cancelado',
] as const;
export const EstadoPago = z.enum(ESTADOS_PAGO);
/** Un reporte manual no equivale a una confirmación del proveedor ni a dinero cobrado por Handy. */
export const FUENTES_PAGO = [
  'reporte_usuario',
  'reporte_especialista',
  'proveedor',
  'operaciones',
] as const;

export const RegistroPago = z
  .object({
    id: Id,
    trabajoId: Id,
    etapaId: Id.nullable(),
    metodo: z.enum(METODOS_PAGO),
    monto: Importe,
    estado: EstadoPago,
    fuente: z.enum(FUENTES_PAGO).nullable(),
    reportadoEn: Instante.nullable(),
    verificadoEn: Instante.nullable(),
    version: Version,
  })
  .strict();
export type RegistroPago = z.infer<typeof RegistroPago>;

export const ReportePagoEntrada = z
  .object({ metodo: z.enum(METODOS_PAGO), montoCentavos: Centavos, etapaId: Id.nullable() })
  .strict();

// ── Reclamos ──────────────────────────────────────────────────────────────────────────────────────────
export const CATEGORIAS_RECLAMO = [
  'no_se_presento',
  'trabajo_incompleto',
  'calidad',
  'precio_distinto',
  'danio',
  'pago',
  'conducta',
  'otro',
] as const;
export const ESTADOS_RECLAMO = [
  'abierto',
  'en_revision',
  'esperando_usuario',
  'resuelto',
  'cerrado',
] as const;
export const EstadoReclamo = z.enum(ESTADOS_RECLAMO);

export const ReclamoEntrada = z
  .object({
    pedidoId: Id,
    trabajoId: Id.nullable(),
    categoria: z.enum(CATEGORIAS_RECLAMO),
    detalle: Texto(2000),
    adjuntos: z.array(Id).max(5),
  })
  .strict();

/** Sin plazos comerciales de respuesta inventados. */
export const Reclamo = z
  .object({
    id: Id,
    pedidoId: Id,
    trabajoId: Id.nullable(),
    categoria: z.enum(CATEGORIAS_RECLAMO),
    detalle: Texto(2000),
    adjuntos: z.array(MediaRef).max(5),
    estado: EstadoReclamo,
    historial: z.array(
      z
        .object({
          de: EstadoReclamo.nullable(),
          a: EstadoReclamo,
          actor: Actor,
          ocurridoEn: Instante,
        })
        .strict(),
    ),
    version: Version,
    creadoEn: Instante,
    actualizadoEn: Instante,
  })
  .strict();

export const RespuestaReclamoEntrada = z
  .object({ version: Version, detalle: Texto(2000), adjuntos: z.array(Id).max(5) })
  .strict();

// ── Notificaciones in-app (el push es opcional y nunca lleva datos personales) ───────────────────────
export const TIPOS_NOTIFICACION = [
  'propuesta_recibida',
  'propuesta_vencida',
  'propuesta_aceptada',
  'propuesta_rechazada',
  'busqueda_sin_respuesta',
  'busqueda_manual_iniciada',
  'mensaje_nuevo',
  'trabajo_en_camino',
  'trabajo_llego',
  'trabajo_terminado',
  'pago_verificado',
  'reclamo_actualizado',
  'baja_actualizada',
] as const;
export const Notificacion = z
  .object({
    id: Id,
    tipo: z.enum(TIPOS_NOTIFICACION),
    entidad: z
      .object({
        tipo: z.enum([
          'pedido',
          'propuesta',
          'trabajo',
          'conversacion',
          'reclamo',
          'pago',
          'cuenta',
        ]),
        id: Id,
      })
      .strict(),
    creadaEn: Instante,
    leidaEn: Instante.nullable(),
  })
  .strict();

export const PushSuscripcionEntrada = z
  .object({
    endpoint: z.url({ protocol: /^https$/ }).max(2048),
    claves: z.object({ p256dh: z.string().max(256), auth: z.string().max(64) }).strict(),
    rol: Rol,
  })
  .strict();
