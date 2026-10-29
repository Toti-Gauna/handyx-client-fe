import type { Metadata } from 'next';
import { PantallaPlanificada } from '@/components/PantallaPlanificada';

export const metadata: Metadata = { title: 'Completá tu perfil' };

export default function Pagina() {
  return <PantallaPlanificada id="perfil" />;
}
