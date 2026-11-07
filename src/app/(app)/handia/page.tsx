'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Icono } from '@/components/Icono';
import { Enlace, ruta, useIr } from '@/components/nav';
import { TituloDocumento } from '@/components/TituloDocumento';
import { RUBROS, type Rubro } from '@/contracts/v1/pedidos';
import { dejarBorrador } from '@/data/borrador';
import { consultarHandia, handiaDisponible } from '@/data/handia';
import { esVistaDePrueba } from '@/data';
import { AVISO_SEGURIDAD, RAPIDAS_HANDIA, tacharDatosPersonales } from '@/domain/handia';
import { RUBROS_INFO } from '@/domain/etiquetas';

interface Mensaje {
  readonly id: number;
  readonly de: 'ia' | 'yo' | 'aviso' | 'detectado';
  readonly texto: string;
  readonly rubro?: Rubro;
}
type Fase = 'escribir' | 'pensando' | 'confirmar' | 'elegir' | 'listo';

const nombre = (r: Rubro) => RUBROS_INFO[r].nombre;

/**
 * HandIA (rediseño; como u-handia de la demo). Ayuda a describir el problema y sugiere el rubro; la persona lo confirma
 * y elige si lo pide para hoy o programa un turno, y el pedido se arma con lo que escribió (lo revisa antes de mandar).
 * Sin datos personales: se tachan antes de enviar. Sin fotos: se suman en el pedido. Puede equivocarse y lo dice.
 */
