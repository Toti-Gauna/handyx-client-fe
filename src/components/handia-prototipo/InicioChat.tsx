'use client';

// Inicio con HandIA a pantalla completa, con el diseño de Handyx (pedido de Ignacio del 07/11: la idea de un asistente
// a pantalla completa, "no una copia de ChatGPT: llevado al diseño que ya existe en Handyx"). Usa las piezas del kit
// (cabecera con logo, mosaicos con los Handys, burbujas de los chats, ticket, botones táctiles, barra azul). Conversa
// de verdad con el motor local (src/domain/handia-motor.ts). El modo voz es una simulación: no usa el micrófono;
// tocar la lamparita simula que la persona dijo lo siguiente.
import { useEffect, useRef, useState } from 'react';
import { Icono } from '@/components/Icono';
import { RUBROS } from '@/contracts/v1/pedidos';
import { tacharDatosPersonales } from '@/domain/handia';
import {
  type Accion,
  type Opcion,
  type Salida,
  type Turno,
  descripcionPara,
  detallesDe,
  iniciar,
  responder,
} from '@/domain/handia-motor';
import { RUBROS_INFO } from '@/domain/etiquetas';
import type { Rubro } from '@/contracts/v1/pedidos';
import Image from 'next/image';
import type { EstadoEsfera } from '@/components/handia/piezas';
import { HandyRubro, Marcado } from '@/components/hx';
import { NAVEGACION } from '@/mapa/pantallas';

type Mensaje =
  | { id: number; de: 'yo' | 'ia' | 'aviso'; texto: string; riesgo?: boolean }
  | { id: number; de: 'detectado'; rubro: Rubro }
  | { id: number; de: 'ficha'; rubro: Rubro | null; detalles: string[]; descripcion: string };

const SUGERENCIAS = [
  'Pierde la canilla del baño, gotea toda la noche',
  'Saltó la térmica y no vuelve',
  'Me quedé afuera, se trabó la cerradura',
];
const PRIMERA_FRASE = 'Pierde la canilla del baño, gotea toda la noche';
const PAUSA = 650;
const LAMPARITA = '/img/handy-lamparita.webp';

let siguienteId = 0;
const id = () => ++siguienteId;

function aMensajes(t: Turno): Mensaje[] {
  return t.dice.map((s: Salida): Mensaje => {
    if (s.de === 'detectado') return { id: id(), de: 'detectado', rubro: s.rubro };
    if (s.de === 'ficha')
      return {
        id: id(),
        de: 'ficha',
        rubro: t.estado.rubro,
        detalles: detallesDe(t.estado),
        descripcion: descripcionPara(t.estado),
      };
    if (s.de === 'aviso')
      return { id: id(), de: 'aviso', texto: s.texto, ...(s.riesgo ? { riesgo: true } : {}) };
    return { id: id(), de: 'ia', texto: s.texto };
  });
}

