'use client';

import { useEffect } from 'react';
import { alMontarTitulo } from './foco';

/** Título de la pestaña por pantalla: lo leen el anunciador de rutas de Next y el historial del navegador. */
export function TituloDocumento({ texto }: { texto: string }) {
  useEffect(() => {
    document.title = `${texto} · Handyx`;
    alMontarTitulo();
  }, [texto]);
  return null;
}
