// Soporte por chat con el equipo de Handy (rediseño 3.7, decisión 5). El contrato v1 no tiene la conversación con
// Operations (Fase 4.4, reusa Conversacion con otro interlocutor): en la vista de prueba responde un mensaje simulado y
// rotulado; con la API real la pantalla avisa que todavía no está disponible y ofrece Ayuda y reclamos.
import { ErrorCliente } from './cliente.ts';
import { esVistaDePrueba } from './index.ts';

export const soporteDisponible = esVistaDePrueba;

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Manda un mensaje al equipo. Devuelve la respuesta (en la vista de prueba, un acuse de recibo simulado). */
export async function escribirASoporte(texto: string): Promise<string> {
  if (!soporteDisponible)
    throw new ErrorCliente({
      codigo: 'funcion_inactiva',
      mensaje: 'El chat con el equipo todavía no está disponible.',
    });
  await esperar(900);
  return texto.length > 0
    ? 'Recibimos tu mensaje. Una persona del equipo te va a responder por acá; no podemos prometer un plazo. Si es sobre un trabajo, también podés abrir un reclamo.'
    : '';
}
