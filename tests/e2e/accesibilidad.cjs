// Auditoría de accesibilidad y responsive en un navegador real (Fase 3 · lote 3.2). No corre en CI (Playwright no es
// dependencia del repo). Uso, con `npm run build && npm run preview` activo:
//   node tests/e2e/accesibilidad.cjs [carpeta-de-capturas]
// Por pantalla y ancho: axe-core (WCAG 2.0/2.1/2.2 A y AA), objetivos táctiles ≥ 44 px, un solo h1, nombres accesibles,
// desborde horizontal y texto del sistema al 200 %.
const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');

const CARPETA = process.argv[2] || 'capturas-a11y';
const BASE = process.env.E2E_BASE || 'http://127.0.0.1:5176';
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
fs.mkdirSync(CARPETA, { recursive: true });

// Ids ficticios del servidor simulado. Desde la Fase 7 el mundo arranca creando el hogar (src/data/mock/draft4.ts),
// así que el primer pedido es …1013 (antes …1001): pedido 13, conversación 14, propuesta 15, trabajo 17.
const P = 'de000000-0000-4000-8000-0000000010';
const E = (r, esc) => `${r}${r.includes('?') ? '&' : '?'}escenario=${esc}`;
const RUTAS = [
  '/',
  '/ingresar/',
  '/registro/',
  '/recuperar/',
  '/recuperar/nueva/#t=prueba',
  '/sin-conexion/',
  '/no-existe/',
  E('/registro/listo/', 'nuevo-usuario'),
  E('/perfil/', 'ubicacion-denegada'),
  E('/inicio/', 'varias-propuestas'),
  E('/pedir/', 'varias-propuestas'),
  E('/pedir/?rubro=plomeria', 'varias-propuestas'),
  E('/pedir/?rubro=plomeria&tipo=urgente', 'varias-propuestas'),
  E('/handia/', 'varias-propuestas'),
  E('/pedidos/', 'varias-propuestas'),
  E(`/pedidos/detalle/?id=${P}13`, 'varias-propuestas'),
  E(`/pedidos/propuestas/?pedido=${P}13`, 'varias-propuestas'),
  E(`/propuestas/detalle/?id=${P}15`, 'varias-propuestas'),
  E(`/propuestas/contraoferta/?id=${P}15`, 'varias-propuestas'),
  E('/chats/', 'contrapropuesta'),
  E(`/chats/conversacion/?id=${P}14`, 'contrapropuesta'),
  E(`/trabajos/detalle/?id=${P}17`, 'efectivo-reportado'),
  E(`/trabajos/pago/?id=${P}17`, 'efectivo-reportado'),
  E(`/trabajos/resena/?id=${P}17`, 'efectivo-reportado'),
  E('/soporte/', 'contrapropuesta'),
  E('/pedidos/?vista=agenda', 'programado'),
  E(`/trabajos/cambiar/?id=${P}17`, 'efectivo-reportado'),
  E('/agenda/', 'programado'),
  E('/reclamos/', 'reclamo'),
  E('/reclamos/nuevo/', 'reclamo'),
  E('/notificaciones/', 'varias-propuestas'),
  E('/ayuda/', 'varias-propuestas'),
  E('/cuenta/', 'varias-propuestas'),
  E('/cuenta/datos/', 'varias-propuestas'),
  E('/cuenta/tarifa/', 'varias-propuestas'),
  E('/cuenta/notificaciones/', 'varias-propuestas'),
  E('/cuenta/privacidad/', 'varias-propuestas'),
  E('/cuenta/baja/', 'varias-propuestas'),
  E('/cuenta/baja/', 'baja-solicitada'),
  E('/cuenta/direcciones/', 'varias-propuestas'),
  E('/cuenta/pagos/', 'efectivo-reportado'),
  E('/cuenta/datos/?editar=1', 'varias-propuestas'),
  E('/ayuda/respuesta/?p=pagar', 'varias-propuestas'),
  // Fase 7 (lienzo design/usuario): pantallas nuevas sin id o con los ids ficticios de los escenarios.
  '/ingresar/clave/',
  '/registro/invitacion/',
  E('/casa/', 'nuevo-usuario'),
  E(`/propuestas/comparar/?pedido=${P}13`, 'varias-propuestas'),
  E(`/propuestas/perfil/?id=${P}15`, 'varias-propuestas'),
  E(`/trabajos/informe/?id=${P}17`, 'efectivo-reportado'),
  E(`/trabajos/conformidad/?id=${P}17`, 'efectivo-reportado'),
  E(`/trabajos/antes-despues/?id=${P}17`, 'efectivo-reportado'),
  E('/cuenta/seguridad/', 'varias-propuestas'),
  E('/hogar/', 'varias-propuestas'),
  E('/hogar/casa/', 'varias-propuestas'),
  E('/hogar/sumar/?que=equipo', 'varias-propuestas'),
  E('/hogar/rompio/', 'varias-propuestas'),
  E('/hogar/compartidos/', 'varias-propuestas'),
  E('/hogar/recordatorios/', 'varias-propuestas'),
  E('/hogar/historial/', 'varias-propuestas'),
  E('/hogar/garantias/', 'varias-propuestas'),
  E('/camino/', 'varias-propuestas'),
  E('/camino/insignias/', 'varias-propuestas'),
  E('/camino/beneficios/', 'varias-propuestas'),
  E('/herramientas/', 'varias-propuestas'),
  E('/herramientas/medir/', 'varias-propuestas'),
  E('/herramientas/nivel/', 'varias-propuestas'),
  E('/herramientas/linterna/', 'varias-propuestas'),
  E('/herramientas/escanear/', 'varias-propuestas'),
  E('/herramientas/modelo/', 'varias-propuestas'),
  E('/herramientas/destino/', 'varias-propuestas'),
];

