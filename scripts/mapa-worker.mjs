// Copia el worker de MapLibre a public/mapa/ (lo corren predev y prebuild). MapLibre 6 busca su worker al lado de su
// propio módulo, que al empaquetarlo Next deja de existir; la app le indica esta copia con setWorkerUrl. Con extensión
// .js para que cualquier hosting lo sirva como JavaScript (un módulo con otro tipo MIME no carga).
import { copyFile, mkdir, readFile } from 'node:fs/promises';

const { version } = JSON.parse(await readFile('node_modules/maplibre-gl/package.json', 'utf8'));
await mkdir('public/mapa', { recursive: true });
await copyFile(
  'node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs',
  'public/mapa/maplibre-gl-worker.js',
);
console.log(`Worker de MapLibre ${version} copiado a public/mapa/maplibre-gl-worker.js`);
