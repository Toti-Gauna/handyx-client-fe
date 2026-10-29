import type { Metadata } from 'next';
import { PantallaPlanificada } from '@/components/PantallaPlanificada';

export const metadata: Metadata = { title: 'Eliminar cuenta' };

export default function Pagina() {
  return <PantallaPlanificada id="cuenta-baja" />;
}