// Estados con hoja abierta: se llega desde una ruta y se ejecuta una acción.
const HOJAS = [
  // Fase 7: «Aceptar esta propuesta» arriba y a todo el ancho; «Rechazar» abajo.
  ['hoja-aceptar', E(`/propuestas/detalle/?id=${P}15`, 'varias-propuestas'), (p) => p.getByRole('button', { name: 'Aceptar esta propuesta', exact: true }).click()],
  ['hoja-rechazar', E(`/propuestas/detalle/?id=${P}15`, 'varias-propuestas'), (p) => p.getByRole('button', { name: 'Rechazar', exact: true }).click()],
  ['modal-fee', E('/inicio/', 'nuevo-usuario'), async () => {}],
  ['reingreso', E('/inicio/', 'sesion-vencida'), async () => {}],
  ['direccion-nueva', E('/cuenta/direcciones/', 'varias-propuestas'), (p) => p.getByRole('button', { name: 'Agregar una dirección' }).click()],
  // Fase 7: los movimientos de Cuenta › Pagos ya no se despliegan («Ver más»): cada uno lleva a su pago.
  ['ayuda-gracias', E('/ayuda/respuesta/?p=pagar', 'varias-propuestas'), (p) => p.getByRole('button', { name: 'No', exact: true }).click()],
  ['reclamo-detalle', E('/reclamos/', 'reclamo'), (p) => p.getByRole('link', { name: /Ver el reclamo/ }).first().click()],
  ['version-nueva', E('/inicio/', 'varias-propuestas'), async (p) => {
    await p.getByRole('button', { name: 'Panel de prueba' }).click();
    await p.getByRole('button', { name: 'Simular versión nueva' }).click();
  }],
  // Fase 7: ya no hay hoja azul achicable (gestos.tsx · useHojaAzul no se usa en ninguna pantalla).
  ['pago-retorno', E(`/trabajos/pago/?id=${P}17`, 'mp-pendiente-fallido'), async (p) => {
    await p.getByText('Mercado Pago', { exact: true }).click();
    await p.getByRole('button', { name: /con Mercado Pago$/ }).click();
    await p.waitForURL('**/pagos/retorno/**');
  }],
  ['panel-prueba', E('/inicio/', 'varias-propuestas'), (p) => p.getByRole('button', { name: 'Panel de prueba' }).click()],
];

