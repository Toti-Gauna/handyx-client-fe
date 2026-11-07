'use client';

import { useEffect } from 'react';

/** Un toque o una tecla saltean la pantalla de carga (se funde en 150 ms). */
export function SplashControl() {
  useEffect(() => {
    const splash = document.querySelector<HTMLElement>('.splash');
    if (!splash) return;
    const saltear = () => splash.classList.add('splash--salir');
    window.addEventListener('pointerdown', saltear, { once: true });
    window.addEventListener('keydown', saltear, { once: true });
    return () => {
      window.removeEventListener('pointerdown', saltear);
      window.removeEventListener('keydown', saltear);
    };
  }, []);
  return null;
}
