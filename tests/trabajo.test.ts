// Trabajo en curso y cierre (lote 3.6): seguimiento sin ETA, festejo después del hecho, pago, comprobante y reseña.
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

const leer = (f: string) => readFileSync(f, 'utf8');
const detalle = leer('src/app/(app)/trabajos/detalle/page.tsx');
const pago = leer('src/app/(app)/trabajos/pago/page.tsx');
const resena = leer('src/app/(app)/trabajos/resena/page.tsx');
const SIN_ETA = /llegar[áa] en|\bETA\b|tarda(r[áa])? \d|minutos? de distancia|llega en \d/i;

describe('seguimiento', () => {
  it('las cuatro etapas de la demo, con el paso actual marcado', () => {
    expect(detalle).toMatch(/'Confirmado'[\s\S]*'En camino'[\s\S]*'Llegó'[\s\S]*'Trabajando'/);
    expect(detalle).toMatch(/aria-current=\{i === actual \? 'step' : undefined\}/);
  });

  it('sin tiempos de llegada ni seguimiento de ubicación', () => {
    expect(detalle).not.toMatch(SIN_ETA);
    expect(detalle).toMatch(/Nosotros no seguimos tu ubicación ni la del especialista/);
    expect(detalle).toMatch(/lo marca él desde su celular/);
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
