'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FotoPrivada } from '@/components/FotoPrivada';
import { Enlace, ruta } from '@/components/nav';
import { useAhora } from '@/components/SesionProvider';
import { Cargando, ErrorEstado, Vacio } from '@/components/ui';
import { TIPOS_MEDIA } from '@/contracts/v1/pedidos';
import type { Propuesta } from '@/contracts/v1/propuestas';
import type { Mensaje } from '@/contracts/v1/servicio';
import { cliente } from '@/data';
import { ErrorCliente } from '@/data/cliente';
import { avisarSiSesion, useConsulta } from '@/data/hooks';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { fechaDeInstante, horaDeInstante } from '@/domain/fechas';
import { Boton, Burbuja, Chip, Nota, Pastilla } from '@/ui';
import {
  BarraAcciones,
  BarraCentro,
  BarraSeleccion,
  Escribir,
  FilaSeleccion,
  PantallaM,
  alternar,
  etiquetaDia,
  textoParaCopiar,
} from '@/ui/mensajes';
import { Adjuntar } from './_Adjuntar';
import { TarjetaPropuestaChat } from './_TarjetaPropuesta';

interface Saliente {
  readonly clienteId: string;
  readonly texto?: string;
  readonly archivo?: File;
  mediaId?: string;
  estado: 'enviando' | 'error';
  error?: string;
  readonly creadoEn: number;
}
type Entrada =
  | { t: string; k: string; tipo: 'msg'; msg: Mensaje }
  | { t: string; k: string; tipo: 'prop'; prop: Propuesta }
  | { t: string; k: string; tipo: 'sal'; sal: Saliente };

const ESPERA_LARGA_MS = 500;

