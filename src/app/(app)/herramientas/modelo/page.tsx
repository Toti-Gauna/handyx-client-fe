'use client';

import { Icono } from '@/components/Icono';
import { PantallaExperimental } from '../_lib/Experimental';

export default function Modelo3D() {
  return (
    <PantallaExperimental
      titulo="Modelo 3D y medidas"
      titular="El ==modelo== de tu casa"
      intro="Acá vas a poder girar el modelo de un ambiente y ver sus medidas."
      porQue="Todavía no hay ningún modelo, porque escanear en 3D no funciona en este teléfono."
      arriba={
        <div className="dh-vacio">
          <Icono nombre="cubo" />
          <span>Acá aparecería el modelo.</span>
        </div>
      }
      pasos={[
        { titulo: 'Escaneás un ambiente', sub: 'Con la herramienta de escanear en 3D.' },
        { titulo: 'Lo mirás y lo girás', sub: 'Con el dedo, en tu teléfono.' },
        { titulo: 'Compartís lo que quieras', sub: 'Y dejás de compartir cuando quieras.' },
      ]}
      nota="Las medidas y el modelo se compartirían por pedido, solo si vos elegís."
      principal={{ texto: 'Medir con la cámara', href: '/herramientas/medir/' }}
      secundaria={{ texto: 'Volver a las herramientas', href: '/herramientas/' }}
    />
  );
}
