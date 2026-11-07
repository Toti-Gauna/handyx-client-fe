'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';
import { Marcado } from '@/components/hx';
import { Enlace } from '@/components/nav';
import { TituloDocumento } from '@/components/TituloDocumento';
import { esVistaDePrueba } from '@/data';

const TARJETAS = [
  {
    handy: 'handy-cano',
    ancho: 354,
    alto: 405,
    titulo: 'Contá qué ==pasó==',
    texto:
      'Con tus palabras o con HandIA, y con fotos si querés. Elegís si es para hoy o para otro día.',
  },
  {
    handy: 'handy-llave',
    ancho: 581,
    alto: 547,
    titulo: 'Recibí ==propuestas==',
    texto:
      'Especialistas de Mar del Plata te mandan precio y materiales. Comparás antes de elegir.',
  },
  {
    handy: 'handy-lamparita',
    ancho: 202,
    alto: 346,
    titulo: 'Elegís ==vos==',
    texto:
      'Ves el total antes de aceptar y le pagás directo al especialista: Mercado Pago o efectivo.',
  },
] as const;

/** Bienvenida (rediseño 3.2): pantalla azul con los Handys, 3 tarjetas deslizables y las dos entradas. */
export default function Bienvenida() {
  const [actual, setActual] = useState(0);
  const carril = useRef<HTMLDivElement>(null);

  function irA(i: number) {
    const c = carril.current;
    c?.scrollTo({ left: i * c.clientWidth, behavior: 'smooth' });
  }

  return (
    <div className="pantalla du-app du-bienvenida-app hd-entrando">
      <TituloDocumento texto="Bienvenida" />
      <div className="du-bienvenida-app__arriba" data-entra="">
        <h1 className="du-bienvenida-app__logo">
          <Image src="/img/logo-handyx.webp" alt="Handyx" width={720} height={158} priority />
        </h1>
        <p>Especialistas del hogar en Mar del Plata</p>
      </div>

      <div
        ref={carril}
        className="du-carril-bienvenida"
        role="region"
        aria-roledescription="carrusel"
        aria-label="Cómo funciona"
        tabIndex={0}
        onScroll={(e) => {
          const c = e.currentTarget;
          setActual(Math.round(c.scrollLeft / Math.max(1, c.clientWidth)));
        }}
      >
        {TARJETAS.map((t, i) => (
          <section
            key={t.handy}
            className="du-carril-bienvenida__tarjeta"
            role="group"
            aria-roledescription="tarjeta"
            aria-label={`${i + 1} de ${TARJETAS.length}`}
          >
            <span className="du-carril-bienvenida__escena" aria-hidden="true">
              <i />
              <Image
                className="hd-handy"
                src={`/img/${t.handy}.webp`}
                alt=""
                width={t.ancho}
                height={t.alto}
              />
            </span>
            <h2 className="hd-titulo hd-titulo--claro">
              <Marcado texto={t.titulo} />
            </h2>
            <p>{t.texto}</p>
          </section>
        ))}
      </div>
      <div className="du-puntos">
        {TARJETAS.map((t, i) => (
          <button
            key={t.handy}
            type="button"
            className="du-puntos__punto"
            aria-label={`Ver la tarjeta ${i + 1}`}
            aria-current={actual === i ? 'true' : undefined}
            onClick={() => irA(i)}
          >
            <i />
          </button>
        ))}
      </div>

      <div className="du-pie du-bienvenida-app__pie">
        <Enlace className="hd-boton hd-boton--amarillo" href="/registro/">
          Crear cuenta
        </Enlace>
        <Enlace className="hd-boton du-boton-borde" href="/ingresar/">
          Ya tengo cuenta
        </Enlace>
        <p className="du-bienvenida-app__nota">
          La demo es cerrada: para crear tu cuenta necesitás una invitación.
        </p>
        {esVistaDePrueba ? (
          <Enlace className="du-bienvenida-app__mapa" href="/mapa/">
            Ver el mapa de pantallas
          </Enlace>
        ) : null}
      </div>
    </div>
  );
}
