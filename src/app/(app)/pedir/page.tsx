import type { Metadata } from 'next';
import { PantallaPlanificada } from '@/components/PantallaPlanificada';

export const metadata: Metadata = { title: 'Pedir un servicio' };

export default function Pagina() {
  return <PantallaPlanificada id="pedir" />;
}
