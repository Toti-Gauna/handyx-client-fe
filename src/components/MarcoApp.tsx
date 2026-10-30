'use client';

import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import { FocoAlNavegar } from './FocoAlNavegar';
import { NavApp } from './hx';
import { SesionProvider } from './SesionProvider';
import { Cargando } from './ui';

/**
 * Marco de las pantallas con sesión (rediseño, docs/rediseno.md §3): sin cabecera fija. Cada pantalla trae lo suyo
 * (Inicio, su cabecera con dirección y avisos; las internas, la barra "← Título") y abajo va la barra de pestañas.
 * Se comporta como una app nativa: la pantalla ocupa el alto y solo se desplaza su cuerpo.
 */
/** Pantallas a pantalla completa, sin la barra de pestañas (chats y asistentes, como en la demo). */
const SIN_BARRA = [
  '/handia/',
  '/pedir/',
  '/propuestas/contraoferta/',
  '/trabajos/resena/',
  '/reclamos/nuevo/',
  '/trabajos/cambiar/',
  '/chats/conversacion/',
  '/soporte/',
];

export function MarcoApp({ children, barra }: { children: React.ReactNode; barra: boolean }) {
  const ruta = usePathname();
  const conBarra = barra && !SIN_BARRA.some((r) => ruta.startsWith(r));
  return (
    <div className="hx">
      <a className="saltar" href="#contenido">
        Saltar al contenido
      </a>
      <FocoAlNavegar />
      <SesionProvider>
        <div className="hx-app">
          <main id="contenido" className="hx-cuerpo">
            <Suspense fallback={<Cargando />}>{children}</Suspense>
          </main>
          {conBarra ? <NavApp /> : null}
        </div>
      </SesionProvider>
    </div>
  );
}
