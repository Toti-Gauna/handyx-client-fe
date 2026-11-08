'use client';
// La conversación de HandIA (Fase 7): se apoya abajo, sobre la caja de escribir, y baja sola al último mensaje (sin
// animar si se pidió reducir el movimiento). Con la conversación vacía, la bienvenida con las sugerencias.
import { useEffect, useRef } from 'react';
import { Enlace } from '@/components/nav';
import { SUGERENCIAS_HANDIA } from '@/content/inicio';
import type { EstadoHandia, Opcion, Turno } from '@/domain/handia-motor';
import { Nota } from '@/ui';
import {
  Bienvenida,
  FichaTicket,
  type Mensaje,
  MensajeVista,
  Pensando,
  Progreso,
  Respuestas,
} from './chat';

export function Conversacion({
  disponible,
  mensajes,
  estado,
  descripcion,
  onCambiarDescripcion,
  opciones,
  principal,
  progreso,
  pensando,
  deshabilitado,
  dictando,
  onEscribir,
  onElegir,
}: {
  disponible: boolean;
  mensajes: readonly Mensaje[];
  estado: EstadoHandia;
  descripcion: string;
  onCambiarDescripcion: (v: string) => void;
  opciones: readonly Opcion[];
  /** La opción de «Pedir así» en la ficha (no se repite en las respuestas). */
  principal: Opcion | null;
  progreso: Turno['progreso'];
  pensando: boolean;
  deshabilitado: boolean;
  /** Lo que se va dictando (fuera del modo voz); null si no se dicta. */
  dictando: string | null;
  onEscribir: (texto: string) => void;
  onElegir: (o: Opcion) => void;
}) {
  const fin = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    fin.current?.scrollIntoView({ block: 'end', behavior: quieto ? 'auto' : 'smooth' });
  }, [mensajes, pensando, opciones]);

  // El saludo (id 0) lo dice la bienvenida; una vez que la persona escribió, no se repite.
  const conversando = mensajes.some((m) => m.de === 'yo');
  const ultimaFicha = mensajes.findLast((m) => m.de === 'ficha')?.id;
  return (
    <div
      className="hia7-log"
      role="log"
      aria-live="polite"
      aria-label="Conversación con HandIA"
      tabIndex={0}
    >
      <div className="hia7-log__pila">
        {!disponible ? (
          <Nota>
            HandIA todavía no está disponible.{' '}
            <Enlace href="/pedir/">Elegí el rubro directamente</Enlace>.
          </Nota>
        ) : null}
        {!conversando ? (
          <Bienvenida
            sugerencias={SUGERENCIAS_HANDIA}
            onElegir={onEscribir}
            deshabilitado={deshabilitado}
          />
        ) : (
          mensajes.map((m) =>
            m.id === 0 ? null : m.de === 'ficha' && m.id === ultimaFicha ? (
              <FichaTicket
                key={m.id}
                estado={estado}
                descripcion={descripcion}
                onCambiar={onCambiarDescripcion}
                principal={principal}
                onPedir={onElegir}
                deshabilitado={deshabilitado}
              />
            ) : (
              <MensajeVista
                key={m.id}
                m={m.de === 'ficha' ? { ...m, de: 'aviso', texto: 'Pedido actualizado.' } : m}
              />
            ),
          )
        )}
        {pensando ? <Pensando /> : null}
        {progreso && !pensando ? <Progreso {...progreso} /> : null}
        <Respuestas
          opciones={opciones.filter((o) => o !== principal)}
          onElegir={onElegir}
          deshabilitado={deshabilitado}
          etiqueta={estado.etapa === 'resumen' ? 'Otras opciones' : 'Respuestas rápidas'}
        />
        {dictando !== null ? (
          <p className="hia7-dictado" role="status">
            {dictando || 'Te escucho…'}
          </p>
        ) : null}
        <div ref={fin} />
      </div>
    </div>
  );
}