export function InicioChat() {
  const [turno, setTurno] = useState<Turno>(() => iniciar());
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [texto, setTexto] = useState('');
  const [pensando, setPensando] = useState(false);
  const [voz, setVoz] = useState<EstadoEsfera | null>(null);
  const [subtitulo, setSubtitulo] = useState('');
  const [silencio, setSilencio] = useState(false);
  const [ajustes, setAjustes] = useState(false);
  const [subtitulos, setSubtitulos] = useState(true);
  const [sonidos, setSonidos] = useState(false);
  const [leerEnVoz, setLeerEnVoz] = useState(false);
  const [vozTexto, setVozTexto] = useState('');
  const [menu, setMenu] = useState(false);
  const relojes = useRef<ReturnType<typeof setTimeout>[]>([]);
  const turnoRef = useRef(turno);
  const hilo = useRef<HTMLDivElement>(null);

  useEffect(
    () => () => {
      for (const r of relojes.current) clearTimeout(r);
    },
    [],
  );
  useEffect(() => {
    hilo.current?.scrollTo({ top: hilo.current.scrollHeight });
  }, [mensajes, pensando]);

  const despues = (ms: number, f: () => void) => relojes.current.push(setTimeout(f, ms));
  const cortar = () => {
    for (const r of relojes.current) clearTimeout(r);
    relojes.current = [];
  };

  /** Manda algo al motor: lo dicho aparece al instante, la respuesta después de pensar. */
  const mandar = (
    dicho: string,
    entrada: { texto: string } | { accion: Accion },
    alResponder?: (t: Turno) => void,
  ) => {
    setMensajes((m) => [...m, { id: id(), de: 'yo', texto: dicho }]);
    setPensando(true);
    despues(PAUSA, () => {
      const t = responder(turnoRef.current.estado, entrada);
      turnoRef.current = t;
      setTurno(t);
      setPensando(false);
      const nuevos = aMensajes(t);
      if (t.pedir)
        nuevos.push({
          id: id(),
          de: 'aviso',
          texto:
            t.pedir === 'urgente'
              ? 'En la app, acá se abre Pedir para hoy con todo lo que contaste. (Prototipo)'
              : 'En la app, acá se abre Pedir para elegir día y franja, con todo lo que contaste. (Prototipo)',
        });
      setMensajes((m) => [...m, ...nuevos]);
      alResponder?.(t);
    });
  };

  const enviarTexto = (crudo: string) => {
    const limpio = tacharDatosPersonales(crudo.trim()).texto;
    if (!limpio || pensando) return;
    setTexto('');
    mandar(limpio, { texto: limpio });
  };
  const elegir = (o: Opcion) => !pensando && mandar(o.texto, { accion: o.accion });
  const rubro = (r: Rubro) =>
    !pensando &&
    mandar(`Necesito ${RUBROS_INFO[r].nombre.toLowerCase()}`, {
      accion: { tipo: 'rubro', rubro: r },
    });

  // ── Modo voz (simulado) ───────────────────────────────────────────────────────────────────────
  /** Lo que "dice" la persona: la primera opción que ofrece HandIA o, al empezar, un problema de ejemplo. */
  const proximoDicho = (): { texto: string; entrada: { texto: string } | { accion: Accion } } => {
    // Nunca "dice" por la persona que pida, ni que empiece de nuevo: eso lo decide ella.
    const op = turnoRef.current.opciones.find(
      (o) => !['saltear', 'pedir', 'reiniciar'].includes(o.accion.tipo),
    );
    return op
      ? { texto: op.texto, entrada: { accion: op.accion } }
      : { texto: PRIMERA_FRASE, entrada: { texto: PRIMERA_FRASE } };
  };

  const intercambio = () => {
    cortar();
    // Con el pedido ya armado, la voz no sigue sola: la persona revisa la ficha y elige cómo pedir.
    if (turnoRef.current.estado.etapa === 'resumen') {
      setVoz('listo');
      setSubtitulo('Tu pedido está listo: revisalo en el chat y elegí cómo pedirlo.');
      return;
    }
    const { texto: frase, entrada } = proximoDicho();
    setVoz('escuchando');
    setSubtitulo('');
    const palabras = frase.split(' ');
    palabras.forEach((_, i) =>
      despues(220 * (i + 1), () => setSubtitulo(palabras.slice(0, i + 1).join(' '))),
    );
    despues(220 * palabras.length + 500, () => {
      setVoz('pensando');
      mandar(frase, entrada, (t) => {
        const dicho = t.dice
          .flatMap((s) => (s.de === 'ia' || s.de === 'aviso' ? [s.texto] : []))
          .join(' ');
        const listo = t.dice.some((s) => s.de === 'ficha');
        setVoz('hablando');
        setSubtitulo(dicho || 'Listo.');
        despues(Math.min(5200, 900 + dicho.length * 38), () => {
          setVoz(listo ? 'listo' : 'escuchando');
          setSubtitulo(listo ? 'Tu pedido está listo: lo ves en el chat.' : '');
        });
      });
    });
  };

  const abrirVoz = () => {
    setSilencio(false);
    setVoz('escuchando');
    despues(700, intercambio);
  };
  const cerrarVoz = () => {
    cortar();
    setPensando(false);
    setVoz(null);
    setSubtitulo('');
  };
  const alternarSilencio = () => {
    cortar();
    setSilencio((s) => !s);
    setVoz((v) => (v === 'silencio' ? 'escuchando' : 'silencio'));
    setSubtitulo('');
  };

  /** Nuevo pedido: vuelve al Inicio vacío. */
  const reiniciar = () => {
    cortar();
    const t = iniciar();
    turnoRef.current = t;
    setTurno(t);
    setMensajes([]);
    setPensando(false);
  };
  const privacidad = () =>
    setMensajes((m) => [
      ...m,
      {
        id: id(),
        de: 'ia',
        texto:
          'Lo que me contás se procesa en tu celular: no lo mando a ninguna IA externa. Antes de armar el pedido saco teléfonos, emails y documentos, y vos revisás todo antes de publicar.',
      },
    ]);

  const vacio = mensajes.length === 0;
  const opciones = pensando ? [] : turno.opciones;
  const ultimaFicha = mensajes.findLast((m) => m.de === 'ficha')?.id;
  const estadoCab = pensando
    ? 'Pensando…'
    : turno.estado.etapa === 'resumen' && mensajes.some((m) => m.de === 'ficha')
      ? 'Pedido listo para revisar'
      : turno.progreso
        ? 'Armando tu pedido'
        : 'En tu celular, sin IA externa';
  const rotuloVoz =
    voz === 'silencio'
      ? 'Micrófono apagado'
      : voz === 'pensando'
        ? 'Pensando'
        : voz === 'hablando'
          ? 'HandIA te está hablando'
          : voz === 'listo'
            ? '¡Pedido listo!'
            : 'Te escucho';
  const avatar = (chico = false) => (
    <span
      className={`hxh-avatar${chico ? ' hxh-avatar--chico' : ''}`}
      data-estado={pensando ? 'pensando' : undefined}
      aria-hidden="true"
    >
      <i />
      <Image src={LAMPARITA} alt="" width={202} height={346} />
    </span>
  );

  return (
    <div className="hxi-pantalla">
      <div className="hx hxh">
        <div className="hxh-app" hidden={voz !== null}>
          {vacio ? (
            <header className="app-cabecera app-cabecera--blanca">
              <div className="app-cabecera__fila">
                <span className="app-logo">
                  <Image src="/img/logo-handyx.webp" alt="Handyx" width={720} height={158} />
                  <small aria-hidden="true">Soluciones, no problemas</small>
                </span>
                <span className="app-cabecera__botones">
                  <button type="button" className="app-cuadrado" aria-label="Avisos, 2 sin leer">
                    <Icono nombre="campana" />
                    <span className="hd-insignia" aria-hidden="true">
                      2
                    </span>
                  </button>
                  <button type="button" className="app-cuadrado" aria-label="Tus direcciones">
                    <Icono nombre="pin" />
                  </button>
                </span>
              </div>
            </header>
          ) : (
            <header className="hd-chat-cabecera hxh-chat-cab">
              <div className="hd-chat-cabecera__fila">
                <button
                  type="button"
                  className="hd-chat-cabecera__volver"
                  aria-label="Volver al inicio"
                  onClick={reiniciar}
                >
                  <Icono nombre="atras" />
                </button>
                {avatar()}
                <span className="hd-chat-cabecera__quien">
                  <strong>HandIA</strong>
                  <small>{estadoCab}</small>
                </span>
                <button
                  type="button"
                  className="hd-chat-cabecera__volver"
                  aria-label="Más opciones"
                  aria-expanded={menu}
                  onClick={() => setMenu((v) => !v)}
                >
                  <Icono nombre="menu" />
                </button>
              </div>
              {turno.progreso && !pensando ? (
                <div
                  className="hxh-tramos"
                  role="progressbar"
                  aria-label="Preguntas del pedido"
                  aria-valuemin={0}
                  aria-valuemax={turno.progreso.total}
                  aria-valuenow={turno.progreso.actual}
                  aria-valuetext={`Pregunta ${turno.progreso.actual} de ${turno.progreso.total}`}
                >
                  {Array.from({ length: turno.progreso.total }, (_, k) => (
                    <i key={k} data-hecho={k < turno.progreso!.actual || undefined} />
                  ))}
                </div>
              ) : null}
              {menu && (
                <div className="hxh-menu" onKeyDown={(e) => e.key === 'Escape' && setMenu(false)}>
                  {(
                    [
                      ['nuevoChat', 'Nuevo pedido', 'nuevo'],
                      ['onda', 'Modo voz', 'voz'],
                      ['escudo', 'Cómo cuido tus datos', 'datos'],
                    ] as const
                  ).map(([ico, txt, accion]) => (
                    <button
                      key={txt}
                      type="button"
                      className="hd-fila hxh-menu__fila"
                      onClick={() => {
                        setMenu(false);
                        if (accion === 'nuevo') reiniciar();
                        else if (accion === 'voz') abrirVoz();
                        else privacidad();
                      }}
                    >
                      <span className="hd-fila__ico">
                        <Icono nombre={ico} />
                      </span>
                      <span className="hd-fila__texto">{txt}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={leerEnVoz}
                    className="hd-fila hxh-menu__fila"
                    onClick={() => setLeerEnVoz((v) => !v)}
                  >
                    <span className="hd-fila__ico">
                      <Icono nombre="parlante" />
                    </span>
                    <span className="hd-fila__texto">Leer respuestas en voz alta</span>
                    <span className="hia-interruptor" aria-hidden="true" />
                  </button>
                </div>
              )}
            </header>
          )}

          {vacio && (
            <div className="hxh-rubros" role="group" aria-label="Rubros">
              {RUBROS.map((r) => (
                <button
                  key={r}
                  type="button"
                  className="hd-mosaico hxh-rubro"
                  onClick={() => rubro(r)}
                >
                  <HandyRubro rubro={r} />
                  <span>{RUBROS_INFO[r].corto}</span>
                </button>
              ))}
            </div>
          )}

          <div
            className="hxh-hilo"
            data-chat={vacio ? undefined : ''}
            ref={hilo}
            role="log"
            aria-label="Conversación con HandIA"
            tabIndex={0}
          >
            {vacio ? (
              <div className="hxh-hola">
                <span className="du-bienvenida__luz hxh-hola__luz" aria-hidden="true">
                  <i />
                  <Image className="hd-handy" src={LAMPARITA} alt="" width={202} height={346} />
                </span>
                <p className="hd-sobre">¡Hola! Soy HandIA</p>
                <h2 className="hd-titulo hd-titulo--grande">
                  <Marcado texto="¿Qué arreglo podemos hacer ==hoy==?" />
                </h2>
                <p className="hd-texto hd-texto--suave">
                  Contame qué pasó, escribiendo o hablando, y armo el pedido con vos.
                </p>
              </div>
            ) : (
              mensajes.map((m) =>
                m.de === 'yo' ? (
                  <p key={m.id} className="du-burbuja du-burbuja--propia hxh-msj">
                    <span className="sr-only">Vos: </span>
                    {m.texto}
                  </p>
                ) : m.de === 'detectado' ? (
                  <span key={m.id} className="hd-chip hd-chip--azul hxh-msj hxh-detectado">
                    <Icono nombre={RUBROS_INFO[m.rubro].icono} /> {RUBROS_INFO[m.rubro].nombre}
                  </span>
                ) : m.de === 'ficha' ? (
                  <div key={m.id} className="hd-ticket hxh-ficha hxh-msj">
                    <div className="hd-ticket__papel">
                      <div className="hxh-ficha__arriba">
                        {m.rubro ? <HandyRubro rubro={m.rubro} /> : null}
                        <span>
                          <span className="hd-sobre">Tu pedido</span>
                          <span className="hd-titulo hd-titulo--chico">
                            {m.rubro ? RUBROS_INFO[m.rubro].nombre : 'Arreglo'}
                          </span>
                        </span>
                      </div>
                      <div className="hd-ticket__corte" />
                      <div className="hxh-ficha__abajo">
                        {m.detalles.length > 0 && (
                          <span className="hd-chips">
                            {m.detalles.map((d) => (
                              <span key={d} className="hd-chip hd-chip--tinte">
                                {d}
                              </span>
                            ))}
                          </span>
                        )}
                        <p className="hd-texto">{m.descripcion}</p>
                        {m.id === ultimaFicha && !pensando && (
                          <div className="hd-botones hd-botones--fila">
                            {turno.opciones
                              .filter((o) => o.accion.tipo === 'pedir')
                              .map((o) => (
                                <button
                                  key={o.texto}
                                  type="button"
                                  className={`hd-boton${o.destacada ? '' : ' hd-boton--claro'}`}
                                  onClick={() => elegir(o)}
                                >
                                  <Icono
                                    nombre={
                                      o.accion.tipo === 'pedir' && o.accion.modo === 'urgente'
                                        ? 'reloj'
                                        : 'calendario'
                                    }
                                  />
                                  {o.texto}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : m.de === 'aviso' ? (
                  <p
                    key={m.id}
                    className={`du-nota du-handia-aviso hxh-msj${m.riesgo ? ' hx-riesgo' : ''}`}
                    role={m.riesgo ? 'alert' : undefined}
                  >
                    <Icono nombre={m.riesgo ? 'alerta' : 'info'} />
                    <span>{m.texto}</span>
                  </p>
                ) : (
                  <div key={m.id} className="hxh-ia hxh-msj">
                    {avatar(true)}
                    <p className="du-burbuja du-burbuja--otra">
                      <span className="sr-only">HandIA: </span>
                      {m.texto}
                    </p>
                  </div>
                ),
              )
            )}
            {pensando && (
              <div className="hxh-ia">
                {avatar(true)}
                <span className="hd-escribiendo">
                  <i />
                  <i />
                  <i />
                  <span className="sr-only">HandIA está pensando</span>
                </span>
              </div>
            )}
            {opciones.some((o) => o.accion.tipo !== 'pedir') && (
              <div className="hxh-opciones" role="group" aria-label="Respuestas rápidas">
                {opciones
                  .filter((o) => o.accion.tipo !== 'pedir')
                  .map((o) => (
                    <button
                      key={o.texto}
                      type="button"
                      className="hd-chip hd-chip--tinte hxh-opcion"
                      onClick={() => elegir(o)}
                    >
                      {o.texto}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {vacio && (
            <div
              className="hd-chips hd-chips--carril hxh-sugerencias"
              role="group"
              aria-label="Ejemplos"
            >
              {SUGERENCIAS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="hd-chip hxh-opcion"
                  onClick={() => enviarTexto(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
          <form
            className="du-escribir hxh-escribir"
            onSubmit={(e) => {
              e.preventDefault();
              enviarTexto(texto);
            }}
          >
            <button
              type="button"
              className="du-escribir__adjuntar"
              aria-label="Sumar fotos (fase H5)"
            >
              <Icono nombre="mas" />
            </button>
            <label className="du-escribir__campo hxh-campo">
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="Contale a HandIA…"
                aria-label="Contale a HandIA"
                maxLength={500}
                autoComplete="off"
              />
              {!texto.trim() && (
                <button type="button" className="hxh-dictar" aria-label="Dictar (fase H2)">
                  <Icono nombre="microfono" />
                </button>
              )}
            </label>
            {texto.trim() ? (
              <button type="submit" className="du-escribir__enviar" aria-label="Enviar">
                <Icono nombre="enviar" />
              </button>
            ) : (
              <button
                type="button"
                className="du-escribir__enviar"
                aria-label="Modo voz"
                onClick={abrirVoz}
              >
                <Icono nombre="onda" />
              </button>
            )}
          </form>
          <nav className="app-nav" aria-label="Secciones de la app (maqueta)">
            {NAVEGACION.map((n) => (
              <span
                key={n.id}
                className={`app-nav__item${n.id === 'inicio' ? ' app-nav__item--activo' : ''}`}
              >
                <Icono nombre={n.icono} />
                {n.etiqueta}
              </span>
            ))}
          </nav>
        </div>

        {voz !== null && (
          <div
            className="hxh-voz"
            role="dialog"
            aria-label="Modo voz de HandIA"
            onKeyDown={(e) => e.key === 'Escape' && (ajustes ? setAjustes(false) : cerrarVoz())}
          >
            <div className="hxh-voz__arriba">
              <button
                type="button"
                className="app-cuadrado hxh-cuadrado-claro"
                aria-label="Volver al chat"
                onClick={cerrarVoz}
              >
                <Icono nombre="atras" />
              </button>
              <span className="hxh-voz__titulo">
                <strong>HandIA</strong>
                <span className="hd-chip hd-chip--mini hxh-chip-voz">
                  <Icono nombre="onda" /> Modo voz
                </span>
              </span>
              <button
                type="button"
                className="app-cuadrado hxh-cuadrado-claro"
                aria-label="Ajustes de voz"
                aria-expanded={ajustes}
                onClick={() => setAjustes((a) => !a)}
              >
                <Icono nombre="ajustes" />
              </button>
            </div>
            <div className="hxh-voz__centro">
              <button
                type="button"
                className="hxh-foco"
                data-estado={voz}
                onClick={intercambio}
                disabled={silencio || voz === 'pensando' || voz === 'hablando'}
                aria-label="Simular que hablás (prototipo: no usa el micrófono)"
              >
                <span className="hxh-foco__ondas" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
                <span className="hxh-foco__luz" aria-hidden="true" />
                <Image
                  className="hd-handy hxh-foco__handy"
                  src={LAMPARITA}
                  alt=""
                  width={202}
                  height={346}
                />
              </button>
              <p className="hxh-voz__estado" aria-live="polite">
                {rotuloVoz}
                {voz === 'pensando' && (
                  <span className="hd-escribiendo hxh-puntos" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                )}
              </p>
              {subtitulos && (
                <p className="hd-titulo hd-titulo--claro hxh-voz__texto">
                  {voz === 'hablando' ? <Subrayado texto={subtitulo} /> : subtitulo}
                </p>
              )}
            </div>
            <form
              className="hxh-voz__abajo"
              onSubmit={(e) => {
                e.preventDefault();
                const t = vozTexto;
                setVozTexto('');
                cerrarVoz();
                enviarTexto(t);
              }}
            >
              <label className="hxh-voz__campo">
                <Icono nombre="teclado" />
                <input
                  value={vozTexto}
                  onChange={(e) => setVozTexto(e.target.value)}
                  placeholder="Escribir"
                  aria-label="Escribirle a HandIA"
                  maxLength={500}
                  autoComplete="off"
                />
              </label>
              <button
                type="button"
                className="hxh-tactil hxh-tactil--blanco"
                aria-label="Apagar el micrófono"
                aria-pressed={silencio}
                onClick={alternarSilencio}
              >
                <Icono nombre={silencio ? 'microfonoNo' : 'microfono'} />
              </button>
              <button
                type="button"
                className="hxh-tactil hxh-tactil--claro"
                aria-label="Terminar"
                onClick={cerrarVoz}
              >
                <Icono nombre="cerrar" />
              </button>
            </form>

            {ajustes && (
              <div className="hxh-hoja" role="group" aria-label="Ajustes de voz">
                <span className="hxh-hoja__asa" aria-hidden="true" />
                <p className="hd-titulo hd-titulo--chico">Modo voz</p>
                <div className="hd-lista">
                  <div className="hd-fila">
                    <span className="hd-fila__ico">
                      <Icono nombre="parlante" />
                    </span>
                    <span className="hd-fila__texto">
                      <strong>Voz</strong>
                      <small>La del sistema, en español</small>
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={subtitulos}
                    className="hd-fila"
                    onClick={() => setSubtitulos((v) => !v)}
                  >
                    <span className="hd-fila__ico">
                      <Icono nombre="subtitulos" />
                    </span>
                    <span className="hd-fila__texto">
                      <strong>Subtítulos</strong>
                    </span>
                    <span className="hia-interruptor" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={sonidos}
                    className="hd-fila"
                    onClick={() => setSonidos((v) => !v)}
                  >
                    <span className="hd-fila__ico">
                      <Icono nombre="campana" />
                    </span>
                    <span className="hd-fila__texto">
                      <strong>Sonidos al empezar y terminar</strong>
                      <small>Espera tu aprobación (R5)</small>
                    </span>
                    <span className="hia-interruptor" aria-hidden="true" />
                  </button>
                  <div className="hd-fila">
                    <span className="hd-fila__ico">
                      <Icono nombre="candado" />
                    </span>
                    <span className="hd-fila__texto">
                      <strong>Tu voz se reconoce en el celular</strong>
                      <small>No se graba ni se manda a ningún lado.</small>
                    </span>
                  </div>
                </div>
                <button type="button" className="hd-boton" onClick={() => setAjustes(false)}>
                  Listo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Lo que dice HandIA se va subrayando en amarillo (el marcador de la marca, sobre azul). */
function Subrayado({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(' ').map((p, i) => (
        <span key={i} className="hxh-subrayado" style={{ '--i': i } as React.CSSProperties}>
          {p}{' '}
        </span>
      ))}
    </>
  );
}
