import Image from 'next/image';
import { Suspense } from 'react';
import { FocoAlNavegar } from './FocoAlNavegar';

/** Columna de app: cabecera con el logo, contenido y (con sesión) la barra azul inferior. */
export function Marco({ children, barra = false }: { children: React.ReactNode; barra?: boolean }) {
  return (
    <div className={barra ? 'app app--con-barra' : 'app'}>
      <a className="saltar" href="#contenido">
        Saltar al contenido
      </a>
      <FocoAlNavegar />
      <header className="app__cabecera">
        <Image
          className="app__logo"
          src="/img/logo-handyx.webp"
          alt="Handyx"
          width={128}
          height={28}
          priority
        />
      </header>
      <main id="contenido" className={barra ? 'app__cuerpo' : 'app__cuerpo app__cuerpo--sin-barra'}>
        <Suspense>{children}</Suspense>
      </main>
    </div>
  );
}
