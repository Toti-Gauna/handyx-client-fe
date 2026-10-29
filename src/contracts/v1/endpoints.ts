// Contrato v1 · registro de endpoints de la API de usuario (prefijo /v1).
// Fuente única: de acá salen docs/api/openapi.json (npm run openapi), el adaptador HTTP del front y la matriz
// pantalla → API → prueba. `fase` dice en qué fase del bloque se implementa en el servidor.
import { z } from 'zod';
import { ClaveIdempotencia, ConsultaPaginada, type CodigoError, Id, paginado } from './comunes.ts';
import {
  AceptacionEntrada,
  BajaEntrada,
  LoginEntrada,
  NuevaContrasenaEntrada,
  PerfilEntrada,
  PreferenciasNotificacion,
  RecuperacionEntrada,
  RegistroEntrada,
  Sesion,
  SolicitudBaja,
} from './cuenta.ts';
import { AceptarFeeEntrada, EstadoFee } from './fee.ts';
import {
  AccionPedidoEntrada,
  CancelacionEntrada,
  EdicionPedidoEntrada,
  MediaRef,
  Pedido,
  PedidoEntrada,
  Rubro,
} from './pedidos.ts';
import {
  CancelacionTrabajoEntrada,
  ConfirmacionEntrada,
  ContrapropuestaEntrada,
  EventoTrabajo,
  Propuesta,
  PropuestaCambioEntrada,
  RespuestaPropuestaEntrada,
  Trabajo,
} from './propuestas.ts';
import {
  Conversacion,
  Mensaje,
  MensajeEntrada,
  Notificacion,
  PushSuscripcionEntrada,
  Reclamo,
  ReclamoEntrada,
  RegistroPago,
  ReportePagoEntrada,
  RespuestaReclamoEntrada,
} from './servicio.ts';

export const VERSION_CONTRATO = '1.0.0-draft.1';

export type Metodo = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export interface Endpoint {
  readonly id: string;
  readonly metodo: Metodo;
  /** Parámetros como `{id}`. */
  readonly ruta: `/v1/${string}`;
  readonly resumen: string;
  /** `publica`: sin sesión (igual exige CSRF previo en las escrituras de auth). */
  readonly acceso: 'publica' | 'sesion';
  readonly idempotente: boolean;
  readonly consulta?: z.ZodType;
  readonly cuerpo?: z.ZodType | 'multipart';
  readonly respuesta: z.ZodType | null;
  readonly estado: 200 | 201 | 202 | 204;
  readonly errores: readonly CodigoError[];
  readonly fase: 4;
}

const CsrfToken = z.object({ csrfToken: z.string().min(32).max(256) }).strict();
const Rubros = z
  .object({ items: z.array(z.object({ id: Rubro, disponible: z.boolean() }).strict()) })
  .strict();
const Cobertura = z.object({ ciudad: z.string(), cubierta: z.boolean() }).strict();
const ConsultaCobertura = z.object({ ciudad: z.string().trim().min(2).max(80) }).strict();
const ConsultaPedidos = ConsultaPaginada.extend({
  vista: z.enum(['activos', 'historial']).optional(),
}).strict();
const ConsultaTrabajos = ConsultaPaginada.extend({
  vista: z.enum(['activos', 'programados', 'historial']).optional(),
}).strict();
const Aceptada = z.object({ propuesta: Propuesta, trabajo: Trabajo }).strict();
const Pagos = z.object({ items: z.array(RegistroPago) }).strict();
const Checkout = z.object({ url: z.url({ protocol: /^https$/ }) }).strict();
const VersionApi = z.object({ contrato: z.string() }).strict();

const base = ['validacion', 'limite', 'no_disponible', 'error_interno'] as const;
const sesion = [
  ...base,
  'no_autenticado',
  'sesion_vencida',
  'sin_permiso',
  'csrf_invalido',
  'origen_no_permitido',
] as const;
const recurso = [...sesion, 'no_encontrado'] as const;
const escritura = [...recurso, 'conflicto'] as const;

// Genérico: cada endpoint conserva sus tipos exactos (el cliente tipa cuerpo y respuesta por id).
const e = <const T extends Omit<Endpoint, 'fase'>>(endpoint: T): T & { readonly fase: 4 } => ({
  ...endpoint,
  fase: 4,
});

