'use client';

// Atajos para la dirección del pedido (rediseño 3.8): la principal del perfil y las guardadas. Solo aparecen si hay más
// de una; elegir una completa el formulario, que se puede seguir editando.
import { useSyncExternalStore } from 'react';
import type { Ubicacion } from '@/contracts/v1/cuenta';
import {
  direccionesGuardadas,
  direccionesServidor,
  suscribirDirecciones,
} from '@/data/direcciones';
import { Icono } from './Icono';
import { useSesion } from './SesionProvider';

export function ElegirDireccion({
  actual,
  onElegir,
}: {
  actual: string;
  onElegir: (u: Ubicacion) => void;
}) {
  const { sesion } = useSesion();
  const otras = useSyncExternalStore(
    suscribirDirecciones,
    direccionesGuardadas,
    direccionesServidor,
  );
  const principal = sesion.perfil.ubicacion;
  const opciones = [
    ...(principal
      ? [{ id: 'principal', nombre: 'Principal', icono: 'casa' as const, u: principal }]
      : []),
    ...otras.map((d) => ({
      id: d.id,
      nombre: d.nombre,
      icono:
        d.tipo === 'trabajo'
          ? ('maletin' as const)
          : d.tipo === 'casa'
            ? ('casa' as const)
            : ('pin' as const),
      u: d.ubicacion,
    })),
  ];
  if (opciones.length < 2) return null;
  return (
    <fieldset className="du-elegir-direccion">
      <legend className="hd-sobre du-sobre">Tus direcciones</legend>
      <div className="hd-chips">
        {opciones.map((o) => (
          <button
            key={o.id}
            type="button"
            className="hd-chip hd-chip--tinte du-chip-voto"
            aria-pressed={o.u.direccion === actual}
            onClick={() => onElegir(o.u)}
          >
            <Icono nombre={o.icono} />
            {o.nombre}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
