'use client';

import { useEffect, useRef, useState } from 'react';
import { Enlace } from '@/components/nav';
import { ErrorCliente } from '@/data/cliente';
import { escribirASoporte, soporteDisponible } from '@/data/soporte';
import { Avatar, Burbuja, Nota, Pastilla, Texto, Titulo } from '@/ui';
import { BarraCentro, Escribir, EscenaSoporte, PantallaM } from '@/ui/mensajes';

interface Mensaje {
  readonly id: number;
  readonly de: 'yo' | 'equipo' | 'aviso';
  readonly texto: string;
}
const TEMAS = ['Un pago', 'Un turno', 'Mi cuenta', 'Otra cosa'] as const;

/**
 * Soporte (lienzo M-Soporte): chat con el equipo de Handyx. Lo atiende una persona; no hay IA ni plazos prometidos.
 * Para un problema con un trabajo, el reclamo deja todo registrado. Con la API real queda inactivo hasta el contrato.
 */
export default function Soporte() {
  const [mensajes, setMensajes] = useState<readonly Mensaje[]>([]);
  const [texto, setTexto] = useState('');
  const [esperando, setEsperando] = useState(false);
  const fin = useRef<HTMLDivElement>(null);
  const siguiente = useRef(1);

  useEffect(() => {
    fin.current?.scrollIntoView({ block: 'end' });
  }, [mensajes, esperando]);

  const sumar = (...nuevos: Omit<Mensaje, 'id'>[]) =>
    setMensajes((m) => [...m, ...nuevos.map((x) => ({ ...x, id: siguiente.current++ }))]);

  async function enviar() {
    const t = texto.trim();
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
    <PantallaM
      arriba={
        <BarraCentro
          titulo="Soporte de Handyx"
          sub={
            soporteDisponible
              ? 'Vista de prueba · respuestas simuladas'
              : 'Te responde una persona del equipo'
          }
          volver={{ href: '/chats/', etiqueta: 'Volver a mensajes' }}
          tituloPestana="Soporte"
        />
      }
      pie={
        soporteDisponible ? (
          <Escribir
            valor={texto}
            onCambio={setTexto}
            onEnviar={() => void enviar()}
            placeholder="Contanos qué pasó"
            etiqueta="Escribile al equipo"
            deshabilitado={esperando}
          />
        ) : null
      }
    >
      <div
        className="ds-chat"
        role="log"
        aria-label="Conversación con el soporte"
        aria-live="polite"
        style={mensajes.length ? undefined : { justifyContent: 'flex-start' }}
      >
        <div className="ds-pila" style={{ alignItems: 'center', textAlign: 'center' }}>
          <EscenaSoporte />
          <Titulo nivel={2} tam={1.375} texto="¿En qué te ==ayudamos==?" />
          <Texto>Escribinos lo que necesites: te responde una persona del equipo.</Texto>
        </div>
        {!soporteDisponible ? (
          <Nota icono="info" tono="amarillo" rol="status">
            El chat con el equipo todavía no está disponible. Mirá la{' '}
            <Enlace href="/ayuda/">ayuda</Enlace> o{' '}
            <Enlace href="/reclamos/nuevo/">abrí un reclamo</Enlace>: queda todo registrado.
          </Nota>
        ) : mensajes.length === 0 ? (
          <div
            className="ds-m-rapidas"
            style={{ flexWrap: 'wrap', justifyContent: 'center' }}
            role="group"
            aria-label="Temas"
          >
            {TEMAS.map((t) => (
              <Pastilla key={t} elegida={false} onElegir={() => setTexto(`${t}: `)}>
                {t}
              </Pastilla>
            ))}
          </div>
        ) : null}
        {mensajes.map((m) =>
          m.de === 'yo' ? (
            <Burbuja key={m.id} de="yo">
              <span className="ds-solo-lector">Vos: </span>
              {m.texto}
            </Burbuja>
          ) : m.de === 'equipo' ? (
            <div key={m.id} className="ds-mensaje">
              <Avatar nombre="Handyx" tam={2.125} tono={5} />
              <Burbuja autor="Equipo de Soporte" conAvatar={false}>
                {m.texto}
              </Burbuja>
            </div>
          ) : (
            <Nota key={m.id} icono="info" tono="amarillo" rol="alert">
              {m.texto} Mientras tanto, mirá la <Enlace href="/ayuda/">ayuda</Enlace> o{' '}
              <Enlace href="/reclamos/nuevo/">abrí un reclamo</Enlace>.
            </Nota>
          ),
        )}
        {esperando ? (
          <div className="ds-mensaje" role="status">
            <Avatar nombre="Handyx" tam={2.125} tono={5} />
            <Burbuja conAvatar={false}>
              <span className="ds-solo-lector">El equipo está escribiendo</span>
              <span aria-hidden="true">…</span>
            </Burbuja>
          </div>
        ) : null}
        <div ref={fin} aria-hidden="true" />
      </div>
    </PantallaM>
  );
}
