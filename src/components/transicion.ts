'use client';

// Transiciones entre pantallas (rediseño 3.9, §7 "transiciones compartidas"): con la View Transitions API del
// navegador, la pantalla nueva aparece con un fundido corto y, si se tocó una tarjeta, la tarjeta "crece" hasta el
// encabezado del detalle (el elemento con `data-vt-destino`). Sin soporte o con "reducir movimiento", se navega igual,
// sin animación. Nunca demora una acción: si la pantalla nueva tarda, la transición se suelta a los pocos cientos de ms.

type DocumentoVT = Document & {
  startViewTransition?: (cb: () => Promise<void>) => { finished: Promise<void> };
};

const ESPERA_RUTA_MS = 600;
const ESPERA_DESTINO_MS = 250;
const CLASE_ENTRANDO = 'vt-entrando';

export const conMovimiento = () =>
  typeof window !== 'undefined' &&
  typeof (document as DocumentoVT).startViewTransition === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Resuelve cuando cambia la URL (y, si hay tarjeta, cuando aparece su destino), o al vencer el tiempo. */
function esperarPantallaNueva(desde: string, conDestino: boolean): Promise<void> {
  return new Promise((listo) => {
    const inicio = performance.now();
    let cambioEn: number | null = null;
    const mirar = () => {
      const ahora = performance.now();
      if (cambioEn === null && location.href !== desde) cambioEn = ahora;
      const destino = !conDestino || document.querySelector('[data-vt-destino]') !== null;
      if (
        ahora - inicio > ESPERA_RUTA_MS ||
        (cambioEn !== null && (destino || ahora - cambioEn > ESPERA_DESTINO_MS))
      )
        // Un respiro para que React termine de aplicar la pantalla nueva.
        setTimeout(listo, 20);
      else setTimeout(mirar, 16);
    };
    // Con temporizadores, no con requestAnimationFrame: durante la transición el navegador no pinta cuadros.
    setTimeout(mirar, 16);
  });
}

/**
 * Navega con transición. `origen`: la tarjeta tocada (su captura se transforma en el destino del detalle).
 */
export function navegarConTransicion(navegar: () => void, origen?: HTMLElement | null): void {
  if (!conMovimiento()) {
    navegar();
    return;
  }
  const raiz = document.documentElement;
  if (origen) origen.style.setProperty('view-transition-name', 'hx-tarjeta');
  const desde = location.href;
  const t = (document as DocumentoVT).startViewTransition!(async () => {
    // La captura de la pantalla vieja ya está tomada: desde acá, el destino lleva el nombre compartido.
    origen?.style.removeProperty('view-transition-name');
    if (origen) raiz.classList.add(CLASE_ENTRANDO);
    navegar();
    await esperarPantallaNueva(desde, Boolean(origen));
  });
  void t.finished.finally(() => raiz.classList.remove(CLASE_ENTRANDO));
}
