// Viaje en vivo de la vista de prueba (contrato 1.0.0-draft.2, decisión de Ignacio del 31/10): mientras el trabajo está
// `en_camino`, el especialista ficticio avanza por un recorrido de calles inventado (en ele, siguiendo la grilla) hasta
// la casa del pedido. Igual que el servidor real: la posición, lo que falta y la llegada estimada salen del reloj del
// "servidor" (el del mundo), nunca del celular; solo se ven mientras se comparte; al llegar o cancelar el viaje
// termina y deja de mostrarse dónde estuvo. Todo es ficticio: no hay GPS ni personas.
import type { z } from 'zod';
import type { Punto, Viaje } from '../../contracts/v1/viaje.ts';
import { ahoraMs, iso } from './mundo.ts';
import type { Mundo, Trabajo } from './tipos.ts';

type P = z.output<typeof Punto>;
type V = z.output<typeof Viaje>;

export interface ViajeSimulado {
  readonly inicioMs: number;
  readonly linea: readonly P[];
  readonly distanciaM: number;
  readonly duracionS: number;
}

/** ~23 km/h de promedio en la ciudad (ficticio). */
const VELOCIDAD_MS = 6.4;
/** Punto de partida ficticio: unos 1,5 km al norte y al oeste de la casa. */
const DESDE = { lat: 0.011, lng: -0.009 };

const rad = (g: number) => (g * Math.PI) / 180;
export function distanciaM(a: P, b: P): number {
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

const redondear = (v: number) => Math.round(v * 1e6) / 1e6;

/** Recorrido en ele (como una cuadrícula de calles), con un punto cada ~100 m para dibujarlo. */
function recorrido(casa: P): P[] {
  // Solo lat y lng (las coordenadas del pedido traen además la precisión).
  const destino = { lat: casa.lat, lng: casa.lng };
  const origen = { lat: destino.lat + DESDE.lat, lng: destino.lng + DESDE.lng };
  const esquina = { lat: origen.lat, lng: destino.lng };
  const tramo = (a: P, b: P) => {
    const n = Math.max(1, Math.round(distanciaM(a, b) / 100));
    return Array.from({ length: n }, (_, i) => ({
      lat: redondear(a.lat + ((b.lat - a.lat) * i) / n),
      lng: redondear(a.lng + ((b.lng - a.lng) * i) / n),
    }));
  };
  return [...tramo(origen, esquina), ...tramo(esquina, destino), destino];
}

function largo(linea: readonly P[]): number {
  let total = 0;
  for (let i = 1; i < linea.length; i++) total += distanciaM(linea[i - 1]!, linea[i]!);
  return total;
}

/** El punto que está a `metros` del inicio del recorrido. */
function puntoA(linea: readonly P[], metros: number): P {
  let resto = metros;
  for (let i = 1; i < linea.length; i++) {
    const a = linea[i - 1]!;
    const b = linea[i]!;
    const d = distanciaM(a, b);
    if (resto <= d) {
      const f = d === 0 ? 0 : resto / d;
      return {
        lat: redondear(a.lat + (b.lat - a.lat) * f),
        lng: redondear(a.lng + (b.lng - a.lng) * f),
      };
    }
    resto -= d;
  }
  return linea.at(-1)!;
}

/** El especialista empezó a compartir: arranca el viaje simulado (una vez por trabajo). */
export function iniciarViaje(
  m: Mundo,
  t: Trabajo,
  destino: P,
  desdeMs = ahoraMs(m),
): ViajeSimulado {
  const existente = m.viajes[t.id];
  if (existente) return existente;
  const linea = recorrido(destino);
  const distancia = Math.round(largo(linea));
  const v = {
    inicioMs: desdeMs,
    linea,
    distanciaM: distancia,
    duracionS: Math.round(distancia / VELOCIDAD_MS),
  };
  m.viajes[t.id] = v;
  return v;
}

/**
 * El viaje como lo devuelve el servidor. `sin_compartir` antes de salir; `compartiendo` en camino (con posición,
 * trayecto, lo que falta y la llegada estimada); `terminado` después (sin posición: no se muestra dónde estuvo).
 */
export function viajeDe(m: Mundo, t: Trabajo, destino: P): V {
  let sim: ViajeSimulado | undefined = m.viajes[t.id];
  // Un trabajo que ya estaba en camino (escenario armado) empezó a compartir cuando salió.
  if (!sim && t.estado === 'en_camino')
    sim = iniciarViaje(m, t, destino, Math.min(ahoraMs(m), Date.parse(t.actualizadoEn)));
  const base = { trabajoId: t.id, destino: { lat: destino.lat, lng: destino.lng } };
  if (!sim)
    return {
      ...base,
      estado: 'sin_compartir',
      trayecto: null,
      ultimaPosicion: null,
      distanciaRestanteM: null,
      llegadaEstimada: null,
    };
  if (t.estado !== 'en_camino')
    return {
      ...base,
      estado: 'terminado',
      trayecto: null,
      ultimaPosicion: null,
      distanciaRestanteM: null,
      llegadaEstimada: null,
    };
  const ahora = ahoraMs(m);
  const avance = Math.min(1, Math.max(0, (ahora - sim.inicioMs) / (sim.duracionS * 1000)));
  const recorridos = sim.distanciaM * avance;
  return {
    ...base,
    estado: 'compartiendo',
    trayecto: {
      linea: [...sim.linea],
      distanciaM: sim.distanciaM,
      duracionS: sim.duracionS,
      version: 0,
    },
    ultimaPosicion: { punto: puntoA(sim.linea, recorridos), precisionM: 8, en: iso(ahora) },
    distanciaRestanteM: Math.round(sim.distanciaM - recorridos),
    llegadaEstimada: iso(sim.inicioMs + sim.duracionS * 1000),
  };
}
