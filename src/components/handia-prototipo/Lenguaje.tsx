// R3 · Lenguaje visual de HandIA: cada pieza con el token o la clase que la define (docs/handia-r3-lenguaje.md).
import { Icono } from '@/components/Icono';
import type { NombreIcono } from '@/components/trazos';
import { AVISO_SEGURIDAD } from '@/domain/handia';
import {
  AvisoRiesgo,
  BotonPremium,
  BurbujaHandia,
  Escena,
  type EstadoOrbe,
  Orbe,
  PasosPensando,
  TarjetaVidrio,
} from '@/components/handia/piezas';

const COLORES = [
  ['Noche', '--hia-noche'],
  ['Azul hondo', '--hia-azul-hondo'],
  ['Azul luz', '--hia-azul-luz'],
  ['Celeste', '--hia-celeste'],
  ['Ámbar', '--hia-ambar'],
  ['Miel', '--hia-miel'],
  ['Crema', '--hia-crema'],
  ['Papel', '--hia-papel'],
] as const;

const ESTADOS: readonly [EstadoOrbe, string][] = [
  ['reposo', 'Reposo: respira'],
  ['escuchando', 'Escucha: late con la voz'],
  ['pensando', 'Piensa: gira el aro'],
  ['hablando', 'Habla: pulsa la luz'],
  ['listo', 'Listo: chispas'],
  ['apagado', 'No puede escuchar'],
];

const ICONOS: readonly [NombreIcono, string][] = [
  ['handia', 'HandIA'],
  ['onda', 'Voz'],
  ['subtitulos', 'Subtítulos'],
  ['encuadre', 'Cámara'],
  ['sinSenal', 'Sin conexión'],
  ['vibrar', 'Vibración'],
  ['microfono', 'Micrófono'],
  ['teclado', 'Escribir'],
];

function Muestra({
  titulo,
  token,
  children,
}: {
  titulo: string;
  token: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="hxl-muestra">
      {children}
      <figcaption>
        <strong>{titulo}</strong>
        <code>{token}</code>
      </figcaption>
    </figure>
  );
}

export function Lenguaje() {
  return (
    <div className="hxl">
      <p className="hxp-intro">
        Dirección de trabajo <strong>Luz cálida+</strong>: la luz cálida de A, el texto grande y el
        brillo desde los controles de B y la ficha de vidrio de C. Todo sale de{' '}
        <code>tokens.css</code> (§3 y §4) y de las clases <code>.hia-*</code> de{' '}
        <code>styles/handia.css</code>: cambiar de dirección es cambiar un bloque de tokens.
      </p>

      <h3>Color</h3>
      <div className="hxl-colores">
        {COLORES.map(([n, t]) => (
          <Muestra key={t} titulo={n} token={t}>
            <span className="hxl-color" style={{ background: `var(${t})` }} />
          </Muestra>
        ))}
      </div>

      <h3>Escenas y degradé vivo</h3>
      <div className="hxl-fila">
        <Muestra titulo="Voz" token="--hia-voz-fondo">
          <Escena tipo="voz" className="hxl-escena">
            <p className="hia-display">La luz sale del personaje</p>
          </Escena>
        </Muestra>
        <Muestra titulo="Chat" token="--hia-chat-fondo">
          <Escena tipo="chat" className="hxl-escena">
            <p className="hia-display">Papel cálido con miel arriba</p>
          </Escena>
        </Muestra>
      </div>

      <h3>Vidrio, profundidad y formas</h3>
      <div className="hxl-fila">
        <Muestra titulo="Vidrio claro" token=".hia-vidrio · --hia-desenfoque">
          <Escena tipo="chat" className="hxl-escena">
            <TarjetaVidrio className="hxl-tarjeta">Tarjeta de vidrio · radio 22</TarjetaVidrio>
          </Escena>
        </Muestra>
        <Muestra titulo="Vidrio oscuro" token=".hia-vidrio--oscuro">
          <Escena tipo="voz" className="hxl-escena">
            <TarjetaVidrio oscuro className="hxl-tarjeta">
              Siempre con borde: el desenfoque solo no separa
            </TarjetaVidrio>
          </Escena>
        </Muestra>
      </div>

      <h3>Tipografía</h3>
      <Escena tipo="chat" className="hxl-tipos">
        <p className="hia-display">¿Qué está pasando en tu casa?</p>
        <code>Archivo 800 · --hia-t-display (1,45 a 1,75 rem) · alto 1,18 · equilibrado</code>
        <p>Contame qué pasa y armo tu pedido con vos. DM Sans 400 para todo lo demás.</p>
        <p className="hia-suave">Texto suave: --hia-chat-suave (5:1 sobre papel)</p>
      </Escena>

      <h3>El orbe en cada estado</h3>
      <Escena tipo="voz" className="hxl-orbes">
        {ESTADOS.map(([e, n]) => (
          <figure key={e}>
            <Orbe estado={e} tamano="chico" />
            <figcaption>{n}</figcaption>
          </figure>
        ))}
      </Escena>

      <h3>Conversación</h3>
      <div className="hxl-fila">
        <Escena tipo="chat" className="hxl-conversa">
          <BurbujaHandia de="yo">Pierde la canilla del baño</BurbujaHandia>
          <BurbujaHandia de="ia">
            <span className="hia-progreso">Plomería · pregunta 1 de 3</span>
            <p>¿Dónde está la canilla?</p>
            <p className="hia-porque">
              <Icono nombre="info" className="hia-ico" /> Así el especialista sabe qué llevar.
            </p>
          </BurbujaHandia>
          <div className="hia-chips">
            <span className="hia-chip">En el baño</span>
            <span className="hia-chip">En la cocina</span>
          </div>
          <BurbujaHandia de="ia">
            <PasosPensando
              pasos={[
                { texto: 'Entendí el problema', estado: 'hecho' },
                { texto: 'Eligiendo el rubro', estado: 'ahora' },
                { texto: 'Tu pedido', estado: 'falta' },
              ]}
            />
          </BurbujaHandia>
        </Escena>
        <Escena tipo="chat" className="hxl-conversa">
          <AvisoRiesgo texto={AVISO_SEGURIDAD.electricidad} />
          <div className="hxl-botones">
            <BotonPremium icono="calendario">Primario</BotonPremium>
            <BotonPremium variante="destacado" icono="microfono">
              Destacado
            </BotonPremium>
            <BotonPremium variante="vidrio" icono="teclado">
              Vidrio
            </BotonPremium>
          </div>
          <p className="hia-suave hxl-nota">
            Los botones de pedir, aceptar y pagar nunca se animan. Chips y botones: 44 px de alto
            como mínimo.
          </p>
        </Escena>
      </div>

      <h3>Íconos propios</h3>
      <div className="hxl-iconos">
        {ICONOS.map(([i, n]) => (
          <span key={i}>
            <Icono nombre={i} />
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}
