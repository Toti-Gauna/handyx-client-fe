'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { Icono } from './Icono';
import { enLinea, enLineaServidor, suscribirRed } from './red';

/** Registra el service worker en el build de producción (en `next dev` no, para no guardar archivos de desarrollo). */
export function RegistroSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => undefined);
  }, []);
  return null;
}

/** Aviso fijo mientras el navegador está sin conexión. No promete reenvíos: nada se encola ni se da por hecho. */
export function AvisoRed() {
  const conectado = useSyncExternalStore(suscribirRed, enLinea, enLineaServidor);
  return (
    <div role="status" aria-live="polite" className="aviso-red-contenedor">
      {conectado ? null : (
        <p className="aviso-red">
          <Icono nombre="alerta" />
          <span>
            <strong>Sin conexión.</strong> Lo que intentes hacer no se envía ni se guarda hasta que
            vuelva.
          </span>
        </p>
      )}
    </div>
  );
}
