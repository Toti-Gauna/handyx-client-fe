// Mundos de los 18 escenarios obligatorios (src/mapa/escenarios.ts). Cada uno arma un estado reproducible,
// ficticio y sin backend. `?escenario=<id>` los activa en la vista de prueba.
import type { Rubro } from '../../contracts/v1/pedidos.ts';
import { prueba } from '../prueba.ts';
import {
  HORA,
  MIN,
  VERSIONES_TEXTOS,
  ahoraIso,
  ahoraMs,
  iso,
  notificar,
  nuevoId,
} from './mundo.ts';
import {
  contratar,
  convDe,
  estadoTrabajo,
  mensajeSistema,
  nuevoPedido,
  proponer,
} from './reglas.ts';
import type {
  EspecialistaResumen,
  Mundo,
  Pedido,
  Propuesta,
  RegistroPago,
  Trabajo,
} from './tipos.ts';

const UBICACION = {
  ciudad: 'Mar del Plata',
  barrio: 'La Perla',
  direccion: 'Calle Ficticia 1650',
  referencia: null,
  origen: 'manual' as const,
  coordenadas: null,
};

const PERFIL = {
  nombre: 'Usuaria',
  apellido: 'Demo',
  fechaNacimiento: '1990-05-20',
  nacionalidad: 'AR',
  genero: 'prefiero_no_decir' as const,
  ubicacion: UBICACION,
};

/** Deja la sesión iniciada con la cuenta de prueba, perfil completo y textos aceptados. */
export function iniciarSesion(
  m: Mundo,
  opciones: { feeAceptada?: boolean; perfil?: Mundo['perfil'] } = {},
): void {
  m.cuentaId = m.cuentas[0]?.id ?? null;
  m.perfil = opciones.perfil ?? { ...PERFIL };
  m.perfilVersion = 1;
  m.aceptaciones = (['terminos', 'privacidad'] as const).map((documento) => ({
    documento,
    version: VERSIONES_TEXTOS[documento],
    aceptadaEn: '2026-11-10T13:00:00.000Z',
  }));
  m.estadoCuenta = 'activa';
  m.feeAceptada =
    opciones.feeAceptada === false
      ? null
      : {
          politicaId: m.politica.id,
          version: m.politica.version,
          aceptadaEn: '2026-11-10T13:05:00.000Z',
        };
  m.llamadasConSesion = 0;
}

const esp = (m: Mundo, n: number): EspecialistaResumen =>
  m.especialistas[n - 1] as EspecialistaResumen;

/** Ejecuta `fn` con el reloj corrido hacia atrás: los registros quedan con fecha en el pasado. */
export function enPasado<T>(m: Mundo, ms: number, fn: () => T): T {
  m.offsetMs -= ms;
  try {
    return fn();
  } finally {
    m.offsetMs += ms;
  }
}

const RUTA_ESTADOS: Trabajo['estado'][] = [
  'agendado',
  'en_camino',
  'en_sitio',
  'en_curso',
  'terminado_por_especialista',
  'finalizado',
];

function datosPedido(
  rubro: Rubro,
  tipo: Pedido['tipo'],
  extra: {
    fecha?: string | undefined;
    desde?: string | undefined;
    descripcion?: string | undefined;
    precio?: number | null;
    auto?: number | null;
  } = {},
) {
  return {
    rubro,
    tipo,
    descripcion: extra.descripcion ?? 'Pierde la canilla de la cocina y gotea sobre la mesada.',
    ubicacion: m_ubicacion(),
    fechaSolicitada:
      tipo === 'urgente'
        ? null
        : { fecha: extra.fecha ?? '2026-11-19', desde: extra.desde ?? '10:00', hasta: null },
    precioPropuestoCentavos: extra.precio ?? null,
    autoaceptacion: extra.auto ? { montoMaximoCentavos: extra.auto } : null,
    fotos: [],
  };
}
const m_ubicacion = () => ({ ...UBICACION });

