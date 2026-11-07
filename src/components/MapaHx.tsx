'use client';

// Mapa de Mar del Plata (lote 3.3): MapLibre sobre el extracto de OpenStreetMap que sirve la propia app (sin claves ni
// terceros) con el estilo Handyx. Si el archivo del mapa no está, o el navegador no puede dibujarlo (sin WebGL), se ve
// el mapa ilustrado de la demo, rotulado como ilustrativo: nunca se inventa una geografía.
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Map as MapaLibre, Marker } from 'maplibre-gl';
import { useEffect, useRef, useState } from 'react';
import { estiloHandyx } from '@/geo/estilo';
import { esVistaDePrueba } from '@/data';
import {
  ARCHIVO_MAPA,
  HAY_ARCHIVO_MAPA,
  LIMITES_MDP,
  WORKER_MAPA,
  barrioCercano,
  distanciaMetros,
  precisionDelPin,
  type Punto,
} from '@/geo/mdp';

export type EstadoMapa = 'cargando' | 'vivo' | 'ilustrado';
export type PuntoElegido = Punto & { precisionMetros: number };

let protocolo: Promise<void> | null = null;
/** El protocolo pmtiles:// se registra una sola vez por página. */
function registrarProtocolo(maplibre: typeof import('maplibre-gl')): Promise<void> {
  protocolo ??= import('pmtiles').then(({ Protocol }) => {
    maplibre.setWorkerUrl(`${location.origin}${WORKER_MAPA}?v=${maplibre.getVersion()}`);
    maplibre.addProtocol('pmtiles', new Protocol().tile);
  });
  return protocolo;
}

/**
 * Comprueba que el archivo del mapa exista y sea un PMTiles (si no, el mapa ilustrado). Solo se pide si el build lo
 * encontró; las pruebas e2e de la vista de prueba pueden pedir el mapa sintético con `__hxMapaPrueba`.
 */
async function hayDatos(origen: string): Promise<boolean> {
  const prueba =
    esVistaDePrueba && (globalThis as { __hxMapaPrueba?: boolean }).__hxMapaPrueba === true;
  if (!HAY_ARCHIVO_MAPA && !prueba) return false;
  try {
    const { PMTiles } = await import('pmtiles');
    await new PMTiles(origen + ARCHIVO_MAPA).getHeader();
    return true;
  } catch {
    return false;
  }
}

/**
 * Márgenes del encuadre del viaje según el tamaño real del mapa (arriba quedan el botón de volver y el chip; abajo, el
 * borde de la hoja azul). Si no entran, MapLibre no encuadra nada: nunca más del 40 % de cada lado.
 */
function margenDeEncuadre(caja: HTMLElement) {
  const alto = caja.clientHeight;
  const ancho = caja.clientWidth;
  const v = (px: number) => Math.min(px, Math.floor(alto * 0.2));
  const h = Math.min(36, Math.floor(ancho * 0.2));
  return { top: v(64), bottom: v(44), left: h, right: h };
}

const sinMovimiento = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Pin de tu casa (el de la demo), como elemento del marcador. */
function elementoCasa(pulso: boolean): HTMLElement {
  const e = document.createElement('div');
  e.className = `mapa-hx__casa${pulso ? ' mapa-hx__casa--pulso' : ''}`;
  e.innerHTML = '<i></i><i></i><i></i><span class="mapa-hx__pin"></span>';
  return e;
}

function elementoEspecialista(iniciales: string): HTMLElement {
  const e = document.createElement('div');
  e.className = 'mapa-hx__esp';
  e.textContent = iniciales;
  return e;
}

/**
 * - `elegir`: la persona mueve el mapa y el pin queda fijo en el centro (como en las apps de delivery); al soltar avisa
 *   el punto (`onMover`) y el barrio más cercano (`onBarrio`).
 * - `ver`: fijo, con tu casa en el centro; `pulso` mientras se busca; `especialista` solo si hay dato del servidor
 *   (en el viaje en vivo, su posición; `trayecto`, el recorrido por las calles).
 */
