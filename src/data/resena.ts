// Reseña de un trabajo finalizado (contrato draft.4: `resena` y `resenaCrear`). Una por trabajo. Se publica con el
// nombre y la inicial del apellido; el comentario es opcional y sale sin datos personales (se tachan antes de enviar).
// Acá solo vive lo que no es de red: los textos de cada opción y cómo se arma lo que se manda.
import type { z } from 'zod';
import type { DESTACADOS_RESENA, ResenaEntrada } from '@/contracts/v1/servicio';
import { tacharDatosPersonales } from '@/domain/handia';

export type Destacado = (typeof DESTACADOS_RESENA)[number];
export type EntradaResena = z.output<typeof ResenaEntrada>;

export const DESTACADOS_TEXTO: Record<Destacado, string> = {
  puntual: 'Puntual',
  prolijo: 'Prolijo',
  explico_todo: 'Explicó todo',
  buen_precio: 'Buen precio',
  llego_tarde: 'Llegó tarde',
  dejo_sucio: 'Dejó desorden',
  no_explico: 'No explicó',
};

export const POSITIVOS: readonly Destacado[] = ['puntual', 'prolijo', 'explico_todo', 'buen_precio'];
export const NEGATIVOS: readonly Destacado[] = ['llego_tarde', 'dejo_sucio', 'no_explico'];

export const TEXTO_PUNTAJE: Record<number, string> = {
  1: 'Muy mal',
  2: 'Mal',
  3: 'Regular',
  4: 'Muy bien',
  5: '¡Excelente!',
};

/** Con 4 o 5 estrellas se ofrece lo que estuvo bien; con 3 o menos, lo que estuvo mal. */
export const opcionesPara = (puntaje: number): readonly Destacado[] =>
  puntaje >= 4 ? POSITIVOS : puntaje >= 1 ? NEGATIVOS : [];

/**
 * Lo que se manda: solo los destacados que corresponden al puntaje, el comentario sin teléfonos, emails ni documentos
 * y `null` si quedó vacío.
 */
export function prepararResena(
  puntaje: number,
  destacados: readonly Destacado[],
  comentario: string,
): EntradaResena {
  const validos = opcionesPara(puntaje);
  const limpio = tacharDatosPersonales(comentario.trim()).texto.trim().slice(0, 500);
  return {
    puntaje,
    destacados: destacados.filter((d) => validos.includes(d)),
    comentario: limpio === '' ? null : limpio,
  };
}
