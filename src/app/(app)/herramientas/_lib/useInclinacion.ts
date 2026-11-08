'use client';
// Sensor de inclinación del teléfono (DeviceOrientation). En iPhone el permiso se pide solo al tocar el botón.
import { useCallback, useEffect, useState } from 'react';

export type EstadoSensor = 'apagado' | 'pidiendo' | 'activo' | 'denegado' | 'no-disponible';

type ConPermiso = typeof DeviceOrientationEvent & {
  requestPermission?: () => Promise<'granted' | 'denied'>;
};

const redondear = (n: number | null) => (n === null ? 0 : Math.round(n * 10) / 10);

export function useInclinacion() {
  const [estado, setEstado] = useState<EstadoSensor>('apagado');
  const [angulos, setAngulos] = useState({ beta: 0, gamma: 0 });

  const iniciar = useCallback(async () => {
    if (typeof window === 'undefined' || typeof DeviceOrientationEvent === 'undefined') {
      setEstado('no-disponible');
      return;
    }
    const pedir = (DeviceOrientationEvent as ConPermiso).requestPermission;
    if (typeof pedir === 'function') {
      setEstado('pidiendo');
      try {
        const r = await pedir.call(DeviceOrientationEvent);
        if (r !== 'granted') {
          setEstado('denegado');
          return;
        }
      } catch {
        setEstado('denegado');
        return;
      }
    }
    setEstado('activo');
  }, []);

  useEffect(() => {
    if (estado !== 'activo') return;
    let llego = false;
    const alMover = (e: DeviceOrientationEvent) => {
      if (e.beta === null && e.gamma === null) return;
      llego = true;
      setAngulos({ beta: redondear(e.beta), gamma: redondear(e.gamma) });
    };
    window.addEventListener('deviceorientation', alMover);
    // En una compu no llega ningún dato: pasados unos segundos se avisa en vez de mostrar un 0 falso.
    const espera = window.setTimeout(() => {
      if (!llego) setEstado('no-disponible');
    }, 2500);
    return () => {
      window.removeEventListener('deviceorientation', alMover);
      window.clearTimeout(espera);
    };
  }, [estado]);

  return { estado, angulos, iniciar };
}
