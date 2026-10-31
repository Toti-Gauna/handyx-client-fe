'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FotoPrivada } from '@/components/FotoPrivada';
import { Icono } from '@/components/Icono';
import { AvatarHx } from '@/components/hx';
import { Enlace, ruta } from '@/components/nav';
import { TarjetaPropuesta } from '@/components/Propuesta';
import { TituloDocumento } from '@/components/TituloDocumento';
import { Cargando, ErrorEstado, Vacio } from '@/components/ui';
import { TIPOS_MEDIA } from '@/contracts/v1/pedidos';
import type { Mensaje } from '@/contracts/v1/servicio';
import { cliente } from '@/data';
import { ErrorCliente } from '@/data/cliente';
import { avisarSiSesion, useConsulta } from '@/data/hooks';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { horaDeInstante } from '@/domain/fechas';

interface Saliente {
  readonly clienteId: string;
  readonly texto?: string;
  readonly archivo?: File;
  mediaId?: string;
  estado: 'enviando' | 'error';
  error?: string;
  readonly creadoEn: number;
}

export default function Conversacion() {
  const id = useSearchParams().get('id');
  const lista = useConsulta('conversaciones', { consulta: { limite: 50 } }, { cada: 6_000 });
  const mensajes = useConsulta(
    'mensajes',
    id ? { parametros: { id }, consulta: { limite: 50 } } : null,
    { cada: 3_000 },
  );
  const conv = lista.datos?.items.find((c) => c.id === id) ?? null;
  const pedidoId = conv?.pedidoId ?? null;
  const propuestas = useConsulta(
    'propuestas',
    pedidoId ? { parametros: { id: pedidoId }, consulta: { limite: 50 } } : null,
    { cada: 5_000 },
  );
  const trabajo = useConsulta(
    'trabajo',
    conv?.trabajoId ? { parametros: { id: conv.trabajoId } } : null,
    { cada: 8_000 },
  );
  const [salientes, setSalientes] = useState<Saliente[]>([]);
  const [texto, setTexto] = useState('');
  const [aviso, setAviso] = useState<string | null>(null);
  const fondo = useRef<HTMLLIElement>(null);
  const entradaFoto = useRef<HTMLInputElement>(null);
  const noLeidos = conv?.noLeidos ?? 0;
  const { recargar: recargarLista } = lista;

  useEffect(() => {
    if (!id || noLeidos === 0) return;
    cliente
      .llamar('conversacionLeida', { parametros: { id } })
      .then(recargarLista, (e) => e instanceof ErrorCliente && avisarSiSesion(e));
  }, [id, noLeidos, recargarLista]);

  const delServidor = useMemo(() => [...(mensajes.datos?.items ?? [])].reverse(), [mensajes.datos]);
  const pendientes = salientes.filter((s) => !delServidor.some((m) => m.clienteId === s.clienteId));
  const tarjetas = (propuestas.datos?.items ?? []).filter((p) => p.conversacionId === id);
  const entradas = useMemo(() => {
    type E = {
      t: string;
      k: string;
      msg?: Mensaje;
      prop?: (typeof tarjetas)[number];
      sal?: Saliente;
    };
    const todas: E[] = [
      ...delServidor.map((m) => ({ t: m.creadoEn, k: m.id, msg: m })),
      ...tarjetas.map((p) => ({ t: p.creadaEn, k: p.id, prop: p })),
      ...pendientes.map((s) => ({ t: new Date(s.creadoEn).toISOString(), k: s.clienteId, sal: s })),
    ];
    return todas.sort((a, b) => a.t.localeCompare(b.t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delServidor, propuestas.datos, id, salientes]);

  useEffect(() => {
    fondo.current?.scrollIntoView({ block: 'end' });
  }, [entradas.length]);

  async function mandar(s: Saliente) {
    if (!id) return;
    setSalientes((xs) =>
      xs.map((x) =>
        x.clienteId === s.clienteId ? { ...x, estado: 'enviando', error: undefined as never } : x,
      ),
    );
    try {
      let mediaId = s.mediaId;
      if (s.archivo && !mediaId) {
        const f = new FormData();
        f.set('archivo', s.archivo);
        mediaId = (await cliente.llamar('media', { cuerpo: f })).id;
        s.mediaId = mediaId;
      }
      const cuerpo = mediaId
        ? { clienteId: s.clienteId, tipo: 'foto' as const, mediaId }
        : { clienteId: s.clienteId, tipo: 'texto' as const, texto: s.texto ?? '' };
      await cliente.llamar('mensajeEnviar', {
        parametros: { id },
        cuerpo,
        claveIdempotencia: s.clienteId,
      });
      mensajes.recargar();
    } catch (e) {
      const err = e instanceof ErrorCliente ? e : null;
      if (err) avisarSiSesion(err);
      setSalientes((xs) =>
        xs.map((x) =>
          x.clienteId === s.clienteId
            ? { ...x, estado: 'error', error: err?.mensaje ?? 'No pudimos enviarlo.' }
            : x,
        ),
      );
    }
  }

  function enviarTexto(e: React.FormEvent) {
    e.preventDefault();
    const t = texto.trim();
    if (!t) return;
    const s: Saliente = {
      clienteId: crypto.randomUUID(),
      texto: t,
      estado: 'enviando',
      creadoEn: Date.now(),
    };
    setSalientes((xs) => [...xs, s]);
    setTexto('');
    void mandar(s);
  }

  function elegirFoto(archivos: FileList | null) {
    const archivo = archivos?.[0];
    if (entradaFoto.current) entradaFoto.current.value = '';
    if (!archivo) return;
    if (!(TIPOS_MEDIA as readonly string[]).includes(archivo.type))
      return setAviso('Solo se aceptan fotos JPG, PNG o WebP.');
    if (archivo.size > 5 * 1024 * 1024) return setAviso('La foto puede pesar hasta 5 MB.');
    setAviso(null);
    const s: Saliente = {
      clienteId: crypto.randomUUID(),
      archivo,
      estado: 'enviando',
      creadoEn: Date.now(),
    };
    setSalientes((xs) => [...xs, s]);
    void mandar(s);
  }

  if (!id)
    return (
      <Vacio titulo="Falta la conversación">
        <Enlace className="boton boton--chico" href="/chats/">
          Ver mensajes
        </Enlace>
      </Vacio>
    );
  const error = lista.error ?? mensajes.error;
  if (error)
    return (
      <ErrorEstado
        error={error}
        onReintentar={() => {
          lista.recargar();
          mensajes.recargar();
        }}
      />
    );
  if (!lista.datos || !mensajes.datos) return <Cargando />;
  if (!conv)
    return (
      <ErrorEstado
        error={
          new ErrorCliente({
            codigo: 'no_encontrado',
            mensaje: 'No encontramos esta conversación.',
          })
        }
      />
    );
  const cerrado = trabajo.datos
    ? ['finalizado', 'cancelado'].includes(trabajo.datos.estado)
    : false;
  const esp = conv.especialista.nombrePublico;
  // Respuestas rápidas según el momento (antes de contratar, preguntas; con el trabajo en marcha, coordinar). Completan
  // el mensaje: se manda recién con "Enviar", así un toque no manda nada sin querer.
  const rapidas = conv.trabajoId
    ? ['Te espero', '¿Necesitás algo más para el trabajo?', '¡Gracias!']
    : ['¿Incluye los materiales?', '¿Podés otro día u horario?', '¿Te mando más fotos?'];

  return (
    <div className="pantalla du-app du-chat-pantalla du-conversacion">
      <TituloDocumento texto={`Chat con ${esp}`} />
      <header className="hd-chat-cabecera">
        <div className="hd-chat-cabecera__fila">
          <Enlace
            href="/chats/"
            className="hd-chat-cabecera__volver"
            aria-label="Volver a mensajes"
          >
            <Icono nombre="atras" />
          </Enlace>
          <AvatarHx
            nombre={esp}
            verificado={conv.especialista.verificaciones.length > 0}
            tamano="chico"
          />
          <h1 className="hd-chat-cabecera__quien">
            <strong>{esp}</strong>
            <small>{conv.especialista.rubros.map((r) => RUBROS_INFO[r].nombre).join(' · ')}</small>
          </h1>
          <Enlace
            className="du-conversacion__ver"
            href={
              conv.trabajoId
                ? ruta('/trabajos/detalle/', { id: conv.trabajoId })
                : ruta('/pedidos/detalle/', { id: conv.pedidoId })
            }
          >
            {conv.trabajoId ? 'Ver el trabajo' : 'Ver el pedido'}
          </Enlace>
        </div>
      </header>

      <div className="du-chat">
        <ul
          className="du-chat__mensajes hd-scroll du-conversacion__lista"
          aria-label="Conversación"
          aria-live="polite"
          tabIndex={0}
        >
          <li className="du-chat__espacio" aria-hidden="true" />
          {!conv.trabajoId ? (
            <li className="du-nota du-nueva">
              <Icono nombre="info" />
              <span>
                Podés hablar antes de contratar. Nada queda acordado hasta que aceptes una
                propuesta.
              </span>
            </li>
          ) : null}
          {entradas.length === 0 ? (
            <li className="du-nota">Todavía no hay mensajes. Escribí el primero.</li>
          ) : null}
          {entradas.map((e) => {
            if (e.prop)
              return (
                <li key={e.k} className="du-conversacion__propuesta">
                  <TarjetaPropuesta p={e.prop} />
                </li>
              );
            if (e.sal) {
              const s = e.sal;
              return (
                <li
                  key={e.k}
                  className={`du-burbuja du-burbuja--propia${s.estado === 'error' ? ' du-burbuja--error' : ''}`}
                >
                  <span>{s.archivo ? `📷 ${s.archivo.name}` : s.texto}</span>
                  <small className="du-burbuja__meta">
                    {s.estado === 'enviando' ? 'Enviando…' : 'No se envió'}
                  </small>
                  {s.estado === 'error' ? (
                    <span role="alert" className="du-burbuja__error">
                      {s.error}
                      <button type="button" onClick={() => void mandar(s)}>
                        Reintentar
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setSalientes((xs) => xs.filter((x) => x.clienteId !== s.clienteId))
                        }
                      >
                        Descartar
                      </button>
                    </span>
                  ) : null}
                </li>
              );
            }
            const m = e.msg as Mensaje;
            if (m.autor === 'sistema')
              return (
                <li key={e.k} className="du-nota du-conversacion__sistema">
                  <Icono nombre="info" />
                  <span>{m.texto}</span>
                </li>
              );
            const mio = m.autor === 'usuario';
            return (
              <li key={e.k} className={`du-burbuja du-burbuja--${mio ? 'propia' : 'otra'}`}>
                <span className="sr-only">{mio ? 'Vos: ' : `${esp}: `}</span>
                {m.media ? (
                  <FotoPrivada className="du-burbuja__foto" url={m.media.url} alt="Foto enviada" />
                ) : (
                  <span>{m.texto}</span>
                )}
                <small className="du-burbuja__meta">
                  {horaDeInstante(m.creadoEn)}
                  {mio ? ' · enviado' : ''}
                </small>
              </li>
            );
          })}
          <li ref={fondo} aria-hidden="true" />
        </ul>

        <div className="du-chat__pie">
          {aviso ? (
            <p className="du-nota" role="status">
              <Icono nombre="alerta" />
              <span>{aviso}</span>
            </p>
          ) : null}
          {cerrado ? (
            <p className="du-nota">
              <Icono nombre="info" />
              <span>El trabajo terminó: esta conversación quedó solo de lectura.</span>
            </p>
          ) : (
            <>
              <div
                className="hd-chips du-rapidas du-rapidas--envolver"
                role="group"
                aria-label="Respuestas rápidas"
              >
                {rapidas.map((r) => (
                  <button
                    key={r}
                    type="button"
                    className="hd-chip hd-chip--tinte du-rapida"
                    onClick={() => {
                      setTexto(r);
                      document.getElementById('mensaje')?.focus();
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <form className="du-escribir" onSubmit={enviarTexto}>
                <input
                  ref={entradaFoto}
                  type="file"
                  accept={TIPOS_MEDIA.join(',')}
                  hidden
                  aria-label="Elegir una foto"
                  onChange={(e) => elegirFoto(e.target.files)}
                />
                <button
                  type="button"
                  className="du-escribir__foto"
                  aria-label="Enviar una foto"
                  onClick={() => entradaFoto.current?.click()}
                >
                  <Icono nombre="camara" />
                </button>
                <label className="sr-only" htmlFor="mensaje">
                  Mensaje
                </label>
                <textarea
                  id="mensaje"
                  className="du-escribir__campo"
                  rows={1}
                  maxLength={2000}
                  placeholder="Escribí un mensaje"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.form) {
                      e.preventDefault();
                      e.currentTarget.form.requestSubmit();
                    }
                  }}
                />
                <button
                  type="submit"
                  className="du-escribir__enviar"
                  aria-label="Enviar el mensaje"
                  disabled={!texto.trim()}
                >
                  <Icono nombre="enviar" />
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
