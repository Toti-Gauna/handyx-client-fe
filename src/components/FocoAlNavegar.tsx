'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { alNavegar } from './foco';

/** Mueve el foco al h1 de la pantalla nueva después de navegar (no en la primera carga). */
export function FocoAlNavegar() {
  const ruta = usePathname();
  const anterior = useRef(ruta);
  useEffect(() => {
    if (anterior.current === ruta) return;
    anterior.current = ruta;
    alNavegar();
  }, [ruta]);
  return null;
}
