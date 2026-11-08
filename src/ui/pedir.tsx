'use client';
// Piezas compartidas de pedir y propuestas (Fase 7 · lienzo design/usuario, filas P y C). Estilos: ds-pedir.css.
import type { ReactNode } from 'react';
import { Marcado, Pantalla, entra } from '@/components/hx';
import { TituloDocumento } from '@/components/TituloDocumento';
import { Icono } from '@/components/Icono';
import { Enlace } from '@/components/nav';
import type { NombreIcono } from '@/components/trazos';
import { Avatar, Monto, MosaicoIcono, type TonoMosaico } from './atomos';
import { Tarjeta } from './moleculas';
import { EscenaPublicado } from './escenas';

export type Volver = { href: string; etiqueta: string } | { alTocar: () => void; etiqueta: string };

/** Barra «← Título» (el h1 de la pantalla). Volver es un enlace o, dentro de un flujo por pasos, un botón. */
export function BarraPedir({
  titulo,
  volver,
  sub,
  accion,
}: {
  titulo: string;
  volver: Volver;
  sub?: ReactNode;
  accion?: ReactNode;
}) {
  return (
    <div className="du-barra dsp-barra" {...entra(0)}>
      <TituloDocumento texto={titulo.replace(/==/g, '')} />
      {'href' in volver ? (
        <Enlace className="du-atras" href={volver.href} aria-label={volver.etiqueta}>
          <Icono nombre="atras" />
        </Enlace>
      ) : (
        <button
          type="button"
          className="du-atras"
          onClick={volver.alTocar}
          aria-label={volver.etiqueta}
        >
          <Icono nombre="atras" />
        </button>
      )}
      <span className="du-barra__textos">
        <h1>
          <strong>
            <Marcado texto={titulo} />
          </strong>
        </h1>
        {sub ? <small>{sub}</small> : null}
      </span>
      {accion}
    </div>
  );
}

/** Pantalla interna: barra, cuerpo DS y acciones fijas abajo (una principal). */
export function PantallaPedir({
  pie,
  nota,
  children,
  onSubmit,
  ...barra
}: {
  titulo: string;
  volver: Volver;
  sub?: ReactNode;
  accion?: ReactNode;
  pie?: ReactNode;
  nota?: ReactNode;
  children: ReactNode;
  /** Con esto el cuerpo y el pie son un formulario (Enter envía). */
  onSubmit?: () => void;
}) {
  const pantalla = (
    <Pantalla
      arriba={
        <div className="du-cuerpo du-cuerpo--ajustado">
          <BarraPedir {...barra} />
        </div>
      }
      pie={
        pie ? (
          <div className="ds ds-pila">
            {nota ? <p className="ds-fijo__nota">{nota}</p> : null}
            {pie}
          </div>
        ) : undefined
      }
    >
      <div className="ds ds-cuerpo">{children}</div>
    </Pantalla>
  );
  return onSubmit ? (
    <form
      className="pantalla"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      {pantalla}
    </form>
  ) : (
    pantalla
  );
}

/** Ícono redondo de la barra (comparar, chat). */
export function AccionBarra({
  icono,
  etiqueta,
  href,
}: {
  icono: NombreIcono;
  etiqueta: string;
  href: string;
}) {
  return (
    <Enlace href={href} className="dsp-cuadro" aria-label={etiqueta}>
      <Icono nombre={icono} />
    </Enlace>
  );
}

/** Mosaico chico (Foto · Medir · De Mi hogar): enlace, o botón que se marca. */
export function MiniAccion({
  icono,
  texto,
  href,
  onClick,
  marcada,
  etiqueta,
}: {
  icono: NombreIcono;
  texto: string;
  href?: string;
  onClick?: () => void;
  marcada?: boolean;
  etiqueta?: string;
}) {
  const dentro = (
    <>
      <Icono nombre={icono} />
      {texto}
    </>
  );
  return href ? (
    <Enlace href={href} className="dsp-mini" aria-label={etiqueta}>
      {dentro}
    </Enlace>
  ) : (
    <button
      type="button"
      className="dsp-mini"
      onClick={onClick}
      aria-pressed={marcada}
      aria-label={etiqueta}
    >
      {dentro}
    </button>
  );
}

