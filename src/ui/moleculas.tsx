'use client';
// Moléculas: combinaciones de átomos con una sola responsabilidad (una tarjeta, una fila, una opción).
import type { ReactNode } from 'react';
import { Icono } from '@/components/Icono';
import { Enlace } from '@/components/nav';
import type { NombreIcono } from '@/components/trazos';
import { Avatar, MosaicoIcono, type TonoMosaico } from './atomos';

export type TonoTarjeta = 'blanca' | 'azul' | 'noche' | 'amarilla' | 'hundida';

/** Tarjeta: blanca con borde y sombra en capas; azul para resúmenes, noche para el orientativo, amarilla para avisos. */
export function Tarjeta({
  children,
  tono = 'blanca',
  pie,
  etiqueta,
  como = 'section',
}: {
  children: ReactNode;
  tono?: TonoTarjeta;
  /** Franja gris «Ver …» al pie. */
  pie?: { texto: string; href: string };
  /** Nombre accesible de la sección. */
  etiqueta?: string;
  como?: 'section' | 'div' | 'article';
}) {
  const E = como;
  return (
    <E
      className={`ds-tarjeta${tono === 'blanca' ? '' : ` ds-tarjeta--${tono}`}`}
      aria-label={etiqueta}
    >
      {children}
      {pie ? (
        <Enlace href={pie.href} className="ds-tarjeta__pie">
          {pie.texto}
          <Icono nombre="flecha" />
        </Enlace>
      ) : null}
    </E>
  );
}

export function Separador() {
  return <hr className="ds-separador" />;
}

/** Fila con ícono que lleva a otra pantalla (menús de cuenta, ayuda, Mi hogar). */
export function FilaEnlace({
  icono,
  titulo,
  sub,
  href,
  derecha,
  tono = 'tinte',
  onClick,
}: {
  icono: NombreIcono;
  titulo: string;
  sub?: string;
  href?: string;
  derecha?: ReactNode;
  tono?: TonoMosaico;
  onClick?: () => void;
}) {
  const dentro = (
    <>
      <MosaicoIcono icono={icono} tam={2.5} tono={tono} />
      <span className="ds-fila-enlace__textos">
        <span className="ds-fila-enlace__titulo">{titulo}</span>
        {sub ? <span className="ds-fila-enlace__sub">{sub}</span> : null}
      </span>
      {derecha ?? (href ? <Icono nombre="flecha" /> : null)}
    </>
  );
  if (href)
    return (
      <Enlace href={href} className="ds-fila-enlace">
        {dentro}
      </Enlace>
    );
  if (onClick)
    return (
      <button type="button" className="ds-fila-enlace" onClick={onClick}>
        {dentro}
      </button>
    );
  return <div className="ds-fila-enlace">{dentro}</div>;
}

/** Dato con ícono: «Materiales · Cuerito y cartucho · Marca o similar». */
export function DatoFila({
  icono,
  etiqueta,
  valor,
  sub,
  derecha,
}: {
  icono: NombreIcono;
  etiqueta: string;
  valor: ReactNode;
  sub?: ReactNode;
  derecha?: ReactNode;
}) {
  return (
    <div className="ds-dato">
      <MosaicoIcono icono={icono} tam={2.5} />
      <span className="ds-dato__textos">
        <span className="ds-dato__etiqueta">{etiqueta}</span>
        <span className="ds-dato__valor">{valor}</span>
        {sub ? <span className="ds-dato__sub">{sub}</span> : null}
      </span>
      {derecha}
    </div>
  );
}

export type TonoNota = 'tinte' | 'gris' | 'amarillo' | 'exito' | 'error';

/** Aviso corto con ícono (texto, no color solo). */
export function Nota({
  children,
  icono = 'info',
  tono = 'tinte',
  rol = 'note',
}: {
  children: ReactNode;
  icono?: NombreIcono;
  tono?: TonoNota;
  rol?: 'note' | 'status' | 'alert';
}) {
  return (
    <div className={`ds-nota${tono === 'tinte' ? '' : ` ds-nota--${tono}`}`} role={rol}>
      <Icono nombre={icono} />
      <span>{children}</span>
    </div>
  );
}

