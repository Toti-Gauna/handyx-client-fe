// Reglas de negocio del "servidor" simulado: propuestas, acuerdos, vencimientos y respuestas de la contraparte.
// Reproduce lo que hará el servidor real (Fase 4) según docs/state-machines.md: el cliente nunca decide esto.
import type { CodigoError, MotivoConflicto } from '../../contracts/v1/comunes.ts';
import { PARAMETROS, puedeTransicionar } from '../../contracts/v1/estados.ts';
import { ErrorCliente } from '../cliente.ts';
import { HORA, MIN, ahoraIso, ahoraMs, instanteBA, iso, notificar, nuevoId } from './mundo.ts';
import type {
  AcuerdoT,
  Conv,
  EspecialistaResumen,
  Mundo,
  Pedido,
  Propuesta,
  Trabajo,
} from './tipos.ts';

export function falla(
  m: Mundo,
  codigo: CodigoError,
  mensaje: string,
  extra: {
    campos?: {
      campo: string;
      motivo: 'requerido' | 'formato' | 'rango' | 'longitud' | 'no_permitido';
    }[];
    conflicto?: MotivoConflicto;
  } = {},
): ErrorCliente {
  return new ErrorCliente({ codigo, mensaje, requestId: nuevoId(m), ...extra });
}

export const comision = (m: Mundo, centavos: number) => ({
  politicaId: m.politica.id,
  bp: m.politica.usuarioBp,
  importe: {
    centavos: Math.floor((centavos * m.politica.usuarioBp) / 10000),
    moneda: 'ARS' as const,
  },
});

export const especialistaDe = (m: Mundo, id: string): EspecialistaResumen => {
  const e = m.especialistas.find((x) => x.id === id);
  if (!e) throw falla(m, 'error_interno', 'Especialista desconocido.');
  return e;
};

export function convDe(m: Mundo, pedido: Pedido, esp: EspecialistaResumen): Conv {
  const existente = m.conversaciones.find(
    (c) => c.pedidoId === pedido.id && c.especialista.id === esp.id,
  );
  if (existente) return existente;
  const nueva: Conv = {
    id: nuevoId(m),
    pedidoId: pedido.id,
    trabajoId: null,
    especialista: esp,
    ultimoMensajeEn: null,
    noLeidos: 0,
  };
  m.conversaciones.push(nueva);
  return nueva;
}

export function mensajeSistema(
  m: Mundo,
  conv: Conv,
  texto: string,
  autor: 'sistema' | 'especialista' = 'sistema',
): void {
  const creadoEn = ahoraIso(m);
  m.mensajes.push({
    id: nuevoId(m),
    conversacionId: conv.id,
    clienteId: null,
    autor,
    tipo: autor === 'sistema' ? 'evento' : 'texto',
    texto,
    media: null,
    creadoEn,
    leidoEn: null,
  });
  conv.ultimoMensajeEn = creadoEn;
  if (autor !== 'sistema') conv.noLeidos += 1;
}

export function recontar(m: Mundo, p: Pedido): void {
  p.propuestasPendientes = m.propuestas.filter(
    (x) => x.pedidoId === p.id && x.estado === 'pendiente' && x.autorRol === 'especialista',
  ).length;
}

export function estadoPedido(m: Mundo, p: Pedido, estado: Pedido['estado']): void {
  if (p.estado === estado) return;
  p.estado = estado;
  p.version += 1;
  p.actualizadoEn = ahoraIso(m);
}

export function evento(
  m: Mundo,
  t: Trabajo,
  a: Trabajo['estado'],
  actor: 'usuario' | 'especialista' | 'operaciones' | 'sistema',
): void {
  const de = t.estado === a && (m.eventos[t.id]?.length ?? 0) === 0 ? null : t.estado;
  (m.eventos[t.id] ??= []).push({ id: nuevoId(m), de, a, actor, ocurridoEn: ahoraIso(m) });
}

