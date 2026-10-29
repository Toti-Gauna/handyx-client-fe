// HandIA: detección de rubro, tachado de datos personales y garantías de la pantalla.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { RAPIDAS_HANDIA, detectarRubro, tacharDatosPersonales } from '@/domain/handia';

describe('HandIA · rubro', () => {
  it('reconoce los ejemplos de la demo', () => {
    expect(RAPIDAS_HANDIA.map((t) => detectarRubro(t).candidatos[0])).toEqual([
      'plomeria',
      'electricidad',
      'albanileria',
    ]);
  });

  it('entiende acentos y la ñ ("caño", "calefón")', () => {
    expect(detectarRubro('Se rompió el caño de la ducha').candidatos[0]).toBe('plomeria');
    expect(detectarRubro('El calefón no prende el piloto').candidatos[0]).toBe('gas');
    expect(detectarRubro('El split no enfría').candidatos[0]).toBe('aire_acondicionado');
    expect(detectarRubro('Se trabó la cerradura de la puerta').candidatos[0]).toBe('cerrajeria');
  });

  it('sin pistas no inventa un rubro', () => {
    const d = detectarRubro('Quiero armar un mueble');
    expect(d.candidatos).toEqual([]);
    expect(d.seguridad).toBeNull();
  });

  it('marca la duda cuando dos rubros están cerca', () => {
    expect(detectarRubro('Pierde agua el calefón').dudosa).toBe(true);
  });

  it('olor a gas o chispas: aviso de seguridad primero', () => {
    expect(detectarRubro('Hay olor a gas en la cocina').seguridad).toBe('gas');
    expect(detectarRubro('El enchufe tira chispas').seguridad).toBe('electricidad');
  });
});

describe('HandIA · datos personales', () => {
  it('tacha emails, teléfonos y documentos', () => {
    const r = tacharDatosPersonales(
      'Escribime a ana@example.test o al 223 155-123456, DNI 30.123.456. Pierde la canilla.',
    );
    expect(r.texto).not.toMatch(/ana@example|155-123456|30\.123\.456/);
    expect(r.texto).toContain('Pierde la canilla');
    expect([...r.tachado].sort()).toEqual(['documento', 'email', 'teléfono']);
  });

  it('no confunde precios ni direcciones con teléfonos', () => {
    const r = tacharDatosPersonales('Me pasaron $ 120.000 para Catamarca 1650');
    expect(r.texto).toBe('Me pasaron $ 120.000 para Catamarca 1650');
    expect(r.tachado).toEqual([]);
  });
});

describe('HandIA · pantalla', () => {
  const pagina = readFileSync('src/app/(app)/handia/page.tsx', 'utf8');

  it('tacha antes de enviar y nunca adjunta fotos', () => {
    expect(pagina).toMatch(/tacharDatosPersonales\(crudo\)/);
    expect(pagina).not.toMatch(/type="file"|adjuntar|FotoSubida/);
  });

  it('solo sugiere: la persona confirma y el pedido se revisa antes de mandar', () => {
    expect(pagina).toMatch(/Es otro rubro/);
    expect(pagina).toMatch(/dejarBorrador\(\{ rubro, descripcion: problema \}\)/);
    expect(pagina).not.toMatch(/pedidoCrear/);
  });

  it('con la API real queda inactiva hasta que exista el endpoint', () => {
    expect(readFileSync('src/data/handia.ts', 'utf8')).toMatch(
      /handiaDisponible = esVistaDePrueba[\s\S]*funcion_inactiva/,
    );
  });

  it('el borrador vive en memoria (no en el navegador ni en la URL)', () => {
    const borrador = readFileSync('src/data/borrador.ts', 'utf8');
    expect(borrador).toMatch(/let borrador: Borrador \| null = null;/);
    expect(pagina).not.toMatch(
      /descripcion: problema \}\)\);\s*ir\(ruta\('\/pedir\/', \{[^}]*descripcion/,
    );
  });
});
