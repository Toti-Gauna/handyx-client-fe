'use client';

import { Boton } from '@/components/ui';

export function Reintentar() {
  return (
    <div className="acciones" style={{ width: '100%' }}>
      <Boton icono="reintentar" onClick={() => window.location.reload()}>
        Reintentar
      </Boton>
      <a className="boton boton--claro" href="/inicio/">
        Ir al inicio
      </a>
    </div>
  );
}
