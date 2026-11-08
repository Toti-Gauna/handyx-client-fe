// Fase 7 · Mi hogar y camino del hogar: reglas puras de src/ui/hogar.tsx y src/app/(app)/camino/piezas.tsx, y guardas
// estáticas de las pantallas (beneficios en borrador, nada preelegido al compartir, sin azar).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  hastaDonde,
  puntosCamino,
  trazoCamino,
  type Hito,
} from '../src/app/(app)/camino/piezas';
import type { Ambiente, Equipo, Hogar, Recordatorio } from '../src/contracts/v1/hogar';
import type { Trabajo } from '../src/contracts/v1/propuestas';
import { HOGAR7 } from '../src/mapa/fase7/hogar';
import {
  avanceGarantia,
  claveItem,
  cmDeMetros,
  compartibles,
  cuandoRecordatorio,
  delAmbiente,
  elAmbiente,
  faltaAmbiente,
  garantiaVigente,
  hrefPedir,
  medidasTexto,
  metrosDeCm,
  nombreCompartido,
  paraEstaSemana,
  pendientes,
  resumenAmbiente,
  sinMontos,
  trabajoDeGarantia,
} from '../src/ui/hogar';

const ID = (n: number) => `de000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const amb = (n: number, extra: Partial<Ambiente> = {}): Ambiente => ({
  id: ID(n),
  tipo: 'bano',
  nombre: 'Baño',
  medidas: null,
  materiales: null,
  notas: null,
  fotos: [],
  completitud: 0,
  version: 0,
  ...extra,
});
const eq = (n: number, ambienteId: string, extra: Partial<Equipo> = {}): Equipo => ({
  id: ID(n),
  ambienteId,
  tipo: 'canilla',
  nombre: 'Canilla',
  marca: null,
  modelo: null,
  instaladoEn: null,
  ultimoMantenimiento: null,
  garantiaHasta: null,
  etiqueta: null,
  version: 0,
  ...extra,
});
const rec = (n: number, extra: Partial<Recordatorio> = {}): Recordatorio => ({
  id: ID(n),
  titulo: `Recordatorio ${n}`,
  equipoId: null,
  fecha: '2026-12-01',
  cadaMeses: null,
  activo: true,
  origen: 'usuario',
  hechoEn: null,
  ...extra,
});
const trabajo = (n: number, extra: Partial<Trabajo> = {}): Trabajo =>
  ({
    id: ID(n),
    pedidoId: ID(n + 100),
    conversacionId: ID(n + 200),
    especialista: {
      id: ID(n + 300),
      nombrePublico: 'Especialista De Prueba',
      rubros: ['plomeria'],
      verificaciones: [],
      trabajosRealizados: null,
    },
    estado: 'finalizado',
    creadoEn: '2026-11-01T12:00:00.000Z',
    actualizadoEn: '2026-11-02T12:00:00.000Z',
    ...extra,
  }) as Trabajo;

describe('Mi hogar · reglas', () => {
  it('el pedido arranca con el rubro del equipo; una revisión va como programada', () => {
    expect(hrefPedir('calefon', 'rompio')).toBe('/pedir/?rubro=gas');
    expect(hrefPedir('aire_acondicionado', 'revision')).toBe(
      '/pedir/?rubro=aire_acondicionado&tipo=programado',
    );
    expect(hrefPedir('otro', 'rompio')).toBe('/pedir/');
    expect(hrefPedir(null, 'revision')).toBe('/pedir/');
  });

  it('medidas en metros con coma, ida y vuelta', () => {
    expect(medidasTexto({ anchoCm: 210, largoCm: 180, altoCm: 260 })).toBe(
      '2,10 × 1,80 m · 2,60 de alto',
    );
    expect(medidasTexto({ anchoCm: 210, largoCm: 180, altoCm: null })).toBe('2,10 × 1,80 m');
    expect(medidasTexto(null)).toBeNull();
    expect(cmDeMetros('2,10')).toBe(210);
    expect(cmDeMetros(' 1.8 ')).toBe(180);
    expect(cmDeMetros('')).toBeNull();
    expect(cmDeMetros('dos')).toBeNaN();
    expect(cmDeMetros('0')).toBeNaN();
    expect(metrosDeCm(260)).toBe('2,60');
    expect(metrosDeCm(null)).toBe('');
  });

  it('resumen y lo que falta de un ambiente', () => {
    const a = amb(1, { medidas: { anchoCm: 210, largoCm: 180, altoCm: null } });
    expect(resumenAmbiente(a, [eq(2, a.id), eq(3, a.id)])).toBe('2 equipos · 2,10 × 1,80 m');
    expect(resumenAmbiente(amb(4), [])).toBe('Sin equipos · falta medir');
    expect(faltaAmbiente(a, [])).toEqual(['fotos', 'materiales', 'equipos']);
    expect(elAmbiente(a)).toBe('el baño');
    expect(delAmbiente(a)).toBe('del baño');
    expect(delAmbiente({ tipo: 'cocina', nombre: 'Cocina' })).toBe('de la cocina');
    expect(elAmbiente({ tipo: 'bano', nombre: 'Baño de arriba' })).toBe('Baño de arriba');
  });

  it('garantía vigente hasta el último día inclusive', () => {
    expect(garantiaVigente('2026-11-08', '2026-11-08')).toBe(true);
    expect(garantiaVigente('2026-11-07', '2026-11-08')).toBe(false);
    expect(garantiaVigente(null, '2026-11-08')).toBe(false);
    expect(avanceGarantia('2026-11-01', '2026-11-11', '2026-11-06')).toBe(50);
    expect(avanceGarantia('2026-11-01', '2026-11-11', '2027-01-01')).toBe(100);
    expect(avanceGarantia('2026-11-01', '2026-11-11', '2026-10-01')).toBe(0);
  });

  it('la garantía se le pide al último trabajo terminado del rubro, solo si está vigente', () => {
    const a = amb(1);
    const canilla = eq(2, a.id, { garantiaHasta: '2027-02-01' });
    const viejo = trabajo(10, { actualizadoEn: '2026-10-01T00:00:00.000Z' });
    const nuevo = trabajo(11, { actualizadoEn: '2026-11-05T00:00:00.000Z' });
    const gas = trabajo(12, {
      especialista: { ...nuevo.especialista, rubros: ['gas'] },
      actualizadoEn: '2026-11-07T00:00:00.000Z',
    });
    expect(trabajoDeGarantia(canilla, [viejo, gas, nuevo], '2026-11-08')?.id).toBe(nuevo.id);
    expect(trabajoDeGarantia({ ...canilla, garantiaHasta: '2026-01-01' }, [nuevo], '2026-11-08')).toBeNull();
    expect(trabajoDeGarantia(canilla, [trabajo(13, { estado: 'agendado' })], '2026-11-08')).toBeNull();
  });

  it('recordatorios: activos en orden, los de esta semana y su texto', () => {
    const items = [
      rec(1, { fecha: '2026-11-20' }),
      rec(2, { fecha: '2026-11-10', cadaMeses: 3 }),
      rec(3, { fecha: '2026-11-09', activo: false }),
    ];
    expect(pendientes(items).map((r) => r.id)).toEqual([ID(2), ID(1)]);
    expect(paraEstaSemana(items, '2026-11-08')).toBe(1);
    expect(cuandoRecordatorio(items[1]!)).toBe('Cada 3 meses · antes del 10/11');
    expect(cuandoRecordatorio(items[0]!)).toBe('Una vez · antes del 20/11');
  });

  it('se comparte solo lo que existe, sin elegir nada de antemano ni la dirección', () => {
    const conTodo = amb(1, {
      medidas: { anchoCm: 200, largoCm: 100, altoCm: null },
      fotos: [
        {
          id: ID(50),
          tipo: 'image/jpeg',
          bytes: 1000,
          url: 'https://media.example.test/x',
          expiraEn: '2026-12-01T00:00:00.000Z',
        } as Ambiente['fotos'][number],
      ],
    });
    const vacio = amb(2, { tipo: 'cocina', nombre: 'Cocina' });
    const hogar: Hogar = {
      vivienda: 'casa',
      ambientes: [conTodo, vacio],
      equipos: [eq(3, conTodo.id), eq(4, vacio.id)],
      completitud: 50,
      version: 1,
    };
    const todo = compartibles(hogar, [trabajo(10), trabajo(11, { estado: 'agendado' })]);
    expect(todo.map((c) => c.item.tipo)).toEqual([
      'ambiente_fotos',
      'ambiente_medidas',
      'equipo',
      'equipo',
      'informe',
    ]);
    expect(compartibles(hogar, [], vacio.id).map((c) => claveItem(c.item))).toEqual([`equipo:${ID(4)}`]);
    expect(JSON.stringify(todo)).not.toMatch(/direcci/i);
    expect(nombreCompartido({ tipo: 'ambiente_medidas', refId: conTodo.id }, hogar)).toBe(
      'Medidas del baño',
    );
    expect(nombreCompartido({ tipo: 'equipo', refId: ID(99) }, hogar)).toBe('Un equipo');
  });

  it('los beneficios nunca muestran montos', () => {
    expect(sinMontos('$ 5.000 en una revisión anual')).toBe('$ [MONTO] en una revisión anual');
    expect(sinMontos('Hasta $12,50 de ahorro')).toBe('Hasta $ [MONTO] de ahorro');
    expect(sinMontos('Guía de invierno')).toBe('Guía de invierno');
  });
});

describe('Camino del hogar', () => {
  const hito = (id: string, estado: Hito['estado']): Hito => ({
    id,
    titulo: id,
    descripcion: id,
    estado,
    progreso: { actual: 0, total: 1 },
  });

  it('cinco puntos en zigzag, el primero abajo', () => {
    const p = puntosCamino(5);
    expect(p).toHaveLength(5);
    expect(p[0]!.y).toBeGreaterThan(p[4]!.y);
    expect(p[0]!.x).toBeLessThan(50);
    expect(p[1]!.x).toBeGreaterThan(50);
    expect(trazoCamino(p).match(/C/g)).toHaveLength(4);
    expect(trazoCamino([])).toBe('');
  });

  it('el tramo azul llega al hito de ahora o al último hecho', () => {
    expect(hastaDonde([hito('a', 'hecho'), hito('b', 'ahora'), hito('c', 'falta')])).toBe(1);
    expect(hastaDonde([hito('a', 'hecho'), hito('b', 'hecho')])).toBe(1);
    expect(hastaDonde([hito('a', 'falta')])).toBe(-1);
  });
});

const archivos = (dir: string): string[] =>
  readdirSync(dir).flatMap((f) => {
    const r = join(dir, f);
    return statSync(r).isDirectory() ? archivos(r) : /\.tsx?$/.test(f) ? [r] : [];
  });
const pantallas = [...archivos('src/app/(app)/hogar'), ...archivos('src/app/(app)/camino')];
const leer = (f: string) => readFileSync(f, 'utf8');

describe('Mi hogar y camino · guardas', () => {
  it('cada ruta del mapa tiene su página y el mapa cita los endpoints pedidos', () => {
    const endpoints = new Set(HOGAR7.flatMap((p) => p.endpoints));
    for (const e of [
      'hogar',
      'hogarEditar',
      'ambienteCrear',
      'ambienteEditar',
      'ambienteBorrar',
      'equipoCrear',
      'equipoEditar',
      'equipoBorrar',
      'compartir',
      'compartidos',
      'compartidoRevocar',
      'recordatorios',
      'recordatorioCrear',
      'recordatorioEditar',
      'camino',
      'informe',
    ] as const)
      expect(endpoints.has(e), e).toBe(true);
    for (const p of HOGAR7) {
      expect(p.lote).toBe('7');
      expect(['hogar', 'camino']).toContain(p.grupo);
      expect(leer(join('src/app/(app)', p.ruta, 'page.tsx')).length, p.ruta).toBeGreaterThan(0);
    }
  });

  it('sin azar, sin fetch y sin almacenamiento del navegador', () => {
    for (const f of pantallas) {
      const s = leer(f);
      expect(s, f).not.toMatch(/Math\.random|\bfetch\(|localStorage|sessionStorage|indexedDB/);
    }
  });

  it('los beneficios siempre dicen «Borrador · Legal» y pasan por sinMontos', () => {
    const b = leer('src/app/(app)/camino/beneficios/page.tsx');
    expect(b).toMatch(/Borrador · Legal/);
    expect(b).toMatch(/sinMontos\(b\.titulo\)/);
    expect(b).not.toMatch(/b\.estado === 'disponible'/);
  });

  it('al compartir nada viene elegido y se explica que la dirección no va', () => {
    const c = leer('src/app/(app)/hogar/compartir/page.tsx');
    expect(c).toMatch(/useState<ReadonlySet<string>>\(new Set\(\)\)/);
    expect(c).toMatch(/Tu dirección exacta no va acá/);
  });

  it('las escrituras de la ficha mandan la versión que se estaba mirando', () => {
    expect(leer('src/app/(app)/hogar/ambiente/EditarAmbiente.tsx')).toMatch(/version: a\.version/);
    expect(leer('src/app/(app)/hogar/equipo/EditarEquipo.tsx')).toMatch(/version: e\.version/);
    expect(leer('src/app/(app)/hogar/casa/page.tsx')).toMatch(/version: hogar\.version/);
  });
});
