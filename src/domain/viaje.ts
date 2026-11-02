// Textos del viaje en vivo (lote 4.7, contrato 1.0.0-draft.2). Única excepción a "sin tiempos de llegada" (decisión de Ignacio del
// 31/10): la llegada estimada y lo que falta salen **del servidor** y solo se muestran mientras el especialista comparte
// su ubicación. Acá no se calcula ningún tiempo: solo se da formato a lo que mandó la API.
import type { z } from 'zod';
import type { Viaje } from '../contracts/v1/viaje.ts';
import { horaDeInstante } from './fechas.ts';

type V = z.output<typeof Viaje>;

/** Error mínimo que necesitan los textos (el `ErrorCliente` de la capa de datos lo cumple). */
interface ErrorViaje {
  readonly codigo: string;
  readonly mensaje: string;
  readonly recuperable: boolean;
}

/** "unos 350 m" / "1,2 km": aproximado a propósito (la posición tiene su margen). */
export function distanciaAprox(metros: number): string {
  if (metros < 1000) return `unos ${Math.max(50, Math.round(metros / 50) * 50)} m`;
  return `${(Math.round(metros / 100) / 10).toLocaleString('es-AR')} km`;
}

export interface TextosViaje {
  /** Para el chip del mapa; `null` = el horario acordado de siempre. */
  readonly chip: string | null;
  /** Nota fija del paso (región `status`: cambia solo cuando cambia el estado del viaje). */
  readonly nota: string;
  /** Lo que falta y la llegada estimada, sin anunciar cada actualización. */
  readonly detalle: string | null;
  /** Aviso de que se cortó la transmisión y se consulta cada unos segundos. */
  readonly corte: string | null;
}

const AL_LLEGAR = 'Cuando llegue, lo marca él desde su celular.';

export function textosViaje(
  viaje: V | null,
  error: ErrorViaje | null,
  enVivo: boolean,
): TextosViaje {
  const corte = error?.recuperable && !enVivo ? error.mensaje : null;
  if (error?.codigo === 'conflicto')
    return {
      chip: null,
      nota: `Va en el horario que acordaron. Este pedido no tiene un punto en el mapa para seguir el viaje. ${AL_LLEGAR}`,
      detalle: null,
      corte: null,
    };
  if (viaje?.estado === 'compartiendo') {
    const hora = viaje.llegadaEstimada ? horaDeInstante(viaje.llegadaEstimada) : null;
    const falta =
      viaje.distanciaRestanteM !== null
        ? `Faltan ${distanciaAprox(viaje.distanciaRestanteM)}`
        : null;
    const partes = [falta, hora ? `llegada estimada ${hora}` : null].filter(Boolean);
    return {
      chip: hora ? `Llegada estimada ${hora}` : null,
      nota: `Está compartiendo su ubicación mientras viene. ${AL_LLEGAR}`,
      detalle: partes.length
        ? `${partes.join(' · ')}. La estima Handyx con su recorrido y puede variar con el tránsito.`
        : null,
      corte,
    };
  }
  if (viaje?.estado === 'sin_compartir')
    return {
      chip: null,
      nota: `Va en el horario que acordaron. Todavía no compartió su ubicación. ${AL_LLEGAR}`,
      detalle: null,
      corte,
    };
  return { chip: null, nota: `Va en el horario que acordaron. ${AL_LLEGAR}`, detalle: null, corte };
}
