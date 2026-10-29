import { describe, expect, it } from 'vitest';
import { EntornoInvalido, leerEntorno } from '../src/config/entorno.ts';

describe('entorno del build', () => {
  it('sin API es la vista de prueba (mock)', () => {
    expect(leerEntorno({})).toEqual({ entorno: 'local', modo: 'mock', apiBaseUrl: null });
    expect(leerEntorno({ NEXT_PUBLIC_ENTORNO: 'preview', NEXT_PUBLIC_API_BASE_URL: '' }).modo).toBe(
      'mock',
    );
  });

  it('producción nunca cae en mocks', () => {
    expect(() => leerEntorno({ NEXT_PUBLIC_ENTORNO: 'produccion' })).toThrow(EntornoInvalido);
    expect(
      leerEntorno({
        NEXT_PUBLIC_ENTORNO: 'produccion',
        NEXT_PUBLIC_API_BASE_URL: 'https://api.handyc.com',
      }),
    ).toEqual({
      entorno: 'produccion',
      modo: 'http',
      apiBaseUrl: 'https://api.handyc.com',
    });
  });

  it('la API es un origen HTTPS (http solo a localhost en local)', () => {
    expect(leerEntorno({ NEXT_PUBLIC_API_BASE_URL: 'http://127.0.0.1:3100' }).apiBaseUrl).toBe(
      'http://127.0.0.1:3100',
    );
    for (const url of [
      'http://api.handyc.com',
      'https://api.handyc.com/v1',
      'https://usuario:clave@api.handyc.com',
      'https://api.handyc.com?x=1',
      'no-es-url',
    ])
      expect(() => leerEntorno({ NEXT_PUBLIC_API_BASE_URL: url }), url).toThrow(EntornoInvalido);
    expect(() =>
      leerEntorno({
        NEXT_PUBLIC_ENTORNO: 'preview',
        NEXT_PUBLIC_API_BASE_URL: 'http://127.0.0.1:3100',
      }),
    ).toThrow(EntornoInvalido);
  });

  it('rechaza un entorno desconocido', () => {
    expect(() => leerEntorno({ NEXT_PUBLIC_ENTORNO: 'staging' })).toThrow(EntornoInvalido);
  });
});
