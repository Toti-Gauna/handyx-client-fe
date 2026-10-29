'use client';

import { usePathname } from 'next/navigation';
import { NAVEGACION, pantalla } from '@/mapa/pantallas';
import { Icono } from './Icono';
import { Enlace } from './nav';

/** Rutas de cada pestaña: el detalle de un pedido, de un trabajo o de una propuesta cuelga de "Pedidos". */
const PERTENECE: Record<string, readonly string[]> = {
  inicio: ['/inicio/', '/pedir/'],
  pedidos: ['/pedidos/', '/propuestas/', '/trabajos/', '/pagos/', '/reclamos/'],
  chats: ['/chats/'],
  agenda: ['/agenda/'],
  cuenta: ['/cuenta/', '/ayuda/', '/notificaciones/'],
};

export function BarraInferior() {
  const ruta = usePathname();
  return (
    <nav className="barra" aria-label="Secciones">
      {NAVEGACION.map((item) => {
        const activa = (PERTENECE[item.id] ?? [pantalla(item.id).ruta]).some((prefijo) =>
          ruta.startsWith(prefijo),
        );
        return (
          <Enlace
            key={item.id}
            href={pantalla(item.id).ruta}
            className="barra__item"
            aria-current={activa ? 'page' : undefined}
          >
            <Icono nombre={item.icono} />
            {item.etiqueta}
          </Enlace>
        );
      })}
    </nav>
  );
}
