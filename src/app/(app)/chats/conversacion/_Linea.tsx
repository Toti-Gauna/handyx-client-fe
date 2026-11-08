'use client';

import type { ReactNode } from 'react';
import { FotoPrivada } from '@/components/FotoPrivada';
import type { Propuesta } from '@/contracts/v1/propuestas';
import type { Mensaje } from '@/contracts/v1/servicio';
import { fechaDeInstante, horaDeInstante } from '@/domain/fechas';
import { Burbuja, Chip, Nota, Pastilla } from '@/ui';
import { FilaSeleccion, alternar, etiquetaDia } from '@/ui/mensajes';
import type { Saliente } from './_useEnvios';
import { TarjetaPropuestaChat } from './_TarjetaPropuesta';

export type Entrada =
  | { t: string; k: string; tipo: 'msg'; msg: Mensaje }
  | { t: string; k: string; tipo: 'prop'; prop: Propuesta }
  | { t: string; k: string; tipo: 'sal'; sal: Saliente };

interface Manos {
  onPointerDown: () => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
  onPointerMove: () => void;
  onContextMenu: (e: React.SyntheticEvent) => void;
}

/**
 * Lo que se dice en el chat, de la más vieja a la más nueva, con el separador de día y cada cosa en su forma: mensaje,
 * foto, aviso del sistema, tarjeta de propuesta o lo que todavía se está mandando. En selección, los mensajes se
 * eligen con una fila completa resaltada y las tarjetas quedan quietas.
 */
export function Linea({
  entradas,
  ahora,
  esp,
  tarjetas,
  elegidos,
  onElegidos,
  pulsar,
  onCambio,
  onReintentar,
  onDescartar,
}: {
  entradas: readonly Entrada[];
  ahora: number;
  esp: string;
  tarjetas: readonly Propuesta[];
  elegidos: ReadonlySet<string> | null;
  onElegidos: (e: ReadonlySet<string>) => void;
  pulsar: (id: string) => Manos;
  onCambio: () => void;
  onReintentar: (s: Saliente) => void;
  onDescartar: (clienteId: string) => void;
}) {
  return (
    <>
      {entradas.map((e, i) => {
        const dia = fechaDeInstante(e.t);
        const nuevoDia = i === 0 || dia !== fechaDeInstante(entradas[i - 1]!.t);
        let cuerpo: ReactNode;
        if (e.tipo === 'prop')
          cuerpo = (
            <div className="ds-m-fila" inert={elegidos !== null || undefined}>
              <TarjetaPropuestaChat
                p={e.prop}
                anterior={tarjetas.find((x) => x.id === e.prop.reemplazaA) ?? null}
                alCambiar={onCambio}
              />
            </div>
          );
        else if (e.tipo === 'sal') {
          const s = e.sal;
          cuerpo = (
            <>
              <Burbuja de="yo" hora={s.estado === 'enviando' ? 'Enviando…' : 'No se envió'}>
                {s.archivo ? `Foto: ${s.archivo.name}` : s.texto}
              </Burbuja>
              {s.estado === 'error' ? (
                <div className="ds-fila" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <Nota icono="alerta" tono="error" rol="alert">
                    {s.error}
                  </Nota>
                  <Pastilla elegida={false} onElegir={() => onReintentar(s)}>
                    Reintentar
                  </Pastilla>
                  <Pastilla elegida={false} onElegir={() => onDescartar(s.clienteId)}>
                    Descartar
                  </Pastilla>
                </div>
              ) : null}
            </>
          );
        } else if (e.msg.autor === 'sistema')
          cuerpo = (
            <Nota icono="info" tono="gris">
              {e.msg.texto}
            </Nota>
          );
        else {
          const m = e.msg;
          const mio = m.autor === 'usuario';
          const globo = (
            <Burbuja de={mio ? 'yo' : 'otro'} hora={horaDeInstante(m.creadoEn)}>
              <span className="ds-solo-lector">{mio ? 'Vos: ' : `${esp}: `}</span>
              {m.media ? (
                <FotoPrivada className="ds-m-foto" url={m.media.url} alt="Foto enviada" />
              ) : (
                m.texto
              )}
            </Burbuja>
          );
          cuerpo = elegidos ? (
            <FilaSeleccion
              activa={elegidos.has(m.id)}
              etiqueta={`${mio ? 'Tu mensaje' : `Mensaje de ${esp}`}, ${horaDeInstante(m.creadoEn)}`}
              onAlternar={() => onElegidos(alternar(elegidos, m.id))}
            >
              {globo}
            </FilaSeleccion>
          ) : (
            <div className="ds-m-fila" {...pulsar(m.id)}>
              {globo}
            </div>
          );
        }
        return (
          <div key={e.k} className="ds-m-fila">
            {nuevoDia ? (
              <span className="ds-m-dia">
                <Chip tono="gris">{etiquetaDia(e.t, ahora)}</Chip>
              </span>
            ) : null}
            {cuerpo}
          </div>
        );
      })}
    </>
  );
}
