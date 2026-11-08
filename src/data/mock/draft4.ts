// Servidor simulado · contrato draft.4: acceso por código (alta directa), segunda verificación, sesiones,
// descargar datos, detalle de la propuesta, reseña, informe, Mi hogar, compartidos por pedido, recordatorios y
// camino del hogar. Mismas reglas que el servidor real: propio o 404, versiones, nada se comparte sin elegirlo.
import type { z } from 'zod';
import type {
  Ambiente,
  Camino,
  Compartido,
  DetallePropuesta,
  Equipo,
  Exportacion,
  Hogar,
  Informe,
  Recordatorio,
  Resena,
  SegundaVerificacion,
  SesionAbierta,
} from '../../contracts/v1/index.ts';
import {
  AmbienteEdicion,
  AmbienteEntrada,
  CodigoAccesoEntrada,
  CompartirEntrada,
  EquipoEdicion,
  EquipoEntrada,
  HogarEntrada,
  RecordatorioEdicion,
  RecordatorioEntrada,
  ResenaEntrada,
  SegundaVerificacionEntrada,
  VerificarCodigoEntrada,
} from '../../contracts/v1/index.ts';
import { HORA, ahoraIso, ahoraMs, iso, nuevoId } from './mundo.ts';
import { falla } from './reglas.ts';
import type { Mundo, Trabajo } from './tipos.ts';

/** Código fijo de la vista de prueba (nunca se manda un mail de verdad). */
export const CODIGO_ACCESO_PRUEBA = '246810';

type AmbienteT = z.output<typeof Ambiente>;
type EquipoT = z.output<typeof Equipo>;

export interface EstadoDraft4 {
  hogar: z.output<typeof Hogar>;
  compartidos: z.output<typeof Compartido>[];
  recordatorios: z.output<typeof Recordatorio>[];
  resenas: Record<string, z.output<typeof Resena>>;
  segunda: z.output<typeof SegundaVerificacion>;
  sesiones: z.output<typeof SesionAbierta>[];
  exportacion: z.output<typeof Exportacion> | null;
  /** Códigos pedidos por email (en memoria): intentos y vencimiento como el servidor. */
  codigos: Map<string, { intentos: number; venceMs: number }>;
}

export function estadoDraft4Vacio(): EstadoDraft4 {
  return {
    hogar: { vivienda: null, ambientes: [], equipos: [], completitud: 0, version: 0 },
    compartidos: [],
    recordatorios: [],
    resenas: {},
    segunda: { activa: false, metodo: null, activadaEn: null },
    sesiones: [],
    exportacion: null,
    codigos: new Map(),
  };
}

type R = { p: Record<string, string>; q: Record<string, unknown>; c: unknown };
const cuerpo = <T extends z.ZodType>(r: R, _t: T): z.output<T> => r.c as z.output<T>;
const noEncontrado = (m: Mundo) => falla(m, 'no_encontrado', 'No lo encontramos.');
const hoy = (m: Mundo) => ahoraIso(m).slice(0, 10);
const enDias = (m: Mundo, dias: number) => iso(ahoraMs(m) + dias * 24 * HORA).slice(0, 10);

// ── Detalle de la propuesta (lo que se ve antes de contactar) ───────────────────────────────────────────
/** Detalle verosímil y determinístico según el especialista y el monto; `visita` si el precio es solo de visita. */
export function detalleSimulado(
  espIndice: number,
  centavos: number,
): z.output<typeof DetallePropuesta> {
  if (centavos <= 1_000_000)
    return {
      oferta: 'visita',
      materiales: null,
      equipo: { personas: 1, descripcion: null },
      duracion: { minimo: 1, maximo: 1, unidad: 'horas' },
      garantiaDias: null,
      visitaPrevia: true,
      incluye: ['Revisar el problema en tu casa', 'Presupuesto del trabajo por escrito'],
      noIncluye: ['El arreglo (se presupuesta en la visita)'],
    };
  const conMateriales = espIndice % 2 === 0;
  const dos = espIndice % 3 === 2;
  return {
    oferta: 'trabajo',
    materiales: conMateriales
      ? {
          incluidos: true,
          descripcion: 'Repuestos de primera marca o similar; los lleva el especialista.',
        }
      : {
          incluidos: false,
          descripcion: 'Te paso la lista para que los compres o los compro con tu OK.',
        },
    equipo: { personas: dos ? 2 : 1, descripcion: dos ? 'Viene con un ayudante.' : null },
    duracion: { minimo: 1, maximo: dos ? 3 : 2, unidad: 'horas' },
    garantiaDias: dos ? 120 : conMateriales ? 90 : 60,
    visitaPrevia: false,
    incluye: [
      'Diagnóstico y arreglo',
      'Prueba de funcionamiento al terminar',
      'Retiro de lo que se cambia',
    ],
    noIncluye: ['Arreglos de pared o cerámica'],
  };
}

