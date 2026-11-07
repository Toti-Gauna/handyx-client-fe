'use client';

// Inicio con HandIA a pantalla completa (pedido de Ignacio del 07/11: "que se vea el chat completo como ChatGPT, con
// las profesiones arriba"). Conversa de verdad con el motor local (src/domain/handia-motor.ts). El modo voz es una
// simulación: no usa el micrófono; tocar la esfera simula que la persona dijo lo siguiente.
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
import { AvisoRiesgo, BotonPremium, Esfera, type EstadoEsfera } from '@/components/handia/piezas';
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
    const op = turnoRef.current.opciones.find((o) => o.accion.tipo !== 'saltear');
    return op
      ? { texto: op.texto, entrada: { accion: op.accion } }
      : { texto: PRIMERA_FRASE, entrada: { texto: PRIMERA_FRASE } };
  };

  const intercambio = () => {
    cortar();
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

  const vacio = mensajes.length === 0;
  const opciones = pensando ? [] : turno.opciones;
  const ultimaFicha = mensajes.findLast((m) => m.de === 'ficha')?.id;
  const rotuloVoz =
    voz === 'silencio'
      ? 'Micrófono apagado'
      : voz === 'pensando'
        ? 'Pensando'
        : voz === 'hablando'
          ? 'HandIA está hablando'
          : voz === 'listo'
            ? 'Pedido listo'
            : 'Te escucho';

  return (
    <div className="hxi-pantalla">
      <div className="hia-inicio hxs-llena" hidden={voz !== null}>
        <div className="hia-inicio__cab">
          <p className="hia-inicio__marca">Handyx</p>
          <button type="button" className="hia-redondo" aria-label="Avisos">
            <Icono nombre="campana" className="hia-ico" />
          </button>
          <button type="button" className="hia-redondo" aria-label="Dirección: Tu casa">
            <Icono nombre="pin" className="hia-ico" />
          </button>
        </div>
        <div className="hia-rubros" role="group" aria-label="Rubros">
          {RUBROS.map((r) => (
            <button key={r} type="button" className="hia-rubro" onClick={() => rubro(r)}>
              <Icono nombre={RUBROS_INFO[r].icono} className="hia-ico" />
              {RUBROS_INFO[r].corto}
            </button>
          ))}
        </div>

        <div
          className="hia-inicio__hilo"
          ref={hilo}
          role="log"
          aria-label="Conversación con HandIA"
          tabIndex={0}
        >
          {vacio ? (
            <div className="hia-inicio__hola">
              <Esfera tamano="chica" />
              <h2>¡Hola! Soy HandIA</h2>
              <p>¿Qué arreglo podemos hacer hoy?</p>
              <span className="hia-turno">
                <Icono nombre="calendario" className="hia-ico" /> Próximo turno: jue 19 · 10 a 12 h
              </span>
            </div>
          ) : (
            mensajes.map((m) =>
              m.de === 'yo' ? (
                <p key={m.id} className="hia-msj hia-msj--yo">
                  {m.texto}
                </p>
              ) : m.de === 'detectado' ? (
                <span key={m.id} className="hia-msj hia-msj--detectado">
                  <Icono nombre={RUBROS_INFO[m.rubro].icono} className="hia-ico" />{' '}
                  {RUBROS_INFO[m.rubro].nombre}
                </span>
              ) : m.de === 'ficha' ? (
                <div key={m.id} className="hia-msj hia-ficha-clara">
                  <div className="hia-ficha__cab">
                    <span className="hia-ficha__ico">
                      <Icono
                        nombre={m.rubro ? RUBROS_INFO[m.rubro].icono : 'caja'}
                        className="hia-ico"
                      />
                    </span>
                    <div>
                      <span className="hia-suave">Tu pedido</span>
                      <p className="hia-ficha__titulo">
                        {m.rubro ? RUBROS_INFO[m.rubro].nombre : 'Arreglo'}
                      </p>
                    </div>
                  </div>
                  {m.detalles.length > 0 && (
                    <div className="hia-chips">
                      {m.detalles.map((d) => (
                        <span key={d} className="hia-chip hia-chip--dato">
                          {d}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="hia-ficha__texto">{m.descripcion}</p>
                  {m.id === ultimaFicha && !pensando && (
                    <div className="hia-ficha__acciones">
                      {turno.opciones
                        .filter((o) => o.accion.tipo === 'pedir')
                        .map((o) => (
                          <BotonPremium
                            key={o.texto}
                            variante={o.destacada ? 'primario' : 'vidrio'}
                            icono={
                              o.accion.tipo === 'pedir' && o.accion.modo === 'urgente'
                                ? 'reloj'
                                : 'calendario'
                            }
                            onClick={() => elegir(o)}
                          >
                            {o.texto}
                          </BotonPremium>
                        ))}
                    </div>
                  )}
                </div>
              ) : m.de === 'aviso' && m.riesgo ? (
                <AvisoRiesgo key={m.id} texto={m.texto} />
              ) : (
                <p key={m.id} className="hia-msj hia-msj--ia">
                  {m.texto}
                </p>
              ),
            )
          )}
          {pensando && (
            <span className="hia-pensando">
              <span className="hia-giro" aria-hidden="true" />
              <span className="hia-brillo">Pensando</span>
            </span>
          )}
          {opciones.some((o) => o.accion.tipo !== 'pedir') && (
            <div className="hia-opciones" role="group" aria-label="Respuestas rápidas">
              {opciones
                .filter((o) => o.accion.tipo !== 'pedir')
                .map((o) => (
                  <button
                    key={o.texto}
                    type="button"
                    className="hia-opcion"
                    onClick={() => elegir(o)}
                  >
                    {o.texto}
                  </button>
                ))}
            </div>
          )}
        </div>

        {vacio && (
          <div className="hia-sugerencias" role="group" aria-label="Ejemplos">
            {SUGERENCIAS.map((s) => (
              <button
                key={s}
                type="button"
                className="hia-sugerencia"
                onClick={() => enviarTexto(s)}
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <form
          className="hia-composer"
          onSubmit={(e) => {
            e.preventDefault();
            enviarTexto(texto);
          }}
        >
          <button type="button" className="hia-composer__boton" aria-label="Sumar fotos (fase H5)">
            <Icono nombre="mas" className="hia-ico" />
          </button>
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Contale a HandIA…"
            aria-label="Contale a HandIA"
            maxLength={500}
            autoComplete="off"
          />
          {texto.trim() ? (
            <button
              type="submit"
              className="hia-composer__boton hia-composer__boton--voz"
              aria-label="Enviar"
            >
              <Icono nombre="enviar" className="hia-ico" />
            </button>
          ) : (
            <>
              <button type="button" className="hia-composer__boton" aria-label="Dictar (fase H2)">
                <Icono nombre="microfono" className="hia-ico" />
              </button>
              <button
                type="button"
                className="hia-composer__boton hia-composer__boton--voz"
                aria-label="Modo voz"
                onClick={abrirVoz}
              >
                <Icono nombre="onda" className="hia-ico" />
              </button>
            </>
          )}
        </form>
        <nav className="hia-nav" aria-label="Secciones de la app (maqueta)">
          {NAVEGACION.map((n) => (
            <span key={n.id} data-activa={n.id === 'inicio' || undefined}>
              <Icono nombre={n.icono} className="hia-ico" />
              {n.etiqueta}
            </span>
          ))}
        </nav>
      </div>

      {voz !== null && (
        <div className="hia-voz-negra hxs-llena" role="dialog" aria-label="Modo voz de HandIA">
          <div className="hia-voz-negra__arriba">
            <button
              type="button"
              className="hia-redondo"
              aria-label="Volver al chat"
              onClick={cerrarVoz}
            >
              <Icono nombre="atras" className="hia-ico" />
            </button>
            <button
              type="button"
              className="hia-redondo"
              aria-label="Subtítulos"
              aria-pressed="true"
            >
              <Icono nombre="subtitulos" className="hia-ico" />
            </button>
          </div>
          <div className="hia-voz-negra__centro">
            <button
              type="button"
              className="hxi-esfera-boton"
              onClick={intercambio}
              disabled={silencio || voz === 'pensando' || voz === 'hablando'}
              aria-label="Simular que hablás (prototipo: no usa el micrófono)"
            >
              <Esfera estado={voz} />
            </button>
            <p className="hia-voz-negra__estado" aria-live="polite">
              {rotuloVoz}
            </p>
            <p className="hia-subtitulo">{subtitulo}</p>
          </div>
          <div className="hia-voz-negra__abajo">
            <button type="button" className="hia-pastilla-oscura" onClick={cerrarVoz}>
              <Icono nombre="teclado" className="hia-ico" /> Escribir
            </button>
            <button
              type="button"
              className="hia-redondo"
              aria-label="Apagar el micrófono"
              aria-pressed={silencio}
              onClick={alternarSilencio}
            >
              <Icono nombre={silencio ? 'microfonoNo' : 'microfono'} className="hia-ico" />
            </button>
            <button
              type="button"
              className="hia-redondo hia-redondo--claro"
              aria-label="Terminar"
              onClick={cerrarVoz}
            >
              <Icono nombre="cerrar" className="hia-ico" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
