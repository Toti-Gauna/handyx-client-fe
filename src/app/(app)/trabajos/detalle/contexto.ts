// Lo que reciben las vistas del trabajo (seguimiento y cierre): ya cargado y con las acciones resueltas.
import type { Pedido } from '@/contracts/v1/pedidos';
import type { EventoTrabajo, Propuesta, Trabajo } from '@/contracts/v1/propuestas';
import type { RegistroPago } from '@/contracts/v1/servicio';
import type { ErrorCliente } from '@/data/cliente';
import type { z } from 'zod';

export interface ContextoTrabajo {
  readonly t: Trabajo;
  readonly esp: string;
  readonly pedido: Pedido | null;
  readonly propuestas: readonly Propuesta[];
  readonly pagos: readonly RegistroPago[];
  readonly eventos: readonly z.output<typeof EventoTrabajo>[] | null;
  /** Adicional que el especialista pidió y todavía no respondiste. */
  readonly adicionalPendiente: Propuesta | null;
  /** Cambio de turno o condiciones pendiente (tuyo o del especialista). */
  readonly cambioPendiente: Propuesta | null;
  readonly pendiente: boolean;
  readonly error: ErrorCliente | null;
  readonly limpiarError: () => void;
  readonly abrirCancelar: () => void;
  readonly recargar: () => void;
}