/** Pedido contratado → trabajo en el estado pedido, con su chat. */
export function crearTrabajo(
  m: Mundo,
  o: {
    rubro: Rubro;
    esp: number;
    centavos: number;
    tipo?: Pedido['tipo'];
    estado?: Trabajo['estado'];
    fecha?: string;
    desde?: string;
    haceMs?: number;
    descripcion?: string;
  },
): { pedido: Pedido; prop: Propuesta; trabajo: Trabajo } {
  const hace = o.haceMs ?? 2 * HORA;
  return enPasado(m, hace, () => {
    const pedido = nuevoPedido(
      m,
      datosPedido(o.rubro, o.tipo ?? 'programado', {
        fecha: o.fecha,
        desde: o.desde,
        descripcion: o.descripcion,
      }),
      { creadoMs: ahoraMs(m), sinOfertas: true },
    );
    const e = esp(m, o.esp);
    const prop = proponer(m, pedido, e, {
      centavos: o.centavos,
      alcance: 'Revisión, reparación y prueba de funcionamiento.',
    });
    const conv = convDe(m, pedido, e);
    mensajeSistema(m, conv, 'Hola, vi tu pedido. Te mando la propuesta.', 'especialista');
    const trabajo = contratar(m, prop, 'usuario');
    m.ofertas[pedido.id] = { listaEn: 0, sinOfertas: true, generadas: true };
    const destino = o.estado ?? 'agendado';
    if (destino === 'cancelado') estadoTrabajo(m, trabajo, 'cancelado', 'usuario');
    else
      for (const paso of RUTA_ESTADOS.slice(1, RUTA_ESTADOS.indexOf(destino) + 1))
        estadoTrabajo(m, trabajo, paso, paso === 'finalizado' ? 'usuario' : 'especialista');
    conv.noLeidos = 0;
    return { pedido, prop, trabajo };
  });
}

function pagoDe(
  m: Mundo,
  t: Trabajo,
  o: Partial<RegistroPago> & { estado: RegistroPago['estado'] },
): RegistroPago {
  const pago: RegistroPago = {
    id: nuevoId(m),
    trabajoId: t.id,
    etapaId: null,
    metodo: 'efectivo',
    monto: t.acuerdo.monto,
    fuente: null,
    reportadoEn: null,
    verificadoEn: null,
    version: 0,
    ...o,
  };
  m.pagos.push(pago);
  return pago;
}

/** Mundo del login común: historial, un turno agendado y avisos. No hay pedidos activos. */
export function poblarBase(m: Mundo): void {
  iniciarSesion(m, { feeAceptada: false });
  const { trabajo: previo } = crearTrabajo(m, {
    rubro: 'plomeria',
    esp: 1,
    centavos: 3_500_000,
    estado: 'finalizado',
    haceMs: 10 * 24 * HORA,
    fecha: '2026-11-07',
    desde: '09:00',
  });
  pagoDe(m, previo, {
    estado: 'verificado',
    fuente: 'operaciones',
    reportadoEn: iso(ahoraMs(m) - 10 * 24 * HORA),
    verificadoEn: iso(ahoraMs(m) - 10 * 24 * HORA),
  });
  const { trabajo: proximo } = crearTrabajo(m, {
    rubro: 'electricidad',
    esp: 2,
    centavos: 3_800_000,
    estado: 'agendado',
    fecha: '2026-11-18',
    desde: '10:00',
    haceMs: 3 * HORA,
  });
  notificar(m, 'propuesta_aceptada', { tipo: 'trabajo', id: proximo.id });
  m.contenido = 'base';
}

type Constructor = (m: Mundo) => void;

const sinOfertas = (
  m: Mundo,
  rubro: Rubro,
  tipo: Pedido['tipo'],
  haceMs: number,
  extra: Parameters<typeof datosPedido>[2] = {},
) =>
  enPasado(m, haceMs, () => nuevoPedido(m, datosPedido(rubro, tipo, extra), { sinOfertas: true }));

