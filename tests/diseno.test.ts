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
    for (const css of archivos('src/styles', /\.css$/).filter((f) => !f.endsWith('tokens.css'))) {
      expect(sinComentarios(readFileSync(css, 'utf8')), css).not.toMatch(/#[0-9a-f]{3,8}\b/i);
    }
    for (const tsx of interfaz.filter((f) => f.endsWith('.tsx'))) {
      expect(readFileSync(tsx, 'utf8'), tsx).not.toMatch(/style=\{\{[^}]*'#[0-9a-f]{3,8}'/i);
    }
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
