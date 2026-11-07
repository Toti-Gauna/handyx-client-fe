'use client';

import { useEffect, useRef, useState } from 'react';
import { Icono } from '@/components/Icono';
import { Enlace } from '@/components/nav';
import { TituloDocumento } from '@/components/TituloDocumento';
import { ErrorCliente } from '@/data/cliente';
import { escribirASoporte, soporteDisponible } from '@/data/soporte';

interface Mensaje {
  readonly id: number;
  readonly de: 'yo' | 'equipo' | 'aviso';
  readonly texto: string;
}
const RAPIDAS = [
  'Tengo un problema con un pago',
  'Quiero cambiar un turno',
  'Otra consulta',
] as const;

/**
 * Soporte (rediseño 3.7, como u-soporte de la demo): chat con el equipo de Handy. Lo atiende una persona; no hay IA ni
 * plazos prometidos. Para un problema con un trabajo, el reclamo deja todo registrado.
 */
export default function Soporte() {
  const [mensajes, setMensajes] = useState<readonly Mensaje[]>([]);
  const [texto, setTexto] = useState('');
  const [esperando, setEsperando] = useState(false);
  const fin = useRef<HTMLDivElement>(null);
  const siguiente = useRef(1);

  useEffect(() => {
    fin.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [mensajes, esperando]);

  const sumar = (...nuevos: Omit<Mensaje, 'id'>[]) =>
    setMensajes((m) => [...m, ...nuevos.map((x) => ({ ...x, id: siguiente.current++ }))]);

  async function enviar(entrada: string) {
    const t = entrada.trim();
    if (!t || esperando) return;
    setTexto('');
    sumar({ de: 'yo', texto: t });
    setEsperando(true);
    try {
      sumar({ de: 'equipo', texto: await escribirASoporte(t) });
    } catch (e) {
      sumar({ de: 'aviso', texto: e instanceof ErrorCliente ? e.mensaje : 'No pudimos enviarlo.' });
    } finally {
      setEsperando(false);
    }
  }

  return (
    <div className="pantalla du-app du-chat-pantalla">
      <TituloDocumento texto="Soporte" />
      <header className="hd-chat-cabecera">
        <div className="hd-chat-cabecera__fila">
          <Enlace
            href="/chats/"
            className="hd-chat-cabecera__volver"
            aria-label="Volver a mensajes"
          >
            <Icono nombre="atras" />
          </Enlace>
          <span className="hd-avatar hd-avatar--chico du-avatar-icono" aria-hidden="true">
            <Icono nombre="chat" />
          </span>
          <h1 className="hd-chat-cabecera__quien">
            <strong>Soporte de Handy</strong>
            <small>
              {soporteDisponible ? 'Vista de prueba · respuestas simuladas' : 'Equipo de Handy'}
            </small>
          </h1>
        </div>
      </header>
      <div className="du-chat">
        <div
          className="du-chat__mensajes hd-scroll"
          role="log"
          aria-live="polite"
          aria-label="Conversación con el soporte"
          tabIndex={0}
        >
          <div className="du-chat__espacio" />
          <div className="du-bienvenida">
            <span className="du-bienvenida__ico" aria-hidden="true">
              <Icono nombre="chat" />
            </span>
            <small>
              <span>
                Escribinos lo que necesites: te responde una persona del equipo de Handy. Si es un
                problema con un trabajo, <Enlace href="/reclamos/nuevo/">abrí un reclamo</Enlace> y
                queda todo registrado.
              </span>
            </small>
          </div>
          {mensajes.map((m) =>
            m.de === 'aviso' ? (
              <p key={m.id} className="du-nota du-nueva du-handia-aviso">
                <Icono nombre="info" />
                <span>
                  {m.texto} Mientras tanto, mirá la <Enlace href="/ayuda/">ayuda</Enlace> o{' '}
                  <Enlace href="/reclamos/nuevo/">abrí un reclamo</Enlace>.
                </span>
              </p>
            ) : (
              <div
                key={m.id}
                className={`du-burbuja du-nueva du-burbuja--${m.de === 'yo' ? 'propia' : 'otra'}`}
              >
                <span className="sr-only">{m.de === 'yo' ? 'Vos: ' : 'Equipo de Handy: '}</span>
                <span>{m.texto}</span>
              </div>
            ),
          )}
          {esperando ? (
            <div className="du-burbuja du-escribiendo" role="status">
              <span className="sr-only">El equipo está escribiendo</span>
              <span className="hd-escribiendo" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            </div>
          ) : null}
          <div ref={fin} />
        </div>
        <div className="du-chat__pie">
          {mensajes.length === 0 ? (
            <div
              className="hd-chips du-rapidas du-rapidas--envolver"
              role="group"
              aria-label="Temas"
            >
              {RAPIDAS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className="hd-chip hd-chip--tinte du-rapida"
                  onClick={() => setTexto(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          ) : null}
          <form
            className="du-escribir"
            onSubmit={(e) => {
              e.preventDefault();
              void enviar(texto);
            }}
          >
            <label className="sr-only" htmlFor="soporte-texto">
              Escribile al equipo
            </label>
            <input
              id="soporte-texto"
              className="du-escribir__campo"
              placeholder="Escribile al equipo…"
              autoComplete="off"
              maxLength={1000}
              value={texto}
              disabled={esperando}
              onChange={(e) => setTexto(e.target.value)}
            />
            <button
              type="submit"
              className="du-escribir__enviar"
              aria-label="Enviar al equipo"
              disabled={esperando || !texto.trim()}
            >
              <Icono nombre="enviar" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
