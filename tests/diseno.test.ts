// Reglas del sistema visual (Fase 3 · lote 3.1) que se pueden comprobar sin navegador.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { iniciales } from '@/components/Propuesta';

const archivos = (dir: string, ext: RegExp): string[] =>
  readdirSync(dir).flatMap((f) => {
    const ruta = join(dir, f);
    return statSync(ruta).isDirectory() ? archivos(ruta, ext) : ext.test(f) ? [ruta] : [];
  });

/** Texto visible aproximado: sin comentarios (que sí pueden nombrar lo prohibido para prohibirlo). */
const sinComentarios = (s: string) =>
  s
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/^\s*\/\/.*$/gm, '');

const interfaz = [
  ...archivos('src/app', /\.tsx$/),
  ...archivos('src/components', /\.tsx?$/),
  'src/domain/etiquetas.ts',
];

describe('sistema visual', () => {
  it('los colores salen de los tokens: ningún hex fuera de tokens.css', () => {
    // Los archivos del kit los genera scripts/kit.mjs desde la landing (fuente de la marca): traen sus colores.
    const generado = (f: string) =>
      readFileSync(f, 'utf8').startsWith('/* GENERADO por scripts/kit.mjs');
    for (const css of archivos('src/styles', /\.css$/).filter(
      (f) => !f.endsWith('tokens.css') && !generado(f),
    )) {
      expect(sinComentarios(readFileSync(css, 'utf8')), css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    }
    for (const tsx of interfaz.filter((f) => f.endsWith('.tsx'))) {
      expect(readFileSync(tsx, 'utf8'), tsx).not.toMatch(/style=\{\{[^}]*'#[0-9a-f]{3,8}'/i);
    }
  });

  it('el kit de la demo no se edita a mano: se regenera con scripts/kit.mjs', () => {
    for (const f of ['app.css', 'hd.css', 'usuario.css'])
      expect(readFileSync(join('src/styles/kit', f), 'utf8'), f).toMatch(
        /^\/\* GENERADO por scripts\/kit\.mjs desde Handy-landing-page-fe/,
      );
  });

  it('respeta prefers-reduced-motion', () => {
    expect(readFileSync('src/styles/app.css', 'utf8')).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*transition-duration: 0\.01ms/,
    );
  });

  it('no hay rankings, superlativos ni claims de verificación inventados', () => {
    const prohibido =
      /\b(el mejor|la mejor|los mejores|mejor puntuad\w*|recomendad[oa]s? por|top \d|m[aá]s barat[oa]|matriculad[oa]|verificad[oa] por handy\w*|especialistas? verificad[oa]s?|garantizad[oa])\b/i;
    for (const f of interfaz) {
      expect(sinComentarios(readFileSync(f, 'utf8')), f).not.toMatch(prohibido);
    }
  });

  it('"verificado" de una persona solo sale de las verificaciones que manda el backend', () => {
    // El único lugar que nombra verificaciones de especialistas es el diccionario de etiquetas; los componentes
    // lo recorren sobre `especialista.verificaciones`, que viene del contrato.
    const propuesta = readFileSync('src/components/Propuesta.tsx', 'utf8');
    expect(propuesta).toMatch(/e\.verificaciones\.map/);
    expect(propuesta).toMatch(/Todavía sin verificaciones registradas/);
    for (const f of interfaz.filter((x) => x !== 'src/domain/etiquetas.ts')) {
      expect(sinComentarios(readFileSync(f, 'utf8')), f).not.toMatch(
        /(Identidad|Antecedentes|Matrícula) verificad/,
      );
    }
  });

  it('aceptar y rechazar se distinguen por ícono, texto, relleno y posición, y piden confirmación', () => {
    const detalle = readFileSync('src/app/(app)/propuestas/detalle/page.tsx', 'utf8');
    const botones = detalle.slice(detalle.indexOf('decision__botones'));
    const rechazar = botones.indexOf('Rechazar');
    const aceptar = botones.indexOf('Aceptar');
    expect(rechazar).toBeGreaterThan(0);
    expect(aceptar).toBeGreaterThan(rechazar); // rechazar a la izquierda, aceptar a la derecha
    expect(botones.slice(0, rechazar)).toMatch(/variante="peligro"[\s\S]*icono="cerrar"/);
    expect(botones.slice(rechazar, aceptar)).toMatch(/icono="check"/);
    expect(botones.slice(rechazar, aceptar)).not.toMatch(/variante=/); // lleno (primario)
    // Ninguno de los dos actúa directo: abren la hoja de confirmación.
    expect(botones.slice(0, aceptar + 40)).not.toMatch(/onClick=\{\(\) => (aceptar|rechazar)\(/);
    expect(detalle).toMatch(/Sí, acepto estas condiciones/);
    expect(detalle).toMatch(/Sí, rechazar/);
  });

  it('la tarjeta de propuesta no acepta ni rechaza: solo lleva al detalle', () => {
    const tarjeta = readFileSync('src/components/Propuesta.tsx', 'utf8');
    expect(tarjeta).not.toMatch(/propuestaAceptar|propuestaRechazar|<Boton/);
  });

  it('las iniciales del avatar salen del nombre público', () => {
    expect(iniciales('Especialista 1')).toBe('E1');
    expect(iniciales('  ana   paz  ruiz ')).toBe('AP');
    expect(iniciales('Ñandú')).toBe('Ñ');
  });
});

describe('accesibilidad (guardas estáticas; la auditoría completa está en tests/e2e/accesibilidad.cjs)', () => {
  const leer = (f: string) => readFileSync(f, 'utf8');

  it('los dos marcos tienen "Saltar al contenido" y mueven el foco al navegar', () => {
    for (const f of ['src/components/Marco.tsx', 'src/components/MarcoApp.tsx']) {
      expect(leer(f), f).toMatch(/href="#contenido"[\s\S]*Saltar al contenido/);
      expect(leer(f), f).toMatch(/<FocoAlNavegar \/>/);
      expect(leer(f), f).toMatch(/id="contenido"/);
    }
  });

  it('las hojas abren con el foco en el título, no en un botón de confirmar', () => {
    const ui = leer('src/components/ui.tsx');
    expect(ui).toMatch(/showModal\(\);[\s\S]{0,200}refTitulo\.current\?\.focus\(\)/);
    expect(ui).toMatch(/ref=\{refTitulo\} tabIndex=\{-1\}/);
  });

  it('las pastillas anuncian que son un estado y los campos con error toman el foco al enviar', () => {
    const ui = leer('src/components/ui.tsx');
    expect(ui).toMatch(/<span className="sr-only">Estado: <\/span>/);
    expect(ui).toMatch(/enfocarSiPrimerError\(id\)/);
  });

  it('cada pantalla con h1 pone el título de la pestaña', () => {
    expect(leer('src/components/Titulo.tsx')).toMatch(/nivel === 1 \? <TituloDocumento/);
  });

  it('objetivos de 44 px en desplegables, enlaces sueltos y panel de prueba', () => {
    const css = leer('src/styles/componentes.css');
    for (const sel of ['details > summary', '.enlace-tarjeta', '.panel-prueba__abrir']) {
      const i = css.lastIndexOf(`${sel} {`);
      expect(i, sel).toBeGreaterThan(-1);
      expect(css.slice(i, css.indexOf('}', i)), sel).toMatch(/min-height: var\(--toque-min\)/);
    }
  });

  it('el calendario muestra el número del día dentro de su nombre accesible', () => {
    expect(leer('src/components/Calendario.tsx')).toMatch(
      /aria-label=\{`\$\{partes\(f\)\.dia\} · /,
    );
  });
});

describe('pantalla de carga', () => {
  const css = readFileSync('src/styles/splash.css', 'utf8');
  const tsx = readFileSync('src/components/Splash.tsx', 'utf8');
  it('es decorativa, saltable y no aparece con "reducir movimiento"', () => {
    expect(tsx).toMatch(/className="splash" aria-hidden="true"/);
    expect(readFileSync('src/components/SplashControl.tsx', 'utf8')).toMatch(
      /pointerdown[\s\S]*keydown/,
    );
    expect(css).toMatch(/prefers-reduced-motion: reduce\)\s*\{\s*\.splash\s*\{\s*display: none/);
  });
  it('dura menos de 5 s (como la de la landing)', () => {
    const fin = /splash-salir ([\d.]+)s ease-in ([\d.]+)s/.exec(css);
    expect(fin).not.toBeNull();
    expect(Number(fin![1]) + Number(fin![2])).toBeLessThan(5);
  });
  it('los 5 Handys se agarran del logotipo', () => {
    expect([...tsx.matchAll(/img: 'handy-/g)]).toHaveLength(5);
    expect(readFileSync('src/app/layout.tsx', 'utf8')).toMatch(/<Splash \/>/);
  });
});
