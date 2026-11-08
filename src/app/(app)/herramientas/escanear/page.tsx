'use client';

import { PantallaExperimental } from '../_lib/Experimental';

export default function Escanear() {
  return (
    <PantallaExperimental
      titulo="Escanear en 3D"
      titular="Escanear un ==ambiente== entero"
      intro="Así va a ser cuando funcione:"
      porQue="Hoy el navegador de este teléfono no puede armar un modelo 3D. No hacemos uno de mentira."
      pasos={[
        {
          titulo: 'Apuntás a las paredes',
          sub: 'Con la cámara trasera, desde un costado del ambiente.',
        },
        { titulo: 'Caminás despacio', sub: 'Siguiendo las guías en pantalla.' },
        { titulo: 'Se arma el modelo', sub: 'Todo pasa dentro de tu teléfono.' },
        { titulo: 'Elegís a dónde va', sub: 'Al chat o a un pedido, solo si vos querés.' },
      ]}
      nota="Se procesaría en tu celular. No se manda nada hasta que vos elegís a dónde."
      principal={{ texto: 'Volver a las herramientas', href: '/herramientas/' }}
      secundaria={{ texto: 'Medir con la cámara', href: '/herramientas/medir/' }}
    />
  );
}