const TODOS_LOS_ANCHOS = [
  { nombre: '360', width: 360, height: 780 },
  { nombre: '390', width: 390, height: 844 },
  { nombre: '820', width: 820, height: 1180 },
  { nombre: '1280', width: 1280, height: 800 },
  { nombre: 'horizontal', width: 844, height: 390 },
];
// E2E_ANCHOS=390,820 limita los anchos (para iterar rápido); sin la variable, todos.
const ANCHOS = process.env.E2E_ANCHOS
  ? TODOS_LOS_ANCHOS.filter((a) => process.env.E2E_ANCHOS.split(',').includes(a.nombre))
  : TODOS_LOS_ANCHOS;

/** Chequeos propios que axe no cubre (objetivos táctiles de 44 px, un h1, desborde). Corre en la página. */
function chequeosPropios() {
  const fallas = [];
  const w = document.documentElement.clientWidth;
  if (document.documentElement.scrollWidth > w) fallas.push(`desborde horizontal ${document.documentElement.scrollWidth}>${w}`);
  const dialogo = document.querySelector('dialog[open]');
  const raiz = dialogo ?? document;
  const h1 = document.querySelectorAll('main h1');
  if (!dialogo && h1.length !== 1) fallas.push(`h1 en main: ${h1.length}`);
  const interactivos = raiz.querySelectorAll('a[href], button, input:not([type=hidden]), select, textarea, summary, [role=tab]');
  for (const el of interactivos) {
    if (el.closest('[hidden], [aria-hidden=true]') || el.hidden || el.type === 'file') continue;
    const r = el.getBoundingClientRect();
    // Sin caja u oculto visualmente (patrón sr-only, como el enlace de saltar mientras no tiene foco).
    if (r.width <= 1 && r.height <= 1) continue;
    // Enlaces dentro de un párrafo de texto: excepción "en línea" de WCAG 2.5.8.
    const enLinea = el.tagName === 'A' && getComputedStyle(el).display === 'inline' && el.closest('p, li, dd, span');
    // Casillas y radios van dentro de su etiqueta (la etiqueta completa es el objetivo).
    const conEtiqueta = (el.type === 'checkbox' || el.type === 'radio') && el.closest('label');
    if (enLinea || conEtiqueta) continue;
    if (r.width < 44 || r.height < 44) {
      const nombre = (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 40);
      fallas.push(`objetivo chico ${Math.round(r.width)}x${Math.round(r.height)} «${nombre}»`);
    }
  }
  return fallas;
}

async function auditar(p, etiqueta) {
  // Que terminen la transición de pantalla y las animaciones finitas (axe mide colores con la opacidad del momento).
  await p
    .waitForFunction(
      () =>
        !document.documentElement.classList.contains('vt-entrando') &&
        !document.querySelector('.esqueleto') &&
        document
          .getAnimations()
          .every((x) => x.playState !== 'running' || x.effect?.getTiming().iterations === Infinity),
      null,
      { timeout: 4000 },
    )
    .catch(() => undefined);
  await p.addScriptTag({ content: AXE });
  const r = await p.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const res = await axe.run(document, {
      runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
      rules: { region: { enabled: false } },
    });
    return res.violations.map((v) => ({
      id: v.id,
      impacto: v.impact,
      ayuda: v.help,
      nodos: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
    }));
  });
  const propios = await p.evaluate(chequeosPropios);
  return { etiqueta, axe: r, propios };
}

