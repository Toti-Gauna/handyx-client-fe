'use client';

import { useSearchParams } from 'next/navigation';
import { FlujoCodigo } from './FlujoCodigo';

const AVISOS: Record<string, string> = {
  sesion: 'Tu sesión venció. Entrá de nuevo para seguir donde estabas.',
};

/** «Ya tengo cuenta»: acceso con código por email (sin contraseña). `?motivo=` explica por qué se volvió acá. */
export default function Ingresar() {
  const motivo = useSearchParams().get('motivo');
  return <FlujoCodigo modo="ingreso" aviso={motivo ? AVISOS[motivo] : undefined} />;
}
