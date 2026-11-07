// Chequeos de todas las pantallas del lienzo del usuario (se corre desde handyx-client-fe/design):
//   node usuario/gen/revisar.cjs [prefijo]
// axe-core (WCAG 2 A y AA), áreas táctiles de 44 px, textos de 11 px o más, contenido tapado por lo fijo de abajo
// (data-c contra data-f) y nada más ancho que la pantalla. Igual que design/deluxe/gen/revisar.cjs del especialista.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const axe = fs.readFileSync(require.resolve('axe-core/axe.min.js', { paths: [path.resolve(__dirname, '../../..')] }), 'utf8');

(async () => {
  const b = await chromium.launch();
  const dir = 'usuario/project';
  const solo = process.argv[2] || '';
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.dc.html') && f.startsWith(solo));
  const resumen = {};
  const por = {};
  for (const f of files) {
    const h = fs.readFileSync(path.join(dir, f), 'utf8');
    const m = h.match(/"width":(\d+),"height":(\d+)/);
    const W = m ? +m[1] : 390;
    const H = m ? +m[2] : 844;
    const p = await b.newPage({ viewport: { width: W, height: H } });
    const cuerpo = h.split('<x-dc>')[1].split('</x-dc>')[0].replace(/<helmet>[\s\S]*?<\/helmet>/, '');
    await p.setContent(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${f}</title></head><body style="margin:0;font-family:'DM Sans',sans-serif">${cuerpo}</body></html>`);
    await p.addScriptTag({ content: axe });
    const r = await p.evaluate(async ([W, H]) => {
      const res = await axe.run(document, {
        runOnly: ['wcag2a', 'wcag2aa'],
        rules: { 'page-has-heading-one': { enabled: false }, 'landmark-one-main': { enabled: false }, region: { enabled: false } },
      });
      const viol = res.violations.map((v) => ({ id: v.id, n: v.nodes.length, ej: v.nodes.slice(0, 2).map((n) => n.target.join(' ') + ' :: ' + (n.any[0]?.message || n.all[0]?.message || '').slice(0, 100)) }));
      const chicos = [...document.querySelectorAll('a,button,input,[role=switch],[role=tab],[role=radio],[role=checkbox]')]
        .filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.width < 44 || r.height < 44) && !e.closest('p'); })
        .map((e) => (e.textContent.trim().slice(0, 24) || e.getAttribute('aria-label') || e.tagName) + ` ${Math.round(e.getBoundingClientRect().width)}x${Math.round(e.getBoundingClientRect().height)}`);
      const letra = [...document.querySelectorAll('body *')]
        .filter((e) => e.closest('svg') === null && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && parseFloat(getComputedStyle(e).fontSize) < 11)
        .map((e) => e.textContent.trim().slice(0, 20));
      const fijos = [...document.querySelectorAll('[data-f]')].map((e) => e.getBoundingClientRect().top);
      const topFijo = fijos.length ? Math.min(...fijos) : H;
      const finC = Math.max(0, ...[...document.querySelectorAll('[data-c]')].map((e) => e.getBoundingClientRect().bottom));
      const ancho = Math.max(...[...document.querySelectorAll('body *')].filter((e) => !e.closest('[aria-hidden=true]') && getComputedStyle(e).position !== 'fixed').map((e) => e.getBoundingClientRect().right));
      return { viol, chicos, letra, tapa: finC > topFijo + 1 ? Math.round(finC - topFijo) : 0, alto: finC > H ? Math.round(finC - H) : 0, ancho: ancho > W + 1 ? Math.round(ancho) : 0 };
    }, [W, H]);
    por[f] = r;
    for (const v of r.viol) {
      resumen[v.id] = resumen[v.id] || { pantallas: 0, nodos: 0, ej: [] };
      resumen[v.id].pantallas++;
      resumen[v.id].nodos += v.n;
      if (resumen[v.id].ej.length < 6) resumen[v.id].ej.push(f + ' → ' + v.ej[0]);
    }
    await p.close();
  }
  await b.close();
  fs.writeFileSync('usuario/gen/revision.json', JSON.stringify(por, null, 1));
  const lista = (k, fmt) => Object.entries(por).filter(([, r]) => (Array.isArray(r[k]) ? r[k].length : r[k])).map(([f, r]) => f + ': ' + fmt(r[k]));
  console.log('Pantallas:', files.length);
  console.log('AXE:', Object.keys(resumen).length ? JSON.stringify(resumen, null, 1) : '0 errores');
  const ch = lista('chicos', (x) => x.length + ' → ' + x.slice(0, 4).join(' | '));
  console.log('TOQUE < 44 px:', ch.length ? '\n' + ch.join('\n') : '0');
  const le = lista('letra', (x) => x.length + ' → ' + x.slice(0, 3).join(' | '));
  console.log('LETRA < 11 px:', le.length ? '\n' + le.join('\n') : '0');
  const ta = lista('tapa', (x) => x + ' px');
  console.log('TAPADO por lo fijo:', ta.length ? '\n' + ta.join('\n') : '0');
  const al = lista('alto', (x) => x + ' px');
  console.log('SE SALE por abajo:', al.length ? '\n' + al.join('\n') : '0');
  const an = lista('ancho', (x) => x + ' px');
  console.log('MÁS ANCHO que la pantalla:', an.length ? '\n' + an.join('\n') : '0');
})();
