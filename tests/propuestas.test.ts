// Propuestas y decisión (lote 3.5): perfil con datos reales, confirmar el turno y "deslizá para confirmar".
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { UMBRAL_DESLIZAR } from '@/components/Deslizar';

const leer = (f: string) => readFileSync(f, 'utf8');
const deslizar = leer('src/components/Deslizar.tsx');
const detalle = leer('src/app/(app)/propuestas/detalle/page.tsx');
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
    expect(detalle).toMatch(/<DeslizarConfirmar[\s\S]*Sí, acepto estas condiciones/);
  });

  it('nada se mueve solo para apurar la decisión', () => {
    const bloque = ajustes.slice(ajustes.indexOf('/* Deslizá para confirmar'));
    expect(bloque).not.toMatch(/animation:/);
  });
});

describe('propuesta', () => {
  it('el perfil muestra solo verificaciones reales (o que no hay)', () => {
    expect(detalle).toMatch(/<ChipsVerificacion e=\{e\} \/>/);
    expect(detalle).toMatch(/Sin verificaciones todavía/);
  });

  it('el total final está a la vista antes de decidir, con el desglose', () => {
    expect(detalle).toMatch(/Total final para vos/);
    expect(detalle).toMatch(/Tarifa de Handyx/);
  });

  it('la forma de pago se informa, no se guarda una elección que el contrato no tiene', () => {
    expect(detalle).toMatch(/lo elegís cuando termina el trabajo/);
    expect(detalle).not.toMatch(/aria-pressed[^\n]*du-pago/);
  });

  it('"Elegir" abre la confirmación, que igual pide deslizar o confirmar', () => {
    expect(detalle).toMatch(/params\.get\('elegir'\) === '1' \? 'aceptar' : null/);
    expect(detalle).toMatch(/abierta=\{hoja === 'aceptar' && decidible\}/);
  });
});
