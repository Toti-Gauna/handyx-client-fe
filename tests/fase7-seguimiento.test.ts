// Fase 7 · seguimiento, cierre y obras: las cuentas (desglose, totales de una obra, informado ≠ verificado), la reseña y
// las reglas del producto que se pueden comprobar sin navegador. Solo datos ficticios.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  HECHAS_POR_ESTADO,
  desglose,
  etapaActual,
  etapasConfirmadas,
  pagoVigente,
  pasosTurno,
  textoPago,
  totalSiAprueba,
  totalesObra,
  turnoTexto,
} from '../src/components/Trabajo';
import type { Propuesta, Trabajo } from '../src/contracts/v1/propuestas';
import type { RegistroPago } from '../src/contracts/v1/servicio';
import { DESTACADOS_RESENA } from '../src/contracts/v1/servicio';
import { NEGATIVOS, POSITIVOS, opcionesPara, prepararResena } from '../src/data/resena';
import { PANTALLAS } from '../src/mapa/pantallas';

const ID = (n: number) => `de000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const ahora = '2026-11-17T13:00:00.000Z';

const trabajo = (extra: Partial<Trabajo> = {}, monto = 4_500_000, bp = 0): Trabajo =>
  ({
    id: ID(1),
    pedidoId: ID(2),
    conversacionId: ID(3),
    especialista: {
      id: ID(4),
      nombrePublico: 'Especialista 1',
      rubros: ['plomeria'],
      verificaciones: [],
    },
    acuerdo: {
      propuestaId: ID(5),
      monto: { centavos: monto, moneda: 'ARS' },
      comisionHandy: {
        bp,
        importe: { centavos: Math.round((monto * bp) / 10_000), moneda: 'ARS' },
      },
      alcance: 'Cambio de cartucho.',
      horario: { inicio: '2026-11-19T12:30:00.000Z', fin: '2026-11-19T14:30:00.000Z' },
      aceptadoEn: ahora,
    },
    historialAcuerdos: [],
    estado: 'en_curso',
    etapas: [],
    version: 1,
    creadoEn: ahora,
    actualizadoEn: ahora,
    ...extra,
  }) as unknown as Trabajo;

const adicional = (
  centavos: number,
  estado: Propuesta['estado'] = 'aceptada',
  trabajoId = ID(1),
): Propuesta =>
  ({
    id: ID(9),
    tipo: 'adicional',
    estado,
    trabajoId,
    monto: { centavos, moneda: 'ARS' },
  }) as unknown as Propuesta;

const pago = (extra: Partial<RegistroPago>): RegistroPago =>
  ({
    id: ID(20),
    trabajoId: ID(1),
    etapaId: null,
    metodo: 'efectivo',
    monto: { centavos: 4_500_000, moneda: 'ARS' },
    estado: 'reportado',
    fuente: null,
    reportadoEn: ahora,
    verificadoEn: null,
    version: 0,
    ...extra,
  }) as RegistroPago;

const etapa = (n: number, estado: string, centavos: number) => ({
  id: ID(100 + n),
  orden: n,
  titulo: `Etapa ${n}`,
  monto: { centavos, moneda: 'ARS' },
  estado,
  version: 1,
});

describe('turno y etapas', () => {
  it('cuántas etapas del turno están hechas según el estado', () => {
    expect(HECHAS_POR_ESTADO.agendado).toBe(1);
    expect(HECHAS_POR_ESTADO.en_sitio).toBe(2);
    expect(HECHAS_POR_ESTADO.en_curso).toBe(3);
    expect(HECHAS_POR_ESTADO.finalizado).toBe(5);
    expect(pasosTurno(trabajo())).toHaveLength(5);
  });

  it('el turno sale en horario de Buenos Aires y sin horario no inventa uno', () => {
    expect(turnoTexto(trabajo())).toEqual({ dia: 'JUEVES 19/11', hora: '09:30 a 11:30 h' });
    const sin = trabajo({ acuerdo: { ...trabajo().acuerdo, horario: null } });
    expect(turnoTexto(sin).dia).toBe('A COORDINAR');
  });
});

describe('desglose y adicional', () => {
  it('separa el acuerdo del adicional aprobado y suma la tarifa de Handyx', () => {
    const t = trabajo({}, 5_450_000);
    const d = desglose(t, [
      adicional(950_000),
      adicional(500_000, 'pendiente'),
      adicional(100, 'aceptada', ID(77)),
    ]);
    expect(d).toMatchObject({
      acuerdo: 4_500_000,
      adicional: 950_000,
      especialista: 5_450_000,
      tarifa: 0,
      total: 5_450_000,
    });
  });

  it('el total si aprobás suma el adicional (y su tarifa) al acuerdo actual', () => {
    expect(totalSiAprueba(trabajo(), 950_000)).toBe(5_450_000);
    expect(totalSiAprueba(trabajo({}, 4_500_000, 1000), 1_000_000)).toBe(4_950_000 + 1_100_000);
  });
});

describe('pagos de una obra: informado ≠ verificado', () => {
  const t = trabajo({
    etapas: [
      etapa(1, 'confirmada', 1_000_000),
      etapa(2, 'confirmada', 2_000_000),
      etapa(3, 'en_curso', 1_500_000),
    ],
  } as Partial<Trabajo>);
  const pagos = [
    pago({
      id: ID(21),
      etapaId: ID(101),
      estado: 'verificado',
      monto: { centavos: 1_000_000, moneda: 'ARS' },
    }),
    pago({
      id: ID(22),
      etapaId: ID(102),
      estado: 'reportado',
      monto: { centavos: 2_000_000, moneda: 'ARS' },
    }),
  ];

  it('cada importe se cuenta en un solo lugar según el estado real', () => {
    const tot = totalesObra(t, pagos);
    expect(tot.verificado).toBe(1_000_000);
    expect(tot.informado).toBe(2_000_000);
    expect(tot.falta).toBe(tot.total - 3_000_000);
    expect(tot.etapasPagas).toBe(2);
  });

  it('un pago fallido, cancelado o pendiente no cuenta como pagado', () => {
    for (const estado of ['fallido', 'cancelado', 'pendiente'] as const) {
      const tot = totalesObra(t, [pago({ etapaId: ID(101), estado })]);
      expect(tot.verificado + tot.informado, estado).toBe(0);
    }
  });

  it('el pago vigente es el último que no falló', () => {
    const lista = [
      pago({ id: ID(30), etapaId: ID(101), estado: 'reportado' }),
      pago({ id: ID(31), etapaId: ID(101), estado: 'fallido' }),
    ];
    expect(pagoVigente(lista, ID(101))?.id).toBe(ID(30));
    expect(pagoVigente(lista, ID(102))).toBeNull();
  });

  it('lo informado se dice «informado» y nunca «verificado»', () => {
    expect(textoPago({ estado: 'reportado' })).toMatch(/Informado \(sin verificar\)/);
    expect(textoPago({ estado: 'reportado' })).not.toMatch(/^Verificado/);
  });

  it('etapas confirmadas y etapa actual', () => {
    expect(etapasConfirmadas(t)).toBe(2);
    expect(etapaActual(t)?.orden).toBe(3);
  });
});

describe('reseña', () => {
  it('los destacados salen del contrato y se corresponden con el puntaje', () => {
    for (const d of [...POSITIVOS, ...NEGATIVOS]) expect(DESTACADOS_RESENA).toContain(d);
    expect(opcionesPara(5)).toEqual(POSITIVOS);
    expect(opcionesPara(2)).toEqual(NEGATIVOS);
    expect(prepararResena(5, ['puntual', 'llego_tarde'], '').destacados).toEqual(['puntual']);
  });

  it('el comentario va sin teléfonos ni emails y vacío es null', () => {
    const r = prepararResena(5, [], 'Excelente, escribime a ana@example.test o al 223 155-123456');
    expect(r.comentario).not.toMatch(/ana@example|155-123456/);
    expect(r.comentario).toMatch(/Excelente/);
    expect(prepararResena(4, [], '   ').comentario).toBeNull();
    expect(prepararResena(4, [], 'x'.repeat(900)).comentario).toHaveLength(500);
  });
});

describe('pantallas registradas', () => {
  const ids = [
    'trabajo',
    'trabajo-adicional',
    'trabajo-informe',
    'trabajo-antes-despues',
    'trabajo-conformidad',
    'resena',
    'pago',
  ];
  const obras = ['obra', 'obra-etapa', 'obra-repuesto', 'obra-fecha', 'obra-pagos', 'obra-gastado'];

  it('están en el mapa con su ruta, y resena, resenaCrear e informe aparecen', () => {
    for (const id of [...ids, ...obras])
      expect(
        PANTALLAS.find((p) => p.id === id),
        id,
      ).toBeDefined();
    const usados = new Set(PANTALLAS.flatMap((p) => p.endpoints));
    for (const e of ['resena', 'resenaCrear', 'informe', 'propuestaAceptar', 'etapaConfirmar'])
      expect(usados.has(e as never), e).toBe(true);
    expect(PANTALLAS.find((p) => p.id === 'obra')?.grupo).toBe('obras');
  });
});

describe('reglas del producto en estas pantallas', () => {
  const archivos = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const r = join(dir, f);
      return statSync(r).isDirectory() ? archivos(r) : /\.tsx?$/.test(f) ? [r] : [];
    });
  const mias = [
    ...archivos('src/app/(app)/trabajos'),
    ...archivos('src/app/(app)/obras'),
    'src/components/Trabajo.tsx',
    'src/ui/seguimiento.tsx',
  ];
  const sinComentarios = (s: string) =>
    s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  it('nada de ETA propia, "Agregar tarjeta" ni almacenamiento del navegador', () => {
    for (const f of mias) {
      const s = sinComentarios(readFileSync(f, 'utf8'));
      expect(s, f).not.toMatch(
        /llegar[áa] en|\bETA\b|Agregar tarjeta|localStorage|sessionStorage|indexedDB|Date\.now/i,
      );
    }
  });

  it('el viaje en vivo solo en camino y solo lo que manda el servidor', () => {
    const f = readFileSync('src/app/(app)/trabajos/detalle/EnCamino.tsx', 'utf8');
    expect(f).toMatch(/useViaje\(t\.id, true\)/);
    expect(f).toMatch(/vivo\.viaje\?\.estado === 'compartiendo'/);
  });

  it('con una barra de título, el título grande de la pantalla es un h2 (un solo h1)', () => {
    for (const f of mias.filter((x) => x.endsWith('.tsx'))) {
      const s = readFileSync(f, 'utf8');
      if (/<Barra\b/.test(s) && /<Titulo\b/.test(s)) expect(s, f).not.toMatch(/<Titulo\s+texto=/);
    }
  });

  it('pagar nunca se anima ni se desliza: un botón con el importe a la vista', () => {
    const e = readFileSync('src/app/(app)/trabajos/pago/Elegir.tsx', 'utf8');
    expect(e).toMatch(/Pagar \$\{pesos\(objetivo\.centavos\)\} con Mercado Pago/);
    expect(e).not.toMatch(/Deslizar|animation/);
  });
});