export function MapaHx({
  centro,
  modo,
  zoom = 16,
  pulso = false,
  especialista = null,
  trayecto = null,
  onMover,
  onBarrio,
  onEstado,
  etiqueta,
  clase = '',
}: {
  centro: Punto;
  modo: 'elegir' | 'ver';
  zoom?: number;
  pulso?: boolean;
  especialista?: (Punto & { iniciales: string }) | null;
  /** Recorrido que calculó el servidor (viaje en vivo): se dibuja y el mapa encuadra casa, especialista y recorrido. */
  trayecto?: readonly Punto[] | null;
  onMover?: (p: PuntoElegido) => void;
  onBarrio?: (barrio: string | null) => void;
  onEstado?: (e: EstadoMapa) => void;
  etiqueta: string;
  clase?: string;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const mapa = useRef<MapaLibre | null>(null);
  const marcadorEsp = useRef<Marker | null>(null);
  // La clase del marcador, del mismo import que armó el mapa: así el marcador del especialista se mueve en el acto, sin
  // promesas que se crucen entre una posición y la siguiente (y sin dejar marcadores huérfanos).
  const ClaseMarcador = useRef<typeof Marker | null>(null);
  const encuadre = useRef<string | null>(null);
  const avisos = useRef({ onMover, onBarrio, onEstado });
  const [inicial] = useState(() => ({ centro, zoom, modo, pulso }));
  const [estado, setEstado] = useState<EstadoMapa>('cargando');
  const [moviendo, setMoviendo] = useState(false);

  useEffect(() => {
    avisos.current = { onMover, onBarrio, onEstado };
  }, [onMover, onBarrio, onEstado]);

  useEffect(() => {
    avisos.current.onEstado?.(estado);
  }, [estado]);

  // Crear el mapa una sola vez.
  useEffect(() => {
    let cancelado = false;
    (async () => {
      const origen = location.origin;
      const maplibre = await import('maplibre-gl').catch(() => null);
      if (!maplibre || !(await hayDatos(origen)) || cancelado || !caja.current) {
        if (!cancelado) setEstado('ilustrado');
        return;
      }
      await registrarProtocolo(maplibre);
      if (cancelado || !caja.current) return;
      const elegir = inicial.modo === 'elegir';
      let m: MapaLibre;
      try {
        m = new maplibre.Map({
          container: caja.current,
          style: estiloHandyx(origen),
          center: [inicial.centro.lng, inicial.centro.lat],
          zoom: inicial.zoom,
          minZoom: 11,
          maxZoom: 18.5,
          maxBounds: [
            [LIMITES_MDP[0] - 0.05, LIMITES_MDP[1] - 0.05],
            [LIMITES_MDP[2] + 0.05, LIMITES_MDP[3] + 0.05],
          ],
          interactive: elegir,
          attributionControl: false,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          fadeDuration: sinMovimiento() ? 0 : 300,
        });
      } catch {
        setEstado('ilustrado'); // sin WebGL
        return;
      }
      mapa.current = m;
      ClaseMarcador.current = maplibre.Marker;
      m.touchZoomRotate.disableRotation();
      m.keyboard.disableRotation();
      if (!elegir)
        new maplibre.Marker({ element: elementoCasa(inicial.pulso), anchor: 'bottom' })
          .setLngLat([inicial.centro.lng, inicial.centro.lat])
          .addTo(m);

      const barrioEnElCentro = () => {
        const c = m.getCenter();
        const barrios = m
          .querySourceFeatures('mdp', { sourceLayer: 'places' })
          .filter((f) => ['neighbourhood', 'macrohood'].includes(String(f.properties.kind)))
          .flatMap((f) =>
            f.geometry.type === 'Point' && typeof f.properties.name === 'string'
              ? [
                  {
                    nombre: f.properties.name,
                    punto: { lng: f.geometry.coordinates[0]!, lat: f.geometry.coordinates[1]! },
                  },
                ]
              : [],
          );
        avisos.current.onBarrio?.(barrioCercano({ lat: c.lat, lng: c.lng }, barrios));
      };
      m.on('load', () => {
        if (cancelado) return;
        setEstado('vivo');
        m.once('idle', barrioEnElCentro);
      });
      m.on('error', () => {
        if (!m.loaded()) setEstado('ilustrado');
      });
      if (elegir) {
        m.on('movestart', () => setMoviendo(true));
        m.on('moveend', (e) => {
          setMoviendo(false);
          // Solo lo que mueve la persona elige un punto; ir a "mi ubicación" no lo pisa.
          if (!e.originalEvent) return;
          const c = m.getCenter();
          avisos.current.onMover?.({
            lat: Number(c.lat.toFixed(6)),
            lng: Number(c.lng.toFixed(6)),
            precisionMetros: precisionDelPin(m.getZoom(), c.lat),
          });
          m.once('idle', barrioEnElCentro);
        });
      }
    })();
    return () => {
      cancelado = true;
      mapa.current?.remove();
      mapa.current = null;
      marcadorEsp.current = null;
      encuadre.current = null;
    };
  }, [inicial]);

  // Cuando el centro cambia desde afuera ("usar mi ubicación"), el mapa va hasta ahí.
  useEffect(() => {
    const m = mapa.current;
    // Con un viaje en pantalla manda su encuadre (casa + especialista + recorrido), no el centro.
    if (!m || encuadre.current !== null) return;
    const c = m.getCenter();
    if (distanciaMetros({ lat: c.lat, lng: c.lng }, centro) < 3) return;
    m.easeTo({ center: [centro.lng, centro.lat], duration: sinMovimiento() ? 0 : 600 });
  }, [centro, estado]);

  // Especialista en camino (aproximado): aparece, se mueve y se va con el dato.
  useEffect(() => {
    const m = mapa.current;
    if (!m || estado !== 'vivo') return;
    if (!especialista) {
      marcadorEsp.current?.remove();
      marcadorEsp.current = null;
      return;
    }
    const M = ClaseMarcador.current;
    if (!M) return;
    marcadorEsp.current ??= new M({ element: elementoEspecialista(especialista.iniciales) })
      .setLngLat([especialista.lng, especialista.lat])
      .addTo(m);
    marcadorEsp.current.setLngLat([especialista.lng, especialista.lat]);
  }, [especialista, estado]);

  // Recorrido del viaje en vivo: línea azul (con borde blanco) y un encuadre por recorrido nuevo (no en cada posición,
  // para que el mapa no salte); con "reducir movimiento", sin animación.
  useEffect(() => {
    const m = mapa.current;
    if (!m || estado !== 'vivo') return;
    const capas = ['viaje-borde', 'viaje-linea'];
    if (!trayecto || trayecto.length < 2) {
      for (const c of capas) if (m.getLayer(c)) m.removeLayer(c);
      if (m.getSource('viaje')) m.removeSource('viaje');
      encuadre.current = null;
      return;
    }
    const datos = {
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: trayecto.map((p) => [p.lng, p.lat]),
      },
    };
    const fuente = m.getSource('viaje') as { setData?: (d: unknown) => void } | undefined;
    if (fuente?.setData) fuente.setData(datos);
    else {
      m.addSource('viaje', { type: 'geojson', data: datos });
      m.addLayer({
        id: 'viaje-borde',
        type: 'line',
        source: 'viaje',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#FFFFFF', 'line-width': 9 },
      });
      m.addLayer({
        id: 'viaje-linea',
        type: 'line',
        source: 'viaje',
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: { 'line-color': '#1F57A8', 'line-width': 5 },
      });
    }
    const primero = trayecto[0]!;
    const ultimo = trayecto.at(-1)!;
    const clave = `${trayecto.length}|${primero.lat},${primero.lng}|${ultimo.lat},${ultimo.lng}`;
    if (encuadre.current === clave) return;
    encuadre.current = clave;
    const puntos = [...trayecto, centro, ...(especialista ? [especialista] : [])];
    const lats = puntos.map((p) => p.lat);
    const lngs = puntos.map((p) => p.lng);
    m.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      {
        padding: margenDeEncuadre(m.getContainer()),
        maxZoom: 16.5,
        duration: sinMovimiento() ? 0 : 700,
      },
    );
  }, [trayecto, especialista, centro, estado]);

  return (
    <div
      className={`mapa-hx mapa-hx--${modo} mapa-hx--${estado} ${clase}`.trim()}
      role="group"
      aria-label={etiqueta}
    >
      <div ref={caja} className="mapa-hx__lienzo" />
      {estado === 'ilustrado' ? <MapaIlustrado pulso={pulso} conCasa={modo === 'ver'} /> : null}
      {modo === 'elegir' ? (
        <span
          className={`mapa-hx__mira${moviendo ? ' mapa-hx__mira--moviendo' : ''}`}
          aria-hidden="true"
        >
          <span className="mapa-hx__pin" />
          <i />
        </span>
      ) : null}
      {estado === 'vivo' ? (
        <p className="mapa-hx__atribucion">
          ©{' '}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
            OpenStreetMap
          </a>
        </p>
      ) : null}
      {estado === 'ilustrado' ? <p className="mapa-hx__rotulo">Mapa ilustrativo</p> : null}
    </div>
  );
}

