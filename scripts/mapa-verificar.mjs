// Verifica public/mapa/mdp.pmtiles (lo genera scripts/mapa-datos.sh): que sea un PMTiles de teselas vectoriales, que
// cubra Mar del Plata hasta el zoom esperado y que no pese de más para servirlo como estático. Uso: npm run mdp:verificar
import { open, stat } from 'node:fs/promises';
import { PMTiles } from 'pmtiles';

const ARCHIVO = process.argv[2] ?? 'public/mapa/mdp.pmtiles';
const CENTRO = { lat: -38.0055, lng: -57.5426 };
const PESO_MAXIMO_MB = 80;

/** Fuente de lectura por rangos sobre un archivo local (la misma interfaz que usa el navegador con HTTP). */
class ArchivoLocal {
  constructor(ruta) {
    this.ruta = ruta;
  }
  getKey() {
    return this.ruta;
  }
  async getBytes(offset, largo) {
    const f = await open(this.ruta, 'r');
    try {
      const buf = Buffer.alloc(largo);
      const { bytesRead } = await f.read(buf, 0, largo, offset);
      const datos = buf.subarray(0, bytesRead);
      return { data: datos.buffer.slice(datos.byteOffset, datos.byteOffset + datos.byteLength) };
    } finally {
      await f.close();
    }
  }
}

const fallas = [];
const info = await stat(ARCHIVO).catch(() => null);
if (!info) {
  console.error(`No está ${ARCHIVO}. Generalo con: npm run mdp:datos`);
  process.exit(1);
}
const mb = info.size / 1024 / 1024;
const archivo = new PMTiles(new ArchivoLocal(ARCHIVO));
const h = await archivo.getHeader();
const meta = await archivo.getMetadata();

if (h.tileType !== 1) fallas.push(`las teselas no son vectoriales (tipo ${h.tileType})`);
if (h.maxZoom < 14) fallas.push(`zoom máximo ${h.maxZoom}: hace falta al menos 14 para ver calles`);
if (!(
  h.minLon <= CENTRO.lng &&
  h.maxLon >= CENTRO.lng &&
  h.minLat <= CENTRO.lat &&
  h.maxLat >= CENTRO.lat
))
  fallas.push('no cubre el centro de Mar del Plata');
if (mb > PESO_MAXIMO_MB) fallas.push(`pesa ${mb.toFixed(1)} MB (máximo ${PESO_MAXIMO_MB})`);
const capas = (meta?.vector_layers ?? []).map((c) => c.id);
for (const c of ['earth', 'water', 'roads', 'places'])
  if (!capas.includes(c)) fallas.push(`falta la capa "${c}" (¿es un build de Protomaps?)`);

console.log(
  `${ARCHIVO}: ${mb.toFixed(1)} MB · zoom ${h.minZoom}-${h.maxZoom} · ` +
    `límites ${h.minLon.toFixed(3)},${h.minLat.toFixed(3)} → ${h.maxLon.toFixed(3)},${h.maxLat.toFixed(3)} · ` +
    `capas: ${capas.join(', ') || '—'}`,
);
if (fallas.length) {
  for (const f of fallas) console.error(`✘ ${f}`);
  process.exit(1);
}
console.log('Mapa OK');
