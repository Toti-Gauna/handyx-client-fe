// Catálogo visual de pantallas y estados (Fase 3 · lote 3.3). No corre en CI. Uso, con `npm run preview` activo:
//   node tests/e2e/capturas.cjs [carpeta]       (por defecto docs/screens/capturas)
// Genera JPEG a 390 px (página completa) y 1280 px (algunas), más un índice README.md. Solo datos ficticios del mock.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const CARPETA = process.argv[2] || 'docs/screens/capturas';
const BASE = process.env.E2E_BASE || 'http://127.0.0.1:5176';
fs.mkdirSync(CARPETA, { recursive: true });

const P = 'de000000-0000-4000-8000-0000000010';
const E = (r, esc) => `${r}${r.includes('?') ? '&' : '?'}escenario=${esc}`;
const fee = async (p) => {
  const b = p.getByRole('button', { name: 'Entendido' });
  if (await b.count()) {
    await b.first().click();
    await p.waitForFunction(() => !document.querySelector('dialog[open]'));
  }
};
const clic = (sel) => async (p) => {
  await p.locator(sel).first().click();
  await p.waitForLoadState('networkidle');
};
const panel = (accion) => async (p) => {
  await p.getByRole('button', { name: 'Panel de prueba' }).click();
  await p.getByRole('button', { name: accion }).click();
  await p.keyboard.press('Escape');
  await p.waitForTimeout(400);
};
// Usuario nuevo: registro con la invitación de prueba (el escenario "nuevo-usuario" no trae sesión).
const registrarse = async (p) => {
  await p.goto(BASE + '/registro/', { waitUntil: 'networkidle' });
  await p.getByLabel('Código de invitación').fill('DEMO2026');
  await p.getByLabel('Email').fill('nueva@example.test');
  await p.getByLabel('Contraseña').fill('una-contrasena-larga');
  await p.getByLabel('Acepto los términos de uso').check();
  await p.getByLabel('Acepto la política de privacidad').check();
  await p.getByRole('button', { name: 'Crear cuenta' }).click();
  await p.waitForURL('**/registro/listo/');
  await p.getByText('hasta el 10/12').first().waitFor();
};
const completarPerfil = async (p) => {
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
  await p.getByRole('button', { name: 'Terminar' }).click();
  await p.waitForURL('**/inicio/');
  await p.getByRole('button', { name: 'Entendido' }).waitFor();
};
// La app se desplaza por dentro (como una app nativa): para la captura de página completa, se despliega todo.
const DESPLEGAR = `html,body{height:auto!important;overflow:visible!important}
.hx,.hx-app,.hx-cuerpo,.pantalla,.pantalla__scroll,.pantalla__resto,.du-lista,.du-hoja-azul--llena{
position:relative!important;height:auto!important;max-height:none!important;overflow:visible!important;flex:none!important}`;
const tocar = (rol, nombre, exacto = false) => async (p) => {
  await p.getByRole(rol, { name: nombre, exact: exacto }).first().click();
  await p.waitForTimeout(500);
};

