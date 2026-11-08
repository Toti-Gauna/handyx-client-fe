'use client';
// Piezas compartidas de mensajes, cuenta, ayuda y errores (Fase 7, filas M y X del lienzo). Se arman con los átomos y
// moléculas de src/ui; los estilos propios están en src/styles/ds-mensajes.css. La lógica pura va arriba (con prueba).
import Image from 'next/image';
import type { ReactNode } from 'react';
import { Icono } from '@/components/Icono';
import { Enlace } from '@/components/nav';
import { TituloDocumento } from '@/components/TituloDocumento';
import type { NombreIcono } from '@/components/trazos';
import type { Propuesta } from '@/contracts/v1/propuestas';
import type { Mensaje } from '@/contracts/v1/servicio';
import { pesos } from '@/domain/dinero';
import {
  fechaDeInstante,
  fechaLarga,
  hoyEnArgentina,
  horaDeInstante,
  sumarDias,
} from '@/domain/fechas';
import { MosaicoIcono, Titulo } from './atomos';

// ── Lógica pura ──────────────────────────────────────────────────────────────────────────────────────────
export type TipoTarjeta = 'propuesta' | 'horario' | 'presupuesto' | 'cambio';

/** Qué tarjeta es una propuesta en el chat. «Otro horario»: reemplaza a una anterior y solo cambia el turno. */
export function tipoTarjeta(p: Propuesta, anterior: Propuesta | null): TipoTarjeta {
  if (p.tipo === 'adicional') return 'presupuesto';
  if (p.tipo === 'cambio_acuerdo') return 'cambio';
  if (
    anterior &&
    anterior.monto.centavos === p.monto.centavos &&
    p.horario?.inicio !== anterior.horario?.inicio
  )
    return 'horario';
  return 'propuesta';
}

export const TARJETA_INFO: Record<TipoTarjeta, { texto: string; icono: NombreIcono }> = {
  propuesta: { texto: 'Propuesta', icono: 'billete' },
  horario: { texto: 'Otro horario', icono: 'calendario' },
  presupuesto: { texto: 'Presupuesto', icono: 'documento' },
  cambio: { texto: 'Cambio del acuerdo', icono: 'calendario' },
};

/** «jue 19/11 de 10 a 12 h» (o «jue 19/11 · 10:00 h» sin hora de fin), siempre en Buenos Aires. */
export function horarioCorto(h: Propuesta['horario']): string {
  if (!h) return 'Horario a definir';
  const dia = fechaLarga(fechaDeInstante(h.inicio))
    .replace(/^(\S{3})\S*/, '$1')
    .toLowerCase();
  const hora = (i: string) => horaDeInstante(i).replace(/:00$/, '').replace(/^0/, '');
  return h.fin ? `${dia} de ${hora(h.inicio)} a ${hora(h.fin)} h` : `${dia} · ${hora(h.inicio)} h`;
}

/** Total para la persona: precio del especialista más la tarifa de Handy que calcula el servidor (0 % en la demo). */
export const totalPropuesta = (p: Propuesta) => p.monto.centavos + p.comisionHandy.importe.centavos;

export const tituloTarjeta = (p: Propuesta) =>
  `${pesos(totalPropuesta(p))} · ${horarioCorto(p.horario)}`;

/** Separador de día entre mensajes: «Hoy», «Ayer» o «Mié 18/11». */
export function etiquetaDia(instante: string, ahoraMs: number): string {
  const dia = fechaDeInstante(instante);
  const hoy = hoyEnArgentina(new Date(ahoraMs));
  if (dia === hoy) return 'Hoy';
  if (dia === sumarDias(hoy, -1)) return 'Ayer';
  return fechaLarga(dia);
}

/** Texto de los mensajes elegidos, en orden y con quién lo dijo; solo los de texto (las fotos y tarjetas no se copian). */
export function textoParaCopiar(
  mensajes: readonly Mensaje[],
  elegidos: ReadonlySet<string>,
  nombreOtro: string,
): string {
  return mensajes
    .filter((m) => elegidos.has(m.id) && m.tipo === 'texto' && m.texto)
    .map((m) => `${m.autor === 'usuario' ? 'Vos' : nombreOtro}: ${m.texto}`)
    .join('\n');
}

export function alternar(elegidos: ReadonlySet<string>, id: string): Set<string> {
  const nuevo = new Set(elegidos);
  if (!nuevo.delete(id)) nuevo.add(id);
  return nuevo;
}

export const textoSeleccion = (n: number) =>
  n === 0 ? 'Elegí mensajes' : n === 1 ? '1 seleccionado' : `${n} seleccionados`;