export function estadoTrabajo(
  m: Mundo,
  t: Trabajo,
  a: Trabajo['estado'],
  actor: 'usuario' | 'especialista' | 'operaciones' | 'sistema',
): void {
  if (!puedeTransicionar('trabajo', t.estado, a))
    throw falla(m, 'conflicto', 'Ese cambio no se puede hacer en el estado actual del trabajo.', {
      conflicto: 'transicion',
    });
  evento(m, t, a, actor);
  t.estado = a;
  t.version += 1;
  t.actualizadoEn = ahoraIso(m);
}

export function horarioDe(p: Pedido): { inicio: string; fin: string | null } | null {
  const f = p.fechaSolicitada;
  if (!f) return null;
  return {
    inicio: instanteBA(f.fecha, f.desde),
    fin: f.hasta ? instanteBA(f.fecha, f.hasta) : null,
  };
}

export function proponer(
  m: Mundo,
  pedido: Pedido,
  esp: EspecialistaResumen,
  o: {
    centavos: number;
    alcance: string;
    autorRol?: 'usuario' | 'especialista';
    tipo?: Propuesta['tipo'];
    venceEn?: number;
    horario?: Propuesta['horario'];
    reemplazaA?: string | null;
    trabajoId?: string | null;
  },
): Propuesta {
  const conv = convDe(m, pedido, esp);
  const ahora = ahoraMs(m);
  const urgente = pedido.tipo === 'urgente';
  const prop: Propuesta = {
    id: nuevoId(m),
    pedidoId: pedido.id,
    trabajoId: o.trabajoId ?? null,
    conversacionId: conv.id,
    tipo: o.tipo ?? 'cotizacion',
    autorRol: o.autorRol ?? 'especialista',
    especialista: esp,
    monto: { centavos: o.centavos, moneda: 'ARS' },
    comisionHandy: comision(m, o.centavos),
    alcance: o.alcance,
    horario: o.horario === undefined ? horarioDe(pedido) : o.horario,
    venceEn: iso(
      o.venceEn ?? ahora + (urgente ? PARAMETROS.propuestaUrgenteMinutos * MIN : 24 * HORA),
    ),
    estado: 'pendiente',
    reemplazaA: o.reemplazaA ?? null,
    respondidaEn: null,
    version: 0,
    creadaEn: iso(ahora),
  };
  m.propuestas.push(prop);
  recontar(m, pedido);
  return prop;
}

const RUBRO_BASE: Record<string, number> = {
  plomeria: 4_500_000,
  electricidad: 3_800_000,
  gas: 5_200_000,
  cerrajeria: 3_200_000,
  albanileria: 12_000_000,
  aire_acondicionado: 6_500_000,
};

const ALCANCES: Record<string, string> = {
  plomeria:
    'Revisión, reparación de la pérdida y prueba de funcionamiento. Materiales menores incluidos.',
  electricidad:
    'Diagnóstico, cambio de la pieza dañada y prueba del circuito. Mano de obra incluida.',
  gas: 'Revisión del artefacto y la conexión, ajuste y prueba de hermeticidad.',
  cerrajeria: 'Apertura o cambio de cerradura. Incluye dos llaves.',
  albanileria: 'Trabajo por etapas según lo descripto. Los materiales mayores se acuerdan aparte.',
  aire_acondicionado: 'Limpieza de filtros y unidad, control de gas y prueba de funcionamiento.',
};

