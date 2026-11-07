'use client';

import Image from 'next/image';
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icono } from '@/components/Icono';
import type { NombreIcono } from '@/components/trazos';
import { Enlace, ruta, useIr } from '@/components/nav';
import { TituloDocumento } from '@/components/TituloDocumento';
import { type Voz, useVoz } from '@/components/voz';
import type { Rubro } from '@/contracts/v1/pedidos';
import { dejarBorrador } from '@/data/borrador';
import { conversarConHandia, handiaDisponible } from '@/data/handia';
import { esVistaDePrueba } from '@/data';
import { RAPIDAS_HANDIA, normalizar, tacharDatosPersonales } from '@/domain/handia';
import {
  type Accion,
  type EstadoHandia,
  type Opcion,
  SALUDO,
  type Turno,
  descripcionPara,
  detallesDe,
  iniciar,
  opcionesHabladas,
} from '@/domain/handia-motor';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { comandoVoz } from '@/domain/voz';

interface Mensaje {
  readonly id: number;
  readonly de: 'ia' | 'yo' | 'aviso' | 'detectado' | 'ficha';
  readonly texto?: string;
  readonly rubro?: Rubro;
  readonly riesgo?: boolean;
}

const nombre = (r: Rubro) => RUBROS_INFO[r].nombre;
const ETIQUETAS: Record<EstadoHandia['etapa'], string> = {
  contar: 'Ejemplos',
  confirmar: '¿Es ese rubro?',
  elegir: 'Elegí el rubro',
  pregunta: 'Respuestas',
  resumen: '¿Cómo lo pedís?',
};
const EJEMPLOS = [...RAPIDAS_HANDIA, 'Me quedé afuera de casa'] as const;

/**
 * HandIA premium (rama handia-premium). Conversa como un especialista antes de cotizar: entiende lo que contás,
 * pregunta solo lo que falta, avisa de riesgos primero y arma el pedido para que lo revises. Modo voz: escucha con
 * reconocimiento en el dispositivo y habla con voces del sistema. Todo corre en el celular: sin IA externa, sin datos
 * personales (se tachan antes de procesar), sin fotos ni audio guardados. La persona confirma todo.
 */
