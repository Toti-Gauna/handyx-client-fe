// "Mundo" de la vista de prueba: estado en memoria (nunca en el navegador), reloj controlable y constructores.
// Todo es ficticio: ids `de000000-…`, nombres inventados, direcciones inexistentes, emails `@example.test`.
import type { EspecialistaResumen, Mundo, Notif } from './tipos.ts';
import { AHORA_DEMO, POLITICA_DEMO } from './fixtures.ts';
import { idDemo } from './fixtures.ts';

export const MIN = 60_000;
export const HORA = 60 * MIN;

/** Cuenta de prueba (sintética) y código de invitación de la demo cerrada de la vista de prueba. */
export const CUENTA_PRUEBA = {
  email: 'usuaria@example.test',
  contrasena: 'handyx-demo-1234',
} as const;
export const INVITACION_PRUEBA = 'DEMO2026';

/** Versiones de los textos vigentes (provisionales hasta el aviso definitivo de Legal). */
export const VERSIONES_TEXTOS = {
  terminos: 'terminos-demo-2026-11',
  privacidad: 'privacidad-demo-2026-11-v2',
} as const;

export const iso = (ms: number): string => new Date(ms).toISOString();

export function ahoraMs(m: Mundo): number {
  return m.baseMs + m.offsetMs + (m.congelado ? 0 : Date.now() - m.t0);
}

export const ahoraIso = (m: Mundo): string => iso(ahoraMs(m));

/** Id determinista de la vista de prueba (contador del mundo). */
export function nuevoId(m: Mundo): string {
  m.contador += 1;
  return idDemo(0x1000 + m.contador);
}

/** Instante UTC de una fecha/hora de Buenos Aires (UTC−3, sin horario de verano). */
export const instanteBA = (fecha: string, hora: string): string =>
  new Date(`${fecha}T${hora}:00-03:00`).toISOString();

export function crearEspecialistas(): EspecialistaResumen[] {
  const v = (tipo: 'identidad' | 'antecedentes' | 'matricula', dia: string) => ({
    tipo,
    verificadoEn: `${dia}T14:00:00.000Z`,
  });
  return [
    {
      id: idDemo(201),
      nombrePublico: 'Especialista 1',
      rubros: ['plomeria', 'gas'],
      verificaciones: [v('identidad', '2026-11-05'), v('antecedentes', '2026-11-06')],
      trabajosRealizados: 12,
    },
    {
      id: idDemo(202),
      nombrePublico: 'Especialista 2',
      rubros: ['electricidad', 'aire_acondicionado'],
      verificaciones: [v('identidad', '2026-11-05')],
      trabajosRealizados: 4,
    },
    {
      id: idDemo(203),
      nombrePublico: 'Especialista 3',
      rubros: ['plomeria', 'albanileria', 'cerrajeria'],
      verificaciones: [],
      trabajosRealizados: null,
    },
    {
      id: idDemo(204),
      nombrePublico: 'Especialista 4',
      rubros: ['plomeria', 'electricidad'],
      verificaciones: [],
      trabajosRealizados: 1,
    },
  ];
}

export function crearMundo(
  opciones: { escenario?: string; congelado?: boolean; baseIso?: string } = {},
): Mundo {
  const baseMs = Date.parse(opciones.baseIso ?? AHORA_DEMO);
  return {
    escenario: opciones.escenario ?? 'nuevo-usuario',
    baseMs,
    t0: Date.now(),
    offsetMs: 0,
    congelado: opciones.congelado ?? false,
    contenido: 'vacio',
    cuentas: [{ id: idDemo(1), email: CUENTA_PRUEBA.email, contrasena: CUENTA_PRUEBA.contrasena }],
    cuentaId: null,
    intentosFallidos: 0,
    invitaciones: new Set([INVITACION_PRUEBA]),
    csrf: 'csrf-de-la-vista-de-prueba-0000000000000000',
    estadoCuenta: 'perfil_incompleto',
    perfil: {},
    perfilVersion: 0,
    aceptaciones: [],
    politica: POLITICA_DEMO,
    feeAceptada: null,
    cobertura: ['mar del plata'],
    especialistas: crearEspecialistas(),
    pedidos: [],
    ofertas: {},
    propuestas: [],
    respuestaEn: {},
    respuestaChat: {},
    trabajos: [],
    eventos: {},
    conversaciones: [],
    mensajes: [],
    pagos: [],
    reclamos: [],
    notificaciones: [],
    baja: null,
    push: { preferencia: false, suscripto: false },
    idem: new Map(),
    media: new Map(),
    flags: {
      sinOfertas: false,
      fallarProximoMensaje: false,
      fallarProximaFoto: false,
      vencerEnLlamadas: null,
      carreraAceptacion: false,
      checkoutActivo: false,
    },
    llamadasConSesion: 0,
    sesionVencida: false,
    contador: 0,
  };
}

export function notificar(m: Mundo, tipo: Notif['tipo'], entidad: Notif['entidad']): void {
  m.notificaciones.unshift({
    id: nuevoId(m),
    tipo,
    entidad,
    creadaEn: ahoraIso(m),
    leidaEn: null,
  });
}
