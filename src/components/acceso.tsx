'use client';

// Flujos a pantalla completa del rediseño (acceso, registro, onboarding): barra con volver y progreso, título grande con
// marcador, el paso que se desplaza y el pie fijo con el botón principal. Los campos son los de siempre (`Campo`), con
// el aspecto del kit dentro de `.pantalla` (ajustes.css).
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { CONTRASENA_MINIMA, fuerzaContrasena } from '@/domain/formularios';
import { Marcado } from './hx';
import { Icono } from './Icono';
import { Enlace } from './nav';
import { TituloDocumento } from './TituloDocumento';
import type { NombreIcono } from './trazos';
import { Campo } from './ui';

type Atras = { href: string; etiqueta: string } | { alTocar: () => void; etiqueta: string };

/**
 * Una pantalla de flujo. Con `onSubmit` es un formulario (Enter y el botón del pie lo envían). Al cambiar de paso, el
 * contenido entra de costado y el foco va al primer campo (o al título, si el paso no tiene campos).
 */
export function Flujo({
  titulo,
  sub,
  atras,
  paso,
  total,
  onSubmit,
  pie,
  ilustracion,
  clase = '',
  children,
}: {
  titulo: string;
  sub?: React.ReactNode;
  atras?: Atras;
  paso?: number;
  total?: number;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  pie?: React.ReactNode;
  ilustracion?: React.ReactNode;
  clase?: string;
  children?: React.ReactNode;
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
      'input:not([type=hidden]):not([type=checkbox]):not([hidden]), select, textarea',
    );
    (campo ?? h1.current)?.focus();
  }, [paso, titulo]);

  const contenido = (
    <>
      <TituloDocumento texto={titulo.replace(/==/g, '')} />
      <div className="du-flujo__barra">
        {atras ? (
          'href' in atras ? (
            <Enlace className="du-atras" href={atras.href} aria-label={atras.etiqueta}>
              <Icono nombre="atras" />
            </Enlace>
          ) : (
            <button
              type="button"
              className="du-atras"
              aria-label={atras.etiqueta}
              onClick={atras.alTocar}
            >
              <Icono nombre="atras" />
            </button>
          )
        ) : null}
        {paso && total ? (
          <div className="du-flujo__progreso">
            <span className="du-flujo__pista" aria-hidden="true">
              <i style={{ width: `${(paso / total) * 100}%` }} />
            </span>
            <small>
              Paso {paso} de {total}
            </small>
          </div>
        ) : null}
      </div>
      <div className="pantalla__scroll du-flujo__cuerpo" ref={cuerpo}>
        <div className="du-flujo__paso" key={`${paso ?? 0}-${titulo}`}>
          {ilustracion}
          <h1 className="hd-titulo du-flujo__titulo" tabIndex={-1} ref={h1}>
            <Marcado texto={titulo} />
          </h1>
          {sub ? <p className="du-flujo__sub">{sub}</p> : null}
          {children}
        </div>
      </div>
      {pie ? <div className="du-pie du-flujo__pie">{pie}</div> : null}
    </>
  );
  const clases = `pantalla du-app du-flujo ${clase}`.trim();
  return onSubmit ? (
    <form className={clases} onSubmit={onSubmit} noValidate>
      {contenido}
    </form>
  ) : (
    <div className={clases}>{contenido}</div>
  );
}

/** Botón del kit (base que se hunde). Mientras carga, queda deshabilitado y dice "Un momento…". */
export function BotonHx({
  variante,
  cargando = false,
  icono,
  children,
  className = '',
  disabled,
  type = 'button',
  ...resto
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: 'amarillo' | 'claro' | 'blanco' | 'fantasma' | 'exito';
  cargando?: boolean;
  icono?: NombreIcono;
}) {
  return (
    <button
      {...resto}
      type={type}
      className={`hd-boton${variante ? ` hd-boton--${variante}` : ''} ${className}`.trim()}
      disabled={disabled || cargando}
      aria-busy={cargando || undefined}
    >
      {cargando ? (
        'Un momento…'
      ) : (
        <>
          {icono ? <Icono nombre={icono} /> : null}
          {children}
        </>
      )}
    </button>
  );
}

/** Contraseña con "ver/ocultar" y, al crearla, el medidor (con texto: nunca solo color). */
export function CampoContrasena({
  etiqueta,
  valor,
  onCambio,
  error,
  nueva = false,
}: {
  etiqueta: string;
  valor: string;
  onCambio: (v: string) => void;
  error?: string | null | undefined;
  nueva?: boolean;
}) {
  const [ver, setVer] = useState(false);
  const fuerza = fuerzaContrasena(valor);
  return (
    <Campo
      etiqueta={etiqueta}
      error={error}
      {...(nueva ? { ayuda: `Al menos ${CONTRASENA_MINIMA} caracteres.` } : {})}
      requerido
    >
      {(p) => (
        <>
          <span className="du-clave">
            <input
              {...p}
              className="entrada"
              type={ver ? 'text' : 'password'}
              autoComplete={nueva ? 'new-password' : 'current-password'}
              autoCapitalize="off"
              spellCheck={false}
              value={valor}
              onChange={(e) => onCambio(e.target.value)}
            />
            <button
              type="button"
              className="du-clave__ver"
              aria-pressed={ver}
              aria-label="Mostrar la contraseña"
              onClick={() => setVer(!ver)}
            >
              <Icono nombre={ver ? 'ojoTachado' : 'ojo'} />
            </button>
          </span>
          {nueva && valor ? (
            <span className={`du-fuerza du-fuerza--${fuerza.nivel}`} aria-live="polite">
              <span className="du-fuerza__barras" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <small>{fuerza.texto}</small>
            </span>
          ) : null}
        </>
      )}
    </Campo>
  );
}

/** Ilustración de un paso: un Handy sobre un círculo de color (como la escena de la demo). */
export function Escena({
  handy,
  ancho,
  alto,
  tono = 'azul',
  tilde = false,
}: {
  handy: string;
  ancho: number;
  alto: number;
  tono?: 'azul' | 'amarillo';
  tilde?: boolean;
}) {
  return (
    <div className={`du-escena du-escena--${tono}`} data-entra="pop">
      <span className="du-escena__fondo" aria-hidden="true" />
      <Image
        className="hd-handy du-escena__handy"
        src={`/img/${handy}.webp`}
        alt=""
        width={ancho}
        height={alto}
      />
      {tilde ? (
        <span className="hd-tilde" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
      ) : null}
    </div>
  );
}
