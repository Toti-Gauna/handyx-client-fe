import type { Metadata } from 'next';
import { PantallaPlanificada } from '@/components/PantallaPlanificada';

export const metadata: Metadata = { title: 'Cambiar turno o condiciones' };

export default function Pagina() {
  return <PantallaPlanificada id="trabajo-cambiar" />;
}
