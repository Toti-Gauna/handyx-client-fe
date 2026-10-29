import type { Metadata } from 'next';
import { PantallaPlanificada } from '@/components/PantallaPlanificada';

export const metadata: Metadata = { title: 'Nuevo reclamo' };

export default function Pagina() {
  return <PantallaPlanificada id="reclamo-nuevo" />;
}