export default function HandIA() {
  const ir = useIr();
  const [mensajes, setMensajes] = useState<readonly Mensaje[]>([
    { id: 0, de: 'ia', texto: '¡Hola! Soy HandIA. Contame qué pasó en tu casa, como te salga.' },
  ]);
  const [fase, setFase] = useState<Fase>('escribir');
  const [problema, setProblema] = useState('');
  const [opciones, setOpciones] = useState<readonly Rubro[]>([]);
  const [rubro, setRubro] = useState<Rubro | null>(null);
  const [texto, setTexto] = useState('');
  const fin = useRef<HTMLDivElement>(null);
  const siguiente = useRef(1);

  useEffect(() => {
    fin.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [mensajes, fase]);

  const sumar = (...nuevos: Omit<Mensaje, 'id'>[]) =>
    setMensajes((m) => [...m, ...nuevos.map((x) => ({ ...x, id: siguiente.current++ }))]);

  async function enviar(entrada: string) {
    const crudo = entrada.trim();
    if (!crudo || fase === 'pensando') return;
    setTexto('');
    const { texto: limpio, tachado } = tacharDatosPersonales(crudo);
    sumar({ de: 'yo', texto: limpio });
    if (tachado.length)
      sumar({
        de: 'aviso',
        texto: `Saqué ${tachado.join(' y ')} del mensaje: HandIA no lo necesita para ayudarte.`,
      });
    const acumulado = problema ? `${problema} ${limpio}` : limpio;
    setProblema(acumulado);
    setFase('pensando');
    try {
      const d = await consultarHandia(acumulado);
      if (d.seguridad) sumar({ de: 'ia', texto: AVISO_SEGURIDAD[d.seguridad] });
      const [primero, segundo] = d.candidatos;
      if (primero && (!d.dudosa || !segundo)) {
        setRubro(primero);
        sumar(
          { de: 'ia', texto: `Por lo que contás, parece un trabajo de ${nombre(primero)}.` },
          { de: 'detectado', texto: `Rubro detectado: ${nombre(primero)}`, rubro: primero },
        );
        setFase('confirmar');
      } else if (primero && segundo) {
        setOpciones([primero, segundo]);
        sumar({ de: 'ia', texto: `¿Es más de ${nombre(primero)} o de ${nombre(segundo)}?` });
        setFase('elegir');
      } else {
        setOpciones(RUBROS);
        sumar({
          de: 'ia',
          texto:
            'No me quedó claro de qué rubro es. Contame un poco más, o elegí el que más se parezca.',
        });
        setFase('elegir');
      }
    } catch (e) {
      setOpciones(RUBROS);
      sumar({ de: 'aviso', texto: e instanceof Error ? e.message : 'HandIA no pudo responder.' });
      setFase('elegir');
    }
  }

  function confirmar(r: Rubro, eleccion: string) {
    setRubro(r);
    sumar(
      { de: 'yo', texto: eleccion },
      {
        de: 'ia',
        texto: `Listo, armé tu pedido de ${nombre(r)}: «${problema}». ¿Lo pedís para hoy o preferís programar un turno? Las fotos las sumás en el pedido.`,
      },
    );
    setFase('listo');
  }

  function otroRubro() {
    sumar(
      { de: 'yo', texto: 'Es otro rubro' },
      {
        de: 'ia',
        texto:
          'Por ahora Handyx trabaja con seis rubros. Si tu arreglo no entra en ninguno, todavía no tenemos especialistas para eso.',
      },
    );
    setOpciones(RUBROS);
    setFase('elegir');
  }

  function pedir(tipo: 'urgente' | 'programado') {
    if (!rubro) return;
    dejarBorrador({ rubro, descripcion: problema });
    ir(ruta('/pedir/', { rubro, tipo, desde: 'handia' }));
  }

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
              {esVistaDePrueba
                ? 'Vista de prueba · respuestas simuladas'
                : 'Asistente de Handyx · con IA'}
            </small>
          </h1>
        </div>
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
            <small>Te ayudo a armar el pedido: contame qué pasó y te digo de qué rubro es.</small>
            <small className="du-handia-nota">
              <Icono nombre="escudo" />
              No me pases datos personales. No veo fotos y puedo equivocarme: vos confirmás todo.
            </small>
          </div>
          {mensajes.map((m) =>
            m.de === 'detectado' && m.rubro ? (
              <div key={m.id} className="du-detectado du-nueva">
                <Icono nombre="chispas" />
                <span className="du-detectado__ico">
                  <Icono nombre={RUBROS_INFO[m.rubro].icono} />
                </span>
                <strong>{m.texto}</strong>
              </div>
            ) : m.de === 'aviso' ? (
              <p key={m.id} className="du-nota du-nueva du-handia-aviso">
                <Icono nombre="info" />
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
          {fase === 'pensando' ? (
            <div className="du-burbuja du-escribiendo" role="status">
              <span className="sr-only">HandIA está escribiendo</span>
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
          {fase === 'escribir' && mensajes.length === 1 ? (
            <div
              className="hd-chips du-rapidas du-rapidas--envolver"
              role="group"
              aria-label="Ejemplos"
            >
              {RAPIDAS_HANDIA.map((r) => (
                <button
                  key={r}
                  type="button"
                  className="hd-chip hd-chip--tinte du-rapida"
                  onClick={() => void enviar(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          ) : null}
          {fase === 'confirmar' && rubro ? (
            <div
              className="hd-chips du-rapidas du-rapidas--envolver"
              role="group"
              aria-label="¿Es ese rubro?"
            >
              <button
                type="button"
                className="hd-chip hd-chip--tinte du-rapida"
                onClick={() => confirmar(rubro, 'Sí, es eso')}
              >
                Sí, es {nombre(rubro)}
              </button>
              <button
                type="button"
                className="hd-chip hd-chip--tinte du-rapida"
                onClick={otroRubro}
              >
                Es otro rubro
              </button>
            </div>
          ) : null}
          {fase === 'elegir' ? (
            <div
              className="hd-chips du-rapidas du-rapidas--envolver"
              role="group"
              aria-label="Elegí el rubro"
            >
              {opciones.map((r) => (
                <button
                  key={r}
                  type="button"
                  className="hd-chip hd-chip--tinte du-rapida"
                  onClick={() => confirmar(r, nombre(r))}
                >
                  <Icono nombre={RUBROS_INFO[r].icono} />
                  {nombre(r)}
                </button>
              ))}
            </div>
          ) : null}
          {fase === 'listo' ? (
            <div className="du-rapidas du-rapidas--final">
              <div className="hd-botones hd-botones--fila">
                <button type="button" className="hd-boton" onClick={() => pedir('urgente')}>
                  <Icono nombre="reloj" />
                  Pedir para hoy
                </button>
                <button
                  type="button"
                  className="hd-boton hd-boton--claro"
                  onClick={() => pedir('programado')}
                >
                  <Icono nombre="calendario" />
                  Programar turno
                </button>
              </div>
            </div>
          ) : (
            <form
              className="du-escribir"
              onSubmit={(e) => {
                e.preventDefault();
                void enviar(texto);
              }}
            >
              <label className="sr-only" htmlFor="handia-texto">
                Escribile a HandIA
              </label>
              <input
                id="handia-texto"
                className="du-escribir__campo"
                placeholder="Escribile a HandIA…"
                autoComplete="off"
                maxLength={500}
                value={texto}
                disabled={!handiaDisponible || fase === 'pensando'}
                onChange={(e) => setTexto(e.target.value)}
              />
              <button
                type="submit"
                className="du-escribir__enviar"
                aria-label="Enviar a HandIA"
                disabled={!handiaDisponible || fase === 'pensando' || !texto.trim()}
              >
                <Icono nombre="enviar" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
