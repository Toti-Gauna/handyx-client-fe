// Pulido premium (lote 3.9) en un navegador real: transiciones de pantalla, gestos de las hojas, título que se compacta,
// versión nueva y pantallas del sistema. No corre en CI. Uso, con `npm run preview` activo:
//   node tests/e2e/pulido.cjs [carpeta-de-capturas]
const { chromium } = require('playwright');
const fs = require('node:fs');

const BASE = process.env.E2E_BASE || 'http://127.0.0.1:5176';
const CARPETA = process.argv[2] || 'capturas-pulido';
fs.mkdirSync(CARPETA, { recursive: true });
let fallas = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? '✔' : '✘'} ${msg}`);
  if (!cond) fallas++;
};
const contarTransiciones = (p) =>
  p.evaluate(() => {
    window.__vt = 0;
    const original = document.startViewTransition?.bind(document);
    if (original)
      document.startViewTransition = (cb) => {
        window.__vt++;
        return original(cb);
      };
  });

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  p.setDefaultTimeout(8000);
  const errores = [];
  p.on('pageerror', (e) => errores.push(e.message));
  p.on('console', (m) => {
    if (m.type() === 'error' && !/status of (4\d\d|5\d\d)/.test(m.text())) errores.push(m.text());
  });

  // 1. Transición compartida: la tarjeta de la lista se abre en el detalle, sin demorar la navegación.
  await p.goto(BASE + '/pedidos/?escenario=obra-por-etapas', { waitUntil: 'networkidle' });
  await contarTransiciones(p);
  const t0 = Date.now();
  await p.getByRole('link', { name: /Especialista 3/ }).first().click();
  await p.locator('.du-hoja-hx').waitFor();
  ok((await p.evaluate(() => window.__vt)) === 1, 'tocar una tarjeta navega con transición');
  ok(Date.now() - t0 < 3000, `la pantalla nueva aparece sin demora (${Date.now() - t0} ms)`);
  await p
    .waitForFunction(() => !document.documentElement.classList.contains('vt-entrando'), null, {
      timeout: 3000,
    })
    .catch(() => undefined);
  ok(
    !(await p.evaluate(() => document.documentElement.classList.contains('vt-entrando'))),
    'la transición termina y no deja marcas',
  );

  // 2. Hoja azul: tres alturas con toque, arrastre y flechas.
  const hoja = p.locator('.du-hoja-hx');
  const manija = p.locator('.du-manija-hx');
  const altura = () => hoja.getAttribute('data-altura');
  ok((await altura()) === 'media', 'la hoja arranca a medio abrir');
  const alto0 = (await hoja.boundingBox()).height;
  await manija.click();
  await p.waitForTimeout(450);
  ok((await altura()) === 'alta' && (await hoja.boundingBox()).height > alto0, 'un toque la agranda');
  const mb = await manija.boundingBox();
  await p.mouse.move(mb.x + mb.width / 2, mb.y + mb.height / 2);
  await p.mouse.down();
  await p.mouse.move(mb.x + mb.width / 2, mb.y + 220, { steps: 8 });
  await p.mouse.up();
  await p.waitForTimeout(450);
  ok((await altura()) === 'media', 'arrastrarla hacia abajo la achica un paso');
  await manija.focus();
  await p.keyboard.press('ArrowDown');
  await p.waitForTimeout(450);
  ok((await altura()) === 'baja' && (await hoja.boundingBox()).height < alto0, 'con la flecha abajo queda achicada');
  await p.screenshot({ path: `${CARPETA}/hoja-achicada.jpg`, type: 'jpeg', quality: 72 });
  await p.keyboard.press('ArrowUp');
  ok((await altura()) === 'media', 'con la flecha arriba vuelve');
  const nombre = await manija.getAttribute('aria-label');
  ok(/Tamaño de la hoja/.test(nombre ?? ''), 'la manija es un botón con nombre');
  ok((await manija.boundingBox()).height >= 44, 'la manija mide al menos 44 px de alto');

  // 3. Hoja de diálogo: bajarla desde la manija la cierra.
  await p.goto(BASE + '/propuestas/detalle/?id=de000000-0000-4000-8000-000000001003&escenario=varias-propuestas', {
    waitUntil: 'networkidle',
  });
  await p.getByRole('button', { name: 'Rechazar', exact: true }).click();
  const dialogo = p.locator('dialog.hoja[open]');
  await dialogo.waitFor();
  await p.waitForTimeout(600); // que termine de subir
  const m2 = await p.locator('dialog[open] .hoja__manija').boundingBox();
  await p.mouse.move(m2.x + m2.width / 2, m2.y + m2.height / 2);
  await p.mouse.down();
  for (let i = 1; i <= 8; i++) await p.mouse.move(m2.x + m2.width / 2, m2.y + m2.height / 2 + i * 30);
  await p.mouse.up();
  await p.waitForTimeout(400);
  ok((await dialogo.count()) === 0, 'deslizar la hoja hacia abajo la cierra (sin rechazar nada)');
  ok(
    (await p.getByRole('button', { name: 'Aceptar', exact: true }).count()) > 0,
    'la propuesta sigue pendiente después de cerrar la hoja',
  );

  // 4. Título grande de Actividad que se compacta al bajar.
  await p.setViewportSize({ width: 390, height: 560 });
  await p.goto(BASE + '/pedidos/?escenario=varias-propuestas', { waitUntil: 'networkidle' });
  const tam = () => p.locator('.du-actividad__cabeza h1').evaluate((h) => parseFloat(getComputedStyle(h).fontSize));
  const antes = await tam();
  await p.getByRole('tab', { name: 'Agenda' }).click();
  await p.locator('.pantalla__scroll').evaluate((s) => s.scrollTo(0, 400));
  await p.waitForTimeout(300);
  const despues = await tam();
  ok(despues < antes, `el título se compacta al bajar (${antes} → ${despues} px)`);
  await p.setViewportSize({ width: 390, height: 844 });

  // 5. Versión nueva: se avisa, no recarga sola, "Después" la oculta.
  await p.goto(BASE + '/inicio/?escenario=varias-propuestas', { waitUntil: 'networkidle' });
  await p.getByRole('button', { name: 'Panel de prueba' }).click();
  await p.getByRole('button', { name: 'Simular versión nueva' }).click();
  await p.getByText('Hay una versión nueva de Handyx.').waitFor();
  await p.screenshot({ path: `${CARPETA}/version-nueva.jpg`, type: 'jpeg', quality: 72 });
  const url = p.url();
  await p.waitForTimeout(1500);
  ok(p.url() === url, 'no se recarga sola');
  await p.getByRole('button', { name: 'Después' }).click();
  ok((await p.getByText('Hay una versión nueva de Handyx.').count()) === 0, '"Después" la oculta');

  // 6. Pantallas del sistema.
  await p.goto(BASE + '/no-existe/');
  ok(await p.getByRole('heading', { name: 'No encontramos esta página' }).isVisible(), '404 en el kit');
  ok(await p.getByRole('link', { name: 'Volver al inicio' }).isVisible(), '404 con salida al inicio');
  await p.goto(BASE + '/sin-conexion/');
  ok(await p.getByRole('heading', { name: 'Estás sin conexión' }).isVisible(), 'sin conexión en el kit');

  // 7. Con "reducir movimiento" no hay transiciones.
  const quieto = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const q = await quieto.newPage();
  await q.goto(BASE + '/pedidos/?escenario=obra-por-etapas', { waitUntil: 'networkidle' });
  await contarTransiciones(q);
  await q.getByRole('link', { name: /Especialista 3/ }).first().click();
  await q.locator('.du-hoja-hx').waitFor();
  ok((await q.evaluate(() => window.__vt)) === 0, 'con movimiento reducido se navega sin transición');

  ok(errores.length === 0, `sin errores de página${errores.length ? ': ' + errores.join(' | ') : ''}`);
  await b.close();
  if (fallas) {
    console.log(`${fallas} falla(s)`);
    process.exit(1);
  }
  console.log('Pulido OK');
})();
