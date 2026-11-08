// Comparación lado a lado con la demo de la landing (lote 3.9). No corre en CI. Uso, con `npm run preview` activo y la
// demo construida (en Handy-landing-page-fe: `npm run build`, o `VITE_BASE=/ npm run build`):
//   LANDING_DIST=../Handy-landing-page-fe/dist node tests/e2e/comparar.cjs [carpeta]
// Por cada pantalla con su par en la demo (campo `demo` de src/mapa/pantallas.ts), deja una imagen con la demo a la
// izquierda y la app a la derecha (390 × 844, lo visible), más un índice README.md. Solo datos ficticios.
const { chromium } = require('playwright');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const CARPETA = process.argv[2] || 'docs/screens/comparacion';
const BASE = process.env.E2E_BASE || 'http://127.0.0.1:5176';
const DIST = path.resolve(process.env.LANDING_DIST || '../toti-gauna/Handy-landing-page-fe/dist');
const PUERTO_DEMO = 5177;
const P = 'de000000-0000-4000-8000-0000000010';
const E = (r, esc) => `${r}${r.includes('?') ? '&' : '?'}escenario=${esc}`;

if (!fs.existsSync(path.join(DIST, 'demo', 'index.html'))) {
  console.error(`No está la demo construida en ${DIST}. En Handy-landing-page-fe: VITE_BASE=/ npm run build`);
  process.exit(1);
}
fs.mkdirSync(CARPETA, { recursive: true });

const tocar = (rol, nombre) => async (p) => {
  await p.getByRole(rol, { name: nombre }).first().click();
  await p.waitForTimeout(600);
};

// [nombre, pantalla de la demo, ruta de la app, pasos?]: las pantallas centrales del recorrido del usuario.
const PARES = [
  ['inicio', 'u-inicio', E('/inicio/', 'varias-propuestas')],
  ['pedir-cuando', 'u-opciones', E('/pedir/?rubro=plomeria', 'varias-propuestas')],
  ['pedir-programar', 'u-programar', E('/pedir/?rubro=plomeria&tipo=programado', 'varias-propuestas')],
  ['buscando', 'u-buscando', E(`/pedidos/detalle/?id=${P}01`, 'sin-especialistas')],
  ['propuestas', 'u-presupuestos', E(`/pedidos/propuestas/?pedido=${P}01`, 'varias-propuestas')],
  ['perfil-especialista', 'u-perfil', E(`/propuestas/detalle/?id=${P}03`, 'varias-propuestas')],
  ['confirmar-turno', 'u-confirmar', E(`/propuestas/detalle/?id=${P}03&elegir=1`, 'varias-propuestas')],
  ['seguimiento', 'u-seguimiento', E('/pedidos/', 'obra-por-etapas'), [tocar('link', /Especialista 3/)]],
  ['terminado', 'u-terminado', E(`/trabajos/detalle/?id=${P}05`, 'efectivo-reportado')],
  ['resena', 'u-resena', E(`/trabajos/resena/?id=${P}05`, 'efectivo-reportado')],
  ['actividad', 'u-turnos', E('/agenda/', 'programado')],
  ['mensajes', 'u-mensajes', E('/chats/', 'contrapropuesta')],
  ['chat', 'u-chat', E(`/chats/conversacion/?id=${P}02`, 'contrapropuesta')],
  ['soporte', 'u-soporte', E('/soporte/', 'contrapropuesta')],
  ['avisos', 'u-notificaciones', E('/notificaciones/', 'varias-propuestas')],
  ['cuenta', 'u-cuenta', E('/cuenta/', 'varias-propuestas')],
  ['datos', 'u-datos', E('/cuenta/datos/', 'varias-propuestas')],
  ['pagos', 'u-pagos', E('/cuenta/pagos/', 'efectivo-reportado')],
  ['ayuda', 'u-ayuda', E('/ayuda/', 'varias-propuestas')],
  ['ayuda-respuesta', 'u-ayuda-detalle', E('/ayuda/respuesta/?p=cancelar', 'varias-propuestas')],
];

/** Servidor estático mínimo para la demo construida (solo lectura, solo localhost). */
function servirDemo() {
  const TIPOS = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.json': 'application/json',
    '.webmanifest': 'application/manifest+json',
  };
  return http
    .createServer((q, r) => {
      let f = path.join(DIST, decodeURIComponent(q.url.split('?')[0]));
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
      if (!f.startsWith(DIST) || !fs.existsSync(f)) {
        r.writeHead(404);
        r.end();
        return;
      }
      r.writeHead(200, { 'content-type': TIPOS[path.extname(f)] ?? 'application/octet-stream' });
      fs.createReadStream(f).pipe(r);
    })
    .listen(PUERTO_DEMO, '127.0.0.1');
}

