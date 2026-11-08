'use client';

// "Deslizá para confirmar" (rediseño §7): fricción deliberada contra el toque accidental en aceptar y pagar. Nada se
// mueve solo ni brilla para apurar. Es un gesto de puntero: quien no puede o no quiere arrastrar usa el botón
// alternativo que va siempre al lado (WCAG 2.5.7), así que el deslizador no entra en el orden del teclado.
import { useRef, useState } from 'react';
import { Icono } from './Icono';

/** Qué tan lejos hay que llevar la perilla para confirmar (proporción del recorrido). */
export const UMBRAL_DESLIZAR = 0.9;

export function DeslizarConfirmar({
  texto,
  textoCargando = 'Confirmando…',
  cargando = false,
  onConfirmar,
}: {
  texto: string;
  textoCargando?: string;
  cargando?: boolean;
  onConfirmar: () => Promise<boolean> | boolean;
}) {
  const pista = useRef<HTMLDivElement>(null);
  const perilla = useRef<HTMLSpanElement>(null);
  const arrastre = useRef<{ desde: number; maximo: number } | null>(null);
  const [x, setX] = useState(0);
  const [arrastrando, setArrastrando] = useState(false);

  function empezar(e: React.PointerEvent<HTMLSpanElement>) {
    if (cargando || !pista.current || !perilla.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const maximo = pista.current.clientWidth - perilla.current.offsetWidth - 8;
    arrastre.current = { desde: e.clientX - x, maximo };
    setArrastrando(true);
  }
  function mover(e: React.PointerEvent<HTMLSpanElement>) {
    const a = arrastre.current;
    if (!a) return;
    setX(Math.min(a.maximo, Math.max(0, e.clientX - a.desde)));
  }
  async function soltar() {
    const a = arrastre.current;
    arrastre.current = null;
    setArrastrando(false);
    if (!a) return;
    if (x < a.maximo * UMBRAL_DESLIZAR) {
      setX(0);
      return;
    }
    setX(a.maximo);
    const ok = await onConfirmar();
    if (!ok) setX(0);
  }

  return (
    <div
      ref={pista}
      className={`du-deslizar${arrastrando ? ' du-deslizar--arrastrando' : ''}${cargando ? ' du-deslizar--cargando' : ''}`}
      aria-hidden="true"
    >
      <span className="du-deslizar__relleno" style={{ width: `calc(${x}px + 3.4em)` }} />
      <span className="du-deslizar__texto">{cargando ? textoCargando : texto}</span>
      <span
        ref={perilla}
        className="du-deslizar__perilla"
        style={{ transform: `translateX(${x}px)` }}
        onPointerDown={empezar}
        onPointerMove={mover}
        onPointerUp={() => void soltar()}
        onPointerCancel={() => {
          arrastre.current = null;
          setArrastrando(false);
          setX(0);
        }}
      >
        <Icono nombre={cargando ? 'reloj' : 'flecha'} />
      </span>
    </div>
  );
}
