'use client';

import Image from 'next/image';
import { useEffect, useId, useRef } from 'react';
import type { ErrorCliente } from '@/data/cliente';
import { Icono } from './Icono';
import type { NombreIcono } from './trazos';

// ── Botones ─────────────────────────────────────────────────────────────────────────────────────────
type Variante = 'azul' | 'amarillo' | 'claro' | 'contorno' | 'peligro' | 'peligro-lleno' | 'texto';

export function Boton({
  variante = 'azul',
  cargando = false,
  chico = false,
  icono,
  children,
  className = '',
  disabled,
  type = 'button',
  ...resto
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: Variante;
  cargando?: boolean;
  chico?: boolean;
  icono?: NombreIcono;
}) {
  const clases = [
    'boton',
    variante === 'azul' ? '' : `boton--${variante}`,
    chico ? 'boton--chico' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button
      {...resto}
      type={type}
      className={clases}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
    >
      {icono && !cargando ? <Icono nombre={icono} /> : null}
      {cargando ? 'Un momento…' : children}
    </button>
  );
}

// ── Campos ──────────────────────────────────────────────────────────────────────────────────────────
export interface PropsControl {
  id: string;
  'aria-describedby'?: string;
  'aria-invalid'?: true;
  'aria-required'?: true;
}

export function Campo({
  etiqueta,
  ayuda,
  error,
  opcional,
  requerido,
  children,
}: {
  etiqueta: string;
  ayuda?: string;
  error?: string | null | undefined;
  opcional?: boolean;
  requerido?: boolean;
  children: (props: PropsControl) => React.ReactNode;
}) {
  const id = useId();
  const ids = [ayuda ? `${id}-ayuda` : null, error ? `${id}-error` : null]
    .filter(Boolean)
    .join(' ');
  return (
    <div className="campo">
      <label className="campo__etiqueta" htmlFor={id}>
        {etiqueta} {opcional ? <span className="campo__opcional">(opcional)</span> : null}
      </label>
      {children({
        id,
        ...(ids ? { 'aria-describedby': ids } : {}),
        ...(error ? { 'aria-invalid': true as const } : {}),
        ...(requerido ? { 'aria-required': true as const } : {}),
      })}
      {ayuda ? (
        <p id={`${id}-ayuda`} className="campo__ayuda">
          {ayuda}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="campo__error" role="alert">
          <Icono nombre="alerta" /> {error}
        </p>
      ) : null}
    </div>
  );
}

// ── Avisos ──────────────────────────────────────────────────────────────────────────────────────────
const ICONO_AVISO: Record<string, NombreIcono> = {
  info: 'info',
  ok: 'checkCirculo',
  alerta: 'alerta',
  error: 'alerta',
};

export function Aviso({
  tipo = 'info',
  titulo,
  children,
  rol,
}: {
  tipo?: 'info' | 'ok' | 'alerta' | 'error';
  titulo?: string;
  children?: React.ReactNode;
  rol?: 'alert' | 'status';
}) {
  return (
    <div className={`aviso aviso--${tipo}`} role={rol ?? (tipo === 'error' ? 'alert' : undefined)}>
      <Icono nombre={ICONO_AVISO[tipo] ?? 'info'} />
      <div>
        {titulo ? <strong className="aviso__titulo">{titulo}</strong> : null}
        {children}
      </div>
    </div>
  );
}

// ── Estados de pantalla ─────────────────────────────────────────────────────────────────────────────
export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return (
    <div role="status" aria-live="polite" className="estado">
      <Image className="estado__handy" src="/img/handy-gota.webp" alt="" width={90} height={90} />
      <p className="texto-suave">{texto}</p>
      <div style={{ width: '100%' }} aria-hidden="true">
        <div className="esqueleto" />
        <div className="esqueleto" style={{ width: '70%' }} />
      </div>
    </div>
  );
}

const HANDY_ERROR: Record<string, string> = {
  no_disponible: '/img/handy-cano-roto.webp',
  limite: '/img/handy-engranaje-roto.webp',
  sin_permiso: '/img/handy-llave-rota.webp',
  no_encontrado: '/img/handy-llave-rota.webp',
};

