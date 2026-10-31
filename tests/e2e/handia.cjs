// HandIA en un navegador real (vista de prueba, respuestas simuladas). No corre en CI. Uso, con `npm run preview`:
//   node tests/e2e/handia.cjs [carpeta-de-capturas]
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

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errores = [];
  p.on('pageerror', (e) => errores.push(e.message));

  // Desde Inicio: la tarjeta lleva a HandIA, que abre sin la barra de pestañas.
  await p.goto(BASE + '/inicio/?escenario=varias-propuestas', { waitUntil: 'networkidle' });
  const entendido = p.getByRole('button', { name: 'Entendido' });
  if (await entendido.count()) await entendido.first().click();
  await p.getByRole('link', { name: /Contale a HandIA/ }).click();
  await p.waitForURL('**/handia/**');
  await p.getByRole('heading', { name: /HandIA/ }).waitFor();
  ok((await p.getByRole('navigation', { name: 'Secciones' }).count()) === 0, 'HandIA abre a pantalla completa');
  await p.screenshot({ path: `${CARPETA}/handia-inicio.png` });

  // Un mensaje con teléfono: se tacha antes de enviar y se avisa.
  await p.getByLabel('Escribile a HandIA').fill('Pierde la canilla del baño, llamame al 223 155-123456');
  await p.getByRole('button', { name: 'Enviar a HandIA' }).click();
  await p.getByText(/Saqué teléfono del mensaje/).waitFor();
  ok(!(await p.getByText('155-123456').count()), 'el teléfono no queda en la conversación');
  await p.getByText('Rubro detectado: Plomería').waitFor({ timeout: 5000 });
  ok(true, 'sugiere Plomería');
  await p.screenshot({ path: `${CARPETA}/handia-detectado.png` });

  // La persona confirma, elige "para hoy" y el pedido llega armado (lo revisa antes de mandar).
  await p.getByRole('button', { name: 'Sí, es Plomería' }).click();
  await p.getByRole('button', { name: 'Pedir para hoy' }).click();
  await p.waitForURL('**/pedir/**');
  const url = new URL(p.url());
  ok(url.searchParams.get('rubro') === 'plomeria' && url.searchParams.get('tipo') === 'urgente', 'abre Pedir con rubro y tipo');
  ok(!/canilla|telefono|teléfono/i.test(decodeURIComponent(url.search)), 'el texto no viaja por la URL');
  // Avanza hasta "Qué pasa" y verifica la precarga.
  for (let i = 0; i < 4; i++) {
    const campo = p.getByRole('textbox', { name: /Contalo|Contanos|Qué pasa|qué pasó/i });
    if (await campo.count()) break;
    const seguir = p.getByRole('button', { name: 'Seguir' });
    if (!(await seguir.count())) break;
    await seguir.click();
    await p.waitForTimeout(300);
  }
  const valor = await p.locator('textarea').first().inputValue().catch(() => '');
  ok(/Pierde la canilla del baño/.test(valor) && !/155-123456/.test(valor), 'el pedido viene con lo que contó (sin el teléfono)');
  await p.screenshot({ path: `${CARPETA}/handia-pedido.png` });

  // Olor a gas: aviso de seguridad primero.
  await p.goto(BASE + '/handia/?escenario=varias-propuestas', { waitUntil: 'networkidle' });
  await p.getByLabel('Escribile a HandIA').fill('Hay olor a gas en la cocina');
  await p.getByRole('button', { name: 'Enviar a HandIA' }).click();
  await p.getByText(/si sentís olor a gas/).waitFor({ timeout: 5000 });
  ok(true, 'olor a gas: aviso de seguridad');

  // Sin pistas: no inventa, ofrece los rubros.
  await p.goto(BASE + '/handia/?escenario=varias-propuestas', { waitUntil: 'networkidle' });
  await p.getByLabel('Escribile a HandIA').fill('Quiero armar un mueble');
  await p.getByRole('button', { name: 'Enviar a HandIA' }).click();
  await p.getByText(/No me quedó claro/).waitFor({ timeout: 5000 });
  ok((await p.getByRole('group', { name: 'Elegí el rubro' }).getByRole('button').count()) === 6, 'sin pistas: ofrece los 6 rubros');

  ok(errores.length === 0, `sin errores de página${errores.length ? ': ' + errores.join(' | ') : ''}`);
  await b.close();
  console.log(fallas ? `${fallas} comprobación(es) fallaron` : 'HandIA OK');
  process.exitCode = fallas ? 1 : 0;
})();
