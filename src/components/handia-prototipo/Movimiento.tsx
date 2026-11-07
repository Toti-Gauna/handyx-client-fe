'use client';

// R5 · Movimiento, sonido y vibración de HandIA. GSAP solo en el prototipo (en la app, H2/H3 deciden si alcanza con
// CSS). Con "reducir movimiento" las escenas saltan a su estado final sin animar.
import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { Icono } from '@/components/Icono';
import {
  BotonPremium,
  BurbujaHandia,
  Escena,
  type EstadoOrbe,
  Orbe,
  TarjetaVidrio,
} from '@/components/handia/piezas';
import { type Sonido, sonar, vibrar } from './sonidos';

const CURVAS = [
  [
    '--hia-curva-entrada',
    'Entrada',
    [0.16, 1, 0.3, 1],
    'Burbujas, tarjetas, escenas: sale rápido y se asienta',
  ],
  [
    '--hia-curva-resorte',
    'Resorte',
    [0.34, 1.56, 0.64, 1],
    'Solo el personaje y las chispas: un rebote chico',
  ],
  ['--hia-curva-salida', 'Salida', [0.7, 0, 0.84, 0], 'Lo que se va: acelera y desaparece'],
] as const;

const DURACIONES = [
  ['--hia-dur-micro', '160 ms', 'Chips y presión de botones'],
  ['--hia-dur-entrada', '380 ms', 'Una burbuja o una tarjeta que entra'],
  ['--hia-dur-estado', '520 ms', 'El orbe cambia de estado'],
  ['--hia-dur-escena', '700 ms', 'Del chat a la voz y vuelta'],
] as const;

function Curva({ p }: { p: readonly [number, number, number, number] }) {
  const [x1, y1, x2, y2] = p;
  const y = (v: number) => 100 - v * 100;
  return (
    <svg className="hxm-curva" viewBox="-10 -70 120 200" aria-hidden="true">
      <path className="hxm-curva__eje" d="M0 100H100M0 100V0" />
      <path d={`M0 100C${x1 * 100} ${y(y1)} ${x2 * 100} ${y(y2)} 100 0`} />
    </svg>
  );
}

const reducido = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Escena 1: del chat a la voz. La voz se abre como un círculo desde el botón "Voz" y el orbe baja al centro. */
function ChatAVoz() {
  const raiz = useRef<HTMLDivElement>(null);
  const linea = useRef<gsap.core.Timeline | null>(null);
  const [abierta, setAbierta] = useState(false);

  useEffect(() => {
    const r = raiz.current;
    if (!r) return;
    const ctx = gsap.context(() => {
      linea.current = gsap
        .timeline({ paused: true, defaults: { ease: 'expo.out' } })
        .set('.hxm-capa--voz', { visibility: 'visible' })
        .fromTo(
          '.hxm-capa--voz',
          { clipPath: 'circle(0% at 86% 7%)' },
          { clipPath: 'circle(150% at 86% 7%)', duration: 0.7 },
        )
        .to('.hxm-capa--chat', { filter: 'blur(6px)', opacity: 0.4, duration: 0.5 }, 0)
        .fromTo(
          '.hxm-capa--voz .hia-orbe',
          { scale: 0.25, y: -170, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 0.8, ease: 'back.out(1.4)' },
          0.1,
        )
        .fromTo(
          '.hxm-entra',
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.06, duration: 0.5 },
          0.35,
        );
    }, r);
    return () => ctx.revert();
  }, []);

  const alternar = () => {
    const tl = linea.current;
    if (!tl) return;
    const abrir = !abierta;
    setAbierta(abrir);
    if (reducido()) {
      // Sin animar: salta al final o al principio (el set del instante 0 no se deshace solo).
      tl.progress(abrir ? 1 : 0).pause();
      if (!abrir)
        gsap.set(raiz.current?.querySelector('.hxm-capa--voz') ?? [], { visibility: 'hidden' });
    } else if (abrir) tl.timeScale(1).play();
    else tl.timeScale(1.6).reverse();
  };

  return (
    <div className="hxm-demo">
      <div className="hxm-marco" ref={raiz}>
        <Escena tipo="chat" className="hxm-capa hxm-capa--chat">
          <div className="hia-chat-cab">
            <span className="hia-chat-cab__quien">
              <strong>HandIA</strong>
              <small>En tu celular</small>
            </span>
            <span className="hia-pildora">
              <Icono nombre="onda" className="hia-ico" /> Voz
            </span>
          </div>
          <div className="hia-hilo">
            <BurbujaHandia de="ia">Contame qué pasa en tu casa.</BurbujaHandia>
          </div>
        </Escena>
        <Escena tipo="voz" className="hxm-capa hxm-capa--voz hia-voz">
          <Orbe estado="escuchando" tamano="chico" />
          <p className="hia-rotulo hxs-centro hxm-entra">Te escucho</p>
          <p className="hia-display hxs-centro hxm-entra">Pierde la canilla del baño…</p>
          <div className="hia-control hxm-entra">
            <span className="hia-control__lado">
              <Icono nombre="teclado" className="hia-ico" />
            </span>
            <span className="hia-mic">
              <Icono nombre="microfono" className="hia-ico" />
            </span>
            <span className="hia-control__lado">
              <Icono nombre="encuadre" className="hia-ico" />
            </span>
          </div>
        </Escena>
      </div>
      <div className="hxm-texto">
        <h4>Del chat a la voz</h4>
        <p>
          La voz se abre como un círculo desde el botón que tocaste (700 ms, curva de entrada); el
          chat se desenfoca detrás para que se note que es la misma conversación. Al volver, lo
          mismo al revés y más rápido.
        </p>
        <BotonPremium variante="destacado" icono={abierta ? 'teclado' : 'onda'} onClick={alternar}>
          {abierta ? 'Volver al chat' : 'Abrir modo voz'}
        </BotonPremium>
        <p className="sr-only" aria-live="polite">
          {abierta ? 'Modo voz abierto' : 'Chat'}
        </p>
      </div>
    </div>
  );
}

