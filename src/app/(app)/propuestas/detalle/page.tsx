import type { Metadata } from 'next';
import { PantallaPlanificada } from '@/components/PantallaPlanificada';

export const metadata: Metadata = { title: 'Propuesta' };

export default function Pagina() {
  return <PantallaPlanificada id="propuesta" />;
}
