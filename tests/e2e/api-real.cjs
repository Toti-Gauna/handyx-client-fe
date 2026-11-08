// Humo contra la API REAL (lote 4.7d). No corre en CI ni en `npm run e2e`: necesita un handyx-client-be propio
// levantado (local con la base aislada de pruebas, o staging autorizado) y un build de la PWA apuntando a él.
//   NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3100 npm run build && npm run preview
//   INVITACION=<código de `npm run invitacion` del BE> node tests/e2e/api-real.cjs [carpeta]
// Comprueba: sin rótulo de vista de prueba ni panel; contrato compatible (sin aviso); registro con invitación real,
// sesión con cookie HttpOnly del BE (nada en el almacenamiento del navegador); un contrato distinto muestra el aviso.
// Datos SINTÉTICOS (email *@example.test con sufijo aleatorio). Nunca contra producción con datos reales.
const { chromium } = require('playwright');
const fs = require('node:fs');

const CARPETA = process.argv[2] || 'capturas-api';
const BASE = process.env.E2E_BASE || 'http://127.0.0.1:5176';
const INVITACION = process.env.INVITACION;
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
  const api = [];
  p.on('request', (r) => {
    const u = new URL(r.url());
    if (u.pathname.startsWith('/v1/') && u.origin !== new URL(BASE).origin) api.push(u.pathname);
  });

  await p.goto(BASE + '/', { waitUntil: 'networkidle' });
  ok((await p.getByText('Vista de prueba').count()) === 0, 'sin rótulo de vista de prueba (cliente HTTP)');
  ok((await p.getByRole('button', { name: 'Panel de prueba' }).count()) === 0, 'sin panel de prueba');
  ok(api.includes('/v1/version'), 'pregunta la versión del contrato a la API');
  ok((await p.getByText('Handyx se está actualizando').count()) === 0, 'contrato compatible: sin aviso');

  if (!INVITACION) console.log('! sin INVITACION: se salta el registro');
  else {
    const email = `humo-${Date.now().toString(36)}@example.test`;
    await p.goto(BASE + '/registro/', { waitUntil: 'networkidle' });
    await p.getByLabel('Código de invitación').fill(INVITACION);
    await p.getByRole('button', { name: 'Seguir' }).click();
    await p.getByLabel('Email').fill(email);
    await p.getByRole('button', { name: 'Seguir' }).click();
    await p.getByLabel('Contraseña', { exact: true }).fill('una-contrasena-larga-de-prueba');
    await p.getByRole('button', { name: 'Seguir' }).click();
    await p.getByLabel('Acepto los términos de uso').check();
    await p.getByLabel('Acepto la política de privacidad').check();
    await p.getByRole('button', { name: 'Crear cuenta' }).click();
    const confirmar = p.getByRole('button', { name: 'Ya lo confirmé' });
    await Promise.race([
      p.waitForURL('**/registro/listo/', { timeout: 15000 }).catch(() => {}),
      confirmar.waitFor({ timeout: 15000 }).catch(() => {}),
    ]);
    if (await confirmar.count()) await confirmar.click();
    await p.waitForURL('**/registro/listo/', { timeout: 15000 }).catch(() => {});
    await p.screenshot({ path: `${CARPETA}/api-registro.png` });
    ok(p.url().includes('/registro/listo/'), 'registro con invitación real hasta "¡Listo!"');
    const cookies = await p.context().cookies();
    const sesion = cookies.find((c) => /handyx_sesion$/.test(c.name));
    ok(Boolean(sesion?.httpOnly), 'sesión en cookie HttpOnly del BE');
    ok(sesion?.sameSite === 'Lax', 'cookie SameSite=Lax');
    const guardado = await p.evaluate(() => localStorage.length + sessionStorage.length);
    ok(guardado === 0, 'nada en localStorage ni sessionStorage');
    await p.goto(BASE + '/perfil/', { waitUntil: 'networkidle' });
    ok(api.includes('/v1/sesion'), 'la sesión se lee de la API');
  }

  // Contrato distinto: el aviso aparece (se simula la respuesta de /v1/version).
  const q = await b.newPage({ viewport: { width: 390, height: 844 } });
  await q.route('**/v1/version', (r) =>
    r.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'access-control-allow-origin': BASE, 'access-control-allow-credentials': 'true' },
      body: JSON.stringify({ contrato: '0.0.0-otra' }),
    }),
  );
  await q.goto(BASE + '/', { waitUntil: 'networkidle' });
  await q.getByText('Handyx se está actualizando').waitFor({ timeout: 8000 }).catch(() => {});
  ok((await q.getByText('Handyx se está actualizando').count()) === 1, 'contrato distinto: avisa');
  await q.screenshot({ path: `${CARPETA}/api-contrato-distinto.png` });

  ok(errores.length === 0, `sin errores${errores.length ? ': ' + errores.join(' | ') : ''}`);
  await b.close();
  console.log(fallas ? `${fallas} comprobación(es) fallaron` : 'API real OK');
  process.exitCode = fallas ? 1 : 0;
})();
