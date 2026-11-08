'use client';

import { Boton } from '@/ui';

export function Reintentar() {
  return (
    <>
      <Boton icono="reintentar" onClick={() => window.location.reload()}>
        Reintentar
      </Boton>
      <a className="ds-boton ds-boton--contorno ds-boton--ancho" href="/inicio/">
        Ir al inicio
      </a>
    </>
  );
}
