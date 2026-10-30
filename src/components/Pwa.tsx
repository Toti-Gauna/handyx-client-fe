'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { Icono } from './Icono';
import { enLinea, enLineaServidor, suscribirRed } from './red';
import {
  descartarVersion,
  hayVersionNueva,
  suscribirVersion,
  versionNueva,
  versionNuevaServidor,
} from './version';

/**
 * Registra el service worker en el build de producción (en `next dev` no, para no guardar archivos de desarrollo) y
 * avisa cuando hay una versión nueva esperando. Actualizar es decisión de la persona: nunca se recarga sola.
 */
export function RegistroSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;
    const sw = navigator.serviceWorker;
    let pidio = false;
    const ofrecer = (w: ServiceWorker) =>
      hayVersionNueva({
        actualizar: () => {
          pidio = true;
          w.postMessage({ tipo: 'activar' });
        },
      });
    const alCambiar = () => {
      if (pidio) window.location.reload();
    };
    sw.addEventListener('controllerchange', alCambiar);
    let registro: ServiceWorkerRegistration | null = null;
    const buscar = () => {
      if (document.visibilityState === 'visible') void registro?.update().catch(() => undefined);
    };
    sw.register('/sw.js', { scope: '/' })
      .then((r) => {
        registro = r;
        // Sin controlador es la primera instalación: no hay nada que actualizar.
        if (r.waiting && sw.controller) ofrecer(r.waiting);
        r.addEventListener('updatefound', () => {
          const nuevo = r.installing;
          nuevo?.addEventListener('statechange', () => {
            if (nuevo.state === 'installed' && sw.controller) ofrecer(nuevo);
          });
        });
      })
      .catch(() => undefined);
    document.addEventListener('visibilitychange', buscar);
    return () => {
      sw.removeEventListener('controllerchange', alCambiar);
      document.removeEventListener('visibilitychange', buscar);
    };
  }, []);
  return null;
}

/** "Hay una versión nueva": Actualizar (recarga) o Después. */
export function AvisoVersion() {
  const v = useSyncExternalStore(suscribirVersion, versionNueva, versionNuevaServidor);
  return (
    <div role="status" aria-live="polite" className="aviso-version-contenedor">
      {v ? (
        <div className="aviso-version">
          <Icono nombre="chispas" />
          <p>
            <strong>Hay una versión nueva de Handyx.</strong>
            <small>Actualizá cuando termines lo que estás haciendo.</small>
          </p>
          <span className="aviso-version__botones">
            <button type="button" className="aviso-version__si" onClick={v.actualizar}>
              Actualizar
            </button>
            <button type="button" className="aviso-version__no" onClick={descartarVersion}>
              Después
            </button>
          </span>
        </div>
      ) : null}
    </div>
  );
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
