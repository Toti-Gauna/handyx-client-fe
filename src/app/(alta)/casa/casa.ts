// Reglas de «Armá tu casa» (alta, opcional): qué ambientes y equipos crear sin duplicar lo que ya está cargado.
import type { NombreIcono } from '@/components/trazos';
import type { Ambiente, Hogar, TIPOS_EQUIPO } from '@/contracts/v1/hogar';

export type TipoEquipo = (typeof TIPOS_EQUIPO)[number];

export const VIVIENDAS = [
  { valor: 'casa', texto: 'Casa' },
  { valor: 'departamento', texto: 'Depto' },
  { valor: 'ph', texto: 'PH' },
] as const;

export const AMBIENTES_ALTA = [
  { tipo: 'bano', texto: 'Baños', uno: 'Baño', icono: 'ducha', inicial: 1 },
  { tipo: 'cocina', texto: 'Cocina', uno: 'Cocina', icono: 'cocina', inicial: 1 },
  { tipo: 'living', texto: 'Living', uno: 'Living', icono: 'sofa', inicial: 1 },
  { tipo: 'dormitorio', texto: 'Dormitorios', uno: 'Dormitorio', icono: 'cama', inicial: 1 },
  { tipo: 'lavadero', texto: 'Lavadero', uno: 'Lavadero', icono: 'lavarropas', inicial: 0 },
  { tipo: 'patio', texto: 'Patio o terraza', uno: 'Patio o terraza', icono: 'casa', inicial: 0 },
] as const satisfies readonly {
  tipo: Ambiente['tipo'];
  texto: string;
  uno: string;
  icono: NombreIcono;
  inicial: number;
}[];

export type TipoAlta = (typeof AMBIENTES_ALTA)[number]['tipo'];
export type Cuentas = Record<TipoAlta, number>;

export const cuantos = (h: Hogar, tipo: Ambiente['tipo']) =>
  h.ambientes.filter((a) => a.tipo === tipo).length;

/** Si la casa ya tiene ambientes, se parte de lo cargado; si no, de una casa típica (1 de cada uno). */
export function cuentasIniciales(h: Hogar): Cuentas {
  const vacia = h.ambientes.length === 0;
  return Object.fromEntries(
    AMBIENTES_ALTA.map((a) => [a.tipo, vacia ? a.inicial : cuantos(h, a.tipo)]),
  ) as Cuentas;
}

/** Ambientes nuevos para llegar a las cantidades elegidas («Dormitorio 2» si hay más de uno). Nunca borra. */
export function ambientesPorCrear(
  h: Hogar,
  cuentas: Cuentas,
): { tipo: TipoAlta; nombre: string }[] {
  return AMBIENTES_ALTA.flatMap((a) => {
    const total = cuentas[a.tipo];
    return Array.from({ length: Math.max(0, total - cuantos(h, a.tipo)) }, (_, k) => {
      const n = cuantos(h, a.tipo) + k + 1;
      return { tipo: a.tipo, nombre: total > 1 ? `${a.uno} ${n}` : a.uno };
    });
  });
}

export interface GrupoEquipos {
  readonly titulo: string;
  /** Dónde se guardan: el primer ambiente de estos tipos, en orden. */
  readonly ambientes: readonly Ambiente['tipo'][];
  readonly equipos: readonly { tipo: TipoEquipo; texto: string; icono: NombreIcono }[];
}

export const GRUPOS_EQUIPOS: readonly GrupoEquipos[] = [
  {
    titulo: 'Cocina',
    ambientes: ['cocina'],
    equipos: [
      { tipo: 'calefon', texto: 'Calefón', icono: 'llama' },
      { tipo: 'anafe', texto: 'Anafe a gas', icono: 'llama' },
      { tipo: 'horno', texto: 'Horno', icono: 'caja' },
    ],
  },
  {
    titulo: 'Baño',
    ambientes: ['bano'],
    equipos: [
      { tipo: 'canilla', texto: 'Canillas', icono: 'canilla' },
      { tipo: 'ducha', texto: 'Ducha', icono: 'ducha' },
      { tipo: 'inodoro', texto: 'Inodoro', icono: 'caja' },
    ],
  },
  {
    titulo: 'Toda la casa',
    ambientes: ['lavadero', 'living', 'cocina', 'patio', 'dormitorio', 'bano', 'otro'],
    equipos: [
      { tipo: 'tablero_electrico', texto: 'Tablero eléctrico', icono: 'rayo' },
      { tipo: 'aire_acondicionado', texto: 'Aire acondicionado', icono: 'aire' },
      { tipo: 'termotanque', texto: 'Termotanque', icono: 'termometro' },
      { tipo: 'cerradura', texto: 'Cerraduras', icono: 'llave' },
    ],
  },
];

export function ambienteDeGrupo(h: Hogar, g: GrupoEquipos): Ambiente | null {
  for (const tipo of g.ambientes) {
    const a = h.ambientes.find((x) => x.tipo === tipo);
    if (a) return a;
  }
  return null;
}

/** Equipos elegidos que todavía no están cargados (mismo tipo = ya está), cada uno en el ambiente de su grupo. */
export function equiposPorCrear(h: Hogar, elegidos: ReadonlySet<TipoEquipo>) {
  const ya = new Set(h.equipos.map((e) => e.tipo));
  return GRUPOS_EQUIPOS.flatMap((g) => {
    const ambiente = ambienteDeGrupo(h, g);
    if (!ambiente) return [];
    return g.equipos
      .filter((e) => elegidos.has(e.tipo) && !ya.has(e.tipo))
      .map((e) => ({ ambienteId: ambiente.id, tipo: e.tipo, nombre: e.texto }));
  });
}
