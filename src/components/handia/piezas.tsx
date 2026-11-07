// Piezas del lenguaje visual de HandIA (fase R: R3 las define, R8 las deja como base para H2/H3). Estilos en
// styles/handia.css. Son presentacionales: no escuchan, no hablan ni piden datos; el estado lo decide quien las usa.
import Image from 'next/image';
import type { CSSProperties, ReactNode } from 'react';
import { Icono } from '@/components/Icono';
import type { NombreIcono } from '@/components/trazos';

export type EstadoOrbe = 'reposo' | 'escuchando' | 'pensando' | 'hablando' | 'listo' | 'apagado';

const LAMPARITA = '/img/handy-lamparita.webp';
const conIndice = (i: number) => ({ '--i': i }) as CSSProperties;

/**
 * La lamparita como orbe: respira en reposo, late al escuchar (o sigue `nivel` 0–1 si lo hay), un aro gira al
 * pensar, la luz pulsa al hablar y suelta chispas cuando el pedido está listo. Decorativo: el estado se dice aparte.
 */
export function Orbe({
  estado,
  tamano = 'grande',
  nivel,
}: {
  estado: EstadoOrbe;
  tamano?: 'grande' | 'chico' | 'mini';
  nivel?: number;
}) {
  const estilo =
    nivel === undefined
      ? undefined
      : ({ '--hia-nivel': Math.max(0, Math.min(1, nivel)) } as CSSProperties);
  return (
    <div
      className={`hia-orbe${tamano === 'grande' ? '' : ` hia-orbe--${tamano}`}`}
      data-estado={estado}
      data-nivel-real={nivel === undefined ? undefined : ''}
      style={estilo}
      aria-hidden="true"
    >
      <span className="hia-orbe__halo" />
      <span className="hia-orbe__aro" />
      <span className="hia-orbe__nivel" />
      <Image className="hia-orbe__handy" src={LAMPARITA} alt="" width={202} height={346} />
      <span className="hia-orbe__chispas">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <i key={i} style={conIndice(i)} />
        ))}
      </span>
    </div>
  );
}

/** Degradé vivo: tres manchas desenfocadas que flotan detrás de la escena. */
export function DegradeVivo() {
  return (
    <span className="hia-fondo" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

/** Escena de HandIA: `voz` (oscura, la luz sale del personaje) o `chat` (papel cálido). */
export function Escena({
  tipo,
  className = '',
  children,
}: {
  tipo: 'voz' | 'chat';
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`hia-escena hia-escena--${tipo} ${className}`.trim()}>
      <DegradeVivo />
      {children}
    </div>
  );
}

export function TarjetaVidrio({
  oscuro = false,
  className = '',
  children,
}: {
  oscuro?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`hia-vidrio${oscuro ? ' hia-vidrio--oscuro' : ''} ${className}`.trim()}>
      {children}
    </div>
  );
}

type VarianteBoton = 'primario' | 'destacado' | 'vidrio';

/** Botón premium. `onClick` lo vuelve botón; sin él es una maqueta (span). Nunca se anima. */
export function BotonPremium({
  variante = 'primario',
  icono,
  onClick,
  children,
}: {
  variante?: VarianteBoton;
  icono?: NombreIcono;
  onClick?: () => void;
  children: ReactNode;
}) {
  const contenido = (
    <>
      {icono && <Icono nombre={icono} className="hia-ico" />}
      {children}
    </>
  );
  const clase = `hia-boton hia-boton--${variante}`;
  return onClick ? (
    <button type="button" className={clase} onClick={onClick}>
      {contenido}
    </button>
  ) : (
    <span className={clase}>{contenido}</span>
  );
}

/** Burbuja del hilo: lo que dice HandIA (`ia`) o la persona (`yo`). */
export function BurbujaHandia({ de, children }: { de: 'ia' | 'yo'; children: ReactNode }) {
  return <div className={`hia-burbuja hia-burbuja--${de}`}>{children}</div>;
}

export type EstadoPaso = 'hecho' | 'ahora' | 'falta';

