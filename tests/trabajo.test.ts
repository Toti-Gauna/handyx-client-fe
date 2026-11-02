// Trabajo en curso y cierre (lote 3.6; viaje en vivo 4.7): seguimiento sin ETA propia, festejo después del hecho, pago, comprobante y reseña.
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { distanciaAprox, textosViaje } from '../src/domain/viaje.ts';

const leer = (f: string) => readFileSync(f, 'utf8');
const detalle = leer('src/app/(app)/trabajos/detalle/page.tsx');
const pago = leer('src/app/(app)/trabajos/pago/page.tsx');
const resena = leer('src/app/(app)/trabajos/resena/page.tsx');
const viajeTxt = leer('src/domain/viaje.ts');
const SIN_ETA = /llegar[áa] en|\bETA\b|tarda(r[áa])? \d|minutos? de distancia|llega en \d/i;

describe('seguimiento', () => {
  it('las cuatro etapas de la demo, con el paso actual marcado', () => {
    expect(detalle).toMatch(/'Confirmado'[\s\S]*'En camino'[\s\S]*'Llegó'[\s\S]*'Trabajando'/);
    expect(detalle).toMatch(/aria-current=\{i === actual \? 'step' : undefined\}/);
  });

  it('sin tiempos de llegada propios ni seguimiento de tu ubicación', () => {
    expect(detalle).not.toMatch(SIN_ETA);
    expect(viajeTxt).not.toMatch(SIN_ETA);
    expect(detalle).toMatch(
      /Nosotros no seguimos tu ubicación\. La del especialista se ve solo mientras viene en\s+camino y la comparte/,
    );
    // Ni reloj ni cuentas propias: la llegada estimada y lo que falta llegan del servidor.
    for (const f of [detalle, viajeTxt]) {
      expect(f).not.toMatch(/Date\.now|new Date\(\)|duracionS|\/\s*VELOCIDAD/);
    }
  });

  it('el viaje en vivo solo en camino y solo mientras comparte (decisión del 31/10)', () => {
    expect(detalle).toMatch(/useViaje\(id, enCamino\)/);
    expect(detalle).toMatch(/const enCamino = trabajo\.datos\?\.estado === 'en_camino';/);
    expect(detalle).toMatch(/vivo\.viaje\?\.estado === 'compartiendo' \? vivo\.viaje : null/);
    expect(detalle).toMatch(/trayecto=\{compartiendo\?\.trayecto\?\.linea \?\? null\}/);
  });
});

describe('textos del viaje en vivo', () => {
  const instante = '2026-11-18T13:42:00.000Z';
  const base = {
    trabajoId: 'de000000-0000-4000-8000-000000000001',
    destino: { lat: -38, lng: -57.55 },
  };
  const vacio = {
    trayecto: null,
    ultimaPosicion: null,
    distanciaRestanteM: null,
    llegadaEstimada: null,
  };

  it('compartiendo: lo que falta y la llegada estimada del servidor, en hora de Buenos Aires', () => {
    const v = textosViaje(
      {
        ...base,
        estado: 'compartiendo',
        trayecto: null,
        ultimaPosicion: null,
        distanciaRestanteM: 1234,
        llegadaEstimada: instante,
      },
      null,
      true,
    );
    expect(v.chip).toBe('Llegada estimada 10:42');
    expect(v.detalle).toMatch(/^Faltan 1,2 km · llegada estimada 10:42\. La estima Handyx/);
    expect(v.nota).toMatch(/Está compartiendo su ubicación/);
    expect(v.corte).toBeNull();
  });

  it('sin compartir, terminado o sin datos: el horario acordado, sin hora de llegada', () => {
    for (const viaje of [
      { ...base, ...vacio, estado: 'sin_compartir' as const },
      { ...base, ...vacio, estado: 'terminado' as const },
      null,
    ]) {
      const v = textosViaje(viaje, null, true);
      expect(v.chip).toBeNull();
      expect(v.detalle).toBeNull();
      expect(v.nota).toMatch(/Va en el horario que acordaron/);
    }
    expect(textosViaje({ ...base, ...vacio, estado: 'sin_compartir' }, null, true).nota).toMatch(
      /Todavía no compartió su ubicación/,
    );
  });

  it('un corte se avisa y un pedido sin punto en el mapa lo explica', () => {
    const corte = { codigo: 'no_disponible', mensaje: 'Se cortó.', recuperable: true };
    expect(textosViaje(null, corte, false).corte).toBe('Se cortó.');
    expect(textosViaje(null, corte, true).corte).toBeNull();
    const sinPunto = { codigo: 'conflicto', mensaje: 'x', recuperable: false };
    expect(textosViaje(null, sinPunto, false).nota).toMatch(/no tiene un punto en el mapa/);
  });

  it('distancias aproximadas', () => {
    expect(distanciaAprox(12)).toBe('unos 50 m');
    expect(distanciaAprox(374)).toBe('unos 350 m');
    expect(distanciaAprox(999)).toBe('unos 1000 m');
    expect(distanciaAprox(2460)).toBe('2,5 km');
  });
});

describe('cierre', () => {
  it('"¡Listo, quedó arreglado!" solo después de que confirmaste', () => {
    expect(detalle).toMatch(/finalizado\s*\?\s*'¡Listo, quedó ==arreglado==!'/);
    expect(detalle).toMatch(/const finalizado = t\.estado === 'finalizado';/);
  });

  it('una obra no se cierra con etapas sin confirmar', () => {
    expect(detalle).toMatch(/\{etapasListas \? \(\s*<BotonHx/);
  });

  it('un pago registrado por vos se muestra como reportado, no como pagado y verificado', () => {
    expect(detalle).toMatch(/queda\s+“reportado” hasta que lo confirma otra parte/);
  });
});

describe('pago', () => {
  it('se confirma deslizando o con el botón de siempre', () => {
    expect(pago).toMatch(/<DeslizarConfirmar[\s\S]*Ya le pagué en efectivo/);
  });

  it('el comprobante es el registro de Handyx, no una factura', () => {
    expect(pago).toMatch(/No es una factura/);
  });
});

describe('reseña', () => {
  it('solo de un trabajo que confirmaste que terminó', () => {
    expect(resena).toMatch(/if \(t\.estado !== 'finalizado'\)/);
  });

  it('el comentario se envía sin datos personales', async () => {
    vi.resetModules();
    const { enviarResena } = await import('@/data/resena');
    const r = await enviarResena({
      trabajoId: 'de000000-0000-4000-8000-000000009999',
      estrellas: 5,
      destacados: ['Puntual'],
      comentario: 'Excelente, escribime a ana@example.test o al 223 155-123456',
    });
    expect(r.comentario).not.toMatch(/ana@example|155-123456/);
    expect(r.comentario).toMatch(/Excelente/);
  });

  it('con la API real queda inactiva hasta que exista resenaCrear', () => {
    expect(leer('src/data/resena.ts')).toMatch(
      /resenaDisponible = esVistaDePrueba[\s\S]*funcion_inactiva/,
    );
  });
});