/** Ticket troquelado (próximo turno, ficha de HandIA). */
export function Ticket({
  arriba,
  abajo,
  href,
  etiqueta,
}: {
  arriba: ReactNode;
  abajo: ReactNode;
  href?: string;
  etiqueta?: string;
}) {
  const papel = (
    <span className="ds-ticket__papel">
      <span className="ds-ticket__arriba">{arriba}</span>
      <span className="ds-ticket__corte" aria-hidden="true" />
      <span className="ds-ticket__abajo">{abajo}</span>
    </span>
  );
  // Como enlace, el nombre accesible es lo que se ve (WCAG 2.5.3), con la etiqueta delante solo para el lector.
  return href ? (
    <Enlace href={href} className="ds-ticket">
      {etiqueta ? <span className="ds-solo-lector">{etiqueta}: </span> : null}
      {papel}
    </Enlace>
  ) : (
    <section className="ds-ticket" aria-label={etiqueta}>
      {papel}
    </section>
  );
}

/** Opción grande como tarjeta (radio o check): ícono, título, bajada y marca. */
export function Opcion({
  titulo,
  sub,
  icono,
  elegida,
  onElegir,
  rol = 'radio',
}: {
  titulo: string;
  sub?: string;
  icono?: NombreIcono;
  elegida: boolean;
  onElegir: () => void;
  rol?: 'radio' | 'check';
}) {
  return (
    <button
      type="button"
      className="ds-opcion"
      {...(rol === 'radio'
        ? { role: 'radio', 'aria-checked': elegida }
        : { 'aria-pressed': elegida })}
      onClick={onElegir}
    >
      {icono ? <MosaicoIcono icono={icono} tam={2.5} tono={elegida ? 'blanco' : 'tinte'} /> : null}
      <span className="ds-fila-enlace__textos">
        <span className="ds-fila-enlace__titulo">{titulo}</span>
        {sub ? <span className="ds-fila-enlace__sub">{sub}</span> : null}
      </span>
      <span className="ds-opcion__marca" aria-hidden="true">
        {elegida ? <Icono nombre="check" /> : null}
      </span>
    </button>
  );
}

/** Pastilla elegible (franjas, motivos, chips de reseña). */
export function Pastilla({
  children,
  elegida,
  onElegir,
  rol = 'boton',
}: {
  children: ReactNode;
  elegida: boolean;
  onElegir: () => void;
  rol?: 'boton' | 'radio';
}) {
  return (
    <button
      type="button"
      className="ds-pastilla"
      {...(rol === 'radio'
        ? { role: 'radio', 'aria-checked': elegida }
        : { 'aria-pressed': elegida })}
      onClick={onElegir}
    >
      {children}
    </button>
  );
}

/** Mosaico gris con ícono de línea (rubros, temas de ayuda, herramientas). */
export function Mosaico({
  icono,
  texto,
  href,
  sub,
}: {
  icono: NombreIcono;
  texto: string;
  href: string;
  sub?: string;
}) {
  return (
    <Enlace href={href} className="ds-mosaico">
      <Icono nombre={icono} />
      <span>{texto}</span>
      {sub ? <span className="ds-fila-enlace__sub">{sub}</span> : null}
    </Enlace>
  );
}

/** Puerta de Mi hogar: cada una abre su camino. */
export function Puerta({
  letra,
  icono,
  titulo,
  sub,
  href,
  tono = 'blanca',
}: {
  letra: string;
  icono: NombreIcono;
  titulo: string;
  sub: string;
  href: string;
  tono?: 'blanca' | 'azul' | 'amarilla' | 'noche';
}) {
  const ic: TonoMosaico = tono === 'blanca' ? 'tinte' : tono === 'amarilla' ? 'blanco' : 'velo';
  return (
    <Enlace href={href} className={`ds-puerta${tono === 'blanca' ? '' : ` ds-puerta--${tono}`}`}>
      <span
        className="ds-fila"
        style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <MosaicoIcono icono={icono} tam={2.75} tono={ic} />
        <span aria-hidden="true" className="ds-etiqueta" style={{ color: 'inherit', opacity: 0.7 }}>
          {letra}
        </span>
      </span>
      <span className="ds-pila" style={{ ['--ds-gap' as string]: '0.125rem' }}>
        <span className="ds-puerta__titulo">{titulo}</span>
        <span className="ds-puerta__sub">{sub}</span>
      </span>
    </Enlace>
  );
}

