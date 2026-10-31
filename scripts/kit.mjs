// Sincroniza el kit visual de la demo de la landing (Handy-landing-page-fe) con la app.
// La demo es la referencia de diseño de Handyx: sus estilos se copian con transformaciones mecánicas (ámbito y nombres)
// y lo propio de la app va en src/styles/kit/ajustes.css. No editar a mano los archivos generados.
//   node scripts/kit.mjs [ruta-a-Handy-landing-page-fe]     (por defecto ../toti-gauna/Handy-landing-page-fe)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const landing = resolve(
  process.argv[2] ?? process.env.LANDING_FE ?? '../toti-gauna/Handy-landing-page-fe',
);
if (!existsSync(join(landing, 'src/styles/demo-app.css'))) {
  console.error(`No encuentro la landing en ${landing}`);
  process.exit(1);
}
const leer = (f) => readFileSync(join(landing, 'src/styles', f), 'utf8');

/** Líneas [desde, hasta) entre dos marcas de sección de un archivo. */
function entre(texto, desde, hasta) {
  const i = texto.indexOf(desde);
  const j = hasta ? texto.indexOf(hasta, i + 1) : texto.length;
  if (i < 0 || j < 0) throw new Error(`No encuentro la sección "${desde}"`);
  return texto.slice(i, j);
}

const transformar = (css) =>
  css
    .replaceAll('[data-demo-pantallas]', '.hx')
    .replaceAll(':where(.demo-pantalla)', ':where(.hx)')
    .replaceAll('.demo-app ', '.hx ')
    .replaceAll("[data-rol='usuario'] ", '.hx ')
    .replaceAll('.demo-pantalla', '.hx-pantalla')
    .replaceAll('.demo-hoja', '.hx-hoja')
    .replaceAll('.demo-velo', '.hx-velo')
    // El ".app" de la landing (la pantalla del celular) choca con el marco de la app: pasa a ".hx-app".
    .replace(/\.app(?![\w-])/g, '.hx-app');

const encabezado = (origen) =>
  `/* GENERADO por scripts/kit.mjs desde Handy-landing-page-fe/src/styles/${origen}. No editar: los cambios propios de\n   la app van en ajustes.css; los de diseño, en la landing (y después se vuelve a sincronizar). */\n`;

const main = leer('main.css');
const piezas = entre(main, '/* ── Pantallas de la app (todo en em', '/* ── Vitrina');
writeFileSync(
  'src/styles/kit/app.css',
  encabezado('main.css (pantallas de la app)') + transformar(piezas),
);
writeFileSync(
  'src/styles/kit/hd.css',
  encabezado('demo-app.css') + transformar(leer('demo-app.css')),
);
writeFileSync(
  'src/styles/kit/usuario.css',
  encabezado('demo-usuario.css') + transformar(leer('demo-usuario.css')),
);
console.log(`Kit sincronizado desde ${landing}`);
