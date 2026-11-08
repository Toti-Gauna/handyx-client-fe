'use client';
// Piezas del acceso y el alta (fila A del lienzo): la pantalla por pasos con barra compacta, el código de 6 dígitos,
// el contador de ambientes, los segmentos, la casilla de aceptación y la ciudad de la bienvenida. Estilos:
// src/styles/ds-acceso.css (sobre los tokens de ds.css).
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import { useEffect, useId, useRef } from 'react';
import { Icono } from '@/components/Icono';
import { Enlace } from '@/components/nav';
import { TituloDocumento } from '@/components/TituloDocumento';
import type { NombreIcono } from '@/components/trazos';
import { Etiqueta, Marca, MosaicoIcono, Pasos, Sub } from './atomos';
import { AccionesFijas } from './organismos';

export type AtrasAcceso = { href: string } | { alTocar: () => void };

/** Barra compacta: volver (siempre visible si hay a dónde) y el título chico. No es el h1 de la pantalla. */
export function BarraCompacta({
  titulo,
  sub,
  atras,
}: {
  titulo: string;
  sub?: string;
  atras?: AtrasAcceso;
}) {
  return (
    <div className="dsa-barra">
      {atras ? (
        'href' in atras ? (
          <Enlace href={atras.href} className="dsa-atras" aria-label="Volver">
            <Icono nombre="atras" />
          </Enlace>
        ) : (
          <button type="button" className="dsa-atras" aria-label="Volver" onClick={atras.alTocar}>
            <Icono nombre="atras" />
          </button>
        )
      ) : (
        <span />
      )}
      <span className="dsa-barra__textos">
        <span className="dsa-barra__titulo">{titulo}</span>
        {sub ? <span className="dsa-barra__sub">{sub}</span> : null}
      </span>
      <span />
    </div>
  );
}

/**
 * Pantalla de un paso: barra compacta, (cabecera ilustrada), progreso, título grande (el único h1), contenido y las
 * acciones fijas abajo. Con `onSubmit` es un formulario. Al cambiar de paso, el foco va al primer campo o al título.
 */
export function PantallaPaso({
  titulo,
  tam,
  sup,
  sub,
  barra,
  paso,
  total,
  cabecera,
  onSubmit,
  pie,
  nota,
  children,
}: {
  /** Admite ==marca==. */
  titulo: string;
  tam?: number;
  sup?: string;
  sub?: ReactNode;
  barra?: { titulo: string; sub?: string; atras?: AtrasAcceso };
  paso?: number;
  total?: number;
  cabecera?: ReactNode;
  onSubmit?: () => void;
  pie?: ReactNode;
  nota?: ReactNode;
  children?: ReactNode;
}) {
  const cuerpo = useRef<HTMLDivElement>(null);
  const h1 = useRef<HTMLHeadingElement>(null);
  const montado = useRef(false);
  useEffect(() => {
    if (!montado.current) {
      montado.current = true;
      return;
    }
    const campo = cuerpo.current?.querySelector<HTMLElement>(
      'input:not([type=hidden]):not([type=checkbox]):not([type=file]), select, textarea',
    );
    (campo ?? h1.current)?.focus();
  }, [titulo, paso]);

  const dentro = (
    <>
      <TituloDocumento texto={(barra?.titulo ?? titulo).replace(/==/g, '')} />
      {barra ? <BarraCompacta {...barra} /> : null}
      <div className="pantalla__scroll" ref={cuerpo}>
        {cabecera}
        <div className="ds-cuerpo">
          {paso && total ? <Pasos paso={paso} total={total} /> : null}
          <section className="ds-pila" style={{ '--ds-gap': '0.375rem' } as CSSProperties}>
            {sup ? <Etiqueta>{sup}</Etiqueta> : null}
            <h1
              className="ds-titulo"
              tabIndex={-1}
              ref={h1}
              style={tam ? ({ '--ds-tam': `${tam}rem` } as CSSProperties) : undefined}
            >
              <Marca texto={titulo} />
            </h1>
            {sub ? <Sub>{sub}</Sub> : null}
          </section>
          {children}
        </div>
      </div>
      {pie ? <AccionesFijas nota={nota}>{pie}</AccionesFijas> : null}
    </>
  );
  if (!onSubmit) return <div className="pantalla du-app dsa-pantalla">{dentro}</div>;
  return (
    <form
      className="pantalla du-app dsa-pantalla"
      noValidate
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {dentro}
    </form>
  );
}

