import Image from 'next/image';
import { Suspense } from 'react';
import { FocoAlNavegar } from './FocoAlNavegar';

/** Marco de las pantallas públicas (acceso). El lote 3.2 del rediseño las rehace a pantalla completa. */
export function Marco({ children }: { children: React.ReactNode }) {
  return (
    <div className="hx">
      <a className="saltar" href="#contenido">
        Saltar al contenido
      </a>
      <FocoAlNavegar />
      <div className="hx-app">
        <header className="app-cabecera app-cabecera--blanca">
          <div className="app-cabecera__fila">
            <span className="app-logo">
              <Image src="/img/logo-handyx.webp" alt="Handyx" width={720} height={158} priority />
              <small aria-hidden="true">Soluciones, no problemas</small>
            </span>
          </div>
        </header>
        <main id="contenido" className="hx-cuerpo">
          <Suspense>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}
