// Prototipo del rediseño de HandIA (fase R, /diseno/handia/): reglas que se comprueban sin navegador.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const pagina = readFileSync('src/app/(prototipo)/diseno/handia/page.tsx', 'utf8');
const proto = readFileSync('src/components/handia-prototipo/Prototipo.tsx', 'utf8');
const css = readFileSync('src/styles/handia-prototipo.css', 'utf8');

describe('prototipo de HandIA', () => {
  it('solo existe en la vista de prueba', () => {
    expect(pagina).toMatch(/if \(!esVistaDePrueba\) notFound\(\)/);
  });

  it('es una maqueta: no escucha, no habla, no guarda ni pide nada', () => {
    expect(proto).not.toMatch(
      /getUserMedia|SpeechRecognition|speechSynthesis|localStorage|sessionStorage|indexedDB|fetch\(|cliente\./,
    );
  });

  it('los botones de pedir no se animan', () => {
    const i = css.indexOf('.hxp-boton {');
    expect(i).toBeGreaterThan(-1);
    expect(css.slice(i, css.indexOf('}', i))).not.toMatch(/animation|transition/);
  });

  it('con "reducir movimiento" todo queda quieto', () => {
    expect(css).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{\s*\.hxp \*,[\s\S]*?animation: none !important/,
    );
  });

  it('el aviso de riesgo es el mismo texto que usa el motor', () => {
    expect(proto).toMatch(/AVISO_SEGURIDAD\.gas/);
  });
});
