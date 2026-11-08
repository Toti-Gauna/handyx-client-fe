'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { cliente } from '@/data';
import { revisarContrato } from '@/data/compatibilidad';
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

/**
 * Solo con la API real: si la versión del contrato del servidor no es la que compiló esta app, se avisa una vez (estado
 * `api_incompatible` de la bienvenida). No bloquea ni reintenta solo: el servidor y la app se publican juntos.
 */
export function AvisoContrato() {
  const [incompatible, setIncompatible] = useState(false);
  useEffect(() => {
    if (cliente.modo !== 'http') return;
    let vigente = true;
    void revisarContrato(cliente).then((r) => {
      if (vigente) setIncompatible(r === 'incompatible');
    });
    return () => {
      vigente = false;
    };
  }, []);
  return (
    <div role="status" aria-live="polite" className="aviso-red-contenedor">
      {incompatible ? (
        <p className="aviso-red">
          <Icono nombre="alerta" />
          <span>
            <strong>Handyx se está actualizando.</strong> Esta versión de la app no coincide con la
            del servidor: cerrala y volvé a abrirla en unos minutos.
          </span>
        </p>
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
