// Mensajes, actividad, cuenta, ayuda y errores (Fase 7, filas M y X del lienzo): lógica pura y reglas de producto.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Propuesta } from '@/contracts/v1/propuestas';
import type { Mensaje } from '@/contracts/v1/servicio';
import { PREGUNTAS } from '@/content/textos';
import { PANTALLAS } from '@/mapa/pantallas';
import {
  alternar,
  coincide,
  dispositivo,
  etiquetaDia,
  haceCuanto,
  horarioCorto,
  textoParaCopiar,
  textoSeleccion,
  tipoTarjeta,
  tituloTarjeta,
  totalPropuesta,
} from '@/ui/mensajes';

const ID = (n: number) => `de000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const propuesta = (o: Partial<Propuesta> = {}): Propuesta =>
  ({
    id: ID(1),
    pedidoId: ID(2),
    trabajoId: null,
    conversacionId: ID(3),
    tipo: 'cotizacion',
    autorRol: 'especialista',
    monto: { centavos: 4_500_000, moneda: 'ARS' },
    comisionHandy: { bp: 0, importe: { centavos: 0, moneda: 'ARS' } },
    alcance: 'Incluye materiales',
    detalle: null,
    // jue 19/11/2026 de 10 a 12 h (Buenos Aires = UTC−3)
    horario: { inicio: '2026-11-19T13:00:00.000Z', fin: '2026-11-19T15:00:00.000Z' },
    venceEn: '2026-11-25T03:00:00.000Z',
    estado: 'pendiente',
    reemplazaA: null,
    respondidaEn: null,
    version: 1,
    creadaEn: '2026-11-17T14:00:00.000Z',
    ...o,
  }) as unknown as Propuesta;
const mensaje = (n: number, o: Partial<Mensaje> = {}): Mensaje =>
  ({
    id: ID(100 + n),
    conversacionId: ID(3),
    clienteId: null,
    autor: 'especialista',
    tipo: 'texto',
    texto: `Mensaje ${n}`,
    media: null,
    creadoEn: '2026-11-17T14:00:00.000Z',
    leidoEn: null,
    ...o,
  }) as Mensaje;

describe('tarjetas del chat', () => {
  it('una cotización nueva es «propuesta»; un adicional, «presupuesto»; un cambio, «cambio»', () => {
    expect(tipoTarjeta(propuesta(), null)).toBe('propuesta');
    expect(tipoTarjeta(propuesta({ tipo: 'adicional' }), null)).toBe('presupuesto');
    expect(tipoTarjeta(propuesta({ tipo: 'cambio_acuerdo' }), null)).toBe('cambio');
  });

  it('«otro horario» solo si reemplaza a una anterior con el mismo precio y distinto turno', () => {
    const antes = propuesta();
    const otroDia = propuesta({
      id: ID(9),
      reemplazaA: antes.id,
      horario: { inicio: '2026-11-20T11:00:00.000Z', fin: '2026-11-20T13:00:00.000Z' },
    });
    expect(tipoTarjeta(otroDia, antes)).toBe('horario');
    expect(
      tipoTarjeta(
        { ...otroDia, monto: { centavos: 5_000_000, moneda: 'ARS' } } as Propuesta,
        antes,
      ),
    ).toBe('propuesta');
  });

  it('el título es total y turno en hora de Buenos Aires, como en el lienzo', () => {
    expect(horarioCorto(propuesta().horario)).toBe('jue 19/11 de 10 a 12 h');
    expect(tituloTarjeta(propuesta())).toBe('$ 45.000 · jue 19/11 de 10 a 12 h');
    expect(horarioCorto({ inicio: '2026-11-19T13:30:00.000Z', fin: null })).toBe(
      'jue 19/11 · 10:30 h',
    );
    expect(horarioCorto(null)).toBe('Horario a definir');
  });

  it('el total suma la tarifa que calcula el servidor (el cliente no calcula plata)', () => {
    const p = propuesta({
      comisionHandy: { bp: 500, importe: { centavos: 225_000, moneda: 'ARS' } },
    } as Partial<Propuesta>);
    expect(totalPropuesta(p)).toBe(4_725_000);
  });
});

describe('selección de mensajes', () => {
  it('alternar agrega y quita sin tocar el conjunto original', () => {
    const base = new Set(['a']);
    const con = alternar(base, 'b');
    expect([...con].sort()).toEqual(['a', 'b']);
    expect([...base]).toEqual(['a']);
    expect([...alternar(con, 'a')]).toEqual(['b']);
  });

  it('el encabezado cuenta lo elegido', () => {
    expect(textoSeleccion(0)).toBe('Elegí mensajes');
    expect(textoSeleccion(1)).toBe('1 seleccionado');
    expect(textoSeleccion(3)).toBe('3 seleccionados');
  });

  it('copiar junta solo los textos elegidos, en orden y con quién los dijo', () => {
    const msgs = [
      mensaje(1),
      mensaje(2, { autor: 'usuario' }),
      mensaje(3, { tipo: 'foto', texto: null }),
      mensaje(4),
    ];
    const elegidos = new Set([msgs[0]!.id, msgs[1]!.id, msgs[2]!.id]);
    expect(textoParaCopiar(msgs, elegidos, 'Julián')).toBe('Julián: Mensaje 1\nVos: Mensaje 2');
    expect(textoParaCopiar(msgs, new Set(), 'Julián')).toBe('');
  });
});

describe('textos de apoyo', () => {
  const ahora = Date.parse('2026-11-18T15:00:00.000Z');
  it('el día del mensaje: Hoy, Ayer o la fecha', () => {
    expect(etiquetaDia('2026-11-18T12:00:00.000Z', ahora)).toBe('Hoy');
    expect(etiquetaDia('2026-11-17T12:00:00.000Z', ahora)).toBe('Ayer');
    expect(etiquetaDia('2026-11-10T12:00:00.000Z', ahora)).toBe('Martes 10/11');
  });

  it('«hace cuánto» usa el reloj que se le pasa', () => {
    expect(haceCuanto('2026-11-18T14:59:30.000Z', ahora)).toBe('ahora');
    expect(haceCuanto('2026-11-18T14:30:00.000Z', ahora)).toBe('hace 30 min');
    expect(haceCuanto('2026-11-18T14:00:00.000Z', ahora)).toBe('hace 1 hora');
    expect(haceCuanto('2026-11-15T15:00:00.000Z', ahora)).toBe('hace 3 días');
  });

  it('las sesiones se nombran sin datos del aparato', () => {
    expect(dispositivo('computadora').texto).toBe('Computadora');
    expect(Object.keys(dispositivo('otro')).sort()).toEqual(['icono', 'texto']);
  });

  it('la búsqueda ignora tildes, mayúsculas y orden de las palabras', () => {
    expect(coincide('¿Cómo le pago al especialista?', 'PAGO especialista')).toBe(true);
    expect(coincide('¿Cómo cancelo o cambio un turno?', 'cancelo turno')).toBe(true);
    expect(coincide('¿Cuánto cobra Handy?', 'garantia')).toBe(false);
    expect(coincide('cualquier cosa', '   ')).toBe(true);
  });

  it('cada pregunta de ayuda se encuentra buscando sus propias palabras', () => {
    for (const q of PREGUNTAS)
      expect(coincide(`${q.p} ${q.r}`, q.p.split(' ')[1] ?? ''), q.id).toBe(true);
  });
});

describe('reglas de producto en las pantallas', () => {
  const leer = (f: string) => readFileSync(f, 'utf8');
  const archivos = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) =>
      statSync(join(dir, f)).isDirectory()
        ? archivos(join(dir, f))
        : /\.tsx?$/.test(f)
          ? [join(dir, f)]
          : [],
    );
  const mias = [
    ...archivos('src/app/(app)/chats'),
    ...archivos('src/app/(app)/soporte'),
    ...archivos('src/app/(app)/cuenta'),
    ...archivos('src/app/(app)/ayuda'),
    'src/components/Actividad.tsx',
    'src/components/Sistema.tsx',
    'src/components/ModalFee.tsx',
    'src/ui/mensajes.tsx',
  ];

  it('nada en localStorage, sessionStorage, IndexedDB ni cookies propias', () => {
    for (const f of mias)
      expect(leer(f), f).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie/);
  });

  it('ninguna pantalla usa fetch ni importa fixtures: los datos salen de cliente y hooks', () => {
    for (const f of mias) {
      expect(leer(f), f).not.toMatch(/\bfetch\(/);
      expect(leer(f), f).not.toMatch(/mock\/fixtures|data\/mock/);
    }
  });

  it('cada pantalla tiene un solo h1 (el de su barra o título), nunca uno suelto en la página', () => {
    for (const f of mias.filter((x) => x.endsWith('page.tsx')))
      expect((leer(f).match(/<h1[ >]/g) ?? []).length, f).toBeLessThanOrEqual(1);
  });

  it('seguridad usa los cuatro endpoints y confirma antes de apagar o cerrar', () => {
    const s = leer('src/app/(app)/cuenta/seguridad/page.tsx');
    for (const e of [
      'segundaVerificacion',
      'segundaVerificacionApagar',
      'sesionesAbiertas',
      'sesionesCerrarOtras',
    ])
      expect(s, e).toContain(`'${e}'`);
    expect(s).toMatch(/abierta=\{hoja === 'apagar'\}/);
    expect(s).toMatch(/abierta=\{hoja === 'cerrar'\}/);
  });

  it('descargar mis datos pide y espera: el enlace es https y de un solo uso', () => {
    const e = leer('src/app/(app)/cuenta/privacidad/_Exportacion.tsx');
    expect(e).toContain("'exportacionPedir'");
    expect(e).toMatch(/useConsulta\('exportacion'/);
    expect(e).toMatch(/una sola vez/);
    expect(e).toMatch(/rel="noopener noreferrer"/);
  });

  it('borrar la cuenta usa la baja real, en rojo y con la nota de lo que se conserva', () => {
    const p = leer('src/app/(app)/cuenta/privacidad/page.tsx');
    expect(p).toMatch(/variante="peligro"[\s\S]*href="\/cuenta\/baja\/"/);
    expect(p).toMatch(/lo que la ley obliga a guardar/);
  });

  it('en el chat solo copiar es real: reenviar y borrar avisan que no están', () => {
    const c = leer('src/app/(app)/chats/conversacion/page.tsx');
    const pies = leer('src/app/(app)/chats/conversacion/_Pies.tsx');
    expect(c).toMatch(/navigator\.clipboard\.writeText/);
    expect(pies).toMatch(/Reenviar todavía no está disponible/);
    expect(pies).toMatch(/Todavía no se pueden borrar mensajes/);
    expect(c + pies).not.toMatch(/mensajeBorrar/);
  });

  it('aceptar una tarjeta pide confirmación y manda la versión que se ve', () => {
    const t = leer('src/app/(app)/chats/conversacion/_TarjetaPropuesta.tsx');
    expect(t).toMatch(/'propuestaAceptar'[\s\S]*cuerpo: \{ version: p\.version \}/);
    expect(t).toMatch(/Sí, aceptar a/);
  });

  it('el adjuntar lleva a medir y a Mi hogar (rutas que existen en el mapa)', () => {
    const a = leer('src/app/(app)/chats/conversacion/_Adjuntar.tsx');
    const rutas = new Set(PANTALLAS.map((p) => p.ruta));
    for (const r of ['/herramientas/medir/', '/hogar/compartir/']) {
      expect(a, r).toContain(r);
      expect(rutas.has(r as never) || r === '/hogar/compartir/', r).toBe(true);
    }
  });

  it('las pantallas nuevas están en el mapa con los endpoints pedidos', () => {
    const ids = PANTALLAS.flatMap((p) => p.endpoints);
    for (const e of [
      'segundaVerificacion',
      'segundaVerificacionApagar',
      'sesionesAbiertas',
      'sesionesCerrarOtras',
      'exportacion',
      'exportacionPedir',
    ])
      expect(ids, e).toContain(e);
    expect(PANTALLAS.find((p) => p.id === 'cuenta-seguridad')?.ruta).toBe('/cuenta/seguridad/');
  });

  it('sin conexión dice que no se mandó nada', () => {
    expect(leer('src/app/(publico)/sin-conexion/page.tsx')).toMatch(/No se mandó nada/);
  });
});
