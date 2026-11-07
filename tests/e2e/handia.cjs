// HandIA premium en un navegador real (vista de prueba; motor en el celular). No corre en CI. Uso, con `npm run preview`:
//   node tests/e2e/handia.cjs [carpeta-de-capturas]
// La voz se simula: un reconocimiento LOCAL (processLocally) que devuelve frases preparadas y una síntesis con una voz
// local y otra "en la nube", para comprobar que HandIA solo escucha en el dispositivo y solo habla con la local.
const { chromium } = require('playwright');
const fs = require('node:fs');

const CARPETA = process.argv[2] || 'capturas-e2e';
const BASE = process.env.E2E_BASE || 'http://127.0.0.1:5176';
const AXE = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
fs.mkdirSync(CARPETA, { recursive: true });
let fallas = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? '✔' : '✘'} ${msg}`);
  if (!cond) fallas++;
};

/** Voz simulada. `local`: si el navegador ofrece reconocimiento en el dispositivo. */
const vozSimulada = (local) => {
  window.__voz = { dichos: [], escuchas: [], cola: [] };
  class Rec {
    constructor() {
      this.processLocally = false;
      this.lang = '';
    }
    start() {
      const frase = window.__voz.cola.shift();
      window.__voz.escuchas.push({ lang: this.lang, local: this.processLocally });
      setTimeout(() => {
        if (frase) {
          const r = [{ transcript: frase }];
          r.isFinal = true;
          this.onresult && this.onresult({ resultIndex: 0, results: [r] });
        }
        this.onend && this.onend();
      }, 250);
    }
    stop() {
      this.onend && this.onend();
    }
    abort() {}
  }
  // Sin "local", el navegador solo tiene el reconocimiento "en la nube" (sin available/processLocally).
  if (local) {
    Rec.available = async (o) => (o.processLocally && o.langs[0] === 'es-AR' ? 'available' : 'unavailable');
    // HandIA solo pregunta por la voz local en Chrome o Edge (en otros Chromium la consulta cierra la pestaña).
    Object.defineProperty(navigator, 'userAgentData', {
      configurable: true,
      value: { brands: [{ brand: 'Google Chrome', version: '153' }] },
    });
  }
  window.SpeechRecognition = Rec;
  const voces = [
    { name: 'Google español', lang: 'es-US', localService: false, voiceURI: 'nube' },
    { name: 'Voz del sistema', lang: 'es-AR', localService: true, voiceURI: 'local-ar' },
  ];
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      getVoices: () => voces,
      speak(u) {
        window.__voz.dichos.push({ texto: u.text, voz: u.voice && u.voice.voiceURI });
        setTimeout(() => u.onend && u.onend(), 120);
      },
      cancel() {},
      addEventListener() {},
      removeEventListener() {},
    },
  });
  window.SpeechSynthesisUtterance = class {
    constructor(t) {
      this.text = t;
    }
  };
};

async function axe(p, etiqueta) {
  await p.addScriptTag({ content: AXE });
  const v = await p.evaluate(async () => {
    // eslint-disable-next-line no-undef
    const r = await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'] } });
    return r.violations.map((x) => `${x.id}: ${x.nodes.map((n) => n.target.join(' ')).slice(0, 2).join(' | ')}`);
  });
  ok(v.length === 0, `${etiqueta}: sin fallas de axe${v.length ? ' → ' + v.join(' ; ') : ''}`);
}

async function abrir(b, local) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  const errores = [];
  p.on('pageerror', (e) => errores.push(e.message));
  await p.addInitScript(vozSimulada, local);
  return { p, errores };
}

(async () => {
  const b = await chromium.launch();

  // 1. Chat: desde Inicio, conversación completa, ficha editable y pedido armado.
  {
    const { p, errores } = await abrir(b, true);
    await p.goto(BASE + '/inicio/?escenario=varias-propuestas', { waitUntil: 'networkidle' });
    const entendido = p.getByRole('button', { name: 'Entendido' });
    if (await entendido.count()) await entendido.first().click();
    await p.getByRole('link', { name: /Contale a HandIA/ }).click();
    await p.waitForURL('**/handia/**');
    await p.getByRole('heading', { name: /HandIA/ }).waitFor();
    ok((await p.getByRole('navigation', { name: 'Secciones' }).count()) === 0, 'HandIA abre a pantalla completa');
    await p.screenshot({ path: `${CARPETA}/handia-inicio.png` });

    await p.getByLabel('Escribile a HandIA').fill('Pierde la canilla del baño, llamame al 223 155-123456');
    await p.getByRole('button', { name: 'Enviar a HandIA' }).click();
    await p.getByText(/Saqué teléfono del mensaje/).waitFor();
    ok(!(await p.getByText('155-123456').count()), 'el teléfono no queda en la conversación');
    await p.getByText('Rubro detectado: Plomería').waitFor({ timeout: 5000 });
    ok(true, 'sugiere Plomería');
    await p.screenshot({ path: `${CARPETA}/handia-detectado.png` });

    await p.getByRole('button', { name: 'Sí, es Plomería' }).click();
    await p.getByText('¿Pudiste cerrar la llave de paso?').waitFor();
    ok(true, 'no pregunta dónde ni qué pasa (ya lo contó): va directo a la llave de paso');
    ok(/Pregunta \d de \d/.test(await p.locator('.hx-progreso').innerText()), 'muestra el progreso de las preguntas');
    await p.screenshot({ path: `${CARPETA}/handia-pregunta.png` });
    await axe(p, 'HandIA con preguntas');
    await p.getByRole('group', { name: 'Respuestas' }).getByRole('button', { name: 'Todavía no' }).click();
    await p.getByText('¿Desde cuándo pasa?').waitFor();
    await p.getByLabel('Escribile a HandIA').fill('desde ayer');
    await p.getByRole('button', { name: 'Enviar a HandIA' }).click();
    const ficha = p.getByLabel('Así lo leen los especialistas');
    await ficha.waitFor();
    const desc = await ficha.inputValue();
    ok(/^Pierde la canilla del baño\n/.test(desc) && !/llamame|155-123456|\[teléfono\]/.test(desc), 'la descripción no tiene el teléfono ni el hueco');
    ok(/Todavía no cerró la llave de paso · Pasa hace unos días/.test(desc), 'la descripción suma los datos de las preguntas');
    ok(await p.getByText(/cerrá la llave de paso/).count() > 0, 'consejo seguro mientras tanto');
    await ficha.fill(desc + ' Escribime a ana@example.test');
    await p.screenshot({ path: `${CARPETA}/handia-ficha.png` });
    await axe(p, 'HandIA con la ficha');

    await p.getByRole('button', { name: 'Pedir para hoy' }).click();
    await p.waitForURL('**/pedir/**');
    const url = new URL(p.url());
    ok(url.searchParams.get('rubro') === 'plomeria' && url.searchParams.get('tipo') === 'urgente', 'abre Pedir con rubro y tipo');
    ok(!/canilla|telefono|teléfono|example/i.test(decodeURIComponent(url.search)), 'el texto no viaja por la URL');
    for (let i = 0; i < 4; i++) {
      const campo = p.getByRole('textbox', { name: /Contalo|Contanos|Qué pasa|qué pasó/i });
      if (await campo.count()) break;
      const seguir = p.getByRole('button', { name: 'Seguir' });
      if (!(await seguir.count())) break;
      await seguir.click();
      await p.waitForTimeout(300);
    }
    const valor = await p.locator('textarea').first().inputValue().catch(() => '');
    ok(/Pierde la canilla del baño/.test(valor) && /Datos:/.test(valor), 'el pedido viene con lo que contó y los datos');
    ok(!/ana@example\.test|155-123456/.test(valor), 'lo que se editó a mano también pasa por el tachado');
    await p.screenshot({ path: `${CARPETA}/handia-pedido.png` });
    ok(errores.length === 0, `chat: sin errores${errores.length ? ': ' + errores.join(' | ') : ''}`);
    await p.close();
  }

  // 2. Riesgos y "sin pistas".
  {
    const { p, errores } = await abrir(b, true);
    await p.goto(BASE + '/handia/?escenario=varias-propuestas', { waitUntil: 'networkidle' });
    await p.getByLabel('Escribile a HandIA').fill('Hay olor a gas en la cocina');
    await p.getByRole('button', { name: 'Enviar a HandIA' }).click();
    await p.getByRole('alert').filter({ hasText: /si sentís olor a gas/ }).waitFor({ timeout: 5000 });
    ok(true, 'olor a gas: aviso de seguridad destacado');
    await p.goto(BASE + '/handia/?escenario=varias-propuestas', { waitUntil: 'networkidle' });
    await p.getByLabel('Escribile a HandIA').fill('Quiero armar un mueble');
    await p.getByRole('button', { name: 'Enviar a HandIA' }).click();
    await p.getByText(/No me quedó claro/).waitFor({ timeout: 5000 });
    ok((await p.getByRole('group', { name: 'Elegí el rubro' }).getByRole('button').count()) === 6, 'sin pistas: ofrece los 6 rubros');
    ok(errores.length === 0, `riesgos: sin errores${errores.length ? ': ' + errores.join(' | ') : ''}`);
    await p.close();
  }

  // 3. Modo voz con reconocimiento local: conversación hablada de punta a punta.
  {
    const { p, errores } = await abrir(b, true);
    await p.goto(BASE + '/handia/?escenario=varias-propuestas', { waitUntil: 'networkidle' });
    await p.evaluate(() => {
      window.__voz.cola = ['Me quedé afuera, se trabó la cerradura', 'dale', 'la de entrada', 'para hoy'];
    });
    await p.getByRole('button', { name: 'Modo voz' }).click();
    const dialogo = p.getByRole('dialog', { name: 'Modo voz' });
    await dialogo.waitFor();
    ok((await dialogo.getByText('Vista de prueba').count()) === 1, 'modo voz rotulado como vista de prueba');
    await p.waitForTimeout(700);
    await p.screenshot({ path: `${CARPETA}/handia-voz.png` });
    await axe(p, 'modo voz');
    await p.waitForURL('**/pedir/**', { timeout: 20000 }).catch(() => {});
    const v = await p.evaluate(() => window.__voz);
    ok(p.url().includes('/pedir/') && new URL(p.url()).searchParams.get('rubro') === 'cerrajeria', 'por voz: arma el pedido de cerrajería y abre Pedir');
    ok(v.escuchas.length >= 3 && v.escuchas.every((e) => e.local === true && e.lang === 'es-AR'), `escucha solo en el dispositivo (${v.escuchas.length} veces)`);
    ok(v.dichos.length > 0 && v.dichos.every((d) => d.voz === 'local-ar'), 'habla solo con la voz del sistema (nunca la de la nube)');
    ok(v.dichos.some((d) => /Podés decir:/.test(d.texto)), 'lee las opciones en voz alta');
    ok(errores.length === 0, `voz: sin errores${errores.length ? ': ' + errores.join(' | ') : ''}`);
    await p.close();
  }

  // 4. Navegador sin reconocimiento local: no escucha (explica por qué) pero lee en voz alta.
  {
    const { p, errores } = await abrir(b, false);
    await p.goto(BASE + '/handia/?escenario=varias-propuestas', { waitUntil: 'networkidle' });
    ok((await p.getByRole('button', { name: 'Dictarle a HandIA' }).count()) === 0, 'sin reconocimiento local: no ofrece dictar');
    await p.getByRole('button', { name: 'Modo voz' }).click();
    const dialogo = p.getByRole('dialog', { name: 'Modo voz' });
    await dialogo.getByText(/Por privacidad, acá no te escucho/).waitFor();
    ok((await dialogo.getByRole('button', { name: 'Hablarle a HandIA' }).count()) === 0, 'sin micrófono en modo voz');
    await p.waitForTimeout(400);
    const v = await p.evaluate(() => window.__voz);
    ok(v.escuchas.length === 0, 'nunca abrió el reconocimiento en la nube');
    ok(v.dichos.length > 0, 'igual lee las respuestas en voz alta');
    await p.screenshot({ path: `${CARPETA}/handia-voz-sin-oido.png` });
    await p.keyboard.press('Escape');
    await dialogo.waitFor({ state: 'detached' });
    ok(await p.getByRole('button', { name: 'Modo voz' }).evaluate((e) => e === document.activeElement), 'Escape cierra y el foco vuelve al botón');
    ok(errores.length === 0, `sin oído: sin errores${errores.length ? ': ' + errores.join(' | ') : ''}`);
    await p.close();
  }

  await b.close();
  console.log(fallas ? `${fallas} comprobación(es) fallaron` : 'HandIA OK');
  process.exitCode = fallas ? 1 : 0;
})();
