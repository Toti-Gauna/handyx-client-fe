'use client';

import Image from 'next/image';
import { Suspense } from 'react';
import { FocoAlNavegar } from './FocoAlNavegar';
import { BarraInferior } from './BarraInferior';
import { Icono } from './Icono';
import { Enlace } from './nav';
import { SesionProvider, useSesion } from './SesionProvider';
import { Cargando } from './ui';

function Campana() {
  const { noLeidas } = useSesion();
  return (
    <Enlace
      href="/notificaciones/"
      className="boton-icono"
      aria-label={noLeidas ? `Avisos, ${noLeidas} sin leer` : 'Avisos'}
    >
      <Icono nombre="campana" />
      {noLeidas ? (
        <span className="campana__n" aria-hidden="true">
          {noLeidas > 9 ? '9+' : noLeidas}
        </span>
      ) : null}
    </Enlace>
  );
}

/** Marco de las pantallas con sesión: proveedor de sesión, cabecera con avisos y barra inferior. */
export function MarcoApp({ children, barra }: { children: React.ReactNode; barra: boolean }) {
  return (
    <div className={barra ? 'app app--con-barra' : 'app'}>
      <a className="saltar" href="#contenido">
        Saltar al contenido
      </a>
      <FocoAlNavegar />
      <SesionProvider>
        <header className="app__cabecera">
          <Image
            className="app__logo"
            src="/img/logo-handyx.webp"
            alt="Handyx"
            width={128}
            height={28}
            priority
          />
          {barra ? <Campana /> : null}
        </header>
        <main
          id="contenido"
          className={barra ? 'app__cuerpo' : 'app__cuerpo app__cuerpo--sin-barra'}
        >
          <Suspense fallback={<Cargando />}>{children}</Suspense>
        </main>
        {barra ? <BarraInferior /> : null}
      </SesionProvider>
    </div>
  );
}
