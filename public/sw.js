// Service worker de Handyx (Fase 3 · lote 3.3). Sin dependencias, sin build propio.
//
// Guarda SOLO archivos públicos y estáticos del mismo origen: páginas exportadas (que no traen datos: los datos llegan
// después, de la API), JS/CSS con hash, fuentes, imágenes e íconos.
// NUNCA guarda: llamadas a la API (otro origen), pedidos que no sean GET, respuestas con error ni nada con datos de una
// persona. Las acciones no se encolan ni se reintentan solas: sin conexión, fallan a la vista.
//
// Si cambia la lógica de este archivo, subir VERSION: el navegador instala el nuevo y borra los cachés viejos.
const VERSION = 'v2';
const CACHE_PAGINAS = `handyx-paginas-${VERSION}`;
const CACHE_ESTATICOS = `handyx-estaticos-${VERSION}`;
const MAX_ESTATICOS = 200;
// Pantalla sin conexión, íconos e ilustraciones de los estados (vacío, error, carga): livianas y sin datos.
const PRECARGA = [
  '/sin-conexion/',
  '/icono-app-192.png',
  '/icono-app-512.png',
  '/img/logo-handyx.webp',
  '/img/handys-grupo.webp',
  '/img/handy-cano.webp',
  '/img/handy-cano-roto.webp',
  '/img/handy-engranaje.webp',
  '/img/handy-engranaje-roto.webp',
  '/img/handy-gota.webp',
  '/img/handy-lamparita.webp',
  '/img/handy-lamparita-rota.webp',
  '/img/handy-llave.webp',
  '/img/handy-llave-rota.webp',
];

/** Archivos con hash que necesita una página (scripts y estilos de Next), sacados de su propio HTML. */
const recursosDe = (html) => [
  ...new Set(html.match(/\/_next\/static\/[\w./-]+\.(?:js|css|woff2)/g) ?? []),
];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    (async () => {
      const paginas = await caches.open(CACHE_PAGINAS);
      await paginas.addAll(PRECARGA);
      // La pantalla sin conexión tiene que poder abrirse sin red: también sus scripts y estilos.
      const html = await (await paginas.match('/sin-conexion/')).text();
      // De a uno: si alguno no está, la instalación sigue (la pantalla igual se ve, aunque sin estilos).
      const estaticos = await caches.open(CACHE_ESTATICOS);
      await Promise.allSettled(recursosDe(html).map((u) => estaticos.add(u)));
    })(),
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(
          claves
            .filter((k) => k.startsWith('handyx-') && k !== CACHE_PAGINAS && k !== CACHE_ESTATICOS)
            .map((k) => caches.delete(k)),
        ),
      ),
  );
});

const esEstatico = (url) =>
  url.pathname.startsWith('/_next/static/') ||
  url.pathname.startsWith('/img/') ||
  /\.(?:png|webp|svg|ico|woff2?)$/.test(url.pathname);

async function recortar(nombre) {
  const c = await caches.open(nombre);
  const claves = await c.keys();
  for (const k of claves.slice(0, Math.max(0, claves.length - MAX_ESTATICOS))) await c.delete(k);
}

/** Navegación: primero la red; sin red, la página guardada; si no está, /sin-conexion/. */
async function navegar(pedido) {
  const url = new URL(pedido.url);
  // Se guarda por ruta, sin la query (?id=...): el HTML exportado es el mismo y así no quedan ids en el caché.
  const clave = url.origin + url.pathname;
  try {
    const respuesta = await fetch(pedido);
    const html = respuesta.headers.get('content-type')?.includes('text/html');
    if (respuesta.ok && respuesta.type === 'basic' && html) {
      const copia = respuesta.clone();
      caches.open(CACHE_PAGINAS).then((c) => c.put(clave, copia));
    }
    return respuesta;
  } catch {
    const c = await caches.open(CACHE_PAGINAS);
    return (await c.match(clave)) ?? (await c.match('/sin-conexion/')) ?? Response.error();
  }
}

/** Estáticos: tienen hash o no cambian; primero el caché. */
async function estatico(pedido) {
  const guardada = await caches.match(pedido); // incluye lo precargado al instalar
  if (guardada) return guardada;
  const c = await caches.open(CACHE_ESTATICOS);
  const respuesta = await fetch(pedido);
  if (respuesta.ok && respuesta.type === 'basic') {
    await c.put(pedido, respuesta.clone());
    recortar(CACHE_ESTATICOS);
  }
  return respuesta;
}

self.addEventListener('fetch', (evento) => {
  const pedido = evento.request;
  if (pedido.method !== 'GET') return; // escrituras: siempre a la red, nunca al caché
  const url = new URL(pedido.url);
  if (url.origin !== self.location.origin) return; // la API y cualquier tercero: sin tocar
  if (pedido.mode === 'navigate') {
    evento.respondWith(navegar(pedido));
    return;
  }
  if (esEstatico(url)) evento.respondWith(estatico(pedido));
  // Todo lo demás del mismo origen (p. ej. datos RSC de Next) va a la red sin guardarse.
});
