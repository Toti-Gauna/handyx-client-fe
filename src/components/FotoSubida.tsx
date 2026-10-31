'use client';

import { useRef, useState } from 'react';
import { MAX_BYTES_MEDIA, TIPOS_MEDIA } from '@/contracts/v1/pedidos';
import { cliente } from '@/data';
import { ErrorCliente } from '@/data/cliente';
import { avisarSiSesion } from '@/data/hooks';
import { FotoPrivada } from './FotoPrivada';
import { Aviso, Boton } from './ui';
import { Icono } from './Icono';

interface Item {
  readonly clave: string;
  readonly archivo: File;
  estado: 'subiendo' | 'ok' | 'error';
  id?: string;
  url?: string;
  error?: string;
}

/**
 * Estado de las fotos que se suben: vive en quien lo crea, así un flujo por pasos no pierde las fotos al cambiar de paso
 * (se lo pasa a `FotoSubida` con `estado`).
 */
export function useFotos(onCambio: (ids: string[]) => void, max = 5) {
  const [items, setItems] = useState<Item[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);

  function publicar(lista: Item[]) {
    setItems(lista);
    onCambio(lista.filter((i) => i.estado === 'ok' && i.id).map((i) => i.id as string));
  }

  async function subir(item: Item, base: Item[]) {
    const cuerpo = new FormData();
    cuerpo.set('archivo', item.archivo);
    try {
      const ref = await cliente.llamar('media', { cuerpo });
      publicar(
        base.map((x) =>
          x.clave === item.clave ? { ...x, estado: 'ok', id: ref.id, url: ref.url } : x,
        ),
      );
    } catch (e) {
      const err = e instanceof ErrorCliente ? e : null;
      if (err) avisarSiSesion(err);
      publicar(
        base.map((x) =>
          x.clave === item.clave
            ? { ...x, estado: 'error', error: err?.mensaje ?? 'No pudimos subir la foto.' }
            : x,
        ),
      );
    }
  }

  function elegir(archivos: FileList | null) {
    if (!archivos?.length) return false;
    setAviso(null);
    let lista = [...items];
    for (const archivo of Array.from(archivos)) {
      if (lista.length >= max) {
        setAviso(`Podés agregar hasta ${max} fotos.`);
        break;
      }
      if (!(TIPOS_MEDIA as readonly string[]).includes(archivo.type)) {
        setAviso('Solo se aceptan fotos JPG, PNG o WebP.');
        continue;
      }
      if (archivo.size > MAX_BYTES_MEDIA) {
        setAviso('Cada foto puede pesar hasta 5 MB.');
        continue;
      }
      const item: Item = { clave: crypto.randomUUID(), archivo, estado: 'subiendo' };
      lista = [...lista, item];
      void subir(item, lista);
    }
    publicar(lista);
    return true;
  }

  return {
    items,
    aviso,
    max,
    elegir,
    quitar: (clave: string) => publicar(items.filter((x) => x.clave !== clave)),
    reintentar: (i: Item) =>
      void subir(
        { ...i, estado: 'subiendo' },
        items.map((x) => (x.clave === i.clave ? { ...x, estado: 'subiendo' } : x)),
      ),
  };
}

/** Fotos privadas (JPG, PNG o WebP, hasta 5 MB). Cada una se sube sola; si falla se puede reintentar o quitar. */
export function FotoSubida({
  max = 5,
  onCambio,
  etiqueta = 'Agregar fotos',
  estado,
}: {
  max?: number;
  onCambio: (ids: string[]) => void;
  etiqueta?: string;
  estado?: ReturnType<typeof useFotos>;
}) {
  const interno = useFotos(onCambio, max);
  const { items, aviso, elegir, quitar, reintentar } = estado ?? interno;
  const entrada = useRef<HTMLInputElement>(null);

  return (
    <div>
      {items.length ? (
        <ul className="fotos">
          {items.map((i) => (
            <li key={i.clave} className={`foto${i.estado === 'error' ? ' foto--error' : ''}`}>
              {i.estado === 'ok' && i.url ? (
                <FotoPrivada url={i.url} alt={`Foto ${i.archivo.name}`} />
              ) : i.estado === 'subiendo' ? (
                <span role="status">Subiendo…</span>
              ) : (
                <span role="alert">
                  No se subió
                  <br />
                  <button type="button" className="enlace-tarjeta" onClick={() => reintentar(i)}>
                    Reintentar
                  </button>
                </span>
              )}
              <button
                type="button"
                className="foto__quitar"
                aria-label={`Quitar ${i.archivo.name}`}
                onClick={() => quitar(i.clave)}
              >
                <Icono nombre="cerrar" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      {aviso ? (
        <Aviso tipo="alerta" rol="status">
          {aviso}
        </Aviso>
      ) : null}
      {items.some((i) => i.estado === 'error') ? (
        <Aviso tipo="error">{items.find((i) => i.estado === 'error')?.error}</Aviso>
      ) : null}
      <input
        ref={entrada}
        type="file"
        accept={TIPOS_MEDIA.join(',')}
        multiple
        hidden
        onChange={(e) => {
          if (elegir(e.target.files) && entrada.current) entrada.current.value = '';
        }}
        aria-label={etiqueta}
      />
      {items.length < (estado ?? interno).max ? (
        <Boton variante="claro" icono="camara" chico onClick={() => entrada.current?.click()}>
          {etiqueta}
        </Boton>
      ) : null}
      <p className="campo__ayuda">
        Hasta {max} fotos de hasta 5 MB. Quedan privadas: solo las ven quienes participan del
        pedido.
      </p>
    </div>
  );
}
