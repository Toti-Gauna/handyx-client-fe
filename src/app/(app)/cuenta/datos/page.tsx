import type { Metadata } from 'next';
import { PantallaPlanificada } from '@/components/PantallaPlanificada';

export const metadata: Metadata = { title: 'Mis datos' };

export default function Pagina() {
  return <PantallaPlanificada id="cuenta-datos" />;
}
