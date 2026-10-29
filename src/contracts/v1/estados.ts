// Contrato v1 · máquinas de estado y parámetros de tiempo.
// El servidor es el único que aplica transiciones y vencimientos; el cliente usa estas tablas para saber qué
// acciones mostrar. Detalle con actores y eventos: docs/state-machines.md.
import { ESTADOS_BAJA } from './cuenta.ts';
import { ESTADOS_PEDIDO } from './pedidos.ts';
import { ESTADOS_ETAPA, ESTADOS_PROPUESTA, ESTADOS_TRABAJO } from './propuestas.ts';
import { ESTADOS_PAGO, ESTADOS_RECLAMO } from './servicio.ts';

type Tabla<E extends string> = Readonly<Record<E, readonly E[]>>;

export const TRANSICIONES = {
  pedido: {
    buscando: ['con_propuestas', 'sin_respuesta', 'cancelado', 'vencido'],
    con_propuestas: ['contratado', 'sin_respuesta', 'cancelado', 'vencido'],
    sin_respuesta: ['buscando', 'busqueda_manual', 'cancelado', 'vencido'],
    busqueda_manual: ['con_propuestas', 'cancelado', 'vencido'],
    contratado: [],
    cancelado: [],
    vencido: [],
  } satisfies Tabla<(typeof ESTADOS_PEDIDO)[number]>,
  propuesta: {
    pendiente: ['aceptada', 'rechazada', 'reemplazada', 'vencida', 'retirada'],
    aceptada: [],
    rechazada: [],
    reemplazada: [],
    vencida: [],
    retirada: [],
  } satisfies Tabla<(typeof ESTADOS_PROPUESTA)[number]>,
  trabajo: {
    agendado: ['en_camino', 'en_sitio', 'cancelado'],
    en_camino: ['en_sitio', 'cancelado'],
    en_sitio: ['en_curso', 'cancelado'],
    en_curso: ['terminado_por_especialista'],
    terminado_por_especialista: ['finalizado', 'en_curso'],
    finalizado: [],
    cancelado: [],
  } satisfies Tabla<(typeof ESTADOS_TRABAJO)[number]>,
  etapa: {
    pendiente: ['en_curso'],
    en_curso: ['terminada_por_especialista'],
    terminada_por_especialista: ['confirmada', 'en_curso'],
    confirmada: [],
  } satisfies Tabla<(typeof ESTADOS_ETAPA)[number]>,
  pago: {
    pendiente: ['reportado', 'verificado', 'fallido', 'cancelado'],
    reportado: ['verificado', 'fallido', 'cancelado'],
    fallido: ['pendiente', 'cancelado'],
    verificado: [],
    cancelado: [],
  } satisfies Tabla<(typeof ESTADOS_PAGO)[number]>,
  reclamo: {
    abierto: ['en_revision', 'cerrado'],
    en_revision: ['esperando_usuario', 'resuelto'],
    esperando_usuario: ['en_revision', 'cerrado'],
    resuelto: ['cerrado', 'en_revision'],
    cerrado: [],
  } satisfies Tabla<(typeof ESTADOS_RECLAMO)[number]>,
  baja: {
    recibida: ['en_proceso', 'cancelada'],
    en_proceso: ['completada', 'completada_con_retencion'],
    completada: [],
    completada_con_retencion: [],
    cancelada: [],
  } satisfies Tabla<(typeof ESTADOS_BAJA)[number]>,
} as const;

export type Maquina = keyof typeof TRANSICIONES;

export function puedeTransicionar<M extends Maquina>(
  maquina: M,
  de: keyof (typeof TRANSICIONES)[M],
  a: keyof (typeof TRANSICIONES)[M],
): boolean {
  const destinos = TRANSICIONES[maquina][de] as readonly unknown[];
  return destinos.includes(a);
}

export const esFinal = <M extends Maquina>(
  maquina: M,
  estado: keyof (typeof TRANSICIONES)[M],
): boolean => (TRANSICIONES[maquina][estado] as readonly unknown[]).length === 0;

/**
 * Tiempos de PROD-03/18. Los calcula y aplica el servidor; el cliente solo los usa para explicar.
 * La ventana de búsqueda urgente (20 min) y la vigencia de una propuesta urgente (5 min) son cosas distintas.
 */
export const PARAMETROS = {
  busquedaUrgenteMinutos: 20,
  propuestaUrgenteMinutos: 5,
  programadoSinPropuestasHoras: 12,
  /** Supuesto a confirmar: relanzamientos de búsqueda permitidos antes de pasar a búsqueda manual. */
  maxIntentosBusqueda: 3,
} as const;
