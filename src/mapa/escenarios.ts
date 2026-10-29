// Escenarios obligatorios del mock (Fase 2). Cada uno se elige con `?escenario=<id>` en la vista de prueba
// y tiene que poder recorrerse sin backend ni datos reales. Fase 1 los define; la Fase 2 los implementa.
import type { Lote } from './pantallas.ts';

export interface Escenario {
  readonly id: string;
  readonly titulo: string;
  readonly lote: Lote;
  readonly pantallas: readonly string[];
  readonly esperado: string;
}

export const ESCENARIOS: readonly Escenario[] = [
  {
    id: 'nuevo-usuario',
    titulo: 'Nuevo usuario',
    lote: '2.1',
    pantallas: ['registro', 'registro-listo', 'perfil', 'modal-fee', 'inicio'],
    esperado:
      'Alta con invitación, aviso de fee 0 % hasta el 10/12, perfil por pasos y modal una sola vez.',
  },
  {
    id: 'otra-ciudad',
    titulo: 'Usuario de otra ciudad sin cobertura',
    lote: '2.1',
    pantallas: ['perfil', 'inicio'],
    esperado:
      'Se registra el interés; no se promete cobertura ni se puede pedir como si la hubiera.',
  },
  {
    id: 'ubicacion-denegada',
    titulo: 'Ubicación denegada',
    lote: '2.2',
    pantallas: ['perfil', 'pedir'],
    esperado: 'Sigue con carga manual; nunca se bloquea ni se vuelve a pedir en bucle.',
  },
  {
    id: 'sin-especialistas',
    titulo: 'Ningún especialista',
    lote: '2.2',
    pantallas: ['pedido'],
    esperado: 'Sin respuesta al vencer la ventana: relanzar, búsqueda manual o cancelar, sin ETA.',
  },
  {
    id: 'varias-propuestas',
    titulo: 'Varias propuestas',
    lote: '2.3',
    pantallas: ['propuestas', 'propuesta'],
    esperado: 'Comparación sin ranking; importe del especialista y comisión 0 % separados.',
  },
  {
    id: 'contrapropuesta',
    titulo: 'Contrapropuesta',
    lote: '2.3',
    pantallas: ['propuesta', 'contrapropuesta', 'conversacion'],
    esperado: 'La anterior queda reemplazada; no hay acuerdo hasta que la otra parte acepta.',
  },
  {
    id: 'aceptacion-duplicada',
    titulo: 'Aceptación duplicada rechazada',
    lote: '2.3',
    pantallas: ['propuesta'],
    esperado: 'El segundo intento recibe 409 ya_resuelta y muestra el trabajo existente.',
  },
  {
    id: 'propuesta-vencida',
    titulo: 'Propuesta vencida',
    lote: '2.3',
    pantallas: ['propuesta'],
    esperado: 'A los 5 min (urgente) pasa a vencida; aceptar devuelve 409 vencida.',
  },
  {
    id: 'urgencia-sin-respuesta',
    titulo: 'Urgencia sin respuesta',
    lote: '2.2',
    pantallas: ['pedido'],
    esperado: 'A los 20 min sin propuestas: sin_respuesta con intentos limitados.',
  },
  {
    id: 'programado',
    titulo: 'Programado',
    lote: '2.2',
    pantallas: ['pedir', 'pedido', 'agenda'],
    esperado: 'Fecha/hora como solicitud; a las 12 h sin propuestas ofrece revisar o relanzar.',
  },
  {
    id: 'obra-por-etapas',
    titulo: 'Obra por etapa',
    lote: '2.4',
    pantallas: ['trabajo', 'pago'],
    esperado: 'Etapas con monto propio; cada una se confirma y se paga por separado.',
  },
  {
    id: 'chat-fallido',
    titulo: 'Chat fallido',
    lote: '2.4',
    pantallas: ['conversacion'],
    esperado: 'Mensaje con error y "Reintentar"; reintentar no lo duplica.',
  },
  {
    id: 'cancelacion',
    titulo: 'Cancelación',
    lote: '2.4',
    pantallas: ['pedido', 'trabajo'],
    esperado: 'Cancelar pedido o trabajo agendado con motivo; queda en el historial.',
  },
  {
    id: 'efectivo-reportado',
    titulo: 'Efectivo reportado',
    lote: '2.5',
    pantallas: ['pago'],
    esperado: 'Queda "reportado", nunca "verificado" por el reporte solo.',
  },
  {
    id: 'mp-pendiente-fallido',
    titulo: 'Mercado Pago pendiente/fallido',
    lote: '2.5',
    pantallas: ['pago', 'pago-retorno'],
    esperado: 'Volver del checkout consulta el estado; pendiente y fallido se distinguen.',
  },
  {
    id: 'reclamo',
    titulo: 'Reclamo',
    lote: '2.4',
    pantallas: ['reclamo-nuevo', 'reclamo'],
    esperado: 'Categoría, detalle, adjuntos y estado con historial; sin plazos inventados.',
  },
  {
    id: 'sesion-vencida',
    titulo: 'Sesión vencida',
    lote: '2.1',
    pantallas: ['ingresar'],
    esperado: 'Vuelve al ingreso sin perder lo tipeado ni simular la acción.',
  },
  {
    id: 'baja-solicitada',
    titulo: 'Baja solicitada',
    lote: '2.1',
    pantallas: ['cuenta-baja', 'cuenta'],
    esperado: 'Estado real de la solicitud y retenciones informadas.',
  },
];
