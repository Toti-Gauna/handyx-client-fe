// Textos y señales de estado de la interfaz. Nunca solo color: cada estado lleva texto (y ícono en la pastilla).
import type { Pedido, Rubro } from '@/contracts/v1/pedidos';
import type { Propuesta, Trabajo } from '@/contracts/v1/propuestas';
import type { RegistroPago } from '@/contracts/v1/servicio';
import type { NombreIcono } from '@/components/trazos';

export type Tono = 'azul' | 'gris' | 'ok' | 'error' | 'alerta';
export interface Etiqueta {
  readonly texto: string;
  readonly tono: Tono;
  readonly icono?: NombreIcono;
}

/** Rubros aprobados (mismos ids que la landing). */
export const RUBROS_INFO: Record<
  Rubro,
  { nombre: string; corto: string; icono: NombreIcono; ejemplo: string }
> = {
  electricidad: {
    nombre: 'Electricidad',
    corto: 'Electricidad',
    icono: 'rayo',
    ejemplo: 'Enchufes, térmicas, cortes de luz',
  },
  plomeria: {
    nombre: 'Plomería',
    corto: 'Plomería',
    icono: 'canilla',
    ejemplo: 'Pérdidas, canillas, desagües',
  },
  gas: { nombre: 'Gas', corto: 'Gas', icono: 'llama', ejemplo: 'Calefones, estufas, cocinas' },
  cerrajeria: {
    nombre: 'Cerrajería',
    corto: 'Cerrajería',
    icono: 'llave',
    ejemplo: 'Cerraduras, llaves, aperturas',
  },
  albanileria: {
    nombre: 'Albañilería',
    corto: 'Albañilería',
    icono: 'ladrillos',
    ejemplo: 'Humedad, revoques, arreglos',
  },
  aire_acondicionado: {
    nombre: 'Aire acondicionado',
    corto: 'Aire acond.',
    icono: 'aire',
    ejemplo: 'Instalación, limpieza, service',
  },
};

export const TIPOS_INFO: Record<Pedido['tipo'], { nombre: string; texto: string }> = {
  urgente: {
    nombre: 'Urgente',
    texto: 'Lo necesito lo antes posible. El especialista declara su horario.',
  },
  programado: { nombre: 'Programado', texto: 'Elijo el día y la hora que me convienen.' },
  obra: { nombre: 'Obra', texto: 'Un trabajo grande, que se hace y se paga por etapas.' },
};

export function etiquetaPedido(p: Pick<Pedido, 'estado'>): Etiqueta {
  switch (p.estado) {
    case 'buscando':
      return { texto: 'Buscando', tono: 'azul', icono: 'lupa' };
    case 'con_propuestas':
      return { texto: 'Con propuestas', tono: 'ok', icono: 'chat' };
    case 'sin_respuesta':
      return { texto: 'Sin respuesta', tono: 'alerta', icono: 'alerta' };
    case 'busqueda_manual':
      return { texto: 'Búsqueda manual', tono: 'azul', icono: 'maletin' };
    case 'contratado':
      return { texto: 'Contratado', tono: 'ok', icono: 'checkCirculo' };
    case 'cancelado':
      return { texto: 'Cancelado', tono: 'gris', icono: 'prohibido' };
    case 'vencido':
      return { texto: 'Vencido', tono: 'gris', icono: 'reloj' };
  }
}

export function etiquetaPropuesta(p: Pick<Propuesta, 'estado'>): Etiqueta {
  switch (p.estado) {
    case 'pendiente':
      return { texto: 'Pendiente', tono: 'azul', icono: 'reloj' };
    case 'aceptada':
      return { texto: 'Aceptada', tono: 'ok', icono: 'checkCirculo' };
    case 'rechazada':
      return { texto: 'Rechazada', tono: 'gris', icono: 'cerrar' };
    case 'reemplazada':
      return { texto: 'Reemplazada', tono: 'gris', icono: 'reintentar' };
    case 'vencida':
      return { texto: 'Vencida', tono: 'gris', icono: 'reloj' };
    case 'retirada':
      return { texto: 'Retirada', tono: 'gris', icono: 'prohibido' };
  }
}

export function etiquetaTrabajo(t: Pick<Trabajo, 'estado'>): Etiqueta {
  switch (t.estado) {
    case 'agendado':
      return { texto: 'Agendado', tono: 'azul', icono: 'calendario' };
    case 'en_camino':
      return { texto: 'En camino', tono: 'azul', icono: 'caminar' };
    case 'en_sitio':
      return { texto: 'El especialista llegó', tono: 'ok', icono: 'pin' };
    case 'en_curso':
      return { texto: 'En curso', tono: 'azul', icono: 'engranaje' };
    case 'terminado_por_especialista':
      return { texto: 'Falta tu confirmación', tono: 'alerta', icono: 'alerta' };
    case 'finalizado':
      return { texto: 'Finalizado', tono: 'ok', icono: 'checkCirculo' };
    case 'cancelado':
      return { texto: 'Cancelado', tono: 'gris', icono: 'prohibido' };
  }
}

export function etiquetaPago(p: Pick<RegistroPago, 'estado'>): Etiqueta {
  switch (p.estado) {
    case 'pendiente':
      return { texto: 'Pendiente', tono: 'alerta', icono: 'reloj' };
    case 'reportado':
      return { texto: 'Reportado (sin verificar)', tono: 'alerta', icono: 'info' };
    case 'verificado':
      return { texto: 'Verificado', tono: 'ok', icono: 'verificado' };
    case 'fallido':
      return { texto: 'Falló', tono: 'error', icono: 'alerta' };
    case 'cancelado':
      return { texto: 'Cancelado', tono: 'gris', icono: 'prohibido' };
  }
}

export const VERIFICACION_TEXTO: Record<string, string> = {
  identidad: 'Identidad verificada',
  antecedentes: 'Antecedentes verificados en persona',
  matricula: 'Matrícula verificada',
};

export const CATEGORIAS_RECLAMO: Record<string, string> = {
  no_se_presento: 'El especialista no se presentó',
  trabajo_incompleto: 'El trabajo quedó incompleto',
  calidad: 'Problema de calidad',
  precio_distinto: 'El precio no fue el acordado',
  danio: 'Daños en mi casa',
  pago: 'Problema con un pago',
  conducta: 'Trato o conducta',
  otro: 'Otro motivo',
};

export const ESTADOS_RECLAMO_TEXTO: Record<string, Etiqueta> = {
  abierto: { texto: 'Abierto', tono: 'azul', icono: 'info' },
  en_revision: { texto: 'En revisión', tono: 'azul', icono: 'lupa' },
  esperando_usuario: { texto: 'Necesitamos tu respuesta', tono: 'alerta', icono: 'alerta' },
  resuelto: { texto: 'Resuelto', tono: 'ok', icono: 'checkCirculo' },
  cerrado: { texto: 'Cerrado', tono: 'gris', icono: 'prohibido' },
};

export const ACTOR_TEXTO: Record<string, string> = {
  usuario: 'Vos',
  especialista: 'El especialista',
  operaciones: 'Handy',
  sistema: 'Sistema',
};
