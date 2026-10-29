// Escenarios obligatorios del mock (Fase 2). Cada uno se elige con `?escenario=<id>` en la vista de prueba
// y tiene que poder recorrerse sin backend ni datos reales. Fase 1 los define; la Fase 2 los implementa.
import type { Lote } from './pantallas.ts';

export interface Escenario {
  readonly id: string;
  readonly titulo: string;
  readonly lote: Lote;
  readonly pantallas: readonly string[];
  readonly esperado: string;
  /** Ruta donde empieza el recorrido (no necesita ids: se llega por las listas). */
  readonly entrada: `/${string}`;
}

export const ESCENARIOS: readonly Escenario[] = [
  {
    id: 'nuevo-usuario',
    titulo: 'Nuevo usuario',
    lote: '2.1',
    pantallas: ['registro', 'registro-listo', 'perfil', 'modal-fee', 'inicio'],
    esperado:
      'Alta con invitación, aviso de fee 0 % hasta el 10/12, perfil por pasos y modal una sola vez.',
    entrada: '/',
  },
  {
    id: 'otra-ciudad',
    titulo: 'Usuario de otra ciudad sin cobertura',
    lote: '2.1',
    pantallas: ['perfil', 'inicio'],
    esperado:
      'Se registra el interés; no se promete cobertura ni se puede pedir como si la hubiera.',
    entrada: '/inicio/',
  },
  {
    id: 'ubicacion-denegada',
    titulo: 'Ubicación denegada',
    lote: '2.2',
    pantallas: ['perfil', 'pedir'],
    esperado: 'Sigue con carga manual; nunca se bloquea ni se vuelve a pedir en bucle.',
    entrada: '/perfil/',
  },
  {
    id: 'sin-especialistas',
    titulo: 'Ningún especialista',
    lote: '2.2',
    pantallas: ['pedido'],
    esperado: 'Sin respuesta al vencer la ventana: relanzar, búsqueda manual o cancelar, sin ETA.',
    entrada: '/pedidos/',
  },
  {
    id: 'varias-propuestas',
    titulo: 'Varias propuestas',
    lote: '2.3',
    pantallas: ['propuestas', 'propuesta'],
    esperado: 'Comparación sin ranking; importe del especialista y comisión 0 % separados.',
    entrada: '/pedidos/',
  },
  {
    id: 'contrapropuesta',
    titulo: 'Contrapropuesta',
    lote: '2.3',
    pantallas: ['propuesta', 'contrapropuesta', 'conversacion'],
    esperado: 'La anterior queda reemplazada; no hay acuerdo hasta que la otra parte acepta.',
    entrada: '/pedidos/',
  },
  {
    id: 'aceptacion-duplicada',
    titulo: 'Aceptación duplicada rechazada',
    lote: '2.3',
    pantallas: ['propuesta'],
    esperado: 'El segundo intento recibe 409 ya_resuelta y muestra el trabajo existente.',
    entrada: '/pedidos/',
  },
  {
    id: 'propuesta-vencida',
    titulo: 'Propuesta vencida',
    lote: '2.3',
    pantallas: ['propuesta'],
    esperado: 'A los 5 min (urgente) pasa a vencida; aceptar devuelve 409 vencida.',
    entrada: '/pedidos/',
  },
  {
    id: 'urgencia-sin-respuesta',
    titulo: 'Urgencia sin respuesta',
    lote: '2.2',
    pantallas: ['pedido'],
    esperado: 'A los 20 min sin propuestas: sin_respuesta con intentos limitados.',
    entrada: '/pedidos/',
  },
  {
    id: 'programado',
    titulo: 'Programado',
    lote: '2.2',
    pantallas: ['pedir', 'pedido', 'agenda'],
    esperado: 'Fecha/hora como solicitud; a las 12 h sin propuestas ofrece revisar o relanzar.',
    entrada: '/pedidos/',
  },
  {
    id: 'obra-por-etapas',
    titulo: 'Obra por etapa',
    lote: '2.4',
    pantallas: ['trabajo', 'pago'],
    esperado: 'Etapas con monto propio; cada una se confirma y se paga por separado.',
    entrada: '/pedidos/',
  },
  {
    id: 'chat-fallido',
    titulo: 'Chat fallido',
    lote: '2.4',
    pantallas: ['conversacion'],
    esperado: 'Mensaje con error y "Reintentar"; reintentar no lo duplica.',
    entrada: '/chats/',
  },
  {
    id: 'cancelacion',
    titulo: 'Cancelación',
    lote: '2.4',
    pantallas: ['pedido', 'trabajo'],
    esperado: 'Cancelar pedido o trabajo agendado con motivo; queda en el historial.',
    entrada: '/pedidos/',
  },
  {
    id: 'efectivo-reportado',
    titulo: 'Efectivo reportado',
    lote: '2.5',
    pantallas: ['pago'],
    esperado: 'Queda "reportado", nunca "verificado" por el reporte solo.',
    entrada: '/pedidos/',
  },
  {
    id: 'mp-pendiente-fallido',
    titulo: 'Mercado Pago pendiente/fallido',
    lote: '2.5',
    pantallas: ['pago', 'pago-retorno'],
    esperado: 'Volver del checkout consulta el estado; pendiente y fallido se distinguen.',
    entrada: '/pedidos/',
  },
  {
    id: 'reclamo',
    titulo: 'Reclamo',
    lote: '2.4',
    pantallas: ['reclamo-nuevo', 'reclamo'],
    esperado: 'Categoría, detalle, adjuntos y estado con historial; sin plazos inventados.',
    entrada: '/reclamos/',
  },
  {
    id: 'sesion-vencida',
    titulo: 'Sesión vencida',
    lote: '2.1',
    pantallas: ['ingresar'],
    esperado: 'Vuelve al ingreso sin perder lo tipeado ni simular la acción.',
    entrada: '/inicio/',
  },
  {
    id: 'baja-solicitada',
    titulo: 'Baja solicitada',
    lote: '2.1',
    pantallas: ['cuenta-baja', 'cuenta'],
    esperado: 'Estado real de la solicitud y retenciones informadas.',
    entrada: '/cuenta/',
  },
];
