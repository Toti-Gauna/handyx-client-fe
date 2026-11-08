'use client';
// Átomos del sistema de diseño (src/styles/ds.css). Piezas mínimas sin datos propios: se combinan en moléculas.
import type { CSSProperties, ReactNode } from 'react';
import { Fragment } from 'react';
import { Icono } from '@/components/Icono';
import { Enlace } from '@/components/nav';
import type { NombreIcono } from '@/components/trazos';
import { pesos } from '@/domain/dinero';

const v = (nombre: string, valor: string | number | undefined): CSSProperties =>
  valor === undefined
    ? {}
    : ({ [nombre]: typeof valor === 'number' ? `${valor}rem` : valor } as CSSProperties);

/** Texto con ==marca== amarilla (una por título). */
export function Marca({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/==(.+?)==/g).map((p, i) =>
        i % 2 ? (
          <span key={i} className="ds-marca">
            {p}
          </span>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

export function Titulo({
  texto,
  nivel = 1,
  tam,
  id,
}: {
  /** Admite ==marca==. */
  texto: string;
  nivel?: 1 | 2 | 3;
  /** rem. */
  tam?: number;
  id?: string;
}) {
  const H = `h${nivel}` as 'h1';
  return (
    <H className="ds-titulo" style={v('--ds-tam', tam)} id={id}>
      <Marca texto={texto} />
    </H>
  );
}

export function Sub({ children }: { children: ReactNode }) {
  return <p className="ds-sub">{children}</p>;
}

export function Texto({ children, clase = '' }: { children: ReactNode; clase?: string }) {
  return <p className={`ds-texto ${clase}`.trim()}>{children}</p>;
}

export function Etiqueta({
  children,
  como = 'p',
}: {
  children: ReactNode;
  como?: 'p' | 'h2' | 'h3';
}) {
  const E = como;
  return <E className="ds-etiqueta">{children}</E>;
}

/** Monto en Archivo 900 ensanchado: `$ 45.000`. */
export function Monto({
  centavos,
  texto,
  tam,
  color,
}: {
  centavos?: number;
  texto?: string;
  tam?: number;
  color?: string;
}) {
  return (
    <strong className="ds-monto" style={{ ...v('--ds-tam', tam), ...(color ? { color } : {}) }}>
      {texto ?? pesos(centavos ?? 0)}
    </strong>
  );
}

export type VarianteBoton = 'primario' | 'contorno' | 'peligro' | 'suave' | 'amarillo' | 'blanco';

/**
 * Botón con base que se hunde. La acción principal es siempre azul (`primario`); rechazar o borrar, `peligro` en
 * contorno rojo. Con `href` es un enlace interno; sin él, un botón.
 */
export function Boton({
  children,
  variante = 'primario',
  icono,
  href,
  onClick,
  type = 'button',
  chico = false,
  ancho = true,
  deshabilitado = false,
  etiqueta,
  ocupado = false,
}: {
  children: ReactNode;
  variante?: VarianteBoton;
  icono?: NombreIcono;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  chico?: boolean;
  ancho?: boolean;
  deshabilitado?: boolean;
  /** Nombre accesible si el texto visible no alcanza. */
  etiqueta?: string;
  ocupado?: boolean;
}) {
  const clase = `ds-boton ds-boton--${variante}${chico ? ' ds-boton--chico' : ''}${ancho ? ' ds-boton--ancho' : ''}`;
  const dentro = (
    <>
      {icono ? <Icono nombre={icono} /> : null}
      {children}
    </>
  );
  if (href && !deshabilitado)
    return (
      <Enlace href={href} className={clase} aria-label={etiqueta}>
        {dentro}
      </Enlace>
    );
  return (
    <button
      type={type}
      className={clase}
      onClick={onClick}
      disabled={deshabilitado || ocupado}
      aria-busy={ocupado || undefined}
      aria-label={etiqueta}
    >
      {dentro}
    </button>
  );
}

export type TonoChip =
  'tinte' | 'exito' | 'amarillo' | 'gris' | 'blanco' | 'azul' | 'error' | 'noche';

export function Chip({
  children,
  tono = 'tinte',
  icono,
}: {
  children: ReactNode;
  tono?: TonoChip;
  icono?: NombreIcono;
}) {
  return (
    <span className={`ds-chip${tono === 'tinte' ? '' : ` ds-chip--${tono}`}`}>
      {icono ? <Icono nombre={icono} /> : null}
      {children}
    </span>
  );
}

const TONOS_AVATAR = [
  ['#1F57A8', '#FFFFFF'],
  ['#E9EFF9', '#143E7E'],
  ['#CDE7D6', '#137140'],
  ['#E7D9F5', '#5B3A8C'],
  ['#F6D7A7', '#0E1D36'],
  ['#1D2C4A', '#FFFFFF'],
] as const;

export const iniciales = (nombre: string) =>
  nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

/** Avatar con iniciales; el tono sale del nombre (estable). Decorativo: el nombre va en el texto de al lado. */
export function Avatar({
  nombre,
  tam = 2.75,
  tono,
  propio = false,
}: {
  nombre: string;
  tam?: number;
  tono?: number;
  /** La persona usuaria: amarillo. */
  propio?: boolean;
}) {
  const i = tono ?? [...nombre].reduce((s, c) => (s + c.charCodeAt(0)) % TONOS_AVATAR.length, 0);
  const [fondo, color] = propio ? ['#F5F59A', '#0E1D36'] : TONOS_AVATAR[i % TONOS_AVATAR.length]!;
  return (
    <span
      className="ds-avatar"
      aria-hidden="true"
      style={{ ...v('--ds-tam', tam), background: fondo, color }}
    >
      {iniciales(nombre)}
    </span>
  );
}

export type TonoMosaico = 'tinte' | 'gris' | 'amarillo' | 'azul' | 'blanco' | 'velo';

export function MosaicoIcono({
  icono,
  tam = 2.75,
  tono = 'tinte',
}: {
  icono: NombreIcono;
  tam?: number;
  tono?: TonoMosaico;
}) {
  return (
    <span
      className={`ds-mosaico-ic${tono === 'tinte' ? '' : ` ds-mosaico-ic--${tono}`}`}
      style={v('--ds-tam', tam)}
      aria-hidden="true"
    >
      <Icono nombre={icono} />
    </span>
  );
}

/** Interruptor accesible: toda la fila es el control (role=switch). */
export function Interruptor({
  etiqueta,
  sub,
  activo,
  onCambiar,
}: {
  etiqueta: string;
  sub?: string;
  activo: boolean;
  onCambiar: (activo: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      className="ds-interruptor"
      onClick={() => onCambiar(!activo)}
    >
      <span className="ds-crece">
        {etiqueta}
        {sub ? (
          <span className="ds-fila-enlace__sub" style={{ display: 'block', fontWeight: 400 }}>
            {sub}
          </span>
        ) : null}
      </span>
      <span className="ds-interruptor__pista" aria-hidden="true" />
    </button>
  );
}

export function Progreso({
  valor,
  max = 100,
  etiqueta,
  alto,
}: {
  valor: number;
  max?: number;
  etiqueta: string;
  alto?: number;
}) {
  const pct = Math.max(0, Math.min(100, (valor / max) * 100));
  return (
    <div
      className="ds-progreso"
      role="progressbar"
      aria-label={etiqueta}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={valor}
      style={v('--ds-alto', alto)}
    >
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

export function Pasos({ paso, total }: { paso: number; total: number }) {
  return (
    <div
      className="ds-pasos"
      role="progressbar"
      aria-label={`Paso ${paso} de ${total}`}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={paso}
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} data-hecho={i < paso ? '' : undefined} />
      ))}
    </div>
  );
}

const ESTRELLA = 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9Z';

export function Estrellas({ valor, onElegir }: { valor: number; onElegir: (n: number) => void }) {
  return (
    <div className="ds-estrellas" role="group" aria-label={`Calificación: ${valor} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} de 5`}
          aria-pressed={n <= valor}
          onClick={() => onElegir(n)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d={ESTRELLA} />
          </svg>
        </button>
      ))}
    </div>
  );
}

/** Estrellas de solo lectura (reseñas). */
export function EstrellasFijas({ valor }: { valor: number }) {
  return (
    <span
      role="img"
      aria-label={`${valor} de 5 estrellas`}
      style={{ display: 'inline-flex', color: 'var(--color-naranja)' }}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          viewBox="0 0 24 24"
          width="14"
          height="14"
          aria-hidden="true"
          style={{ opacity: n <= valor ? 1 : 0.25 }}
        >
          <path d={ESTRELLA} fill="currentColor" />
        </svg>
      ))}
    </span>
  );
}
