// Contrato v1 · viaje en vivo del trabajo (lote 5.5 del bloque 4, decisión de Ignacio del 31/10/2026): mientras el
// especialista viene en camino, el usuario ve su posición exacta, el trayecto y la llegada estimada. Mismo formato que
// el contrato del especialista (`Viaje` 0.4.0), para que las dos partes vean lo mismo. Solo las partes del trabajo y solo
// durante el viaje; el servidor deja de compartir al llegar, empezar, terminar o cancelar. Retención: 30 días.
import { z } from 'zod';
import { Id, Instante } from './comunes.ts';

export const Punto = z
  .object({ lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180) })
  .strict();

export const PosicionViaje = z
  .object({
    punto: Punto,
    /** Radio de incertidumbre que informó el GPS del especialista, en metros. */
    precisionM: z.number().min(0).max(10_000),
    en: Instante,
  })
  .strict();

export const Trayecto = z
  .object({
    /** Recorrido por las calles, del origen al destino. */
    linea: z.array(Punto).min(2).max(5000),
    distanciaM: z.int().nonnegative(),
    duracionS: z.int().nonnegative(),
    /** Sube cada vez que el servidor lo recalcula (por ejemplo, después de un desvío). */
    version: z.int().nonnegative(),
  })
  .strict();

export const ESTADOS_VIAJE = ['sin_compartir', 'compartiendo', 'terminado'] as const;
export const EstadoViaje = z.enum(ESTADOS_VIAJE);

export const Viaje = z
  .object({
    trabajoId: Id,
    destino: Punto,
    estado: EstadoViaje,
    /** Null si todavía no hay posición o si el motor de trayectos no pudo calcularlo. */
    trayecto: Trayecto.nullable(),
    ultimaPosicion: PosicionViaje.nullable(),
    /** Lo que falta por el trayecto (o en línea recta si no hay trayecto). */
    distanciaRestanteM: z.int().nonnegative().nullable(),
    llegadaEstimada: Instante.nullable(),
  })
  .strict();
export type Viaje = z.infer<typeof Viaje>;

/**
 * Transmisión en vivo (Server-Sent Events). Cada mensaje es `event: viaje` con un `Viaje` completo en `data` (no hay
 * deltas: el último manda). Al terminar el viaje llega uno con `estado: terminado` y el servidor cierra. Un comentario
 * cada `latidoS` mantiene viva la conexión; si se corta, el navegador reintenta a los `reintentoMs`.
 */
export const SSE_VIAJE = {
  evento: 'viaje',
  reintentoMs: 5000,
  latidoS: 25,
  /** Conexiones abiertas por cuenta (pestañas o dispositivos). La siguiente recibe 429 `limite`. */
  maxPorCuenta: 3,
} as const;
