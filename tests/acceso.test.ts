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
  // Fase 7: el alta y el ingreso principales son con código (FlujoCodigo); el alta con invitación y contraseña quedó
  // como respaldo en /registro/invitacion/ y el ingreso con contraseña en /ingresar/clave/.
  const flujo = leer('src/app/(publico)/ingresar/FlujoCodigo.tsx');
  const pasoEmail = leer('src/app/(publico)/ingresar/PasoEmail.tsx');
  const registro = leer('src/app/(publico)/registro/invitacion/page.tsx');
  const ingresar = leer('src/app/(publico)/ingresar/clave/page.tsx');
  const perfil = leer('src/app/(alta)/perfil/page.tsx');
  const ubicacion = leer('src/components/FormUbicacion.tsx');
  const listo = leer('src/app/(alta)/registro/listo/page.tsx');

  it('las aceptaciones arrancan sin tildar', () => {
    // Alta con código: una casilla única, sin tildar, y las versiones se mandan solo si se tildó.
    expect(flujo).toMatch(/const \[acepta, setAcepta\] = useState\(false\);/);
    expect(flujo).toMatch(/if \(alta && !acepta\)/);
    expect(flujo).toMatch(
      /\.\.\.\(alta && acepta \? \{ aceptaciones: aceptacionesVigentes\(\) \} : \{\}\)/,
    );
    expect(pasoEmail).toMatch(/<Casilla marcada=\{acepta\} onCambiar=\{onAcepta\}/);
    expect(pasoEmail).not.toMatch(/defaultChecked|marcada=\{true\}|marcada\s*\/?>/);
    // Alta de respaldo con invitación: dos casillas, las dos sin tildar.
    expect(registro).toMatch(
      /useState\(false\);\s*const \[privacidad, setPrivacidad\] = useState\(false\)/,
    );
  });

  it('confirmar el email es un paso simulado solo en la vista de prueba', () => {
    // Con código, el email queda confirmado al escribir el código que llegó (no hay paso simulado). En el alta de
    // respaldo con contraseña, la confirmación sigue siendo simulada solo en la vista de prueba.
    expect(registro).toMatch(/const TOTAL = esVistaDePrueba \? 5 : 4;/);
    expect(registro).toMatch(/if \(esVistaDePrueba\) setPaso\('verificar'\);/);
    expect(flujo).not.toMatch(/'verificar'/);
  });

  it('un rechazo del servidor vuelve al paso del dato', () => {
    expect(flujo).toMatch(/const destino = pasoPorError\(r\.error\);/);
    expect(flujo).toMatch(/setPaso\(destino\);/);
    expect(registro).toMatch(/PASO_DEL_CAMPO\[campo\]/);
    expect(ingresar).toMatch(/erroresDe\(r\.error\)\.email\) setPaso\(1\)/);
  });

  it('el navegador pregunta por ubicación y avisos solo después de un toque (pre-permiso)', () => {
    expect(perfil).not.toMatch(/useEffect/);
    expect(perfil).toMatch(/onClick=\{\(\) => void pedirAvisos\(\)\}/);
    // El permiso de avisos se pide solo dentro de pedirAvisos (el toque en «Permitir avisos»).
    expect(perfil.match(/activarPush\(\)/g)).toHaveLength(1);
    expect(perfil).toMatch(
      /async function pedirAvisos\(\) \{\s*setAvisos\([^;]*;\s*try \{\s*const r = await activarPush\(\)/,
    );
    // La ubicación vive en FormUbicacion: una sola llamada, dentro de `usar`, que dispara el botón.
    expect(ubicacion.match(/pedirUbicacionUnaVez\(\)/g)).toHaveLength(1);
    expect(ubicacion).toMatch(/async function usar\(\)[^}]*await pedirUbicacionUnaVez\(\)/);
    expect(ubicacion).toMatch(/onClick=\{\(\) => void usar\(\)\}/);
    for (const efecto of ubicacion.match(/useEffect\([\s\S]*?\}?, \[[^\]]*\]\)/g) ?? [])
      expect(efecto).not.toMatch(/usar\(|pedirUbicacion/);
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