/** El mapa de la demo de la landing (manzanas, avenidas y la costa), decorativo. */
export function MapaIlustrado({
  pulso = false,
  conCasa = true,
}: {
  pulso?: boolean;
  conCasa?: boolean;
}) {
  return (
    <div className="hd-mapa mapa-hx__ilustrado" aria-hidden="true">
      <svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="mapa-hx-manzanas" width="48" height="48" patternUnits="userSpaceOnUse">
            <rect width="48" height="48" fill="#fff" />
            <rect x="5" y="5" width="38" height="38" rx="5" fill="#E6E9EE" />
          </pattern>
        </defs>
        <rect width="360" height="640" fill="#fff" />
        <path
          d="M0 0 H262 C246 96 280 170 262 250 C246 330 300 410 290 500 C284 560 322 600 316 640 H0 Z"
          fill="url(#mapa-hx-manzanas)"
        />
        <g fill="#D7EBCF">
          <rect x="101" y="197" width="38" height="38" rx="5" />
          <rect x="53" y="389" width="86" height="38" rx="5" />
        </g>
        <g stroke="#fff" strokeWidth="13" strokeLinecap="square">
          <path d="M0 144 H262" />
          <path d="M0 432 H286" />
          <path d="M144 0 V640" />
        </g>
        <path
          d="M262 0 C246 96 280 170 262 250 C246 330 300 410 290 500 C284 560 322 600 316 640 H360 V0 Z"
          fill="#CFE3F7"
        />
        <path
          d="M262 0 C246 96 280 170 262 250 C246 330 300 410 290 500 C284 560 322 600 316 640"
          fill="none"
          stroke="#F6E2A8"
          strokeWidth="9"
        />
        <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.85">
          <path className="hd-mapa__mar-ola" d="M296 60 q8 -6 16 0 t16 0 t16 0" />
          <path className="hd-mapa__mar-ola" d="M300 196 q8 -6 16 0 t16 0 t16 0" />
          <path className="hd-mapa__mar-ola" d="M318 330 q8 -6 16 0 t16 0" />
          <path className="hd-mapa__mar-ola" d="M322 470 q8 -6 16 0 t16 0" />
        </g>
        {pulso ? (
          <g className="hd-mapa__radar" transform="translate(180 306)">
            <circle r="120" />
            <circle r="120" />
            <circle r="120" />
          </g>
        ) : null}
        {conCasa ? (
          <g transform="translate(180 320)">
            <circle className="hd-mapa__yo-onda" r="12" fill="#E53935" opacity="0.35" />
            <g className="hd-mapa__pin">
              <path
                d="M0 0 C-4 -9 -13 -14 -13 -25 A13 13 0 1 1 13 -25 C13 -14 4 -9 0 0 Z"
                fill="#E53935"
                stroke="#fff"
                strokeWidth="2.5"
              />
              <circle cy="-25" r="5" fill="#fff" />
            </g>
          </g>
        ) : null}
      </svg>
    </div>
  );
}