// ── Mi hogar ──────────────────────────────────────────────────────────────────────────────────────────
function completitudAmbiente(a: AmbienteT, equipos: readonly EquipoT[]): number {
  let p = 0;
  if (a.fotos.length > 0) p += 30;
  if (a.medidas) p += 25;
  if (a.materiales) p += 20;
  if (equipos.some((e) => e.ambienteId === a.id)) p += 25;
  return p;
}

function recalcularHogar(m: Mundo): void {
  const h = m.d4.hogar;
  h.ambientes = h.ambientes.map((a) => ({ ...a, completitud: completitudAmbiente(a, h.equipos) }));
  const base = h.vivienda ? 10 : 0;
  const prom = h.ambientes.length
    ? h.ambientes.reduce((s, a) => s + a.completitud, 0) / h.ambientes.length
    : 0;
  h.completitud = Math.min(100, Math.round(base + prom * 0.9));
}

const ambientePropio = (m: Mundo, id: string) =>
  m.d4.hogar.ambientes.find((a) => a.id === id) ??
  (() => {
    throw noEncontrado(m);
  })();
const equipoPropio = (m: Mundo, id: string) =>
  m.d4.hogar.equipos.find((e) => e.id === id) ??
  (() => {
    throw noEncontrado(m);
  })();

function versionOk(m: Mundo, actual: number, vista: number): void {
  if (actual !== vista)
    throw falla(
      m,
      'conflicto',
      'Esto cambió mientras lo mirabas. Actualizá para ver el estado actual.',
      {
        conflicto: 'version',
      },
    );
}

/** La casa de Lucía para la vista de prueba (datos ficticios). */
export function poblarHogar(m: Mundo): void {
  const bano = nuevoId(m);
  const cocina = nuevoId(m);
  const living = nuevoId(m);
  const dormitorio = nuevoId(m);
  const lavadero = nuevoId(m);
  const amb = (
    id: string,
    tipo: AmbienteT['tipo'],
    nombre: string,
    extra: Partial<AmbienteT>,
  ): AmbienteT => ({
    id,
    tipo,
    nombre,
    medidas: null,
    materiales: null,
    notas: null,
    fotos: [],
    completitud: 0,
    version: 0,
    ...extra,
  });
  const eq = (
    ambienteId: string,
    tipo: EquipoT['tipo'],
    nombre: string,
    extra: Partial<EquipoT> = {},
  ): EquipoT => ({
    id: nuevoId(m),
    ambienteId,
    tipo,
    nombre,
    marca: null,
    modelo: null,
    instaladoEn: null,
    ultimoMantenimiento: null,
    garantiaHasta: null,
    etiqueta: null,
    version: 0,
    ...extra,
  });
  m.d4.hogar = {
    vivienda: 'casa',
    ambientes: [
      amb(bano, 'bano', 'Baño', {
        medidas: { anchoCm: 210, largoCm: 180, altoCm: 260 },
        materiales: 'Cerámica blanca 30 × 60. Caños de termofusión; llave de paso bajo la bacha.',
        notas: 'La llave de paso general está en la vereda, tapa verde.',
      }),
      amb(cocina, 'cocina', 'Cocina', {
        materiales: 'Mesada de granito gris; anafe a gas natural.',
      }),
      amb(living, 'living', 'Living', { medidas: { anchoCm: 420, largoCm: 360, altoCm: 260 } }),
      amb(dormitorio, 'dormitorio', 'Dormitorio', {}),
      amb(lavadero, 'lavadero', 'Lavadero', {
        materiales: 'Sobraron 2 cajas de cerámica del baño.',
      }),
    ],
    equipos: [
      eq(bano, 'canilla', 'Canilla del lavatorio', {
        marca: 'Marca De Prueba',
        garantiaHasta: enDias(m, 90),
      }),
      eq(bano, 'inodoro', 'Inodoro con mochila', { instaladoEn: enDias(m, -14) }),
      eq(bano, 'ducha', 'Ducha'),
      eq(cocina, 'calefon', 'Calefón 14 L', {
        marca: 'Marca De Prueba',
        modelo: 'Tiro natural',
        instaladoEn: '2021-03-10',
        ultimoMantenimiento: '2026-03-12',
      }),
      eq(cocina, 'anafe', 'Anafe a gas'),
      eq(dormitorio, 'aire_acondicionado', 'Aire acondicionado'),
      eq(lavadero, 'termotanque', 'Termotanque 80 L', { instaladoEn: '2019-06-01' }),
    ],
    completitud: 0,
    version: 0,
  };
  recalcularHogar(m);
  const calefon = m.d4.hogar.equipos.find((e) => e.tipo === 'calefon');
  m.d4.recordatorios = [
    {
      id: nuevoId(m),
      titulo: 'Revisar el calefón',
      equipoId: calefon?.id ?? null,
      fecha: enDias(m, 20),
      cadaMeses: 12,
      activo: true,
      origen: 'informe',
      hechoEn: null,
    },
    {
      id: nuevoId(m),
      titulo: 'Limpiar los filtros del aire',
      equipoId: null,
      fecha: enDias(m, 75),
      cadaMeses: 3,
      activo: true,
      origen: 'sugerido',
      hechoEn: enDias(m, -15),
    },
    {
      id: nuevoId(m),
      titulo: 'Probar el disyuntor',
      equipoId: null,
      fecha: enDias(m, 160),
      cadaMeses: 6,
      activo: true,
      origen: 'sugerido',
      hechoEn: null,
    },
    {
      id: nuevoId(m),
      titulo: 'Revisar las otras canillas',
      equipoId: null,
      fecha: enDias(m, 360),
      cadaMeses: null,
      activo: false,
      origen: 'informe',
      hechoEn: null,
    },
  ];
  m.d4.sesiones = [
    { id: nuevoId(m), dispositivo: 'celular', ultimoUso: ahoraIso(m), actual: true },
    {
      id: nuevoId(m),
      dispositivo: 'computadora',
      ultimoUso: iso(ahoraMs(m) - 3 * 24 * HORA),
      actual: false,
    },
  ];
}

