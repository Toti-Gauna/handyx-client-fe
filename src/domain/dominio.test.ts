import { describe, expect, it } from 'vitest';
import type { EstadoFee } from '../contracts/v1/fee.ts';
import { POLITICA_DEMO } from '../data/mock/fixtures.ts';
import { pesos, porcentaje } from './dinero.ts';
import { cuentaRegresiva, resumirFee, textoFee } from './fee.ts';
import {
  diaMes,
  fechaDeInstante,
  grillaMes,
  hoyEnArgentina,
  horaDeInstante,
  sumarDias,
} from './fechas.ts';

describe('dinero en centavos', () => {
  it('formatea pesos argentinos como la landing', () => {
    expect(pesos(4500000)).toBe('$ 45.000');
    expect(pesos(4500050)).toBe('$ 45.000,50');
    expect(pesos(0)).toBe('$ 0');
    expect(pesos(123456789)).toBe('$ 1.234.567,89');
  });

  it('rechaza floats y negativos', () => {
    expect(() => pesos(45000.5)).toThrow();
    expect(() => pesos(-1)).toThrow();
  });

  it('puntos básicos a porcentaje', () => {
    expect(porcentaje(0)).toBe('0 %');
    expect(porcentaje(500)).toBe('5 %');
    expect(porcentaje(250)).toBe('2,5 %');
    expect(porcentaje(205)).toBe('2,05 %');
  });
});

describe('fechas en Buenos Aires', () => {
  it('un instante UTC se muestra en la fecha de Buenos Aires', () => {
    // 10/12 02:30 UTC todavía es 9/12 en Buenos Aires.
    expect(fechaDeInstante('2026-12-10T02:30:00.000Z')).toBe('2026-12-09');
    expect(diaMes('2026-12-10T03:00:00.000Z')).toBe('10/12');
    expect(horaDeInstante('2026-11-17T06:00:00.000Z')).toBe('03:00');
    expect(hoyEnArgentina(new Date('2026-11-18T01:00:00.000Z'))).toBe('2026-11-17');
  });

  it('calendario y sumas de días', () => {
    expect(sumarDias('2026-11-30', 1)).toBe('2026-12-01');
    const noviembre = grillaMes(2026, 11);
    expect(noviembre.length % 7).toBe(0);
    expect(noviembre.filter(Boolean)).toHaveLength(30);
  });
});

describe('fee 0 % de la demo', () => {
  const estado = (cambios: Partial<EstadoFee> = {}): EstadoFee => ({
    vigente: POLITICA_DEMO,
    siguiente: null,
    aceptada: null,
    ahora: '2026-11-17T15:00:00.000Z',
    ...cambios,
  });

  it('avisa 0 % hasta el 10/12 y que el precio del especialista no cambia', () => {
    const r = resumirFee(estado());
    expect(r.tipo).toBe('demo');
    if (r.tipo !== 'demo') return;
    expect(r.porcentajeUsuario).toBe('0 %');
    expect(r.hasta).toBe('10/12');
    expect(textoFee(r)).toContain('0 % hasta el 10/12');
    expect(textoFee(r)).toContain('no cambia');
    expect(textoFee(r)).not.toMatch(/gratis|descuento/i);
  });

  it('el contador usa el reloj del servidor y termina en cero', () => {
    expect(cuentaRegresiva('2026-11-17T15:00:00.000Z', POLITICA_DEMO.vigenteHasta ?? '')).toEqual({
      dias: 22,
      horas: 12,
      minutos: 0,
      terminada: false,
    });
    expect(
      cuentaRegresiva('2026-12-11T00:00:00.000Z', POLITICA_DEMO.vigenteHasta ?? '').terminada,
    ).toBe(true);
  });

  it('el modal aparece hasta aceptar esta versión', () => {
    const pendiente = resumirFee(estado());
    const aceptada = resumirFee(
      estado({
        aceptada: {
          politicaId: POLITICA_DEMO.id,
          version: POLITICA_DEMO.version,
          aceptadaEn: '2026-11-17T15:00:00.000Z',
        },
      }),
    );
    expect(pendiente.tipo === 'demo' && pendiente.pendienteDeAceptar).toBe(true);
    expect(aceptada.tipo === 'demo' && aceptada.pendienteDeAceptar).toBe(false);
  });

  it('sin tarifa posterior aprobada no se anuncia ninguna', () => {
    const r = resumirFee(
      estado({ siguiente: { vigenteDesde: '2026-12-10T03:00:00.000Z', aprobada: false } }),
    );
    expect(r.tipo === 'demo' && r.despues).toBe('sin_definir');
    expect(resumirFee(null).tipo).toBe('sin_dato');
  });
});