export const ENDPOINTS = [
  // Sistema y auth
  e({
    id: 'version',
    metodo: 'GET',
    ruta: '/v1/version',
    resumen: 'Versión del contrato servida',
    acceso: 'publica',
    idempotente: true,
    respuesta: VersionApi,
    estado: 200,
    errores: base,
  }),
  e({
    id: 'csrf',
    metodo: 'POST',
    ruta: '/v1/auth/csrf',
    resumen: 'CSRF previo al login/registro (en memoria)',
    acceso: 'publica',
    idempotente: true,
    respuesta: CsrfToken,
    estado: 200,
    errores: base,
  }),
  e({
    id: 'registro',
    metodo: 'POST',
    ruta: '/v1/auth/registro',
    resumen: 'Alta con invitación de la demo cerrada',
    acceso: 'publica',
    idempotente: false,
    cuerpo: RegistroEntrada,
    respuesta: Sesion,
    estado: 201,
    errores: [...base, 'csrf_invalido', 'origen_no_permitido', 'conflicto'],
  }),
  e({
    id: 'login',
    metodo: 'POST',
    ruta: '/v1/auth/login',
    resumen: 'Ingreso con email y contraseña',
    acceso: 'publica',
    idempotente: false,
    cuerpo: LoginEntrada,
    respuesta: Sesion,
    estado: 200,
    errores: [...base, 'no_autenticado', 'csrf_invalido', 'origen_no_permitido'],
  }),
  e({
    id: 'logout',
    metodo: 'POST',
    ruta: '/v1/auth/logout',
    resumen: 'Cierra la sesión (no es baja)',
    acceso: 'sesion',
    idempotente: true,
    respuesta: null,
    estado: 204,
    errores: sesion,
  }),
  e({
    id: 'recuperacion',
    metodo: 'POST',
    ruta: '/v1/auth/recuperacion',
    resumen: 'Pide recuperar la contraseña (respuesta uniforme)',
    acceso: 'publica',
    idempotente: true,
    cuerpo: RecuperacionEntrada,
    respuesta: null,
    estado: 202,
    errores: [...base, 'csrf_invalido', 'origen_no_permitido', 'funcion_inactiva'],
  }),
  e({
    id: 'recuperacionConfirmar',
    metodo: 'POST',
    ruta: '/v1/auth/recuperacion/confirmar',
    resumen: 'Nueva contraseña con token de un solo uso',
    acceso: 'publica',
    idempotente: false,
    cuerpo: NuevaContrasenaEntrada,
    respuesta: null,
    estado: 204,
    errores: [...base, 'csrf_invalido', 'origen_no_permitido', 'conflicto'],
  }),
  // Cuenta
  e({
    id: 'sesion',
    metodo: 'GET',
    ruta: '/v1/sesion',
    resumen: 'Sesión, perfil y pendientes',
    acceso: 'sesion',
    idempotente: true,
    respuesta: Sesion,
    estado: 200,
    errores: sesion,
  }),
  e({
    id: 'perfil',
    metodo: 'PATCH',
    ruta: '/v1/cuenta/perfil',
    resumen: 'Completa o corrige el perfil por pasos',
    acceso: 'sesion',
    idempotente: false,
    cuerpo: PerfilEntrada,
    respuesta: Sesion,
    estado: 200,
    errores: escritura,
  }),
  e({
    id: 'aceptacion',
    metodo: 'POST',
    ruta: '/v1/cuenta/aceptaciones',
    resumen: 'Acepta una versión de términos/privacidad',
    acceso: 'sesion',
    idempotente: true,
    cuerpo: AceptacionEntrada,
    respuesta: Sesion,
    estado: 200,
    errores: escritura,
  }),
  e({
    id: 'fee',
    metodo: 'GET',
    ruta: '/v1/cuenta/fee',
    resumen: 'Tarifa vigente, siguiente y aceptada',
    acceso: 'sesion',
    idempotente: true,
    respuesta: EstadoFee,
    estado: 200,
    errores: sesion,
  }),
  e({
    id: 'feeAceptar',
    metodo: 'POST',
    ruta: '/v1/cuenta/fee/aceptacion',
    resumen: 'Registra que vio y aceptó la política de tarifa',
    acceso: 'sesion',
    idempotente: true,
    cuerpo: AceptarFeeEntrada,
    respuesta: EstadoFee,
    estado: 200,
    errores: escritura,
  }),
  e({
    id: 'preferencias',
    metodo: 'GET',
    ruta: '/v1/cuenta/notificaciones',
    resumen: 'Preferencias de aviso',
    acceso: 'sesion',
    idempotente: true,
    respuesta: PreferenciasNotificacion,
    estado: 200,
    errores: sesion,
  }),
  e({
    id: 'preferenciasEditar',
    metodo: 'PATCH',
    ruta: '/v1/cuenta/notificaciones',
    resumen: 'Cambia preferencias de aviso',
    acceso: 'sesion',
    idempotente: true,
    cuerpo: PreferenciasNotificacion,
    respuesta: PreferenciasNotificacion,
    estado: 200,
    errores: sesion,
  }),
  e({
    id: 'pushAlta',
    metodo: 'POST',
    ruta: '/v1/cuenta/push',
    resumen: 'Registra la suscripción push del navegador',
    acceso: 'sesion',
    idempotente: true,
    cuerpo: PushSuscripcionEntrada,
    respuesta: null,
    estado: 204,
    errores: [...sesion, 'funcion_inactiva'],
  }),
  e({
    id: 'pushBaja',
    metodo: 'DELETE',
    ruta: '/v1/cuenta/push',
    resumen: 'Quita la suscripción push',
    acceso: 'sesion',
    idempotente: true,
    respuesta: null,
    estado: 204,
    errores: sesion,
  }),
  e({
    id: 'bajaSolicitar',
    metodo: 'POST',
    ruta: '/v1/cuenta/baja',
    resumen: 'Solicita la eliminación real de cuenta y datos',
    acceso: 'sesion',
    idempotente: true,
    cuerpo: BajaEntrada,
    respuesta: SolicitudBaja,
    estado: 202,
    errores: escritura,
  }),
  e({
    id: 'baja',
    metodo: 'GET',
    ruta: '/v1/cuenta/baja',
    resumen: 'Estado verdadero de la solicitud de baja',
    acceso: 'sesion',
    idempotente: true,
    respuesta: SolicitudBaja,
    estado: 200,
    errores: recurso,
  }),
  // Catálogo y media
  e({
    id: 'rubros',
    metodo: 'GET',
    ruta: '/v1/rubros',
    resumen: 'Rubros aprobados',
    acceso: 'sesion',
    idempotente: true,
    respuesta: Rubros,
    estado: 200,
    errores: sesion,
  }),
  e({
    id: 'cobertura',
    metodo: 'GET',
    ruta: '/v1/cobertura',
    resumen: 'Si una ciudad tiene cobertura (inicio: Mar del Plata)',
    acceso: 'sesion',
    idempotente: true,
    consulta: ConsultaCobertura,
    respuesta: Cobertura,
    estado: 200,
    errores: sesion,
  }),
  e({
    id: 'media',
    metodo: 'POST',
    ruta: '/v1/media',
    resumen: 'Sube una foto privada (jpeg/png/webp, 5 MB)',
    acceso: 'sesion',
    idempotente: true,
    cuerpo: 'multipart',
    respuesta: MediaRef,
    estado: 201,
    errores: [...sesion, 'payload_grande', 'tipo_no_permitido'],
  }),
  // Pedidos
  e({
    id: 'pedidoCrear',
    metodo: 'POST',
    ruta: '/v1/pedidos',
    resumen: 'Crea un pedido y empieza la búsqueda',
    acceso: 'sesion',
    idempotente: true,
    cuerpo: PedidoEntrada,
    respuesta: Pedido,
    estado: 201,
    errores: escritura,
  }),
  e({
    id: 'pedidos',
    metodo: 'GET',
    ruta: '/v1/pedidos',
    resumen: 'Mis pedidos (activos o historial)',
    acceso: 'sesion',
    idempotente: true,
    consulta: ConsultaPedidos,
    respuesta: paginado(Pedido),
    estado: 200,
    errores: sesion,
  }),
  e({
    id: 'pedido',
    metodo: 'GET',
    ruta: '/v1/pedidos/{id}',
    resumen: 'Detalle de un pedido propio',
    acceso: 'sesion',
    idempotente: true,
    respuesta: Pedido,
    estado: 200,
    errores: recurso,
  }),
  e({
    id: 'pedidoEditar',
    metodo: 'PATCH',
    ruta: '/v1/pedidos/{id}',
    resumen: 'Edita mientras se busca',
    acceso: 'sesion',
    idempotente: false,
    cuerpo: EdicionPedidoEntrada,
    respuesta: Pedido,
    estado: 200,
    errores: escritura,
  }),
  e({
    id: 'pedidoRelanzar',
    metodo: 'POST',
    ruta: '/v1/pedidos/{id}/relanzar',
    resumen: 'Relanza la búsqueda (intentos limitados)',
    acceso: 'sesion',
    idempotente: true,
    cuerpo: AccionPedidoEntrada,
    respuesta: Pedido,
    estado: 200,
    errores: escritura,
  }),
  e({
    id: 'pedidoBusquedaManual',
    metodo: 'POST',
    ruta: '/v1/pedidos/{id}/busqueda-manual',
    resumen: 'Pide búsqueda manual a Operations (sin ETA)',
    acceso: 'sesion',
    idempotente: true,
    cuerpo: AccionPedidoEntrada,
    respuesta: Pedido,
    estado: 200,
    errores: escritura,
  }),
  e({
    id: 'pedidoCancelar',
    metodo: 'POST',
    ruta: '/v1/pedidos/{id}/cancelar',
    resumen: 'Cancela un pedido sin acuerdo',
    acceso: 'sesion',
    idempotente: true,
    cuerpo: CancelacionEntrada,
    respuesta: Pedido,
    estado: 200,
    errores: escritura,
  }),
  // Propuestas
  e({
    id: 'propuestas',
    metodo: 'GET',
    ruta: '/v1/pedidos/{id}/propuestas',
    resumen: 'Propuestas de un pedido propio',
    acceso: 'sesion',
    idempotente: true,
    consulta: ConsultaPaginada,
    respuesta: paginado(Propuesta),
    estado: 200,
    errores: recurso,
  }),
  e({
    id: 'propuesta',
    metodo: 'GET',
    ruta: '/v1/propuestas/{id}',
    resumen: 'Detalle de una propuesta',
    acceso: 'sesion',
    idempotente: true,
    respuesta: Propuesta,
    estado: 200,
    errores: recurso,
  }),
  e({
    id: 'propuestaAceptar',
    metodo: 'POST',
    ruta: '/v1/propuestas/{id}/aceptar',
    resumen: 'Acepta exactamente esa versión: crea el trabajo',
    acceso: 'sesion',
    idempotente: true,
    cuerpo: RespuestaPropuestaEntrada,
    respuesta: Aceptada,
    estado: 200,
    errores: escritura,
  }),
  e({
    id: 'propuestaRechazar',
    metodo: 'POST',
    ruta: '/v1/propuestas/{id}/rechazar',
    resumen: 'Rechaza una propuesta pendiente',
    acceso: 'sesion',
    idempotente: true,
    cuerpo: RespuestaPropuestaEntrada,
    respuesta: Propuesta,
    estado: 200,
    errores: escritura,
  }),
  e({
    id: 'contrapropuesta',
    metodo: 'POST',
    ruta: '/v1/propuestas/{id}/contrapropuesta',
    resumen: 'Contrapropuesta del usuario (reemplaza la anterior)',
    acceso: 'sesion',
    idempotente: true,
    cuerpo: ContrapropuestaEntrada,
    respuesta: Propuesta,
    estado: 201,
    errores: escritura,
  }),
  // Trabajos y pagos
  e({
    id: 'trabajos',
    metodo: 'GET',
    ruta: '/v1/trabajos',
    resumen: 'Mis trabajos (activos, programados, historial)',
    acceso: 'sesion',
    idempotente: true,
    consulta: ConsultaTrabajos,
    respuesta: paginado(Trabajo),
    estado: 200,
    errores: sesion,
  }),
  e({
    id: 'trabajo',
    metodo: 'GET',
    ruta: '/v1/trabajos/{id}',
    resumen: 'Detalle, acuerdo vigente e historial',
    acceso: 'sesion',
    idempotente: true,
    respuesta: Trabajo,
    estado: 200,
    errores: recurso,
  }),
  e({
    id: 'trabajoEventos',
    metodo: 'GET',
    ruta: '/v1/trabajos/{id}/eventos',
    resumen: 'Cambios de estado con actor y fecha',
    acceso: 'sesion',
    idempotente: true,
    consulta: ConsultaPaginada,
    respuesta: paginado(EventoTrabajo),
    estado: 200,
    errores: recurso,
  }),
  e({
    id: 'trabajoConfirmarFin',
    metodo: 'POST',
    ruta: '/v1/trabajos/{id}/confirmar-fin',
    resumen: 'El usuario confirma que terminó',
    acceso: 'sesion',
    idempotente: true,
    cuerpo: ConfirmacionEntrada,
    respuesta: Trabajo,
    estado: 200,
    errores: escritura,
  }),
  e({
    id: 'etapaConfirmar',
    metodo: 'POST',
    ruta: '/v1/trabajos/{id}/etapas/{etapaId}/confirmar',
    resumen: 'Confirma una etapa de obra',
    acceso: 'sesion',
    idempotente: true,
    cuerpo: ConfirmacionEntrada,
    respuesta: Trabajo,
    estado: 200,
    errores: escritura,
  }),
  e({
    id: 'trabajoCancelar',
    metodo: 'POST',
    ruta: '/v1/trabajos/{id}/cancelar',
    resumen: 'Cancela un trabajo agendado',
    acceso: 'sesion',
    idempotente: true,
    cuerpo: CancelacionTrabajoEntrada,
    respuesta: Trabajo,
    estado: 200,
    errores: escritura,
  }),
  e({
    id: 'trabajoProponerCambio',
    metodo: 'POST',
    ruta: '/v1/trabajos/{id}/propuestas',
    resumen: 'Propone cambiar el acuerdo (turno, alcance o monto): queda pendiente',
    acceso: 'sesion',
    idempotente: true,
    cuerpo: PropuestaCambioEntrada,
    respuesta: Propuesta,
    estado: 201,
    errores: escritura,
  }),
  e({
    id: 'pagos',
    metodo: 'GET',
    ruta: '/v1/trabajos/{id}/pagos',
    resumen: 'Pagos directos registrados del trabajo',
    acceso: 'sesion',
    idempotente: true,
    respuesta: Pagos,
    estado: 200,
    errores: recurso,
  }),
  e({
    id: 'pagoReportar',
    metodo: 'POST',
    ruta: '/v1/trabajos/{id}/pagos',
    resumen: 'Reporta pago en efectivo o MP directo (no lo verifica)',
    acceso: 'sesion',
    idempotente: true,
    cuerpo: ReportePagoEntrada,
    respuesta: RegistroPago,
    estado: 201,
    errores: escritura,
  }),
  e({
    id: 'pago',
    metodo: 'GET',
    ruta: '/v1/pagos/{id}',
    resumen: 'Estado real de un pago (la vuelta del checkout no lo confirma)',
    acceso: 'sesion',
    idempotente: true,
    respuesta: RegistroPago,
    estado: 200,
    errores: recurso,
  }),
  e({
    id: 'pagoCheckout',
    metodo: 'POST',
    ruta: '/v1/pagos/{id}/checkout',
    resumen: 'Checkout de MP del especialista (inactivo hasta validar la ruta)',
    acceso: 'sesion',
    idempotente: true,
    respuesta: Checkout,
    estado: 200,
    errores: [...escritura, 'funcion_inactiva'],
  }),
  // Chat
  e({
    id: 'conversaciones',
    metodo: 'GET',
    ruta: '/v1/conversaciones',
    resumen: 'Chats por pedido/trabajo',
    acceso: 'sesion',
    idempotente: true,
    consulta: ConsultaPaginada,
    respuesta: paginado(Conversacion),
    estado: 200,
    errores: sesion,
  }),
  e({
    id: 'mensajes',
    metodo: 'GET',
    ruta: '/v1/conversaciones/{id}/mensajes',
    resumen: 'Mensajes (más nuevos primero)',
    acceso: 'sesion',
    idempotente: true,
    consulta: ConsultaPaginada,
    respuesta: paginado(Mensaje),
    estado: 200,
    errores: recurso,
  }),
  e({
    id: 'mensajeEnviar',
    metodo: 'POST',
    ruta: '/v1/conversaciones/{id}/mensajes',
    resumen: 'Envía texto o foto (clienteId evita duplicados)',
    acceso: 'sesion',
    idempotente: true,
    cuerpo: MensajeEntrada,
    respuesta: Mensaje,
    estado: 201,
    errores: escritura,
  }),
  e({
    id: 'conversacionLeida',
    metodo: 'POST',
    ruta: '/v1/conversaciones/{id}/leido',
    resumen: 'Marca leído',
    acceso: 'sesion',
    idempotente: true,
    respuesta: null,
    estado: 204,
    errores: recurso,
  }),
  // Reclamos y notificaciones
  e({
    id: 'reclamoCrear',
    metodo: 'POST',
    ruta: '/v1/reclamos',
    resumen: 'Abre un reclamo de un pedido/trabajo propio',
    acceso: 'sesion',
    idempotente: true,
    cuerpo: ReclamoEntrada,
    respuesta: Reclamo,
    estado: 201,
    errores: escritura,
  }),
  e({
    id: 'reclamos',
    metodo: 'GET',
    ruta: '/v1/reclamos',
    resumen: 'Mis reclamos',
    acceso: 'sesion',
    idempotente: true,
    consulta: ConsultaPaginada,
    respuesta: paginado(Reclamo),
    estado: 200,
    errores: sesion,
  }),
  e({
    id: 'reclamo',
    metodo: 'GET',
    ruta: '/v1/reclamos/{id}',
    resumen: 'Detalle e historial',
    acceso: 'sesion',
    idempotente: true,
    respuesta: Reclamo,
    estado: 200,
    errores: recurso,
  }),
  e({
    id: 'reclamoResponder',
    metodo: 'POST',
    ruta: '/v1/reclamos/{id}/respuestas',
    resumen: 'Suma información cuando se la piden',
    acceso: 'sesion',
    idempotente: true,
    cuerpo: RespuestaReclamoEntrada,
    respuesta: Reclamo,
    estado: 200,
    errores: escritura,
  }),
  e({
    id: 'notificaciones',
    metodo: 'GET',
    ruta: '/v1/notificaciones',
    resumen: 'Avisos in-app',
    acceso: 'sesion',
    idempotente: true,
    consulta: ConsultaPaginada,
    respuesta: paginado(Notificacion),
    estado: 200,
    errores: sesion,
  }),
  e({
    id: 'notificacionLeida',
    metodo: 'POST',
    ruta: '/v1/notificaciones/{id}/leida',
    resumen: 'Marca un aviso como leído',
    acceso: 'sesion',
    idempotente: true,
    respuesta: null,
    estado: 204,
    errores: recurso,
  }),
] as const satisfies readonly Endpoint[];

