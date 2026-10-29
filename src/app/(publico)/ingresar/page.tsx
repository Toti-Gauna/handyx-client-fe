import type { Metadata } from 'next';
import { PantallaPlanificada } from '@/components/PantallaPlanificada';

export const metadata: Metadata = { title: 'Ingresar' };

export default function Pagina() {
  return <PantallaPlanificada id="ingresar" />;
}