(async () => {
  const b = await chromium.launch();
  const resultados = [];
  for (const a of ANCHOS) {
    const ctx = await b.newContext({ viewport: { width: a.width, height: a.height } });
    const p = await ctx.newPage();
    const errores = [];
    p.on('pageerror', (e) => errores.push(e.message));
    const ir = async (r) => {
      await p.goto(BASE + r, { waitUntil: 'networkidle' });
      await p.waitForTimeout(400);
    };
    const cerrarFee = async () => {
      const b2 = p.getByRole('button', { name: 'Entendido' });
      if (await b2.count()) await b2.first().click();
    };
    for (const r of RUTAS) {
      await ir(r);
      await cerrarFee();
      resultados.push({ ancho: a.nombre, ...(await auditar(p, r)) });
    }
    for (const [nombre, r, accion] of HOJAS) {
      await ir(r);
      // Una acción que ya no encuentra su botón (pantalla rediseñada) se anota como falla y la auditoría sigue.
      p.setDefaultTimeout(15000);
      const fallo = await accion(p).then(
        () => null,
        (e) => `no se pudo abrir: ${String(e.message).split('\n')[0]}`,
      );
      p.setDefaultTimeout(30000);
      if (fallo) {
        resultados.push({ ancho: a.nombre, etiqueta: nombre, axe: [], propios: [fallo] });
        continue;
      }
      await p.waitForTimeout(400);

      resultados.push({ ancho: a.nombre, ...(await auditar(p, nombre)) });
      if (a.nombre === '390') await p.screenshot({ path: path.join(CARPETA, `${nombre}.png`) });
    }
    if (errores.length) resultados.push({ ancho: a.nombre, etiqueta: 'errores', axe: [], propios: errores });
    await ctx.close();
  }

  // Texto al 200 % (zoom de texto del sistema): sin desborde ni contenido cortado en las pantallas principales.
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await ctx.newPage();
  for (const r of RUTAS.filter((x) => /inicio|propuestas|detalle|cuenta\/\?|pedir|conversacion|ingresar/.test(x))) {
    await p.goto(BASE + r, { waitUntil: 'networkidle' });
    await p.addStyleTag({ content: 'html{font-size:200% !important}' });
    await p.waitForTimeout(300);
    const ent = p.getByRole('button', { name: 'Entendido' });
    if (await ent.count()) await ent.first().click();
    const d = await p.evaluate(() => {
      const w = document.documentElement.clientWidth;
      const cortados = [...document.querySelectorAll('main *')]
        // Las formas de adentro de un SVG las recorta su propio viewBox: se mide el <svg>, no cada forma.
        .filter((e) => !(e instanceof SVGElement && e.tagName.toLowerCase() !== 'svg'))
        .filter((e) => e.getBoundingClientRect().right > w + 1 && !e.closest('[role=region]'))
        .map((e) => `${e.tagName}.${e.className}`)
        .slice(0, 3);
      return { sw: document.documentElement.scrollWidth, w, cortados };
    });
    const propios = d.sw > d.w || d.cortados.length ? [`texto 200%: ${d.sw}>${d.w} ${d.cortados.join(', ')}`] : [];
    resultados.push({ ancho: 'texto-200', etiqueta: r, axe: [], propios });
  }
  await ctx.close();
  await b.close();

  const conFallas = resultados.filter((x) => x.axe.length || x.propios.length);
  for (const x of conFallas) {
    console.log(`✘ [${x.ancho}] ${x.etiqueta}`);
    for (const v of x.axe) console.log(`   axe ${v.impacto} ${v.id}: ${v.ayuda} → ${v.nodos.join(' | ')}`);
    for (const f of x.propios) console.log(`   ${f}`);
  }
  fs.writeFileSync(path.join(CARPETA, 'accesibilidad.json'), JSON.stringify(resultados, null, 2));
  console.log(
    conFallas.length
      ? `${conFallas.length} de ${resultados.length} chequeos con fallas`
      : `Accesibilidad OK: ${resultados.length} chequeos (axe + táctiles + h1 + desborde + texto 200 %)`,
  );
  process.exitCode = conFallas.length ? 1 : 0;
})();
