'use client';

import { PantallaExperimental } from '../_lib/Experimental';

export default function VerEnAr() {
  return (
    <PantallaExperimental
      titulo="Ver en AR"
      titular="Ver un equipo ==en tu pared=="
      intro="Así va a ser cuando funcione:"
      porQue="Hoy este teléfono no puede mostrar objetos sobre la cámara. No simulamos cómo queda."
      pasos={[
        { titulo: 'Elegís un equipo propuesto', sub: 'Desde la propuesta de un especialista.' },
        { titulo: 'Apuntás a la pared', sub: 'Con la cámara trasera.' },
        {
          titulo: 'Lo ves con su tamaño real',
          sub: 'Con las medidas que informó el especialista.',
        },
        { titulo: 'Volvés a la propuesta', sub: 'Y decidís con calma.' },
      ]}
      nota="La cámara se usaría solo en esa pantalla y no se graba nada."
      principal={{ texto: 'Volver a las herramientas', href: '/herramientas/' }}
      secundaria={{ texto: 'Medir con la cámara', href: '/herramientas/medir/' }}
    />
  );
}
