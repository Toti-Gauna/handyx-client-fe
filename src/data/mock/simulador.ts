// Acciones de la "contraparte" y del entorno para recorrer la vista de prueba (panel de prueba y tests).
// Representan al especialista, a Operations, al proveedor de pagos y al reloj: nada de esto existe en producción.
import { prueba } from '../prueba.ts';
import type { GeoSimulada } from '../prueba.ts';
import { HORA, MIN, ahoraIso, ahoraMs, notificar, nuevoId } from './mundo.ts';
import {
  aplicarCambio,
  contratar,
  estadoPedido,
  estadoTrabajo,
  generarOfertas,
  mensajeSistema,
  proponer,
  responderContra,
  sincronizar,
} from './reglas.ts';
import type { Mundo, Trabajo } from './tipos.ts';

export interface AccionPrueba {
  readonly id: string;
  readonly etiqueta: string;
  readonly grupo: 'Reloj' | 'Especialista' | 'Operations y pagos' | 'Fallas y permisos';
}

export const ACCIONES: readonly AccionPrueba[] = [
  { id: 'reloj_5m', etiqueta: 'Avanzar 5 min', grupo: 'Reloj' },
  { id: 'reloj_30m', etiqueta: 'Avanzar 30 min', grupo: 'Reloj' },
  { id: 'reloj_12h', etiqueta: 'Avanzar 12 h', grupo: 'Reloj' },
  { id: 'reloj_1d', etiqueta: 'Avanzar 1 día', grupo: 'Reloj' },
  { id: 'contra_acepta', etiqueta: 'Acepta tu contrapropuesta', grupo: 'Especialista' },
  { id: 'contra_contraoferta', etiqueta: 'Responde con otra oferta', grupo: 'Especialista' },
  { id: 'contra_rechaza', etiqueta: 'Rechaza tu contrapropuesta', grupo: 'Especialista' },
  { id: 'cambio_propone', etiqueta: 'Propone un cambio de precio', grupo: 'Especialista' },
  { id: 'chat_responde', etiqueta: 'Responde en el chat', grupo: 'Especialista' },
  {
    id: 'trabajo_siguiente',
    etiqueta: 'Avanza el trabajo (en camino, "Llegué", en curso, terminado)',
    grupo: 'Especialista',
  },
  {
    id: 'etapa_terminada',
    etiqueta: 'Marca una etapa de obra como terminada',
    grupo: 'Especialista',
  },
  { id: 'ofertas_ahora', etiqueta: 'Operations consigue propuestas', grupo: 'Operations y pagos' },
  { id: 'pago_verificar', etiqueta: 'Verificar el último pago', grupo: 'Operations y pagos' },
  { id: 'checkout_ok', etiqueta: 'Mercado Pago confirma el pago', grupo: 'Operations y pagos' },
  { id: 'checkout_fallido', etiqueta: 'Mercado Pago rechaza el pago', grupo: 'Operations y pagos' },
  {
    id: 'mp_toggle',
    etiqueta: 'Habilitar / deshabilitar Mercado Pago',
    grupo: 'Operations y pagos',
  },
  { id: 'reclamo_avanza', etiqueta: 'Avanzar el último reclamo', grupo: 'Operations y pagos' },
  {
    id: 'reclamo_pide_info',
    etiqueta: 'Operations pide más información',
    grupo: 'Operations y pagos',
  },
  { id: 'carrera', etiqueta: 'Otro dispositivo acepta primero', grupo: 'Fallas y permisos' },
  {
    id: 'sin_ofertas_toggle',
    etiqueta: 'Pedidos nuevos sin respuesta (sí/no)',
    grupo: 'Fallas y permisos',
  },
  { id: 'fallar_mensaje', etiqueta: 'Falla el próximo mensaje', grupo: 'Fallas y permisos' },
  { id: 'fallar_foto', etiqueta: 'Falla la próxima foto', grupo: 'Fallas y permisos' },
  {
    id: 'sesion_vence',
    etiqueta: 'Vence la sesión en la próxima acción',
    grupo: 'Fallas y permisos',
  },
  { id: 'red_toggle', etiqueta: 'Sin conexión (sí/no)', grupo: 'Fallas y permisos' },
  { id: 'geo_ok', etiqueta: 'Ubicación: permitida', grupo: 'Fallas y permisos' },
  { id: 'geo_denegada', etiqueta: 'Ubicación: denegada', grupo: 'Fallas y permisos' },
  { id: 'geo_imprecisa', etiqueta: 'Ubicación: imprecisa', grupo: 'Fallas y permisos' },
  { id: 'geo_sin_senal', etiqueta: 'Ubicación: sin señal', grupo: 'Fallas y permisos' },
];

