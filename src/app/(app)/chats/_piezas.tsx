'use client';
// Piezas propias de Mensajes (lienzo M-*): la tarjeta de propuesta dentro del chat, la fila de la lista, la selección de
// mensajes y las opciones de «Sumar al chat». Las comparte la lista, la conversación y su hoja; nada más las usa.
import type { ReactNode } from 'react';
import { Icono } from '@/components/Icono';
import { Enlace } from '@/components/nav';
import { TituloDocumento } from '@/components/TituloDocumento';
import type { NombreIcono } from '@/components/trazos';
import { Chip, MosaicoIcono } from '@/ui';
import { TARJETA_INFO, textoSeleccion, type TipoTarjeta } from '@/ui/mensajes';

// ── Tarjeta dentro del chat ──────────────────────────────────────────────────────────────────────────────
export interface AccionTarjeta {
  readonly texto: string;
  readonly href?: string;
  readonly onClick?: () => void;
  readonly principal?: boolean;
  readonly etiqueta?: string;
}

export function TarjetaChat({
  tipo,
  titulo,
  sub,
  propia = false,
  acciones = [],
  estado,
  children,
  etiqueta,
}: {
  tipo: TipoTarjeta;
  titulo: string;
  sub?: string;
  propia?: boolean;
  acciones?: readonly AccionTarjeta[];
  /** Cuando ya no se puede responder: el estado en texto. */
  estado?: { texto: string; icono: NombreIcono };
  children?: ReactNode;
  etiqueta: string;
}) {
  const info = TARJETA_INFO[tipo];
  return (
    <section
      className={`ds-m-tarjeta${propia ? ' ds-m-tarjeta--propia' : ''}`}
      aria-label={etiqueta}
    >
      <div className="ds-m-tarjeta__cuerpo">
        <Chip icono={info.icono}>{propia ? `Tu ${info.texto.toLowerCase()}` : info.texto}</Chip>
        <strong className="ds-m-tarjeta__titulo">{titulo}</strong>
        {sub ? <span className="ds-m-tarjeta__sub">{sub}</span> : null}
        {children}
      </div>
      {estado ? (
        <p className="ds-m-tarjeta__estado" style={{ margin: 0 }}>
          <Icono nombre={estado.icono} />
          {estado.texto}
        </p>
      ) : null}
      {acciones.length ? (
        <div className="ds-m-tarjeta__acciones">
          {acciones.map((a) => {
            const clase = `ds-m-tarjeta__accion${a.principal ? ' ds-m-tarjeta__accion--principal' : ''}`;
            return a.href ? (
              <Enlace key={a.texto} href={a.href} className={clase} aria-label={a.etiqueta}>
                {a.texto}
              </Enlace>
            ) : (
              <button
                key={a.texto}
                type="button"
                className={clase}
                onClick={a.onClick}
                aria-label={a.etiqueta}
              >
                {a.texto}
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}

// ── Lista de conversaciones ──────────────────────────────────────────────────────────────────────────────
export function FilaConversacion({
  href,
  titulo,
  rubro,
  previa,
  hora,
  sinLeer = 0,
  fijada = false,
  avatar,
}: {
  href: string;
  titulo: string;
  rubro: string;
  previa: string;
  hora?: string;
  sinLeer?: number;
  fijada?: boolean;
  avatar: ReactNode;
}) {
  return (
    <li>
      <Enlace href={href} className="ds-m-conv">
        {avatar}
        <span className="ds-m-conv__textos">
          <span className="ds-m-conv__linea">
            <strong>{titulo}</strong>
            {hora ? <span className="ds-m-conv__hora">{hora}</span> : null}
          </span>
          <span className="ds-m-conv__rubro">{rubro}</span>
          <span className="ds-m-conv__linea">
            <span className="ds-m-conv__previa">{previa}</span>
            {sinLeer ? (
              <span className="ds-m-conv__cuenta">
                <span className="ds-solo-lector">sin leer: </span>
                {sinLeer}
              </span>
            ) : fijada ? (
              <Chip tono="gris">Fijada</Chip>
            ) : null}
          </span>
        </span>
      </Enlace>
    </li>
  );
}

// ── Selección ────────────────────────────────────────────────────────────────────────────────────────────
export function FilaSeleccion({
  activa,
  etiqueta,
  onAlternar,
  children,
}: {
  activa: boolean;
  etiqueta: string;
  onAlternar: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={activa}
      aria-label={etiqueta}
      className="ds-m-sel"
      onClick={onAlternar}
    >
      <span className="ds-m-sel__marca" aria-hidden="true">
        {activa ? <Icono nombre="check" /> : null}
      </span>
      <span className="ds-m-sel__cont">{children}</span>
    </button>
  );
}

export function BarraSeleccion({
  cantidad,
  onSalir,
  onTodos,
}: {
  cantidad: number;
  onSalir: () => void;
  onTodos: () => void;
}) {
  return (
    <div className="ds-m-barra ds-m-barra--seleccion">
      <TituloDocumento texto="Seleccionar mensajes" />
      <button
        type="button"
        className="ds-m-barra__redondo"
        aria-label="Salir de la selección"
        onClick={onSalir}
      >
        <Icono nombre="cerrar" />
      </button>
      <div className="ds-m-barra__textos">
        <h1 aria-live="polite">{textoSeleccion(cantidad)}</h1>
      </div>
      <button type="button" className="ds-m-barra__texto" onClick={onTodos}>
        Todos
      </button>
    </div>
  );
}

export interface AccionSeleccion {
  readonly texto: string;
  readonly icono: NombreIcono;
  readonly onClick: () => void;
  readonly rojo?: boolean;
  readonly deshabilitada?: boolean;
}
export function BarraAcciones({
  cantidad,
  acciones,
}: {
  cantidad: number;
  acciones: readonly AccionSeleccion[];
}) {
  return (
    <div
      className="ds-m-acciones"
      role="toolbar"
      aria-label={`Acciones sobre ${cantidad} mensajes`}
    >
      {acciones.map((a) => (
        <button
          key={a.texto}
          type="button"
          className={a.rojo ? 'ds-m-acciones__rojo' : undefined}
          disabled={a.deshabilitada}
          onClick={a.onClick}
        >
          <Icono nombre={a.icono} />
          {a.texto}
        </button>
      ))}
    </div>
  );
}

export function OpcionAdjuntar({
  icono,
  texto,
  sub,
  href,
  onClick,
}: {
  icono: NombreIcono;
  texto: string;
  sub: string;
  href?: string;
  onClick?: () => void;
}) {
  const dentro = (
    <>
      <MosaicoIcono icono={icono} tam={3} tono="blanco" />
      <strong>{texto}</strong>
      <span className="ds-fila-enlace__sub">{sub}</span>
    </>
  );
  return href ? (
    <Enlace href={href} className="ds-m-adjuntar__op">
      {dentro}
    </Enlace>
  ) : (
    <button type="button" className="ds-m-adjuntar__op" onClick={onClick}>
      {dentro}
    </button>
  );
}
