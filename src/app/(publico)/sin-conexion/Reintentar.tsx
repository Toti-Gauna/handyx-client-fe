'use client';

import { Icono } from '@/components/Icono';

export function Reintentar() {
  return (
    <>
      <button type="button" className="hd-boton" onClick={() => window.location.reload()}>
        <Icono nombre="reintentar" />
        Reintentar
      </button>
      <a className="hd-boton hd-boton--fantasma" href="/inicio/">
        Ir al inicio
      </a>
    </>
  );
}
