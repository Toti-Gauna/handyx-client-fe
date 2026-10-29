import { SplashControl } from './SplashControl';

/**
 * Pantalla de carga (rediseño, docs/rediseno.md §4). HTML y CSS puros: se ve en la primera pintura, sin esperar a que
 * cargue la app. Ondas de color desde el centro; los Handys entran saltando; las letras de "Handyx" caen de a una
 * delante de ellos, que quedan asomados y agarrados de su letra; confeti de mosaicos y salida circular hacia la app
 * (≈ 3 s, línea de tiempo en splash.css). Se saltea con un toque o una tecla (SplashControl). No aparece con
 * "reducir movimiento" ni en navegadores automatizados (script del <head> en layout.tsx) y es decorativa (aria-hidden).
 */

// Letras del logotipo (logo-handyx.webp, 720 × 158 px): inicio y fin horizontal en px, medidos sobre la imagen.
const LETRAS = [
  [1, 104],
  [128, 224],
  [252, 346],
  [371, 468],
  [489, 586],
  [613, 720],
] as const;
const ANCHO_LOGO = 720;

// Cada Handy se asoma detrás de una letra (índice en LETRAS) y se agarra de su borde superior (`tope`, % del alto).
const HANDYS = [
  { img: 'handy-lamparita', ancho: 202, alto: 346, letra: 0, tope: 6, tam: 15 },
  { img: 'handy-gota', ancho: 93, alto: 125, letra: 1, tope: 18, tam: 12 },
  { img: 'handy-llave', ancho: 581, alto: 547, letra: 2, tope: 18, tam: 20 },
  { img: 'handy-engranaje', ancho: 338, alto: 339, letra: 3, tope: 1, tam: 17 },
  { img: 'handy-cano', ancho: 354, alto: 405, letra: 5, tope: 19, tam: 17 },
] as const;

// Confeti de mosaicos: hacia dónde vuela (en tamaños de la pieza), giro y color.
const CONFETI = [
  [-6, -4, 140, 'amarillo'],
  [-4, -6, -90, 'blanco'],
  [-1, -7, 200, 'amarillo'],
  [2, -6.5, -160, 'celeste'],
  [4.5, -5.5, 110, 'blanco'],
  [6, -4, -70, 'amarillo'],
  [-7, -1.5, 60, 'celeste'],
  [7, -1, -120, 'blanco'],
] as const;

const pct = (n: number) => `${((n / ANCHO_LOGO) * 100).toFixed(2)}%`;
const centro = (i: number) => {
  const [a, b] = LETRAS[i]!;
  return pct((a + b) / 2);
};

export function Splash() {
  return (
    <div className="splash" aria-hidden="true">
      <span className="splash__onda splash__onda--1" />
      <span className="splash__onda splash__onda--2" />
      <span className="splash__onda splash__onda--3" />
      <div className="splash__marca">
        {HANDYS.map((h, i) => (
          <span
            key={h.img}
            className="splash__handy"
            style={
              {
                '--x': centro(h.letra),
                '--tope': `${h.tope}%`,
                '--tam': `${h.tam}%`,
                '--i': i,
                '--l': h.letra,
              } as React.CSSProperties
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- primera pintura, sin el componente de Next */}
            <img src={`/img/${h.img}.webp`} alt="" width={h.ancho} height={h.alto} />
          </span>
        ))}
        {LETRAS.map(([a, b], i) => (
          <span
            key={a}
            className="splash__letra"
            style={
              {
                left: pct(a),
                width: pct(b - a),
                '--i': i,
              } as React.CSSProperties
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- primera pintura, sin el componente de Next */}
            <img
              src="/img/logo-handyx.webp"
              alt=""
              width={720}
              height={158}
              style={{
                width: `${(ANCHO_LOGO / (b - a)) * 100}%`,
                left: `${(-a / (b - a)) * 100}%`,
              }}
            />
          </span>
        ))}
        {CONFETI.map(([dx, dy, giro, color], i) => (
          <i
            key={i}
            className={`splash__confeti splash__confeti--${color}`}
            style={{ '--dx': dx, '--dy': dy, '--giro': `${giro}deg` } as React.CSSProperties}
          />
        ))}
      </div>
      <p className="splash__lema">Soluciones, no problemas</p>
      <SplashControl />
    </div>
  );
}

/**
 * Script del <head>: marca el documento antes de la primera pintura cuando la pantalla de carga no corresponde
 * (navegador automatizado, salvo `?splash=1` para probarla). No guarda nada.
 */
export const SCRIPT_SPLASH =
  "if(navigator.webdriver&&!/[?&]splash=1/.test(location.search))document.documentElement.classList.add('sin-splash')";
