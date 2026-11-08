'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Enlace, ruta } from '@/components/nav';
import { useAhora } from '@/components/SesionProvider';
import { Cargando, ErrorEstado, Vacio } from '@/components/ui';
import { cliente } from '@/data';
import { ErrorCliente } from '@/data/cliente';
import { avisarSiSesion, useConsulta } from '@/data/hooks';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { Boton, Nota } from '@/ui';
import { BarraCentro, BarraSeleccion, PantallaM, textoParaCopiar } from '@/ui/mensajes';
import { Adjuntar } from './_Adjuntar';
import { Linea, type Entrada } from './_Linea';
import { PieEscribir, PieSeleccion } from './_Pies';
import { useEnvios } from './_useEnvios';

const ESPERA_LARGA_MS = 500;

/**
 * Conversación (lienzo M-Chat, M-Presupuesto, M-Adjuntar y M-Seleccion): los mensajes quedan anclados abajo, sobre
 * el redactor; las propuestas llegan como tarjetas que se aceptan ahí mismo; «Sumar» abre foto, medida y Mi hogar;
 * y mantener apretado un mensaje (o «Seleccionar») pasa al modo selección.
 */
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
  const envios = useEnvios(id, mensajes.recargar);
  const [texto, setTexto] = useState('');
  const [aviso, setAviso] = useState<string | null>(null);
  const [sumando, setSumando] = useState(false);
  const [elegidos, setElegidos] = useState<ReadonlySet<string> | null>(null);
  const fondo = useRef<HTMLDivElement>(null);
  const entradaFoto = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seleccionando = elegidos !== null;
  const noLeidos = conv?.noLeidos ?? 0;
  const { recargar: recargarLista } = lista;

  useEffect(() => {
    if (!id || noLeidos === 0) return;
    cliente
      .llamar('conversacionLeida', { parametros: { id } })
      .then(recargarLista, (e) => e instanceof ErrorCliente && avisarSiSesion(e));
  }, [id, noLeidos, recargarLista]);

  const delServidor = [...(mensajes.datos?.items ?? [])].reverse();
  const tarjetas = (propuestas.datos?.items ?? []).filter((p) => p.conversacionId === id);
  const pendientes = envios.salientes.filter(
    (s) => !delServidor.some((m) => m.clienteId === s.clienteId),
  );
  const entradas: Entrada[] = [
    ...delServidor.map((m): Entrada => ({ t: m.creadoEn, k: m.id, tipo: 'msg', msg: m })),
    ...tarjetas.map((p): Entrada => ({ t: p.creadaEn, k: p.id, tipo: 'prop', prop: p })),
    ...pendientes.map((s): Entrada => ({
      t: new Date(s.creadoEn).toISOString(),
      k: s.clienteId,
      tipo: 'sal',
      sal: s,
    })),
  ].sort((a, b) => a.t.localeCompare(b.t));

  useEffect(() => {
    fondo.current?.scrollIntoView({ block: 'end' });
  }, [entradas.length, seleccionando]);

  // Mantener apretado un mensaje empieza la selección (lo mismo que «Seleccionar»).
  const parar = () => {
    if (timer.current) clearTimeout(timer.current);
  };
  const pulsar = (mid: string) => ({
    onPointerDown: () => {
      timer.current = setTimeout(() => {
        setElegidos(new Set([mid]));
        setAviso(null);
      }, ESPERA_LARGA_MS);
    },
    onPointerUp: parar,
    onPointerLeave: parar,
    onPointerMove: parar,
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
  const cerrado = trabajo.datos
    ? ['finalizado', 'cancelado'].includes(trabajo.datos.estado)
    : false;
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
  function responder() {
    const m = delServidor.find((x) => elegidos?.has(x.id) && x.texto);
    if (m?.texto) setTexto(`«${m.texto.slice(0, 120)}» `);
    setElegidos(null);
  }

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
              <button
                type="button"
                className="ds-m-barra__accion"
                onClick={() => {
                  setAviso(null);
                  setElegidos(new Set());
                }}
              >
                Seleccionar
              </button>
            }
          />
        )
      }
      pie={
        elegidos ? (
          <PieSeleccion
            cantidad={elegidos.size}
            aviso={aviso}
            onCopiar={() => void copiar()}
            onResponder={responder}
            onAviso={setAviso}
          />
        ) : cerrado ? (
          <div className="ds-cuerpo">
            <Nota icono="info" tono="gris">
              El trabajo terminó: esta conversación quedó solo de lectura.
            </Nota>
          </div>
        ) : (
          <PieEscribir
            texto={texto}
            onTexto={setTexto}
            onEnviar={() => {
              envios.mandarTexto(texto.trim());
              setTexto('');
            }}
            onSumar={() => setSumando(true)}
            rapidas={rapidas}
            aviso={aviso}
            entradaFoto={entradaFoto}
            onFoto={(f) => setAviso(f ? envios.mandarFoto(f) : null)}
          />
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
        <Linea
          entradas={entradas}
          ahora={ahora}
          esp={esp}
          tarjetas={tarjetas}
          elegidos={elegidos}
          onElegidos={(e) => {
            setAviso(null);
            setElegidos(e);
          }}
          pulsar={pulsar}
          onCambio={() => {
            propuestas.recargar();
            mensajes.recargar();
          }}
          onReintentar={(s) => void envios.mandar(s)}
          onDescartar={envios.descartar}
        />
        {!elegidos && tarjetas.length ? (
          <p className="ds-m-nota-centro">
            Las tarjetas se aceptan acá mismo y quedan en el pedido.
          </p>
        ) : null}
        <div ref={fondo} aria-hidden="true" />
      </div>
      <Adjuntar
        abierta={sumando}
        onCerrar={() => setSumando(false)}
        onFoto={() => entradaFoto.current?.click()}
      />
    </PantallaM>
  );
}
