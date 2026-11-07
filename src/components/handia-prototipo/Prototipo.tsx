'use client';

// Prototipo navegable de la fase R de HandIA (R2: tres direcciones visuales). Es una maqueta: no conversa con el
// motor, no escucha ni guarda nada. Los textos son ejemplos ficticios. Lo que Ignacio elija acá se construye en H2/H3.
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Icono } from '@/components/Icono';
import { AVISO_SEGURIDAD } from '@/domain/handia';
import {
  DIRECCIONES,
  type Direccion,
  ESTADOS_CHAT,
  ESTADOS_VOZ,
  type EstadoChat,
  type EstadoVoz,
} from './datos';

const LAMPARITA = '/img/handy-lamparita.webp';

/** La lamparita como orbe: la luz cambia con el estado (respira, escucha, piensa, habla, encontró). */
function Orbe({ estado, chico = false }: { estado: EstadoVoz; chico?: boolean }) {
  return (
    <div
      className={`hxp-orbe${chico ? ' hxp-orbe--chico' : ''}`}
      data-estado={estado}
      aria-hidden="true"
    >
      <span className="hxp-orbe__halo" />
      <span className="hxp-orbe__aro" />
      <span className="hxp-orbe__nivel" />
      <Image className="hxp-orbe__handy" src={LAMPARITA} alt="" width={202} height={346} priority />
      <span className="hxp-orbe__chispas">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <i key={i} style={{ '--i': i } as React.CSSProperties} />
        ))}
      </span>
    </div>
  );
}

/** Texto que se resalta palabra por palabra mientras HandIA lo dice. */
function Dicho({ texto }: { texto: string }) {
  return (
    <span className="hxp-dicho">
      {texto.split(' ').map((p, i) => (
        <span key={i} style={{ '--i': i } as React.CSSProperties}>
          {p}{' '}
        </span>
      ))}
    </span>
  );
}

const SIGUIENTE_VOZ: Record<EstadoVoz, EstadoVoz> = {
  reposo: 'escuchando',
  escuchando: 'pensando',
  pensando: 'hablando',
  hablando: 'listo',
  listo: 'reposo',
};

function PantallaVoz({ estado, avanzar }: { estado: EstadoVoz; avanzar: () => void }) {
  const info = ESTADOS_VOZ.find((e) => e.id === estado)!;
  return (
    <div className="hxp-pantalla hxp-voz" data-estado={estado}>
      <span className="hxp-fondo" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <div className="hxp-voz__arriba">
        <span className="hxp-marca">
          <Icono nombre="chispas" className="hxp-ico" /> HandIA
        </span>
        <span className="hxp-pildora">Modo voz</span>
      </div>

      <Orbe estado={estado} />

      <p className="hxp-voz__estado" aria-live="polite">
        <span className="hxp-punto" aria-hidden="true" /> {info.rotulo}
      </p>

      <div className="hxp-voz__texto">
        {estado === 'reposo' && (
          <>
            <p className="hxp-grande">¿Qué está pasando en tu casa?</p>
            <p className="hxp-suave">
              Tocá el micrófono y contame. Te escucho en el celular: tu voz no sale de acá.
            </p>
          </>
        )}
        {estado === 'escuchando' && (
          <p className="hxp-grande hxp-vivo">
            Pierde la canilla del baño, gotea toda la
            <span className="hxp-cursor" aria-hidden="true" />
          </p>
        )}
        {estado === 'pensando' && (
          <>
            <p className="hxp-grande hxp-apagado">
              Pierde la canilla del baño, gotea toda la noche.
            </p>
            <ol className="hxp-pasos-mini" aria-label="Lo que está haciendo">
              <li data-hecho="si">Entendí</li>
              <li data-hecho="ahora">Rubro</li>
              <li>Preguntas</li>
            </ol>
          </>
        )}
        {estado === 'hablando' && (
          <>
            <p className="hxp-grande">
              <Dicho texto="Parece un trabajo de plomería. ¿Dónde está la canilla?" />
            </p>
            <div className="hxp-chips">
              <span className="hxp-chip">En el baño</span>
              <span className="hxp-chip">En la cocina</span>
              <span className="hxp-chip">Afuera</span>
            </div>
          </>
        )}
        {estado === 'listo' && (
          <div className="hxp-vidrio hxp-mini-ficha">
            <span className="hxp-mini-ficha__ico" aria-hidden="true">
              <Icono nombre="canilla" />
            </span>
            <div>
              <p className="hxp-mini-ficha__titulo">Tu pedido de Plomería</p>
              <p className="hxp-suave">En el baño · Gotea · Desde ayer</p>
            </div>
          </div>
        )}
      </div>

      <div className="hxp-control" role="group" aria-label="Controles del modo voz">
        <span className="hxp-control__lado" title="Escribir">
          <Icono nombre="teclado" className="hxp-ico" />
        </span>
        <button
          type="button"
          className="hxp-control__mic"
          data-estado={estado}
          onClick={avanzar}
          aria-label={info.accion}
        >
          <Icono
            nombre={estado === 'hablando' ? 'pausa' : estado === 'listo' ? 'check' : 'microfono'}
          />
        </button>
        <span className="hxp-control__lado" title="Cámara (fase H5)">
          <Icono nombre="camara" className="hxp-ico" />
        </span>
      </div>
    </div>
  );
}

