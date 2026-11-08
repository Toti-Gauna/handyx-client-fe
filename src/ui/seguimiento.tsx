'use client';
// Piezas compartidas de seguimiento, cierre y obras (Fase 7). Se arman con los átomos y moléculas del sistema; los
// estilos propios están en src/styles/ds-seguimiento.css (clases `dss-*`).
import { useId, useState, type ReactNode } from 'react';
import { FotoPrivada } from '@/components/FotoPrivada';
import { Icono } from '@/components/Icono';
import { Enlace } from '@/components/nav';
import type { NombreIcono } from '@/components/trazos';
import { pesos } from '@/domain/dinero';
import '@/styles/ds-seguimiento.css';
import { Chip, MosaicoIcono } from './atomos';

// ── Atajos grises (Mensaje · Ayuda · Acuerdo) ────────────────────────────────────────────────────────────
export interface Atajo {
  readonly icono: NombreIcono;
  readonly texto: string;
  readonly href?: string;
  readonly onClick?: () => void;
}

export function Atajos({ items, etiqueta }: { items: readonly Atajo[]; etiqueta: string }) {
  return (
    <div className="dss-atajos" role="group" aria-label={etiqueta}>
      {items.map((a) => {
        const dentro = (
          <>
            <Icono nombre={a.icono} />
            {a.texto}
          </>
        );
        return a.href ? (
          <Enlace key={a.texto} href={a.href} className="dss-atajo">
            {dentro}
          </Enlace>
        ) : (
          <button key={a.texto} type="button" className="dss-atajo" onClick={a.onClick}>
            {dentro}
          </button>
        );
      })}
    </div>
  );
}

/** Tarjeta amarilla que lleva a decidir algo (un adicional, un repuesto): un solo toque grande. */
export function PedidoAmarillo({
  icono = 'alerta',
  titulo,
  sub,
  href,
}: {
  icono?: NombreIcono;
  titulo: string;
  sub: string;
  href: string;
}) {
  return (
    <Enlace href={href} className="dss-pedido">
      <MosaicoIcono icono={icono} tono="blanco" tam={2.75} />
      <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.125rem' }}>
        <strong>{titulo}</strong>
        <small>{sub}</small>
      </span>
      <Icono nombre="flecha" />
    </Enlace>
  );
}

// ── Selector de vistas ───────────────────────────────────────────────────────────────────────────────────
export interface OpcionVista {
  readonly texto: string;
  readonly activa: boolean;
  readonly href?: string;
  readonly onElegir?: () => void;
}

/** Pestañas como enlaces (obra) o como botones (deslizar / lado a lado). */
export function SelectorVistas({
  opciones,
  etiqueta,
}: {
  opciones: readonly OpcionVista[];
  etiqueta: string;
}) {
  return (
    <nav className="dss-seg" aria-label={etiqueta}>
      {opciones.map((o) =>
        o.href ? (
          <Enlace
            key={o.texto}
            href={o.href}
            aria-current={o.activa ? 'page' : undefined}
            transicion={false}
          >
            {o.texto}
          </Enlace>
        ) : (
          <button key={o.texto} type="button" aria-pressed={o.activa} onClick={o.onElegir}>
            {o.texto}
          </button>
        ),
      )}
    </nav>
  );
}

// ── Totales ──────────────────────────────────────────────────────────────────────────────────────────────
export function FilaTotal({
  texto,
  centavos,
  mas = false,
  fuerte = false,
  suave = false,
}: {
  texto: string;
  centavos: number;
  /** Muestra «+ $ 9.500» (un adicional). */
  mas?: boolean;
  fuerte?: boolean;
  suave?: boolean;
}) {
  return (
    <div className={`dss-total${fuerte ? ' dss-total--fuerte' : ''}${suave ? ' dss-claro' : ''}`}>
      {fuerte ? <strong>{texto}</strong> : <span>{texto}</span>}
      <span>
        {mas ? '+ ' : ''}
        {pesos(centavos)}
      </span>
    </div>
  );
}

/** Dato suelto de una obra: «PAGADO · $ 400.000 · 2 etapas». */
export function Indicador({ titulo, valor, sub }: { titulo: string; valor: string; sub: string }) {
  return (
    <div className="dss-kpi">
      <small>{titulo}</small>
      <strong>{valor}</strong>
      <small style={{ fontWeight: 400, letterSpacing: 0 }}>{sub}</small>
    </div>
  );
}

/** Anillo de avance (etapas confirmadas sobre el total). */
export function Anillo({ hechas, total, etiqueta }: { hechas: number; total: number; etiqueta: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? hechas / total : 0;
  return (
    <svg className="dss-anillo" width="64" height="64" viewBox="0 0 64 64" role="img" aria-label={etiqueta}>
      <circle cx="32" cy="32" r={r} fill="none" stroke="var(--ds-mosaico)" strokeWidth="8" />
      <circle
        cx="32"
        cy="32"
        r={r}
        fill="none"
        stroke="var(--ds-azul)"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${c * pct} ${c}`}
        transform="rotate(-90 32 32)"
      />
      <text x="32" y="37" textAnchor="middle" fontSize="15" fontWeight="900" fill="var(--ds-tinta)">
        {hechas}/{total}
      </text>
    </svg>
  );
}

// ── Antes y después ──────────────────────────────────────────────────────────────────────────────────────
/** Deslizar para comparar: un control de rango (se maneja con el dedo o con las flechas del teclado). */
export function Comparador({
  antes,
  despues,
  altAntes,
  altDespues,
}: {
  antes: string;
  despues: string;
  altAntes: string;
  altDespues: string;
}) {
  const [pos, setPos] = useState(50);
  const id = useId();
  return (
    <div className="dss-comparador" style={{ ['--dss-pos' as string]: `${pos}%` }}>
      <FotoPrivada url={despues} alt={altDespues} />
      <FotoPrivada url={antes} alt={altAntes} className="dss-comparador__antes" />
      <span className="dss-comparador__linea" aria-hidden="true" />
      <input
        id={id}
        className="dss-comparador__rango"
        type="range"
        min={0}
        max={100}
        step={2}
        value={pos}
        aria-label="Deslizar para comparar el antes y el después"
        aria-valuetext={`Se ve ${pos} % del antes`}
        onChange={(e) => setPos(Number(e.target.value))}
      />
      <span className="dss-comparador__asa" aria-hidden="true">
        <Icono nombre="deslizar" />
      </span>
      <span className="dss-comparador__chip" style={{ left: '0.75rem' }}>
        <Chip tono="noche">Antes</Chip>
      </span>
      <span className="dss-comparador__chip" style={{ right: '0.75rem' }}>
        <Chip tono="exito" icono="check">
          Después
        </Chip>
      </span>
    </div>
  );
}

/** Una foto del antes y una del después, una al lado de la otra. */
export function LadoALado({
  antes,
  despues,
}: {
  antes: string | null;
  despues: string | null;
}) {
  const col = (url: string | null, chip: ReactNode, alt: string) => (
    <figure>
      {url ? (
        <FotoPrivada url={url} alt={alt} />
      ) : (
        <span className="dss-lado__vacia">Todavía no hay foto</span>
      )}
      <figcaption>{chip}</figcaption>
    </figure>
  );
  return (
    <div className="dss-lado">
      {col(antes, <Chip tono="noche">Antes</Chip>, 'Foto del antes')}
      {col(
        despues,
        <Chip tono="exito" icono="check">
          Después
        </Chip>,
        'Foto del después',
      )}
    </div>
  );
}
