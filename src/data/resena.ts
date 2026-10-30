// Reseña de un trabajo terminado (rediseño 3.6, decisión 2). El contrato v1 todavía no tiene `resenaCrear` (Fase 4.4):
// en la vista de prueba queda guardada en memoria; con la API real la pantalla avisa que todavía no está disponible.
// El comentario va sin datos personales (se tachan antes de enviar), y el promedio solo se mostrará con un mínimo de
// reseñas reales.
import { tacharDatosPersonales } from '@/domain/handia';
import { ErrorCliente } from './cliente.ts';
import { esVistaDePrueba } from './index.ts';

export const resenaDisponible = esVistaDePrueba;

export interface Resena {
  readonly trabajoId: string;
  readonly estrellas: 1 | 2 | 3 | 4 | 5;
  readonly destacados: readonly string[];
  readonly comentario: string;
}

const enviadas = new Map<string, Resena>();
const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const resenaDe = (trabajoId: string): Resena | null => enviadas.get(trabajoId) ?? null;

/** Manda la reseña. Devuelve lo que quedó guardado (con el comentario ya sin datos personales). */
export async function enviarResena(r: Resena): Promise<Resena> {
  if (!resenaDisponible)
    throw new ErrorCliente({
      codigo: 'funcion_inactiva',
      mensaje: 'Las reseñas todavía no están disponibles. Gracias igual por querer contarnos.',
    });
  const limpia = { ...r, comentario: tacharDatosPersonales(r.comentario.trim()).texto };
  await esperar(500);
  enviadas.set(r.trabajoId, limpia);
  return limpia;
}