/** Escena 2: la ficha se arma. Entran cabecera, datos y texto; los botones de pedir aparecen quietos. */
function armarFicha(r: HTMLElement) {
  if (reducido()) return;
  gsap.context(() => {
    gsap
      .timeline({ defaults: { ease: 'expo.out' } })
      .from('.hia-ficha__cab', { y: 14, opacity: 0, duration: 0.45 })
      .from(
        '.hia-chip--dato',
        { scale: 0.6, opacity: 0, stagger: 0.07, duration: 0.4, ease: 'back.out(2)' },
        0.15,
      )
      .from('.hia-ficha__texto', { clipPath: 'inset(0 100% 0 0)', duration: 0.6 }, 0.35);
  }, r);
}

function FichaSeArma() {
  const raiz = useRef<HTMLDivElement>(null);
  const armar = () => {
    if (raiz.current) armarFicha(raiz.current);
  };

  useEffect(() => {
    if (raiz.current) armarFicha(raiz.current);
  }, []);

  return (
    <div className="hxm-demo">
      <div className="hxm-marco hxm-marco--bajo" ref={raiz}>
        <Escena tipo="chat" className="hxm-capa hxm-capa--centrada">
          <TarjetaVidrio className="hia-ficha">
            <div className="hia-ficha__cab">
              <span className="hia-ficha__ico">
                <Icono nombre="canilla" className="hia-ico" />
              </span>
              <div>
                <span className="hia-suave">Tu pedido</span>
                <p className="hia-ficha__titulo">Plomería</p>
              </div>
            </div>
            <div className="hia-chips">
              <span className="hia-chip hia-chip--dato">En el baño</span>
              <span className="hia-chip hia-chip--dato">Pierde o gotea</span>
              <span className="hia-chip hia-chip--dato">Desde ayer</span>
            </div>
            <p className="hia-ficha__texto">Pierde la canilla del baño, gotea toda la noche.</p>
            <div className="hia-ficha__acciones">
              <BotonPremium icono="calendario">Programar turno</BotonPremium>
              <BotonPremium variante="vidrio" icono="reloj">
                Para hoy
              </BotonPremium>
            </div>
          </TarjetaVidrio>
        </Escena>
      </div>
      <div className="hxm-texto">
        <h4>La ficha se arma</h4>
        <p>
          Primero qué es, después los datos uno a uno (con un rebote chico) y el texto se escribe.
          Los botones de pedir ya están quietos desde el principio: nunca se animan.
        </p>
        <BotonPremium variante="vidrio" icono="reintentar" onClick={armar}>
          Repetir
        </BotonPremium>
      </div>
    </div>
  );
}

