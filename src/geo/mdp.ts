// Mar del Plata para el mapa (lote 3.3). Coordenadas públicas de la ciudad, no de ninguna persona.

export interface Punto {
  readonly lat: number;
  readonly lng: number;
}

/** Centro de la ciudad (Plaza San Martín, aprox.): encuadre inicial cuando no hay dirección. */
export const CENTRO_MDP: Punto = { lat: -38.0055, lng: -57.5426 };

/**
 * Zona que cubre el extracto del mapa (oeste, sur, este, norte). Es también la zona de la demo: un punto fuera de acá no
 * tiene cobertura. El servidor sigue validando la cobertura por su cuenta.
 */
export const LIMITES_MDP = [-57.7, -38.12, -57.48, -37.88] as const;

/** Archivo del mapa: extracto de OpenStreetMap servido como estático junto a la app (scripts/mapa-datos.sh). */
export const ARCHIVO_MAPA = '/mapa/mdp.pmtiles';
/** Lo fija el build (next.config.ts) según si el archivo estaba al compilar. */
export const HAY_ARCHIVO_MAPA = process.env.NEXT_PUBLIC_MAPA_DATOS === '1';
/** Worker de MapLibre copiado a public/ (scripts/mapa-worker.mjs). */
export const WORKER_MAPA = '/mapa/maplibre-gl-worker.js';
export const ZOOM_MAXIMO_DATOS = 15;

export const dentroDeMdp = (p: Punto): boolean =>
  p.lng >= LIMITES_MDP[0] &&
  p.lng <= LIMITES_MDP[2] &&
  p.lat >= LIMITES_MDP[1] &&
  p.lat <= LIMITES_MDP[3];

/** Distancia aproximada en metros (equirrectangular: alcanza para una ciudad). */
export function distanciaMetros(a: Punto, b: Punto): number {
  const r = 6_371_000;
  const rad = Math.PI / 180;
  const x = (b.lng - a.lng) * rad * Math.cos(((a.lat + b.lat) / 2) * rad);
  const y = (b.lat - a.lat) * rad;
  return Math.round(Math.sqrt(x * x + y * y) * r);
}

/** El barrio más cercano entre los lugares del mapa (puntos de OSM), si está a menos de `maximo` metros. */
export function barrioCercano(
  p: Punto,
  barrios: readonly { nombre: string; punto: Punto }[],
  maximo = 1500,
): string | null {
  let mejor: { nombre: string; d: number } | null = null;
  for (const b of barrios) {
    const d = distanciaMetros(p, b.punto);
    if (d <= maximo && (!mejor || d < mejor.d)) mejor = { nombre: b.nombre, d };
  }
  return mejor?.nombre ?? null;
}

/** Precisión de un pin puesto a mano: lo que mide en el suelo el error típico de apuntar con el dedo (~20 px). */
export function precisionDelPin(zoom: number, lat: number): number {
  const metrosPorPixel = (156_543.03 * Math.cos((lat * Math.PI) / 180)) / 2 ** zoom;
  return Math.max(5, Math.round(metrosPorPixel * 20));
}
