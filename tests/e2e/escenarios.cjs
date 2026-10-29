// Los 18 escenarios obligatorios de la vista de prueba, uno por uno, en un navegador real (390 px).
// No corre en CI (Playwright no es dependencia del repo). Uso, con `npm run build && npm run preview` activo:
//   node tests/e2e/escenarios.cjs [carpeta-de-capturas] [id-de-escenario]
const { chromium } = require('playwright');
const { completarPerfil, ingresar } = require('./acceso.cjs');
const fs = require('node:fs');

const CARPETA = process.argv[2] || 'capturas-e2e';
const SOLO = process.argv[3] || null;
const BASE = process.env.E2E_BASE || 'http://127.0.0.1:5176';
fs.mkdirSync(CARPETA, { recursive: true });

const casos = {
  'nuevo-usuario': async ({ ir, p }) => {
    await ir('/');
    await p.getByRole('link', { name: 'Crear cuenta' }).waitFor();
    await ir('/ingresar/');
    await ingresar(p);
    await p.getByRole('button', { name: 'Entendido' }).waitFor();
  },

  'otra-ciudad': async ({ ir, p }) => {
    await ir('/inicio/', 'otra-ciudad');
    await p.getByText('Todavía no llegamos a Rosario').first().waitFor();
    await ir('/pedir/?rubro=plomeria&tipo=urgente', 'otra-ciudad');
    await p.getByLabel('Contalo con tus palabras').fill('Pierde la canilla de la cocina.');
    await p.getByRole('button', { name: 'Seguir' }).click();
    await p.getByText('Todavía no llegamos a Rosario').first().waitFor();
    await p.getByRole('button', { name: 'Seguir' }).click();
    await p.getByText('Todavía no tenemos cobertura en Rosario').waitFor();
  },

  'ubicacion-denegada': async ({ ir, p }) => {
    await ir('/perfil/', 'ubicacion-denegada');
    await completarPerfil(p, {
      completar: false,
      antesDeTerminar: (p) => p.getByText('No diste permiso de ubicación').waitFor(),
    });
  },

  'sin-especialistas': async ({ ir, p, panel }) => {
    await ir('/pedidos/', 'sin-especialistas');
    await p.getByText('Buscando', { exact: true }).first().waitFor();
    await p
      .getByRole('link', { name: /Plomería/ })
      .first()
      .click();
    await p.getByRole('heading', { name: /Avisando a especialistas/ }).waitFor();
    await panel('Avanzar 5 min');
    await p.getByText(/respondió a tu pedido urgente en 20 minutos/).waitFor({ timeout: 10000 });
    await p.getByRole('button', { name: 'Relanzar la búsqueda' }).click();
    await p.getByRole('heading', { name: /Avisando a especialistas/ }).waitFor();
    await panel('Avanzar 30 min');
    await p.getByText(/respondió a tu pedido urgente en 20 minutos/).waitFor({ timeout: 10000 });
    await p.getByRole('button', { name: 'Relanzar la búsqueda' }).click();
    await p.getByRole('heading', { name: /Avisando a especialistas/ }).waitFor();
    await panel('Avanzar 30 min');
    await p.getByText(/respondió a tu pedido urgente en 20 minutos/).waitFor({ timeout: 10000 });
    if ((await p.getByRole('button', { name: 'Relanzar la búsqueda' }).count()) !== 0)
      throw new Error('permite relanzar sin límite');
    await p.getByRole('button', { name: 'Pedir búsqueda manual' }).click();
    await p.getByRole('heading', { name: /El equipo de Handy busca por vos/ }).waitFor();
    if (await p.getByText(/en \d+ minutos|ETA/).count()) throw new Error('hay una ETA inventada');
  },

  'varias-propuestas': async ({ ir, p }) => {
    await ir('/pedidos/', 'varias-propuestas');
    await p
      .getByRole('link', { name: /Plomería/ })
      .first()
      .click();
    await p.getByRole('link', { name: /Ver propuestas \(3\)/ }).click();
    await p.getByText('No es una recomendación ni un ranking').waitFor();
    await p.getByRole('button', { name: 'Comparar' }).click();
    await p.getByRole('columnheader', { name: 'Especialista 3' }).waitFor();
    await p.getByRole('rowheader', { name: 'Tarifa de Handy' }).waitFor();
  },

  contrapropuesta: async ({ ir, p, panel }) => {
    await ir('/pedidos/', 'contrapropuesta');
    await p
      .getByRole('link', { name: /Plomería/ })
      .first()
      .click();
    await p.getByRole('link', { name: /Ver propuestas/ }).click();
    await p.getByRole('link', { name: /^Elegir la propuesta/ }).first().click();
    await p.getByRole('link', { name: 'Hacer una contrapropuesta' }).click();
    await p.getByLabel('Precio que proponés').fill('40.000');
    await p.getByRole('button', { name: 'Enviar contrapropuesta' }).click();
    await p.waitForURL('**/chats/conversacion/**');
    await p.getByText('Tu contrapropuesta · Pendiente').waitFor();
    await panel('Acepta tu contrapropuesta');
    await p.getByText('Acuerdo aceptado').waitFor({ timeout: 10000 });
  },

  'aceptacion-duplicada': async ({ ir, p }) => {
    await ir('/pedidos/', 'aceptacion-duplicada');
    await p
      .getByRole('link', { name: /Plomería/ })
      .first()
      .click();
    await p.getByRole('link', { name: /Ver propuestas/ }).click();
    await p.getByRole('link', { name: /^Elegir la propuesta/ }).first().click();
    await p.getByRole('button', { name: 'Aceptar', exact: true }).click();
    await p.getByRole('button', { name: 'Sí, acepto estas condiciones' }).click();
    await p.getByText('Esto ya se resolvió').waitFor();
    await p.getByText('No se creó otro trabajo').waitFor();
  },

  'propuesta-vencida': async ({ ir, p, panel }) => {
    await ir('/pedidos/', 'propuesta-vencida');
    await p
      .getByRole('link', { name: /Plomería/ })
      .first()
      .click();
    await p.getByRole('link', { name: /Ver propuestas/ }).click();
    await p
      .getByText(/vence en 0\d:\d\d/)
      .first()
      .waitFor();
    await panel('Avanzar 5 min');
    await p.getByText('Sin propuestas vigentes').waitFor({ timeout: 10000 });
    await p.getByText('Anteriores (1)').waitFor();
  },

  'urgencia-sin-respuesta': async ({ ir, p }) => {
    await ir('/pedidos/', 'urgencia-sin-respuesta');
    await p.getByText('Sin respuesta', { exact: true }).first().waitFor();
    await p
      .getByRole('link', { name: /Electricidad/ })
      .first()
      .click();
    await p.getByText(/respondió a tu pedido urgente en 20 minutos/).waitFor();
    await p.getByRole('button', { name: 'Pedir búsqueda manual' }).waitFor();
    await p.getByRole('button', { name: 'Cancelar el pedido' }).waitFor();
  },

  programado: async ({ ir, p }) => {
    await ir('/pedidos/', 'programado');
    await p.getByRole('link', { name: /Gas/ }).first().click();
    await p.getByText('Pasaron 12 horas sin propuestas').waitFor();
    await ir('/agenda/', 'programado');
    await p.getByRole('button', { name: /Viernes 20\/11, con trabajos/ }).click();
    await p.getByText('Especialista 2').waitFor();
  },

  'obra-por-etapas': async ({ ir, p }) => {
    await ir('/pedidos/', 'obra-por-etapas');
    await p
      .getByRole('link', { name: /Especialista 3/ })
      .first()
      .click();
    await p.getByRole('heading', { name: 'Etapas de la obra' }).waitFor();
    await p.getByRole('button', { name: 'Confirmar esta etapa' }).click();
    await p.getByText('Confirmada').first().waitFor();
    await p.getByText('2. Ejecución principal').waitFor();
    if ((await p.getByRole('button', { name: 'Confirmar que terminó' }).count()) !== 0)
      throw new Error('permite cerrar la obra con etapas sin confirmar');
  },

  'chat-fallido': async ({ ir, p }) => {
    await ir('/chats/', 'chat-fallido');
    await p.getByRole('link', { name: /Especialista 2/ }).click();
    await p.getByLabel('Mensaje', { exact: true }).fill('Hola, ¿venís el miércoles?');
    await p.getByRole('button', { name: 'Enviar el mensaje' }).click();
    await p.getByText('No se envió').waitFor({ timeout: 10000 });
    await p.getByRole('button', { name: 'Reintentar' }).click();
    await p.getByText('Hola, ¿venís el miércoles?').first().waitFor();
    await p.waitForTimeout(1500);
    const veces = await p.getByText('Hola, ¿venís el miércoles?').count();
    if (veces !== 1) throw new Error(`el mensaje reintentado se duplicó (${veces})`);
    const png = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGNgYGD4DwABBAEAHRlfRQAAAABJRU5ErkJggg==',
      'base64',
    );
    await p
      .locator('input[type=file]')
      .setInputFiles({ name: 'foto.png', mimeType: 'image/png', buffer: png });
    await p.getByText('No se envió').waitFor({ timeout: 10000 });
    await p.getByRole('button', { name: 'Reintentar' }).click();
    await p.getByAltText('Foto enviada').waitFor({ timeout: 10000 });
  },

  cancelacion: async ({ ir, p }) => {
    await ir('/pedidos/', 'cancelacion');
    await p
      .getByRole('link', { name: /Cerrajería/ })
      .first()
      .click();
    await p.getByRole('button', { name: 'Cancelar el pedido' }).click();
    await p.getByRole('button', { name: 'Sí, cancelar el pedido' }).click();
    await p.getByText('Cancelaste este pedido').waitFor();
    await ir('/pedidos/', 'cancelacion');
    await p.getByRole('tab', { name: 'Programados' }).click();
    await p
      .getByRole('link', { name: /Especialista 1/ })
      .first()
      .click();
    await p.getByRole('button', { name: 'Cancelar el trabajo' }).click();
    await p.getByRole('button', { name: 'Sí, cancelar el trabajo' }).click();
    await p.getByText('Este trabajo se canceló').waitFor();
    await p.getByText('Cancelado', { exact: true }).first().waitFor();
  },

  'efectivo-reportado': async ({ ir, p }) => {
    await ir('/pedidos/', 'efectivo-reportado');
    await p
      .getByRole('link', { name: /Especialista 1/ })
      .first()
      .click();
    await p.getByRole('link', { name: 'Pago al especialista' }).click();
    await p.getByText('Reportado (sin verificar)').first().waitFor();
    await p.getByText('Pasa a “verificado” cuando').waitFor();
  },

  'mp-pendiente-fallido': async ({ ir, p, panel }) => {
    await ir('/pedidos/', 'mp-pendiente-fallido');
    await p
      .getByRole('link', { name: /Especialista 2/ })
      .first()
      .click();
    await p.getByRole('link', { name: 'Pago al especialista' }).click();
    await p.getByText('Falló').first().waitFor();
    await p.getByRole('button', { name: 'Pagar de otra forma' }).click();
    await p.getByLabel('Mercado Pago').check();
    await p.getByRole('button', { name: 'Ir a Mercado Pago' }).click();
    await p.waitForURL('**/pagos/retorno/**');
    await p.getByText('Todavía no está confirmado').waitFor();
    if (await p.getByText('Pago confirmado').count())
      throw new Error('volver del checkout confirmó el pago');
    await panel('Mercado Pago rechaza el pago');
    await p.getByText('El pago no se completó').waitFor({ timeout: 10000 });
    await p.getByRole('button', { name: 'Volver a intentar' }).click();
    await p.getByText('Todavía no está confirmado').waitFor({ timeout: 10000 });
    await panel('Mercado Pago confirma el pago');
    await p.getByText('Pago confirmado').waitFor({ timeout: 10000 });
  },

  reclamo: async ({ ir, p }) => {
    await ir('/reclamos/', 'reclamo');
    await p.getByText('Necesitamos tu respuesta').first().waitFor();
    await p.getByRole('link', { name: /El trabajo quedó incompleto/ }).click();
    await p.getByLabel('Tu respuesta').fill('Adjunto el detalle: sigue goteando.');
    await p.getByRole('button', { name: 'Enviar respuesta' }).click();
    await p.getByText('En revisión').first().waitFor({ timeout: 10000 });
    await p.getByRole('heading', { name: 'Historial' }).waitFor();
    await ir('/reclamos/nuevo/', 'reclamo');
    await p.getByLabel('¿Sobre qué trabajo?').selectOption({ index: 1 });
    await p.getByLabel('Problema de calidad').check();
    await p.getByLabel('Contanos el detalle').fill('La terminación quedó dispareja.');
    await p.getByRole('button', { name: 'Enviar el reclamo' }).click();
    await p.getByText('Abierto', { exact: true }).first().waitFor({ timeout: 10000 });
  },

  'sesion-vencida': async ({ ir, p }) => {
    await ir('/inicio/', 'sesion-vencida');
    await p.getByRole('button', { name: 'Entendido' }).count();
    for (const pestana of ['Actividad', 'Mensajes', 'Cuenta']) {
      await p.getByRole('link', { name: pestana, exact: true }).click();
      await p.waitForTimeout(700);
      if (await p.getByText('Tu sesión venció').count()) break;
    }
    await p.getByRole('heading', { name: 'Tu sesión venció' }).waitFor({ timeout: 15000 });
    await p.getByLabel('Email').fill('usuaria@example.test');
    await p.getByLabel('Contraseña').fill('handyx-demo-1234');
    await p.getByRole('button', { name: 'Ingresar' }).click();
    await p
      .getByRole('heading', { name: 'Tu sesión venció' })
      .waitFor({ state: 'hidden', timeout: 10000 });
  },

  'baja-solicitada': async ({ ir, p, panel }) => {
    await ir('/cuenta/baja/', 'baja-solicitada');
    await p.getByText('En proceso').first().waitFor();
    await p.getByText('Todavía no terminó').waitFor();
    await panel('Avanzar 1 día');
    await p.getByText('Completada con retención').first().waitFor({ timeout: 10000 });
    await p.getByText('plazo a confirmar por Legal').waitFor();
  },
};