// ── Informe y reseña ──────────────────────────────────────────────────────────────────────────────────
const TERMINADOS: readonly Trabajo['estado'][] = ['terminado_por_especialista', 'finalizado'];

function informeDe(m: Mundo, t: Trabajo): z.output<typeof Informe> | null {
  if (!TERMINADOS.includes(t.estado)) return null;
  const pedido = m.pedidos.find((p) => p.id === t.pedidoId);
  const fotos = pedido?.fotos ?? [];
  return {
    trabajoId: t.id,
    encontrado: 'Cuerito gastado y cartucho con una fisura. Se cambiaron los dos.',
    pruebas: 'Sin pérdidas durante 10 minutos con la llave abierta.',
    materiales: ['Cuerito', 'Vástago', 'Cartucho cerámico'],
    garantiaHasta: enDias(m, 90),
    recomendaciones: [{ texto: 'Revisar las otras canillas de la casa', enMeses: 12 }],
    fotosAntes: fotos.slice(0, 2),
    fotosDespues: fotos.slice(2, 4),
    creadoEn: t.actualizadoEn,
  };
}

// ── Camino del hogar ──────────────────────────────────────────────────────────────────────────────────
function caminoDe(m: Mundo): z.output<typeof Camino> {
  const informes = m.trabajos.filter((t) => TERMINADOS.includes(t.estado)).length;
  const conformidades = m.trabajos.filter((t) => t.estado === 'finalizado').length;
  const aTiempo = m.d4.recordatorios.filter((r) => r.hechoEn && r.hechoEn <= r.fecha).length;
  const ficha = m.d4.hogar.completitud;
  const hito = (
    id: string,
    titulo: string,
    descripcion: string,
    actual: number,
    total: number,
  ) => ({
    id,
    titulo,
    descripcion,
    progreso: { actual: Math.min(actual, total), total },
    estado: (actual >= total ? 'hecho' : 'falta') as 'hecho' | 'ahora' | 'falta',
  });
  const hitos = [
    hito('ficha_casa', 'Ficha de tu casa', 'Cargaste ambientes y equipos', ficha >= 60 ? 1 : 0, 1),
    hito(
      'primer_informe',
      'Primer informe leído',
      'Sabés qué se hizo y hasta cuándo cubre',
      informes,
      1,
    ),
    hito(
      'mantenimiento',
      'Mantenimiento a tiempo',
      'Hacé 3 mantenimientos antes de que venzan',
      aTiempo,
      3,
    ),
    hito(
      'conformidades',
      'Tres conformidades',
      'Confirmaste trabajos terminados',
      conformidades,
      3,
    ),
    hito('casa_al_dia', 'Casa al día', 'Todo revisado este año', 0, 1),
  ];
  const primeraPendiente = hitos.findIndex((h) => h.estado === 'falta');
  if (primeraPendiente >= 0)
    hitos[primeraPendiente] = { ...hitos[primeraPendiente]!, estado: 'ahora' };
  const ins = (id: string, nombre: string, descripcion: string, ok: boolean) => ({
    id,
    nombre,
    descripcion,
    obtenidaEn: ok ? hoy(m) : null,
  });
  return {
    hitos,
    insignias: [
      ins('casa_fichada', 'Casa fichada', 'Completaste la ficha de tu casa', ficha >= 60),
      ins('ojo_inspector', 'Ojo de inspector', 'Leíste tu primer informe', informes > 0),
      ins('al_dia', 'Al día', '3 mantenimientos a tiempo', aTiempo >= 3),
      ins('conforme', 'Conforme', '3 conformidades', conformidades >= 3),
      ins('medidor', 'Medidor', 'Mediste 5 cosas', false),
      ins('buen_vecino', 'Buen vecino', '3 reseñas', Object.keys(m.d4.resenas).length >= 3),
    ],
    beneficios: [
      {
        id: '00000000-0000-4000-8000-0000000000b1',
        titulo: 'Guía de mantenimiento de invierno',
        descripcion: 'Lo que conviene revisar antes del frío.',
        requisito: 'Con «Casa fichada»',
        estado: 'borrador_legal',
      },
      {
        id: '00000000-0000-4000-8000-0000000000b2',
        titulo: 'Recordatorios con fecha sugerida',
        descripcion: 'Te proponemos el mejor momento del año.',
        requisito: 'Con «Ojo de inspector»',
        estado: 'borrador_legal',
      },
      {
        id: '00000000-0000-4000-8000-0000000000b3',
        titulo: 'Beneficio en una revisión anual',
        descripcion: 'Monto y condiciones a definir con Legal.',
        requisito: 'Con «Casa al día»',
        estado: 'borrador_legal',
      },
    ],
  };
}

