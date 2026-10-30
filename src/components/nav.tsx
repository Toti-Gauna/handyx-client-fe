'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { prueba } from '@/data/prueba';
import { conMovimiento, navegarConTransicion } from './transicion';

/** En la vista de prueba el escenario viaja en la URL para que recargar vuelva al mismo punto de partida. */
export function conEscenario(href: string): string {
  if (!prueba.escenario || prueba.escenario === 'nuevo-usuario' || href.includes('escenario='))
    return href;
  const [ruta = '', hash] = href.split('#');
  return `${ruta}${ruta.includes('?') ? '&' : '?'}escenario=${prueba.escenario}${hash ? `#${hash}` : ''}`;
}

/** Destino de una ruta interna con sus parámetros (`ruta('/pedidos/detalle/', { id })`). */
export function ruta(base: `/${string}`, params: Record<string, string> = {}): string {
  const q = new URLSearchParams(params).toString();
  return q ? `${base}?${q}` : base;
}

export function useIr() {
  const router = useRouter();
  return useCallback(
    (href: string, opciones: { reemplazar?: boolean } = {}) => {
      const destino = conEscenario(href) as Route;
      if (opciones.reemplazar) router.replace(destino);
      else router.push(destino);
    },
    [router],
  );
}

type PropsEnlace = Omit<React.ComponentProps<typeof Link>, 'href'> & {
  href: string;
  /** false: navega sin transición (p. ej. dentro de un flujo que ya anima lo suyo). */
  transicion?: boolean;
};

/**
 * Enlace interno. Navega con la transición de pantalla (transicion.ts); si está dentro de un elemento con
 * `data-vt-origen` (una tarjeta), esa tarjeta crece hasta el encabezado del detalle.
 */
export function Enlace({ href, onClick, transicion = true, ...resto }: PropsEnlace) {
  const ir = useIr();
  return (
    <Link
      {...resto}
      href={href as Route}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        const conPrueba =
          prueba.escenario && prueba.escenario !== 'nuevo-usuario' && !href.includes('escenario=');
        if (!conPrueba && !(transicion && conMovimiento())) return;
        e.preventDefault();
        const origen = e.currentTarget.closest<HTMLElement>('[data-vt-origen]');
        if (transicion) navegarConTransicion(() => ir(href), origen);
        else ir(href);
      }}
    />
  );
}

/** Solo rutas internas: evita redirigir a otro sitio con `?volver=`. */
export function destinoSeguro(valor: string | null | undefined, porDefecto = '/inicio/'): string {
  return valor && /^\/(?!\/)[A-Za-z0-9/_\-?=&%.#]*$/.test(valor) ? valor : porDefecto;
}
