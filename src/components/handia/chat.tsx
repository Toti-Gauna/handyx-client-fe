'use client';
// Chat de HandIA (Fase 7, lienzo design/usuario · I-HandIA, I-HandIAChat, I-HandIAPiensa, I-HandIAFicha): la
// bienvenida con la lamparita (solo con la conversación vacía), los mensajes, «pensando» en una fila chica, las
// respuestas rápidas y la ficha del pedido como ticket. Presentacional: la página decide todo. Estilos: handia.css.
import Image from 'next/image';
import { useId, useState } from 'react';
import { Icono } from '@/components/Icono';
import type { NombreIcono } from '@/components/trazos';
import type { Rubro } from '@/contracts/v1/pedidos';
import type { EstadoHandia, Opcion } from '@/domain/handia-motor';
import { detallesDe } from '@/domain/handia-motor';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { Boton, Burbuja, Chip, Etiqueta, MosaicoIcono, Nota, Ticket } from '@/ui';
import { AvatarHandia } from '@/ui/inicio';

export interface Mensaje {
  readonly id: number;
  readonly de: 'ia' | 'yo' | 'aviso' | 'detectado' | 'ficha';
  readonly texto?: string;
  readonly rubro?: Rubro;
  readonly riesgo?: boolean;
}

export interface Sugerencia {
  readonly texto: string;
  readonly icono: NombreIcono;
}

/** Ilustración de bienvenida: la lamparita sobre su luz y una estrella. Decorativa. */
function Lamparita() {
  return (
    <span className="hia7-lamparita" aria-hidden="true">
      <span className="hia7-lamparita__luz" />
      <Image src="/img/handy-lamparita.webp" alt="" width={202} height={346} priority />
      <svg viewBox="0 0 160 160">
        <path
          d="M110 30l4 8 8 1-6 6 2 8-8-4-8 4 2-8-6-6 8-1Z"
          fill="var(--ds-amarillo)"
          stroke="var(--ds-tinta)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="132" cy="62" r="4" fill="var(--ds-amarillo)" stroke="var(--ds-tinta)" />
      </svg>
    </span>
  );
}

/** Conversación vacía: la lamparita, el saludo y tres sugerencias para empezar. */
export function Bienvenida({
  sugerencias,
  onElegir,
  deshabilitado,
}: {
  sugerencias: readonly Sugerencia[];
  onElegir: (texto: string) => void;
  deshabilitado: boolean;
}) {
  return (
    <div className="hia7-bienvenida">
      <div className="hia7-bienvenida__hola">
        <Lamparita />
        <h2 className="ds-titulo" style={{ ['--ds-tam' as string]: '1.6875rem' }}>
          ¡Hola! Soy <span className="ds-marca">HandIA</span>
        </h2>
        <p className="ds-sub">¿Qué arreglo podemos hacer hoy? Contámelo como te salga.</p>
      </div>
      <Etiqueta>Probá con</Etiqueta>
      <div className="ds-pila" role="group" aria-label="Probá con">
        {sugerencias.map((s) => (
          <button
            key={s.texto}
            type="button"
            className="hia7-sugerencia"
            onClick={() => onElegir(s.texto)}
            disabled={deshabilitado}
          >
            <MosaicoIcono icono={s.icono} tam={2} />
            {s.texto}
          </button>
        ))}
      </div>
      <p className="hia7-privado">
        <Icono nombre="candado" />
        Todo queda en tu celular: no paso datos personales, no veo fotos y no guardo tu voz. Puedo
        equivocarme: vos confirmás todo.
      </p>
    </div>
  );
}

/** Un mensaje de la conversación (la ficha la dibuja la página). */
export function MensajeVista({ m }: { m: Mensaje }) {
  if (m.de === 'yo')
    return (
      <Burbuja de="yo">
        <span className="ds-solo-lector">Vos: </span>
        {m.texto}
      </Burbuja>
    );
  if (m.de === 'detectado' && m.rubro)
    return (
      <p className="hia7-detectado">
        <Icono nombre={RUBROS_INFO[m.rubro].icono} />
        Rubro detectado: <strong>{RUBROS_INFO[m.rubro].nombre}</strong>
      </p>
    );
  if (m.de === 'aviso')
    return (
      <div className="hia7-sangria">
        <Nota
          tono={m.riesgo ? 'amarillo' : 'gris'}
          icono={m.riesgo ? 'alerta' : 'info'}
          rol={m.riesgo ? 'alert' : 'note'}
        >
          {m.texto}
        </Nota>
      </div>
    );
  return (
    <div className="hia7-ia">
      <AvatarHandia />
      <div className="ds-burbuja">
        <span className="ds-solo-lector">HandIA: </span>
        {m.texto}
      </div>
    </div>
  );
}