export default function HandIA() {
  const ir = useIr();
  const voz = useVoz();
  const [estado, setEstado] = useState<EstadoHandia>(() => iniciar().estado);
  const [mensajes, setMensajes] = useState<readonly Mensaje[]>([
    { id: 0, de: 'ia', texto: SALUDO },
  ]);
  const [opciones, setOpciones] = useState<readonly Opcion[]>([]);
  const [progreso, setProgreso] = useState<Turno['progreso']>(null);
  const [pensando, setPensando] = useState(false);
  const [texto, setTexto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [vozAbierta, setVozAbierta] = useState(false);
  const [ultimoIa, setUltimoIa] = useState(SALUDO);
  const [ultimoYo, setUltimoYo] = useState('');
  // Para los callbacks asíncronos (fin de la voz, reconocimiento): siempre el último valor.
  const estadoRef = useRef(estado);
  const descRef = useRef('');
  const editada = useRef(false);
  const vozRef = useRef(false);
  const siguiente = useRef(1);
  const fin = useRef<HTMLDivElement>(null);
  const botonVoz = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    fin.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [mensajes, pensando]);

  function sumar(...nuevos: Omit<Mensaje, 'id'>[]) {
    const conId = nuevos.map((x) => ({ ...x, id: siguiente.current++ }));
    setMensajes((m) => [...m, ...conId]);
  }

  function cambiarDescripcion(valor: string, aMano: boolean) {
    descRef.current = valor;
    if (aMano) editada.current = true;
    setDescripcion(valor);
  }

  function decir(t: Turno) {
    const partes = t.dice.flatMap((s) => (s.de === 'ia' || s.de === 'aviso' ? [s.texto] : []));
    const ultimo = partes.at(-1);
    if (ultimo) setUltimoIa(ultimo);
    if (!vozRef.current) return;
    const dichas = [...partes, opcionesHabladas(t.opciones) ?? ''].filter(Boolean).join(' ');
    voz.hablar(dichas, () => {
      if (vozRef.current && !t.pedir && voz.oidoLocal()) escucharAhora();
    });
  }

  function aplicar(t: Turno) {
    estadoRef.current = t.estado;
    setEstado(t.estado);
    sumar(
      ...t.dice.map((s): Omit<Mensaje, 'id'> =>
        s.de === 'detectado'
          ? { de: 'detectado', rubro: s.rubro }
          : s.de === 'ficha'
            ? { de: 'ficha' }
            : {
                de: s.de,
                texto: s.texto,
                ...(s.de === 'aviso' && s.riesgo ? { riesgo: true } : {}),
              },
      ),
    );
    if (t.dice.some((s) => s.de === 'ficha') && !editada.current)
      cambiarDescripcion(descripcionPara(t.estado), false);
    if (t.estado.etapa === 'contar') {
      editada.current = false;
      cambiarDescripcion('', false);
    }
    setOpciones(t.opciones);
    setProgreso(t.progreso);
    if (t.pedir) {
      pedir(t.pedir);
      return;
    }
    decir(t);
  }

  async function turno(entrada: { texto: string } | { accion: Accion }) {
    setPensando(true);
    setOpciones([]);
    try {
      aplicar(await conversarConHandia(estadoRef.current, entrada, vozRef.current ? 350 : 650));
    } catch (e) {
      sumar({ de: 'aviso', texto: e instanceof Error ? e.message : 'HandIA no pudo responder.' });
    } finally {
      setPensando(false);
    }
  }

  /** Lo que escribió o dijo la persona: comandos de voz, tachado de datos personales y turno. */
  function procesar(entrada: string, origen: 'texto' | 'voz') {
    const crudo = entrada.trim();
    if (!crudo || pensando) return;
    if (origen === 'voz') {
      const orden = comandoVoz(normalizar(crudo));
      if (orden === 'salir') return cerrarVoz();
      if (orden === 'repetir') return voz.hablar(ultimoIa, () => vozRef.current && escucharAhora());
      if (orden === 'callar') return voz.callar();
    }
    setTexto('');
    const { texto: limpio, tachado } = tacharDatosPersonales(crudo);
    setUltimoYo(limpio);
    sumar({ de: 'yo', texto: limpio });
    if (tachado.length)
      sumar({
        de: 'aviso',
        texto: `Saqué ${tachado.join(' y ')} del mensaje: HandIA no lo necesita para ayudarte.`,
      });
    if (estadoRef.current.etapa === 'resumen' && editada.current)
      cambiarDescripcion(`${descRef.current.trim()} ${limpio}`, true);
    void turno({ texto: limpio });
  }

  function elegir(op: Opcion) {
    if (pensando) return;
    setUltimoYo(op.texto);
    sumar({ de: 'yo', texto: op.texto });
    void turno({ accion: op.accion });
  }

  function pedir(modo: 'urgente' | 'programado') {
    const rubro = estadoRef.current.rubro;
    if (!rubro) return;
    voz.callar();
    vozRef.current = false;
    dejarBorrador({ rubro, descripcion: tacharDatosPersonales(descRef.current).texto });
    ir(ruta('/pedir/', { rubro, tipo: modo, desde: 'handia' }));
  }

  function escucharAhora() {
    voz.escuchar((dicho) => procesar(dicho, 'voz'));
  }

  async function abrirVoz() {
    vozRef.current = true;
    setVozAbierta(true);
    // Recién acá se le pregunta al navegador si puede escuchar en el dispositivo (nunca al cargar la pantalla).
    const oido = await voz.revisar();
    if (!vozRef.current) return;
    voz.hablar(
      [ultimoIa, opcionesHabladas(opciones) ?? ''].filter(Boolean).join(' '),
      () => vozRef.current && oido === 'local' && escucharAhora(),
    );
  }

  function cerrarVoz() {
    vozRef.current = false;
    voz.callar();
    setVozAbierta(false);
    botonVoz.current?.focus();
  }

  const ultimaFicha = mensajes.findLast((m) => m.de === 'ficha')?.id;
  const deshabilitado = !handiaDisponible || pensando;

  return (
    <div className="pantalla du-app du-chat-pantalla du-handia-pantalla">
      <TituloDocumento texto="HandIA" />
      <header className="hd-chat-cabecera">
        <div className="hd-chat-cabecera__fila">
          <Enlace
            href="/inicio/"
            className="hd-chat-cabecera__volver"
            aria-label="Volver al inicio"
          >
            <Icono nombre="atras" />
          </Enlace>
          <span className="du-ia-avatar" aria-hidden="true">
            <Image src="/img/handy-lamparita.webp" alt="" width={202} height={346} />
          </span>
          <h1 className="hd-chat-cabecera__quien">
            <strong>HandIA</strong>
            <small>
              {esVistaDePrueba ? 'Vista de prueba · en tu celular' : 'Asistente de Handyx'}
            </small>
          </h1>
          <button
            ref={botonVoz}
            type="button"
            className="hx-handia-voz-boton"
            onClick={() => void abrirVoz()}
            disabled={!handiaDisponible}
          >
            <Icono nombre="microfono" />
            <span>Modo voz</span>
          </button>
        </div>
        {progreso ? (
          <div
            className="hx-progreso"
            aria-label={`Pregunta ${progreso.actual} de ${progreso.total}`}
          >
            <span>
              Pregunta {progreso.actual} de {progreso.total}
            </span>
            <i aria-hidden="true">
              <b style={{ width: `${(progreso.actual / progreso.total) * 100}%` }} />
            </i>
          </div>
        ) : null}
      </header>

      <div className="du-chat">
        <div
          className="du-chat__mensajes hd-scroll"
          role="log"
          aria-live="polite"
          aria-label="Conversación con HandIA"
          tabIndex={0}
        >
          <div className="du-chat__espacio" />
          <div className="du-bienvenida du-bienvenida--ia">
            <span className="du-bienvenida__luz" aria-hidden="true">
              <i />
              <Image
                className="hd-handy"
                src="/img/handy-lamparita.webp"
                alt=""
                width={202}
                height={346}
              />
            </span>
            <strong>HandIA</strong>
            <small>
              Te ayudo a armar el pedido como lo haría un especialista: entiendo lo que contás, te
              pregunto lo justo y te aviso si hay algún riesgo. También podés hablarme.
            </small>
            <small className="du-handia-nota">
              <Icono nombre="escudo" />
              Todo queda en tu celular: no paso datos personales, no veo fotos y no guardo tu voz.
              Puedo equivocarme: vos confirmás todo.
            </small>
          </div>
          {mensajes.map((m) =>
            m.de === 'detectado' && m.rubro ? (
              <div key={m.id} className="du-detectado du-nueva">
                <Icono nombre="chispas" />
                <span className="du-detectado__ico">
                  <Icono nombre={RUBROS_INFO[m.rubro].icono} />
                </span>
                <strong>Rubro detectado: {nombre(m.rubro)}</strong>
              </div>
            ) : m.de === 'ficha' ? (
              m.id === ultimaFicha ? (
                <Ficha
                  key={m.id}
                  estado={estado}
                  descripcion={descripcion}
                  onCambiar={(v) => cambiarDescripcion(v, true)}
                />
              ) : (
                <p key={m.id} className="du-nota du-nueva">
                  <Icono nombre="check" />
                  <span>Pedido actualizado.</span>
                </p>
              )
            ) : m.de === 'aviso' ? (
              <p
                key={m.id}
                className={`du-nota du-nueva du-handia-aviso${m.riesgo ? ' hx-riesgo' : ''}`}
                role={m.riesgo ? 'alert' : undefined}
              >
                <Icono nombre={m.riesgo ? 'alerta' : 'info'} />
                <span>{m.texto}</span>
              </p>
            ) : (
              <div
                key={m.id}
                className={`du-burbuja du-nueva du-burbuja--${m.de === 'yo' ? 'propia' : 'otra'}`}
              >
                <span className="sr-only">{m.de === 'yo' ? 'Vos: ' : 'HandIA: '}</span>
                <span>{m.texto}</span>
              </div>
            ),
          )}
          {pensando ? (
            <div className="du-burbuja du-escribiendo" role="status">
              <span className="sr-only">HandIA está pensando</span>
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
          {!handiaDisponible ? (
            <p className="du-info">
              <Icono nombre="info" />
              <span>
                HandIA todavía no está disponible.{' '}
                <Enlace href="/pedir/">Elegí el rubro directamente</Enlace>.
              </span>
            </p>
          ) : null}
          {estado.etapa === 'contar' && mensajes.length === 1 ? (
            <Opciones
              etiqueta="Ejemplos"
              opciones={EJEMPLOS.map((t) => ({ texto: t, accion: { tipo: 'saltear' } }))}
              onElegir={(op) => procesar(op.texto, 'texto')}
              deshabilitado={deshabilitado}
            />
          ) : (
            <Opciones
              etiqueta={ETIQUETAS[estado.etapa]}
              opciones={opciones}
              onElegir={elegir}
              deshabilitado={deshabilitado}
            />
          )}
          {voz.escuchando && !vozAbierta ? (
            <p className="hx-dictado" role="status">
              <Icono nombre="microfono" />
              <span>{voz.parcial || 'Te escucho…'}</span>
            </p>
          ) : null}
          <form
            className="du-escribir"
            onSubmit={(e) => {
              e.preventDefault();
              procesar(texto, 'texto');
            }}
          >
            <label className="sr-only" htmlFor="handia-texto">
              Escribile a HandIA
            </label>
            <input
              id="handia-texto"
              className="du-escribir__campo"
              placeholder={
                estado.etapa === 'resumen' ? 'Agregá algo al pedido…' : 'Escribile a HandIA…'
              }
              autoComplete="off"
              maxLength={500}
              value={texto}
              disabled={deshabilitado}
              onChange={(e) => setTexto(e.target.value)}
            />
            {voz.oido === 'local' ? (
              <button
                type="button"
                className={`du-escribir__enviar hx-dictar${voz.escuchando ? ' is-activo' : ''}`}
                aria-label={voz.escuchando ? 'Dejar de escuchar' : 'Dictarle a HandIA'}
                aria-pressed={voz.escuchando}
                disabled={deshabilitado}
                onClick={() =>
                  voz.escuchando ? voz.callar() : voz.escuchar((t) => procesar(t, 'texto'))
                }
              >
                <Icono nombre="microfono" />
              </button>
            ) : null}
            <button
              type="submit"
              className="du-escribir__enviar"
              aria-label="Enviar a HandIA"
              disabled={deshabilitado || !texto.trim()}
            >
              <Icono nombre="enviar" />
            </button>
          </form>
        </div>
      </div>

      {vozAbierta
        ? createPortal(
            <PanelVoz
              voz={voz}
              pensando={pensando}
              ultimoIa={ultimoIa}
              ultimoYo={ultimoYo}
              opciones={opciones}
              resumen={estado.etapa === 'resumen'}
              onElegir={elegir}
              onHablar={() => (voz.escuchando ? voz.callar() : escucharAhora())}
              onCerrar={cerrarVoz}
              prueba={esVistaDePrueba}
            />,
            document.body,
          )
        : null}
    </div>
  );
}

function Opciones({
  etiqueta,
  opciones,
  onElegir,
  deshabilitado,
}: {
  etiqueta: string;
  opciones: readonly Opcion[];
  onElegir: (o: Opcion) => void;
  deshabilitado: boolean;
}) {
  if (!opciones.length) return null;
  const finales = opciones.filter((o) => o.accion.tipo === 'pedir');
  if (finales.length)
    return (
      <div className="du-rapidas du-rapidas--final" role="group" aria-label={etiqueta}>
        <div className="hd-botones hd-botones--fila">
          {[...finales]
            .sort((a, b) => Number(!!b.destacada) - Number(!!a.destacada))
            .map((o) => (
              <button
                key={o.texto}
                type="button"
                className={`hd-boton${o.destacada ? '' : ' hd-boton--claro'}`}
                onClick={() => onElegir(o)}
                disabled={deshabilitado}
              >
                {o.icono ? <Icono nombre={o.icono as NombreIcono} /> : null}
                {o.texto}
              </button>
            ))}
        </div>
        {opciones
          .filter((o) => o.accion.tipo === 'reiniciar')
          .map((o) => (
            <button
              key={o.texto}
              type="button"
              className="du-buscando__cancelar hx-reiniciar"
              onClick={() => onElegir(o)}
              disabled={deshabilitado}
            >
              {o.texto}
            </button>
          ))}
      </div>
    );
  return (
    <div className="hd-chips du-rapidas du-rapidas--envolver" role="group" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button
          key={o.texto}
          type="button"
          className={`hd-chip hd-chip--tinte du-rapida${o.destacada ? ' hx-destacada' : ''}`}
          onClick={() => onElegir(o)}
          disabled={deshabilitado}
        >
          {o.icono ? <Icono nombre={o.icono as NombreIcono} /> : null}
          {o.texto}
        </button>
      ))}
    </div>
  );
}

