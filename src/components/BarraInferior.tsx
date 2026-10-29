'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAVEGACION, pantalla } from '@/mapa/pantallas';
import { Icono } from './Icono';

export function BarraInferior() {
  const ruta = usePathname();
  return (
    <nav className="barra" aria-label="Secciones">
      {NAVEGACION.map((item) => {
        const destino = pantalla(item.id).ruta;
        const activa = destino === '/inicio/' ? ruta === destino : ruta.startsWith(destino);
        return (
          <Link
            key={item.id}
            href={destino as Route}
            className="barra__item"
            aria-current={activa ? 'page' : undefined}
          >
            <Icono nombre={item.icono} />
            {item.etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}
