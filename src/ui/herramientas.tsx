'use client';
// Piezas compartidas de las herramientas del teléfono (medir, nivel, linterna y lupa, escanear, AR, destino).
// Estilos: src/styles/ds-herramientas.css. Oscuro solo en las pantallas de cámara y nivel.
import { type KeyboardEvent, type PointerEvent, type ReactNode, useEffect, useRef } from 'react';
import { Icono } from '@/components/Icono';
import { Enlace } from '@/components/nav';
import { TituloDocumento } from '@/components/TituloDocumento';
import type { NombreIcono } from '@/components/trazos';
import { type Punto, moverPunto, puntoDesdeEvento } from '@/domain/herramientas';
import { Boton, Chip, MosaicoIcono } from './atomos';
import { Nota } from './moleculas';

/** Mosaico grande de la portada: ícono, nombre y una línea que explica. */
export function Herramienta({
  icono,
  titulo,
  sub,
  href,
  experimental = false,
}: {
  icono: NombreIcono;
  titulo: string;
  sub: string;
  href: string;
  experimental?: boolean;
}) {
  return (
    <Enlace href={href} className="dh-herramienta">
      <span className="dh-herramienta__icono" aria-hidden="true">
        <Icono nombre={icono} />
      </span>
      <strong>{titulo}</strong>
      <span className="dh-herramienta__sub">{sub}</span>
      {experimental ? <Chip tono="amarillo">Experimental</Chip> : null}
    </Enlace>
  );
}

/** «El teléfono no detecta gas, tensión ni monóxido». */
export function AvisoSeguridad() {
  return (
    <Nota icono="alerta" tono="amarillo">
      El teléfono no detecta gas, tensión ni monóxido. Si tenés dudas, pedile ayuda a un
      especialista.
    </Nota>
  );
}

/** Pantalla oscura con la barra «← Título», la escena en el medio y el pie con lo que se hace. */
export function PantallaOscura({
  titulo,
  volver = '/herramientas/',
  derecha,
  escena,
  children,
}: {
  titulo: string;
  volver?: string;
  derecha?: ReactNode;
  /** Lo que ocupa el centro (cámara, burbuja). */
  escena: ReactNode;
  /** Pie: instrucciones y botones. */
  children: ReactNode;
}) {
  return (
    <div className="pantalla dh-oscura">
      <TituloDocumento texto={titulo} />
      <header className="dh-cab">
        <Enlace href={volver} className="dh-atras" aria-label="Volver a las herramientas">
          <Icono nombre="atras" />
        </Enlace>
        <h1 className="dh-cab__titulo">{titulo}</h1>
        {derecha ?? <span className="dh-cab__vacio" aria-hidden="true" />}
      </header>
      <div className="dh-escena">{escena}</div>
      <div className="dh-pie">{children}</div>
    </div>
  );
}

/** Vista de la cámara. Las pistas las apaga quien abrió la cámara (useCamara), no este componente. */
export function VideoCamara({ stream, zoom = 1 }: { stream: MediaStream; zoom?: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.srcObject = stream;
    v.play().catch(() => undefined);
    return () => {
      v.srcObject = null;
    };
  }, [stream]);
  return (
    <video
      ref={ref}
      className="dh-video"
      style={{ transform: zoom === 1 ? undefined : `scale(${zoom})` }}
      autoPlay
      muted
      playsInline
      aria-label="Lo que ve la cámara"
    />
  );
}

/** Tarjeta que explica por qué se pide un permiso, antes de pedirlo. */
export function PedirPermiso({
  icono,
  titulo,
  texto,
  boton,
  onPedir,
  ocupado = false,
  problema,
  otro,
}: {
  icono: NombreIcono;
  titulo: string;
  texto: string;
  boton: string;
  onPedir: () => void;
  ocupado?: boolean;
  /** Qué pasó si no se pudo (se anuncia). */
  problema?: string | null;
  /** Alternativa secundaria. */
  otro?: ReactNode;
}) {
  return (
    <section className="dh-permiso" aria-labelledby="dh-permiso-t">
      <MosaicoIcono icono={icono} tam={3.5} />
      <h2 id="dh-permiso-t" className="dh-permiso__titulo">
        {titulo}
      </h2>
      <p className="dh-permiso__texto">{texto}</p>
      {problema ? (
        <Nota icono="info" tono="error" rol="alert">
          {problema}
        </Nota>
      ) : null}
      <Boton icono={icono} onClick={onPedir} ocupado={ocupado}>
        {ocupado ? 'Esperando tu permiso…' : boton}
      </Boton>
      {otro}
    </section>
  );
}

/** Pasos numerados de un recorrido que todavía no está disponible. */
export function PasosExplicados({ pasos }: { pasos: readonly { titulo: string; sub: string }[] }) {
  return (
    <ol className="dh-pasos" aria-label="Cómo va a ser">
      {pasos.map((p, i) => (
        <li key={p.titulo}>
          <span className="dh-pasos__num" aria-hidden="true">
            {i + 1}
          </span>
          <span className="dh-pasos__textos">
            <strong>{p.titulo}</strong>
            <span>{p.sub}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Aviso fijo de lo que todavía no funciona: sin 3D ni AR de mentira. */
export function NoDisponible({ children }: { children: ReactNode }) {
  return (
    <Nota icono="info" tono="gris" rol="status">
      <strong>Todavía no está disponible en este teléfono.</strong> {children}
    </Nota>
  );
}

/**
 * Punto que se arrastra con el dedo o se mueve con las flechas del teclado. `punto` va de 0 a 1 respecto del cuadro
 * (el padre posicionado). Toque de 44 px como mínimo.
 */
export function PuntoArrastrable({
  punto,
  etiqueta,
  onMover,
}: {
  punto: Punto;
  etiqueta: string;
  onMover: (p: Punto) => void;
}) {
  const alMover = (e: PointerEvent<HTMLButtonElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const caja = e.currentTarget.parentElement?.getBoundingClientRect();
    if (caja) onMover(puntoDesdeEvento(e.clientX, e.clientY, caja));
  };
  const alTeclear = (e: KeyboardEvent<HTMLButtonElement>) => {
    const paso = e.shiftKey ? 0.05 : 0.01;
    const d: Record<string, [number, number]> = {
      ArrowLeft: [-paso, 0],
      ArrowRight: [paso, 0],
      ArrowUp: [0, -paso],
      ArrowDown: [0, paso],
    };
    const mov = d[e.key];
    if (!mov) return;
    e.preventDefault();
    onMover(moverPunto(punto, mov[0], mov[1]));
  };
  return (
    <button
      type="button"
      className="dh-punto"
      style={{ left: `${punto.x * 100}%`, top: `${punto.y * 100}%` }}
      aria-label={`${etiqueta}. Arrastralo con el dedo o movelo con las flechas.`}
      onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
      onPointerMove={alMover}
      onKeyDown={alTeclear}
    >
      <span aria-hidden="true" />
    </button>
  );
}
