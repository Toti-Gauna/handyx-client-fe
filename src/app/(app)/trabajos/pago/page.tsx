import type { Metadata } from 'next';
import { PantallaPlanificada } from '@/components/PantallaPlanificada';

export const metadata: Metadata = { title: 'Pago al especialista' };

export default function Pagina() {
  return <PantallaPlanificada id="pago" />;
}
