// Mapa en un navegador real (lote 3.3). No corre en CI. Uso, con `npm run preview`:
//   node tests/e2e/mapa.cjs [carpeta-de-capturas]
// 1. Sin el archivo del mapa (lo normal en desarrollo): el mapa ilustrado, rotulado, sin pedir nada que no existe.
// 2. Con el mapa SINTÉTICO de tests/fixtures (servido en lugar de /mapa/mdp.pmtiles, con lecturas por rango):
//    MapLibre dibuja con el estilo Handyx, el pin elige un punto al mover el mapa, el pedido que busca muestra el pulso.
const { chromium } = require('playwright');
const fs = require('node:fs');

const CARPETA = process.argv[2] || 'capturas-e2e';
const BASE = process.env.E2E_BASE || 'http://127.0.0.1:5176';
const FIXTURE = fs.readFileSync('tests/fixtures/mapa-prueba.pmtiles');
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
fs.mkdirSync(CARPETA, { recursive: true });
let fallas = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? '✔' : '✘'} ${msg}`);
  if (!cond) fallas++;
};

async function conMapaDePrueba(p) {
  await p.addInitScript(() => {
    window.__hxMapaPrueba = true;
  });
  await p.route('**/mapa/mdp.pmtiles', (r) => {
    const m = /bytes=(\d+)-(\d+)/.exec(r.request().headers().range || '');
    if (!m) return r.fulfill({ status: 200, body: FIXTURE, headers: { 'content-type': 'application/octet-stream' } });
    const a = Number(m[1]);
    const b = Math.min(Number(m[2]), FIXTURE.length - 1);
    return r.fulfill({
      status: 206,
      body: FIXTURE.subarray(a, b + 1),
      headers: {
        'content-type': 'application/octet-stream',
        'content-range': `bytes ${a}-${b}/${FIXTURE.length}`,
        'accept-ranges': 'bytes',
      },
    });
  });
}

async function pagina(b, conDatos) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errores = [];
  p.on('pageerror', (e) => errores.push(e.message));
  p.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
  if (conDatos) await conMapaDePrueba(p);
  return { p, errores };
}

async function axe(p, etiqueta) {
  await p.addScriptTag({ content: AXE });
  const v = await p.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const r = await axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] },
    });
    return r.violations.map((x) => `${x.id}: ${x.nodes.map((n) => n.target.join(' ')).slice(0, 2).join(' | ')}`);
  });
  ok(v.length === 0, `${etiqueta}: sin fallas de axe${v.length ? ' → ' + v.join(' ; ') : ''}`);
}

/** Desde /perfil/ (escenario con el perfil completo) hasta el paso de la dirección, escribiéndola a mano. */
async function irADireccion(p) {
  await p.goto(BASE + '/perfil/?escenario=ubicacion-denegada', { waitUntil: 'networkidle' });
  await p.getByRole('button', { name: 'Seguir' }).click();
  await p.getByRole('button', { name: 'Seguir' }).click();
  await p.getByRole('button', { name: 'Escribirla a mano' }).click();
  await p.getByLabel('Dirección').waitFor();
}

(async () => {
  const b = await chromium.launch();

  // 1. Sin datos: ilustrado y rotulado, sin pedidos fallidos.
  {
    const { p, errores } = await pagina(b, false);
    const pedidos = [];
    p.on('request', (r) => r.url().includes('/mapa/') && pedidos.push(r.url()));
    await p.goto(BASE + '/diseno/', { waitUntil: 'networkidle' });
    await p.locator('.mapa-hx--ilustrado').first().waitFor();
    ok((await p.getByText('Mapa ilustrativo').count()) === 2, 'sin datos: mapa ilustrado y rotulado');
    await irADireccion(p);
    await p.getByText('El mapa no está disponible ahora').waitFor();
    ok(true, 'sin datos: el paso de la dirección pide escribirla');
    await p.screenshot({ path: `${CARPETA}/mapa-ilustrado-direccion.png` });
    ok(pedidos.length === 0, `sin datos: no se pide el archivo del mapa (${pedidos.length})`);
    ok(errores.length === 0, `sin datos: sin errores${errores.length ? ': ' + errores.join(' | ') : ''}`);
    await p.close();
  }

  // 2. Con el mapa sintético: elegir la dirección moviendo el mapa.
  {
    const { p, errores } = await pagina(b, true);
    await irADireccion(p);
    const mapa = p.locator('.mapa-hx--elegir');
    await p.locator('.mapa-hx--vivo').waitFor({ timeout: 15000 });
    ok(true, 'con datos: MapLibre dibuja el mapa');
    ok((await p.getByRole('link', { name: 'OpenStreetMap' }).count()) === 1, 'atribución de OpenStreetMap visible');
    await p.waitForTimeout(800);
    const caja = await mapa.boundingBox();
    await p.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await p.mouse.down();
    await p.mouse.move(caja.x + caja.width / 2 - 60, caja.y + caja.height / 2 - 40, { steps: 8 });
    await p.mouse.up();
    await p.getByText(/Estás cerca de Barrio de Prueba/).waitFor({ timeout: 8000 });
    ok(true, 'mover el mapa elige un punto y dice el barrio cercano');
    await p.screenshot({ path: `${CARPETA}/mapa-elegir-direccion.png` });
    await axe(p, 'paso de la dirección con mapa');
    await p.getByLabel('Dirección').fill('Calle Ficticia 55');
    await p.getByRole('button', { name: /^(Terminar|Seguir)$/ }).click();
    const ahoraNo = p.getByRole('button', { name: 'Ahora no' });
    await Promise.race([
      p.waitForURL('**/inicio/**').catch(() => {}),
      ahoraNo.waitFor().catch(() => {}),
    ]);
    if (await ahoraNo.count()) await ahoraNo.click();
    await p.waitForURL('**/inicio/**', { timeout: 8000 }).catch(async () => {
      await p.screenshot({ path: `${CARPETA}/mapa-guardar-fallo.png` });
      console.log(await p.locator('main').innerText());
    });
    ok(p.url().includes('/inicio/'), 'la dirección con el punto del mapa se guarda');
    ok(errores.length === 0, `con datos: sin errores${errores.length ? ': ' + errores.join(' | ') : ''}`);
    await p.close();
  }

  // 3. Con el mapa sintético: el pedido que busca especialistas muestra tu casa con el pulso.
  {
    const { p, errores } = await pagina(b, true);
    await p.goto(BASE + '/pedidos/?escenario=sin-especialistas', { waitUntil: 'networkidle' });
    const entendido = p.getByRole('button', { name: 'Entendido' });
    if (await entendido.count()) await entendido.first().click();
    await p.locator('main a[href*="/pedidos/detalle/"]').first().click();
    await p.locator('.mapa-hx--vivo .mapa-hx__casa--pulso').waitFor({ timeout: 15000 });
    ok(true, 'pedido buscando: mapa con tu casa y el pulso');
    ok(
      (await p.locator('.mapa-hx--ver .maplibregl-canvas[tabindex="0"]').count()) === 0,
      'el mapa de solo ver no toma el foco',
    );
    await p.waitForTimeout(800);
    await p.screenshot({ path: `${CARPETA}/mapa-buscando.png` });
    await axe(p, 'pedido buscando con mapa');
    ok(errores.length === 0, `buscando: sin errores${errores.length ? ': ' + errores.join(' | ') : ''}`);
    await p.close();
  }

  await b.close();
  console.log(fallas ? `${fallas} comprobación(es) fallaron` : 'Mapa OK');
  process.exitCode = fallas ? 1 : 0;
})();
