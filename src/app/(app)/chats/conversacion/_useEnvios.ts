'use client';

import { useState } from 'react';
import { TIPOS_MEDIA } from '@/contracts/v1/pedidos';
import { cliente } from '@/data';
import { ErrorCliente } from '@/data/cliente';
import { avisarSiSesion } from '@/data/hooks';

export interface Saliente {
  readonly clienteId: string;
  readonly texto?: string;
  readonly archivo?: File;
  mediaId?: string;
  estado: 'enviando' | 'error';
  error?: string;
  readonly creadoEn: number;
}

const MAX_FOTO = 5 * 1024 * 1024;

/**
 * Lo que la persona manda: texto o foto. Cada envío lleva su `clienteId`: reintentar el mismo no lo duplica. Hasta
 * que el servidor lo devuelve en la lista, queda como «enviando» o «no se envió» (con reintentar y descartar).
 */
export function useEnvios(id: string | null, alEnviar: () => void) {
  const [salientes, setSalientes] = useState<Saliente[]>([]);

  async function mandar(s: Saliente) {
    if (!id) return;
    setSalientes((xs) =>
      xs.map((x) =>
        x.clienteId === s.clienteId ? { ...x, estado: 'enviando', error: undefined as never } : x,
      ),
    );
    try {
      let mediaId = s.mediaId;
      if (s.archivo && !mediaId) {
        const f = new FormData();
        f.set('archivo', s.archivo);
        mediaId = (await cliente.llamar('media', { cuerpo: f })).id;
        s.mediaId = mediaId;
      }
      const cuerpo = mediaId
        ? { clienteId: s.clienteId, tipo: 'foto' as const, mediaId }
        : { clienteId: s.clienteId, tipo: 'texto' as const, texto: s.texto ?? '' };
      await cliente.llamar('mensajeEnviar', {
        parametros: { id },
        cuerpo,
        claveIdempotencia: s.clienteId,
      });
      alEnviar();
    } catch (e) {
      const err = e instanceof ErrorCliente ? e : null;
      if (err) avisarSiSesion(err);
      setSalientes((xs) =>
        xs.map((x) =>
          x.clienteId === s.clienteId
            ? { ...x, estado: 'error', error: err?.mensaje ?? 'No pudimos enviarlo.' }
            : x,
        ),
      );
    }
  }

  function encolar(base: Pick<Saliente, 'texto' | 'archivo'>) {
    const s: Saliente = {
      clienteId: crypto.randomUUID(),
      estado: 'enviando',
      creadoEn: Date.now(),
      ...base,
    };
    setSalientes((xs) => [...xs, s]);
    void mandar(s);
  }

  /** Devuelve el motivo si la foto no sirve; si no, la manda. */
  function mandarFoto(archivo: File): string | null {
    if (!(TIPOS_MEDIA as readonly string[]).includes(archivo.type))
      return 'Solo se aceptan fotos JPG, PNG o WebP.';
    if (archivo.size > MAX_FOTO) return 'La foto puede pesar hasta 5 MB.';
    encolar({ archivo });
    return null;
  }

  return {
    salientes,
    mandar,
    mandarTexto: (texto: string) => encolar({ texto }),
    mandarFoto,
    descartar: (clienteId: string) =>
      setSalientes((xs) => xs.filter((x) => x.clienteId !== clienteId)),
  };
}
