'use client';

import { cuentaRegresiva } from '@/domain/fee';
import { useAhora } from './SesionProvider';

/** Cuenta regresiva a un instante, con la hora del servidor (no la del celular). */
export function Contador({
  hasta,
  formato = 'largo',
}: {
  hasta: string;
  formato?: 'largo' | 'corto';
}) {
  const ahora = useAhora(formato === 'corto' ? 1000 : 30_000);
  const c = cuentaRegresiva(new Date(ahora).toISOString(), hasta);
  if (c.terminada) return <span>terminó</span>;
  if (formato === 'corto') {
    const total = Math.max(0, Math.floor((Date.parse(hasta) - ahora) / 1000));
    const mm = String(Math.floor(total / 60)).padStart(2, '0');
    const ss = String(total % 60).padStart(2, '0');
    return (
      <span role="timer">
        {mm}:{ss}
      </span>
    );
  }
  return (
    <span role="timer">
      {c.dias} {c.dias === 1 ? 'día' : 'días'}, {c.horas} h
      {c.dias === 0 ? `, ${c.minutos} min` : ''}
    </span>
  );
}