/** Ofertas ficticias de la vista de prueba: los dos primeros especialistas del rubro. */
export function generarOfertas(m: Mundo, pedido: Pedido): Propuesta[] {
  const candidatos = m.especialistas.filter((e) => e.rubros.includes(pedido.rubro));
  const base = RUBRO_BASE[pedido.rubro] ?? 4_000_000;
  const nuevas = candidatos.slice(0, 2).map((esp, i) =>
    proponer(m, pedido, esp, {
      centavos:
        pedido.precioPropuestoCentavos !== null && i === 0
          ? pedido.precioPropuestoCentavos
          : base + i * 700_000,
      alcance: ALCANCES[pedido.rubro] ?? 'Trabajo según lo descripto en el pedido.',
    }),
  );
  m.ofertas[pedido.id] = { listaEn: 0, sinOfertas: false, generadas: true };
  if (nuevas.length === 0) {
    m.ofertas[pedido.id] = { listaEn: 0, sinOfertas: true, generadas: false };
    return [];
  }
  estadoPedido(m, pedido, 'con_propuestas');
  for (const p of nuevas) notificar(m, 'propuesta_recibida', { tipo: 'propuesta', id: p.id });
  // Autoaceptación (PROD-23): solo si el usuario la eligió y la oferta entra en su máximo.
  const auto = pedido.autoaceptacion;
  const elegida = auto
    ? nuevas.find((p) => p.monto.centavos <= auto.montoMaximoCentavos)
    : undefined;
  if (elegida) contratar(m, elegida, 'sistema');
  return nuevas;
}

function crearEtapas(m: Mundo, total: number): Trabajo['etapas'] {
  const a = Math.floor((total * 3) / 10);
  const b = Math.floor((total * 4) / 10);
  const montos = [a, b, total - a - b];
  const titulos = ['Preparación y demolición', 'Ejecución principal', 'Terminaciones y limpieza'];
  return montos.map((centavos, i) => ({
    id: nuevoId(m),
    orden: i + 1,
    titulo: titulos[i] ?? `Etapa ${i + 1}`,
    monto: { centavos, moneda: 'ARS' as const },
    estado: i === 0 ? ('en_curso' as const) : ('pendiente' as const),
    version: 0,
  }));
}

export function acuerdoDe(m: Mundo, prop: Propuesta): AcuerdoT {
  return {
    propuestaId: prop.id,
    monto: prop.monto,
    comisionHandy: comision(m, prop.monto.centavos),
    alcance: prop.alcance,
    horario: prop.horario,
    aceptadoEn: ahoraIso(m),
  };
}

/** Acepta una cotización: crea el trabajo en una sola operación y retira las demás ofertas. */
export function contratar(
  m: Mundo,
  prop: Propuesta,
  actor: 'usuario' | 'especialista' | 'sistema',
): Trabajo {
  const pedido = m.pedidos.find((p) => p.id === prop.pedidoId);
  if (!pedido) throw falla(m, 'no_encontrado', 'No lo encontramos.');
  const ahora = ahoraIso(m);
  prop.estado = 'aceptada';
  prop.respondidaEn = ahora;
  prop.version += 1;
  for (const otra of m.propuestas) {
    if (otra.pedidoId === pedido.id && otra.id !== prop.id && otra.estado === 'pendiente') {
      otra.estado = 'retirada';
      otra.respondidaEn = ahora;
      otra.version += 1;
    }
  }
  const trabajo: Trabajo = {
    id: nuevoId(m),
    pedidoId: pedido.id,
    conversacionId: prop.conversacionId,
    especialista: prop.especialista,
    acuerdo: acuerdoDe(m, prop),
    historialAcuerdos: [],
    estado: 'agendado',
    etapas: pedido.tipo === 'obra' ? crearEtapas(m, prop.monto.centavos) : [],
    version: 0,
    creadoEn: ahora,
    actualizadoEn: ahora,
  };
  m.trabajos.push(trabajo);
  prop.trabajoId = trabajo.id;
  const conv = m.conversaciones.find((c) => c.id === prop.conversacionId);
  if (conv) {
    conv.trabajoId = trabajo.id;
    mensajeSistema(m, conv, 'Acuerdo aceptado. El trabajo quedó agendado.');
  }
  evento(m, trabajo, 'agendado', actor === 'sistema' ? 'sistema' : actor);
  pedido.trabajoId = trabajo.id;
  estadoPedido(m, pedido, 'contratado');
  recontar(m, pedido);
  notificar(m, 'propuesta_aceptada', { tipo: 'trabajo', id: trabajo.id });
  return trabajo;
}