export function ErrorEstado({
  error,
  onReintentar,
  titulo,
}: {
  error: ErrorCliente;
  onReintentar?: () => void;
  titulo?: string;
}) {
  return (
    <div className="estado" role="alert">
      <Image
        className="estado__handy"
        src={HANDY_ERROR[error.codigo] ?? '/img/handy-lamparita-rota.webp'}
        alt=""
        width={110}
        height={110}
      />
      <h2 className="subtitulo" style={{ margin: 0 }}>
        {titulo ??
          (error.codigo === 'no_encontrado'
            ? 'No lo encontramos'
            : error.codigo === 'sin_permiso'
              ? 'No podés hacer esto'
              : 'No pudimos cargarlo')}
      </h2>
      <p style={{ margin: 0 }}>{error.mensaje}</p>
      {error.recuperable && onReintentar ? (
        <Boton chico variante="azul" onClick={onReintentar} icono="reintentar">
          Reintentar
        </Boton>
      ) : null}
      {error.requestId ? (
        <p className="estado__codigo">Código para soporte: {error.requestId.slice(0, 8)}</p>
      ) : null}
    </div>
  );
}

export function Vacio({
  titulo,
  texto,
  children,
  handy = '/img/handy-llave.webp',
}: {
  titulo: string;
  texto?: string;
  children?: React.ReactNode;
  handy?: string;
}) {
  return (
    <div className="estado">
      <Image className="estado__handy" src={handy} alt="" width={110} height={110} />
      <h2 className="subtitulo" style={{ margin: 0 }}>
        {titulo}
      </h2>
      {texto ? <p style={{ margin: 0 }}>{texto}</p> : null}
      {children}
    </div>
  );
}

/** Muestra el estado de una consulta con los tres estados comunes (carga, error recuperable y datos). */
export function EstadoConsulta<T>({
  consulta,
  children,
  cargando,
}: {
  consulta: {
    estado: 'cargando' | 'ok' | 'error';
    datos: T | null;
    error: ErrorCliente | null;
    recargar: () => void;
  };
  children: (datos: T) => React.ReactNode;
  cargando?: string;
}) {
  if (consulta.estado === 'error' && consulta.error)
    return <ErrorEstado error={consulta.error} onReintentar={consulta.recargar} />;
  if (consulta.estado !== 'ok' || consulta.datos === null)
    return <Cargando {...(cargando ? { texto: cargando } : {})} />;
  return <>{children(consulta.datos)}</>;
}

// ── Hoja ────────────────────────────────────────────────────────────────────────────────────────────
export function Hoja({
  abierta,
  onCerrar,
  titulo,
  children,
  cerrable = true,
  handy,
}: {
  abierta: boolean;
  onCerrar: () => void;
  titulo: string;
  children: React.ReactNode;
  cerrable?: boolean;
  /** Ilustración opcional (ruta en /img): para confirmaciones que conviene leer dos veces. */
  handy?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const idTitulo = useId();
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierta && !d.open) d.showModal();
    if (!abierta && d.open) d.close();
  }, [abierta]);
  return (
    <dialog
      ref={ref}
      className="hoja"
      aria-labelledby={idTitulo}
      onCancel={(e) => {
        e.preventDefault();
        if (cerrable) onCerrar();
      }}
      onClick={(e) => {
        if (cerrable && e.target === ref.current) onCerrar();
      }}
    >
      {abierta ? (
        <div className="hoja__cuerpo">
          <div className="hoja__manija" aria-hidden="true" />
          {handy ? (
            <Image className="hoja__handy" src={handy} alt="" width={96} height={96} />
          ) : null}
          <h2 id={idTitulo} className="hoja__titulo">
            {titulo}
          </h2>
          {children}
        </div>
      ) : null}
    </dialog>
  );
}

// ── Estados con texto ───────────────────────────────────────────────────────────────────────────────
export function Pastilla({
  children,
  tono = 'azul',
  icono,
}: {
  children: React.ReactNode;
  tono?: 'azul' | 'gris' | 'ok' | 'error' | 'alerta';
  icono?: NombreIcono;
}) {
  return (
    <span className={`pastilla pastilla--${tono}`}>
      {icono ? <Icono nombre={icono} className="icono" /> : null}
      {children}
    </span>
  );
}

export function Pasos({
  actual,
  total,
  titulo,
}: {
  actual: number;
  total: number;
  titulo: string;
}) {
  return (
    <>
      <p className="pasos__texto">
        Paso {actual} de {total} · {titulo}
      </p>
      <ol className="pasos" aria-hidden="true">
        {Array.from({ length: total }, (_, i) => (
          <li
            key={i}
            className={`pasos__item${i + 1 < actual ? ' pasos__item--hecho' : ''}`}
            aria-current={i + 1 === actual ? 'step' : undefined}
          />
        ))}
      </ol>
    </>
  );
}

export function Datos({ filas }: { filas: readonly (readonly [string, React.ReactNode])[] }) {
  return (
    <dl className="datos">
      {filas.map(([k, v]) => (
        <div key={k} className="datos__fila">
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
