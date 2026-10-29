import type { Metadata } from 'next';
import { PantallaPlanificada } from '@/components/PantallaPlanificada';

export const metadata: Metadata = { title: 'Preferencias de avisos' };

export default function Pagina() {
  return <PantallaPlanificada id="cuenta-notificaciones" />;
}