const DISPOSITIVOS = {
  celular: { texto: 'Celular', icono: 'telefono' },
  tableta: { texto: 'Tableta', icono: 'telefono' },
  computadora: { texto: 'Computadora', icono: 'tv' },
  otro: { texto: 'Otro dispositivo', icono: 'tv' },
} as const satisfies Record<string, { texto: string; icono: NombreIcono }>;
export const dispositivo = (d: keyof typeof DISPOSITIVOS) => DISPOSITIVOS[d];

/** «ahora», «hace 5 min», «hace 3 horas», «hace 2 días» con el reloj del servidor. */
export function haceCuanto(instante: string, ahoraMs: number): string {
  const min = Math.max(0, Math.round((ahoraMs - Date.parse(instante)) / 60_000));
  if (min < 2) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} ${h === 1 ? 'hora' : 'horas'}`;
  const d = Math.round(h / 24);
  return `hace ${d} ${d === 1 ? 'día' : 'días'}`;
}

const sinTildes = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
/** Busca en una lista de textos por todas las palabras escritas, sin importar tildes ni mayúsculas. */
export function coincide(texto: string, busqueda: string): boolean {
  const t = sinTildes(texto);
  return sinTildes(busqueda)
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => t.includes(w));
}

// ── Armazón: lo fijo de arriba, lo que se desplaza y un pie que ocupa su propio alto ───────────────────────
export function PantallaM({
  arriba,
  pie,
  children,
  clase = '',
}: {
  arriba?: ReactNode;
  pie?: ReactNode;
  children: ReactNode;
  clase?: string;
}) {
  return (
    <div className={`pantalla du-app ds ds-m ${clase}`.trim()}>
      {arriba}
      <div className="pantalla__scroll">{children}</div>
      {pie}
    </div>
  );
}

// ── Barra con título centrado ────────────────────────────────────────────────────────────────────────────
export function BarraCentro({
  titulo,
  sub,
  volver,
  accion,
  clase = '',
  tituloPestana,
}: {
  titulo: string;
  sub?: string;
  volver: { href: string; etiqueta: string };
  accion?: ReactNode;
  clase?: string;
  tituloPestana?: string;
}) {
  return (
    <div className={`ds-m-barra ${clase}`.trim()}>
      <TituloDocumento texto={tituloPestana ?? titulo} />
      <Enlace href={volver.href} className="ds-m-barra__redondo" aria-label={volver.etiqueta}>
        <Icono nombre="atras" />
      </Enlace>
      <div className="ds-m-barra__textos">
        <h1>{titulo}</h1>
        {sub ? <small>{sub}</small> : null}
      </div>
      {accion ?? <span aria-hidden="true" />}
    </div>
  );
}

// ── Redactor ─────────────────────────────────────────────────────────────────────────────────────────────
export function Escribir({
  valor,
  onCambio,
  onEnviar,
  onSumar,
  placeholder = 'Escribí un mensaje',
  etiqueta = 'Mensaje',
  deshabilitado = false,
}: {
  valor: string;
  onCambio: (v: string) => void;
  onEnviar: () => void;
  onSumar?: () => void;
  placeholder?: string;
  etiqueta?: string;
  deshabilitado?: boolean;
}) {
  return (
    <form
      className="ds-m-escribir"
      onSubmit={(e) => {
        e.preventDefault();
        if (valor.trim() && !deshabilitado) onEnviar();
      }}
    >
      {onSumar ? (
        <button
          type="button"
          className="ds-m-escribir__mas"
          aria-label="Sumar foto, medida o algo de Mi hogar"
          onClick={onSumar}
        >
          <Icono nombre="mas" />
        </button>
      ) : null}
      <label className="ds-solo-lector" htmlFor="ds-m-mensaje">
        {etiqueta}
      </label>
      <textarea
        id="ds-m-mensaje"
        className="ds-m-escribir__campo"
        rows={1}
        maxLength={2000}
        placeholder={placeholder}
        value={valor}
        disabled={deshabilitado}
        onChange={(e) => onCambio(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.form) {
            e.preventDefault();
            e.currentTarget.form.requestSubmit();
          }
        }}
      />
      <button
        type="submit"
        className="ds-m-escribir__enviar"
        aria-label="Enviar el mensaje"
        disabled={deshabilitado || !valor.trim()}
      >
        <Icono nombre="enviar" />
      </button>
    </form>
  );
}

export function AvatarAsistente() {
  return (
    <span className="ds-m-asistente" aria-hidden="true">
      <Image src="/img/handy-lamparita.webp" alt="" width={20} height={34} />
    </span>
  );
}

export function Movimiento({
  icono,
  titulo,
  sub,
  chip,
  derecha,
}: {
  icono?: NombreIcono;
  titulo: string;
  sub?: string;
  chip?: ReactNode;
  derecha?: ReactNode;
}) {
  return (
    <div className="ds-m-movimiento">
      {icono ? <MosaicoIcono icono={icono} tam={2.5} /> : null}
      <span className="ds-m-movimiento__textos">
        <strong>{titulo}</strong>
        {sub ? <span className="ds-m-movimiento__sub">{sub}</span> : null}
        {chip}
      </span>
      {derecha}
    </div>
  );
}

/** Desglose de un presupuesto: renglones y total grande. */
export function Renglones({
  items,
  total,
}: {
  items: readonly (readonly [string, string])[];
  total?: ReactNode;
}) {
  return (
    <dl className="ds-m-detalle">
      {items.map(([a, b]) => (
        <div key={a}>
          <dt>{a}</dt>
          <dd>{b}</dd>
        </div>
      ))}
      {total ? (
        <div className="ds-m-detalle__total">
          <dt>
            <strong>Total</strong>
          </dt>
          <dd>{total}</dd>
        </div>
      ) : null}
    </dl>
  );
}

// ── Ayuda ────────────────────────────────────────────────────────────────────────────────────────────────
export function CampoBuscar({
  valor,
  onCambio,
  placeholder,
  etiqueta,
  blanco = false,
}: {
  valor: string;
  onCambio: (v: string) => void;
  placeholder: string;
  etiqueta: string;
  blanco?: boolean;
}) {
  return (
    <label className={`ds-m-buscar${blanco ? ' ds-m-buscar--blanco' : ''}`}>
      <Icono nombre="lupa" />
      <span className="ds-solo-lector">{etiqueta}</span>
      <input
        type="search"
        value={valor}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(e) => onCambio(e.target.value)}
      />
    </label>
  );
}

export function Tema({
  icono,
  texto,
  href,
  onClick,
  activo,
}: {
  icono: NombreIcono;
  texto: string;
  href?: string;
  onClick?: () => void;
  activo?: boolean;
}) {
  const dentro = (
    <>
      <Icono nombre={icono} />
      {texto}
    </>
  );
  return href ? (
    <Enlace href={href} className="ds-m-tema">
      {dentro}
    </Enlace>
  ) : (
    <button type="button" className="ds-m-tema" aria-pressed={activo} onClick={onClick}>
      {dentro}
    </button>
  );
}

export function Pregunta({
  texto,
  abierta = false,
  children,
}: {
  texto: string;
  abierta?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="ds-m-pregunta" open={abierta || undefined}>
      <summary>
        {texto}
        <Icono nombre="abajo" />
      </summary>
      {children}
    </details>
  );
}

// ── Errores a pantalla completa ──────────────────────────────────────────────────────────────────────────
export function PantallaError({
  handy,
  dibujo,
  titulo,
  sub,
  children,
}: {
  /** Handy roto (ruta en /img). */
  handy?: { img: string; ancho: number; alto: number };
  /** Otra ilustración propia (p. ej. `EscenaSinSenal`) cuando no hay Handy. */
  dibujo?: ReactNode;
  /** Admite ==marca==. */
  titulo: string;
  sub: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="ds-m-error">
      <TituloDocumento texto={titulo.replace(/==/g, '')} />
      <div className="ds-m-error__dibujo" aria-hidden="true">
        {handy ? (
          <Image
            src={`/img/${handy.img}.webp`}
            alt=""
            width={handy.ancho}
            height={handy.alto}
            priority
          />
        ) : (
          dibujo
        )}
      </div>
      <Titulo texto={titulo} tam={2.125} />
      <div className="ds-sub" role="status">
        {sub}
      </div>
      {children}
    </div>
  );
}

// ── Ilustraciones propias (decorativas: el texto de al lado dice lo mismo) ───────────────────────────────
const AZ = '#1F57A8';
const AM = '#F5F59A';
const TN = '#E9EFF9';
const TT = '#0E1D36';

/** Una persona del equipo con auricular y dos globos de charla, sobre unos edificios de la ciudad. */
export function EscenaSoporte({ alto = 7 }: { alto?: number }) {
  return (
    <svg
      className="ds-escena"
      viewBox="0 0 240 130"
      style={{ height: `${alto}rem` }}
      aria-hidden="true"
    >
      <rect x="20" y="70" width="34" height="50" rx="3" fill={TN} />
      <rect x="186" y="56" width="38" height="64" rx="3" fill={TN} />
      <rect x="58" y="86" width="26" height="34" rx="3" fill="#CFDCF2" />
      <path d="M0 120h240" stroke="#CFDCF2" strokeWidth="2" />
      <circle cx="120" cy="64" r="44" fill={AZ} />
      <circle cx="120" cy="54" r="15" fill={AM} />
      <path d="M90 100c2-18 14-26 30-26s28 8 30 26a44 44 0 0 1-60 0Z" fill={AM} />
      <path
        d="M103 52a17 17 0 0 1 34 0"
        fill="none"
        stroke={TT}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="98" y="50" width="7" height="12" rx="3" fill={TT} />
      <rect x="135" y="50" width="7" height="12" rx="3" fill={TT} />
      <path
        d="M138 62c0 8-6 11-14 11"
        fill="none"
        stroke={TT}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <g>
        <rect
          x="150"
          y="14"
          width="52"
          height="30"
          rx="12"
          fill="#fff"
          stroke={AZ}
          strokeWidth="3"
        />
        <path
          d="M160 44l-6 10 14-6Z"
          fill="#fff"
          stroke={AZ}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <circle cx="165" cy="29" r="3" fill={AZ} />
        <circle cx="176" cy="29" r="3" fill={AZ} />
        <circle cx="187" cy="29" r="3" fill={AZ} />
      </g>
      <g>
        <rect x="40" y="22" width="44" height="26" rx="11" fill={AM} stroke={TT} strokeWidth="3" />
        <path d="M74 48l6 9-13-6Z" fill={AM} stroke={TT} strokeWidth="3" strokeLinejoin="round" />
        <path d="M52 35h20" stroke={TT} strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Señal que se cortó: tres arcos, el de abajo con un punto, y una cruz. Para «sin conexión». */
export function EscenaSinSenal({ alto = 9 }: { alto?: number }) {
  return (
    <svg
      className="ds-escena"
      viewBox="0 0 200 150"
      style={{ height: `${alto}rem` }}
      aria-hidden="true"
    >
      <circle cx="100" cy="76" r="62" fill={TN} />
      <path
        d="M52 66a68 68 0 0 1 96 0"
        fill="none"
        stroke={AZ}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M69 86a44 44 0 0 1 62 0"
        fill="none"
        stroke={AZ}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M86 106a20 20 0 0 1 28 0"
        fill="none"
        stroke={AZ}
        strokeWidth="9"
        strokeLinecap="round"
      />
      <circle cx="100" cy="122" r="7" fill={AZ} />
      <path d="M44 34l112 100" stroke={TT} strokeWidth="9" strokeLinecap="round" />
      <path d="M44 34l112 100" stroke={AM} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Un calendario con un tilde: «no hay nada pendiente». */
export function EscenaVacio({ alto = 7.5 }: { alto?: number }) {
  return (
    <svg
      className="ds-escena"
      viewBox="0 0 160 120"
      style={{ height: `${alto}rem` }}
      aria-hidden="true"
    >
      <rect x="30" y="22" width="100" height="84" rx="14" fill="#fff" stroke={AZ} strokeWidth="4" />
      <path d="M30 46h100" stroke={AZ} strokeWidth="4" />
      <rect x="30" y="22" width="100" height="24" rx="14" fill={AZ} />
      <path d="M56 12v18M104 12v18" stroke={TT} strokeWidth="5" strokeLinecap="round" />
      <circle cx="80" cy="78" r="17" fill={AM} stroke={TT} strokeWidth="3" />
      <path
        d="M71 78l7 7 12-14"
        fill="none"
        stroke={TT}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Segmentos (En curso · Agenda · Historial) ────────────────────────────────────────────────────────────
export function Segmentos<T extends string>({
  opciones,
  valor,
  onCambio,
  etiqueta,
  idPanel,
}: {
  opciones: readonly { id: T; texto: string }[];
  valor: T;
  onCambio: (id: T) => void;
  etiqueta: string;
  idPanel: string;
}) {
  return (
    <div
      className="ds-m-seg"
      role="tablist"
      aria-label={etiqueta}
      onKeyDown={(e) => {
        const i = opciones.findIndex((o) => o.id === valor);
        const paso = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        const sig = opciones[(i + paso + opciones.length) % opciones.length];
        if (paso && sig) {
          e.preventDefault();
          onCambio(sig.id);
          document.getElementById(`seg-${sig.id}`)?.focus();
        }
      }}
    >
      {opciones.map((o) => (
        <button
          key={o.id}
          id={`seg-${o.id}`}
          type="button"
          role="tab"
          aria-selected={o.id === valor}
          aria-controls={idPanel}
          tabIndex={o.id === valor ? 0 : -1}
          onClick={() => onCambio(o.id)}
        >
          {o.texto}
        </button>
      ))}
    </div>
  );
}