// [grupo, nombre, ruta, pasos?, opciones?]  · opciones: { fee: false } deja el modal de primer ingreso abierto,
// { vista: true } captura solo lo visible (hojas y modales).
const CAPTURAS = [
  ['Acceso', 'portada', '/'],
  ['Acceso', 'ingresar', '/ingresar/'],
  ['Acceso', 'ingresar-errores', '/ingresar/', [tocar('button', 'Ingresar')]],
  ['Acceso', 'registro', '/registro/'],
  ['Acceso', 'registro-errores', '/registro/', [tocar('button', 'Crear cuenta')]],
  ['Acceso', 'recuperar', '/recuperar/'],
  ['Acceso', 'recuperar-nueva', '/recuperar/nueva/#t=DEMOtokenDEMOtokenDEMOtokenDEMO1234'],
  ['Acceso', 'recuperar-enlace-incompleto', '/recuperar/nueva/'],
  ['Alta', 'registro-listo-fee', '/registro/', [registrarse]],
  ['Alta', 'perfil', '/registro/', [registrarse, tocar('link', 'Completar mi perfil')]],
  ['Alta', 'perfil-ubicacion-denegada', E('/perfil/', 'ubicacion-denegada')],
  ['Inicio', 'modal-fee-primer-ingreso', '/registro/', [registrarse, completarPerfil], { fee: false, vista: true }],
  ['Inicio', 'inicio-propuestas', E('/inicio/', 'varias-propuestas')],
  ['Inicio', 'inicio-trabajo-en-curso', E('/inicio/', 'efectivo-reportado')],
  ['Inicio', 'inicio-otra-ciudad', E('/inicio/', 'otra-ciudad')],
  ['Inicio', 'inicio-sin-historial', '/registro/', [registrarse, completarPerfil, tocar('button', 'Entendido')]],
  ['Pedido', 'handia', E('/handia/', 'varias-propuestas'), [], { vista: true }],
  ['Pedido', 'handia-detectado', E('/handia/', 'varias-propuestas'), [async (p) => {
    await p.getByRole('button', { name: /pileta/ }).click();
    await p.getByText('Rubro detectado: Plomería').waitFor();
  }], { vista: true }],
  ['Pedido', 'pedir-rubro', E('/pedir/', 'varias-propuestas')],
  ['Pedido', 'pedir-rubro-elegido', E('/pedir/', 'varias-propuestas'), [tocar('button', /Plomería/)]],
  ['Pedido', 'pedir-tipo', E('/pedir/', 'varias-propuestas'), [tocar('button', /Plomería/), tocar('button', 'Seguir')]],
  ['Pedidos', 'pedidos-activos', E('/pedidos/', 'varias-propuestas')],
  ['Pedidos', 'pedidos-programados', E('/pedidos/', 'programado'), [tocar('tab', 'Programados')]],
  ['Pedidos', 'pedidos-historial', E('/pedidos/', 'cancelacion'), [tocar('tab', 'Historial')]],
  ['Pedidos', 'pedido-con-propuestas', E(`/pedidos/detalle/?id=${P}01`, 'varias-propuestas')],
  ['Pedidos', 'pedido-buscando', E('/pedidos/', 'sin-especialistas'), [clic('.tarjeta--enlace')]],
  ['Pedidos', 'pedido-sin-respuesta', E('/pedidos/', 'urgencia-sin-respuesta'), [clic('.tarjeta--enlace')]],
  ['Pedidos', 'pedido-programado-sin-propuestas', E('/pedidos/', 'programado'), [clic('.tarjeta--enlace')]],
  ['Propuestas', 'propuestas-tarjetas', E(`/pedidos/propuestas/?pedido=${P}01`, 'varias-propuestas')],
  ['Propuestas', 'propuestas-tabla', E(`/pedidos/propuestas/?pedido=${P}01`, 'varias-propuestas'), [tocar('button', 'Comparar')]],
  ['Propuestas', 'propuesta-detalle', E(`/propuestas/detalle/?id=${P}03`, 'varias-propuestas')],
  ['Propuestas', 'hoja-aceptar', E(`/propuestas/detalle/?id=${P}03`, 'varias-propuestas'), [tocar('button', 'Aceptar', true)], { vista: true }],
  ['Propuestas', 'hoja-rechazar', E(`/propuestas/detalle/?id=${P}03`, 'varias-propuestas'), [tocar('button', 'Rechazar', true)], { vista: true }],
  ['Propuestas', 'aceptacion-ya-resuelta', E(`/propuestas/detalle/?id=${P}03`, 'varias-propuestas'), [panel('Otro dispositivo acepta primero'), tocar('button', 'Aceptar', true), tocar('button', 'Sí, acepto estas condiciones')]],
  ['Propuestas', 'propuesta-vencida', E('/pedidos/', 'propuesta-vencida'), [clic('.tarjeta--enlace'), tocar('link', /Ver propuestas/), clic('.du-oferta__btn--azul')]],
  ['Propuestas', 'contrapropuesta', E(`/propuestas/contraoferta/?id=${P}03`, 'varias-propuestas')],
  ['Mensajes', 'chats', E('/chats/', 'contrapropuesta')],
  ['Mensajes', 'conversacion', E(`/chats/conversacion/?id=${P}02`, 'contrapropuesta')],
  ['Mensajes', 'conversacion-mensaje-fallido', E('/chats/', 'chat-fallido'), [clic('main a[href*="conversacion"]'), async (p) => {
    await p.getByRole('textbox', { name: 'Mensaje' }).fill('¿Podés el jueves a la tarde?');
    await p.getByRole('button', { name: 'Enviar el mensaje' }).click();
    await p.waitForTimeout(1200);
  }]],
  ['Trabajo', 'trabajo-falta-confirmacion', E(`/trabajos/detalle/?id=${P}05`, 'efectivo-reportado')],
  ['Trabajo', 'trabajo-obra-por-etapas', E('/pedidos/', 'obra-por-etapas'), [tocar('link', /Especialista 3/)]],
  ['Trabajo', 'trabajo-cambiar', E(`/trabajos/cambiar/?id=${P}05`, 'efectivo-reportado')],
  ['Trabajo', 'pago-efectivo-reportado', E(`/trabajos/pago/?id=${P}05`, 'efectivo-reportado')],
  ['Trabajo', 'pago-mercado-pago', E('/pedidos/', 'mp-pendiente-fallido'), [tocar('link', /Especialista 2/), tocar('link', 'Pago al especialista')]],
  ['Agenda', 'agenda', E('/agenda/', 'programado')],
  ['Reclamos', 'reclamos', E('/reclamos/', 'reclamo')],
  ['Reclamos', 'reclamo-nuevo', E('/reclamos/nuevo/', 'reclamo')],
  ['Reclamos', 'reclamo-detalle', E('/reclamos/', 'reclamo'), [clic('.tarjeta--enlace')]],
  ['Cuenta', 'avisos', E('/notificaciones/', 'varias-propuestas')],
  ['Cuenta', 'cuenta', E('/cuenta/', 'varias-propuestas')],
  ['Cuenta', 'cuenta-datos', E('/cuenta/datos/', 'varias-propuestas')],
  ['Cuenta', 'cuenta-tarifa', E('/cuenta/tarifa/', 'varias-propuestas')],
  ['Cuenta', 'cuenta-avisos-celular', E('/cuenta/notificaciones/', 'varias-propuestas')],
  ['Cuenta', 'cuenta-privacidad', E('/cuenta/privacidad/', 'varias-propuestas')],
  ['Cuenta', 'cuenta-baja', E('/cuenta/baja/', 'varias-propuestas')],
  ['Cuenta', 'cuenta-baja-solicitada', E('/cuenta/baja/', 'baja-solicitada')],
  ['Cuenta', 'ayuda', E('/ayuda/', 'varias-propuestas')],
  ['Sistema', 'sesion-vencida', E('/inicio/', 'sesion-vencida'), [], { vista: true }],
  ['Sistema', 'cargando', E('/pedidos/', 'varias-propuestas'), [], { sinEspera: true }],
  ['Sistema', 'error-de-carga', E('/pedidos/', 'varias-propuestas'), [panel('Sin conexión (sí/no)'), clic('.tarjeta--enlace')]],
  ['Sistema', 'sin-conexion', '/sin-conexion/'],
  ['Sistema', 'no-encontrado', '/no-existe/'],
  ['Sistema', 'panel-de-prueba', E('/inicio/', 'varias-propuestas'), [tocar('button', 'Panel de prueba')], { vista: true }],
];
const ESCRITORIO = ['inicio-propuestas', 'propuestas-tarjetas', 'propuesta-detalle', 'conversacion', 'cuenta'];

