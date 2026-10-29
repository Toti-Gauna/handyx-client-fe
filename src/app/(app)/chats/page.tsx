'use client';

import { Icono } from '@/components/Icono';
import { Enlace, ruta } from '@/components/nav';
import { Titulo } from '@/components/Titulo';
import { EstadoConsulta, Vacio } from '@/components/ui';
import { useConsulta } from '@/data/hooks';
import { cuando } from '@/domain/fechas';

export default function Chats() {
  const lista = useConsulta('conversaciones', { consulta: { limite: 50 } }, { cada: 5_000 });
  return (
    <>
      <Titulo texto="==Mensajes==" />
      <EstadoConsulta consulta={lista}>
        {(d) =>
          d.items.length === 0 ? (
            <Vacio
              titulo="Todavía no tenés conversaciones"
              texto="Se abren cuando un especialista te manda una propuesta, así podés preguntar antes de contratar."
            >
              <Enlace className="boton boton--chico" href="/pedir/">
                Pedir un servicio
              </Enlace>
            </Vacio>
          ) : (
            <ul className="lista-tarjetas">
              {d.items.map((c) => (
                <li key={c.id}>
                  <Enlace
                    className="tarjeta tarjeta--enlace"
                    href={ruta('/chats/conversacion/', { id: c.id })}
                  >
                    <div className="tarjeta__cuerpo tarjeta__fila">
                      <span>
                        <strong className="tarjeta__titulo">{c.especialista.nombrePublico}</strong>
                        <span className="texto-suave" style={{ display: 'block' }}>
                          {c.ultimoMensajeEn
                            ? `Último mensaje: ${cuando(c.ultimoMensajeEn)}`
                            : 'Sin mensajes todavía'}
                          {c.trabajoId ? ' · Trabajo' : ' · Cotización'}
                        </span>
                      </span>
                      <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {c.noLeidos ? (
                          <span
                            className="campana__n"
                            style={{ position: 'static' }}
                            aria-label={`${c.noLeidos} sin leer`}
                          >
                            {c.noLeidos}
                          </span>
                        ) : null}
                        <Icono nombre="derecha" />
                      </span>
                    </div>
                  </Enlace>
                </li>
              ))}
            </ul>
          )
        }
      </EstadoConsulta>
    </>
  );
}
