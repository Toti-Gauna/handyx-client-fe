// HandIA premium · modo voz: solo reconocimiento en el dispositivo y voces del sistema (src/domain/voz.ts).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  type VozSistema,
  capacidadOido,
  comandoVoz,
  elegirVoz,
  forzarLocal,
  instalarOido,
  paraHablar,
} from '@/domain/voz';

describe('Modo voz · escuchar sin mandar la voz afuera', () => {
  it('sin reconocimiento local (aunque exista SpeechRecognition "en la nube") no escucha', async () => {
    expect(await capacidadOido(null)).toEqual({ oido: 'no', idioma: null });
    expect(await capacidadOido({})).toEqual({ oido: 'no', idioma: null });
  });

  it('API actual (available + processLocally): toma el español más cercano disponible', async () => {
    const pedidos: unknown[] = [];
    const ctor = {
      available: async (o: { langs: string[]; processLocally: boolean }) => {
        pedidos.push(o);
        return o.langs[0] === 'es-ES' ? ('available' as const) : ('unavailable' as const);
      },
    };
    expect(await capacidadOido(ctor)).toEqual({ oido: 'local', idioma: 'es-ES' });
    expect(pedidos.every((p) => (p as { processLocally: boolean }).processLocally === true)).toBe(
      true,
    );
  });

  it('API anterior (availableOnDevice) y paquete para descargar', async () => {
    expect(
      await capacidadOido({
        availableOnDevice: async (l) => (l === 'es-AR' ? 'available' : false),
      }),
    ).toEqual({
      oido: 'local',
      idioma: 'es-AR',
    });
    expect(await capacidadOido({ available: async () => 'downloadable' })).toEqual({
      oido: 'descargable',
      idioma: 'es-AR',
    });
    let instalado = '';
    expect(
      await instalarOido(
        { install: async (o) => ((instalado = o.langs[0]!), o.processLocally) },
        'es-AR',
      ),
    ).toBe(true);
    expect(instalado).toBe('es-AR');
  });

  it('si el navegador falla al consultar, no escucha', async () => {
    expect(
      await capacidadOido({
        available: async () => {
          throw new Error('x');
        },
      }),
    ).toEqual({ oido: 'no', idioma: null });
  });

  it('cada instancia se fuerza a local; si no se puede, no se usa', () => {
    const nueva = { processLocally: false };
    expect(forzarLocal(nueva)).toBe(true);
    expect(nueva.processLocally).toBe(true);
    const vieja = { mode: 'cloud' };
    expect(forzarLocal(vieja)).toBe(true);
    expect(vieja.mode).toBe('ondevice-only');
    expect(forzarLocal({})).toBe(false);
  });

  it('no le pregunta nada al navegador al cargar: recién cuando la persona abre el modo voz', () => {
    const hook = readFileSync('src/components/voz.ts', 'utf8');
    const pagina = readFileSync('src/app/(app)/handia/page.tsx', 'utf8');
    // El único efecto del hook es la limpieza al salir.
    const efectos = hook.match(/useEffect\([\s\S]*?\n {2}\);/g) ?? [];
    expect(efectos).toHaveLength(1);
    expect(efectos[0]).not.toMatch(/capacidadOido|available/);
    expect(pagina).toMatch(/async function abrirVoz\(\) \{[\s\S]*?await voz\.revisar\(\)/);
    // Y solo en Chrome o Edge (en otros Chromium la consulta cierra la pestaña).
    expect(hook).toMatch(/navegadorConVozLocal\(\)\s*\?\s*await capacidadOido/);
  });

  it('el hook nunca arranca un reconocimiento sin forzarlo a local, ni graba ni manda nada', () => {
    const hook = readFileSync('src/components/voz.ts', 'utf8');
    expect(hook).toMatch(/if \(!forzarLocal\(rec\)\) \{[\s\S]*?return;[\s\S]*?rec\.start\(\)/);
    expect(hook).toMatch(/cap\.oido !== 'local'/);
    expect(hook).not.toMatch(
      /MediaRecorder|getUserMedia|fetch\(|localStorage|sessionStorage|indexedDB/,
    );
  });
});

describe('Modo voz · hablar', () => {
  const v = (lang: string, localService: boolean, name = lang): VozSistema => ({
    name,
    lang,
    localService,
    voiceURI: `${name}-${localService}`,
  });

  it('solo voces del sistema en español; prefiere la rioplatense', () => {
    expect(
      elegirVoz([v('es-AR', false), v('es-ES', true), v('es-AR', true), v('en-US', true)])
        ?.voiceURI,
    ).toBe('es-AR-true');
    expect(elegirVoz([v('es-MX', true), v('es-ES', true)])?.lang).toBe('es-MX');
    expect(elegirVoz([v('es-US', false, 'Google español'), v('en-GB', true)])).toBeNull();
  });

  it('dice el texto como se habla', () => {
    expect(paraHablar('Total: $ 45.000 · Jueves 19/11 · 10:00')).toBe(
      'Total: 45.000 pesos, Jueves 19/11, 10',
    );
    expect(paraHablar('Saqué [teléfono] del «mensaje»')).toBe('Saqué dato tachado del mensaje');
  });

  it('órdenes de voz', () => {
    expect(comandoVoz('salir del modo voz')).toBe('salir');
    expect(comandoVoz('quiero escribir')).toBe('salir');
    expect(comandoVoz('repeti')).toBe('repetir');
    expect(comandoVoz('silencio')).toBe('callar');
    expect(comandoVoz('para')).toBe('callar');
    expect(comandoVoz('para hoy')).toBeNull();
    expect(comandoVoz('se tapo la pileta')).toBeNull();
  });
});