const ultimo = <T>(xs: readonly T[], f: (x: T) => boolean): T | undefined =>
  [...xs].reverse().find(f);
const SIGUIENTE: Partial<Record<Trabajo['estado'], Trabajo['estado']>> = {
  agendado: 'en_camino',
  en_camino: 'en_sitio',
  en_sitio: 'en_curso',
  en_curso: 'terminado_por_especialista',
};

export interface Entorno {
  /** Conexión simulada: el adaptador la consulta antes de cada llamada. */
  red: boolean;
}

/** Ejecuta una acción de prueba. Devuelve un mensaje corto para el panel (nunca falla en silencio). */
export function ejecutarAccion(m: Mundo, entorno: Entorno, id: string): string {
  switch (id) {
    case 'reloj_5m':
    case 'reloj_30m':
    case 'reloj_12h':
    case 'reloj_1d': {
      const ms = {
        reloj_5m: 5 * MIN,
        reloj_30m: 30 * MIN,
        reloj_12h: 12 * HORA,
        reloj_1d: 24 * HORA,
      }[id];
      m.offsetMs += ms;
      sincronizar(m);
      return `Reloj: ${ahoraIso(m)}`;
    }
    case 'contra_acepta':
    case 'contra_contraoferta':
    case 'contra_rechaza': {
      const contra = ultimo(
        m.propuestas,
        (p) => p.autorRol === 'usuario' && p.estado === 'pendiente',
      );
      if (!contra) return 'No hay una contrapropuesta tuya pendiente.';
      delete m.respuestaEn[contra.id];
      responderContra(
        m,
        contra,
        id === 'contra_acepta' ? 'acepta' : id === 'contra_rechaza' ? 'rechaza' : 'contraoferta',
      );
      return 'El especialista respondió.';
    }
    case 'cambio_propone': {
      const t = ultimo(m.trabajos, (x) =>
        ['agendado', 'en_camino', 'en_sitio', 'en_curso'].includes(x.estado),
      );
      const pedido = t && m.pedidos.find((p) => p.id === t.pedidoId);
      if (!t || !pedido) return 'No hay un trabajo en curso o agendado.';
      const nueva =
        Math.round((t.acuerdo.monto.centavos + t.acuerdo.monto.centavos / 10) / 100) * 100;
      const p = proponer(m, pedido, t.especialista, {
        centavos: nueva,
        alcance: `${t.acuerdo.alcance} Ajuste de precio por materiales.`,
        tipo: 'cambio_acuerdo',
        trabajoId: t.id,
        horario: t.acuerdo.horario,
        venceEn: ahoraMs(m) + 24 * HORA,
      });
      notificar(m, 'propuesta_recibida', { tipo: 'propuesta', id: p.id });
      return 'El especialista propuso un cambio de precio (+10 %).';
    }
    case 'chat_responde': {
      const conv = ultimo(m.conversaciones, () => true);
      if (!conv) return 'No hay chats.';
      mensajeSistema(m, conv, 'Hola, ¿cómo estás? Te escribo por tu pedido.', 'especialista');
      notificar(m, 'mensaje_nuevo', { tipo: 'conversacion', id: conv.id });
      return 'El especialista escribió.';
    }
    case 'trabajo_siguiente': {
      const t = ultimo(m.trabajos, (x) => SIGUIENTE[x.estado] !== undefined);
      const sig = t && SIGUIENTE[t.estado];
      if (!t || !sig) return 'No hay un trabajo para avanzar.';
      if (sig === 'terminado_por_especialista' && t.etapas.some((e) => e.estado !== 'confirmada'))
        return 'Es una obra: marcá las etapas terminadas y confirmalas.';
      estadoTrabajo(m, t, sig, 'especialista');
      if (sig === 'en_camino') notificar(m, 'trabajo_en_camino', { tipo: 'trabajo', id: t.id });
      if (sig === 'en_sitio') notificar(m, 'trabajo_llego', { tipo: 'trabajo', id: t.id });
      if (sig === 'terminado_por_especialista')
        notificar(m, 'trabajo_terminado', { tipo: 'trabajo', id: t.id });
      return `Trabajo: ${sig}`;
    }
    case 'etapa_terminada': {
      const t = ultimo(m.trabajos, (x) => x.etapas.some((e) => e.estado === 'en_curso'));
      const e = t?.etapas.find((x) => x.estado === 'en_curso');
      if (!t || !e) return 'No hay etapas en curso.';
      e.estado = 'terminada_por_especialista';
      e.version += 1;
      t.version += 1;
      notificar(m, 'trabajo_terminado', { tipo: 'trabajo', id: t.id });
      return `Etapa ${e.orden} terminada.`;
    }
    case 'ofertas_ahora': {
      const p = ultimo(m.pedidos, (x) =>
        ['buscando', 'busqueda_manual', 'sin_respuesta'].includes(x.estado),
      );
      if (!p) return 'No hay pedidos buscando.';
      if (p.estado === 'sin_respuesta') estadoPedido(m, p, 'busqueda_manual');
      const nuevas = generarOfertas(m, p);
      return nuevas.length
        ? `Llegaron ${nuevas.length} propuestas.`
        : 'No hay especialistas del rubro.';
    }
    case 'pago_verificar': {
      const pago = ultimo(m.pagos, (x) => x.estado === 'reportado' || x.estado === 'pendiente');
      if (!pago) return 'No hay pagos para verificar.';
      pago.estado = 'verificado';
      pago.fuente = pago.metodo === 'efectivo' ? 'operaciones' : 'proveedor';
      pago.verificadoEn = ahoraIso(m);
      pago.version += 1;
      notificar(m, 'pago_verificado', { tipo: 'pago', id: pago.id });
      return 'Pago verificado.';
    }
    case 'checkout_ok':
    case 'checkout_fallido': {
      const pago = ultimo(
        m.pagos,
        (x) => x.metodo === 'mercado_pago_directo' && x.estado === 'pendiente',
      );
      if (!pago) return 'No hay un pago de Mercado Pago pendiente.';
      pago.estado = id === 'checkout_ok' ? 'verificado' : 'fallido';
      pago.fuente = id === 'checkout_ok' ? 'proveedor' : null;
      pago.verificadoEn = id === 'checkout_ok' ? ahoraIso(m) : null;
      pago.version += 1;
      if (id === 'checkout_ok') notificar(m, 'pago_verificado', { tipo: 'pago', id: pago.id });
      return id === 'checkout_ok'
        ? 'Mercado Pago confirmó el pago.'
        : 'Mercado Pago rechazó el pago.';
    }
    case 'mp_toggle':
      m.flags.checkoutActivo = !m.flags.checkoutActivo;
      return `Mercado Pago: ${m.flags.checkoutActivo ? 'habilitado' : 'deshabilitado (gate)'}`;
    case 'reclamo_avanza':
    case 'reclamo_pide_info': {
      const r = ultimo(m.reclamos, (x) => x.estado !== 'cerrado');
      if (!r) return 'No hay reclamos abiertos.';
      const siguiente =
        id === 'reclamo_pide_info'
          ? r.estado === 'en_revision'
            ? 'esperando_usuario'
            : undefined
          : (
              {
                abierto: 'en_revision',
                en_revision: 'resuelto',
                esperando_usuario: 'en_revision',
                resuelto: 'cerrado',
              } as const
            )[r.estado as 'abierto'];
      if (!siguiente) return 'Ese paso no aplica al estado actual.';
      r.historial.push({
        de: r.estado,
        a: siguiente,
        actor: 'operaciones',
        ocurridoEn: ahoraIso(m),
      });
      r.estado = siguiente;
      r.version += 1;
      r.actualizadoEn = ahoraIso(m);
      notificar(m, 'reclamo_actualizado', { tipo: 'reclamo', id: r.id });
      return `Reclamo: ${siguiente}`;
    }
    case 'carrera':
      m.flags.carreraAceptacion = true;
      return 'La próxima aceptación pierde contra otro dispositivo.';
    case 'sin_ofertas_toggle':
      m.flags.sinOfertas = !m.flags.sinOfertas;
      return `Pedidos nuevos sin respuesta: ${m.flags.sinOfertas ? 'sí' : 'no'}`;
    case 'fallar_mensaje':
      m.flags.fallarProximoMensaje = true;
      return 'El próximo mensaje va a fallar.';
    case 'fallar_foto':
      m.flags.fallarProximaFoto = true;
      return 'La próxima foto va a fallar.';
    case 'sesion_vence':
      m.flags.vencerEnLlamadas = m.llamadasConSesion;
      return 'La sesión vence en la próxima acción.';
    case 'red_toggle':
      entorno.red = !entorno.red;
      return `Conexión: ${entorno.red ? 'normal' : 'caída'}`;
    case 'geo_ok':
    case 'geo_denegada':
    case 'geo_imprecisa':
    case 'geo_sin_senal':
      prueba.geo = id.slice(4) as GeoSimulada;
      return `Ubicación simulada: ${prueba.geo}`;
    default:
      return 'Acción desconocida.';
  }
}

export { aplicarCambio, contratar, nuevoId };
