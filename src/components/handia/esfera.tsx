'use client';

// Esfera de HandIA: cielo Handyx pintado. Las nubes son ruido fractal de SVG (feTurbulence) que el navegador genera en
// el momento (sin imágenes), con borde nítido y grano fino; abajo, la luz cálida de la lamparita. Decorativa.
import { useId } from 'react';

export type EstadoEsfera = 'reposo' | 'escuchando' | 'pensando' | 'hablando' | 'listo' | 'silencio';

export function Esfera({
  estado = 'reposo',
  tamano = 'grande',
}: {
  estado?: EstadoEsfera;
  tamano?: 'grande' | 'chica' | 'mini';
}) {
  const base = useId().replace(/[^a-zA-Z0-9]/g, '');
  const nubes = `hia-nubes-${base}`;
  const grano = `hia-grano-${base}`;
  // En los tamaños chicos alcanza con menos detalle (y cuesta menos dibujarlo).
  const octavas = tamano === 'grande' ? 5 : 3;
  return (
    <span
      className={`hia-esfera${tamano === 'grande' ? '' : ` hia-esfera--${tamano}`}`}
      data-estado={estado}
      aria-hidden="true"
    >
      <svg
        className="hia-esfera__nubes"
        viewBox="0 0 200 200"
        preserveAspectRatio="none"
        focusable="false"
      >
        <filter id={nubes} x="0" y="0" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.009 0.022"
            numOctaves={octavas}
            seed="11"
          />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2.6 0 0 0 -1.05" />
        </filter>
        <rect width="200" height="200" filter={`url(#${nubes})`} />
      </svg>
      <svg
        className="hia-esfera__grano"
        viewBox="0 0 200 200"
        preserveAspectRatio="none"
        focusable="false"
      >
        <filter id={grano} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 -0.2" />
        </filter>
        <rect width="200" height="200" filter={`url(#${grano})`} />
      </svg>
      <i className="hia-esfera__calor" />
    </span>
  );
}