(async () => {
  const b = await chromium.launch();
  const filas = [];
  let fallas = 0;
  for (const [ancho, alto] of [[390, 844], [1280, 800]]) {
    const ctx = await b.newContext({ viewport: { width: ancho, height: alto } });
    const p = await ctx.newPage();
    for (const [grupo, nombre, ruta, pasos = [], op = {}] of CAPTURAS) {
      if (ancho === 1280 && !ESCRITORIO.includes(nombre)) continue;
      const archivo = `${nombre}-${ancho}.jpg`;
      try {
        await p.goto(BASE + ruta, { waitUntil: op.sinEspera ? 'commit' : 'networkidle' });
        if (op.sinEspera) await p.waitForSelector('.esqueleto', { timeout: 5000 });
        else await p.waitForTimeout(500);
        if (op.fee !== false && !op.sinEspera) await fee(p);
        for (const paso of pasos) await paso(p);
        // Esperar a que termine de cargar (salvo la captura del estado "cargando").
        if (!op.sinEspera)
          await p.waitForFunction(() => !document.querySelector('.esqueleto'), null, { timeout: 8000 });
        await p.waitForTimeout(300);
        if (!op.vista) await p.addStyleTag({ content: DESPLEGAR });
        await p.screenshot({ path: path.join(CARPETA, archivo), type: 'jpeg', quality: 72, fullPage: !op.vista });
        filas.push({ grupo, nombre, ancho, archivo });
        console.log(`✔ ${archivo}`);
      } catch (e) {
        fallas++;
        console.log(`✘ ${archivo}: ${e.message.split('\n')[0]}`);
      }
    }
    await ctx.close();
  }
  await b.close();

  const lineas = [
    '# Catálogo de pantallas y estados',
    '',
    'Generado con `node tests/e2e/capturas.cjs` sobre `npm run preview` (vista de prueba, datos ficticios). 390 px página',
    'completa; hojas y modales, solo lo visible; algunas pantallas también a 1280 px. Regenerar todo: `npm run capturas`',
    '(primero los 18 escenarios en `escenarios/`, después este índice).',
    '',
  ];
  for (const grupo of [...new Set(filas.map((f) => f.grupo))]) {
    lineas.push(`## ${grupo}`, '', '| Pantalla o estado | Captura |', '| --- | --- |');
    for (const f of filas.filter((x) => x.grupo === grupo))
      lineas.push(`| ${f.nombre}${f.ancho === 1280 ? ' (escritorio)' : ''} | [${f.archivo}](${f.archivo}) |`);
    lineas.push('');
  }
  // Los 18 escenarios: capturas que deja `escenarios.cjs` en CARPETA/escenarios (estado final de cada recorrido).
  const dirEsc = path.join(CARPETA, 'escenarios');
  if (fs.existsSync(dirEsc)) {
    const ts = fs.readFileSync('src/mapa/escenarios.ts', 'utf8');
    const titulos = Object.fromEntries(
      [...ts.matchAll(/id: '([a-z-]+)',[\s\S]*?titulo: '([^']+)'/g)].map((m) => [m[1], m[2]]),
    );
    lineas.push('## Los 18 escenarios (estado final de cada recorrido)', '', '| Escenario | Qué muestra | Captura |', '| --- | --- | --- |');
    for (const f of fs.readdirSync(dirEsc).filter((x) => /^esc-.+\.jpg$/.test(x)).sort()) {
      const id = f.slice(4, -4);
      lineas.push(`| \`${id}\` | ${titulos[id] ?? ''} | [escenarios/${f}](escenarios/${f}) |`);
    }
    lineas.push('');
  }
  fs.writeFileSync(path.join(CARPETA, 'README.md'), lineas.join('\n'));
  console.log(fallas ? `${fallas} captura(s) fallaron` : `Capturas OK: ${filas.length}`);
  process.exitCode = fallas ? 1 : 0;
})();
