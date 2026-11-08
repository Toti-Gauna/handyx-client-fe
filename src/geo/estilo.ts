// Estilo Handyx del mapa (como el mapa de la demo de la landing): tierra gris clara como las manzanas, calles blancas,
// mar celeste con la costa amarilla, plazas verdes y barrios en mayúsculas espaciadas. Capas de @protomaps/basemaps
// sobre el extracto de OpenStreetMap; fuentes y datos servidos por la propia app (nada de terceros).
// Los colores son los del SVG de la demo (Handy-landing-page-fe/src/render/demo/mapa.ts): MapLibre los necesita como
// valores, no como variables de CSS.
import { LIGHT, layers, type Flavor } from '@protomaps/basemaps';
import type { StyleSpecification } from 'maplibre-gl';
import { ARCHIVO_MAPA, ZOOM_MAXIMO_DATOS } from './mdp';

const TIERRA = '#E6E9EE';
const CALLE = '#FFFFFF';
const BORDE_CALLE = '#D9DEE6';
const AGUA = '#CFE3F7';
const COSTA = '#F6E2A8';
const PLAZA = '#D7EBCF';
const ETIQUETA = '#8A93A6';
const ETIQUETA_BARRIO = '#8B95A8';
const ETIQUETA_MAR = '#6B90C4';

export const FLAVOR_HANDYX: Flavor = {
  ...LIGHT,
  background: CALLE,
  earth: TIERRA,
  park_a: PLAZA,
  park_b: PLAZA,
  wood_a: PLAZA,
  wood_b: PLAZA,
  scrub_a: PLAZA,
  scrub_b: PLAZA,
  hospital: TIERRA,
  industrial: TIERRA,
  school: TIERRA,
  pedestrian: CALLE,
  zoo: PLAZA,
  military: TIERRA,
  aerodrome: TIERRA,
  runway: CALLE,
  sand: COSTA,
  beach: COSTA,
  water: AGUA,
  pier: CALLE,
  buildings: '#DCE0E7',
  other: CALLE,
  minor_service: CALLE,
  minor_a: CALLE,
  minor_b: CALLE,
  link: CALLE,
  major: CALLE,
  highway: CALLE,
  minor_service_casing: BORDE_CALLE,
  minor_casing: BORDE_CALLE,
  link_casing: BORDE_CALLE,
  major_casing_early: BORDE_CALLE,
  major_casing_late: BORDE_CALLE,
  highway_casing_early: BORDE_CALLE,
  highway_casing_late: BORDE_CALLE,
  bridges_other: CALLE,
  bridges_minor: CALLE,
  bridges_link: CALLE,
  bridges_major: CALLE,
  bridges_highway: CALLE,
  tunnel_other: CALLE,
  tunnel_minor: CALLE,
  tunnel_link: CALLE,
  tunnel_major: CALLE,
  tunnel_highway: CALLE,
  railway: '#C9D0DB',
  boundaries: '#C9D0DB',
  roads_label_minor: ETIQUETA,
  roads_label_minor_halo: CALLE,
  roads_label_major: ETIQUETA,
  roads_label_major_halo: CALLE,
  ocean_label: ETIQUETA_MAR,
  subplace_label: ETIQUETA_BARRIO,
  subplace_label_halo: CALLE,
  city_label: ETIQUETA,
  city_label_halo: CALLE,
  address_label: ETIQUETA,
  address_label_halo: CALLE,
};

/** Estilo completo, con las URL absolutas del origen de la app (MapLibre las pide desde un worker). */
export function estiloHandyx(origen: string): StyleSpecification {
  return {
    version: 8,
    glyphs: `${origen}/mapa/fuentes/{fontstack}/{range}.pbf`,
    sources: {
      mdp: {
        type: 'vector',
        url: `pmtiles://${origen}${ARCHIVO_MAPA}`,
        maxzoom: ZOOM_MAXIMO_DATOS,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      },
    },
    layers: layers('mdp', FLAVOR_HANDYX, { lang: 'es' })
      // Sin íconos (puntos de interés, escudos de ruta, sentido de mano): necesitarían un sprite y distraen del pin.
      .filter((capa) => !(capa.type === 'symbol' && capa.layout && 'icon-image' in capa.layout))
      .map((capa) =>
        // Barrios en mayúsculas espaciadas, como en la demo.
        capa.id === 'places_subplace' && capa.type === 'symbol'
          ? {
              ...capa,
              layout: {
                ...capa.layout,
                'text-transform': 'uppercase',
                'text-letter-spacing': 0.18,
              },
            }
          : capa,
      ),
  };
}
