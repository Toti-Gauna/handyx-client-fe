import type { Metadata } from 'next';
import { PantallaPlanificada } from '@/components/PantallaPlanificada';

export const metadata: Metadata = { title: 'Volviste del pago' };

export default function Pagina() {
  return <PantallaPlanificada id="pago-retorno" />;
}
