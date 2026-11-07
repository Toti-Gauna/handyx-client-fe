// R4 + R6 · Pantallas en alta de HandIA con la dirección de trabajo (Luz cálida+) y sus puertas de entrada en la app.
// Maquetas estáticas con datos ficticios: no hay nada clickeable adentro de los teléfonos.
import Image from 'next/image';
import type { ReactNode } from 'react';
import { Icono } from '@/components/Icono';
import type { NombreIcono } from '@/components/trazos';
import { RUBROS } from '@/contracts/v1/pedidos';
import { AVISO_SEGURIDAD } from '@/domain/handia';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { NAVEGACION } from '@/mapa/pantallas';
import {
  AvisoRiesgo,
  BotonPremium,
  BurbujaHandia,
  Dicho,
  Escena,
  type EstadoOrbe,
  Orbe,
  PasosPensando,
  TarjetaVidrio,
} from '@/components/handia/piezas';

const LAMPARITA = '/img/handy-lamparita.webp';

function Tel({
  titulo,
  nota,
  fase,
  children,
}: {
  titulo: string;
  nota: string;
  fase?: string;
  children: ReactNode;
}) {
  return (
    <figure className="hxp-tel hxs-tel">
      <div className="hxs-pantalla">{children}</div>
      <figcaption>
        <strong>
          {titulo}
          {fase && <span className="hxs-fase">{fase}</span>}
        </strong>
        <span>{nota}</span>
      </figcaption>
    </figure>
  );
}

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="hxs-grupo" aria-label={titulo}>
      <h3>{titulo}</h3>
      <div className="hxs-grilla">{children}</div>
    </section>
  );
}

// ── Piezas de la app alrededor de HandIA (puertas, R6) ─────────────────────────────────────────────
function BarraApp({ activa }: { activa: (typeof NAVEGACION)[number]['id'] }) {
  return (
    <span className="hxs-barra">
      {NAVEGACION.map((n) => (
        <span key={n.id} data-activa={n.id === activa || undefined}>
          <Icono nombre={n.icono} className="hia-ico" />
          {n.etiqueta}
        </span>
      ))}
    </span>
  );
}

/** La puerta de HandIA: una tarjeta oscura con el orbe chico, igual en todas las pantallas. */
function Puerta({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <Escena tipo="voz" className="hxs-puerta">
      <Orbe estado="reposo" tamano="mini" />
      <span className="hxs-puerta__texto">
        <strong>{titulo}</strong>
        <span className="hia-suave">{texto}</span>
      </span>
      <span className="hxs-puerta__mic" aria-hidden="true">
        <Icono nombre="microfono" className="hia-ico" />
      </span>
    </Escena>
  );
}

function PantallaApp({
  titulo,
  activa,
  children,
}: {
  titulo: string;
  activa: (typeof NAVEGACION)[number]['id'];
  children: ReactNode;
}) {
  return (
    <div className="hxs-app">
      <p className="hxs-app__titulo">{titulo}</p>
      <div className="hxs-app__cuerpo">{children}</div>
      <BarraApp activa={activa} />
    </div>
  );
}

// ── Chat y voz ────────────────────────────────────────────────────────────────────────────────────
function Chat({
  sub,
  estado,
  escrito,
  children,
}: {
  sub: string;
  estado?: 'pensando';
  escrito?: string;
  children: ReactNode;
}) {
  return (
    <Escena tipo="chat" className="hxs-llena">
      <div className="hia-chat-cab">
        <Icono nombre="atras" className="hia-ico" />
        <span className="hia-avatar" data-estado={estado}>
          <Image src={LAMPARITA} alt="" width={202} height={346} />
        </span>
        <span className="hia-chat-cab__quien">
          <strong>HandIA</strong>
          <small>{sub}</small>
        </span>
        <span className="hia-pildora">
          <Icono nombre="onda" className="hia-ico" /> Voz
        </span>
      </div>
      <div className="hia-hilo">{children}</div>
      <div className="hia-redactar">
        <Icono nombre="encuadre" className="hia-ico" />
        <span className={`hia-redactar__campo${escrito ? ' hia-redactar__campo--escrito' : ''}`}>
          {escrito ?? 'Contale a HandIA…'}
        </span>
        <span className="hia-redactar__mic">
          <Icono nombre={escrito ? 'enviar' : 'microfono'} className="hia-ico" />
        </span>
      </div>
    </Escena>
  );
}