export type EndpointId = (typeof ENDPOINTS)[number]['id'];
export type EndpointDe<I extends EndpointId> = Extract<(typeof ENDPOINTS)[number], { id: I }>;
/** Respuesta ya validada de un endpoint (`undefined` si responde sin cuerpo). */
export type RespuestaDe<I extends EndpointId> = EndpointDe<I>['respuesta'] extends z.ZodType
  ? z.output<EndpointDe<I>['respuesta']>
  : undefined;
/** Cuerpo que acepta un endpoint (`FormData` para subidas, `undefined` si no lleva). */
export type CuerpoDe<I extends EndpointId> =
  EndpointDe<I> extends { cuerpo: infer C }
    ? C extends z.ZodType
      ? z.input<C>
      : FormData
    : undefined;
/** Consulta (query string) que acepta un endpoint. */
export type ConsultaDe<I extends EndpointId> =
  EndpointDe<I> extends { consulta: infer Q }
    ? Q extends z.ZodType
      ? z.input<Q>
      : never
    : undefined;

/** Cabeceras del contrato. Las escrituras con sesión llevan CSRF; las marcadas `idempotente` y no-GET, la clave. */
export const CABECERAS = {
  csrf: 'X-CSRF-Token',
  idempotencia: 'Idempotency-Key',
  requestId: 'X-Request-Id',
} as const;

/** Arma la ruta concreta: `rutaDe('pedido', { id })` → `/v1/pedidos/<id>`. Los ids se validan como UUID. */
export function rutaDe(id: EndpointId, parametros: Readonly<Record<string, string>> = {}): string {
  const endpoint = ENDPOINTS.find((item) => item.id === id);
  if (!endpoint) throw new Error(`Endpoint desconocido: ${id}`);
  return endpoint.ruta.replace(/\{(\w+)\}/g, (_, nombre: string) => {
    const valor = parametros[nombre];
    if (valor === undefined || !Id.safeParse(valor).success)
      throw new Error(`Parámetro inválido: ${nombre}`);
    return valor;
  });
}

export function endpoint(id: EndpointId): Endpoint {
  const encontrado = ENDPOINTS.find((item) => item.id === id);
  if (!encontrado) throw new Error(`Endpoint desconocido: ${id}`);
  return encontrado;
}

/** Las escrituras idempotentes llevan `Idempotency-Key` (UUIDv4); se valida con este esquema. */
export const esClaveIdempotencia = (valor: string): boolean =>
  ClaveIdempotencia.safeParse(valor).success;
