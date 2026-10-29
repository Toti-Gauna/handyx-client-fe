import type { Metadata } from 'next';
import { PantallaPlanificada } from '@/components/PantallaPlanificada';

export const metadata: Metadata = { title: 'Cuenta' };

export default function Pagina() {
  return <PantallaPlanificada id="cuenta" />;
}
