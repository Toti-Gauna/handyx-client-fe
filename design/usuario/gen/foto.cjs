// Capturas de pantallas del lienzo (para revisar a ojo): node usuario/gen/foto.cjs <salida> <archivo.dc.html…>
// Las imágenes de los Handys se sirven desde el lienzo (/_blob/…): acá se ven vacías.
const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch();
  const [out, ...files] = process.argv.slice(2);
  for (const f of files) {
    const h = fs.readFileSync('usuario/project/' + f, 'utf8');
    const m = h.match(/"width":(\d+),"height":(\d+)/);
    const p = await b.newPage({ viewport: { width: m ? +m[1] : 390, height: m ? +m[2] : 844 } });
    const fuentes = (h.match(/<link rel="stylesheet"[^>]*>/) || [''])[0];
    const cuerpo = h.split('<x-dc>')[1].split('</x-dc>')[0].replace(/<helmet>[\s\S]*?<\/helmet>/, '');
    await p.setContent(`<!doctype html><html lang="es"><head><meta charset="utf-8">${fuentes}</head><body style="margin:0">${cuerpo}</body></html>`, { waitUntil: 'networkidle' }).catch(() => {});
    await p.screenshot({ path: `${out}/${f.replace('.dc.html', '.png')}` });
    await p.close();
  }
  await b.close();
})();
