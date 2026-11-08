// Fase 7 · pedir y propuestas: el promedio de «Comparar» (reglas fijas, públicas y determinísticas) y el texto del
// pedido armado con «¿Qué pasa?».
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PROBLEMAS, armarDescripcion } from '@/app/(app)/pedir/_problemas';
import { RUBROS } from '@/contracts/v1/pedidos';
import type { Propuesta } from '@/contracts/v1/propuestas';
import {
  PESOS,
  candidataDe,
  destacada,
  formatoPuntaje,
  frase,
  puntuar,
  type Candidata,
} from '@/domain/comparar';

const c = (id: string, extra: Partial<Candidata> = {}): Candidata => ({
  id,
  totalCentavos: 4_500_000,
  resenas: null,
  verificaciones: 2,
  garantiaDias: 90,
  inicio: '2026-11-19T13:00:00.000Z',
  creadaEn: '2026-11-08T12:00:00.000Z',
  ...extra,
});

const propuesta = (extra: Partial<Propuesta> = {}): Propuesta =>
  ({
    id: 'de000000-0000-4000-8000-000000000001',
    tipo: 'cotizacion',
    monto: { centavos: 4_500_000, moneda: 'ARS' },
    comisionHandy: { bp: 0, importe: { centavos: 0, moneda: 'ARS' } },
    especialista: { verificaciones: [{ tipo: 'identidad', verificadoEn: '2026-11-01T00:00:00Z' }] },
    detalle: null,
    horario: null,
    creadaEn: '2026-11-08T12:00:00.000Z',
    ...extra,
  }) as unknown as Propuesta;

describe('comparar: promedio con pesos públicos', () => {
  it('los pesos son los publicados y suman 100', () => {
    expect(PESOS).toEqual({ precio: 30, resenas: 25, verificaciones: 20, garantia: 15, fecha: 10 });
    expect(Object.values(PESOS).reduce((a, b) => a + b, 0)).toBe(100);
  });

  it('todo al máximo da 10 y es determinístico', () => {
    const una = [c('a', { resenas: { promedio: 5, cantidad: 10 }, garantiaDias: 180 })];
    expect(puntuar(una)[0]?.puntaje).toBe(10);
    const varias = [c('b', { totalCentavos: 5_000_000 }), c('a'), c('c', { verificaciones: 0 })];
    expect(puntuar(varias)).toEqual(puntuar([...varias].reverse()));
  });

  it('sin reseñas para ninguna, ese factor no cuenta (se reparte el resto)', () => {
    const [s] = puntuar([c('a', { garantiaDias: 180 })]);
    expect(s?.factores.resenas).toBeNull();
    expect(s?.puntaje).toBe(10);
  });

  it('precio: la más económica suma más; con lo demás igual, gana', () => {
    const r = puntuar([c('cara', { totalCentavos: 6_000_000 }), c('barata', { totalCentavos: 3_000_000 })]);
    expect(r[0]?.id).toBe('barata');
    expect(r[1]?.factores.precio).toBeCloseTo(0.5);
  });

  it('fecha: un día después resta 0,1 de ese factor; sin horario, 0,5', () => {
    const r = puntuar([
      c('hoy'),
      c('manana', { inicio: '2026-11-20T13:00:00.000Z' }),
      c('sin', { inicio: null }),
    ]);
    const f = (id: string) => r.find((x) => x.id === id)?.factores.fecha;
    expect(f('hoy')).toBe(1);
    expect(f('manana')).toBeCloseTo(0.9);
    expect(f('sin')).toBe(0.5);
  });

  it('empate: primero la que llegó antes', () => {
    const r = puntuar([
      c('tarde', { creadaEn: '2026-11-08T13:00:00.000Z' }),
      c('temprano', { creadaEn: '2026-11-08T11:00:00.000Z' }),
    ]);
    expect(r.map((x) => x.id)).toEqual(['temprano', 'tarde']);
  });

  it('destacada solo con dos o más', () => {
    expect(destacada([c('a')])).toBeNull();
    expect(destacada([c('a'), c('b', { verificaciones: 0 })])?.id).toBe('a');
  });

  it('solo entran propuestas de trabajo con precio (no visitas ni cambios)', () => {
    expect(candidataDe(propuesta())).not.toBeNull();
    expect(
      candidataDe(propuesta({ detalle: { oferta: 'visita' } as Propuesta['detalle'] })),
    ).toBeNull();
    expect(candidataDe(propuesta({ tipo: 'adicional' }))).toBeNull();
    expect(candidataDe(propuesta({ monto: { centavos: 0, moneda: 'ARS' } } as Partial<Propuesta>))).toBeNull();
  });

  it('el puntaje se muestra con coma y la frase no usa superlativos', () => {
    expect(formatoPuntaje(8.7)).toBe('8,7');
    expect(formatoPuntaje(10)).toBe('10,0');
    const todas = puntuar([c('a', { garantiaDias: 90 }), c('b', { inicio: '2026-11-22T13:00:00.000Z' })]);
    const texto = frase(todas[0]!, c('a', { garantiaDias: 90 }), todas);
    expect(texto).toMatch(/^[A-ZÁÉÍÓÚ].*\.$/);
    expect(texto).toMatch(/garantía de 90 días/);
    expect(texto).not.toMatch(/\b(mejor|más barat|recomendad)/i);
  });
});

describe('pedir: ¿qué pasa?', () => {
  it('cada rubro tiene sus opciones', () => {
    for (const r of RUBROS) expect(PROBLEMAS[r].length).toBeGreaterThanOrEqual(3);
  });

  it('el texto junta la opción y lo escrito; cada opción sola alcanza el mínimo de 10', () => {
    expect(armarDescripcion('Se tapó un desagüe', '  Desde ayer ')).toBe(
      'Se tapó un desagüe. Desde ayer',
    );
    expect(armarDescripcion(null, ' Gotea ')).toBe('Gotea');
    for (const r of RUBROS)
      for (const o of PROBLEMAS[r]) expect(armarDescripcion(o, '').length).toBeGreaterThanOrEqual(10);
  });
});

describe('pedir y propuestas: guardas del código', () => {
  const leer = (f: string) => readFileSync(f, 'utf8');
  const pedido = leer('src/app/(app)/pedir/_pedido.ts');
  const hojas = leer('src/app/(app)/propuestas/detalle/_Hojas.tsx');
  const tarjeta = leer('src/components/Propuesta.tsx');

  it('se publica con la clave de idempotencia y las fotos no se pierden entre pasos', () => {
    expect(pedido).toMatch(/envio\.enviar\('pedidoCrear', \{ cuerpo \}, JSON\.stringify\(cuerpo\)\)/);
    expect(pedido).toMatch(/const estadoFotos = useFotos\(setFotos\);/);
    expect(pedido).toMatch(/PASO_DEL_CAMPO/);
  });

  it('sin elegir, va como «lo antes posible» y la aceptación automática arranca apagada', () => {
    expect(pedido).toMatch(/\?\? 'urgente'/);
    expect(pedido).toMatch(/const \[auto, setAuto\] = useState\(false\);/);
  });

  it('aceptar pide deslizar o el botón alternativo', () => {
    expect(hojas).toMatch(/<DeslizarConfirmar[\s\S]*Sí, acepto estas condiciones/);
  });

  it('la tarjeta no acepta ni rechaza', () => {
    expect(tarjeta).not.toMatch(/propuestaAceptar|propuestaRechazar/);
  });
});