function Voz({
  orbe,
  rotulo,
  children,
  mic = 'microfono',
}: {
  orbe: EstadoOrbe;
  rotulo: string;
  children: ReactNode;
  mic?: NombreIcono;
}) {
  return (
    <Escena tipo="voz" className="hxs-llena hia-voz">
      <div className="hia-voz__arriba">
        <span className="hia-voz__marca">
          <Icono nombre="handia" className="hia-ico" /> HandIA
        </span>
        <span className="hia-pildora">
          <Icono nombre="subtitulos" className="hia-ico" /> Subtítulos
        </span>
      </div>
      <Orbe estado={orbe} tamano={orbe === 'apagado' ? 'chico' : 'grande'} />
      <p className="hia-rotulo hxs-centro">{rotulo}</p>
      <div className="hia-voz__centro">{children}</div>
      <div className="hia-control">
        <span className="hia-control__lado">
          <Icono nombre="teclado" className="hia-ico" />
        </span>
        <span className="hia-mic" data-estado={orbe}>
          <Icono nombre={mic} className="hia-ico" />
        </span>
        <span className="hia-control__lado">
          <Icono nombre="encuadre" className="hia-ico" />
        </span>
      </div>
    </Escena>
  );
}

const YO = 'Pierde la canilla del baño, gotea toda la noche';

function Ficha() {
  return (
    <TarjetaVidrio className="hia-ficha">
      <div className="hia-ficha__cab">
        <span className="hia-ficha__ico">
          <Icono nombre="canilla" className="hia-ico" />
        </span>
        <div>
          <span className="hia-suave">Tu pedido</span>
          <p className="hia-ficha__titulo">Plomería</p>
        </div>
        <span className="hxs-editar">
          <Icono nombre="editar" className="hia-ico" /> Editar
        </span>
      </div>
      <div className="hia-chips">
        <span className="hia-chip hia-chip--dato">En el baño</span>
        <span className="hia-chip hia-chip--dato">Pierde o gotea</span>
        <span className="hia-chip hia-chip--dato">Desde ayer</span>
      </div>
      <p className="hia-ficha__texto">{YO}.</p>
      <div className="hia-ficha__acciones">
        <BotonPremium icono="calendario">Programar turno</BotonPremium>
        <BotonPremium variante="vidrio" icono="reloj">
          Para hoy
        </BotonPremium>
      </div>
    </TarjetaVidrio>
  );
}

const PROPUESTAS = [
  { quien: 'Lucía P.', precio: '$ 38.000', cuando: 'Jue 19/11 · 9 a 12 h', resenas: '12 reseñas' },
  { quien: 'Diego R.', precio: '$ 45.000', cuando: 'Jue 19/11 · 14 a 17 h', resenas: '4 reseñas' },
  {
    quien: 'Sofía M.',
    precio: '$ 52.000',
    cuando: 'Vie 20/11 · 9 a 12 h',
    resenas: 'Sin reseñas todavía',
  },
];