/** Deja visible solo la pantalla `id` de la demo (sin guía, dedo ni animaciones) y devuelve su captura. */
async function capturarDemo(p, id) {
  await p.evaluate((id) => {
    document.querySelectorAll('[data-pantalla]').forEach((el) => {
      el.hidden = el.dataset.pantalla !== id;
      el.style.zIndex = el.dataset.pantalla === id ? '2' : '';
      el.style.transform = '';
    });
    document.querySelectorAll('[data-demo-dedo], [data-demo-isla]').forEach((el) => (el.hidden = true));
  }, id);
  await p.waitForTimeout(700);
  const cont = p.locator('[data-demo-pantallas]');
  return cont.screenshot({ type: 'png', animations: 'disabled' });
}

(async () => {
  const servidor = servirDemo();
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const demo = await ctx.newPage();
  await demo.goto(`http://127.0.0.1:${PUERTO_DEMO}/demo/?app=1`, { waitUntil: 'networkidle' });
  await demo.waitForTimeout(1200);
  const app = await ctx.newPage();
  const lienzo = await ctx.newPage();
  const filas = [];
  let fallas = 0;
  for (const [nombre, idDemo, ruta, pasos = []] of PARES) {
    try {
      const izq = await capturarDemo(demo, idDemo);
      await app.goto(BASE + ruta, { waitUntil: 'networkidle' });
      for (const paso of pasos) await paso(app);
      await app
        .waitForFunction(() => !document.querySelector('.esqueleto'), null, { timeout: 8000 })
        .catch(() => undefined);
      await app.waitForTimeout(600);
      const der = await app.screenshot({ type: 'png' });
      const img = (buf) => `data:image/png;base64,${buf.toString('base64')}`;
      await lienzo.setViewportSize({ width: 820, height: 900 });
      await lienzo.setContent(`<!doctype html><html><body style="margin:0;background:#eef1f6;font:600 14px system-ui">
        <div style="display:flex;gap:16px;padding:12px 12px 8px">
          <figure style="margin:0;width:390px"><figcaption style="padding:0 0 6px">Demo · ${idDemo}</figcaption>
            <img src="${img(izq)}" style="width:390px;height:844px;object-fit:contain;object-position:top;background:#fff;border-radius:12px"></figure>
          <figure style="margin:0;width:390px"><figcaption style="padding:0 0 6px">App · ${ruta.split('?')[0]}</figcaption>
            <img src="${img(der)}" style="width:390px;height:844px;background:#fff;border-radius:12px"></figure>
        </div></body></html>`);
      await lienzo.waitForTimeout(150);
      const archivo = `${nombre}.jpg`;
      await lienzo.screenshot({ path: path.join(CARPETA, archivo), type: 'jpeg', quality: 70 });
      filas.push({ nombre, idDemo, ruta: ruta.split('?')[0], archivo });
      console.log(`✔ ${archivo}`);
    } catch (e) {
      fallas++;
      console.log(`✘ ${nombre}: ${e.message.split('\n')[0]}`);
    }
  }
  await b.close();
  servidor.close();
  const lineas = [
    '# Comparación lado a lado con la demo',
    '',
    'Generado con `node tests/e2e/comparar.cjs` (demo de la landing a la izquierda, app a la derecha; 390 × 844, lo',
    'visible). Las diferencias de contenido son a propósito: la app muestra datos del servidor (aquí, ficticios) y las',
    'adaptaciones obligatorias de `docs/rediseno.md` (tarifa 0 %, pago directo, sin tarjetas, verificaciones reales).',
    '',
    '| Pantalla | Demo | App | Imagen |',
    '| --- | --- | --- | --- |',
    ...filas.map((f) => `| ${f.nombre} | \`${f.idDemo}\` | \`${f.ruta}\` | [${f.archivo}](${f.archivo}) |`),
    '',
  ];
  fs.writeFileSync(path.join(CARPETA, 'README.md'), lineas.join('\n'));
  console.log(fallas ? `${fallas} comparación(es) fallaron` : `Comparación OK: ${filas.length}`);
  process.exitCode = fallas ? 1 : 0;
})();
