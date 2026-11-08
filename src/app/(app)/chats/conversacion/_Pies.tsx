'use client';

import type { RefObject } from 'react';
import { TIPOS_MEDIA } from '@/contracts/v1/pedidos';
import { Nota, Pastilla } from '@/ui';
import { BarraAcciones, Escribir } from '@/ui/mensajes';

/** Abajo en selección: lo que se puede hacer con los mensajes elegidos (solo copiar es real). */
export function PieSeleccion({
  cantidad,
  aviso,
  onCopiar,
  onResponder,
  onAviso,
}: {
  cantidad: number;
  aviso: string | null;
  onCopiar: () => void;
  onResponder: () => void;
  onAviso: (texto: string) => void;
}) {
  return (
    <div>
      <p className="ds-m-nota-centro" role="status">
        {aviso ?? 'Borrar solo quita tus mensajes. Las tarjetas no se borran.'}
      </p>
      <BarraAcciones
        cantidad={cantidad}
        acciones={[
          { texto: 'Copiar', icono: 'copiar', deshabilitada: !cantidad, onClick: onCopiar },
          {
            texto: 'Reenviar',
            icono: 'reenviar',
            onClick: () => onAviso('Reenviar todavía no está disponible.'),
          },
          { texto: 'Responder', icono: 'chat', deshabilitada: !cantidad, onClick: onResponder },
          {
            texto: 'Borrar los míos',
            icono: 'tacho',
            rojo: true,
            onClick: () => onAviso('Todavía no se pueden borrar mensajes.'),
          },
        ]}
      />
    </div>
  );
}

/** Abajo en el chat: respuestas rápidas (completan el texto, no mandan nada) y el redactor. */
export function PieEscribir({
  texto,
  onTexto,
  onEnviar,
  onSumar,
  rapidas,
  aviso,
  entradaFoto,
  onFoto,
}: {
  texto: string;
  onTexto: (t: string) => void;
  onEnviar: () => void;
  onSumar: () => void;
  rapidas: readonly string[];
  aviso: string | null;
  entradaFoto: RefObject<HTMLInputElement | null>;
  onFoto: (f: File | undefined) => void;
}) {
  return (
    <div>
      {aviso ? (
        <div className="ds-cuerpo" style={{ paddingBottom: 0 }}>
          <Nota icono="alerta" tono="amarillo" rol="status">
            {aviso}
          </Nota>
        </div>
      ) : null}
      <div className="ds-m-rapidas" role="group" aria-label="Respuestas rápidas">
        {rapidas.map((r) => (
          <Pastilla key={r} elegida={false} onElegir={() => onTexto(r)}>
            {r}
          </Pastilla>
        ))}
      </div>
      <input
        ref={entradaFoto}
        type="file"
        accept={TIPOS_MEDIA.join(',')}
        hidden
        aria-label="Elegir una foto"
        onChange={(e) => {
          onFoto(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
      <Escribir valor={texto} onCambio={onTexto} onEnviar={onEnviar} onSumar={onSumar} />
    </div>
  );
}