/** Fila del resumen: «Cuándo · Lo antes posible · Cambiar». Toda la fila es el botón. */
export function FilaResumen({
  icono,
  etiqueta,
  valor,
  accion,
  onClick,
  falta = false,
}: {
  icono: NombreIcono;
  etiqueta: string;
  valor: ReactNode;
  accion: string;
  onClick: () => void;
  falta?: boolean;
}) {
  return (
    <button
      type="button"
      className="dsp-fila"
      onClick={onClick}
      data-falta={falta ? '' : undefined}
    >
      <MosaicoIcono icono={icono} tam={2.5} />
      <span className="dsp-fila__textos">
        <span className="dsp-fila__etiqueta">{etiqueta}</span>
        <span className="dsp-fila__valor">{valor}</span>
      </span>
      <span className="dsp-fila__accion">
        {accion}
        <span className="ds-solo-lector">: {etiqueta}</span>
      </span>
    </button>
  );
}

/** Dato chico de la tarjeta de propuesta (Dura · Garantía · Equipo). */
export function DatoMini({
  icono,
  etiqueta,
  valor,
}: {
  icono: NombreIcono;
  etiqueta: string;
  valor: string;
}) {
  return (
    <span className="dsp-dato-mini">
      <span className="dsp-dato-mini__etq">
        <Icono nombre={icono} />
        {etiqueta}
      </span>
      <strong>{valor}</strong>
    </span>
  );
}

/** Bloque de precio en tinte que lleva al detalle. */
export function BloquePrecio({
  tipo,
  centavos,
  sub,
  fecha,
  href,
  etiqueta,
}: {
  tipo: string;
  centavos: number;
  sub?: string | null | undefined;
  fecha?: ReactNode;
  href: string;
  etiqueta: string;
}) {
  return (
    <Enlace href={href} className="dsp-precio">
      {/* El nombre accesible es la etiqueta más lo que se ve (WCAG 2.5.3). */}
      <span className="ds-solo-lector">{etiqueta}: </span>
      <span className="dsp-precio__izq">
        <span className="dsp-precio__tipo">{tipo}</span>
        <Monto centavos={centavos} tam={1.875} />
        {sub ? <span className="dsp-precio__sub">{sub}</span> : null}
      </span>
      <span className="dsp-precio__der">
        {fecha}
        <span className="dsp-precio__ver">
          Detalle
          <Icono nombre="flecha" />
        </span>
      </span>
    </Enlace>
  );
}

/** Rechazar (ícono rojo) · Ver perfil · Aceptar. Ninguno decide solo: todos abren una pantalla u hoja. */
export function AccionesPropuesta({
  nombre,
  rechazar,
  perfil,
  aceptar,
  textoAceptar = 'Aceptar',
}: {
  nombre: string;
  rechazar: string;
  perfil: string;
  aceptar: string;
  textoAceptar?: string;
}) {
  return (
    <div className="dsp-acciones">
      <Enlace href={rechazar} className="dsp-rechazar" aria-label={`Rechazar a ${nombre}`}>
        <Icono nombre="cerrar" />
      </Enlace>
      <Enlace
        href={perfil}
        className="ds-boton ds-boton--contorno ds-boton--chico"
        aria-label={`Ver perfil de ${nombre}`}
      >
        <Icono nombre="usuario" />
        Ver perfil
      </Enlace>
      <Enlace
        href={aceptar}
        className="ds-boton ds-boton--primario ds-boton--chico"
        aria-label={`${textoAceptar}: ${nombre}`}
      >
        <Icono nombre="check" />
        {textoAceptar}
      </Enlace>
    </div>
  );
}

/**
 * Chip amarillo que lleva a comparar: es un puntaje con reglas públicas, no una elección de Handyx. Sin superlativos
 * («la mejor»): dice el dato calculado, no un juicio (tests/diseno.test.ts).
 */
export function ChipPromedio({ href }: { href: string }) {
  return (
    <Enlace href={href} className="dsp-chip-enlace">
      <Icono nombre="trofeo" />
      Mayor puntaje
    </Enlace>
  );
}