/** Código de 6 dígitos: un solo campo real (pegar, autocompletar del SMS/email) dibujado como seis cajas. */
export function CampoCodigo({
  etiqueta,
  valor,
  onCambio,
  error,
}: {
  etiqueta: string;
  valor: string;
  onCambio: (v: string) => void;
  error?: string | null;
}) {
  const id = useId();
  const actual = Math.min(valor.length, 5);
  return (
    <div className="ds-pila" style={{ '--ds-gap': '0.375rem' } as CSSProperties}>
      <label htmlFor={id} className="dsa-etiqueta-campo">
        {etiqueta}
      </label>
      <div className="dsa-codigo" data-error={error ? '' : undefined}>
        <input
          id={id}
          className="dsa-codigo__input"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          value={valor}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => onCambio(e.target.value.replace(/\D/g, '').slice(0, 6))}
        />
        {Array.from({ length: 6 }, (_, i) => (
          <span
            key={i}
            className="dsa-codigo__caja"
            aria-hidden="true"
            data-actual={i === actual ? '' : undefined}
          >
            {valor[i] ?? ''}
          </span>
        ))}
      </div>
      {error ? (
        <p id={`${id}-error`} className="dsa-error" role="alert">
          <Icono nombre="alerta" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Casilla de aceptación: arranca sin tildar; toda la caja es el control. */
export function Casilla({
  marcada,
  onCambiar,
  children,
  error,
}: {
  marcada: boolean;
  onCambiar: (v: boolean) => void;
  children: ReactNode;
  error?: string | null;
}) {
  const id = useId();
  return (
    <div className="ds-pila" style={{ '--ds-gap': '0.375rem' } as CSSProperties}>
      <label className="dsa-casilla">
        <input
          type="checkbox"
          checked={marcada}
          aria-describedby={error ? id : undefined}
          onChange={(e) => onCambiar(e.target.checked)}
        />
        <span>{children}</span>
      </label>
      {error ? (
        <p id={id} className="dsa-error" role="alert">
          <Icono nombre="alerta" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Segmentos de una sola elección (tipo de vivienda). */
export function Segmentos<T extends string>({
  etiqueta,
  opciones,
  valor,
  onElegir,
}: {
  etiqueta: string;
  opciones: readonly { valor: T; texto: string }[];
  valor: T | null;
  onElegir: (v: T) => void;
}) {
  return (
    <div className="dsa-seg" role="radiogroup" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button
          key={o.valor}
          type="button"
          role="radio"
          aria-checked={valor === o.valor}
          onClick={() => onElegir(o.valor)}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}

/** Contador con − y + de 44 px (ambientes de la casa). */
export function Contador({
  icono,
  etiqueta,
  valor,
  min = 0,
  max = 9,
  onCambiar,
}: {
  icono: NombreIcono;
  etiqueta: string;
  valor: number;
  min?: number;
  max?: number;
  onCambiar: (n: number) => void;
}) {
  return (
    <div className="dsa-contador">
      <MosaicoIcono icono={icono} tam={2.5} />
      <span className="dsa-contador__texto">{etiqueta}</span>
      <span className="dsa-contador__control" role="group" aria-label={etiqueta}>
        <button
          type="button"
          className="dsa-contador__boton"
          aria-label={`Uno menos: ${etiqueta}`}
          disabled={valor <= min}
          onClick={() => onCambiar(valor - 1)}
        >
          <span aria-hidden="true">−</span>
        </button>
        <output aria-live="polite">{valor}</output>
        <button
          type="button"
          className="dsa-contador__boton dsa-contador__boton--mas"
          aria-label={`Uno más: ${etiqueta}`}
          disabled={valor >= max}
          onClick={() => onCambiar(valor + 1)}
        >
          <span aria-hidden="true">+</span>
        </button>
      </span>
    </div>
  );
}

/** Opción grande con una letra en lugar de ícono (Continuar con Google). */
export function OpcionLetra({
  letra,
  titulo,
  sub,
  onClick,
  ocupado = false,
}: {
  letra: string;
  titulo: string;
  sub: string;
  onClick: () => void;
  ocupado?: boolean;
}) {
  return (
    <button
      type="button"
      className="ds-fila-enlace"
      onClick={onClick}
      disabled={ocupado}
      aria-busy={ocupado || undefined}
    >
      <span
        className="ds-mosaico-ic dsa-letra"
        aria-hidden="true"
        style={{ '--ds-tam': '2.5rem' } as CSSProperties}
      >
        {letra}
      </span>
      <span className="ds-fila-enlace__textos">
        <span className="ds-fila-enlace__titulo">{titulo}</span>
        <span className="ds-fila-enlace__sub">{sub}</span>
      </span>
      <Icono nombre="flecha" />
    </button>
  );
}

const AZUL = '#1F57A8';
const AMARILLO = '#F5F59A';
const EDIFICIOS: readonly [number, number, number][] = [
  [10, 210, 52],
  [66, 160, 44],
  [114, 230, 60],
  [178, 140, 40],
  [222, 200, 54],
  [280, 170, 46],
];

/** Mar del Plata de la bienvenida: edificios de la costa, el faro, la rambla y el mar. Decorativa. */
export function EscenaCiudad({ alto = 430 }: { alto?: number }) {
  const h = alto;
  const ventanas: ReactNode[] = [];
  for (const [x, a, an] of EDIFICIOS) {
    const y = h - 140 - a;
    for (let fy = y + 14; fy < h - 150; fy += 26)
      for (let fx = x + 8; fx < x + an - 10; fx += 14)
        ventanas.push(
          <rect
            key={`${fx}-${fy}`}
            x={fx}
            y={fy}
            width="7"
            height="10"
            fill={(fx * 7 + fy * 3) % 5 === 0 ? AMARILLO : '#4A7CC7'}
          />,
        );
  }
  const ola = (y: number) =>
    `M0 ${y} q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0`;
  return (
    <svg className="ds-escena" viewBox={`0 0 390 ${h}`} aria-hidden="true">
      <rect width="390" height={h} fill={AZUL} />
      <circle cx="300" cy="70" r="30" fill={AMARILLO} />
      {EDIFICIOS.map(([x, a, an]) => (
        <rect key={x} x={x} y={h - 140 - a} width={an} height={a} fill="#2B65B8" />
      ))}
      {ventanas}
      <path d={`M340 ${h - 140} l6 -150 h14 l6 150Z`} fill="#FFFFFF" />
      <rect x="344" y={h - 310} width="22" height="18" fill={AMARILLO} />
      <path d={`M340 ${h - 312} h30 l-15 -14Z`} fill="#E43D30" />
      <path d={`M352 ${h - 250} h10 M350 ${h - 210} h14`} stroke="#E43D30" strokeWidth="10" />
      <rect y={h - 140} width="390" height="22" fill="#E9D9B6" />
      <rect y={h - 118} width="390" height="118" fill="#173F7C" />
      <path d={ola(h - 96)} stroke="#4A7CC7" strokeWidth="3" fill="none" />
      <path d={ola(h - 66)} stroke="#4A7CC7" strokeWidth="3" fill="none" />
    </svg>
  );
}
