// Recorrido completo de la vista de prueba en un navegador real: registro → perfil → pedido → propuesta → trabajo → pago.
// No corre en CI (Playwright no es dependencia del repo). Uso, con `npm run build && npm run preview` activo:
//   node tests/e2e/recorrido.cjs [carpeta-de-capturas]
const { chromium } = require('playwright');
const fs = require('node:fs');

const CARPETA = process.argv[2] || 'capturas-e2e';
const BASE = process.env.E2E_BASE || 'http://127.0.0.1:5176';
fs.mkdirSync(CARPETA, { recursive: true });
const paso = (m) => console.log('•', m);

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errores = [];
  p.on('console', (m) => {
    if (m.type() === 'error') errores.push(m.text());
  });
  p.on('pageerror', (e) => errores.push('PAGEERROR ' + e.message));
  const foto = (n) => p.screenshot({ path: `${CARPETA}/${n}.png` });
  const panel = async (accion) => {
    await p.getByRole('button', { name: 'Panel de prueba' }).click();
    await p.getByRole('button', { name: accion }).click();
    await p.keyboard.press('Escape');
    await p.waitForTimeout(300);
  };

  await p.goto(BASE + '/registro/', { waitUntil: 'networkidle' });
  await p.getByLabel('Código de invitación').fill('DEMO2026');
  await p.getByLabel('Email').fill('nueva@example.test');
  await p.getByLabel('Contraseña').fill('una-contrasena-larga');
  await p.getByRole('button', { name: 'Crear cuenta' }).click();
  paso(
    'sin tildar los textos no se crea la cuenta: ' +
      ((await p.getByText('Tenés que aceptar los términos').count()) > 0),
  );
  await p.getByLabel('Acepto los términos de uso').check();
  await p.getByLabel('Acepto la política de privacidad').check();
  await p.getByRole('button', { name: 'Crear cuenta' }).click();
  await p.waitForURL('**/registro/listo/');
  await p.getByText('hasta el 10/12').first().waitFor();
  paso('aviso del fee 0 % después del registro');
  await foto('10-registro-listo');
  await p.getByRole('link', { name: 'Completar mi perfil' }).click();
  await p.waitForURL('**/perfil/');
  await p.getByLabel('Nombre', { exact: true }).fill('Persona');
  await p.getByLabel('Apellido').fill('Ficticia');
  await p.getByRole('button', { name: 'Guardar y seguir' }).click();
  await p.getByLabel('Fecha de nacimiento').fill('1990-03-04');
  await p.getByLabel('Género').selectOption('mujer');
  await p.getByRole('button', { name: 'Guardar y seguir' }).click();
  await p.getByRole('button', { name: 'Usar mi ubicación ahora' }).click();
  await p.getByText('tomamos tu ubicación').waitFor();
  await p.getByLabel('Dirección').fill('Calle Ficticia 123');
  await foto('11-perfil-ubicacion');
  await p.getByRole('button', { name: 'Terminar' }).click();
  await p.waitForURL('**/inicio/');
  await p.getByRole('button', { name: 'Entendido' }).waitFor();
  paso('modal de primer ingreso (fee 0 %)');
  await p.getByRole('button', { name: 'Entendido' }).click();
  await p.waitForTimeout(500);
  await foto('12-inicio-nuevo');

  await p.getByRole('link', { name: 'Plomería' }).click();
  await p.waitForURL('**/pedir/**');
  await p.getByLabel('Urgente').check();
  await p.getByRole('button', { name: 'Seguir' }).click();
  await p.getByLabel('Contanos qué necesitás').fill('Pierde la canilla de la cocina y gotea.');
  await p.getByRole('button', { name: 'Seguir' }).click();
  await p.getByRole('button', { name: 'Seguir' }).click();
  await p.getByRole('button', { name: 'Seguir' }).click();
  await foto('13-pedir-revisar');
  await p.getByRole('button', { name: 'Enviar pedido' }).click();
  await p.waitForURL('**/pedidos/detalle/**');
  await p.getByText('Estamos buscando especialistas').waitFor();
  paso('buscando, sin ETA inventada');
  await foto('14-buscando');
  await p.getByRole('link', { name: /Ver propuestas/ }).waitFor({ timeout: 25000 });
  await foto('15-con-propuestas');
  await p.getByRole('link', { name: /Ver propuestas/ }).click();
  await p.getByRole('heading', { name: /propuestas/i }).waitFor();
  await foto('16-propuestas');
  await p.getByRole('link', { name: 'Ver y responder' }).first().click();
  await p.getByRole('button', { name: 'Aceptar esta propuesta' }).waitFor();
  await foto('17-propuesta-detalle');
  await p.getByRole('button', { name: 'Aceptar esta propuesta' }).click();
  await foto('18-confirmar');
  await p.getByRole('button', { name: 'Sí, acepto estas condiciones' }).click();
  await p.waitForURL('**/trabajos/detalle/**');
  await p.getByText('Lo acordado').waitFor();
  paso('trabajo creado solo tras aceptar explícitamente');
  await foto('19-trabajo');

  for (let i = 0; i < 4; i++)
    await panel('Avanza el trabajo (en camino, "Llegué", en curso, terminado)');
  await p.getByText('Falta tu confirmación').first().waitFor({ timeout: 10000 });
  paso('el especialista terminó: falta la confirmación del usuario');
  await foto('20-terminado');
  await p.getByRole('button', { name: 'Confirmar que terminó' }).click();
  await p.getByRole('button', { name: 'Sí, está todo bien' }).click();
  await p.getByText('Trabajo finalizado').waitFor();
  await p.getByRole('link', { name: 'Pago al especialista' }).click();
  await p.getByRole('button', { name: 'Pagar', exact: true }).click();
  await p.getByLabel('Efectivo').check();
  await foto('21-pago-hoja');
  await p.getByRole('button', { name: 'Ya le pagué en efectivo' }).click();
  await p.getByText('Reportado (sin verificar)').first().waitFor();
  paso('efectivo queda "reportado", no "verificado"');
  await foto('22-pago-reportado');
  await panel('Verificar el último pago');
  await p.getByText('Verificado', { exact: true }).first().waitFor({ timeout: 10000 });
  paso('verificado solo cuando lo confirma la contraparte');

  console.log('errores de consola:', errores.length ? errores : 'ninguno');
  await b.close();
  process.exit(errores.length ? 1 : 0);
})().catch((e) => {
  console.error('FALLÓ:', e.message.split('\n')[0]);
  process.exit(1);
});
