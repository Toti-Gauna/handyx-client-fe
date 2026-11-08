'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { ruta } from '@/components/nav';
import { PREGUNTAS } from '@/content/textos';
import { AccionesFijas, Boton, Chip, Etiqueta, FilaEnlace, Tarjeta, Texto, Titulo } from '@/ui';
import { BarraCentro, PantallaM } from '@/ui/mensajes';

/**
 * Respuesta del centro de ayuda (lienzo X-Respuesta): la pregunta, la respuesta con su atajo, «¿Te sirvió?» y las
 * otras preguntas. El voto queda solo en esta pantalla: no se envía ni se guarda. Si no sirvió, se ofrece escribirle
 * al equipo.
 */
export default function Respuesta() {
  const id = useSearchParams().get('p');
  const q = PREGUNTAS.find((x) => x.id === id) ?? PREGUNTAS[0]!;
  const [voto, setVoto] = useState<{ pregunta: string; sirvio: boolean } | null>(null);
  const sirvio = voto?.pregunta === q.id ? voto.sirvio : null;

  return (
    <PantallaM
      key={q.id}
      arriba={
        <BarraCentro
          titulo="Respuesta"
          sub="Centro de ayuda"
          volver={{ href: '/ayuda/', etiqueta: 'Volver a las preguntas' }}
        />
      }
      pie={
        <AccionesFijas>
          <Boton variante="contorno" icono="chat" href="/soporte/">
            Escribirle a Soporte
          </Boton>
        </AccionesFijas>
      }
    >
      <div className="ds-cuerpo">
        <Titulo nivel={2} tam={1.75} texto={q.p} />
        <div className="ds-m-respuesta ds-pila">
          <p>{q.r}</p>
        </div>
        {q.ir ? (
          <Boton variante="suave" icono="flecha" href={q.ir.href}>
            {q.ir.texto}
          </Boton>
        ) : null}

        <Tarjeta etiqueta="¿Te sirvió la respuesta?">
          <strong style={{ fontSize: '1.0625rem' }}>¿Te sirvió la respuesta?</strong>
          {sirvio === null ? (
            <div className="ds-grilla">
              <Boton
                variante="suave"
                icono="pulgar"
                onClick={() => setVoto({ pregunta: q.id, sirvio: true })}
              >
                Sí
              </Boton>
              <Boton variante="suave" onClick={() => setVoto({ pregunta: q.id, sirvio: false })}>
                No
              </Boton>
            </div>
          ) : (
            <div className="ds-pila" role="status">
              <span>
                <Chip tono="exito" icono="check">
                  ¡Gracias por contarnos!
                </Chip>
              </span>
              {sirvio ? null : (
                <Boton variante="contorno" icono="chat" href="/soporte/">
                  Escribile al equipo
                </Boton>
              )}
            </div>
          )}
        </Tarjeta>

        <section
          className="ds-pila"
          aria-labelledby="otras-t"
          style={{ ['--ds-gap' as string]: 0 }}
        >
          <Etiqueta como="h2">
            <span id="otras-t">Otras preguntas</span>
          </Etiqueta>
          {PREGUNTAS.filter((x) => x.id !== q.id).map((x) => (
            <FilaEnlace
              key={x.id}
              icono="pregunta"
              titulo={x.p}
              href={ruta('/ayuda/respuesta/', { p: x.id })}
            />
          ))}
        </section>
        <Texto>Lo atiende una persona del equipo. No prometemos plazos.</Texto>
      </div>
    </PantallaM>
  );
}
