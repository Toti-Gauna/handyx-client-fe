import type { Metadata } from 'next';
import { PantallaPlanificada } from '@/components/PantallaPlanificada';

export const metadata: Metadata = { title: 'Nueva contraseña' };

export default function Pagina() {
  return <PantallaPlanificada id="recuperar-nueva" />;
}
