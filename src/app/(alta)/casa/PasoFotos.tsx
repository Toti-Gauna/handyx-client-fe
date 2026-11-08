'use client';

import { useState } from 'react';
import { FotoPrivada } from '@/components/FotoPrivada';
import { Icono } from '@/components/Icono';
import type { Ambiente, Hogar } from '@/contracts/v1/hogar';
import { MAX_BYTES_MEDIA, TIPOS_MEDIA } from '@/contracts/v1/pedidos';
import { cliente } from '@/data';
import { ErrorCliente } from '@/data/cliente';
import { avisarSiSesion } from '@/data/hooks';
import { Boton, Nota } from '@/ui';
import { PantallaPaso } from '@/ui/acceso';

type Subida =
  { estado: 'subiendo' } | { estado: 'ok'; url: string } | { estado: 'error'; texto: string };

/** Hasta 6 ambientes en el alta (los demás, desde Mi hogar). */
const MAX_AMBIENTES = 6;

function validar(archivo: File): string | null {
  if (!(TIPOS_MEDIA as readonly string[]).includes(archivo.type))
    return 'Solo se aceptan fotos JPG, PNG o WebP.';
  if (archivo.size > MAX_BYTES_MEDIA) return 'La foto puede pesar hasta 5 MB.';
  return null;
}

/**
 * Paso 3 de 3 (opcional): una foto por ambiente. Se sube como foto privada (`media`) y se suma al ambiente
 * (`ambienteEditar` con su versión). Se puede saltar: las fotos se agregan después en Mi hogar.
 */
export function PasoFotos({
  hogar,
  onListo,
  onAtras,
}: {
  hogar: Hogar;
  onListo: () => void;
  onAtras: () => void;
}) {
  const [subidas, setSubidas] = useState<Record<string, Subida>>({});
  const poner = (id: string, s: Subida) => setSubidas((x) => ({ ...x, [id]: s }));
  const ambientes = hogar.ambientes.slice(0, MAX_AMBIENTES);
  const subiendo = Object.values(subidas).some((s) => s.estado === 'subiendo');

  async function subir(a: Ambiente, archivo: File | undefined) {
    if (!archivo) return;
    const invalida = validar(archivo);
    if (invalida) return poner(a.id, { estado: 'error', texto: invalida });
    poner(a.id, { estado: 'subiendo' });
    try {
      const cuerpo = new FormData();
      cuerpo.set('archivo', archivo);
      const ref = await cliente.llamar('media', { cuerpo });
      await cliente.llamar('ambienteEditar', {
        parametros: { id: a.id },
        cuerpo: { fotoIds: [...a.fotos.map((f) => f.id), ref.id], version: a.version },
      });
      poner(a.id, { estado: 'ok', url: ref.url });
    } catch (e) {
      const err = e instanceof ErrorCliente ? e : null;
      if (err) avisarSiSesion(err);
      poner(a.id, { estado: 'error', texto: err?.mensaje ?? 'No pudimos subir la foto.' });
    }
  }

  return (
    <PantallaPaso
      titulo="Una ==foto== por ambiente"
      tam={1.75}
      sub="Opcional. Sin personas ni papeles a la vista. Las fotos son privadas: nadie las ve si no las compartís."
      barra={{ titulo: 'Tu casa', sub: '3 de 3 · fotos', atras: { alTocar: onAtras } }}
      paso={3}
      total={3}
      pie={
        <>
          <Boton icono="check" deshabilitado={subiendo} onClick={onListo}>
            Terminar
          </Boton>
          <Boton variante="contorno" deshabilitado={subiendo} onClick={onListo}>
            Lo completo después
          </Boton>
        </>
      }
    >
      <div className="ds-grilla" style={{ ['--ds-gap' as string]: '0.75rem' }}>
        {ambientes.map((a) => {
          const s = subidas[a.id];
          const url = s?.estado === 'ok' ? s.url : a.fotos[0]?.url;
          return (
            <div key={a.id} className="dsa-foto">
              {url ? (
                <FotoPrivada url={url} alt={`Foto de ${a.nombre}`} />
              ) : (
                <label
                  className="dsa-foto__vacio"
                  aria-busy={s?.estado === 'subiendo' || undefined}
                >
                  <input
                    type="file"
                    accept={TIPOS_MEDIA.join(',')}
                    className="ds-solo-lector"
                    disabled={s?.estado === 'subiendo'}
                    onChange={(e) => void subir(a, e.target.files?.[0])}
                  />
                  <Icono nombre={s?.estado === 'subiendo' ? 'reloj' : 'camara'} />
                  <span className="ds-solo-lector">Sacar o elegir una foto: {a.nombre}</span>
                </label>
              )}
              <span className="dsa-foto__nombre">
                {url ? <Icono nombre="check" /> : null}
                {a.nombre}
                {url ? <span className="ds-solo-lector"> (con foto)</span> : null}
              </span>
              {s?.estado === 'subiendo' ? (
                <span className="ds-fila-enlace__sub" role="status">
                  Subiendo…
                </span>
              ) : null}
              {s?.estado === 'error' ? (
                <p className="dsa-error" role="alert">
                  <Icono nombre="alerta" />
                  {s.texto}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      {ambientes.length === 0 ? (
        <Nota tono="gris">No hay ambientes cargados todavía. Podés sumarlos en Mi hogar.</Nota>
      ) : null}
    </PantallaPaso>
  );
}
