// Mapa (lote 3.3): geometría de Mar del Plata, estilo sin terceros y garantías de privacidad.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { estiloHandyx } from '@/geo/estilo';
import {
  CENTRO_MDP,
  LIMITES_MDP,
  barrioCercano,
  dentroDeMdp,
  distanciaMetros,
  precisionDelPin,
} from '@/geo/mdp';

describe('Mar del Plata', () => {
  it('el centro está dentro de la zona y otra ciudad no', () => {
    expect(dentroDeMdp(CENTRO_MDP)).toBe(true);
    expect(dentroDeMdp({ lat: -34.6037, lng: -58.3816 })).toBe(false); // Buenos Aires
  });

  it('distancia aproximada en metros', () => {
    const d = distanciaMetros(CENTRO_MDP, { lat: CENTRO_MDP.lat + 0.01, lng: CENTRO_MDP.lng });
    expect(d).toBeGreaterThan(1100);
    expect(d).toBeLessThan(1120);
  });

  it('barrio más cercano, o ninguno si está lejos', () => {
    const barrios = [
      { nombre: 'Uno', punto: { lat: -38.0, lng: -57.55 } },
      { nombre: 'Dos', punto: { lat: -38.006, lng: -57.543 } },
    ];
    expect(barrioCercano(CENTRO_MDP, barrios)).toBe('Dos');
    expect(barrioCercano({ lat: -38.1, lng: -57.7 }, barrios)).toBeNull();
  });

  it('la precisión de un pin depende del zoom', () => {
    expect(precisionDelPin(17, CENTRO_MDP.lat)).toBeLessThan(precisionDelPin(13, CENTRO_MDP.lat));
    expect(precisionDelPin(18.5, CENTRO_MDP.lat)).toBeGreaterThanOrEqual(5);
  });

  it('los límites del script de datos son los mismos que los de la app', () => {
    expect(readFileSync('scripts/mapa-datos.sh', 'utf8')).toContain(
      `LIMITES="${LIMITES_MDP.join(',')}"`,
    );
  });
});

describe('estilo Handyx', () => {
  const estilo = estiloHandyx('https://app.example.test');

  it('datos y fuentes salen del mismo origen de la app (nada de terceros)', () => {
    expect(estilo.glyphs).toBe('https://app.example.test/mapa/fuentes/{fontstack}/{range}.pbf');
    const fuente = estilo.sources.mdp as { url: string; attribution: string };
    expect(fuente.url).toBe('pmtiles://https://app.example.test/mapa/mdp.pmtiles');
    expect(fuente.attribution).toContain('OpenStreetMap');
    expect(JSON.stringify(estilo)).not.toMatch(
      /protomaps\.com|mapbox\.com|googleapis|api\.maptiler/,
    );
  });

  it('sin íconos que pidan un sprite', () => {
    expect(estilo.sprite).toBeUndefined();
    for (const capa of estilo.layers)
      if (capa.type === 'symbol') expect(capa.layout ?? {}).not.toHaveProperty('icon-image');
  });

  it('barrios en mayúsculas espaciadas, como la demo', () => {
    const barrios = estilo.layers.find((c) => c.id === 'places_subplace');
    expect(barrios?.layout).toMatchObject({ 'text-transform': 'uppercase' });
  });

  it('las fuentes que usa el estilo están en public/', () => {
    const fuentes = new Set(
      JSON.stringify(estilo.layers).match(/Noto Sans (?:Regular|Medium|Italic)/g) ?? [],
    );
    expect(fuentes.size).toBeGreaterThan(0);
    for (const f of fuentes) readFileSync(`public/mapa/fuentes/${f}/0-255.pbf`);
  });
});

describe('privacidad del mapa', () => {
  const mapa = readFileSync('src/components/MapaHx.tsx', 'utf8');

  it('solo lo que mueve la persona elige un punto (ir a "mi ubicación" no lo pisa)', () => {
    expect(mapa).toMatch(/if \(!e\.originalEvent\) return;/);
  });

  it('sin el archivo del mapa no se pide nada: ilustrado y rotulado', () => {
    expect(mapa).toMatch(/if \(!HAY_ARCHIVO_MAPA && !prueba\) return false;/);
    expect(mapa).toMatch(/Mapa ilustrativo/);
  });

  it('el service worker no guarda el mapa', () => {
    const sw = readFileSync('public/sw.js', 'utf8');
    expect(sw).not.toMatch(/pmtiles|\/mapa\//);
  });

  it('el seguimiento no muestra tiempos de llegada', () => {
    const trabajo = readFileSync('src/app/(app)/trabajos/detalle/page.tsx', 'utf8');
    expect(trabajo).not.toMatch(/llega en|minutos? de distancia|\bETA\b/i);
  });
});