(async () => {
  const b = await chromium.launch();
  let fallas = 0;
  for (const [id, caso] of Object.entries(casos)) {
    if (SOLO && SOLO !== id) continue;
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
    const p = await ctx.newPage();
    p.setDefaultTimeout(8000);
    const errores = [];
    p.on('console', (m) => {
      if (m.type() === 'error') errores.push(m.text());
    });
    p.on('pageerror', (e) => errores.push('PAGEERROR ' + e.message));
    const ir = async (ruta, esc) => {
      const url =
        BASE +
        ruta +
        (esc
          ? `${ruta.includes('?') ? '&' : '?'}escenario=${esc}`
          : id !== 'nuevo-usuario'
            ? `${ruta.includes('?') ? '&' : '?'}escenario=${id}`
            : '');
      await p.goto(url, { waitUntil: 'networkidle' });
    };
    const panel = async (accion) => {
      await p.getByRole('button', { name: 'Panel de prueba' }).click();
      await p.getByRole('button', { name: accion, exact: true }).click();
      await p.keyboard.press('Escape');
      await p.waitForTimeout(400);
    };
    try {
      await caso({ ir, p, panel });
      await p.screenshot({ path: `${CARPETA}/esc-${id}.jpg`, type: 'jpeg', quality: 72 });
      const reales = errores.filter((e) => !/status of (4\d\d|5\d\d)/.test(e));
      console.log(
        `✔ ${id}${reales.length ? '  (errores de consola: ' + reales.join(' | ') + ')' : ''}`,
      );
      if (reales.length) fallas += 1;
    } catch (e) {
      fallas += 1;
      await p.screenshot({ path: `${CARPETA}/esc-${id}-FALLA.png` }).catch(() => undefined);
      console.log(`✘ ${id}: ${e.message.split('\n')[0]}`);
    }
    await ctx.close();
  }
  await b.close();
  console.log(fallas ? `${fallas} escenario(s) con falla` : 'Todos los escenarios OK');
  process.exit(fallas ? 1 : 0);
})();