function PantallaChat({ estado, ir }: { estado: EstadoChat; ir: (e: EstadoChat) => void }) {
  const info = ESTADOS_CHAT.find((e) => e.id === estado)!;
  return (
    <div className="hxp-pantalla hxp-chat" data-estado={estado}>
      <span className="hxp-fondo" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <div className="hxp-chat__cab">
        <span className="hxp-chat__atras" aria-hidden="true">
          <Icono nombre="atras" className="hxp-ico" />
        </span>
        <span className="hxp-chat__avatar" data-estado={estado} aria-hidden="true">
          <Image src={LAMPARITA} alt="" width={202} height={346} />
        </span>
        <span className="hxp-chat__quien">
          <strong>HandIA</strong>
          <span className="hxp-suave">{info.subtitulo}</span>
        </span>
        <span className="hxp-pildora hxp-pildora--voz">
          <Icono nombre="microfono" className="hxp-ico" /> Voz
        </span>
      </div>

      <div className="hxp-chat__hilo">
        {estado === 'vacio' ? (
          <div className="hxp-bienvenida">
            <Orbe estado="reposo" chico />
            <p className="hxp-grande">Hola, soy HandIA</p>
            <p className="hxp-suave">
              Contame qué pasa en tu casa y armo tu pedido con vos. Escribiendo o hablando.
            </p>
            <div className="hxp-sugerencias">
              {(
                [
                  ['canilla', 'Pierde una canilla'],
                  ['rayo', 'Saltó la térmica'],
                  ['llave', 'Me quedé afuera'],
                ] as const
              ).map(([ico, txt]) => (
                <button
                  key={txt}
                  type="button"
                  className="hxp-vidrio hxp-sugerencia"
                  onClick={() => ir('pensando')}
                >
                  <Icono nombre={ico} className="hxp-ico" /> {txt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <p className="hxp-burbuja hxp-burbuja--yo">
              {estado === 'riesgo'
                ? 'Siento olor a gas en la cocina'
                : 'Pierde la canilla del baño, gotea toda la noche'}
            </p>

            {estado === 'pensando' && (
              <div className="hxp-burbuja hxp-burbuja--ia hxp-pensando">
                <ol className="hxp-pasos" aria-label="Lo que está haciendo HandIA">
                  <li data-hecho="si">
                    <Icono nombre="check" className="hxp-ico" /> Entendí el problema
                  </li>
                  <li data-hecho="ahora">
                    <span className="hxp-giro" aria-hidden="true" />{' '}
                    <span className="hxp-brillo">Eligiendo el rubro</span>
                  </li>
                  <li>Preguntas cortas</li>
                  <li>Tu pedido</li>
                </ol>
              </div>
            )}

            {estado === 'respuesta' && (
              <>
                <div className="hxp-burbuja hxp-burbuja--ia">
                  <span className="hxp-progreso">Plomería · pregunta 1 de 3</span>
                  <p>
                    Parece un trabajo de <strong>plomería</strong>. ¿Dónde está la canilla?
                  </p>
                  <p className="hxp-porque">
                    <Icono nombre="info" className="hxp-ico" /> Así el especialista sabe qué llevar.
                  </p>
                </div>
                <div className="hxp-chips">
                  {['En el baño', 'En la cocina', 'Afuera', 'Saltear'].map((c) => (
                    <button key={c} type="button" className="hxp-chip" onClick={() => ir('ficha')}>
                      {c}
                    </button>
                  ))}
                </div>
              </>
            )}

            {estado === 'ficha' && (
              <>
                <p className="hxp-burbuja hxp-burbuja--ia">
                  Listo, armé tu pedido. Revisalo: así lo leen los especialistas.
                </p>
                <div className="hxp-vidrio hxp-ficha">
                  <div className="hxp-ficha__cab">
                    <span className="hxp-mini-ficha__ico" aria-hidden="true">
                      <Icono nombre="canilla" />
                    </span>
                    <div>
                      <span className="hxp-suave">Tu pedido</span>
                      <p className="hxp-ficha__titulo">Plomería</p>
                    </div>
                    <span className="hxp-ficha__editar">
                      <Icono nombre="editar" className="hxp-ico" /> Editar
                    </span>
                  </div>
                  <div className="hxp-chips hxp-chips--datos">
                    <span className="hxp-chip">En el baño</span>
                    <span className="hxp-chip">Pierde o gotea</span>
                    <span className="hxp-chip">Desde ayer</span>
                  </div>
                  <p className="hxp-ficha__texto">
                    Pierde la canilla del baño, gotea toda la noche.
                  </p>
                  <div className="hxp-ficha__acciones">
                    <span className="hxp-boton hxp-boton--primario">
                      <Icono nombre="calendario" className="hxp-ico" /> Programar turno
                    </span>
                    <span className="hxp-boton">
                      <Icono nombre="reloj" className="hxp-ico" /> Para hoy
                    </span>
                  </div>
                </div>
              </>
            )}

            {estado === 'riesgo' && (
              <>
                <div className="hxp-riesgo" role="note">
                  <span className="hxp-riesgo__ico" aria-hidden="true">
                    <Icono nombre="alerta" />
                  </span>
                  <div>
                    <p className="hxp-riesgo__titulo">Primero, lo urgente</p>
                    <p>{AVISO_SEGURIDAD.gas}</p>
                  </div>
                </div>
                <p className="hxp-burbuja hxp-burbuja--ia">
                  Cuando estés a salvo, seguimos con el pedido. Estoy acá.
                </p>
                <div className="hxp-chips">
                  <span className="hxp-chip">Ya estoy a salvo</span>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className="hxp-redactar" aria-hidden="true">
        <Icono nombre="camara" className="hxp-ico" />
        <span className="hxp-redactar__campo">Contale a HandIA…</span>
        <span className="hxp-redactar__mic">
          <Icono nombre="microfono" className="hxp-ico" />
        </span>
      </div>
    </div>
  );
}

function Selector<T extends string>({
  etiqueta,
  opciones,
  actual,
  elegir,
}: {
  etiqueta: string;
  opciones: readonly { id: T; nombre: string }[];
  actual: T;
  elegir: (id: T) => void;
}) {
  return (
    <div className="hxp-selector" role="group" aria-label={etiqueta}>
      {opciones.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={o.id === actual}
          onClick={() => elegir(o.id)}
        >
          {o.nombre}
        </button>
      ))}
    </div>
  );
}

export function PrototipoHandia() {
  const [dir, setDir] = useState<Direccion>('calida');
  const [voz, setVoz] = useState<EstadoVoz>('reposo');
  const [chat, setChat] = useState<EstadoChat>('vacio');
  const [reproduciendo, setReproduciendo] = useState(false);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    [],
  );

  const parar = () => {
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = null;
    setReproduciendo(false);
  };

  /** Recorre todos los estados de voz y de chat, uno cada 2,4 s. */
  const reproducir = () => {
    if (reproduciendo) return parar();
    setReproduciendo(true);
    let paso = 0;
    const total = Math.max(ESTADOS_VOZ.length, ESTADOS_CHAT.length);
    const tic = () => {
      setVoz(ESTADOS_VOZ[paso % ESTADOS_VOZ.length]!.id);
      setChat(ESTADOS_CHAT[paso % ESTADOS_CHAT.length]!.id);
      paso++;
      if (paso <= total) temporizador.current = setTimeout(tic, 2400);
      else setReproduciendo(false);
    };
    tic();
  };

  /** En el chat, después de "pensando" llega sola la respuesta (como pasará con el motor). */
  const irChat = (e: EstadoChat) => {
    parar();
    setChat(e);
    if (e === 'pensando') temporizador.current = setTimeout(() => setChat('respuesta'), 1800);
  };

  const actual = DIRECCIONES.find((d) => d.id === dir)!;

  return (
    <div className="hxp">
      <header className="hxp-intro">
        <p className="hxp-etiqueta">Prototipo · fase R · datos ficticios</p>
        <h1>HandIA premium: elegí una dirección</h1>
        <p>
          Tres maneras de hacer que HandIA se vea, se mueva y se sienta cara, con la marca de
          Handyx. Cada una muestra el modo voz y el chat en todos sus estados. Tocá el micrófono,
          una sugerencia o una respuesta para avanzar, o reproducí el recorrido.
        </p>
      </header>

      <Selector etiqueta="Dirección visual" opciones={DIRECCIONES} actual={dir} elegir={setDir} />

      <section className={`hxp-dir hxp-dir--${dir}`} aria-labelledby="hxp-dir-titulo">
        <div className="hxp-dir__texto">
          <h2 id="hxp-dir-titulo">{actual.nombre}</h2>
          <p>{actual.idea}</p>
          <ul>
            {actual.claves.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <button
            type="button"
            className="hxp-reproducir"
            onClick={reproducir}
            aria-pressed={reproduciendo}
          >
            <Icono nombre={reproduciendo ? 'pausa' : 'play'} className="hxp-ico" />
            {reproduciendo ? 'Pausar recorrido' : 'Reproducir recorrido'}
          </button>
        </div>

        <div className="hxp-par">
          <figure className="hxp-tel">
            <PantallaVoz
              estado={voz}
              avanzar={() => {
                parar();
                setVoz(SIGUIENTE_VOZ[voz]);
              }}
            />
            <figcaption>
              <strong>Modo voz</strong>
              <Selector
                etiqueta="Estado del modo voz"
                opciones={ESTADOS_VOZ}
                actual={voz}
                elegir={(e) => {
                  parar();
                  setVoz(e);
                }}
              />
            </figcaption>
          </figure>

          <figure className="hxp-tel">
            <PantallaChat estado={chat} ir={irChat} />
            <figcaption>
              <strong>Chat</strong>
              <Selector
                etiqueta="Estado del chat"
                opciones={ESTADOS_CHAT}
                actual={chat}
                elegir={irChat}
              />
            </figcaption>
          </figure>
        </div>
      </section>
    </div>
  );
}
