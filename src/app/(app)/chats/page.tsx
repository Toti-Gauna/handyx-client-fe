'use client';

import Image from 'next/image';
import { AvatarHx, Pantalla, entra } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { Enlace, ruta } from '@/components/nav';
import { TituloDocumento } from '@/components/TituloDocumento';
import { EstadoConsulta } from '@/components/ui';
import { useConsulta } from '@/data/hooks';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { cuando } from '@/domain/fechas';

/**
 * Mensajes (rediseño 3.7, como u-mensajes): las conversaciones con especialistas (las que tienen mensajes sin leer,
 * marcadas), HandIA para armar un pedido y el soporte del equipo de Handy.
 */
export default function Chats() {
  const lista = useConsulta('conversaciones', { consulta: { limite: 50 } }, { cada: 5_000 });
  return (
    <Pantalla
      arriba={
        <div className="du-actividad__cabeza">
          <TituloDocumento texto="Mensajes" />
          <h1 className="hd-titulo hd-titulo--grande">Mensajes</h1>
        </div>
      }
      clase="du-mensajes-hx"
    >
      <div className="du-cuerpo">
        <EstadoConsulta consulta={lista}>
          {(d) => (
            <ul className="hd-tarjeta hd-tarjeta--compacta hd-lista du-chats-hx" {...entra(1)}>
              {d.items.map((c, i) => (
                <li key={c.id}>
                  <Enlace
                    className="hd-fila du-chat-fila"
                    href={ruta('/chats/conversacion/', { id: c.id })}
                  >
                    <AvatarHx
                      nombre={c.especialista.nombrePublico}
                      verificado={c.especialista.verificaciones.length > 0}
                      tono={i}
                    />
                    <span className="hd-fila__texto">
                      <strong>{c.especialista.nombrePublico}</strong>
                      <small>
                        {c.especialista.rubros.map((r) => RUBROS_INFO[r].nombre).join(' · ')} ·{' '}
                        {c.trabajoId ? 'Trabajo' : 'Antes de contratar'}
                        {c.ultimoMensajeEn ? ` · ${cuando(c.ultimoMensajeEn)}` : ''}
                      </small>
                    </span>
                    <span className="hd-fila__fin">
                      {c.noLeidos ? (
                        <span className="du-badge">
                          {c.noLeidos}
                          <span className="sr-only"> sin leer</span>
                        </span>
                      ) : null}
                      <Icono nombre="derecha" />
                    </span>
                  </Enlace>
                </li>
              ))}
              <li>
                <Enlace className="hd-fila du-chat-fila" href="/handia/">
                  <span className="du-ia-avatar" aria-hidden="true">
                    <Image src="/img/handy-lamparita.webp" alt="" width={202} height={346} />
                  </span>
                  <span className="hd-fila__texto">
                    <strong>HandIA</strong>
                    <small>Te ayuda a armar un pedido</small>
                  </span>
                  <span className="hd-fila__fin">
                    <Icono nombre="derecha" />
                  </span>
                </Enlace>
              </li>
              <li>
                <Enlace className="hd-fila du-chat-fila" href="/soporte/">
                  <span className="hd-avatar du-avatar-icono" aria-hidden="true">
                    <Icono nombre="chat" />
                  </span>
                  <span className="hd-fila__texto">
                    <strong>Soporte de Handy</strong>
                    <small>Escribile al equipo</small>
                  </span>
                  <span className="hd-fila__fin">
                    <Icono nombre="derecha" />
                  </span>
                </Enlace>
              </li>
            </ul>
          )}
        </EstadoConsulta>
        <div className="hd-tarjeta hd-tarjeta--gris du-mensajes__nota" {...entra(2)}>
          <Image
            className="hd-handy du-mensajes__handy"
            src="/img/handy-lamparita.webp"
            alt=""
            width={202}
            height={346}
          />
          <p>
            <Icono nombre="escudo" />
            <span>
              Las conversaciones con especialistas se abren cuando te mandan una propuesta: podés
              preguntar lo que necesites antes de decidir.
            </span>
          </p>
        </div>
      </div>
    </Pantalla>
  );
}
