'use client';

import Image from 'next/image';
import { Barra, entra, Pantalla } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { Enlace, ruta } from '@/components/nav';
import { PREGUNTAS } from '@/content/textos';

/**
 * Centro de ayuda (rediseño 3.8, como u-ayuda): las preguntas frecuentes como pastillas azules y, si no está la
 * respuesta, soporte (lo atiende una persona), un reclamo o HandIA para armar el pedido.
 */
export default function Ayuda() {
  return (
    <Pantalla
      arriba={
        <Barra
          titulo="Centro de ayuda"
          volver={{ href: '/cuenta/', etiqueta: 'Volver a tu cuenta' }}
          sub="Preguntas frecuentes"
        />
      }
      clase="du-ayuda-hx"
    >
      <div className="du-cuerpo du-ayuda">
        <ul className="du-pastillas">
          {PREGUNTAS.map((q, i) => (
            <li key={q.id} {...entra(i + 1)}>
              <Enlace className="du-pastilla" href={ruta('/ayuda/respuesta/', { p: q.id })}>
                <span>{q.p}</span>
                <Icono nombre="derecha" />
              </Enlace>
            </li>
          ))}
        </ul>
        <div className="du-ayuda__pie" {...entra(PREGUNTAS.length + 1)}>
          <Image
            className="hd-handy du-ayuda__handy"
            src="/img/handy-lamparita.webp"
            alt=""
            width={202}
            height={346}
          />
          <p className="du-separador">
            <span>¿No encontraste lo que buscabas?</span>
          </p>
          <Enlace className="hd-boton hd-boton--blanco du-boton-claro-hx" href="/soporte/">
            <Icono nombre="chat" />
            Chatear con soporte
          </Enlace>
          <Enlace className="hd-boton hd-boton--blanco du-boton-claro-hx" href="/reclamos/">
            <Icono nombre="alerta" />
            Ver mis reclamos
          </Enlace>
          <Enlace className="hd-boton hd-boton--fantasma" href="/handia/">
            <Icono nombre="chispas" />
            Armar un pedido con HandIA
          </Enlace>
        </div>
      </div>
    </Pantalla>
  );
}
