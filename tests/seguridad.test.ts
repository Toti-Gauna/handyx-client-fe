import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const archivos = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const ruta = join(dir, f);
    return statSync(ruta).isDirectory()
      ? archivos(ruta)
      : /\.(ts|tsx)$/.test(f) && !f.endsWith('.test.ts')
        ? [ruta]
        : [];
  });

describe('guardas de seguridad del front', () => {
  it('no guarda sesión ni datos en el navegador', () => {
    for (const archivo of archivos('src')) {
      const texto = readFileSync(archivo, 'utf8');
      expect(texto, archivo).not.toMatch(
        /\b(localStorage|sessionStorage|indexedDB)\b|document\.cookie/,
      );
    }
  });

  it('las pantallas no hacen fetch ni importan fixtures directo', () => {
    for (const archivo of archivos('src').filter(
      (a) => a.startsWith(join('src', 'app')) || a.startsWith(join('src', 'components')),
    )) {
      const texto = readFileSync(archivo, 'utf8');
      expect(texto, archivo).not.toMatch(/\bfetch\(/);
      expect(texto, archivo).not.toMatch(/data\/mock/);
    }
  });

  it('las únicas variables públicas son las documentadas', () => {
    const usadas = new Set(
      archivos('src').flatMap((a) => readFileSync(a, 'utf8').match(/NEXT_PUBLIC_[A-Z_]+/g) ?? []),
    );
    // NEXT_PUBLIC_MAPA_DATOS no se configura: lo fija next.config.ts (¿estaba el archivo del mapa al compilar?).
    expect([...usadas].sort()).toEqual([
      'NEXT_PUBLIC_API_BASE_URL',
      'NEXT_PUBLIC_ENTORNO',
      'NEXT_PUBLIC_MAPA_DATOS',
    ]);
  });
});

// Copia byte a byte del contrato del BE (dueño). Con el BE al lado se compara en serio.
const be = resolve(process.env.HANDYX_CLIENT_BE ?? '../handyx-client-be', 'src/contracts/v1');
describe.runIf(existsSync(be))('contrato v1', () => {
  it('es idéntico al de handyx-client-be', () => {
    for (const f of readdirSync(be).filter((x) => x.endsWith('.ts')))
      expect(readFileSync(join('src/contracts/v1', f)).equals(readFileSync(join(be, f))), f).toBe(
        true,
      );
  });
});
