import { SplashControl } from './SplashControl';

/**
 * Pantalla de carga (rediseño, docs/rediseno.md §4). Es HTML y CSS puros: se ve en la primera pintura, sin esperar a
 * que cargue la app, y dura unos 2,5 s. El fondo cambia de color, los Handys entran saltando de a uno, el logotipo
 * sube debajo de ellos y se agarran de sus letras. Se saltea con un toque o una tecla (SplashControl). No aparece con
 * "reducir movimiento" ni en navegadores automatizados (ver el script del <head> en layout.tsx), y es decorativa
 * (aria-hidden): el contenido de la app está detrás y es accesible desde el principio.
 */

// Cada Handy se agarra de una letra del logotipo (posiciones medidas sobre logo-handyx.webp, 720 × 158 px):
// centro de la letra (% del ancho) y altura del borde superior de la letra (% del alto).
const HANDYS = [
  { img: 'handy-lamparita', ancho: 202, alto: 346, letra: 7.2, tope: 5.7, tam: 15 },
  { img: 'handy-gota', ancho: 93, alto: 125, letra: 24.4, tope: 18.4, tam: 10 },
  { img: 'handy-llave', ancho: 581, alto: 547, letra: 41.5, tope: 18.4, tam: 19 },
  { img: 'handy-engranaje', ancho: 338, alto: 339, letra: 58.3, tope: 0.6, tam: 16 },
  { img: 'handy-cano', ancho: 354, alto: 405, letra: 92.6, tope: 19, tam: 17 },
] as const;

export function Splash() {
  return (
    <div className="splash" aria-hidden="true">
      <div className="splash__marca">
        {HANDYS.map((h, i) => (
          <span
            key={h.img}
            className="splash__handy"
            style={
              {
                '--x': `${h.letra}%`,
                '--tope': `${h.tope}%`,
                '--tam': `${h.tam}%`,
                '--i': i,
              } as React.CSSProperties
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- primera pintura, sin el componente de Next */}
            <img src={`/img/${h.img}.webp`} alt="" width={h.ancho} height={h.alto} />
          </span>
        ))}
        {/* eslint-disable-next-line @next/next/no-img-element -- primera pintura, sin el componente de Next */}
        <img className="splash__logo" src="/img/logo-handyx.webp" alt="" width={720} height={158} />
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
