import type { Metadata } from 'next';
import { PantallaPlanificada } from '@/components/PantallaPlanificada';

export const metadata: Metadata = { title: 'Tarifa y demo' };

export default function Pagina() {
  return <PantallaPlanificada id="cuenta-tarifa" />;
}
