import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PrototipoHandia } from '@/components/handia-prototipo/Shell';
import { esVistaDePrueba } from '@/data';
import '@/styles/handia-prototipo.css';

export const metadata: Metadata = { title: 'HandIA · prototipo' };

/**
 * Prototipo navegable del rediseño premium de HandIA (fase R: docs/handia-r2-direcciones.md a handia-r8-base.md).
 * Como la galería /diseno/, solo existe en la vista de prueba y no está en el mapa de pantallas: no es parte de la app.
 */
export default function PrototipoPagina() {
  if (!esVistaDePrueba) notFound();
  return <PrototipoHandia />;
}
