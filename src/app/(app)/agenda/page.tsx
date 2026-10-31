'use client';

import { Actividad } from '@/components/Actividad';

/** La agenda vive en Actividad (rediseño 3.7): esta ruta abre esa pestaña. */
export default function Agenda() {
  return <Actividad inicial="agenda" />;
}
