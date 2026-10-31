'use client';

import Image from 'next/image';
import { useEffect, useId, useRef } from 'react';
import type { ErrorCliente } from '@/data/cliente';
import { enfocarSiPrimerError } from './foco';
import { UMBRAL_ARRASTRE, useArrastreVertical } from './gestos';
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
  useEffect(() => {
    if (error) enfocarSiPrimerError(id);
  }, [error, id]);
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
/**
 * Carga con esqueletos que tienen la forma de la pantalla que viene (rediseño 3.9): tarjetas para las listas, el
 * encabezado y los datos para un detalle, el mapa con su hoja azul para el seguimiento. Sin animación con "reducir
 * movimiento". El texto queda para lectores de pantalla.
 */
export function Cargando({
  texto = 'Cargando…',
  forma = 'lista',
}: {
  texto?: string;
  forma?: 'lista' | 'detalle' | 'mapa';
}) {
  return (
    <div role="status" aria-live="polite" className={`esqueletos esqueletos--${forma}`}>
      <span className="sr-only">{texto}</span>
      {forma === 'mapa' ? (
        <div aria-hidden="true" className="esqueletos__mapa">
          <div className="esqueletos__hoja">
            <i className="esqueleto esqueleto--manija" />
            <i className="esqueleto esqueleto--titulo" />
            <i className="esqueleto esqueleto--linea" />
            <i className="esqueleto esqueleto--linea esqueleto--corta" />
            <i className="esqueleto esqueleto--boton" />
          </div>
        </div>
      ) : forma === 'detalle' ? (
        <div aria-hidden="true" className="esqueletos__detalle">
          <i className="esqueleto esqueleto--heroe" />
          <i className="esqueleto esqueleto--titulo" />
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="esqueletos__fila">
              <i className="esqueleto esqueleto--linea" />
              <i className="esqueleto esqueleto--linea esqueleto--corta" />
            </span>
          ))}
        </div>
      ) : (
        <ul aria-hidden="true" className="esqueletos__lista">
          {[0, 1, 2].map((i) => (
            <li key={i} className="esqueletos__tarjeta">
              <i className="esqueleto esqueleto--icono" />
              <span>
                <i className="esqueleto esqueleto--linea" />
                <i className="esqueleto esqueleto--linea esqueleto--corta" />
              </span>
            </li>
          ))}
        </ul>
      )}
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
    <div className="estado estado-hx" role="alert">
      <Image
        className="estado__handy"
        src={HANDY_ERROR[error.codigo] ?? '/img/handy-lamparita-rota.webp'}
        alt=""
        width={110}
        height={110}
      />
      <h2 className="hd-titulo hd-titulo--chico estado-hx__titulo">
        {titulo ??
          (error.codigo === 'no_encontrado'
            ? 'No lo encontramos'
            : error.codigo === 'sin_permiso'
              ? 'No podés hacer esto'
              : 'No pudimos cargarlo')}
      </h2>
      <p className="estado-hx__texto">{error.mensaje}</p>
      {error.recuperable && onReintentar ? (
        <button type="button" className="hd-boton hd-boton--chico" onClick={onReintentar}>
          <Icono nombre="reintentar" />
          Reintentar
        </button>
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
  const refTitulo = useRef<HTMLHeadingElement>(null);
  const refCuerpo = useRef<HTMLDivElement>(null);
  const idTitulo = useId();
  // Bajarla con el dedo desde la manija la cierra (lo mismo que Escape o tocar afuera).
  const arrastre = useArrastreVertical({
    seguir: (dy) => {
      const c = refCuerpo.current;
      if (c) c.style.transform = dy > 0 ? `translateY(${dy}px)` : '';
    },
    soltar: (dy) => {
      if (cerrable && dy > UMBRAL_ARRASTRE * 1.5) onCerrar();
    },
  });
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (abierta && !d.open) {
      d.showModal();
      // El foco arranca en el título, no en el primer botón: un Enter apurado no confirma nada.
      refTitulo.current?.focus();
    }
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
        <div className="hoja__cuerpo" ref={refCuerpo}>
          <div
            className={`hoja__manija${cerrable ? ' hoja__manija--arrastre' : ''}`}
            aria-hidden="true"
            {...(cerrable ? arrastre : {})}
          />
          {handy ? (
            <Image className="hoja__handy" src={handy} alt="" width={96} height={96} />
          ) : null}
          <h2 id={idTitulo} ref={refTitulo} tabIndex={-1} className="hoja__titulo">
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
      <span className="sr-only">Estado: </span>
      <span>{children}</span>
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