export default function Conversacion() {
  const id = useSearchParams().get('id');
  const ahora = useAhora(60_000);
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
  const [sumando, setSumando] = useState(false);
  const [elegidos, setElegidos] = useState<ReadonlySet<string> | null>(null);
  const fondo = useRef<HTMLDivElement>(null);
  const entradaFoto = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noLeidos = conv?.noLeidos ?? 0;
  const { recargar: recargarLista } = lista;

  useEffect(() => {
    if (!id || noLeidos === 0) return;
    cliente
      .llamar('conversacionLeida', { parametros: { id } })
      .then(recargarLista, (e) => e instanceof ErrorCliente && avisarSiSesion(e));
  }, [id, noLeidos, recargarLista]);

  const delServidor = useMemo(() => [...(mensajes.datos?.items ?? [])].reverse(), [mensajes.datos]);
  const tarjetas = useMemo(
    () => (propuestas.datos?.items ?? []).filter((p) => p.conversacionId === id),
    [propuestas.datos, id],
  );
  const entradas = useMemo(() => {
    const pendientes = salientes.filter((s) => !delServidor.some((m) => m.clienteId === s.clienteId));
    const todas: Entrada[] = [
      ...delServidor.map((m): Entrada => ({ t: m.creadoEn, k: m.id, tipo: 'msg', msg: m })),
      ...tarjetas.map((p): Entrada => ({ t: p.creadaEn, k: p.id, tipo: 'prop', prop: p })),
      ...pendientes.map(
        (s): Entrada => ({
          t: new Date(s.creadoEn).toISOString(),
          k: s.clienteId,
          tipo: 'sal',
          sal: s,
        }),
      ),
    ];
    return todas.sort((a, b) => a.t.localeCompare(b.t));
  }, [delServidor, tarjetas, salientes]);

  useEffect(() => {
    fondo.current?.scrollIntoView({ block: 'end' });
  }, [entradas.length, elegidos === null]);

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

  function encolar(s: Saliente) {
    setSalientes((xs) => [...xs, s]);
    void mandar(s);
  }
  function enviarTexto() {
    const t = texto.trim();
    if (!t) return;
    encolar({ clienteId: crypto.randomUUID(), texto: t, estado: 'enviando', creadoEn: Date.now() });
    setTexto('');
  }
  function elegirFoto(archivos: FileList | null) {
    const archivo = archivos?.[0];
    if (entradaFoto.current) entradaFoto.current.value = '';
    if (!archivo) return;
    if (!(TIPOS_MEDIA as readonly string[]).includes(archivo.type))
      return setAviso('Solo se aceptan fotos JPG, PNG o WebP.');
    if (archivo.size > 5 * 1024 * 1024) return setAviso('La foto puede pesar hasta 5 MB.');
    setAviso(null);
    encolar({ clienteId: crypto.randomUUID(), archivo, estado: 'enviando', creadoEn: Date.now() });
  }

  // Mantener apretado un mensaje empieza la selección (lo mismo que «Seleccionar»).
  const pulsar = (mid: string) => ({
    onPointerDown: () => {
      timer.current = setTimeout(() => {
        setElegidos(new Set([mid]));
        setAviso(null);
      }, ESPERA_LARGA_MS);
    },
    onPointerUp: () => timer.current && clearTimeout(timer.current),
    onPointerLeave: () => timer.current && clearTimeout(timer.current),
    onPointerMove: () => timer.current && clearTimeout(timer.current),
    onContextMenu: (e: React.SyntheticEvent) => e.preventDefault(),
  });

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
  const esp = conv.especialista.nombrePublico;
  const cerrado = trabajo.datos ? ['finalizado', 'cancelado'].includes(trabajo.datos.estado) : false;
  const rapidas = conv.trabajoId
    ? ['Te espero', '¿Necesitás algo más para el trabajo?', '¡Gracias!']
    : ['¿Incluye los materiales?', '¿Podés otro día u horario?', '¿Te mando más fotos?'];
  const sub = `${conv.trabajoId ? 'Trabajo' : 'Pedido'} · ${conv.especialista.rubros.map((r) => RUBROS_INFO[r].nombre).join(' · ')}`;
  const elegibles = delServidor.filter((m) => m.autor !== 'sistema').map((m) => m.id);

  async function copiar() {
    const t = textoParaCopiar(delServidor, elegidos ?? new Set(), esp);
    if (!t) return setAviso('Las fotos no se copian: elegí mensajes con texto.');
    try {
      await navigator.clipboard.writeText(t);
      setAviso('Copiado.');
    } catch {
      setAviso('No pudimos copiar. Probá de nuevo.');
    }
  }
  const responder = () => {
    const m = delServidor.find((x) => elegidos?.has(x.id) && x.texto);
    if (m?.texto) setTexto(`«${m.texto.slice(0, 120)}» `);
    setElegidos(null);
  };

  let diaPrevio = '';
  return (
    <PantallaM
      arriba={
        elegidos ? (
          <BarraSeleccion
            cantidad={elegidos.size}
            onSalir={() => setElegidos(null)}
            onTodos={() => setElegidos(new Set(elegibles))}
          />
        ) : (
          <BarraCentro
            titulo={esp}
            sub={sub}
            volver={{ href: '/chats/', etiqueta: 'Volver a mensajes' }}
            tituloPestana={`Chat con ${esp}`}
            accion={
              <button type="button" className="ds-m-barra__accion" onClick={() => setElegidos(new Set())}>
                Seleccionar
              </button>
            }
          />
        )
      }
      pie={
        elegidos ? (
          <div>
            {aviso ? (
              <p className="ds-m-nota-centro" role="status">
                {aviso}
              </p>
            ) : (
              <p className="ds-m-nota-centro">Borrar solo quita tus mensajes. Las tarjetas no se borran.</p>
            )}
            <BarraAcciones
              cantidad={elegidos.size}
              acciones={[
                { texto: 'Copiar', icono: 'copiar', deshabilitada: !elegidos.size, onClick: () => void copiar() },
                { texto: 'Reenviar', icono: 'reenviar', onClick: () => setAviso('Reenviar todavía no está disponible.') },
                { texto: 'Responder', icono: 'chat', deshabilitada: !elegidos.size, onClick: responder },
                { texto: 'Borrar los míos', icono: 'tacho', rojo: true, onClick: () => setAviso('Todavía no se pueden borrar mensajes.') },
              ]}
            />
          </div>
        ) : cerrado ? (
          <div className="ds-cuerpo">
            <Nota icono="info" tono="gris">
              El trabajo terminó: esta conversación quedó solo de lectura.
            </Nota>
          </div>
        ) : (
          <div>
            {aviso ? (
              <div className="ds-cuerpo" style={{ paddingBottom: 0 }}>
                <Nota icono="alerta" tono="amarillo" rol="status">
                  {aviso}
                </Nota>
              </div>
            ) : null}
            <div className="ds-m-rapidas" role="group" aria-label="Respuestas rápidas">
              {rapidas.map((r) => (
                <Pastilla key={r} elegida={false} onElegir={() => setTexto(r)}>
                  {r}
                </Pastilla>
              ))}
            </div>
            <input
              ref={entradaFoto}
              type="file"
              accept={TIPOS_MEDIA.join(',')}
              hidden
              aria-label="Elegir una foto"
              onChange={(e) => elegirFoto(e.target.files)}
            />
            <Escribir valor={texto} onCambio={setTexto} onEnviar={enviarTexto} onSumar={() => setSumando(true)} />
          </div>
        )
      }
    >
      <div className="ds-chat" role="log" aria-label="Conversación" aria-live="polite">
        <span className="ds-m-dia">
          <Boton
            variante="suave"
            chico
            ancho={false}
            icono="derecha"
            href={
              conv.trabajoId
                ? ruta('/trabajos/detalle/', { id: conv.trabajoId })
                : ruta('/pedidos/detalle/', { id: conv.pedidoId })
            }
          >
            {conv.trabajoId ? 'Ver el trabajo' : 'Ver el pedido'}
          </Boton>
        </span>
        {!conv.trabajoId ? (
          <Nota icono="info" tono="gris">
            Podés hablar antes de contratar. Nada queda acordado hasta que aceptes una propuesta.
          </Nota>
        ) : null}
        {entradas.length === 0 ? (
          <p className="ds-m-nota-centro">Todavía no hay mensajes. Escribí el primero.</p>
        ) : null}
        {entradas.map((e) => {
          const dia = fechaDeInstante(e.t);
          const separador =
            dia !== diaPrevio ? (
              <span key={`d-${dia}`} className="ds-m-dia">
                <Chip tono="gris">{etiquetaDia(e.t, ahora)}</Chip>
              </span>
            ) : null;
          diaPrevio = dia;
          let cuerpo: React.ReactNode;
          if (e.tipo === 'prop')
            cuerpo = (
              <div className="ds-m-fila" inert={elegidos !== null || undefined}>
                <TarjetaPropuestaChat
                  p={e.prop}
                  anterior={tarjetas.find((x) => x.id === e.prop.reemplazaA) ?? null}
                  alCambiar={() => {
                    propuestas.recargar();
                    mensajes.recargar();
                  }}
                />
              </div>
            );
          else if (e.tipo === 'sal') {
            const s = e.sal;
            cuerpo = (
              <>
                <Burbuja de="yo" hora={s.estado === 'enviando' ? 'Enviando…' : 'No se envió'}>
                  {s.archivo ? `Foto: ${s.archivo.name}` : s.texto}
                </Burbuja>
                {s.estado === 'error' ? (
                  <div className="ds-fila" style={{ justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <Nota icono="alerta" tono="error" rol="alert">
                      {s.error}
                    </Nota>
                    <Pastilla elegida={false} onElegir={() => void mandar(s)}>
                      Reintentar
                    </Pastilla>
                    <Pastilla
                      elegida={false}
                      onElegir={() => setSalientes((xs) => xs.filter((x) => x.clienteId !== s.clienteId))}
                    >
                      Descartar
                    </Pastilla>
                  </div>
                ) : null}
              </>
            );
          } else if (e.msg.autor === 'sistema')
            cuerpo = (
              <Nota icono="info" tono="gris">
                {e.msg.texto}
              </Nota>
            );
          else {
            const m = e.msg;
            const mio = m.autor === 'usuario';
            const globo = (
              <Burbuja de={mio ? 'yo' : 'otro'} hora={horaDeInstante(m.creadoEn)}>
                <span className="ds-solo-lector">{mio ? 'Vos: ' : `${esp}: `}</span>
                {m.media ? (
                  <FotoPrivada className="ds-m-foto" url={m.media.url} alt="Foto enviada" />
                ) : (
                  m.texto
                )}
              </Burbuja>
            );
            cuerpo = elegidos ? (
              <FilaSeleccion
                activa={elegidos.has(m.id)}
                etiqueta={`${mio ? 'Tu mensaje' : `Mensaje de ${esp}`}, ${horaDeInstante(m.creadoEn)}`}
                onAlternar={() => {
                  setAviso(null);
                  setElegidos(alternar(elegidos, m.id));
                }}
              >
                {globo}
              </FilaSeleccion>
            ) : (
              <div className="ds-m-fila" {...pulsar(m.id)}>
                {globo}
              </div>
            );
          }
          return (
            <div key={e.k} className="ds-m-fila">
              {separador}
              {cuerpo}
            </div>
          );
        })}
        {!elegidos && entradas.some((e) => e.tipo === 'prop') ? (
          <p className="ds-m-nota-centro">Las tarjetas se aceptan acá mismo y quedan en el pedido.</p>
        ) : null}
        <div ref={fondo} aria-hidden="true" />
      </div>
      <Adjuntar abierta={sumando} onCerrar={() => setSumando(false)} onFoto={() => entradaFoto.current?.click()} />
    </PantallaM>
  );
}
