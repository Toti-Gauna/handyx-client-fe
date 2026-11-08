// Comparar propuestas lado a lado (Fase 7 · C-Comparar). Un promedio con reglas fijas y públicas, igual para todas:
// no es una recomendación de Handyx ni un ranking de personas, y la decisión es siempre de quien pide.
//
// Pesos (suman 100): precio 30 · reseñas 25 · verificaciones 20 · garantía 15 · fecha 10.
// Cada factor vale entre 0 y 1:
//   precio          el total más bajo / este total (la más económica vale 1).
//   reseñas         promedio / 5. Sin reseñas, 0,5 (neutro). Si ninguna tiene reseñas, el factor no cuenta.
//   verificaciones  verificaciones reales del backend, hasta 2 (identidad y antecedentes) = 1.
//   garantía        días de garantía hasta 180 (180 o más = 1; sin garantía = 0).
//   fecha           la que antes puede ir vale 1; 0,1 menos por cada día después (mínimo 0). Sin horario, 0,5.
// El puntaje es el promedio ponderado de los factores que cuentan, de 0 a 10 con un decimal. Empates: la que llegó
// primero y, si no, por id (siempre el mismo orden). Solo entran propuestas de trabajo con precio: una visita para
// presupuestar no tiene precio del trabajo y queda afuera.
import type { Propuesta } from '@/contracts/v1/propuestas';

export const PESOS = {
  precio: 30,
  resenas: 25,
  verificaciones: 20,
  garantia: 15,
  fecha: 10,
} as const;
export type Factor = keyof typeof PESOS;

const DIA_MS = 86_400_000;
const GARANTIA_TOPE = 180;
const VERIFICACIONES_TOPE = 2;

export interface Resenas {
  readonly promedio: number;
  readonly cantidad: number;
}

export interface Candidata {
  readonly id: string;
  readonly totalCentavos: number;
  readonly resenas: Resenas | null;
  readonly verificaciones: number;
  readonly garantiaDias: number | null;
  /** Inicio propuesto (ISO) o `null` si lo declara al aceptar. */
  readonly inicio: string | null;
  readonly creadaEn: string;
}

export interface Puntaje {
  readonly id: string;
  /** 0 a 10, con un decimal. */
  readonly puntaje: number;
  readonly factores: Readonly<Record<Factor, number | null>>;
}

/** Una propuesta de visita (consulta) no tiene precio del trabajo. */
export const esVisita = (p: Pick<Propuesta, 'detalle'>) => p.detalle?.oferta === 'visita';

/** La candidata de una propuesta, o `null` si no entra (visita, sin precio o no es una cotización). */
export function candidataDe(p: Propuesta, resenas: Resenas | null = null): Candidata | null {
  if (p.tipo !== 'cotizacion' || esVisita(p) || p.monto.centavos <= 0) return null;
  return {
    id: p.id,
    totalCentavos: p.monto.centavos + p.comisionHandy.importe.centavos,
    resenas,
    verificaciones: p.especialista.verificaciones.length,
    garantiaDias: p.detalle?.garantiaDias ?? null,
    inicio: p.horario?.inicio ?? null,
    creadaEn: p.creadaEn,
  };
}

const entre01 = (x: number) => Math.max(0, Math.min(1, x));

/** Puntajes de todas, de mayor a menor (orden estable y determinístico). */
export function puntuar(cs: readonly Candidata[]): Puntaje[] {
  if (!cs.length) return [];
  const minimo = Math.min(...cs.map((c) => c.totalCentavos));
  const conResenas = cs.some((c) => c.resenas !== null);
  const inicios = cs.filter((c) => c.inicio !== null).map((c) => Date.parse(c.inicio as string));
  const primero = inicios.length ? Math.min(...inicios) : null;

  const lista = cs.map((c) => {
    const factores: Record<Factor, number | null> = {
      precio: entre01(minimo / c.totalCentavos),
      resenas: conResenas ? (c.resenas ? entre01(c.resenas.promedio / 5) : 0.5) : null,
      verificaciones: entre01(
        Math.min(c.verificaciones, VERIFICACIONES_TOPE) / VERIFICACIONES_TOPE,
      ),
      garantia: entre01(Math.min(c.garantiaDias ?? 0, GARANTIA_TOPE) / GARANTIA_TOPE),
      fecha:
        c.inicio === null || primero === null
          ? 0.5
          : entre01(1 - 0.1 * Math.floor((Date.parse(c.inicio) - primero) / DIA_MS)),
    };
    let suma = 0;
    let pesos = 0;
    for (const f of Object.keys(PESOS) as Factor[]) {
      const v = factores[f];
      if (v === null) continue;
      suma += v * PESOS[f];
      pesos += PESOS[f];
    }
    return { id: c.id, puntaje: Math.round((suma / pesos) * 100) / 10, factores, c };
  });
  lista.sort(
    (a, b) =>
      b.puntaje - a.puntaje || a.c.creadaEn.localeCompare(b.c.creadaEn) || a.id.localeCompare(b.id),
  );
  return lista.map(({ id, puntaje, factores }) => ({ id, puntaje, factores }));
}

/** La que más suma, solo si hay al menos dos para comparar. */
export function destacada(cs: readonly Candidata[]): Puntaje | null {
  return cs.length >= 2 ? (puntuar(cs)[0] ?? null) : null;
}

/** «8,7». */
export const formatoPuntaje = (n: number) =>
  n.toLocaleString('es-AR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Una frase corta con lo que más suma (sin superlativos). */
export function frase(p: Puntaje, c: Candidata, todas: readonly Puntaje[] = []): string {
  const partes: string[] = [];
  if ((p.factores.precio ?? 0) >= 0.9) partes.push('buen precio');
  if (c.resenas && (p.factores.resenas ?? 0) >= 0.9) partes.push('buenas reseñas');
  if (c.verificaciones >= VERIFICACIONES_TOPE)
    partes.push(`${c.verificaciones} verificaciones de Handyx`);
  if (c.garantiaDias) partes.push(`garantía de ${c.garantiaDias} días`);
  const otraMasTarde = todas.some((t) => t.id !== p.id && (t.factores.fecha ?? 1) < 1);
  if (c.inicio && (p.factores.fecha ?? 0) >= 1 && otraMasTarde) partes.push('puede ir antes');
  const usadas = partes.slice(0, 3);
  if (!usadas.length) return 'Es la que más suma con las mismas reglas para todas.';
  const texto =
    usadas.length === 1
      ? usadas[0]!
      : `${usadas.slice(0, -1).join(', ')} y ${usadas[usadas.length - 1]}`;
  return `${texto[0]!.toUpperCase()}${texto.slice(1)}.`;
}