/** «Mayor puntaje en perfil y precio»: tarjeta amarilla corta (avatar, nombre, puntaje y una frase). */
export function TarjetaPromedio({
  nombre,
  puntaje,
  frase,
}: {
  nombre: string;
  puntaje: string;
  frase: string;
}) {
  return (
    <Tarjeta tono="amarilla" etiqueta="Mayor puntaje en perfil y precio">
      <div className="ds-fila">
        <Avatar nombre={nombre} tam={3} />
        <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.125rem' }}>
          <span className="ds-etiqueta ds-fila" style={{ color: 'inherit', gap: '0.3rem' }}>
            <Icono nombre="trofeo" />
            Mayor puntaje en perfil y precio
          </span>
          <strong className="ds-titulo" style={{ ['--ds-tam' as string]: '1.25rem' }}>
            {nombre}
          </strong>
        </span>
        <span className="ds-pila" style={{ alignItems: 'flex-end', ['--ds-gap' as string]: 0 }}>
          <Monto texto={puntaje} tam={1.75} />
          <span className="ds-etiqueta" style={{ color: 'inherit' }}>
            de 10
          </span>
        </span>
      </div>
      <p className="ds-texto" style={{ color: 'inherit' }}>
        {frase}
      </p>
      <p className="ds-sub" style={{ color: 'inherit' }}>
        Sale de un promedio con las mismas reglas para todas. Elegís vos.
      </p>
    </Tarjeta>
  );
}

export interface PasoSigue {
  readonly icono: NombreIcono;
  readonly titulo: string;
  readonly sub: string;
  readonly tono?: TonoMosaico;
}

/** «Qué sigue»: pasos con mosaico, título y bajada. */
export function QueSigue({ pasos }: { pasos: readonly PasoSigue[] }) {
  return (
    <ol className="dsp-sigue" aria-label="Qué sigue">
      {pasos.map((p) => (
        <li key={p.titulo}>
          <MosaicoIcono icono={p.icono} tam={2.25} tono={p.tono ?? 'tinte'} />
          <span>
            <strong>{p.titulo}</strong>
            <span>{p.sub}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Lo que dijo el especialista con su propuesta. */
export function Cita({ texto, autor }: { texto: string; autor: string }) {
  return (
    <figure className="dsp-cita">
      <blockquote style={{ margin: 0 }}>«{texto}»</blockquote>
      <figcaption>{autor}</figcaption>
    </figure>
  );
}

/** La escena de «¡Pedido publicado!» que arma el pedido al entrar (solo si se permite el movimiento). */
export function EscenaPublicadoArma() {
  return (
    <div className="dsp-escena dsp-escena--arma" aria-hidden="true">
      <EscenaPublicado />
    </div>
  );
}

/** Sello de «¡Turno confirmado!»: círculo azul con tilde, estrella amarilla y papelitos. Decorativo. */
export function SelloTurno() {
  const papel: [number, number, number, string][] = [
    [24, 30, 20, 'var(--ds-amarillo)'],
    [44, 110, 45, 'var(--ds-azul)'],
    [292, 24, 10, 'var(--ds-azul)'],
    [318, 128, 30, 'var(--ds-amarillo)'],
    [36, 190, 60, 'var(--ds-c-c9d3e6)'],
    [300, 206, 75, 'var(--ds-c-c9d3e6)'],
    [170, 6, 15, 'var(--ds-amarillo)'],
  ];
  return (
    <svg className="dsp-sello dsp-sello--entra" viewBox="0 0 350 240" aria-hidden="true">
      {papel.map(([x, y, r, c]) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width="10"
          height="12"
          rx="2"
          fill={c}
          transform={`rotate(${r} ${x + 5} ${y + 6})`}
        />
      ))}
      <circle cx="175" cy="120" r="80" fill="var(--ds-tinte)" />
      <circle cx="175" cy="126" r="58" fill="var(--ds-hondo)" />
      <circle cx="175" cy="120" r="58" fill="var(--ds-azul)" />
      <path
        d="M150 120l17 17 34-36"
        stroke="var(--ds-c-fff)"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="232"
        cy="62"
        r="22"
        fill="var(--ds-amarillo)"
        stroke="var(--ds-c-fff)"
        strokeWidth="4"
      />
      <path
        d="M232 50l3.6 7.4 8.1 1.2-5.9 5.7 1.4 8.1-7.2-3.8-7.2 3.8 1.4-8.1-5.9-5.7 8.1-1.2Z"
        fill="none"
        stroke="var(--ds-tinta)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}
