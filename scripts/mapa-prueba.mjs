// Genera tests/fixtures/mapa-prueba.pmtiles: un mapa SINTÉTICO (calles en grilla, una costa recta, una plaza y un
// "Barrio de Prueba") con las mismas capas que el extracto real, para probar en el navegador el camino de MapLibre
// (protocolo pmtiles, estilo, fuentes, pin y barrio) sin depender de internet. No es Mar del Plata y nunca se publica:
// el e2e lo sirve en lugar de /mapa/mdp.pmtiles. Uso: node scripts/mapa-prueba.mjs
import { writeFile } from 'node:fs/promises';
import geojsonvtModulo from 'geojson-vt';
import { zxyToTileId } from 'pmtiles';
import vtpbf from 'vt-pbf';

const GeoJSONVT = geojsonvtModulo.default ?? geojsonvtModulo;
const DESTINO = process.argv[2] ?? 'tests/fixtures/mapa-prueba.pmtiles';
const [O, S, E, N] = [-57.6, -38.05, -57.48, -37.96];
const COSTA = -57.525;
const ZOOMS = [12, 13, 14, 15];

const poligono = (props, anillo) => ({
  type: 'Feature',
  properties: props,
  geometry: { type: 'Polygon', coordinates: [anillo] },
});
const linea = (props, coords) => ({
  type: 'Feature',
  properties: props,
  geometry: { type: 'LineString', coordinates: coords },
});
const caja = (o, s, e, n) => [
  [o, s],
  [e, s],
  [e, n],
  [o, n],
  [o, s],
];

const calles = [];
for (let i = 0, lat = S + 0.004; lat < N; lat += 0.004, i++)
  calles.push(
    linea({ kind: i % 5 === 2 ? 'major_road' : 'minor_road', name: `Calle de Prueba ${i + 1}` }, [
      [O, lat],
      [COSTA, lat],
    ]),
  );
for (let i = 0, lng = O + 0.004; lng < COSTA; lng += 0.004, i++)
  calles.push(
    linea({ kind: i % 6 === 3 ? 'major_road' : 'minor_road', name: `Avenida de Prueba ${i + 1}` }, [
      [lng, S],
      [lng, N],
    ]),
  );

const capas = {
  earth: [poligono({ kind: 'earth' }, caja(O, S, COSTA, N))],
  water: [poligono({ kind: 'ocean' }, caja(COSTA, S, E, N))],
  landuse: [
    poligono({ kind: 'beach' }, caja(COSTA - 0.0015, S, COSTA, N)),
    poligono({ kind: 'park' }, caja(-57.546, -38.008, -57.541, -38.004)),
  ],
  roads: calles,
  places: [
    {
      type: 'Feature',
      properties: { kind: 'neighbourhood', name: 'Barrio de Prueba', min_zoom: 12 },
      geometry: { type: 'Point', coordinates: [-57.5426, -38.0055] },
    },
  ],
};

const indices = Object.fromEntries(
  Object.entries(capas).map(([nombre, features]) => [
    nombre,
    new GeoJSONVT(
      { type: 'FeatureCollection', features },
      { maxZoom: 15, indexMaxZoom: 15, buffer: 64 },
    ),
  ]),
);

const lng2x = (lng, z) => Math.floor(((lng + 180) / 360) * 2 ** z);
const lat2y = (lat, z) => {
  const r = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z);
};

const teselas = [];
for (const z of ZOOMS)
  for (let x = lng2x(O, z); x <= lng2x(E, z); x++)
    for (let y = lat2y(N, z); y <= lat2y(S, z); y++) {
      const porCapa = {};
      for (const [nombre, indice] of Object.entries(indices)) {
        const t = indice.getTile(z, x, y);
        if (t) porCapa[nombre] = t;
      }
      if (Object.keys(porCapa).length)
        teselas.push({
          id: zxyToTileId(z, x, y),
          datos: Buffer.from(vtpbf.fromGeojsonVt(porCapa, { version: 2 })),
        });
    }
teselas.sort((a, b) => a.id - b.id);

// ── PMTiles v3 sin compresión interna (especificación: github.com/protomaps/PMTiles/blob/main/spec/v3/spec.md) ──
const varint = (n, salida) => {
  while (n >= 0x80) {
    salida.push((n & 0x7f) | 0x80);
    n = Math.floor(n / 128);
  }
  salida.push(n);
};
let offset = 0;
const entradas = teselas.map((t) => {
  const e = { id: t.id, offset, largo: t.datos.length };
  offset += t.datos.length;
  return e;
});
const dir = [];
varint(entradas.length, dir);
let previo = 0;
for (const e of entradas) {
  varint(e.id - previo, dir);
  previo = e.id;
}
for (let i = 0; i < entradas.length; i++) varint(1, dir); // run length
for (const e of entradas) varint(e.largo, dir);
for (let i = 0; i < entradas.length; i++) {
  const e = entradas[i];
  const anterior = entradas[i - 1];
  varint(anterior && e.offset === anterior.offset + anterior.largo ? 0 : e.offset + 1, dir);
}
const directorio = Buffer.from(dir);
const metadatos = Buffer.from(
  JSON.stringify({
    name: 'Mapa de prueba (sintético)',
    description: 'Fixture de pruebas de handyx-client-fe. No representa ningún lugar real.',
    vector_layers: Object.keys(capas).map((id) => ({ id, fields: {} })),
  }),
);
const datos = Buffer.concat(teselas.map((t) => t.datos));

const h = Buffer.alloc(127);
h.write('PMTiles', 0, 'ascii');
h.writeUInt8(3, 7);
const u64 = (v, en) => h.writeBigUInt64LE(BigInt(v), en);
const raiz = 127;
u64(raiz, 8);
u64(directorio.length, 16);
u64(raiz + directorio.length, 24);
u64(metadatos.length, 32);
u64(raiz + directorio.length + metadatos.length, 40);
u64(0, 48);
u64(raiz + directorio.length + metadatos.length, 56);
u64(datos.length, 64);
u64(entradas.length, 72);
u64(entradas.length, 80);
u64(entradas.length, 88);
h.writeUInt8(1, 96); // clustered
h.writeUInt8(1, 97); // compresión interna: ninguna
h.writeUInt8(1, 98); // compresión de teselas: ninguna
h.writeUInt8(1, 99); // MVT
h.writeUInt8(ZOOMS[0], 100);
h.writeUInt8(ZOOMS.at(-1), 101);
const e7 = (v) => Math.round(v * 1e7);
h.writeInt32LE(e7(O), 102);
h.writeInt32LE(e7(S), 106);
h.writeInt32LE(e7(E), 110);
h.writeInt32LE(e7(N), 114);
h.writeUInt8(14, 118);
h.writeInt32LE(e7(-57.5426), 119);
h.writeInt32LE(e7(-38.0055), 123);

await writeFile(DESTINO, Buffer.concat([h, directorio, metadatos, datos]));
console.log(
  `${DESTINO}: ${teselas.length} teselas, ${((127 + directorio.length + metadatos.length + datos.length) / 1024) | 0} KB`,
);
