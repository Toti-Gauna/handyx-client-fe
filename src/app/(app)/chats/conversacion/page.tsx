'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FotoPrivada } from '@/components/FotoPrivada';
import { Icono } from '@/components/Icono';
import { Enlace, ruta } from '@/components/nav';
import { TarjetaPropuesta } from '@/components/Propuesta';
import { Titulo } from '@/components/Titulo';
import { Aviso, Boton, Cargando, ErrorEstado, Vacio } from '@/components/ui';
import { TIPOS_MEDIA } from '@/contracts/v1/pedidos';
import type { Mensaje } from '@/contracts/v1/servicio';
import { cliente } from '@/data';
import { ErrorCliente } from '@/data/cliente';
import { avisarSiSesion, useConsulta } from '@/data/hooks';
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

  return (
    <>
      <Titulo texto={conv.especialista.nombrePublico} />
      <p style={{ margin: 0 }}>
        <Enlace
          className="enlace-tarjeta"
          href={
            conv.trabajoId
              ? ruta('/trabajos/detalle/', { id: conv.trabajoId })
              : ruta('/pedidos/detalle/', { id: conv.pedidoId })
          }
        >
          {conv.trabajoId ? 'Ver el trabajo' : 'Ver el pedido'}
        </Enlace>
      </p>
      {!conv.trabajoId ? (
        <Aviso tipo="info">
          Podés hablar antes de contratar. Nada queda acordado hasta que aceptes una propuesta.
        </Aviso>
      ) : null}
      {cerrado ? (
        <Aviso tipo="info" titulo="El trabajo terminó">
          Esta conversación quedó solo de lectura.
        </Aviso>
      ) : null}

      <ul className="chat" aria-label="Conversación" aria-live="polite">
        {entradas.length === 0 ? (
          <li className="burbuja burbuja--sistema">Todavía no hay mensajes. Escribí el primero.</li>
        ) : null}
        {entradas.map((e) => {
          if (e.prop)
            return (
              <li key={e.k} className="tarjeta-propuesta" style={{ listStyle: 'none' }}>
                <ul className="lista-tarjetas">
                  <TarjetaPropuesta p={e.prop} />
                </ul>
              </li>
            );
          if (e.sal) {
            const s = e.sal;
            return (
              <li
                key={e.k}
                className={`burbuja burbuja--yo${s.estado === 'error' ? ' burbuja--error' : ''}`}
              >
                {s.archivo ? <span>📷 {s.archivo.name}</span> : s.texto}
                <span className="burbuja__meta">
                  {s.estado === 'enviando' ? 'Enviando…' : 'No se envió'}
                </span>
                {s.estado === 'error' ? (
                  <span role="alert" style={{ display: 'block' }}>
                    {s.error}{' '}
                    <button
                      type="button"
                      className="boton boton--texto boton--chico"
                      style={{ color: '#fff' }}
                      onClick={() => void mandar(s)}
                    >
                      Reintentar
                    </button>
                    <button
                      type="button"
                      className="boton boton--texto boton--chico"
                      style={{ color: '#fff' }}
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
              <li key={e.k} className="burbuja burbuja--sistema">
                {m.texto}
              </li>
            );
          return (
            <li key={e.k} className={`burbuja${m.autor === 'usuario' ? ' burbuja--yo' : ''}`}>
              {m.media ? (
                <FotoPrivada className="burbuja__foto" url={m.media.url} alt="Foto enviada" />
              ) : (
                m.texto
              )}
              <span className="burbuja__meta">
                {m.autor === 'usuario' ? 'Vos' : conv.especialista.nombrePublico} ·{' '}
                {horaDeInstante(m.creadoEn)}
                {m.autor === 'usuario' ? ' · enviado' : ''}
              </span>
            </li>
          );
        })}
        <li ref={fondo} aria-hidden="true" style={{ listStyle: 'none' }} />
      </ul>

      {aviso ? (
        <Aviso tipo="alerta" rol="status">
          {aviso}
        </Aviso>
      ) : null}
      {!cerrado ? (
        <form className="compositor" onSubmit={enviarTexto}>
          <input
            ref={entradaFoto}
            type="file"
            accept={TIPOS_MEDIA.join(',')}
            hidden
            aria-label="Elegir una foto"
            onChange={(e) => elegirFoto(e.target.files)}
          />
          <Boton
            variante="claro"
            aria-label="Enviar una foto"
            onClick={() => entradaFoto.current?.click()}
          >
            <Icono nombre="camara" />
          </Boton>
          <label className="sr-only" htmlFor="mensaje">
            Mensaje
          </label>
          <textarea
            id="mensaje"
            className="entrada"
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
          <Boton type="submit" aria-label="Enviar el mensaje" disabled={!texto.trim()}>
            <Icono nombre="enviar" />
          </Boton>
        </form>
      ) : null}
    </>
  );
}
