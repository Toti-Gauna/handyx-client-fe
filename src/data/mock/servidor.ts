// Manejadores de los endpoints del contrato v1 sobre el mundo en memoria. Aplican las mismas reglas que el
// servidor real: propiedad (ajeno = 404), versiones, idempotencia (en el adaptador), transiciones y vencimientos.
import type { z } from 'zod';
import {
  AccionPedidoEntrada,
  AceptarFeeEntrada,
  AceptacionEntrada,
  BajaEntrada,
  CAMPOS_PERFIL,
  CancelacionEntrada,
  CancelacionTrabajoEntrada,
  ConfirmacionEntrada,
  ContrapropuestaEntrada,
  EdicionPedidoEntrada,
  type EndpointId,
  LoginEntrada,
  MAX_BYTES_MEDIA,
  MensajeEntrada,
  NuevaContrasenaEntrada,
  PedidoEntrada,
  PerfilEntrada,
  PreferenciasNotificacion,
  PropuestaCambioEntrada,
  PushSuscripcionEntrada,
  ReclamoEntrada,
  RegistroEntrada,
  ReportePagoEntrada,
  RespuestaPropuestaEntrada,
  RespuestaReclamoEntrada,
  TIPOS_MEDIA,
  VERSION_CONTRATO,
  puedeTransicionar,
  RUBROS,
} from '../../contracts/v1/index.ts';
import { locales } from '../media.ts';
import { TOKEN_RECUPERACION_PRUEBA as TOKEN_PRUEBA } from '../prueba.ts';
import { poblarBase } from './escenarios-mundo.ts';
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
  aplicarCambio,
  contratar,
  convDe,
  estadoPedido,
  estadoTrabajo,
  falla,
  finalPedido,
  mensajeSistema,
  nuevoPedido,
  recontar,
  responderContra,
  proponer,
  ventana,
} from './reglas.ts';
import type {
  Conv,
  Media,
  Mundo,
  Pedido,
  Propuesta,
  RegistroPago,
  ReclamoT,
  Trabajo,
} from './tipos.ts';

export interface Peticion {
  p: Record<string, string>;
  q: Record<string, unknown>;
  c: unknown;
}
type R = Peticion;
type Manejador = (m: Mundo, r: R) => unknown;
const cuerpo = <T extends z.ZodType>(r: R, _t: T): z.output<T> => r.c as z.output<T>;

// ── Utilidades ─────────────────────────────────────────────────────────────────────────────────────────
const noEncontrado = (m: Mundo) => falla(m, 'no_encontrado', 'No lo encontramos.');

function paginar<T>(
  items: readonly T[],
  q: Record<string, unknown>,
): { items: T[]; siguiente: string | null } {
  const limite = Number(q.limite ?? 20);
  const desde = Number(q.cursor ?? 0) || 0;
  const pagina = items.slice(desde, desde + limite);
  return {
    items: pagina,
    siguiente: desde + limite < items.length ? String(desde + limite) : null,
  };
}

const porFecha = <T extends { creadoEn?: string; creadaEn?: string }>(a: T, b: T) =>
  (b.creadoEn ?? b.creadaEn ?? '').localeCompare(a.creadoEn ?? a.creadaEn ?? '');

function camposFaltantes(m: Mundo): (typeof CAMPOS_PERFIL)[number][] {
  return CAMPOS_PERFIL.filter((campo) => m.perfil[campo] === undefined);
}

function documentosPendientes(m: Mundo) {
  return (['terminos', 'privacidad'] as const)
    .filter(
      (d) => !m.aceptaciones.some((a) => a.documento === d && a.version === VERSIONES_TEXTOS[d]),
    )
    .map((documento) => ({ documento, version: VERSIONES_TEXTOS[documento] }));
}

function recalcularEstadoCuenta(m: Mundo): void {
  if (m.estadoCuenta === 'baja_solicitada' || m.estadoCuenta === 'suspendida') return;
  m.estadoCuenta =
    camposFaltantes(m).length === 0 && documentosPendientes(m).length === 0
      ? 'activa'
      : 'perfil_incompleto';
}

export function sesionDe(m: Mundo) {
  recalcularEstadoCuenta(m);
  return {
    cuenta: { id: m.cuentaId ?? '', estado: m.estadoCuenta, roles: ['usuario' as const] },
    perfil: m.perfil,
    perfilVersion: m.perfilVersion,
    pendientes: { camposPerfil: camposFaltantes(m), documentos: documentosPendientes(m) },
    aceptaciones: m.aceptaciones,
    expiraEn: iso(ahoraMs(m) + 8 * HORA),
    csrfToken: m.csrf,
  };
}

