// Avisos del celular (push): contextuales, opcionales y sin bloquear nada. El aviso dentro de la app siempre existe.
import { cliente, esVistaDePrueba } from './index.ts';
import { ErrorCliente } from './cliente.ts';

export type EstadoPush =
  'no_soportado' | 'ios_sin_instalar' | 'denegado' | 'concedido' | 'pendiente';

export function estadoPush(): EstadoPush {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    const ios = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);
    return ios ? 'ios_sin_instalar' : 'no_soportado';
  }
  const instalada =
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as { standalone?: boolean }).standalone === true;
  if (/iphone|ipad|ipod/i.test(navigator.userAgent) && !instalada) return 'ios_sin_instalar';
  if (Notification.permission === 'granted') return 'concedido';
  if (Notification.permission === 'denied') return 'denegado';
  return 'pendiente';
}

/** Pide el permiso y registra el dispositivo. El permiso se pide solo al tocar el botón, nunca al abrir la app. */
export async function activarPush(): Promise<EstadoPush> {
  const antes = estadoPush();
  if (antes === 'no_soportado' || antes === 'ios_sin_instalar') return antes;
  const permiso = antes === 'concedido' ? 'granted' : await Notification.requestPermission();
  avisarCambioPush();
  if (permiso !== 'granted') return estadoPush();
  if (!esVistaDePrueba)
    throw new ErrorCliente({
      codigo: 'funcion_inactiva',
      mensaje:
        'Los avisos del celular se activan en la app instalada. Mientras tanto, los ves acá adentro.',
    });
  await cliente.llamar('pushAlta', {
    cuerpo: {
      endpoint: `https://push.example.test/${crypto.randomUUID()}`,
      claves: { p256dh: 'clave-de-prueba', auth: 'clave-de-prueba' },
      rol: 'usuario',
    },
  });
  return 'concedido';
}

const oyentes = new Set<() => void>();
export const suscribirPush = (f: () => void): (() => void) => {
  oyentes.add(f);
  return () => oyentes.delete(f);
};
export const avisarCambioPush = (): void => oyentes.forEach((f) => f());