/** Escena 3: pedido listo, con sonido y vibración. */
function Listo() {
  const raiz = useRef<HTMLDivElement>(null);
  const [estado, setEstado] = useState<EstadoOrbe>('pensando');
  const [aviso, setAviso] = useState('');

  const probar = (cual: Sonido) => {
    const sono = sonar(cual);
    const vibro = vibrar(cual);
    setAviso(
      `${sono ? 'Sonó' : 'Este navegador no puede sonar'} · ${
        vibro ? 'vibró' : 'sin vibración (el iPhone no la ofrece a la web)'
      }`,
    );
  };

  const listo = () => {
    setEstado('listo');
    probar('listo');
    if (raiz.current && !reducido())
      gsap.fromTo(
        raiz.current.querySelector('.hia-orbe'),
        { scale: 0.9 },
        { scale: 1, duration: 0.7, ease: 'back.out(3)' },
      );
  };

  return (
    <div className="hxm-demo">
      <div className="hxm-marco hxm-marco--bajo" ref={raiz}>
        <Escena tipo="voz" className="hxm-capa hxm-capa--centrada">
          <Orbe estado={estado} />
          <p className="hia-rotulo hxs-centro">
            {estado === 'listo' ? 'Pedido listo' : 'Pensando'}
          </p>
        </Escena>
      </div>
      <div className="hxm-texto">
        <h4>Sonido y vibración</h4>
        <p>
          Tres sonidos originales, sintetizados en el teléfono (sin archivos): empezar a escuchar
          (dos notas que suben), terminar (bajan) y pedido listo (un acorde que se prende).
          Vibración cortísima en Android. En la app suenan solo en modo voz y se pueden apagar.
        </p>
        <div className="hxm-botones">
          <BotonPremium variante="destacado" icono="chispas" onClick={listo}>
            Pedido listo
          </BotonPremium>
          <BotonPremium variante="vidrio" icono="microfono" onClick={() => probar('empezar')}>
            Empezar
          </BotonPremium>
          <BotonPremium variante="vidrio" icono="check" onClick={() => probar('terminar')}>
            Terminar
          </BotonPremium>
          <BotonPremium variante="vidrio" icono="reintentar" onClick={() => setEstado('pensando')}>
            Reiniciar
          </BotonPremium>
        </div>
        <p className="hxm-aviso" role="status">
          {aviso}
        </p>
      </div>
    </div>
  );
}

export function Movimiento() {
  return (
    <div className="hxm">
      <p className="hxp-intro">
        Cómo se mueve, suena y vibra HandIA. Movimiento funcional: dice qué cambió y adónde fue,
        nunca decora un botón de pedir. Con &ldquo;reducir movimiento&rdquo; todo salta a su estado
        final.
      </p>

      <h3>Curvas</h3>
      <div className="hxm-curvas">
        {CURVAS.map(([t, n, p, uso]) => (
          <figure key={t}>
            <Curva p={p} />
            <figcaption>
              <strong>{n}</strong>
              <code>{t}</code>
              <span>{uso}</span>
            </figcaption>
          </figure>
        ))}
      </div>

      <h3>Duraciones</h3>
      <table className="hxm-tabla">
        <thead>
          <tr>
            <th scope="col">Token</th>
            <th scope="col">Duración</th>
            <th scope="col">Para qué</th>
          </tr>
        </thead>
        <tbody>
          {DURACIONES.map(([t, d, u]) => (
            <tr key={t}>
              <td>
                <code>{t}</code>
              </td>
              <td>{d}</td>
              <td>{u}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Escenas</h3>
      <ChatAVoz />
      <FichaSeArma />
      <Listo />
    </div>
  );
}