/** Falla con 401 si no hay sesión; la sesión puede "vencer" según la bandera del escenario. */
export function exigirSesion(m: Mundo): void {
  if (!m.cuentaId) {
    if (m.sesionVencida) throw falla(m, 'sesion_vencida', 'Tu sesión venció. Ingresá de nuevo.');
    throw falla(m, 'no_autenticado', 'Tenés que ingresar para seguir.');
  }
  m.llamadasConSesion += 1;
  if (m.flags.vencerEnLlamadas !== null && m.llamadasConSesion > m.flags.vencerEnLlamadas) {
    m.cuentaId = null;
    m.sesionVencida = true;
    m.flags.vencerEnLlamadas = null;
    throw falla(m, 'sesion_vencida', 'Tu sesión venció. Ingresá de nuevo.');
  }
}

function exigirActiva(m: Mundo): void {
  if (m.estadoCuenta === 'baja_solicitada' || m.estadoCuenta === 'suspendida')
    throw falla(
      m,
      'sin_permiso',
      'Tu cuenta tiene una baja solicitada: no se pueden crear pedidos.',
    );
  recalcularEstadoCuenta(m);
  if (m.estadoCuenta !== 'activa')
    throw falla(m, 'sin_permiso', 'Completá tu perfil y aceptá los textos para pedir un servicio.');
}

const pedidoPropio = (m: Mundo, id: string): Pedido =>
  m.pedidos.find((p) => p.id === id) ??
  (() => {
    throw noEncontrado(m);
  })();
const trabajoPropio = (m: Mundo, id: string): Trabajo =>
  m.trabajos.find((t) => t.id === id) ??
  (() => {
    throw noEncontrado(m);
  })();
const convPropia = (m: Mundo, id: string): Conv =>
  m.conversaciones.find((c) => c.id === id) ??
  (() => {
    throw noEncontrado(m);
  })();
const propuestaPropia = (m: Mundo, id: string): Propuesta =>
  m.propuestas.find((p) => p.id === id) ??
  (() => {
    throw noEncontrado(m);
  })();

function versionOk(m: Mundo, actual: number, vista: number): void {
  if (actual !== vista)
    throw falla(
      m,
      'conflicto',
      'Esto cambió mientras lo mirabas. Actualizá para ver el estado actual.',
      { conflicto: 'version' },
    );
}

function refsDe(m: Mundo, ids: readonly string[], campo: string): Media[] {
  return ids.map((id) => {
    const g = m.media.get(id);
    if (!g)
      throw falla(m, 'validacion', 'Revisá los datos marcados.', {
        campos: [{ campo, motivo: 'formato' }],
      });
    return { ...g.ref, expiraEn: iso(ahoraMs(m) + HORA) };
  });
}

const ACTIVOS = ['buscando', 'con_propuestas', 'sin_respuesta', 'busqueda_manual'];

