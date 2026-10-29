import type { Metadata } from 'next';
import { PantallaPlanificada } from '@/components/PantallaPlanificada';

export const metadata: Metadata = { title: 'Reclamos' };

export default function Pagina() {
  return <PantallaPlanificada id="reclamos" />;
}