export interface PasoEtapa {
  readonly titulo: string;
  readonly sub?: string;
}

/** Etapas: hechas en azul con tilde, la actual con anillo amarillo, las que faltan en gris. */
export function Etapas({
  pasos,
  hechas,
  etiqueta = 'Etapas',
}: {
  pasos: readonly PasoEtapa[];
  /** Cuántas están hechas; la siguiente es la actual. */
  hechas: number;
  etiqueta?: string;
}) {
  return (
    <ol className="ds-etapas" aria-label={etiqueta}>
      {pasos.map((p, i) => {
        const estado = i < hechas ? 'hecha' : i === hechas ? 'actual' : 'falta';
        return (
          <li
            key={p.titulo}
            data-estado={estado}
            aria-current={estado === 'actual' ? 'step' : undefined}
          >
            <span className="ds-etapas__marca" aria-hidden="true">
              {estado === 'hecha' ? <Icono nombre="check" /> : null}
            </span>
            <span className="ds-pila" style={{ ['--ds-gap' as string]: 0 }}>
              <strong
                style={{ fontSize: '0.9375rem', fontWeight: estado === 'actual' ? 800 : 600 }}
              >
                {p.titulo}
              </strong>
              {p.sub ? <span className="ds-fila-enlace__sub">{p.sub}</span> : null}
              <span className="ds-solo-lector">
                {estado === 'hecha'
                  ? ' (hecho)'
                  : estado === 'actual'
                    ? ' (ahora)'
                    : ' (pendiente)'}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Lista con tilde (incluye) o cruz (no incluye). */
export function ListaMarcas({
  items,
  tipo = 'si',
}: {
  items: readonly string[];
  tipo?: 'si' | 'no';
}) {
  return (
    <ul
      className="ds-pila"
      style={{ listStyle: 'none', margin: 0, padding: 0, ['--ds-gap' as string]: '0.5rem' }}
    >
      {items.map((t) => (
        <li
          key={t}
          className="ds-fila"
          style={{
            alignItems: 'flex-start',
            ['--ds-gap' as string]: '0.5rem',
            fontSize: '0.875rem',
          }}
        >
          <span
            style={{
              color: tipo === 'si' ? 'var(--ds-exito)' : 'var(--ds-error)',
              display: 'flex',
            }}
            aria-hidden="true"
          >
            <Icono nombre={tipo === 'si' ? 'check' : 'cerrar'} />
          </span>
          <span>
            <span className="ds-solo-lector">{tipo === 'si' ? 'Incluye: ' : 'No incluye: '}</span>
            {t}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Burbuja de chat. Las propias a la derecha en azul; las de otros con avatar y nombre. */
export function Burbuja({
  children,
  de = 'otro',
  autor,
  hora,
  conAvatar = true,
}: {
  children: ReactNode;
  de?: 'yo' | 'otro';
  autor?: string;
  hora?: string;
  conAvatar?: boolean;
}) {
  const globo = (
    <div className={`ds-burbuja${de === 'yo' ? ' ds-burbuja--yo' : ''}`}>
      {de === 'otro' && autor ? <span className="ds-burbuja__autor">{autor}</span> : null}
      <span>{children}</span>
      {hora ? <span className="ds-burbuja__hora">{hora}</span> : null}
    </div>
  );
  if (de === 'yo' || !autor || !conAvatar) return globo;
  return (
    <div className="ds-mensaje">
      <Avatar nombre={autor} tam={2.125} />
      {globo}
    </div>
  );
}
