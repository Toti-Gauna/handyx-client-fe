'use client';

// Hooks de datos de las pantallas: cargar (con reintento y actualización periódica) y enviar (con clave de
// idempotencia estable entre reintentos). Las pantallas nunca llaman a `fetch` ni importan fixtures.
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import type { EndpointId, RespuestaDe } from '../contracts/v1/endpoints.ts';
import { ErrorCliente, type Llamada } from './cliente.ts';
import { emitir, escuchar } from './eventos.ts';
import { cliente } from './index.ts';

export interface Consulta<T> {
  readonly estado: 'cargando' | 'ok' | 'error';
  readonly datos: T | null;
  readonly error: ErrorCliente | null;
  /** Hay datos viejos en pantalla y se está pidiendo la versión nueva. */
  readonly refrescando: boolean;
  /** Reloj del celular (ms) al recibir los datos: sirve para calcular la diferencia con la hora del servidor. */
  readonly recibidoEn: number | null;
  readonly recargar: () => void;
}

function normalizar(e: unknown): ErrorCliente {
  return e instanceof ErrorCliente
    ? e
    : new ErrorCliente({ codigo: 'error_interno', mensaje: 'Algo salió mal. Probá de nuevo.' });
}

/** Avisa a la app de una sesión caída (el proveedor decide: pedir ingreso o redirigir). */
export function avisarSiSesion(e: ErrorCliente): void {
  if (e.codigo === 'sesion_vencida') emitir('sesion_vencida');
  else if (e.codigo === 'no_autenticado') emitir('no_autenticado');
}

interface Foto<T> {
  readonly clave: string | null;
  readonly estado: 'cargando' | 'ok' | 'error';
  readonly datos: T | null;
  readonly error: ErrorCliente | null;
  readonly recibidoEn: number | null;
}

export function useConsulta<I extends EndpointId>(
  id: I,
  llamada: Llamada<I> | null,
  opciones: { cada?: number } = {},
): Consulta<RespuestaDe<I>> {
  const clave = llamada
    ? JSON.stringify([id, llamada.parametros ?? null, llamada.consulta ?? null])
    : null;
  const [foto, setFoto] = useState<Foto<RespuestaDe<I>>>({
    clave: null,
    estado: 'cargando',
    datos: null,
    error: null,
    recibidoEn: null,
  });
  const [refrescando, setRefrescando] = useState(false);
  const [vuelta, setVuelta] = useState(0);
  const recargar = useCallback(() => {
    setRefrescando(true);
    setVuelta((v) => v + 1);
  }, []);

  useEffect(() => {
    if (!clave) return;
    const [, parametros, consulta] = JSON.parse(clave) as [
      string,
      Record<string, string> | null,
      unknown,
    ];
    const control = new AbortController();
    let activa = true;
    cliente
      .llamar(id, {
        ...(parametros ? { parametros } : {}),
        ...(consulta ? { consulta } : {}),
        senal: control.signal,
      } as unknown as Llamada<I>)
      .then((datos) => {
        if (activa) setFoto({ clave, estado: 'ok', datos, error: null, recibidoEn: Date.now() });
      })
      .catch((e: unknown) => {
        if (!activa) return;
        const error = normalizar(e);
        avisarSiSesion(error);
        // En una actualización se conservan los datos que ya están en pantalla.
        setFoto((previa) =>
          previa.clave === clave && previa.datos !== null
            ? previa
            : { clave, estado: 'error', datos: null, error, recibidoEn: null },
        );
      })
      .finally(() => {
        if (activa) setRefrescando(false);
      });
    return () => {
      activa = false;
      control.abort();
    };
  }, [id, clave, vuelta]);

  useEffect(() => {
    const baja = [escuchar('actualizar', recargar), escuchar('reingreso', recargar)];
    return () => baja.forEach((f) => f());
  }, [recargar]);

  const cada = opciones.cada;
  useEffect(() => {
    if (!cada || !clave) return;
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') recargar();
    }, cada);
    return () => clearInterval(t);
  }, [cada, clave, recargar]);

  const vigente = foto.clave === clave;
  return {
    estado: vigente ? foto.estado : 'cargando',
    datos: vigente ? foto.datos : null,
    error: vigente ? foto.error : null,
    refrescando,
    recibidoEn: vigente ? foto.recibidoEn : null,
    recargar,
  };
}

export type ResultadoEnvio<I extends EndpointId> =
  | { readonly ok: true; readonly datos: RespuestaDe<I> }
  | { readonly ok: false; readonly error: ErrorCliente };

/**
 * Envío de una escritura. La clave de idempotencia se conserva entre reintentos del mismo envío (doble tap,
 * red caída) y cambia cuando cambia el contenido (`huella`) o cuando el envío tuvo éxito.
 */
export function useEnvio() {
  const [pendiente, setPendiente] = useState(false);
  const [error, setError] = useState<ErrorCliente | null>(null);
  const enCurso = useRef(false);
  const clave = useRef<string | null>(null);
  const huellaPrevia = useRef<string | undefined>(undefined);

  const enviar = useCallback(
    async <I extends EndpointId>(
      id: I,
      llamada: Omit<Llamada<I>, 'claveIdempotencia' | 'senal'> = {},
      huella?: string,
    ): Promise<ResultadoEnvio<I> | null> => {
      if (enCurso.current) return null;
      enCurso.current = true;
      setPendiente(true);
      setError(null);
      if (huella !== huellaPrevia.current) {
        clave.current = null;
        huellaPrevia.current = huella;
      }
      clave.current ??= crypto.randomUUID();
      try {
        const datos = await cliente.llamar(id, { ...llamada, claveIdempotencia: clave.current });
        clave.current = null;
        return { ok: true, datos };
      } catch (e) {
        const err = normalizar(e);
        avisarSiSesion(err);
        setError(err);
        return { ok: false, error: err };
      } finally {
        enCurso.current = false;
        setPendiente(false);
      }
    },
    [],
  );

  return { enviar, pendiente, error, limpiar: () => setError(null) };
}

/** Parámetro del fragmento de la URL (`#t=...`): `null` en el servidor, `''` si no está. No llega al backend ni al Referer. */
export function useParametroDeFragmento(nombre: string): string | null {
  return useSyncExternalStore(
    (f) => {
      window.addEventListener('hashchange', f);
      return () => window.removeEventListener('hashchange', f);
    },
    () => new URLSearchParams(window.location.hash.slice(1)).get(nombre) ?? '',
    () => null,
  );
}