/** Acepta un cambio (turno, alcance o monto) o un adicional sobre un trabajo ya contratado. */
export function aplicarCambio(m: Mundo, prop: Propuesta): Trabajo {
  const trabajo = m.trabajos.find((t) => t.id === prop.trabajoId);
  if (!trabajo) throw falla(m, 'no_encontrado', 'No lo encontramos.');
  prop.estado = 'aceptada';
  prop.respondidaEn = ahoraIso(m);
  prop.version += 1;
  trabajo.historialAcuerdos.push(trabajo.acuerdo);
  const centavos =
    prop.tipo === 'adicional'
      ? trabajo.acuerdo.monto.centavos + prop.monto.centavos
      : prop.monto.centavos;
  trabajo.acuerdo = {
    propuestaId: prop.id,
    monto: { centavos, moneda: 'ARS' },
    comisionHandy: comision(m, centavos),
    alcance:
      prop.tipo === 'adicional'
        ? `${trabajo.acuerdo.alcance} Adicional: ${prop.alcance}`
        : prop.alcance,
    horario: prop.horario ?? trabajo.acuerdo.horario,
    aceptadoEn: ahoraIso(m),
  };
  trabajo.version += 1;
  trabajo.actualizadoEn = ahoraIso(m);
  notificar(m, 'propuesta_aceptada', { tipo: 'trabajo', id: trabajo.id });
  return trabajo;
}

export const finalPedido = (p: Pedido): boolean =>
  ['contratado', 'cancelado', 'vencido'].includes(p.estado);

/** Hace "avanzar" el mundo según el reloj: ofertas, vencimientos y respuestas de la contraparte. */
export function sincronizar(m: Mundo): void {
  const t = ahoraMs(m);
  for (const p of m.pedidos) {
    if (finalPedido(p)) continue;
    const of = m.ofertas[p.id];
    if (p.estado === 'buscando' && of && !of.generadas) {
      if (!of.sinOfertas && !m.flags.sinOfertas && t >= of.listaEn) generarOfertas(m, p);
      else if (t >= Date.parse(p.busqueda.ventanaHasta)) {
        estadoPedido(m, p, 'sin_respuesta');
        notificar(m, 'busqueda_sin_respuesta', { tipo: 'pedido', id: p.id });
      }
    }
  }
  for (const prop of m.propuestas) {
    if (prop.estado === 'pendiente' && Date.parse(prop.venceEn) <= t) {
      prop.estado = 'vencida';
      prop.version += 1;
      if (prop.autorRol === 'especialista')
        notificar(m, 'propuesta_vencida', { tipo: 'propuesta', id: prop.id });
    }
  }
  for (const p of m.pedidos) {
    if (finalPedido(p)) continue;
    recontar(m, p);
    if (
      p.estado === 'con_propuestas' &&
      p.propuestasPendientes === 0 &&
      !m.propuestas.some((x) => x.pedidoId === p.id && x.estado === 'pendiente')
    ) {
      if (t >= Date.parse(p.busqueda.ventanaHasta)) {
        estadoPedido(m, p, 'sin_respuesta');
        notificar(m, 'busqueda_sin_respuesta', { tipo: 'pedido', id: p.id });
      }
    }
    const h = horarioDe(p);
    if (h && Date.parse(h.inicio) < t && p.estado !== 'con_propuestas')
      estadoPedido(m, p, 'vencido');
  }
  // El especialista contesta en el chat.
  for (const [convId, en] of Object.entries(m.respuestaChat)) {
    if (t < en) continue;
    delete m.respuestaChat[convId];
    const conv = m.conversaciones.find((c) => c.id === convId);
    if (conv)
      mensajeSistema(
        m,
        conv,
        'Gracias por escribir. Lo vemos y te confirmo por acá.',
        'especialista',
      );
  }
  // La contraparte responde a las contrapropuestas del usuario.
  for (const [propId, en] of Object.entries(m.respuestaEn)) {
    if (t < en) continue;
    delete m.respuestaEn[propId];
    const contra = m.propuestas.find((x) => x.id === propId);
    if (contra && contra.estado === 'pendiente') responderContra(m, contra);
  }
}

