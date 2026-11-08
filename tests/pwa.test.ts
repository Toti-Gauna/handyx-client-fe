// PWA, sin conexión y movimiento (Fase 3 · lote 3.3). La prueba en navegador está en tests/e2e/pwa.cjs.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import manifest from '@/app/manifest';

const sw = readFileSync('public/sw.js', 'utf8');
const precarga = (): string[] => {
  const lista = /const PRECARGA = \[([\s\S]*?)\];/.exec(sw)?.[1] ?? '';
  return [...lista.matchAll(/'([^']+)'/g)].map((m) => m[1]!);
};
const archivos = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const ruta = join(dir, f);
    return statSync(ruta).isDirectory() ? archivos(ruta) : [ruta];
  });

describe('service worker', () => {
  it('todo lo que precarga existe (si falta uno, la instalación falla entera)', () => {
    const lista = precarga();
    expect(lista.length).toBeGreaterThan(5);
    for (const ruta of lista) {
      const existe = ruta.endsWith('/')
        ? existsSync(join('src/app/(publico)', ruta, 'page.tsx'))
        : existsSync(join('public', ruta));
      expect(existe, ruta).toBe(true);
    }
  });

  it('no toca escrituras, la API ni terceros', () => {
    expect(sw).toMatch(/if \(pedido\.method !== 'GET'\) return;/);
    expect(sw).toMatch(/if \(url\.origin !== self\.location\.origin\) return;/);
    expect(sw).not.toMatch(/\/v1\//);
    expect(sw).not.toMatch(/'(periodic)?sync'|backgroundFetch|postMessage/i); // nada se encola ni se reenvía solo
  });

  it('guarda las páginas por ruta, sin la query (ningún id queda en el caché)', () => {
    expect(sw).toMatch(/const clave = url\.origin \+ url\.pathname;/);
    expect(sw).toMatch(/respuesta\.ok && respuesta\.type === 'basic'/);
  });

  it('sin red y sin página guardada, muestra /sin-conexion/', () => {
    expect(sw).toMatch(/c\.match\('\/sin-conexion\/'\)/);
  });

  it('se registra solo en el build de producción', () => {
    const pwa = readFileSync('src/components/Pwa.tsx', 'utf8');
    expect(pwa).toMatch(/process\.env\.NODE_ENV !== 'production'/);
    expect(readFileSync('src/app/layout.tsx', 'utf8')).toMatch(/<RegistroSW \/>/);
  });

  it('sin conexión, el mock falla igual que el adaptador HTTP (nunca devuelve datos)', () => {
    expect(readFileSync('src/data/mock/cliente-mock.ts', 'utf8')).toMatch(
      /navigator\.onLine === false/,
    );
  });
});

describe('manifest', () => {
  const m = manifest();
  it('es instalable y coherente con la marca', () => {
    expect(m.display).toBe('standalone');
    expect(m.start_url).toBe('/inicio/');
    expect(m.lang).toBe('es-AR');
    const azul = /--color-azul: (#[0-9a-f]{6});/.exec(
      readFileSync('src/styles/tokens.css', 'utf8'),
    );
    expect(m.theme_color).toBe(azul?.[1]);
  });
  it('tiene íconos 192 y 512, normales y adaptables, que existen', () => {
    for (const proposito of ['any', 'maskable'])
      for (const tam of ['192x192', '512x512'])
        expect(m.icons?.some((i) => i.purpose === proposito && i.sizes === tam)).toBe(true);
    for (const i of m.icons ?? []) expect(existsSync(join('public', i.src)), i.src).toBe(true);
  });
  it('los atajos van a pantallas que existen', () => {
    for (const a of m.shortcuts ?? [])
      expect(existsSync(join('src/app/(app)', a.url, 'page.tsx')), a.url).toBe(true);
  });
});

describe('movimiento', () => {
  const css = archivos('src/styles')
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(f, 'utf8'))
    .join('\n');

  it('nunca anima botones ni la decisión de aceptar (nada que empuje a aceptar)', () => {
    const reglas = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)];
    for (const [, selector, cuerpo] of reglas) {
      if (/animation(-name)?:/.test(cuerpo!) && !/none/.test(cuerpo!))
        if (!/aria-busy/.test(selector!))
          // la ruedita de "enviando" no apura nada
          expect(selector, selector).not.toMatch(
            /\.boton|\.hd-boton|\.du-oferta__btn|\.decision|button/,
          );
    }
  });

  it('sin sonido ni vibración (salvo el tono del modo voz, apagado hasta que la persona lo prende)', () => {
    // Única excepción de prototipo: la fase R de HandIA (/diseno/handia/, solo vista de prueba) los muestra para
    // que Ignacio los apruebe (R5). Lo aprobado en el lienzo de la Fase 7 (I-VozAjustes, design/usuario/gen/
    // fila_inicio.py): «Sonido al empezar y terminar», un tono corto sin vibrar, APAGADO por defecto. Nada más suena.
    const prototipo = /src\/components\/handia-prototipo\//;
    const tono = 'src/components/handia/voz-piezas.tsx';
    for (const f of archivos('src').filter((x) => /\.(ts|tsx)$/.test(x) && !prototipo.test(x))) {
      const fuente = readFileSync(f, 'utf8');
      expect(fuente, f).not.toMatch(/new Audio\(|\.vibrate\(|<audio\b/);
      if (f.replaceAll('\\', '/') !== tono) expect(fuente, f).not.toMatch(/AudioContext/);
    }
    // El tono: generado en el momento (sin archivos ni red), solo con el ajuste prendido, y el ajuste arranca apagado
    // y no se guarda.
    const piezas = readFileSync(tono, 'utf8');
    expect(piezas.match(/new AudioContext\(\)/g)).toHaveLength(1);
    expect(piezas).toMatch(
      /if \(!activo \|\| typeof window === 'undefined' \|\| !\('AudioContext' in window\)\) return;\s*const ctx = new AudioContext\(\);/,
    );
    const panel = readFileSync('src/components/handia/voz-panel.tsx', 'utf8');
    expect(panel).toMatch(
      /const \[sonido, setSonido\] = useState\(false\);\s*useTono\(voz\.escuchando, sonido\);/,
    );
    expect(piezas).toMatch(/etiqueta="Sonido al empezar y terminar"[\s\S]*activo=\{sonido\}/);
  });

  it('prefers-reduced-motion anula animaciones (también del fondo de las hojas) y transiciones', () => {
    expect(css).toMatch(
      /prefers-reduced-motion: reduce\)[\s\S]*::backdrop[\s\S]*animation-duration: 0\.01ms[\s\S]*transition-duration: 0\.01ms/,
    );
  });
});