export const CONSTRUCTORES: Record<string, Constructor> = {
  'nuevo-usuario': () => undefined,

  'otra-ciudad': (m) => {
    iniciarSesion(m, {
      perfil: {
        ...PERFIL,
        ubicacion: {
          ...UBICACION,
          ciudad: 'Rosario',
          barrio: null,
          direccion: 'Calle Ficticia 100',
        },
      },
    });
    m.contenido = 'escenario';
  },

  'ubicacion-denegada': (m) => {
    const { ubicacion: _u, ...sinUbicacion } = PERFIL;
    iniciarSesion(m, { perfil: sinUbicacion });
    m.estadoCuenta = 'perfil_incompleto';
    prueba.geo = 'denegada';
    m.contenido = 'escenario';
  },

  'sin-especialistas': (m) => {
    iniciarSesion(m);
    m.flags.sinOfertas = true;
    sinOfertas(m, 'plomeria', 'urgente', 18 * MIN);
    m.contenido = 'escenario';
  },

  'varias-propuestas': (m) => {
    iniciarSesion(m);
    const pedido = enPasado(m, 10 * MIN, () =>
      nuevoPedido(m, datosPedido('plomeria', 'programado', { fecha: '2026-11-19' }), {
        sinOfertas: true,
      }),
    );
    m.ofertas[pedido.id] = { listaEn: 0, sinOfertas: false, generadas: true };
    const montos = [4_500_000, 3_900_000, 5_200_000];
    const alcances = [
      'Revisión, reparación de la pérdida y prueba de funcionamiento. Materiales menores incluidos.',
      'Cambio de grifería (la compra del repuesto corre por tu cuenta) y prueba.',
      'Revisión completa de la instalación de la cocina, con garantía de 30 días sobre la mano de obra.',
    ];
    [1, 3, 4].forEach((n, i) => {
      const p = proponer(m, pedido, esp(m, n), {
        centavos: montos[i] ?? 4_000_000,
        alcance: alcances[i] ?? '',
      });
      notificar(m, 'propuesta_recibida', { tipo: 'propuesta', id: p.id });
    });
    pedido.estado = 'con_propuestas';
    pedido.propuestasPendientes = 3;
    m.contenido = 'escenario';
  },

  contrapropuesta: (m) => {
    CONSTRUCTORES['varias-propuestas']?.(m);
    // Una sola oferta para centrar el escenario.
    const extra = m.propuestas.slice(1);
    m.propuestas = m.propuestas.slice(0, 1);
    for (const e of extra)
      m.conversaciones = m.conversaciones.filter((c) => c.id !== e.conversacionId);
    const pedido = m.pedidos[0];
    if (pedido) pedido.propuestasPendientes = 1;
  },

  'aceptacion-duplicada': (m) => {
    CONSTRUCTORES['varias-propuestas']?.(m);
    m.flags.carreraAceptacion = true;
  },

  'propuesta-vencida': (m) => {
    iniciarSesion(m);
    const pedido = enPasado(m, 4 * MIN + 30_000, () =>
      nuevoPedido(m, datosPedido('plomeria', 'urgente'), { sinOfertas: true }),
    );
    m.ofertas[pedido.id] = { listaEn: 0, sinOfertas: false, generadas: true };
    const p = proponer(m, pedido, esp(m, 1), {
      centavos: 4_500_000,
      alcance: 'Revisión, reparación y prueba. Voy en cuanto aceptes.',
      venceEn: ahoraMs(m) + 45_000,
    });
    notificar(m, 'propuesta_recibida', { tipo: 'propuesta', id: p.id });
    pedido.estado = 'con_propuestas';
    pedido.propuestasPendientes = 1;
    m.contenido = 'escenario';
  },

  'urgencia-sin-respuesta': (m) => {
    iniciarSesion(m);
    m.flags.sinOfertas = true;
    sinOfertas(m, 'electricidad', 'urgente', 21 * MIN, {
      descripcion: 'Se cortó la luz en la mitad de la casa.',
    });
    m.contenido = 'escenario';
  },

  programado: (m) => {
    iniciarSesion(m);
    m.flags.sinOfertas = true;
    sinOfertas(m, 'gas', 'programado', 13 * HORA, {
      fecha: '2026-11-21',
      desde: '15:00',
      descripcion: 'Revisión anual del calefón.',
    });
    crearTrabajo(m, {
      rubro: 'aire_acondicionado',
      esp: 2,
      centavos: 6_500_000,
      estado: 'agendado',
      fecha: '2026-11-20',
      desde: '16:00',
      haceMs: 5 * HORA,
    });
    m.contenido = 'escenario';
  },

  'obra-por-etapas': (m) => {
    iniciarSesion(m);
    const { trabajo } = crearTrabajo(m, {
      rubro: 'albanileria',
      esp: 3,
      centavos: 12_000_000,
      tipo: 'obra',
      estado: 'en_curso',
      fecha: '2026-11-17',
      desde: '09:00',
      descripcion: 'Arreglar la humedad de la pared del baño y revocar.',
    });
    const primera = trabajo.etapas[0];
    if (primera) primera.estado = 'terminada_por_especialista';
    m.contenido = 'escenario';
  },

  'chat-fallido': (m) => {
    iniciarSesion(m);
    crearTrabajo(m, {
      rubro: 'electricidad',
      esp: 2,
      centavos: 3_800_000,
      estado: 'agendado',
      fecha: '2026-11-18',
      desde: '10:00',
    });
    m.flags.fallarProximoMensaje = true;
    m.flags.fallarProximaFoto = true;
    m.contenido = 'escenario';
  },

  cancelacion: (m) => {
    iniciarSesion(m);
    m.flags.sinOfertas = true;
    sinOfertas(m, 'cerrajeria', 'programado', 3 * MIN, {
      fecha: '2026-11-22',
      desde: '11:00',
      descripcion: 'Cambiar la cerradura de la puerta de calle.',
    });
    crearTrabajo(m, {
      rubro: 'plomeria',
      esp: 1,
      centavos: 4_500_000,
      estado: 'agendado',
      fecha: '2026-11-19',
      desde: '09:30',
    });
    m.contenido = 'escenario';
  },

  'efectivo-reportado': (m) => {
    iniciarSesion(m);
    const { trabajo } = crearTrabajo(m, {
      rubro: 'plomeria',
      esp: 1,
      centavos: 4_500_000,
      estado: 'terminado_por_especialista',
      fecha: '2026-11-17',
      desde: '09:00',
    });
    pagoDe(m, trabajo, {
      estado: 'reportado',
      fuente: 'reporte_usuario',
      reportadoEn: ahoraIso(m),
    });
    m.contenido = 'escenario';
  },

  'mp-pendiente-fallido': (m) => {
    iniciarSesion(m);
    m.flags.checkoutActivo = true;
    const { trabajo } = crearTrabajo(m, {
      rubro: 'electricidad',
      esp: 2,
      centavos: 3_800_000,
      estado: 'terminado_por_especialista',
      fecha: '2026-11-17',
      desde: '09:00',
    });
    pagoDe(m, trabajo, { metodo: 'mercado_pago_directo', estado: 'fallido', reportadoEn: null });
    m.contenido = 'escenario';
  },

  reclamo: (m) => {
    iniciarSesion(m);
    const { pedido, trabajo } = crearTrabajo(m, {
      rubro: 'plomeria',
      esp: 3,
      centavos: 4_200_000,
      estado: 'finalizado',
      haceMs: 2 * 24 * HORA,
      fecha: '2026-11-15',
      desde: '10:00',
    });
    const ahora = ahoraIso(m);
    m.reclamos.push({
      id: nuevoId(m),
      pedidoId: pedido.id,
      trabajoId: trabajo.id,
      categoria: 'trabajo_incompleto',
      detalle: 'La canilla sigue goteando después del arreglo.',
      adjuntos: [],
      estado: 'esperando_usuario',
      historial: [
        { de: null, a: 'abierto', actor: 'usuario', ocurridoEn: iso(ahoraMs(m) - 5 * HORA) },
        {
          de: 'abierto',
          a: 'en_revision',
          actor: 'operaciones',
          ocurridoEn: iso(ahoraMs(m) - 4 * HORA),
        },
        { de: 'en_revision', a: 'esperando_usuario', actor: 'operaciones', ocurridoEn: ahora },
      ],
      version: 2,
      creadoEn: iso(ahoraMs(m) - 5 * HORA),
      actualizadoEn: ahora,
    });
    notificar(m, 'reclamo_actualizado', { tipo: 'reclamo', id: m.reclamos[0]?.id ?? '' });
    m.contenido = 'escenario';
  },

  'sesion-vencida': (m) => {
    poblarBase(m);
    m.feeAceptada = {
      politicaId: m.politica.id,
      version: m.politica.version,
      aceptadaEn: '2026-11-10T13:05:00.000Z',
    };
    m.flags.vencerEnLlamadas = 6;
    m.contenido = 'escenario';
  },

  'baja-solicitada': (m) => {
    poblarBase(m);
    m.feeAceptada = {
      politicaId: m.politica.id,
      version: m.politica.version,
      aceptadaEn: '2026-11-10T13:05:00.000Z',
    };
    m.baja = { id: nuevoId(m), creadaEn: ahoraMs(m) - 2 * HORA };
    m.estadoCuenta = 'baja_solicitada';
    m.contenido = 'escenario';
  },
};

export function aplicarEscenario(m: Mundo, id: string): void {
  const construir = CONSTRUCTORES[id];
  if (!construir) return;
  m.escenario = id;
  construir(m);
}