/** "Pensando" con los pasos a la vista (entendí → rubro → preguntas → pedido). */
export function PasosPensando({
  pasos,
}: {
  pasos: readonly { texto: string; estado: EstadoPaso }[];
}) {
  return (
    <ol className="hia-pasos" aria-label="Lo que está haciendo HandIA">
      {pasos.map((p) => (
        <li key={p.texto} data-paso={p.estado === 'falta' ? undefined : p.estado}>
          {p.estado === 'hecho' && <Icono nombre="check" className="hia-ico" />}
          {p.estado === 'ahora' && <span className="hia-giro" aria-hidden="true" />}
          <span className={p.estado === 'ahora' ? 'hia-brillo' : undefined}>
            {p.texto}
            {p.estado === 'ahora' && <span className="sr-only"> (ahora)</span>}
            {p.estado === 'hecho' && <span className="sr-only"> (listo)</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Texto que se resalta palabra por palabra mientras HandIA lo dice. */
export function Dicho({ texto }: { texto: string }) {
  return (
    <span className="hia-dicho">
      {texto.split(' ').map((p, i) => (
        <span key={i} style={conIndice(i)}>
          {p}{' '}
        </span>
      ))}
    </span>
  );
}

/** Aviso de riesgo: va primero, con ícono, título y el texto del motor. */
export function AvisoRiesgo({
  titulo = 'Primero, lo urgente',
  texto,
}: {
  titulo?: string;
  texto: string;
}) {
  return (
    <div className="hia-riesgo" role="note">
      <Icono nombre="alerta" className="hia-ico" />
      <div>
        <p className="hia-riesgo__titulo">{titulo}</p>
        <p>{texto}</p>
      </div>
    </div>
  );
}

export type EstadoEsfera = 'reposo' | 'escuchando' | 'pensando' | 'hablando' | 'listo' | 'silencio';

/**
 * Esfera del modo voz: cielo Handyx con nubes que se mueven y la luz cálida de la lamparita abajo. Reacciona al
 * estado (escucha, piensa, habla, listo, micrófono apagado). Decorativa: el estado se dice aparte con texto.
 */
export function Esfera({
  estado = 'reposo',
  tamano = 'grande',
}: {
  estado?: EstadoEsfera;
  tamano?: 'grande' | 'chica' | 'mini';
}) {
  return (
    <span
      className={`hia-esfera${tamano === 'grande' ? '' : ` hia-esfera--${tamano}`}`}
      data-estado={estado}
      aria-hidden="true"
    >
      <i />
      <i />
      <i />
    </span>
  );
}

/**
 * Cabecera del chat de HandIA: volver, la esfera mini con el nombre y el estado en el centro, y el botón de voz.
 * Con `alVolver` / `alAbrirVoz` son botones; sin ellos, maqueta. El estado se dice con texto (no solo con el punto).
 */
export function CabeceraHandia({
  estado = 'lista',
  texto,
  alVolver,
  alAbrirVoz,
}: {
  estado?: 'lista' | 'pensando' | 'escribiendo' | 'sin_conexion';
  /** Texto propio del estado (p. ej. "Buscando propuestas"); si no, el del estado. */
  texto?: string;
  alVolver?: () => void;
  alAbrirVoz?: () => void;
}) {
  const textos = {
    lista: 'En tu celular',
    pensando: 'Pensando',
    escribiendo: 'Armando tu pedido',
    sin_conexion: 'Sin conexión',
  } as const;
  const volver = <Icono nombre="atras" className="hia-ico" />;
  const voz = <Icono nombre="onda" className="hia-ico" />;
  return (
    <div className="hia-cab">
      {alVolver ? (
        <button type="button" className="hia-cab__boton" aria-label="Volver" onClick={alVolver}>
          {volver}
        </button>
      ) : (
        <span className="hia-cab__boton">{volver}</span>
      )}
      <span className="hia-cab__centro">
        <span className="hia-cab__nombre">
          <Esfera tamano="mini" estado={estado === 'pensando' ? 'pensando' : 'reposo'} />
          HandIA
        </span>
        <span className="hia-cab__estado" data-estado={estado}>
          {texto ?? textos[estado]}
          {estado === 'pensando' && (
            <span className="hia-cab__puntos" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          )}
        </span>
      </span>
      {alAbrirVoz ? (
        <button
          type="button"
          className="hia-cab__boton hia-cab__boton--voz"
          aria-label="Modo voz"
          onClick={alAbrirVoz}
        >
          {voz}
        </button>
      ) : (
        <span className="hia-cab__boton hia-cab__boton--voz">{voz}</span>
      )}
    </div>
  );
}
