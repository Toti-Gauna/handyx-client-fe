// Contenido de Inicio. Las tareas de "Quiero…" son las de la demo de la landing
// (Handy-landing-page-fe/src/content/demo-usuario.json → inicio.tareas): son tareas, no rubros nuevos.
import type { Rubro } from '@/contracts/v1/pedidos';
import type { NombreIcono } from '@/components/trazos';

export interface Tarea {
  readonly id: string;
  readonly texto: string;
  readonly icono: NombreIcono;
  readonly rubro: Rubro;
  /** Precarga "Contanos qué pasó" en el pedido; la persona lo puede cambiar. */
  readonly problema: string;
}

export const TAREAS: readonly Tarea[] = [
  {
    id: 't0',
    texto: 'Cambiar un flexible',
    icono: 'canilla',
    rubro: 'plomeria',
    problema: 'Quiero cambiar el flexible de la pileta del baño: pierde agua.',
  },
  {
    id: 't1',
    texto: 'Service del aire',
    icono: 'aire',
    rubro: 'aire_acondicionado',
    problema: 'Quiero hacerle el service al aire del living: enfría poco.',
  },
  {
    id: 't2',
    texto: 'Cambiar un enchufe',
    icono: 'rayo',
    rubro: 'electricidad',
    problema: 'Quiero cambiar un enchufe de la cocina que está flojo.',
  },
  {
    id: 't3',
    texto: 'Cambiar la cerradura',
    icono: 'llave',
    rubro: 'cerrajeria',
    problema: 'Quiero cambiar la cerradura de la puerta de entrada: se traba y cuesta abrir.',
  },
  {
    id: 't4',
    texto: 'Arreglar humedad',
    icono: 'ladrillos',
    rubro: 'albanileria',
    problema: 'Tengo humedad en la pared del dormitorio y se descascara la pintura.',
  },
  {
    id: 't5',
    texto: 'Revisar el calefón',
    icono: 'llama',
    rubro: 'gas',
    problema: 'Quiero que revisen el calefón: le cuesta prender el piloto.',
  },
];

export const tareaPorId = (id: string | null) => TAREAS.find((t) => t.id === id) ?? null;
