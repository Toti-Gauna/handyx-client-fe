// Recorrido solo con teclado (Fase 3 · lote 3.2). No corre en CI. Uso, con `npm run preview` activo:
//   node tests/e2e/teclado.cjs
const { chromium } = require('playwright');

const BASE = process.env.E2E_BASE || 'http://127.0.0.1:5176';
let fallas = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? '✔' : '✘'} ${msg}`);
  if (!cond) fallas++;
};
const enfocado = (p) =>
  p.evaluate(() => {
    const a = document.activeElement;
    return {
      tag: a?.tagName ?? '',
      texto: (a?.getAttribute('aria-label') || a?.textContent || '').trim().slice(0, 60),
      id: a?.id ?? '',
      contorno: a ? getComputedStyle(a).outlineStyle : 'none',
      invalido: a?.getAttribute('aria-invalid') === 'true',
    };
  });

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errores = [];
  p.on('pageerror', (e) => errores.push(e.message));

  // 1. Saltar al contenido: es lo primero después del rótulo de prueba y se ve al enfocarlo.
  await p.goto(BASE + '/ingresar/', { waitUntil: 'networkidle' });
  let f;
  for (let i = 0; i < 4; i++) {
    await p.keyboard.press('Tab');
    f = await enfocado(p);
    if (f.texto === 'Saltar al contenido') break;
  }
  ok(f.texto === 'Saltar al contenido', 'el enlace "Saltar al contenido" está entre los primeros focos');
  const visible = await p.evaluate(() => {
    const r = document.activeElement.getBoundingClientRect();
    return r.top >= 0 && r.bottom <= window.innerHeight;
  });
  ok(visible, 'el enlace se ve al recibir el foco');

  // 2. Enviar vacío: el foco va al primer campo inválido.
  await p.goto(BASE + '/ingresar/', { waitUntil: 'networkidle' });
  await p.getByRole('button', { name: 'Ingresar' }).focus();
  await p.keyboard.press('Enter');
  await p.waitForTimeout(300);
  f = await enfocado(p);
  ok(f.tag === 'INPUT' && f.invalido, `con errores, el foco va al primer campo inválido (${f.tag} ${f.id})`);

  // 3. Ingresar solo con teclado; al navegar, el foco va al h1 y el título de la pestaña cambia.
  await p.getByLabel('Email').fill('usuaria@example.test');
  await p.getByLabel('Contraseña').fill('handyx-demo-1234');
  await p.getByLabel('Contraseña').press('Enter');
  await p.waitForURL('**/inicio/**');
  await p.waitForTimeout(800);
  const entendido = p.getByRole('button', { name: 'Entendido' });
  if (await entendido.count()) {
    f = await enfocado(p);
    ok(f.tag === 'H2', `el modal de primer ingreso abre con el foco en su título (${f.tag})`);
    await entendido.first().focus();
    await p.keyboard.press('Enter');
    await p.waitForFunction(() => !document.querySelector('dialog[open]'));
  }
  ok((await p.title()).includes('Handyx') && (await p.title()) !== 'Handyx', `título de la pestaña: "${await p.title()}"`);

  // 4. Navegar por la barra con teclado y verificar el foco en el h1 nuevo.
  await p.getByRole('link', { name: 'Pedidos' }).focus();
  f = await enfocado(p);
  ok(f.contorno !== 'none', 'el foco en la barra es visible');
  await p.keyboard.press('Enter');
  await p.waitForURL('**/pedidos/**');
  await p.waitForTimeout(800);
  f = await enfocado(p);
  ok(f.tag === 'H1', `después de navegar el foco queda en el h1 (${f.tag} «${f.texto}»)`);

  // 5. Hoja de aceptar: abre con foco en el título; Enter no acepta; Escape cierra y devuelve el foco.
  await p.goto(BASE + '/pedidos/propuestas/?pedido=de000000-0000-4000-8000-000000001001&escenario=varias-propuestas', {
    waitUntil: 'networkidle',
  });
  await p.getByRole('link', { name: /Ver y responder/ }).first().click();
  await p.waitForURL('**/propuestas/detalle/**');
  await p.getByRole('button', { name: 'Aceptar', exact: true }).focus();
  await p.keyboard.press('Enter');
  await p.waitForTimeout(400);
  f = await enfocado(p);
  ok(f.tag === 'H2' && /Aceptar estas condiciones/.test(f.texto), `la hoja abre con el foco en el título (${f.tag} «${f.texto}»)`);
  await p.keyboard.press('Enter');
  await p.waitForTimeout(600);
  ok(p.url().includes('/propuestas/detalle/'), 'un Enter apurado no acepta la propuesta');
  await p.keyboard.press('Escape');
  await p.waitForTimeout(300);
  f = await enfocado(p);
  ok(f.texto === 'Aceptar', `Escape cierra la hoja y el foco vuelve a "Aceptar" («${f.texto}»)`);
  // El foco no sale de la hoja abierta (diálogo modal).
  await p.keyboard.press('Enter');
  await p.waitForTimeout(300);
  let fuera = false;
  for (let i = 0; i < 12; i++) {
    await p.keyboard.press('Tab');
    fuera ||= await p.evaluate(() => !document.activeElement?.closest('dialog[open]') && document.activeElement !== document.body);
  }
  ok(!fuera, 'con la hoja abierta, Tab no sale de la hoja');
  await p.keyboard.press('Escape');

  // 6. Movimiento reducido: transiciones anuladas.
  await p.emulateMedia({ reducedMotion: 'reduce' });
  const dur = await p.evaluate(() => getComputedStyle(document.querySelector('.boton')).transitionDuration);
  ok(dur.split(',').every((d) => parseFloat(d) <= 0.001), `con movimiento reducido las transiciones se anulan (${dur})`);

  ok(errores.length === 0, `sin errores de página${errores.length ? ': ' + errores.join(' | ') : ''}`);
  await b.close();
  console.log(fallas ? `${fallas} comprobación(es) fallaron` : 'Teclado OK');
  process.exitCode = fallas ? 1 : 0;
})();