// ── Manejadores ───────────────────────────────────────────────────────────────────────────────────────
type Manejador = (m: Mundo, r: R) => unknown;

/**
 * `entrarComo` y `trabajoPropio` vienen de servidor.ts (inyectados para no crear un ciclo de imports).
 * `entrarComo(email, aceptaciones)` inicia sesión o crea la cuenta y devuelve la sesión.
 */
export function manejadoresDraft4(dep: {
  entrarComo: (
    m: Mundo,
    email: string,
    aceptaciones: { documento: string; version: string }[] | undefined,
  ) => unknown;
  trabajoPropio: (m: Mundo, id: string) => Trabajo;
}): Record<string, Manejador> {
  // La sesión la exige el adaptador (cliente-mock.ts) según `acceso` del contrato.
  const sesion = (f: Manejador): Manejador => f;
  return {
    accesoCodigo: (m, r) => {
      const c = cuerpo(r, CodigoAccesoEntrada);
      m.d4.codigos.set(c.email, { intentos: 0, venceMs: ahoraMs(m) + 10 * 60_000 });
      return undefined;
    },
    accesoVerificar: (m, r) => {
      const c = cuerpo(r, VerificarCodigoEntrada);
      const pedido = m.d4.codigos.get(c.email);
      if (!pedido || pedido.venceMs < ahoraMs(m))
        throw falla(m, 'conflicto', 'El código venció. Pedí uno nuevo.', {
          conflicto: 'ya_resuelta',
        });
      if (pedido.intentos >= 5)
        throw falla(m, 'limite', 'Hiciste demasiados intentos. Pedí un código nuevo.');
      if (c.codigo !== CODIGO_ACCESO_PRUEBA) {
        pedido.intentos += 1;
        throw falla(m, 'no_autenticado', 'El código no es correcto. Revisalo y probá de nuevo.');
      }
      if (m.d4.segunda.activa && c.segundoFactor !== CODIGO_ACCESO_PRUEBA)
        throw falla(m, 'no_autenticado', 'Falta el código de tu segunda verificación.', {
          campos: [{ campo: 'segundoFactor', motivo: 'requerido' }],
        });
      m.d4.codigos.delete(c.email);
      return dep.entrarComo(m, c.email, c.aceptaciones);
    },
    accesoProveedor: (m) => {
      throw falla(
        m,
        'funcion_inactiva',
        'Entrar con Google o Apple todavía no está disponible. Usá tu email.',
      );
    },
    segundaVerificacion: sesion((m) => m.d4.segunda),
    segundaVerificacionActivar: sesion((m, r) => {
      const c = cuerpo(r, SegundaVerificacionEntrada);
      if (c.codigo !== CODIGO_ACCESO_PRUEBA)
        throw falla(m, 'validacion', 'El código no es correcto.', {
          campos: [{ campo: 'codigo', motivo: 'formato' }],
        });
      m.d4.segunda = { activa: true, metodo: c.metodo, activadaEn: ahoraIso(m) };
      return m.d4.segunda;
    }),
    segundaVerificacionApagar: sesion((m) => {
      m.d4.segunda = { activa: false, metodo: null, activadaEn: null };
      return m.d4.segunda;
    }),
    sesionesAbiertas: sesion((m) => ({ items: m.d4.sesiones })),
    sesionesCerrarOtras: sesion((m) => {
      m.d4.sesiones = m.d4.sesiones.filter((s) => s.actual);
      return { items: m.d4.sesiones };
    }),
    exportacion: sesion((m) => m.d4.exportacion),
    exportacionPedir: sesion((m) => {
      m.d4.exportacion = {
        id: nuevoId(m),
        estado: 'preparando',
        pedidaEn: ahoraIso(m),
        url: null,
        venceEn: null,
      };
      return m.d4.exportacion;
    }),
    resena: sesion((m, r) => {
      const t = dep.trabajoPropio(m, r.p.id ?? '');
      return m.d4.resenas[t.id] ?? null;
    }),
    resenaCrear: sesion((m, r) => {
      const t = dep.trabajoPropio(m, r.p.id ?? '');
      if (t.estado !== 'finalizado')
        throw falla(m, 'conflicto', 'La reseña se deja cuando el trabajo está terminado.', {
          conflicto: 'transicion',
        });
      if (m.d4.resenas[t.id])
        throw falla(m, 'conflicto', 'Ya dejaste tu reseña de este trabajo.', {
          conflicto: 'ya_resuelta',
        });
      const c = cuerpo(r, ResenaEntrada);
      const resena = { ...c, id: nuevoId(m), trabajoId: t.id, creadaEn: ahoraIso(m) };
      m.d4.resenas[t.id] = resena;
      return resena;
    }),
    informe: sesion((m, r) => informeDe(m, dep.trabajoPropio(m, r.p.id ?? ''))),
    hogar: sesion((m) => m.d4.hogar),
    hogarEditar: sesion((m, r) => {
      const c = cuerpo(r, HogarEntrada);
      versionOk(m, m.d4.hogar.version, c.version);
      m.d4.hogar.vivienda = c.vivienda;
      m.d4.hogar.version += 1;
      recalcularHogar(m);
      return m.d4.hogar;
    }),
    ambienteCrear: sesion((m, r) => {
      const c = cuerpo(r, AmbienteEntrada);
      if (m.d4.hogar.ambientes.length >= 30)
        throw falla(m, 'limite', 'Llegaste al máximo de ambientes.');
      const a: AmbienteT = {
        id: nuevoId(m),
        tipo: c.tipo,
        nombre: c.nombre,
        medidas: c.medidas ?? null,
        materiales: c.materiales ?? null,
        notas: c.notas ?? null,
        fotos: [],
        completitud: 0,
        version: 0,
      };
      m.d4.hogar.ambientes.push(a);
      m.d4.hogar.version += 1;
      recalcularHogar(m);
      return ambientePropio(m, a.id);
    }),
    ambienteEditar: sesion((m, r) => {
      const a = ambientePropio(m, r.p.id ?? '');
      const c = cuerpo(r, AmbienteEdicion);
      versionOk(m, a.version, c.version);
      const { version: _v, fotoIds: _f, ...cambios } = c;
      Object.assign(a, cambios, { version: a.version + 1 });
      m.d4.hogar.version += 1;
      recalcularHogar(m);
      return ambientePropio(m, a.id);
    }),
    ambienteBorrar: sesion((m, r) => {
      const a = ambientePropio(m, r.p.id ?? '');
      m.d4.hogar.ambientes = m.d4.hogar.ambientes.filter((x) => x.id !== a.id);
      m.d4.hogar.equipos = m.d4.hogar.equipos.filter((e) => e.ambienteId !== a.id);
      m.d4.hogar.version += 1;
      recalcularHogar(m);
      return undefined;
    }),
    equipoCrear: sesion((m, r) => {
      const c = cuerpo(r, EquipoEntrada);
      ambientePropio(m, c.ambienteId);
      const e: EquipoT = {
        id: nuevoId(m),
        ambienteId: c.ambienteId,
        tipo: c.tipo,
        nombre: c.nombre,
        marca: c.marca ?? null,
        modelo: c.modelo ?? null,
        instaladoEn: c.instaladoEn ?? null,
        ultimoMantenimiento: null,
        garantiaHasta: null,
        etiqueta: null,
        version: 0,
      };
      m.d4.hogar.equipos.push(e);
      m.d4.hogar.version += 1;
      recalcularHogar(m);
      return e;
    }),
    equipoEditar: sesion((m, r) => {
      const e = equipoPropio(m, r.p.id ?? '');
      const c = cuerpo(r, EquipoEdicion);
      versionOk(m, e.version, c.version);
      if (c.ambienteId) ambientePropio(m, c.ambienteId);
      const { version: _v, etiquetaId: _e, ...cambios } = c;
      Object.assign(e, cambios, { version: e.version + 1 });
      m.d4.hogar.version += 1;
      recalcularHogar(m);
      return e;
    }),
    equipoBorrar: sesion((m, r) => {
      const e = equipoPropio(m, r.p.id ?? '');
      m.d4.hogar.equipos = m.d4.hogar.equipos.filter((x) => x.id !== e.id);
      m.d4.hogar.version += 1;
      recalcularHogar(m);
      return undefined;
    }),
    compartir: sesion((m, r) => {
      const pedido =
        m.pedidos.find((p) => p.id === r.p.id) ??
        (() => {
          throw noEncontrado(m);
        })();
      const c = cuerpo(r, CompartirEntrada);
      for (const it of c.items) {
        const existe =
          it.tipo === 'equipo'
            ? m.d4.hogar.equipos.some((e) => e.id === it.refId)
            : it.tipo === 'informe'
              ? m.trabajos.some((t) => t.id === it.refId)
              : m.d4.hogar.ambientes.some((a) => a.id === it.refId);
        if (!existe) throw noEncontrado(m);
      }
      const compartido = {
        id: nuevoId(m),
        pedidoId: pedido.id,
        items: c.items,
        estado: 'activo' as const,
        creadoEn: ahoraIso(m),
        finalizadoEn: null,
      };
      m.d4.compartidos.unshift(compartido);
      return compartido;
    }),
    compartidos: sesion((m) => {
      // Vence solo cuando el pedido terminó o se canceló.
      for (const c of m.d4.compartidos) {
        const p = m.pedidos.find((x) => x.id === c.pedidoId);
        if (
          c.estado === 'activo' &&
          p &&
          ['cancelado', 'contratado', 'vencido'].includes(p.estado)
        ) {
          c.estado = 'vencido';
          c.finalizadoEn = ahoraIso(m);
        }
      }
      return { items: m.d4.compartidos };
    }),
    compartidoRevocar: sesion((m, r) => {
      const c =
        m.d4.compartidos.find((x) => x.id === r.p.id) ??
        (() => {
          throw noEncontrado(m);
        })();
      if (c.estado === 'activo') {
        c.estado = 'revocado';
        c.finalizadoEn = ahoraIso(m);
      }
      return c;
    }),
    recordatorios: sesion((m) => ({ items: m.d4.recordatorios })),
    recordatorioCrear: sesion((m, r) => {
      const c = cuerpo(r, RecordatorioEntrada);
      if (c.equipoId) equipoPropio(m, c.equipoId);
      const rec = { ...c, id: nuevoId(m), activo: true, origen: 'usuario' as const, hechoEn: null };
      m.d4.recordatorios.push(rec);
      return rec;
    }),
    recordatorioEditar: sesion((m, r) => {
      const rec =
        m.d4.recordatorios.find((x) => x.id === r.p.id) ??
        (() => {
          throw noEncontrado(m);
        })();
      const c = cuerpo(r, RecordatorioEdicion);
      if (c.activo !== undefined) rec.activo = c.activo;
      if (c.hecho) rec.hechoEn = hoy(m);
      return rec;
    }),
    camino: sesion((m) => caminoDe(m)),
  };
}
