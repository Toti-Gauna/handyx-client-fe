'use client';

import { AlgoSeRompio } from '@/components/Sistema';

/** Si una pantalla falla al dibujarse: «Algo se rompió», con reintentar (no se pierde lo ya enviado). */
export default function ErrorDePantalla({ reset }: { error: Error; reset: () => void }) {
  return <AlgoSeRompio onReintentar={reset} />;
}