// ── Manejadores ────────────────────────────────────────────────────────────────────────────────────────
export const MANEJADORES: Record<EndpointId, Manejador> = {
  version: () => ({ contrato: VERSION_CONTRATO }),
  csrf: (m) => ({ csrfToken: m.csrf }),

  registro: (m, r) => {
    const c = cuerpo(r, RegistroEntrada);
    if (!m.invitaciones.has(c.codigoInvitacion))
      throw falla(m, 'validacion', 'El código de invitación no es válido o ya se usó.', {
        campos: [{ campo: 'codigoInvitacion', motivo: 'formato' }],
      });
    const docs = new Set(c.aceptaciones.map((a) => a.documento));
    if (!docs.has('terminos') || !docs.has('privacidad'))
      throw falla(m, 'validacion', 'Tenés que aceptar los términos y la política de privacidad.', {
        campos: [{ campo: 'aceptaciones', motivo: 'requerido' }],
      });
    if (m.cuentas.some((x) => x.email === c.email))
      throw falla(
        m,
        'conflicto',
        'No pudimos crear la cuenta con esos datos. Si ya tenés una, ingresá.',
        { conflicto: 'ya_resuelta' },
      );
    m.invitaciones.delete(c.codigoInvitacion);
    const id = nuevoId(m);
    m.cuentas.push({ id, email: c.email, contrasena: c.contrasena });
    m.cuentaId = id;
    m.contenido = 'vacio';
    m.estadoCuenta = 'perfil_incompleto';
    m.perfil = {};
    m.perfilVersion = 0;
    m.feeAceptada = null;
    m.pedidos = [];
    m.propuestas = [];
    m.trabajos = [];
    m.conversaciones = [];
    m.mensajes = [];
    m.pagos = [];
    m.reclamos = [];
    m.notificaciones = [];
    m.baja = null;
    m.aceptaciones = c.aceptaciones.map((a) => ({ ...a, aceptadaEn: ahoraIso(m) }));
    return sesionDe(m);
  },

  login: (m, r) => {
    const c = cuerpo(r, LoginEntrada);
    if (m.intentosFallidos >= 5)
      throw falla(m, 'limite', 'Hiciste demasiados intentos. Esperá un momento.');
    const cuenta = m.cuentas.find((x) => x.email === c.email);
    if (!cuenta || cuenta.contrasena !== c.contrasena) {
      m.intentosFallidos += 1;
      throw falla(m, 'no_autenticado', 'El email o la contraseña no son correctos.');
    }
    m.intentosFallidos = 0;
    m.cuentaId = cuenta.id;
    m.sesionVencida = false;
    m.llamadasConSesion = 0;
    // La cuenta de prueba entra a un mundo con historial; una cuenta recién registrada, a uno vacío.
    if (cuenta.id === m.cuentas[0]?.id && m.contenido === 'vacio') poblarBase(m);
    return sesionDe(m);
  },

  logout: (m) => {
    m.cuentaId = null;
    m.sesionVencida = false;
    return undefined;
  },
  recuperacion: () => undefined,
  recuperacionConfirmar: (m, r) => {
    const c = cuerpo(r, NuevaContrasenaEntrada);
    if (c.token !== TOKEN_PRUEBA)
      throw falla(m, 'conflicto', 'El enlace venció o ya se usó. Pedí uno nuevo.', {
        conflicto: 'ya_resuelta',
      });
    const cuenta = m.cuentas[0];
    if (cuenta) m.cuentas[0] = { ...cuenta, contrasena: c.contrasena };
    m.cuentaId = null;
    return undefined;
  },

  sesion: (m) => sesionDe(m),
  perfil: (m, r) => {
    const c = cuerpo(r, PerfilEntrada);
    versionOk(m, m.perfilVersion, c.version);
    if (c.fechaNacimiento !== undefined) {
      const limite = new Date(ahoraMs(m));
      limite.setUTCFullYear(limite.getUTCFullYear() - 18);
      if (Date.parse(c.fechaNacimiento) > limite.getTime())
        throw falla(m, 'validacion', 'Tenés que ser mayor de 18 años.', {
          campos: [{ campo: 'fechaNacimiento', motivo: 'rango' }],
        });
    }
    const { version: _v, ...cambios } = c;
    m.perfil = { ...m.perfil, ...cambios };
    m.perfilVersion += 1;
    return sesionDe(m);
  },
  aceptacion: (m, r) => {
    const c = cuerpo(r, AceptacionEntrada);
    if (
      c.documento === 'politica_fee' ||
      c.version !== VERSIONES_TEXTOS[c.documento as 'terminos' | 'privacidad']
    )
      throw falla(m, 'conflicto', 'Esa versión del texto ya no es la vigente.', {
        conflicto: 'version',
      });
    if (!m.aceptaciones.some((a) => a.documento === c.documento && a.version === c.version))
      m.aceptaciones.push({ ...c, aceptadaEn: ahoraIso(m) });
    return sesionDe(m);
  },
  fee: (m) => estadoFee(m),
  feeAceptar: (m, r) => {
    const c = cuerpo(r, AceptarFeeEntrada);
    if (c.politicaId !== m.politica.id || c.version !== m.politica.version)
      throw falla(m, 'conflicto', 'La política de tarifa cambió. Actualizá para verla.', {
        conflicto: 'version',
      });
    m.feeAceptada = m.feeAceptada ?? {
      politicaId: c.politicaId,
      version: c.version,
      aceptadaEn: ahoraIso(m),
    };
    return estadoFee(m);
  },
  preferencias: (m) => ({ push: m.push.preferencia }),
  preferenciasEditar: (m, r) => {
    m.push.preferencia = cuerpo(r, PreferenciasNotificacion).push;
    return { push: m.push.preferencia };
  },
  pushAlta: (m, r) => {
    cuerpo(r, PushSuscripcionEntrada);
    m.push.suscripto = true;
    m.push.preferencia = true;
    return undefined;
  },
  pushBaja: (m) => {
    m.push.suscripto = false;
    m.push.preferencia = false;
    return undefined;
  },
  bajaSolicitar: (m, r) => {
    const c = cuerpo(r, BajaEntrada);
    const cuenta = m.cuentas.find((x) => x.id === m.cuentaId);
    if (!cuenta || cuenta.contrasena !== c.contrasena)
      throw falla(m, 'no_autenticado', 'La contraseña no es correcta.');
    if (!m.baja) {
      m.baja = { id: nuevoId(m), creadaEn: ahoraMs(m) };
      m.estadoCuenta = 'baja_solicitada';
      notificar(m, 'baja_actualizada', { tipo: 'cuenta', id: m.cuentaId ?? m.baja.id });
    }
    return solicitudBaja(m);
  },
  baja: (m) => {
    if (!m.baja) throw noEncontrado(m);
    return solicitudBaja(m);
  },

  rubros: () => ({ items: RUBROS.map((id) => ({ id, disponible: true })) }),
  cobertura: (_m, r) => {
    const ciudad = String(r.q.ciudad ?? '').trim();
    return { ciudad, cubierta: _m.cobertura.includes(ciudad.toLocaleLowerCase('es-AR')) };
  },
  media: (m, r) => {
    if (m.flags.fallarProximaFoto) {
      m.flags.fallarProximaFoto = false;
      throw falla(m, 'no_disponible', 'No pudimos subir la foto. Probá de nuevo.');
    }
    const archivo = (r.c as FormData).get('archivo');
    if (!(archivo instanceof Blob))
      throw falla(m, 'validacion', 'Elegí una foto.', {
        campos: [{ campo: 'archivo', motivo: 'requerido' }],
      });
    if (!(TIPOS_MEDIA as readonly string[]).includes(archivo.type))
      throw falla(m, 'tipo_no_permitido', 'Solo se aceptan fotos JPG, PNG o WebP.');
    if (archivo.size > MAX_BYTES_MEDIA)
      throw falla(m, 'payload_grande', 'La foto pesa más de 5 MB.');
    const id = nuevoId(m);
    const ref: Media = {
      id,
      tipo: archivo.type as Media['tipo'],
      bytes: Math.max(1, archivo.size),
      url: `https://media.example.test/${id}`,
      expiraEn: iso(ahoraMs(m) + HORA),
    };
    m.media.set(id, { ref, tipo: archivo.type, bytes: archivo.size });
    if (typeof URL.createObjectURL === 'function')
      locales.set(ref.url, URL.createObjectURL(archivo));
    return ref;
  },

  // Pedidos
  pedidoCrear: (m, r) => {
    const c = cuerpo(r, PedidoEntrada);
    exigirActiva(m);
    if (!m.cobertura.includes(c.ubicacion.ciudad.trim().toLocaleLowerCase('es-AR')))
      throw falla(
        m,
        'sin_permiso',
        `Todavía no tenemos cobertura en ${c.ubicacion.ciudad}. Empezamos en Mar del Plata.`,
      );
    const f = c.fechaSolicitada;
    if (f) {
      if (Date.parse(`${f.fecha}T${f.desde}:00-03:00`) <= ahoraMs(m))
        throw falla(m, 'validacion', 'Elegí una fecha y hora futuras.', {
          campos: [{ campo: 'fechaSolicitada.fecha', motivo: 'rango' }],
        });
      if (f.hasta !== null && f.hasta <= f.desde)
        throw falla(m, 'validacion', 'La hora final tiene que ser posterior a la inicial.', {
          campos: [{ campo: 'fechaSolicitada.hasta', motivo: 'rango' }],
        });
    }
    const { fotos, ...resto } = c;
    return nuevoPedido(m, { ...resto, fotos: refsDe(m, fotos, 'fotos') });
  },
  pedidos: (m, r) => {
    const vista = r.q.vista;
    const lista = m.pedidos.filter((p) =>
      vista === 'historial'
        ? !ACTIVOS.includes(p.estado)
        : vista === 'activos'
          ? ACTIVOS.includes(p.estado)
          : true,
    );
    return paginar([...lista].sort(porFecha), r.q);
  },
  pedido: (m, r) => pedidoPropio(m, r.p.id ?? ''),
  pedidoEditar: (m, r) => {
    const p = pedidoPropio(m, r.p.id ?? '');
    const c = cuerpo(r, EdicionPedidoEntrada);
    versionOk(m, p.version, c.version);
    if (p.estado !== 'buscando')
      throw falla(m, 'conflicto', 'Ya no se puede editar: la búsqueda avanzó.', {
        conflicto: 'transicion',
      });
    if (c.descripcion !== undefined) p.descripcion = c.descripcion;
    if (c.fotos !== undefined) p.fotos = refsDe(m, c.fotos, 'fotos');
    if (c.fechaSolicitada !== undefined) p.fechaSolicitada = c.fechaSolicitada;
    p.version += 1;
    p.actualizadoEn = ahoraIso(m);
    return p;
  },
  pedidoRelanzar: (m, r) => {
    const p = pedidoPropio(m, r.p.id ?? '');
    versionOk(m, p.version, cuerpo(r, AccionPedidoEntrada).version);
    if (!puedeTransicionar('pedido', p.estado, 'buscando'))
      throw falla(
        m,
        'conflicto',
        'Solo se puede relanzar cuando la búsqueda terminó sin respuesta.',
        { conflicto: 'transicion' },
      );
    if (p.busqueda.intento >= p.busqueda.maxIntentos)
      throw falla(
        m,
        'conflicto',
        'Llegaste al límite de intentos. Podés pedir una búsqueda manual.',
        { conflicto: 'transicion' },
      );
    const ahora = ahoraMs(m);
    p.busqueda = {
      ...p.busqueda,
      iniciadaEn: iso(ahora),
      ventanaHasta: iso(ventana(p, ahora)),
      intento: p.busqueda.intento + 1,
    };
    estadoPedido(m, p, 'buscando');
    m.ofertas[p.id] = { listaEn: ahora + 8_000, sinOfertas: m.flags.sinOfertas, generadas: false };
    return p;
  },
  pedidoBusquedaManual: (m, r) => {
    const p = pedidoPropio(m, r.p.id ?? '');
    versionOk(m, p.version, cuerpo(r, AccionPedidoEntrada).version);
    if (!puedeTransicionar('pedido', p.estado, 'busqueda_manual'))
      throw falla(m, 'conflicto', 'La búsqueda manual se pide cuando no hubo respuestas.', {
        conflicto: 'transicion',
      });
    estadoPedido(m, p, 'busqueda_manual');
    notificar(m, 'busqueda_manual_iniciada', { tipo: 'pedido', id: p.id });
    return p;
  },
  pedidoCancelar: (m, r) => {
    const p = pedidoPropio(m, r.p.id ?? '');
    versionOk(m, p.version, cuerpo(r, CancelacionEntrada).version);
    if (!puedeTransicionar('pedido', p.estado, 'cancelado'))
      throw falla(m, 'conflicto', 'Este pedido ya no se puede cancelar.', {
        conflicto: 'transicion',
      });
    for (const x of m.propuestas)
      if (x.pedidoId === p.id && x.estado === 'pendiente') {
        x.estado = 'retirada';
        x.version += 1;
      }
    estadoPedido(m, p, 'cancelado');
    recontar(m, p);
    return p;
  },

  // Propuestas
  propuestas: (m, r) => {
    const p = pedidoPropio(m, r.p.id ?? '');
    return paginar(
      m.propuestas
        .filter((x) => x.pedidoId === p.id && x.tipo === 'cotizacion')
        .sort((a, b) => a.creadaEn.localeCompare(b.creadaEn)),
      r.q,
    );
  },
  propuesta: (m, r) => propuestaPropia(m, r.p.id ?? ''),
  propuestaAceptar: (m, r) => {
    const prop = propuestaPropia(m, r.p.id ?? '');
    const c = cuerpo(r, RespuestaPropuestaEntrada);
    if (m.flags.carreraAceptacion && prop.estado === 'pendiente') {
      // "Otro dispositivo" aceptó antes: el pedido ya quedó contratado.
      m.flags.carreraAceptacion = false;
      if (prop.tipo === 'cotizacion') contratar(m, prop, 'usuario');
    }
    if (prop.autorRol === 'usuario')
      throw falla(m, 'sin_permiso', 'Esperá la respuesta de la otra parte: la propuesta es tuya.');
    if (prop.estado === 'vencida')
      throw falla(m, 'conflicto', 'La propuesta venció. Pedí otra o cotizá de nuevo.', {
        conflicto: 'vencida',
      });
    if (prop.estado !== 'pendiente')
      throw falla(m, 'conflicto', 'Esta propuesta ya se resolvió.', { conflicto: 'ya_resuelta' });
    versionOk(m, prop.version, c.version);
    if (prop.tipo === 'cotizacion') {
      const pedido = pedidoPropio(m, prop.pedidoId);
      if (finalPedido(pedido))
        throw falla(m, 'conflicto', 'Este pedido ya tiene un acuerdo.', {
          conflicto: 'ya_resuelta',
        });
      const trabajo = contratar(m, prop, 'usuario');
      return { propuesta: prop, trabajo };
    }
    return { propuesta: prop, trabajo: aplicarCambio(m, prop) };
  },
  propuestaRechazar: (m, r) => {
    const prop = propuestaPropia(m, r.p.id ?? '');
    const c = cuerpo(r, RespuestaPropuestaEntrada);
    if (prop.autorRol === 'usuario')
      throw falla(m, 'sin_permiso', 'Esa propuesta es tuya: podés retirarla cancelando el pedido.');
    if (prop.estado === 'vencida')
      throw falla(m, 'conflicto', 'La propuesta venció.', { conflicto: 'vencida' });
    if (prop.estado !== 'pendiente')
      throw falla(m, 'conflicto', 'Esta propuesta ya se resolvió.', { conflicto: 'ya_resuelta' });
    versionOk(m, prop.version, c.version);
    prop.estado = 'rechazada';
    prop.respondidaEn = ahoraIso(m);
    prop.version += 1;
    const pedido = m.pedidos.find((p) => p.id === prop.pedidoId);
    if (pedido) recontar(m, pedido);
    return prop;
  },
  contrapropuesta: (m, r) => {
    const original = propuestaPropia(m, r.p.id ?? '');
    const c = cuerpo(r, ContrapropuestaEntrada);
    if (c.reemplazaA !== original.id)
      throw falla(m, 'validacion', 'Revisá los datos marcados.', {
        campos: [{ campo: 'reemplazaA', motivo: 'formato' }],
      });
    if (original.estado === 'vencida')
      throw falla(m, 'conflicto', 'La propuesta venció.', { conflicto: 'vencida' });
    if (original.estado !== 'pendiente' || original.autorRol !== 'especialista')
      throw falla(m, 'conflicto', 'Esta propuesta ya se resolvió.', { conflicto: 'ya_resuelta' });
    versionOk(m, original.version, c.versionAnterior);
    const pedido = pedidoPropio(m, original.pedidoId);
    original.estado = 'reemplazada';
    original.respondidaEn = ahoraIso(m);
    original.version += 1;
    const nueva = proponer(m, pedido, original.especialista, {
      centavos: c.montoCentavos,
      alcance: c.alcance,
      autorRol: 'usuario',
      horario: c.horario,
      reemplazaA: original.id,
      venceEn: ahoraMs(m) + 24 * HORA,
    });
    m.respuestaEn[nueva.id] = ahoraMs(m) + 45_000;
    return nueva;
  },

  // Trabajos
  trabajos: (m, r) => {
    const vista = r.q.vista;
    const grupo = (t: Trabajo) =>
      t.estado === 'agendado'
        ? 'programados'
        : ['finalizado', 'cancelado'].includes(t.estado)
          ? 'historial'
          : 'activos';
    const lista = m.trabajos.filter((t) => !vista || grupo(t) === vista);
    return paginar([...lista].sort(porFecha), r.q);
  },
  trabajo: (m, r) => trabajoPropio(m, r.p.id ?? ''),
  trabajoEventos: (m, r) => {
    const t = trabajoPropio(m, r.p.id ?? '');
    return paginar(
      [...(m.eventos[t.id] ?? [])].sort((a, b) => b.ocurridoEn.localeCompare(a.ocurridoEn)),
      r.q,
    );
  },
  trabajoConfirmarFin: (m, r) => {
    const t = trabajoPropio(m, r.p.id ?? '');
    versionOk(m, t.version, cuerpo(r, ConfirmacionEntrada).version);
    if (t.etapas.some((e) => e.estado !== 'confirmada'))
      throw falla(m, 'conflicto', 'Faltan etapas por confirmar.', { conflicto: 'transicion' });
    estadoTrabajo(m, t, 'finalizado', 'usuario');
    notificar(m, 'trabajo_terminado', { tipo: 'trabajo', id: t.id });
    return t;
  },
  etapaConfirmar: (m, r) => {
    const t = trabajoPropio(m, r.p.id ?? '');
    const e = t.etapas.find((x) => x.id === r.p.etapaId);
    if (!e) throw noEncontrado(m);
    versionOk(m, e.version, cuerpo(r, ConfirmacionEntrada).version);
    if (e.estado !== 'terminada_por_especialista')
      throw falla(m, 'conflicto', 'El especialista todavía no marcó esta etapa como terminada.', {
        conflicto: 'transicion',
      });
    e.estado = 'confirmada';
    e.version += 1;
    const siguiente = t.etapas.find((x) => x.orden === e.orden + 1);
    if (siguiente?.estado === 'pendiente') {
      siguiente.estado = 'en_curso';
      siguiente.version += 1;
    }
    t.version += 1;
    t.actualizadoEn = ahoraIso(m);
    return t;
  },
  trabajoCancelar: (m, r) => {
    const t = trabajoPropio(m, r.p.id ?? '');
    versionOk(m, t.version, cuerpo(r, CancelacionTrabajoEntrada).version);
    estadoTrabajo(m, t, 'cancelado', 'usuario');
    const conv = m.conversaciones.find((c) => c.id === t.conversacionId);
    if (conv) mensajeSistema(m, conv, 'El trabajo fue cancelado.');
    return t;
  },
  trabajoProponerCambio: (m, r) => {
    const t = trabajoPropio(m, r.p.id ?? '');
    const c = cuerpo(r, PropuestaCambioEntrada);
    if (!['agendado', 'en_camino', 'en_sitio', 'en_curso'].includes(t.estado))
      throw falla(m, 'conflicto', 'Ya no se puede cambiar el acuerdo de este trabajo.', {
        conflicto: 'transicion',
      });
    if (
      m.propuestas.some(
        (p) => p.trabajoId === t.id && p.estado === 'pendiente' && p.tipo === 'cambio_acuerdo',
      )
    )
      throw falla(m, 'conflicto', 'Ya hay un cambio pendiente de respuesta.', {
        conflicto: 'ya_resuelta',
      });
    const pedido = pedidoPropio(m, t.pedidoId);
    const nueva = proponer(m, pedido, t.especialista, {
      centavos: c.montoCentavos,
      alcance: c.alcance,
      autorRol: 'usuario',
      tipo: 'cambio_acuerdo',
      horario: c.horario,
      trabajoId: t.id,
      venceEn: ahoraMs(m) + 24 * HORA,
    });
    m.respuestaEn[nueva.id] = ahoraMs(m) + 45_000;
    return nueva;
  },

  // Pagos directos
  pagos: (m, r) => {
    const t = trabajoPropio(m, r.p.id ?? '');
    return { items: m.pagos.filter((x) => x.trabajoId === t.id) };
  },
  pagoReportar: (m, r) => {
    const t = trabajoPropio(m, r.p.id ?? '');
    const c = cuerpo(r, ReportePagoEntrada);
    if (!['en_curso', 'terminado_por_especialista', 'finalizado'].includes(t.estado))
      throw falla(
        m,
        'conflicto',
        'El pago se registra cuando el trabajo está en curso o terminado.',
        { conflicto: 'transicion' },
      );
    if (c.metodo === 'mercado_pago_directo' && !m.flags.checkoutActivo)
      throw falla(
        m,
        'funcion_inactiva',
        'Pagar con Mercado Pago todavía no está habilitado. Podés pagar en efectivo.',
      );
    const etapa = c.etapaId ? t.etapas.find((e) => e.id === c.etapaId) : undefined;
    if (c.etapaId && !etapa)
      throw falla(m, 'validacion', 'Revisá los datos marcados.', {
        campos: [{ campo: 'etapaId', motivo: 'formato' }],
      });
    const esperado = etapa ? etapa.monto.centavos : t.acuerdo.monto.centavos;
    if (c.montoCentavos !== esperado)
      throw falla(m, 'validacion', 'El importe no coincide con lo acordado.', {
        campos: [{ campo: 'montoCentavos', motivo: 'rango' }],
      });
    if (
      m.pagos.some(
        (p) =>
          p.trabajoId === t.id &&
          p.etapaId === (c.etapaId ?? null) &&
          ['reportado', 'verificado', 'pendiente'].includes(p.estado),
      )
    )
      throw falla(m, 'conflicto', 'Ya hay un pago registrado para esto.', {
        conflicto: 'ya_resuelta',
      });
    const efectivo = c.metodo === 'efectivo';
    const pago: RegistroPago = {
      id: nuevoId(m),
      trabajoId: t.id,
      etapaId: c.etapaId,
      metodo: c.metodo,
      monto: { centavos: c.montoCentavos, moneda: 'ARS' },
      estado: efectivo ? 'reportado' : 'pendiente',
      fuente: efectivo ? 'reporte_usuario' : null,
      reportadoEn: efectivo ? ahoraIso(m) : null,
      verificadoEn: null,
      version: 0,
    };
    m.pagos.push(pago);
    return pago;
  },
  pago: (m, r) =>
    m.pagos.find((p) => p.id === r.p.id) ??
    (() => {
      throw noEncontrado(m);
    })(),
  pagoCheckout: (m, r) => {
    const pago = m.pagos.find((p) => p.id === r.p.id);
    if (!pago) throw noEncontrado(m);
    if (!m.flags.checkoutActivo || pago.metodo !== 'mercado_pago_directo')
      throw falla(m, 'funcion_inactiva', 'Pagar con Mercado Pago todavía no está habilitado.');
    if (!['pendiente', 'fallido'].includes(pago.estado))
      throw falla(m, 'conflicto', 'Este pago ya se resolvió.', { conflicto: 'ya_resuelta' });
    if (pago.estado === 'fallido') {
      pago.estado = 'pendiente';
      pago.version += 1;
    }
    return { url: `https://checkout.example.test/mp/${pago.id}` };
  },

  // Chat
  conversaciones: (m, r) =>
    paginar(
      [...m.conversaciones].sort((a, b) =>
        (b.ultimoMensajeEn ?? '').localeCompare(a.ultimoMensajeEn ?? ''),
      ),
      r.q,
    ),
  mensajes: (m, r) => {
    const c = convPropia(m, r.p.id ?? '');
    return paginar(m.mensajes.filter((x) => x.conversacionId === c.id).sort(porFecha), r.q);
  },
  mensajeEnviar: (m, r) => {
    const conv = convPropia(m, r.p.id ?? '');
    const c = cuerpo(r, MensajeEntrada);
    const previo = m.mensajes.find((x) => x.clienteId === c.clienteId);
    if (previo) return previo;
    if (m.flags.fallarProximoMensaje) {
      m.flags.fallarProximoMensaje = false;
      throw falla(m, 'no_disponible', 'No pudimos enviar el mensaje. Probá de nuevo.');
    }
    const cerrada = m.trabajos.find(
      (t) => t.id === conv.trabajoId && ['finalizado', 'cancelado'].includes(t.estado),
    );
    if (cerrada)
      throw falla(m, 'conflicto', 'El trabajo terminó: el chat quedó solo de lectura.', {
        conflicto: 'transicion',
      });
    const media = c.tipo === 'foto' ? (refsDe(m, [c.mediaId], 'mediaId')[0] ?? null) : null;
    const msg = {
      id: nuevoId(m),
      conversacionId: conv.id,
      clienteId: c.clienteId,
      autor: 'usuario' as const,
      tipo: c.tipo,
      texto: c.tipo === 'texto' ? c.texto : null,
      media,
      creadoEn: ahoraIso(m),
      leidoEn: null,
    };
    m.mensajes.push(msg);
    conv.ultimoMensajeEn = msg.creadoEn;
    m.respuestaChat[conv.id] = ahoraMs(m) + 6_000;
    return msg;
  },
  conversacionLeida: (m, r) => {
    const c = convPropia(m, r.p.id ?? '');
    c.noLeidos = 0;
    for (const x of m.mensajes)
      if (x.conversacionId === c.id && x.autor !== 'usuario' && !x.leidoEn) x.leidoEn = ahoraIso(m);
    return undefined;
  },

  // Reclamos
  reclamoCrear: (m, r) => {
    const c = cuerpo(r, ReclamoEntrada);
    pedidoPropio(m, c.pedidoId);
    if (c.trabajoId) trabajoPropio(m, c.trabajoId);
    const ahora = ahoraIso(m);
    const rec: ReclamoT = {
      id: nuevoId(m),
      pedidoId: c.pedidoId,
      trabajoId: c.trabajoId,
      categoria: c.categoria,
      detalle: c.detalle,
      adjuntos: refsDe(m, c.adjuntos, 'adjuntos'),
      estado: 'abierto',
      historial: [{ de: null, a: 'abierto', actor: 'usuario', ocurridoEn: ahora }],
      version: 0,
      creadoEn: ahora,
      actualizadoEn: ahora,
    };
    m.reclamos.push(rec);
    return rec;
  },
  reclamos: (m, r) => paginar([...m.reclamos].sort(porFecha), r.q),
  reclamo: (m, r) =>
    m.reclamos.find((x) => x.id === r.p.id) ??
    (() => {
      throw noEncontrado(m);
    })(),
  reclamoResponder: (m, r) => {
    const rec = m.reclamos.find((x) => x.id === r.p.id);
    if (!rec) throw noEncontrado(m);
    const c = cuerpo(r, RespuestaReclamoEntrada);
    versionOk(m, rec.version, c.version);
    if (rec.estado !== 'esperando_usuario')
      throw falla(m, 'conflicto', 'Por ahora no hace falta que agregues información.', {
        conflicto: 'transicion',
      });
    rec.detalle = `${rec.detalle}\n\n${c.detalle}`.slice(0, 2000);
    rec.adjuntos = [...rec.adjuntos, ...refsDe(m, c.adjuntos, 'adjuntos')].slice(0, 5);
    rec.historial.push({
      de: 'esperando_usuario',
      a: 'en_revision',
      actor: 'usuario',
      ocurridoEn: ahoraIso(m),
    });
    rec.estado = 'en_revision';
    rec.version += 1;
    rec.actualizadoEn = ahoraIso(m);
    return rec;
  },

  // Avisos
  notificaciones: (m, r) => paginar([...m.notificaciones].sort(porFecha), r.q),
  notificacionLeida: (m, r) => {
    const n = m.notificaciones.find((x) => x.id === r.p.id);
    if (!n) throw noEncontrado(m);
    n.leidaEn ??= ahoraIso(m);
    return undefined;
  },
};

function estadoFee(m: Mundo) {
  return { vigente: m.politica, siguiente: null, aceptada: m.feeAceptada, ahora: ahoraIso(m) };
}

/** La baja avanza con el reloj: recibida → en proceso (1 h) → completada con retención (24 h). Retenciones: ejemplo. */
function solicitudBaja(m: Mundo) {
  const b = m.baja;
  if (!b) throw noEncontrado(m);
  const t = ahoraMs(m) - b.creadaEn;
  const estado = t < HORA ? 'recibida' : t < 24 * HORA ? 'en_proceso' : 'completada_con_retencion';
  return {
    id: b.id,
    estado,
    creadaEn: iso(b.creadaEn),
    actualizadaEn: iso(
      estado === 'recibida'
        ? b.creadaEn
        : Math.min(ahoraMs(m), b.creadaEn + (estado === 'en_proceso' ? HORA : 24 * HORA)),
    ),
    retenciones:
      estado === 'completada_con_retencion' ? [{ categoria: 'pagos_y_reclamos', hasta: null }] : [],
  };
}

export { responderContra, convDe, MIN };
