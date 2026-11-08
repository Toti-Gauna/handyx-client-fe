// Propuestas y decisión (lote 3.5): perfil con datos reales, confirmar el turno y "deslizá para confirmar".
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { UMBRAL_DESLIZAR } from '@/components/Deslizar';

const leer = (f: string) => readFileSync(f, 'utf8');
const deslizar = leer('src/components/Deslizar.tsx');
const detalle = leer('src/app/(app)/propuestas/detalle/page.tsx');
// Fase 7: el cuerpo de la propuesta y las hojas de decisión se separaron de la página.
const cuerpo = leer('src/app/(app)/propuestas/detalle/_Cuerpo.tsx');
const hojas = leer('src/app/(app)/propuestas/detalle/_Hojas.tsx');
const tarjetaPropuesta = leer('src/components/Propuesta.tsx');
const decision = [detalle, cuerpo, hojas].join('\n');
const ajustes = leer('src/styles/kit/ajustes.css');

describe('deslizá para confirmar', () => {
  it('hay que llevar la perilla casi hasta el final; si no, vuelve', () => {
    expect(UMBRAL_DESLIZAR).toBeGreaterThanOrEqual(0.85);
    expect(deslizar).toMatch(/if \(x < a\.maximo \* UMBRAL_DESLIZAR\) \{\s*setX\(0\);/);
  });

  it('si el servidor rechaza, la perilla vuelve al principio', () => {
    expect(deslizar).toMatch(/if \(!ok\) setX\(0\);/);
  });

  it('siempre tiene al lado un botón que hace lo mismo sin arrastrar (WCAG 2.5.7)', () => {
    expect(deslizar).toMatch(/aria-hidden="true"/);
    // En la hoja de aceptar: el deslizador y, justo debajo, el botón que hace lo mismo (mismo onAceptar).
    expect(hojas).toMatch(
      /<DeslizarConfirmar[\s\S]*onConfirmar=\{onAceptar\}[\s\S]*onClick=\{\(\) => void onAceptar\(\)\}>\s*Sí, acepto estas condiciones/,
    );
  });

  it('nada se mueve solo para apurar la decisión', () => {
    // Solo el bloque del deslizador: hasta la sección siguiente de ajustes.css.
    const inicio = ajustes.indexOf('/* Deslizá para confirmar');
    const fin = ajustes.indexOf('/* ──', inicio);
    const bloque = ajustes.slice(inicio, fin === -1 ? undefined : fin);
    expect(bloque).toMatch(/\.du-deslizar \{/);
    expect(bloque).not.toMatch(/animation:/);
  });
});

describe('propuesta', () => {
  it('el perfil muestra solo verificaciones reales (o que no hay)', () => {
    expect(cuerpo).toMatch(/<Verificaciones e=\{e\} conVacio \/>/);
    // Verificaciones solo las que manda el servidor; si no hay, se dice.
    expect(tarjetaPropuesta).toMatch(/e\.verificaciones\.map/);
    expect(tarjetaPropuesta).toMatch(/Todavía sin verificaciones registradas/);
  });

  it('el total final está a la vista antes de decidir, con el desglose', () => {
    expect(cuerpo).toMatch(/Total final para vos/);
    expect(cuerpo).toMatch(/Tarifa de Handyx \(/);
    expect(cuerpo).toMatch(/<Precio /);
    // Y en la hoja, antes de confirmar, el total sigue a la vista con la tarifa.
    expect(hojas).toMatch(/<Monto centavos=\{totalDe\(p\)\}/);
    expect(hojas).toMatch(/Tarifa de Handyx: \{porcentaje\(p\.comisionHandy\.bp\)\}/);
  });

  it('la forma de pago se informa, no se guarda una elección que el contrato no tiene', () => {
    expect(hojas).toMatch(/lo elegís cuando termina el trabajo/);
    expect(decision).not.toMatch(/aria-pressed[^\n]*du-pago/);
    expect(decision).not.toMatch(/medioPago|formaPago|metodoPago/);
  });

  it('"Elegir" abre la confirmación, que igual pide deslizar o confirmar', () => {
    expect(detalle).toMatch(/params\.get\('elegir'\) === '1' \? 'aceptar' : null/);
    expect(detalle).toMatch(/abierta=\{hoja === 'aceptar' && decidible\}/);
  });
});
