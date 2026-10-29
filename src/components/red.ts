'use client';

// Estado de la red del navegador y aviso de instalación (PWA). Valores del navegador leídos con useSyncExternalStore.
import { emitir } from '@/data/eventos';

export function suscribirRed(aviso: () => void): () => void {
  const volvio = () => {
    aviso();
    emitir('actualizar'); // al volver la conexión, las pantallas vuelven a pedir sus datos
  };
  window.addEventListener('online', volvio);
  window.addEventListener('offline', aviso);
  return () => {
    window.removeEventListener('online', volvio);
    window.removeEventListener('offline', aviso);
  };
}
export const enLinea = () => navigator.onLine;
export const enLineaServidor = () => true;

// ── Instalación ──────────────────────────────────────────────────────────────────────────────────
interface EventoInstalar extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let pendiente: EventoInstalar | null = null;
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((f) => f());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // la instalación la decide la persona desde Cuenta, no un cartel automático
    pendiente = e as EventoInstalar;
    avisar();
  });
  window.addEventListener('appinstalled', () => {
    pendiente = null;
    avisar();
  });
}

export function suscribirInstalacion(f: () => void): () => void {
  oyentes.add(f);
  return () => oyentes.delete(f);
}
export const puedeInstalar = () => pendiente !== null;
export const puedeInstalarServidor = () => false;

export async function instalar(): Promise<boolean> {
  const e = pendiente;
  if (!e) return false;
  pendiente = null;
  avisar();
  await e.prompt();
  return (await e.userChoice).outcome === 'accepted';
}
