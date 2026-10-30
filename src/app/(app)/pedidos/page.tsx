'use client';

import { useSearchParams } from 'next/navigation';
import { Actividad, type VistaActividad } from '@/components/Actividad';

const VISTAS: readonly VistaActividad[] = ['curso', 'agenda', 'historial'];

/** Actividad (rediseño 3.7): en curso, agenda e historial. `?vista=` abre una pestaña. */
export default function Pedidos() {
  const pedida = useSearchParams().get('vista');
  const inicial = VISTAS.find((v) => v === pedida) ?? 'curso';
  return <Actividad key={inicial} inicial={inicial} />;
}
