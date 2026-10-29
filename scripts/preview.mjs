// Sirve out/ como lo haría Hostinger (carpetas con index.html, sin rewrites) para probar el export estático.
// Solo local: 127.0.0.1. Uso: npm run build && npm run preview [-- --port 5176]
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';

const raiz = resolve('out');
const indice = process.argv.indexOf('--port');
const puerto = indice > -1 ? Number(process.argv[indice + 1]) : 5176;
const tipos = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
};

function archivo(ruta) {
  const destino = normalize(join(raiz, decodeURIComponent(ruta)));
  if (!destino.startsWith(raiz)) return null;
  try {
    const info = statSync(destino);
    if (info.isFile()) return destino;
    if (info.isDirectory()) {
      const index = join(destino, 'index.html');
      if (statSync(index).isFile()) return index;
    }
  } catch {
    return null;
  }
  return null;
}

createServer((req, res) => {
  const ruta = new URL(req.url ?? '/', 'http://localhost').pathname;
  const encontrado = archivo(ruta);
  const destino = encontrado ?? join(raiz, '404.html');
  res.writeHead(encontrado ? 200 : 404, {
    'Content-Type': tipos[extname(destino)] ?? 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  createReadStream(destino).pipe(res);
}).listen(puerto, '127.0.0.1', () =>
  console.log(`Preview estático en http://127.0.0.1:${puerto}/`),
);