/** «Pensando», chico, junto al avatar (sin ilustración grande una vez que la persona escribió). */
export function Pensando() {
  return (
    <div className="hia7-ia" role="status">
      <AvatarHandia />
      <span className="hia7-pensando">
        <span className="hia7-pensando__puntos" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        Pensando
      </span>
    </div>
  );
}

export function Progreso({ actual, total }: { actual: number; total: number }) {
  return (
    <div
      className="hia7-tramos"
      role="progressbar"
      aria-label={`Pregunta ${actual} de ${total}`}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={actual}
    >
      <span className="hia7-tramos__barras" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <i key={i} data-hecho={i < actual ? '' : undefined} />
        ))}
      </span>
      <span>
        Pregunta {actual} de {total}
      </span>
    </div>
  );
}

/** Respuestas rápidas en contorno azul. */
export function Respuestas({
  opciones,
  onElegir,
  deshabilitado,
  etiqueta = 'Respuestas rápidas',
}: {
  opciones: readonly Opcion[];
  onElegir: (o: Opcion) => void;
  deshabilitado: boolean;
  etiqueta?: string;
}) {
  if (!opciones.length) return null;
  return (
    <div className="hia7-respuestas" role="group" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button
          key={o.texto}
          type="button"
          className="hia7-respuesta"
          onClick={() => onElegir(o)}
          disabled={deshabilitado}
        >
          {o.icono ? <Icono nombre={o.icono as NombreIcono} /> : null}
          {o.texto}
        </button>
      ))}
    </div>
  );
}

/** La ficha que armó HandIA, como ticket: así la leen los especialistas. «Corregir» abre el texto; «Pedir así» sigue. */
export function FichaTicket({
  estado,
  descripcion,
  onCambiar,
  principal,
  onPedir,
  deshabilitado,
}: {
  estado: EstadoHandia;
  descripcion: string;
  onCambiar: (v: string) => void;
  principal: Opcion | null;
  onPedir: (o: Opcion) => void;
  deshabilitado: boolean;
}) {
  const [corrigiendo, setCorrigiendo] = useState(false);
  const id = useId();
  if (!estado.rubro) return null;
  const info = RUBROS_INFO[estado.rubro];
  const detalles = detallesDe(estado);
  const urgente = principal?.accion.tipo === 'pedir' && principal.accion.modo === 'urgente';
  return (
    <Ticket
      etiqueta={`Tu pedido de ${info.nombre}`}
      arriba={
        <>
          <MosaicoIcono icono={info.icono} tam={3.25} />
          <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.125rem' }}>
            <span className="ds-etiqueta">Tu pedido</span>
            <span className="ds-titulo" style={{ ['--ds-tam' as string]: '1.375rem' }}>
              {info.nombre}
            </span>
          </span>
          {principal ? (
            <Chip tono={urgente ? 'amarillo' : 'tinte'} icono={urgente ? 'reloj' : 'calendario'}>
              {urgente ? 'Para hoy' : 'Programado'}
            </Chip>
          ) : null}
        </>
      }
      abajo={
        <>
          {detalles.length ? (
            <span className="hia7-ficha__datos" aria-label="Datos que suma HandIA" role="list">
              {detalles.map((d) => (
                <span key={d} role="listitem">
                  <Chip tono="gris">{d}</Chip>
                </span>
              ))}
            </span>
          ) : null}
          {corrigiendo ? (
            <span className="hia7-ficha__editar">
              <label htmlFor={id}>Así lo leen los especialistas</label>
              <textarea
                id={id}
                rows={5}
                maxLength={1000}
                value={descripcion}
                onChange={(e) => onCambiar(e.target.value)}
              />
              <small>
                Si agregás un teléfono, un email o un documento, lo saco antes de armar el pedido.
                Las fotos las sumás en el pedido.
              </small>
            </span>
          ) : (
            <span className="hia7-ficha__texto">{descripcion}</span>
          )}
          <span className="hia7-ficha__botones">
            <Boton
              variante="contorno"
              chico
              icono={corrigiendo ? 'check' : 'editar'}
              onClick={() => setCorrigiendo((c) => !c)}
            >
              {corrigiendo ? 'Listo' : 'Corregir'}
            </Boton>
            {principal ? (
              <Boton
                chico
                icono="check"
                onClick={() => onPedir(principal)}
                deshabilitado={deshabilitado}
              >
                Pedir así
              </Boton>
            ) : null}
          </span>
        </>
      }
    />
  );
}
