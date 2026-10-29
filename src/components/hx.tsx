'use client';

// Piezas del kit visual de la demo (.hd-* / .du-*) como componentes. Mismo markup que la landing
// (Handy-landing-page-fe/src/render/demo/piezas.ts y usuario.ts), con enlaces reales en lugar de botones de la demo.
import Image from 'next/image';
import { Fragment, type CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import type { EspecialistaResumen, Rubro } from '@/contracts/v1/pedidos';
import { RUBROS_INFO, VERIFICACION_TEXTO, type Etiqueta } from '@/domain/etiquetas';
import { NAVEGACION, pantalla } from '@/mapa/pantallas';
import { iniciales } from './Propuesta';
import { Icono } from './Icono';
import { Enlace } from './nav';
import { useSesion } from './SesionProvider';
import { TituloDocumento } from './TituloDocumento';
import type { NombreIcono } from './trazos';

/** Atributos para que un elemento entre en cascada al abrir la pantalla (.hd-entrando [data-entra]). */
export const entra = (i: number, tipo?: 'pop' | 'lado' | 'abajo') => ({
  'data-entra': tipo ?? '',
  style: { '--i': i } as CSSProperties,
});

/** Texto con ==marcador== amarillo (como tituloMarcado de la landing). */
export function Marcado({ texto }: { texto: string }) {
  return (
    <>
      {texto
        .split(/==(.+?)==/g)
        .map((p, i) => (i % 2 ? <mark key={i}>{p}</mark> : <Fragment key={i}>{p}</Fragment>))}
    </>
  );
}

/**
 * Estructura de una pantalla rediseñada: lo fijo de arriba, lo que se desplaza y el pie fijo con el botón principal.
 * Al montarse, lo marcado con `entra()` aparece en cascada.
 */
export function Pantalla({
  arriba,
  pie,
  children,
  clase = '',
  desplazable = true,
}: {
  arriba?: React.ReactNode;
  pie?: React.ReactNode;
  children: React.ReactNode;
  clase?: string;
  /** false: el contenido maneja su propio desplazamiento (p. ej. una hoja azul que llena la pantalla). */
  desplazable?: boolean;
}) {
  return (
    <div className={`pantalla du-app hd-entrando ${clase}`.trim()}>
      {arriba}
      <div className={desplazable ? 'pantalla__scroll' : 'pantalla__resto'}>{children}</div>
      {pie ? <div className="du-pie">{pie}</div> : null}
    </div>
  );
}

/** Cabecera de Inicio (la única pantalla con logo): avisos y dirección. */
export function CabeceraInicio() {
  const { noLeidas } = useSesion();
  return (
    <header className="app-cabecera app-cabecera--blanca">
      <div className="app-cabecera__fila">
        <span className="app-logo">
          <Image src="/img/logo-handyx.webp" alt="Handyx" width={720} height={158} priority />
          <small aria-hidden="true">Soluciones, no problemas</small>
        </span>
        <span className="app-cabecera__botones">
          <Enlace
            href="/notificaciones/"
            className="app-cuadrado"
            aria-label={noLeidas ? `Avisos, ${noLeidas} sin leer` : 'Avisos'}
          >
            <Icono nombre="campana" />
            {noLeidas ? (
              <span className="hd-insignia" aria-hidden="true">
                {noLeidas > 9 ? '9+' : noLeidas}
              </span>
            ) : null}
          </Enlace>
          <Enlace href="/cuenta/datos/" className="app-cuadrado" aria-label="Tu dirección">
            <Icono nombre="pin" />
          </Enlace>
        </span>
      </div>
    </header>
  );
}

/** Barra "← Título" de las pantallas internas. El título es el h1 de la pantalla. */
export function Barra({
  titulo,
  volver,
  sub,
  icono,
}: {
  titulo: string;
  volver: { href: string; etiqueta: string };
  sub?: React.ReactNode;
  icono?: NombreIcono;
}) {
  return (
    <div className="du-barra" {...entra(0)}>
      <TituloDocumento texto={titulo.replace(/==/g, '')} />
      <Enlace className="du-atras" href={volver.href} aria-label={volver.etiqueta}>
        <Icono nombre="atras" />
      </Enlace>
      <span className="du-barra__textos">
        <h1>
          <strong>
            <Marcado texto={titulo} />
          </strong>
        </h1>
        {sub ? (
          <small>
            {icono ? (
              <span className="du-ico">
                <Icono nombre={icono} />
              </span>
            ) : null}
            {sub}
          </small>
        ) : null}
      </span>
    </div>
  );
}

/**
 * El Handy de cada rubro (rediseño §2: caño plomería, lamparita electricidad, llave cerrajería, engranaje aire, gota
 * gas). Albañilería todavía no tiene personaje: va su ícono en el mismo lugar.
 */
const HANDYS: Partial<Record<Rubro, { img: string; ancho: number; alto: number }>> = {
  plomeria: { img: 'handy-cano', ancho: 354, alto: 405 },
  electricidad: { img: 'handy-lamparita', ancho: 202, alto: 346 },
  cerrajeria: { img: 'handy-llave', ancho: 581, alto: 547 },
  aire_acondicionado: { img: 'handy-engranaje', ancho: 338, alto: 339 },
  gas: { img: 'handy-gota', ancho: 93, alto: 125 },
};

export function HandyRubro({ rubro, clase = '' }: { rubro: Rubro; clase?: string }) {
  const h = HANDYS[rubro];
  return h ? (
    <Image
      className={`hd-handy hx-handy-rubro ${clase}`.trim()}
      src={`/img/${h.img}.webp`}
      alt=""
      width={h.ancho}
      height={h.alto}
    />
  ) : (
    <span className={`hx-handy-rubro hx-handy-rubro--icono ${clase}`.trim()} aria-hidden="true">
      <Icono nombre={RUBROS_INFO[rubro].icono} />
    </span>
  );
}

/** Avatar redondo con iniciales y, si hay al menos una verificación real, el tilde. */
export function AvatarHx({
  nombre,
  verificado = false,
  tono = 0,
  tamano,
}: {
  nombre: string;
  verificado?: boolean;
  tono?: number;
  tamano?: 'chico' | 'grande';
}) {
  const c = ['hd-avatar', `du-tono-${tono % 3}`];
  if (tamano) c.push(`hd-avatar--${tamano}`);
  if (verificado) c.push('hd-avatar--verificado');
  return (
    <span className={c.join(' ')} aria-hidden="true">
      <span>{iniciales(nombre)}</span>
    </span>
  );
}

/** Verificaciones reales del backend como chips verdes (sin datos, nada: no se afirma lo que no hay). */
export function ChipsVerificacion({ e }: { e: EspecialistaResumen }) {
  return (
    <>
      {e.verificaciones.map((v) => (
        <span key={v.tipo} className="hd-chip hd-chip--exito hd-chip--mini du-verificado">
          <Icono nombre="verificado" />
          {VERIFICACION_TEXTO[v.tipo] ?? v.tipo}
        </span>
      ))}
    </>
  );
}

export const rubrosDe = (e: EspecialistaResumen) =>
  e.rubros.map((r) => RUBROS_INFO[r].nombre).join(' · ');

// ── Barra de pestañas (fuente: NAVEGACION del mapa) ────────────────────────────────────────────────
/** Rutas que pertenecen a cada pestaña (el detalle de un pedido o un turno cuelga de Actividad). */
const PERTENECE: Record<string, readonly string[]> = {
  inicio: ['/inicio/', '/pedir/', '/notificaciones/'],
  pedidos: ['/pedidos/', '/propuestas/', '/trabajos/', '/pagos/', '/agenda/', '/reclamos/'],
  chats: ['/chats/'],
  cuenta: ['/cuenta/', '/ayuda/'],
};

export function NavApp() {
  const ruta = usePathname();
  return (
    <nav className="app-nav" aria-label="Secciones">
      {NAVEGACION.map((p) => {
        const activa = (PERTENECE[p.id] ?? []).some((r) => ruta.startsWith(r));
        return (
          <Enlace
            key={p.id}
            href={pantalla(p.id).ruta}
            className={`app-nav__item${activa ? ' app-nav__item--activo' : ''}`}
            aria-current={activa ? 'page' : undefined}
          >
            <Icono nombre={p.icono} />
            {p.etiqueta}
          </Enlace>
        );
      })}
    </nav>
  );
}

const CHIP_TONO: Record<Etiqueta['tono'], string> = {
  azul: 'hd-chip--azul',
  ok: 'hd-chip--exito',
  alerta: 'hd-chip--amarillo',
  error: 'hd-chip--noche',
  gris: '',
};

/** Estado como chip del kit (siempre texto; el color acompaña). `vivo`: punto que late (algo en curso). */
export function ChipEstado({ e, vivo = false }: { e: Etiqueta; vivo?: boolean }) {
  return (
    <span className={`hd-chip hd-chip--mini ${CHIP_TONO[e.tono]}${vivo ? ' hd-vivo' : ''}`.trim()}>
      <span className="sr-only">Estado: </span>
      {e.texto}
    </span>
  );
}
