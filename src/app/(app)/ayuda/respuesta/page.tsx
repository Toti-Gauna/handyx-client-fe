'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Barra, entra, Pantalla } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { Enlace, ruta } from '@/components/nav';
import { PREGUNTAS } from '@/content/textos';

/**
 * Respuesta del centro de ayuda (rediseño 3.8, como u-ayuda-detalle): la respuesta con su atajo, "¿Te sirvió?" y las
 * otras preguntas. El voto queda solo en esta pantalla: no se envía ni se guarda (no hay endpoint ni hace falta para
 * ayudar). Si no sirvió, se ofrece escribirle al equipo.
 */
export default function Respuesta() {
  const id = useSearchParams().get('p');
  const q = PREGUNTAS.find((x) => x.id === id) ?? PREGUNTAS[0]!;
  const [voto, setVoto] = useState<{ pregunta: string; sirvio: boolean } | null>(null);
  const sirvio = voto?.pregunta === q.id ? voto.sirvio : null;

  return (
    <Pantalla
      key={q.id}
      arriba={
        <Barra
          titulo="Centro de ayuda"
          volver={{ href: '/ayuda/', etiqueta: 'Volver a las preguntas' }}
        />
      }
      clase="du-ayuda-hx"
    >
      <div className="du-cuerpo du-ayuda">
        <article className="du-respuesta" aria-labelledby="pregunta" {...entra(1)}>
          <h2 id="pregunta" className="du-respuesta__pregunta">
            <Icono nombre="pregunta" />
            <span>{q.p}</span>
          </h2>
          <div className="du-respuesta__cuerpo">
            <p>{q.r}</p>
            {q.ir ? (
              <Enlace className="hd-boton hd-boton--blanco du-boton-claro-hx" href={q.ir.href}>
                {q.ir.texto}
                <Icono nombre="flecha" />
              </Enlace>
            ) : null}
          </div>
        </article>

        <section className="du-sirvio" aria-labelledby="sirvio-t" {...entra(2)}>
          <h2 id="sirvio-t" className="hd-sobre">
            ¿Te sirvió la respuesta?
          </h2>
          {sirvio === null ? (
            <div className="du-sirvio__botones">
              <button
                type="button"
                className="hd-boton hd-boton--chico hd-boton--blanco du-boton-claro-hx"
                onClick={() => setVoto({ pregunta: q.id, sirvio: false })}
              >
                No
              </button>
              <button
                type="button"
                className="hd-boton hd-boton--chico"
                onClick={() => setVoto({ pregunta: q.id, sirvio: true })}
              >
                Sí
              </button>
            </div>
          ) : (
            <div className="du-sirvio__gracias-hx" role="status">
              <p className="hd-chip hd-chip--exito du-sirvio__gracias">
                <Icono nombre="check" />
                ¡Gracias por contarnos!
              </p>
              {sirvio ? null : (
                <Enlace className="hd-boton hd-boton--blanco du-boton-claro-hx" href="/soporte/">
                  <Icono nombre="chat" />
                  Escribile al equipo
                </Enlace>
              )}
            </div>
          )}
        </section>

        <section className="du-bloque du-otras" aria-labelledby="otras-t" {...entra(3)}>
          <h2 id="otras-t" className="hd-sobre du-sobre">
            Otras preguntas
          </h2>
          <ul className="du-pastillas">
            {PREGUNTAS.filter((x) => x.id !== q.id).map((x) => (
              <li key={x.id}>
                <Enlace
                  className="du-pastilla du-pastilla--chica"
                  href={ruta('/ayuda/respuesta/', { p: x.id })}
                >
                  <span>{x.p}</span>
                  <Icono nombre="derecha" />
                </Enlace>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Pantalla>
  );
}
