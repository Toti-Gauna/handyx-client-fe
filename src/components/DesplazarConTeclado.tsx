'use client';
// Zonas desplazables con teclado (WCAG 2.1.1): si el contenido de una `.pantalla__scroll` no entra y adentro no hay
// nada que tome el foco (solo texto, con los botones en el pie fijo), la zona se vuelve enfocable para poder bajar con
// las flechas. Cuando deja de hacer falta, se le saca. Una sola vez para toda la app (va en src/app/layout.tsx).
import { useEffect } from 'react';

const ENFOCABLE =
  'a[href], button:not([disabled]), input:not([type=hidden]), select, textarea, summary, [tabindex]:not([tabindex="-1"])';
const MARCA = 'data-teclado-scroll';

function revisar(el: HTMLElement) {
  const propia = el.hasAttribute(MARCA);
  const desborda = el.scrollHeight > el.clientHeight + 1;
  const conFoco = [...el.querySelectorAll(ENFOCABLE)].some(
    (x) => x !== el && !x.closest('[hidden], [aria-hidden=true]'),
  );
  if (desborda && !conFoco) {
    if (propia || el.hasAttribute('tabindex')) return;
    el.setAttribute(MARCA, '');
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Contenido de la pantalla');
  } else if (propia) {
    for (const a of [MARCA, 'tabindex', 'role', 'aria-label']) el.removeAttribute(a);
  }
}

export function DesplazarConTeclado() {
  useEffect(() => {
    let cuadro = 0;
    const todo = () => {
      cancelAnimationFrame(cuadro);
      cuadro = requestAnimationFrame(() =>
        document.querySelectorAll<HTMLElement>('.pantalla__scroll').forEach(revisar),
      );
    };
    const cambios = new MutationObserver(todo);
    cambios.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('resize', todo);
    todo();
    return () => {
      cancelAnimationFrame(cuadro);
      cambios.disconnect();
      window.removeEventListener('resize', todo);
    };
  }, []);
  return null;
}
