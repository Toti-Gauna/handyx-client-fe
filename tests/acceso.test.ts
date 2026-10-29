// Acceso y onboarding del rediseño (lote 3.2): medidor de contraseña y garantías de las pantallas.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { fuerzaContrasena } from '@/domain/formularios';

const leer = (f: string) => readFileSync(f, 'utf8');

describe('medidor de contraseña', () => {
  it('por debajo del mínimo del contrato dice cuánto falta', () => {
    expect(fuerzaContrasena('')).toMatchObject({ nivel: 0 });
    expect(fuerzaContrasena('abc123')).toEqual({ nivel: 0, texto: 'Muy corta: faltan 4' });
  });

  it('sube con largo y variedad', () => {
    expect(fuerzaContrasena('abcdefghij').nivel).toBe(1);
    expect(fuerzaContrasena('abcdefghij7').nivel).toBe(2);
    expect(fuerzaContrasena('Una-Clave-Larga-2026').nivel).toBe(3);
  });

  it('repeticiones y secuencias obvias no pasan de "aceptable"', () => {
    expect(fuerzaContrasena('aaaaaaaaaaaaaaaa').nivel).toBe(1);
    expect(fuerzaContrasena('1234567890Ab!').nivel).toBe(1);
  });
});

describe('pantallas de acceso', () => {
  const registro = leer('src/app/(publico)/registro/page.tsx');
  const ingresar = leer('src/app/(publico)/ingresar/page.tsx');
  const perfil = leer('src/app/(alta)/perfil/page.tsx');
  const listo = leer('src/app/(alta)/registro/listo/page.tsx');

  it('las aceptaciones arrancan sin tildar', () => {
    expect(registro).toMatch(
      /useState\(false\);\s*const \[privacidad, setPrivacidad\] = useState\(false\)/,
    );
  });

  it('confirmar el email es un paso simulado solo en la vista de prueba', () => {
    expect(registro).toMatch(/const TOTAL = esVistaDePrueba \? 5 : 4;/);
    expect(registro).toMatch(/if \(esVistaDePrueba\) setPaso\('verificar'\);/);
  });

  it('un rechazo del servidor vuelve al paso del dato', () => {
    expect(registro).toMatch(/PASO_DEL_CAMPO\[campo\]/);
    expect(ingresar).toMatch(/erroresDe\(r\.error\)\.email\) setPaso\(1\)/);
  });

  it('el navegador pregunta por ubicación y avisos solo después de un toque (pre-permiso)', () => {
    expect(perfil).not.toMatch(/useEffect/);
    expect(perfil).toMatch(/onClick=\{async \(\) => \{\s*await geo\.usar\(\);/);
    expect(perfil).toMatch(/onClick=\{\(\) => void pedirAvisos\(\)\}/);
  });

  it('cada paso del perfil guarda con la versión que devolvió el anterior (sin conflicto falso)', () => {
    const form = leer('src/components/FormPerfil.tsx');
    expect(form).toMatch(/setGuardada\(r\.datos\.perfilVersion\)/);
    expect(form).toMatch(/version: number|\{ version \}/);
  });

  it('el fee 0 % se avisa al terminar el registro, sin presentarlo como descuento', () => {
    expect(listo).toMatch(
      /Tarifa de Handy: \{resumen\.porcentajeUsuario\} hasta el \{resumen\.hasta\}/,
    );
    expect(listo).toMatch(/No es un descuento/);
  });
});