/** El pedido que armó HandIA, editable: así lo van a leer los especialistas. */
function Ficha({
  estado,
  descripcion,
  onCambiar,
}: {
  estado: EstadoHandia;
  descripcion: string;
  onCambiar: (v: string) => void;
}) {
  if (!estado.rubro) return null;
  const info = RUBROS_INFO[estado.rubro];
  const detalles = detallesDe(estado);
  return (
    <section className="hx-ficha du-nueva" aria-labelledby="hx-ficha-titulo">
      <header>
        <span className="hx-ficha__ico" aria-hidden="true">
          <Icono nombre={info.icono} />
        </span>
        <span>
          <small>Tu pedido</small>
          <strong id="hx-ficha-titulo">{info.nombre}</strong>
        </span>
        {estado.urgente ? <span className="hx-ficha__urgente">Para hoy</span> : null}
      </header>
      {detalles.length ? (
        <ul className="hx-ficha__datos" aria-label="Datos que suma HandIA">
          {detalles.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      ) : null}
      <label htmlFor="handia-descripcion">Así lo leen los especialistas</label>
      <textarea
        id="handia-descripcion"
        rows={5}
        maxLength={1000}
        value={descripcion}
        onChange={(e) => onCambiar(e.target.value)}
      />
      <small className="hx-ficha__nota">
        <Icono nombre="escudo" />
        Si agregás un teléfono, un email o un documento, lo saco antes de armar el pedido. Las fotos
        las sumás en el pedido.
      </small>
    </section>
  );
}

const ESTADOS_VOZ = {
  escuchando: 'Te escucho…',
  pensando: 'Pensando…',
  hablando: 'Hablando · tocá el micrófono para interrumpir',
  quieto: 'Tocá el micrófono para hablar',
} as const;

/** Modo voz a pantalla completa: la lamparita reacciona a cada momento y las opciones siguen a mano. */
function PanelVoz({
  voz,
  pensando,
  ultimoIa,
  ultimoYo,
  opciones,
  resumen,
  onElegir,
  onHablar,
  onCerrar,
  prueba,
}: {
  voz: Voz;
  pensando: boolean;
  ultimoIa: string;
  ultimoYo: string;
  opciones: readonly Opcion[];
  resumen: boolean;
  onElegir: (o: Opcion) => void;
  onHablar: () => void;
  onCerrar: () => void;
  prueba: boolean;
}) {
  const mic = useRef<HTMLButtonElement>(null);
  const cerrar = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    (mic.current ?? cerrar.current)?.focus();
  }, []);
  const momento = voz.escuchando
    ? 'escuchando'
    : pensando
      ? 'pensando'
      : voz.hablando
        ? 'hablando'
        : 'quieto';
  const puedeEscuchar = voz.oido === 'local';
  const teclas = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onCerrar();
    }
  };

  return (
    <div
      className="hx hx-voz"
      role="dialog"
      aria-modal="true"
      aria-labelledby="hx-voz-titulo"
      data-momento={momento}
      onKeyDown={teclas}
    >
      {prueba ? (
        <p className="hx-voz__prueba">
          <strong>Vista de prueba</strong> · datos ficticios
        </p>
      ) : null}
      <div className="hx-voz__barra">
        <h2 id="hx-voz-titulo">
          <Icono nombre="microfono" />
          Modo voz
        </h2>
        <button ref={cerrar} type="button" className="hx-voz__salir" onClick={onCerrar}>
          <Icono nombre="teclado" />
          Volver al chat
        </button>
      </div>

      <div className="hx-voz__escena" aria-hidden="true">
        <span className="hx-voz__halo">
          <i />
          <i />
          <i />
        </span>
        <Image
          className="hx-voz__handy"
          src="/img/handy-lamparita.webp"
          alt=""
          width={202}
          height={346}
          priority
        />
      </div>

      <p className="hx-voz__momento" role="status">
        {ESTADOS_VOZ[momento]}
      </p>
      <p className="hx-voz__dice" aria-live="polite">
        {ultimoIa}
      </p>
      {voz.parcial || ultimoYo ? (
        <p className="hx-voz__vos">
          <span className="sr-only">Vos: </span>
          {voz.parcial || ultimoYo}
        </p>
      ) : null}

      {opciones.length ? (
        <div
          className="hx-voz__opciones"
          role="group"
          aria-label={resumen ? '¿Cómo lo pedís?' : 'Opciones'}
        >
          {opciones.map((o) => (
            <button
              key={o.texto}
              type="button"
              className={`hx-voz__opcion${o.destacada ? ' is-destacada' : ''}`}
              onClick={() => onElegir(o)}
              disabled={pensando}
            >
              {o.texto}
            </button>
          ))}
        </div>
      ) : null}

      <div className="hx-voz__pie">
        {puedeEscuchar ? (
          <button
            ref={mic}
            type="button"
            className={`hx-voz__mic${voz.escuchando ? ' is-activo' : ''}`}
            aria-label={voz.escuchando ? 'Dejar de escuchar' : 'Hablarle a HandIA'}
            aria-pressed={voz.escuchando}
            onClick={onHablar}
            disabled={pensando}
          >
            <Icono nombre="microfono" />
          </button>
        ) : voz.oido === 'descargable' || voz.oido === 'descargando' ? (
          <button
            type="button"
            className="hx-voz__instalar"
            onClick={() => void voz.instalar()}
            disabled={voz.oido === 'descargando'}
          >
            <Icono nombre="microfono" />
            {voz.oido === 'descargando'
              ? 'Preparando el reconocimiento de voz…'
              : 'Activar la voz en este celular (una sola vez)'}
          </button>
        ) : null}
        {voz.error === 'permiso' ? (
          <p className="hx-voz__aviso">
            Para hablarme, permití el micrófono en la configuración del navegador.
          </p>
        ) : voz.error === 'no_te_escuche' ? (
          <p className="hx-voz__aviso">No te escuché. Tocá el micrófono y probá de nuevo.</p>
        ) : null}
        {voz.oido === 'no' ? (
          <p className="hx-voz__aviso">
            <Icono nombre="escudo" />
            Este navegador solo reconoce la voz mandándola a internet. Por privacidad, acá no te
            escucho: te leo las respuestas y vos tocás las opciones o volvés al chat para escribir.
          </p>
        ) : null}
        {!voz.habla ? (
          <p className="hx-voz__aviso">
            <Icono nombre="parlante" />
            Este celular no tiene una voz en español instalada: te muestro las respuestas en
            pantalla.
          </p>
        ) : null}
      </div>
    </div>
  );
}
