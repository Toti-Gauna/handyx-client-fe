'use client';
// Cámara trasera del teléfono, solo cuando la persona toca el botón. Todo queda en el dispositivo: no se graba ni se
// manda nada. Al salir de la pantalla se apagan todas las pistas (la luz de la cámara se apaga).
import { useCallback, useEffect, useRef, useState } from 'react';

export type EstadoCamara =
  'apagada' | 'pidiendo' | 'lista' | 'denegada' | 'no-disponible' | 'error';

type ConLinterna = MediaTrackCapabilities & { torch?: boolean };

export function useCamara() {
  const [estado, setEstado] = useState<EstadoCamara>('apagada');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [linterna, setLinterna] = useState<{ soportada: boolean; encendida: boolean }>({
    soportada: false,
    encendida: false,
  });
  const actual = useRef<MediaStream | null>(null);
  const viva = useRef(false);

  const soltar = useCallback(() => {
    actual.current?.getTracks().forEach((t) => t.stop());
    actual.current = null;
  }, []);

  useEffect(() => {
    viva.current = true;
    return () => {
      viva.current = false;
      soltar();
    };
  }, [soltar]);

  const iniciar = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setEstado('no-disponible');
      return;
    }
    setEstado('pidiendo');
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      if (!viva.current) {
        s.getTracks().forEach((t) => t.stop());
        return;
      }
      soltar();
      actual.current = s;
      const pista = s.getVideoTracks()[0];
      const caps = (pista?.getCapabilities?.() ?? {}) as ConLinterna;
      setLinterna({ soportada: caps.torch === true, encendida: false });
      setStream(s);
      setEstado('lista');
    } catch (e) {
      if (!viva.current) return;
      const nombre = e instanceof DOMException ? e.name : '';
      setEstado(
        nombre === 'NotAllowedError' || nombre === 'SecurityError'
          ? 'denegada'
          : nombre === 'NotFoundError' || nombre === 'OverconstrainedError'
            ? 'no-disponible'
            : 'error',
      );
    }
  }, [soltar]);

  const detener = useCallback(() => {
    soltar();
    setStream(null);
    setLinterna({ soportada: false, encendida: false });
    setEstado('apagada');
  }, [soltar]);

  /** Prende o apaga la linterna del teléfono (si la cámara lo permite). Devuelve si se pudo. */
  const alternarLinterna = useCallback(async (): Promise<boolean> => {
    const pista = actual.current?.getVideoTracks()[0];
    if (!pista || !linterna.soportada) return false;
    const siguiente = !linterna.encendida;
    try {
      await pista.applyConstraints({
        advanced: [{ torch: siguiente } as MediaTrackConstraintSet],
      });
      if (viva.current) setLinterna((l) => ({ ...l, encendida: siguiente }));
      return true;
    } catch {
      return false;
    }
  }, [linterna]);

  return { estado, stream, linterna, iniciar, detener, alternarLinterna };
}