export function Pantallas() {
  return (
    <div className="hxs">
      <p className="hxp-intro">
        Todas las pantallas de HandIA con la dirección de trabajo, más las puertas de entrada desde
        la app (R6). Lo que lleva una fase (H4, H5) todavía no existe: se diseña ahora para que todo
        sea una sola experiencia.
      </p>

      <Grupo titulo="Puertas de entrada (R6)">
        <Tel
          titulo="Inicio"
          nota="La puerta más grande: arriba de los rubros, con el orbe que respira."
        >
          <PantallaApp titulo="Hola, Ana" activa="inicio">
            <span className="hxs-direccion">
              <Icono nombre="pin" className="hia-ico" /> Tu casa · Mar del Plata
            </span>
            <Puerta
              titulo="Contale a HandIA"
              texto="Armo tu pedido con vos, escribiendo o hablando."
            />
            <span className="hxs-subtitulo">O elegí el rubro</span>
            <span className="hxs-rubros">
              {RUBROS.map((r) => (
                <span key={r}>
                  <Icono nombre={RUBROS_INFO[r].icono} className="hia-ico" />
                  {RUBROS_INFO[r].corto}
                </span>
              ))}
            </span>
          </PantallaApp>
        </Tel>
        <Tel titulo="Pedir" nota="Si no sabés qué rubro es, HandIA te lo sugiere.">
          <PantallaApp titulo="¿Qué necesitás?" activa="inicio">
            <Puerta titulo="¿No sabés qué rubro es?" texto="Contale a HandIA lo que pasa." />
            <span className="hxs-rubros hxs-rubros--lista">
              {RUBROS.slice(0, 4).map((r) => (
                <span key={r}>
                  <Icono nombre={RUBROS_INFO[r].icono} className="hia-ico" />
                  <span>
                    {RUBROS_INFO[r].nombre}
                    <small>{RUBROS_INFO[r].ejemplo}</small>
                  </span>
                </span>
              ))}
            </span>
          </PantallaApp>
        </Tel>
        <Tel titulo="Actividad" nota="Para corregir un pedido abierto sin rehacerlo.">
          <PantallaApp titulo="Actividad" activa="pedidos">
            <TarjetaVidrio className="hxs-pedido">
              <strong>Plomería · baño</strong>
              <span className="hia-suave">Esperando propuestas</span>
            </TarjetaVidrio>
            <Puerta titulo="¿Te faltó contar algo?" texto="HandIA te ayuda a sumarlo al pedido." />
          </PantallaApp>
        </Tel>
        <Tel
          titulo="Ayuda"
          nota="Quien entra a Ayuda queriendo pedir un arreglo encuentra el camino."
        >
          <PantallaApp titulo="Centro de ayuda" activa="cuenta">
            <span className="hxs-buscar">
              <Icono nombre="lupa" className="hia-ico" /> Buscar en la ayuda
            </span>
            <Puerta titulo="¿Querés pedir un arreglo?" texto="Contale a HandIA y lo armamos." />
            <span className="hxs-lista">
              <span>¿Cómo pago el trabajo?</span>
              <span>¿Qué pasa si cancelo?</span>
            </span>
          </PantallaApp>
        </Tel>
        <Tel
          titulo="Primer uso · 1 de 3"
          nota="Presentación corta, solo la primera vez; se puede saltear."
        >
          <Escena tipo="voz" className="hxs-llena hxs-intro">
            <span className="hxs-saltear">Saltear</span>
            <Orbe estado="reposo" />
            <p className="hia-display">Soy HandIA</p>
            <p className="hia-suave">
              Te ayudo a armar el pedido para que te lleguen propuestas que encajen.
            </p>
            <span className="hxs-puntos" aria-hidden="true">
              <i data-activo="" />
              <i />
              <i />
            </span>
            <BotonPremium variante="destacado">Seguir</BotonPremium>
          </Escena>
        </Tel>
        <Tel titulo="Primer uso · 3 de 3" nota="La privacidad dicha simple, antes de empezar.">
          <Escena tipo="voz" className="hxs-llena hxs-intro">
            <Orbe estado="listo" tamano="chico" />
            <p className="hia-display">Lo que contás queda en tu celular</p>
            <ul className="hxs-promesas">
              <li>
                <Icono nombre="microfono" className="hia-ico" /> Tu voz se reconoce en el teléfono:
                no se graba ni se manda.
              </li>
              <li>
                <Icono nombre="escudo" className="hia-ico" /> Saco teléfonos, emails y documentos
                antes de armar el pedido.
              </li>
              <li>
                <Icono nombre="editar" className="hia-ico" /> Vos revisás y corregís todo antes de
                publicar.
              </li>
            </ul>
            <span className="hxs-puntos" aria-hidden="true">
              <i />
              <i />
              <i data-activo="" />
            </span>
            <BotonPremium variante="destacado">Empezar</BotonPremium>
          </Escena>
        </Tel>
      </Grupo>

      <Grupo titulo="Chat">
        <Tel titulo="Bienvenida" nota="El personaje, una promesa y tres ejemplos tocables.">
          <Chat sub="En tu celular">
            <div className="hxs-bienvenida">
              <Orbe estado="reposo" tamano="chico" />
              <p className="hia-display">Hola, soy HandIA</p>
              <p className="hia-suave">Contame qué pasa en tu casa y armo tu pedido con vos.</p>
              <span className="hxs-sugerencias">
                {(
                  [
                    ['canilla', 'Pierde una canilla'],
                    ['rayo', 'Saltó la térmica'],
                    ['llave', 'Me quedé afuera'],
                  ] as const
                ).map(([i, t]) => (
                  <TarjetaVidrio key={t} className="hxs-sugerencia">
                    <Icono nombre={i} className="hia-ico" /> {t}
                  </TarjetaVidrio>
                ))}
              </span>
            </div>
          </Chat>
        </Tel>
        <Tel
          titulo="Pensando"
          nota="Los pasos a la vista: se ve qué está haciendo, nunca una espera muda."
        >
          <Chat sub="Pensando…" estado="pensando">
            <BurbujaHandia de="yo">{YO}</BurbujaHandia>
            <BurbujaHandia de="ia">
              <PasosPensando
                pasos={[
                  { texto: 'Entendí el problema', estado: 'hecho' },
                  { texto: 'Eligiendo el rubro', estado: 'ahora' },
                  { texto: 'Preguntas cortas', estado: 'falta' },
                  { texto: 'Tu pedido', estado: 'falta' },
                ]}
              />
            </BurbujaHandia>
          </Chat>
        </Tel>
        <Tel
          titulo="Pregunta"
          nota="Progreso, la pregunta y por qué se pregunta. Opciones grandes y “Saltear”."
        >
          <Chat sub="Armando tu pedido">
            <BurbujaHandia de="yo">{YO}</BurbujaHandia>
            <BurbujaHandia de="ia">
              <span className="hia-progreso">Plomería · pregunta 1 de 3</span>
              <p>
                Parece un trabajo de <strong>plomería</strong>. ¿Dónde está la canilla?
              </p>
              <p className="hia-porque">
                <Icono nombre="info" className="hia-ico" /> Así el especialista sabe qué llevar.
              </p>
            </BurbujaHandia>
            <span className="hia-chips">
              {['En el baño', 'En la cocina', 'Afuera', 'Saltear'].map((c) => (
                <span key={c} className="hia-chip">
                  {c}
                </span>
              ))}
            </span>
          </Chat>
        </Tel>
        <Tel
          titulo="Ficha"
          nota="La ficha de vidrio: lo que entendió, editable, y las dos formas de pedir."
        >
          <Chat sub="Pedido listo para revisar">
            <BurbujaHandia de="ia">
              Listo, armé tu pedido. Revisalo: así lo leen los especialistas.
            </BurbujaHandia>
            <Ficha />
          </Chat>
        </Tel>
        <Tel
          titulo="Riesgo"
          nota="La seguridad va primero, con el mismo texto que usa el motor hoy."
        >
          <Chat sub="Primero, tu seguridad">
            <BurbujaHandia de="yo">Siento olor a gas en la cocina</BurbujaHandia>
            <AvisoRiesgo texto={AVISO_SEGURIDAD.gas} />
            <BurbujaHandia de="ia">
              Cuando estés a salvo, seguimos con el pedido. Estoy acá.
            </BurbujaHandia>
          </Chat>
        </Tel>
      </Grupo>

      <Grupo titulo="Modo voz">
        <Tel titulo="Lista" nota="Una pregunta grande y la promesa de privacidad.">
          <Voz orbe="reposo" rotulo="Lista para escucharte">
            <p className="hia-display">¿Qué está pasando en tu casa?</p>
            <p className="hia-suave">Tocá el micrófono y contame. Tu voz no sale del celular.</p>
          </Voz>
        </Tel>
        <Tel
          titulo="Escucha"
          nota="Transcripción en vivo, grande. El aro sigue el nivel de la voz (H2)."
        >
          <Voz orbe="escuchando" rotulo="Te escucho">
            <p className="hia-display">
              Pierde la canilla del baño, gotea toda la
              <span className="hia-cursor" aria-hidden="true" />
            </p>
          </Voz>
        </Tel>
        <Tel titulo="Piensa" nota="Lo dicho queda atenuado; los pasos en pastillas.">
          <Voz orbe="pensando" rotulo="Pensando" mic="onda">
            <p className="hia-display hxs-apagado">{YO}.</p>
            <PasosPensando
              pasos={[
                { texto: 'Entendí', estado: 'hecho' },
                { texto: 'Rubro', estado: 'ahora' },
              ]}
            />
          </Voz>
        </Tel>
        <Tel
          titulo="Habla"
          nota="La respuesta se resalta mientras se dice; tocar el botón interrumpe."
        >
          <Voz orbe="hablando" rotulo="Hablando · tocá para interrumpir" mic="pausa">
            <p className="hia-display">
              <Dicho texto="Parece un trabajo de plomería. ¿Dónde está la canilla?" />
            </p>
            <span className="hia-chips">
              <span className="hia-chip">En el baño</span>
              <span className="hia-chip">En la cocina</span>
            </span>
          </Voz>
        </Tel>
        <Tel titulo="Encontró" nota="Chispas y la ficha en chico; se revisa en el chat.">
          <Voz orbe="listo" rotulo="Pedido listo" mic="check">
            <TarjetaVidrio className="hxs-mini-ficha">
              <span className="hia-ficha__ico">
                <Icono nombre="canilla" className="hia-ico" />
              </span>
              <span>
                <strong>Tu pedido de Plomería</strong>
                <span className="hia-suave">En el baño · Gotea · Desde ayer</span>
              </span>
            </TarjetaVidrio>
            <BotonPremium variante="destacado">Revisar el pedido</BotonPremium>
          </Voz>
        </Tel>
        <Tel
          titulo="No puede escuchar"
          nota="Si el navegador mandaría la voz afuera, no escucha y lo explica."
        >
          <Voz orbe="apagado" rotulo="Este navegador no escucha en el celular" mic="teclado">
            <p className="hia-suave">
              Para cuidarte, solo escucho si tu voz se reconoce en el teléfono, y acá no se puede.
              Escribime y te leo las respuestas en voz alta.
            </p>
            <BotonPremium variante="destacado" icono="teclado">
              Escribir
            </BotonPremium>
          </Voz>
        </Tel>
        <Tel titulo="Sin permiso" nota="Permiso de micrófono negado: cómo activarlo, sin culpa.">
          <Voz orbe="apagado" rotulo="No tengo permiso para el micrófono" mic="teclado">
            <p className="hia-suave">
              Podés activarlo en los permisos del navegador para este sitio, o seguir escribiendo.
            </p>
            <BotonPremium variante="vidrio" icono="teclado">
              Seguir escribiendo
            </BotonPremium>
          </Voz>
        </Tel>
      </Grupo>

      <Grupo titulo="Cámara (fase H5)">
        <Tel
          titulo="Sacar la foto"
          fase="H5"
          nota="La foto va al pedido, para el especialista. HandIA no la ve."
        >
          <Escena tipo="voz" className="hxs-llena hxs-camara">
            <span className="hxs-camara__aviso hia-pildora">
              <Icono nombre="escudo" className="hia-ico" /> Sin ubicación ni datos del teléfono
            </span>
            <span className="hxs-visor" aria-hidden="true">
              <Icono nombre="canilla" className="hxs-visor__ico" />
            </span>
            <p className="hia-display hxs-centro">Sacale una foto a lo que se rompió</p>
            <span className="hxs-camara__botones">
              <span className="hia-pildora">Cancelar</span>
              <span className="hxs-disparador" />
              <span className="hia-pildora">Galería</span>
            </span>
          </Escena>
        </Tel>
        <Tel
          titulo="¿Va esta foto?"
          fase="H5"
          nota="Antes de sumarla, un control a la vista: caras, documentos, direcciones."
        >
          <Chat sub="Sumando una foto">
            <TarjetaVidrio className="hxs-foto">
              <span className="hxs-visor hxs-visor--chico" aria-hidden="true">
                <Icono nombre="canilla" className="hxs-visor__ico" />
              </span>
              <p>
                <strong>¿Se ve alguna cara, documento o dirección?</strong> Si es así, sacá otra: la
                foto la ven los especialistas.
              </p>
              <span className="hia-ficha__acciones">
                <BotonPremium icono="check">Usar foto</BotonPremium>
                <BotonPremium variante="vidrio" icono="reintentar">
                  Otra
                </BotonPremium>
              </span>
            </TarjetaVidrio>
          </Chat>
        </Tel>
      </Grupo>

      <Grupo titulo="Agente y propuestas (fase H4)">
        <Tel
          titulo="Buscando"
          fase="H4"
          nota="HandIA publica solo lo que confirmaste y cuenta qué está haciendo."
        >
          <Chat sub="Buscando propuestas" estado="pensando">
            <BurbujaHandia de="ia">
              <PasosPensando
                pasos={[
                  { texto: 'Publiqué tu pedido (lo confirmaste vos)', estado: 'hecho' },
                  { texto: 'Esperando propuestas', estado: 'ahora' },
                  { texto: 'Te aviso cuando lleguen', estado: 'falta' },
                ]}
              />
            </BurbujaHandia>
            <BurbujaHandia de="ia">
              Podés cerrar la app: te avisamos. Las propuestas llegan cuando cada especialista
              responde.
            </BurbujaHandia>
          </Chat>
        </Tel>
        <Tel
          titulo="Propuestas"
          fase="H4"
          nota="En orden de llegada, sin rankings. Vos elegís: HandIA no acepta por vos."
        >
          <Chat sub="3 propuestas">
            <BurbujaHandia de="ia">
              Llegaron 3 propuestas para tu pedido, en el orden en que llegaron.
            </BurbujaHandia>
            {PROPUESTAS.map((p) => (
              <TarjetaVidrio key={p.quien} className="hxs-propuesta">
                <span className="hxs-propuesta__fila">
                  <strong>{p.quien}</strong>
                  <strong className="hxs-precio">{p.precio}</strong>
                </span>
                <span className="hia-suave">
                  {p.cuando} · {p.resenas}
                </span>
                <span className="hxs-ver">Ver detalle</span>
              </TarjetaVidrio>
            ))}
          </Chat>
        </Tel>
      </Grupo>

      <Grupo titulo="Errores y sin conexión">
        <Tel titulo="No entendí" nota="Sin culpa: pide otra forma o deja elegir el rubro.">
          <Chat sub="En tu celular">
            <BurbujaHandia de="yo">eso de arriba que hace ruido</BurbujaHandia>
            <BurbujaHandia de="ia">
              No me quedó claro. ¿Me lo contás con otras palabras, o elegís el rubro?
            </BurbujaHandia>
            <span className="hia-chips">
              {RUBROS.slice(0, 4).map((r) => (
                <span key={r} className="hia-chip">
                  <Icono nombre={RUBROS_INFO[r].icono} className="hia-ico" /> {RUBROS_INFO[r].corto}
                </span>
              ))}
            </span>
          </Chat>
        </Tel>
        <Tel
          titulo="Sin conexión"
          nota="Nada se da por hecho: no se mandó y lo escrito sigue en pantalla."
        >
          <Chat sub="Sin conexión" escrito="Pierde la canilla del baño">
            <span className="hxs-sin-red" role="status">
              <Icono nombre="sinSenal" className="hia-ico" />
              <span>
                <strong>Sin conexión.</strong> No se mandó nada; lo que escribiste sigue acá.
              </span>
              <span className="hia-chip">Reintentar</span>
            </span>
          </Chat>
        </Tel>
      </Grupo>

      <section className="hxs-grupo" aria-label="Escritorio">
        <h3>Escritorio</h3>
        <figure className="hxs-escritorio">
          <div
            className="hxs-escritorio__marco"
            tabIndex={0}
            aria-label="Maqueta de HandIA en escritorio (se desplaza)"
          >
            <Escena tipo="chat" className="hxs-escritorio__escena">
              <div className="hxs-escritorio__chat">
                <BurbujaHandia de="yo">{YO}</BurbujaHandia>
                <BurbujaHandia de="ia">
                  <span className="hia-progreso">Plomería · pregunta 2 de 3</span>
                  <p>¿Desde cuándo pasa?</p>
                </BurbujaHandia>
                <span className="hia-chips">
                  {['Desde hoy', 'Desde ayer', 'Hace días'].map((c) => (
                    <span key={c} className="hia-chip">
                      {c}
                    </span>
                  ))}
                </span>
                <div className="hia-redactar">
                  <span className="hia-redactar__campo">Contale a HandIA…</span>
                  <span className="hia-redactar__mic">
                    <Icono nombre="microfono" className="hia-ico" />
                  </span>
                </div>
              </div>
              <aside className="hxs-escritorio__lado" aria-label="Pedido que se va armando">
                <Orbe estado="pensando" tamano="chico" />
                <Ficha />
              </aside>
            </Escena>
          </div>
          <figcaption>
            <strong>Escritorio</strong>
            <span>La ficha se arma en vivo al costado mientras se conversa.</span>
          </figcaption>
        </figure>
      </section>
    </div>
  );
}
