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

describe('lenguaje visual de HandIA (R3 · styles/handia.css y components/handia/)', () => {
  const lenguaje = readFileSync('src/styles/handia.css', 'utf8');
  const piezas = readFileSync('src/components/handia/piezas.tsx', 'utf8');
  const tokens = readFileSync('src/styles/tokens.css', 'utf8');

  it('la dirección vive en un solo bloque de tokens', () => {
    expect(tokens).toMatch(/── 4\. Lenguaje de HandIA \(R3\)/);
    for (const t of ['--hia-voz-fondo', '--hia-chat-fondo', '--hia-vidrio', '--hia-curva-entrada'])
      expect(tokens).toContain(`${t}:`);
  });

  it('los botones premium no se animan', () => {
    for (const sel of ['.hia-boton {', '.hia-boton--primario {', '.hia-boton--destacado {']) {
      const i = lenguaje.indexOf(sel);
      expect(i, sel).toBeGreaterThan(-1);
      expect(lenguaje.slice(i, lenguaje.indexOf('}', i)), sel).not.toMatch(/animation|transition/);
    }
  });

  it('con "reducir movimiento" todo queda quieto', () => {
    expect(lenguaje).toMatch(
      /@media \(prefers-reduced-motion: reduce\) \{\s*\[class\*='hia-'\][\s\S]*?animation: none !important/,
    );
  });

  it('las piezas son presentacionales: no escuchan, no suenan, no guardan ni piden datos', () => {
    expect(piezas).not.toMatch(
      /getUserMedia|SpeechRecognition|speechSynthesis|AudioContext|vibrate|localStorage|fetch\(|cliente\./,
    );
  });

  it('el orbe es decorativo y el estado se dice con texto aparte', () => {
    expect(piezas).toMatch(/className=\{`hia-orbe[\s\S]*?aria-hidden="true"/);
  });
});

describe('Inicio con HandIA y modo voz oscuro (ajuste del 07/11)', () => {
  const inicio = readFileSync('src/components/handia-prototipo/InicioChat.tsx', 'utf8');

  it('la voz del prototipo es una simulación: no usa micrófono, voz, audio, almacenamiento ni red', () => {
    expect(inicio).not.toMatch(
      /getUserMedia|SpeechRecognition|speechSynthesis|AudioContext|vibrate|localStorage|sessionStorage|fetch\(|cliente\./,
    );
  });

  it('tacha los datos personales antes de mostrarlos y de pasarlos al motor', () => {
    expect(inicio).toMatch(
      /const limpio = tacharDatosPersonales\(crudo\.trim\(\)\)\.texto;[\s\S]*?mandar\(limpio, \{ texto: limpio \}\)/,
    );
  });

  it('pedir no publica nada: en el prototipo solo avisa qué haría la app', () => {
    expect(inicio).toMatch(/if \(t\.pedir\)[\s\S]*?\(Prototipo\)/);
  });
});

describe('cabecera premium y esfera (ajuste del 07/11)', () => {
  const cab = readFileSync('src/components/handia/cabecera.tsx', 'utf8');
  const esfera = readFileSync('src/components/handia/esfera.tsx', 'utf8');

  it('son presentacionales: sin micrófono, audio, almacenamiento ni red', () => {
    for (const f of [cab, esfera])
      expect(f).not.toMatch(
        /getUserMedia|SpeechRecognition|speechSynthesis|AudioContext|vibrate|localStorage|sessionStorage|fetch\(/,
      );
  });

  it('el estado se dice con texto y el progreso es accesible', () => {
    expect(cab).toMatch(
      /role="progressbar"[\s\S]*?aria-valuetext=\{`Pregunta \$\{progreso\.actual\} de \$\{progreso\.total\}`\}/,
    );
    expect(cab).toMatch(/aria-expanded=\{abierto\}/);
    expect(cab).toMatch(/e\.key === 'Escape'/);
  });

  it('la esfera genera su textura en el navegador (sin imágenes) y es decorativa', () => {
    expect(esfera).toMatch(/feTurbulence/);
    expect(esfera).toMatch(/aria-hidden="true"/);
    expect(esfera).not.toMatch(/<img|next\/image|url\(['"]?\/|\.png|\.webp/);
  });
});