/** Regla ficticia de la vista de prueba: acepta si la contraoferta es ≥ 85 %; si no, propone el punto medio. */
export function responderContra(
  m: Mundo,
  contra: Propuesta,
  forzar?: 'acepta' | 'rechaza' | 'contraoferta',
): void {
  if (contra.tipo !== 'cotizacion') {
    // Cambios y adicionales sobre un trabajo: la contraparte responde sí o no, sin contraoferta.
    if (forzar === 'rechaza') {
      contra.estado = 'rechazada';
      contra.respondidaEn = ahoraIso(m);
      contra.version += 1;
      notificar(m, 'propuesta_rechazada', { tipo: 'propuesta', id: contra.id });
    } else aplicarCambio(m, contra);
    return;
  }
  const original = m.propuestas.find((x) => x.id === contra.reemplazaA);
  const base = original?.monto.centavos ?? contra.monto.centavos;
  const decision = forzar ?? (contra.monto.centavos * 100 >= base * 85 ? 'acepta' : 'contraoferta');
  if (decision === 'acepta') {
    contratar(m, contra, 'especialista');
  } else if (decision === 'rechaza') {
    contra.estado = 'rechazada';
    contra.respondidaEn = ahoraIso(m);
    contra.version += 1;
    notificar(m, 'propuesta_rechazada', { tipo: 'propuesta', id: contra.id });
  } else {
    const medio = Math.round((base + contra.monto.centavos) / 2 / 100) * 100;
    contra.estado = 'reemplazada';
    contra.respondidaEn = ahoraIso(m);
    contra.version += 1;
    const pedido = m.pedidos.find((p) => p.id === contra.pedidoId);
    if (!pedido) return;
    const nueva = proponer(m, pedido, contra.especialista, {
      centavos: medio,
      alcance: contra.alcance,
      reemplazaA: contra.id,
      horario: contra.horario,
      venceEn:
        ahoraMs(m) +
        (pedido.tipo === 'urgente' ? PARAMETROS.propuestaUrgenteMinutos * MIN : 24 * HORA),
    });
    if (pedido.estado !== 'con_propuestas') estadoPedido(m, pedido, 'con_propuestas');
    notificar(m, 'propuesta_recibida', { tipo: 'propuesta', id: nueva.id });
  }
}

/** Ventana de búsqueda calculada por el servidor (20 min urgente, 12 h programado/obra). */
export function ventana(pedido: Pick<Pedido, 'tipo'>, desde: number): number {
  return (
    desde +
    (pedido.tipo === 'urgente'
      ? PARAMETROS.busquedaUrgenteMinutos * MIN
      : PARAMETROS.programadoSinPropuestasHoras * HORA)
  );
}

export function nuevoPedido(
  m: Mundo,
  datos: Omit<
    Pedido,
    | 'id'
    | 'estado'
    | 'busqueda'
    | 'propuestasPendientes'
    | 'trabajoId'
    | 'version'
    | 'creadoEn'
    | 'actualizadoEn'
  >,
  opciones: { creadoMs?: number; sinOfertas?: boolean } = {},
): Pedido {
  const creado = opciones.creadoMs ?? ahoraMs(m);
  const pedido: Pedido = {
    ...datos,
    id: nuevoId(m),
    estado: 'buscando',
    busqueda: {
      iniciadaEn: iso(creado),
      ventanaHasta: iso(ventana(datos, creado)),
      intento: 1,
      maxIntentos: PARAMETROS.maxIntentosBusqueda,
    },
    propuestasPendientes: 0,
    trabajoId: null,
    version: 0,
    creadoEn: iso(creado),
    actualizadoEn: iso(creado),
  };
  m.pedidos.push(pedido);
  m.ofertas[pedido.id] = {
    listaEn: creado + 8_000,
    sinOfertas: opciones.sinOfertas ?? m.flags.sinOfertas,
    generadas: false,
  };
  return pedido;
}
