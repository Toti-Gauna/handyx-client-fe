'use client';

// Gestos (rediseño 3.9, §7): hojas que se arrastran. Todo gesto tiene su equivalente con teclado y con un toque; nada
// se confirma con un gesto (solo cambia el tamaño o cierra una hoja que también se cierra con Escape o "Cerrar").
import { useRef, useState } from 'react';

/** Distancia (px) que hay que arrastrar para pasar de altura o cerrar. */
export const UMBRAL_ARRASTRE = 48;

/**
 * Arrastre vertical con el puntero. `seguir(dy)` mientras se mueve (para acompañar con el dedo) y `soltar(dy)` al
 * terminar. Un toque sin movimiento no cuenta como arrastre (lo maneja el `onClick` de siempre).
 */
export function useArrastreVertical({
  seguir,
  soltar,
}: {
  seguir?: (dy: number) => void;
  soltar: (dy: number) => void;
}) {
  const inicio = useRef<{ y: number; id: number } | null>(null);
  const movido = useRef(false);
  return {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      inicio.current = { y: e.clientY, id: e.pointerId };
      movido.current = false;
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      const i = inicio.current;
      if (!i || i.id !== e.pointerId) return;
      const dy = e.clientY - i.y;
      if (Math.abs(dy) > 6) movido.current = true;
      if (movido.current) seguir?.(dy);
    },
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
      const i = inicio.current;
      inicio.current = null;
      if (!i || i.id !== e.pointerId) return;
      seguir?.(0);
      if (movido.current) soltar(e.clientY - i.y);
    },
    onPointerCancel: () => {
      inicio.current = null;
      seguir?.(0);
    },
    /** Después de arrastrar, el click que dispara el navegador no tiene que contar como toque. */
    onClickCapture: (e: React.MouseEvent<HTMLElement>) => {
      if (movido.current) {
        e.preventDefault();
        e.stopPropagation();
        movido.current = false;
      }
    },
  };
}

export type AlturaHoja = 'baja' | 'media' | 'alta';
const ORDEN: readonly AlturaHoja[] = ['baja', 'media', 'alta'];
const TEXTO: Record<AlturaHoja, string> = {
  baja: 'achicada',
  media: 'a medio abrir',
  alta: 'abierta',
};

/**
 * Hoja azul con tres alturas (sobre el mapa): se arrastra desde la manija, se cambia con un toque (media ↔ abierta) o
 * con las flechas del teclado. Devuelve las props de la hoja y la manija (un botón real, de 44 px).
 */
export function useHojaAzul(inicial: AlturaHoja = 'media') {
  const [altura, setAltura] = useState<AlturaHoja>(inicial);
  const [arrastre, setArrastre] = useState(0);
  const mover = (pasos: number) =>
    setAltura((a) => ORDEN[Math.min(2, Math.max(0, ORDEN.indexOf(a) + pasos))] ?? a);
  const gesto = useArrastreVertical({
    seguir: (dy) => setArrastre(Math.max(-80, Math.min(80, dy))),
    // Hacia arriba (dy negativo) agranda; hacia abajo achica.
    soltar: (dy) => {
      if (Math.abs(dy) >= UMBRAL_ARRASTRE) mover(dy < 0 ? 1 : -1);
    },
  });
  return {
    altura,
    hoja: {
      'data-altura': altura,
      style: arrastre ? ({ '--hx-arrastre': `${arrastre}px` } as React.CSSProperties) : undefined,
      'data-arrastrando': arrastre ? '' : undefined,
    },
    manija: (
      <button
        type="button"
        className="du-manija-hx"
        aria-label={`Tamaño de la hoja: ${TEXTO[altura]}. Tocá para ${altura === 'alta' ? 'achicarla' : 'agrandarla'}`}
        onClick={() => setAltura((a) => (a === 'alta' ? 'media' : a === 'baja' ? 'media' : 'alta'))}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            mover(1);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            mover(-1);
          }
        }}
        {...gesto}
      >
        <span aria-hidden="true" />
      </button>
    ),
  };
}
