// PWA y sin conexión en un navegador real (Fase 3 · lote 3.3). No corre en CI. Uso, con `npm run preview` activo:
//   node tests/e2e/pwa.cjs [carpeta-de-capturas]
const { chromium } = require('playwright');
const fs = require('node:fs');

const CARPETA = process.argv[2] || 'capturas-e2e';
const BASE = process.env.E2E_BASE || 'http://127.0.0.1:5176';
fs.mkdirSync(CARPETA, { recursive: true });
let fallas = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? '✔' : '✘'} ${msg}`);
  if (!cond) fallas++;
};
const PROP = '/propuestas/detalle/?id=de000000-0000-4000-8000-000000001003&escenario=varias-propuestas';

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  const errores = [];
  p.on('pageerror', (e) => errores.push(e.message));

  // 1. Manifest, íconos e instalabilidad según Chromium.
  await p.goto(BASE + '/inicio/?escenario=varias-propuestas', { waitUntil: 'networkidle' });
  const manifest = await (await p.request.get(BASE + '/manifest.webmanifest')).json();
  ok(manifest.display === 'standalone' && manifest.start_url === '/inicio/', 'manifest: standalone, empieza en /inicio/');
  ok(manifest.theme_color === '#1f57a8' && manifest.lang === 'es-AR', 'manifest: color de marca y es-AR');
  for (const i of manifest.icons) {
    const r = await p.request.get(BASE + i.src);
    ok(r.ok() && r.headers()['content-type'].includes('image/png'), `ícono ${i.src} (${i.purpose}) responde`);
  }
  await p.evaluate(() => navigator.serviceWorker.ready);
  ok(await p.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.active?.state === 'activated'), 'service worker registrado y activo');
  await p.reload({ waitUntil: 'networkidle' });
  ok(await p.evaluate(() => !!navigator.serviceWorker.controller), 'la página queda controlada por el service worker');
  const cdp = await ctx.newCDPSession(p);
  const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
  ok(installabilityErrors.length === 0, `instalable según Chromium${installabilityErrors.length ? ': ' + JSON.stringify(installabilityErrors) : ''}`);

  // Visitar pantallas para que queden guardadas (la propuesta, con su query, para comprobar que no se guarda el id).
  for (const r of ['/pedidos/?escenario=varias-propuestas', PROP]) {
    await p.goto(BASE + r, { waitUntil: 'networkidle' });
  }

  // 2. Qué hay en el caché: solo archivos del mismo origen, sin query strings (ids) ni respuestas de API.
  const claves = await p.evaluate(async () => {
    const todo = [];
    for (const n of await caches.keys()) for (const k of await (await caches.open(n)).keys()) todo.push(k.url);
    return todo;
  });
  ok(claves.length > 0, `el caché tiene ${claves.length} archivos`);
  ok(claves.every((u) => u.startsWith(BASE)), 'todo lo guardado es del mismo origen');
  ok(claves.every((u) => !new URL(u).search), 'nada guardado lleva query (ningún id de pedido o propuesta)');
  ok(claves.every((u) => !/\/v1\//.test(u)), 'ninguna respuesta de la API en el caché');

  // 3. Sin conexión: aceptar en una pantalla ya abierta falla a la vista y no crea nada.
  await p.goto(BASE + PROP, { waitUntil: 'networkidle' });
  await p.getByRole('button', { name: 'Aceptar', exact: true }).waitFor({ timeout: 10000 });
  await ctx.setOffline(true);
  await p.getByText('Sin conexión.').waitFor();
  ok(true, 'aparece el aviso "Sin conexión"');
  await p.getByRole('button', { name: 'Aceptar', exact: true }).click();
  await p.getByRole('button', { name: 'Sí, acepto estas condiciones' }).click();
  await p.waitForTimeout(800);
  ok(p.url().includes('/propuestas/detalle/'), 'sin conexión, aceptar no navega al trabajo');
  const textoPantalla = await p.locator('main').innerText();
  ok(/No se pudo[\s\S]*(conexi|red)/i.test(textoPantalla), 'se muestra el error de conexión, sin confirmar nada');
  await p.screenshot({ path: `${CARPETA}/pwa-aceptar-sin-conexion.png` });
  await ctx.setOffline(false);
  await p.waitForTimeout(600);
  // Sigue pendiente: la decisión (Aceptar) sigue disponible y no hay trabajo creado.
  await p.getByRole('button', { name: 'Volver' }).first().click().catch(() => {});
  await p.waitForTimeout(3500);
  ok(
    p.url().includes('/propuestas/detalle/') &&
      (await p.getByRole('button', { name: 'Aceptar', exact: true }).count()) === 1,
    'al volver la conexión la propuesta sigue pendiente (no se aceptó)',
  );

  // 4. Chat sin conexión: el mensaje queda "No se envió" con reintento, nunca como enviado.
  await p.goto(BASE + '/chats/conversacion/?id=de000000-0000-4000-8000-000000001002&escenario=contrapropuesta', { waitUntil: 'networkidle' });
  // Primero que la conversación termine de cargar (la vista de prueba simula la demora de la red).
  await p.getByRole('textbox', { name: 'Mensaje' }).waitFor({ timeout: 10000 });
  await ctx.setOffline(true);
  await p.getByRole('textbox', { name: 'Mensaje' }).fill('Hola, ¿mañana podés?');
  await p.getByRole('button', { name: 'Enviar el mensaje' }).click();
  await p.getByText('No se envió').waitFor({ timeout: 5000 });
  ok(true, 'mensaje sin conexión: "No se envió" con Reintentar');
  await p.screenshot({ path: `${CARPETA}/pwa-chat-sin-conexion.png` });

  // 5. Navegar sin conexión: pantalla guardada se abre (sus datos fallan a la vista); no guardada → /sin-conexion/.
  // Página nueva sin conexión (pestaña nueva: Playwright no siempre mantiene la emulación entre documentos).
  const p2 = await ctx.newPage();
  await p2.goto(BASE + '/pedidos/?escenario=varias-propuestas').catch(() => undefined);
  await p2.waitForTimeout(1200);
  ok(await p2.evaluate(() => navigator.onLine === false), 'la pestaña nueva se abre sin conexión (desde el caché)');
  const guardada = await p2.locator('body').innerText();
  ok(/No pudimos cargarlo|conexión/i.test(guardada), 'pantalla guardada sin conexión: muestra el error, no datos inventados');
  ok(await p2.locator('img.estado__handy').evaluate((i) => i.complete && i.naturalWidth > 0), 'la ilustración del estado de error se ve sin conexión');
  await p2.screenshot({ path: `${CARPETA}/pwa-pantalla-guardada-sin-conexion.png` });
  await p2.close();
  await p.goto(BASE + '/ayuda/').catch(() => undefined);
  await p.waitForTimeout(800);
  ok(await p.getByRole('heading', { name: 'Estás sin conexión' }).isVisible(), 'pantalla no guardada sin conexión: /sin-conexion/');
  await p.screenshot({ path: `${CARPETA}/pwa-sin-conexion.png` });
  await ctx.setOffline(false);

  // 6. Pantalla de carga: con ?splash=1 se ve, se oculta sola en menos de 3 s y un toque la saltea.
  await p.goto(BASE + '/inicio/?escenario=varias-propuestas&splash=1');
  await p.locator('.splash').waitFor();
  ok(await p.locator('.splash__handy').count() === 5, 'la pantalla de carga muestra los 5 Handys');
  await p.waitForTimeout(3500);
  ok((await p.locator('.splash').evaluate((e) => getComputedStyle(e).visibility)) === 'hidden', 'se oculta sola');
  await p.goto(BASE + '/inicio/?escenario=varias-propuestas&splash=1');
  await p.locator('.splash').waitFor();
  await p.waitForTimeout(400);
  await p.mouse.click(200, 400);
  await p.waitForTimeout(300);
  ok((await p.locator('.splash').evaluate((e) => getComputedStyle(e).visibility)) === 'hidden', 'un toque la saltea');
  await p.goto(BASE + '/inicio/?escenario=varias-propuestas');
  ok(!(await p.locator('.splash').isVisible()), 'en navegadores automatizados no aparece (salvo ?splash=1)');

  // 7. Movimiento reducido: animaciones anuladas.
  await p.emulateMedia({ reducedMotion: 'reduce' });
  await p.goto(BASE + '/inicio/?escenario=varias-propuestas', { waitUntil: 'networkidle' });
  const dur = await p.evaluate(() => getComputedStyle(document.querySelector('.hx-cuerpo > *')).animationDuration);
  ok(parseFloat(dur) <= 0.001, `con movimiento reducido no hay animaciones (${dur})`);

  const reales = errores.filter((e) => !/Failed to fetch|NetworkError|ERR_INTERNET_DISCONNECTED|Load failed/i.test(e));
  ok(reales.length === 0, `sin errores de página${reales.length ? ': ' + reales.join(' | ') : ''}`);
  await b.close();
  console.log(fallas ? `${fallas} comprobación(es) fallaron` : 'PWA OK');
  process.exitCode = fallas ? 1 : 0;
})();
