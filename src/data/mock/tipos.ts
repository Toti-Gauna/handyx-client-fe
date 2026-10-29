// Tipos del "servidor" simulado, derivados del contrato v1 (nunca se redefinen formas a mano).
import type { z } from 'zod';
import type {
  Acuerdo,
  Aceptacion,
  Conversacion,
  EstadoCuenta,
  EventoTrabajo,
  MediaRef,
  Notificacion,
  PerfilParcial,
  PoliticaFee,
  Propuesta,
  Reclamo,
  Pedido,
  Trabajo,
  Mensaje,
  RegistroPago,
  EspecialistaResumen,
  Etapa,
} from '../../contracts/v1/index.ts';

export type Conv = z.output<typeof Conversacion>;
export type Evento = z.output<typeof EventoTrabajo>;
export type Media = z.output<typeof MediaRef>;
export type Notif = z.output<typeof Notificacion>;
export type ReclamoT = z.output<typeof Reclamo>;
export type PerfilP = z.output<typeof PerfilParcial>;
export type AceptacionT = z.output<typeof Aceptacion>;
export type AcuerdoT = z.output<typeof Acuerdo>;
export type EtapaT = z.output<typeof Etapa>;
export type EstadoCuentaT = z.output<typeof EstadoCuenta>;
export type { PoliticaFee, Propuesta, Pedido, Trabajo, Mensaje, RegistroPago, EspecialistaResumen };

export interface Cuenta {
  readonly id: string;
  readonly email: string;
  readonly contrasena: string;
}

export interface MediaGuardada {
  readonly ref: Media;
  readonly tipo: string;
  readonly bytes: number;
}

export interface Banderas {
  /** Ningún especialista responde a los pedidos nuevos (escenarios sin oferta). */
  sinOfertas: boolean;
  fallarProximoMensaje: boolean;
  fallarProximaFoto: boolean;
  /** La sesión vence tras esta cantidad de llamadas con sesión (null = no vence). */
  vencerEnLlamadas: number | null;
  /** La primera aceptación del usuario pierde la carrera contra "otro dispositivo". */
  carreraAceptacion: boolean;
  /** Ruta de Mercado Pago aprobada: sin esto el checkout responde `funcion_inactiva`. */
  checkoutActivo: boolean;
}

export interface Mundo {
  escenario: string;
  baseMs: number;
  t0: number;
  offsetMs: number;
  congelado: boolean;
  contenido: 'vacio' | 'base' | 'escenario';
  cuentas: Cuenta[];
  cuentaId: string | null;
  intentosFallidos: number;
  invitaciones: Set<string>;
  csrf: string;
  estadoCuenta: EstadoCuentaT;
  perfil: PerfilP;
  perfilVersion: number;
  aceptaciones: AceptacionT[];
  politica: PoliticaFee;
  feeAceptada: { politicaId: string; version: string; aceptadaEn: string } | null;
  cobertura: string[];
  especialistas: EspecialistaResumen[];
  pedidos: Pedido[];
  ofertas: Record<string, { listaEn: number; sinOfertas: boolean; generadas: boolean }>;
  propuestas: Propuesta[];
  respuestaEn: Record<string, number>;
  /** Respuestas automáticas del especialista en el chat (conversación → instante). */
  respuestaChat: Record<string, number>;
  trabajos: Trabajo[];
  eventos: Record<string, Evento[]>;
  conversaciones: Conv[];
  mensajes: Mensaje[];
  pagos: RegistroPago[];
  reclamos: ReclamoT[];
  notificaciones: Notif[];
  baja: { id: string; creadaEn: number } | null;
  push: { preferencia: boolean; suscripto: boolean };
  idem: Map<string, unknown>;
  media: Map<string, MediaGuardada>;
  flags: Banderas;
  llamadasConSesion: number;
  /** La sesión venció y todavía no se reingresó: todo responde `sesion_vencida` (no `no_autenticado`). */
  sesionVencida: boolean;
  contador: number;
}
