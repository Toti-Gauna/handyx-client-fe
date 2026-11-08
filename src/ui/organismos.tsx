'use client';
// Organismos: piezas grandes que arman una pantalla (barra de pestañas, cabeceras, acciones fijas, voz).
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Icono } from '@/components/Icono';
import { Enlace } from '@/components/nav';
import type { NombreIcono } from '@/components/trazos';
import { Marca } from './atomos';

// ── Barra de pestañas: vidrio azul con HandIA encastrada en el medio ─────────────────────────────────────
const PESTANAS: readonly {
  id: string;
  texto: string;
  icono: NombreIcono;
  href: string;
  rutas: readonly string[];
}[] = [
  {
    id: 'inicio',
    texto: 'Inicio',
    icono: 'casa',
    href: '/inicio/',
    rutas: ['/inicio/', '/pedir/', '/notificaciones/'],
  },
  {
    id: 'actividad',
    texto: 'Actividad',
    icono: 'calendario',
    href: '/pedidos/',
    rutas: [
      '/pedidos/',
      '/propuestas/',
      '/trabajos/',
      '/pagos/',
      '/agenda/',
      '/reclamos/',
      '/obras/',
    ],
  },
  { id: 'handia', texto: 'HandIA', icono: 'handia', href: '/handia/', rutas: ['/handia/'] },
  {
    id: 'mensajes',
    texto: 'Mensajes',
    icono: 'chat',
    href: '/chats/',
    rutas: ['/chats/', '/soporte/'],
  },
  {
    id: 'hogar',
    texto: 'Mi hogar',
    icono: 'hogar',
    href: '/hogar/',
    rutas: ['/hogar/', '/herramientas/', '/camino/'],
  },
];

/** Forma de la barra (362 × 70) con un hueco de radio 44 que abraza el círculo de HandIA. */
const FORMA =
  'M30 0H126C134 0 137 3 139.5 9A44 44 0 0 0 222.5 9C225 3 228 0 236 0H332A30 30 0 0 1 362 30V40A30 30 0 0 1 332 70H30A30 30 0 0 1 0 40V30A30 30 0 0 1 30 0Z';

export function BarraPestanas() {
  const ruta = usePathname();
  const activa = PESTANAS.find((p) => p.rutas.some((r) => ruta.startsWith(r)))?.id;
  return (
    <div className="ds-pestanas">
      <svg
        className="ds-pestanas__forma"
        viewBox="0 0 362 70"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={FORMA} fill="var(--ds-azul)" fillOpacity="0.95" />
        <path d={FORMA} fill="none" stroke="rgba(255,255,255,0.28)" />
      </svg>
      <nav aria-label="Secciones">
        {PESTANAS.map((p) =>
          p.id === 'handia' ? (
            <Enlace
              key={p.id}
              href={p.href}
              className="ds-pestanas__item ds-pestanas__item--handia"
              aria-current={activa === p.id ? 'page' : undefined}
            >
              {p.texto}
            </Enlace>
          ) : (
            <Enlace
              key={p.id}
              href={p.href}
              className="ds-pestanas__item"
              aria-current={activa === p.id ? 'page' : undefined}
            >
              <Icono nombre={p.icono} />
              {p.texto}
            </Enlace>
          ),
        )}
      </nav>
      <Enlace
        href="/handia/"
        className="ds-pestanas__handia"
        aria-label="Abrir HandIA, tu asistente"
        aria-current={activa === 'handia' ? 'page' : undefined}
        tabIndex={-1}
      >
        <Image src="/img/handy-lamparita.webp" alt="" width={68} height={116} />
      </Enlace>
    </div>
  );
}

// ── Cabecera azul redondeada (pantallas principales de una sección) ──────────────────────────────────────
export function CabeceraAzul({
  titulo,
  sub,
  volver,
  accion,
  children,
}: {
  /** Admite ==marca==. */
  titulo: string;
  sub?: ReactNode;
  volver?: { href: string; etiqueta: string };
  accion?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="ds-cabecera-azul">
      <div className="ds-fila">
        {volver ? (
          <Enlace href={volver.href} className="ds-cuadro" aria-label={volver.etiqueta}>
            <Icono nombre="atras" />
          </Enlace>
        ) : null}
        <div className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.25rem' }}>
          <h1 className="ds-titulo" style={{ ['--ds-tam' as string]: '1.875rem' }}>
            <Marca texto={titulo} />
          </h1>
          {sub ? <p className="ds-sub">{sub}</p> : null}
        </div>
        {accion}
      </div>
      {children}
    </header>
  );
}

/** Ícono cuadrado de la cabecera azul (editar, avisos). */
export function CuadroCabecera({
  icono,
  etiqueta,
  href,
}: {
  icono: NombreIcono;
  etiqueta: string;
  href: string;
}) {
  return (
    <Enlace href={href} className="ds-cuadro" aria-label={etiqueta}>
      <Icono nombre={icono} />
    </Enlace>
  );
}

// ── Acciones fijas abajo (una principal) ─────────────────────────────────────────────────────────────────
export function AccionesFijas({ children, nota }: { children: ReactNode; nota?: ReactNode }) {
  return (
    <div className="ds-fijo">
      {nota ? <p className="ds-fijo__nota">{nota}</p> : null}
      {children}
    </div>
  );
}

// ── Esfera de HandIA (modo voz) ──────────────────────────────────────────────────────────────────────────
/**
 * Esfera de luz en SVG: capas difuminadas dentro de un círculo, brillo arriba y halo. Escuchando: anillo de barras
 * de audio. Hablando: más encendida y con un aro amarillo. Decorativa: el estado se anuncia en texto.
 */
export function EsferaVoz({ estado }: { estado: 'escucha' | 'habla' | 'piensa' }) {
  const cx = 195;
  const cy = 210;
  const r = 104;
  const brillo = estado === 'habla' ? 1 : 0.88;
  const barras =
    estado === 'escucha'
      ? Array.from({ length: 64 }, (_, i) => {
          const a = (2 * Math.PI * i) / 64;
          const h =
            10 + 14 * Math.abs(Math.sin(i * 0.55)) * (0.55 + 0.45 * Math.abs(Math.cos(i * 0.21)));
          const r1 = r + 22;
          return (
            <line
              key={i}
              x1={(cx + r1 * Math.cos(a)).toFixed(1)}
              y1={(cy + r1 * Math.sin(a)).toFixed(1)}
              x2={(cx + (r1 + h) * Math.cos(a)).toFixed(1)}
              y2={(cy + (r1 + h) * Math.sin(a)).toFixed(1)}
              stroke={`rgba(255,255,255,${(0.35 + (0.4 * (h - 10)) / 14).toFixed(2)})`}
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })
      : null;
  return (
    <svg className="ds-esfera" viewBox="0 0 390 420" aria-hidden="true">
      <defs>
        <radialGradient id="dsHalo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#7FB0F0" stopOpacity={0.55 * brillo} />
          <stop offset="60%" stopColor="#3A78D0" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#1F57A8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="dsBase" cx="42%" cy="34%" r="75%">
          <stop offset="0%" stopColor="#EAF2FF" />
          <stop offset="30%" stopColor="#9CC2F4" />
          <stop offset="62%" stopColor="#3D7BD3" />
          <stop offset="100%" stopColor="#143E7E" />
        </radialGradient>
        <linearGradient id="dsAro" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F5F59A" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#F5F59A" stopOpacity="0.7" />
        </linearGradient>
        <filter id="dsBlur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id="dsBlur2" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <clipPath id="dsClip">
          <circle cx={cx} cy={cy} r={r} />
        </clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r + 90} fill="url(#dsHalo)" />
      {barras ? <g className="ds-esfera__barras">{barras}</g> : null}
      {estado === 'habla' ? (
        <circle cx={cx} cy={cy} r={r + 16} fill="none" stroke="url(#dsAro)" strokeWidth="2" />
      ) : null}
      <g className="ds-esfera__nucleo">
        <g clipPath="url(#dsClip)">
          <circle cx={cx} cy={cy} r={r} fill="url(#dsBase)" />
          <g filter="url(#dsBlur)" opacity={brillo}>
            <ellipse
              cx={cx - 30}
              cy={cy + 34}
              rx={78}
              ry={35}
              fill="#5B9BEA"
              transform={`rotate(-18 ${cx} ${cy})`}
            />
            <ellipse
              cx={cx + 36}
              cy={cy + 46}
              rx={57}
              ry={27}
              fill="#9ED8FF"
              opacity={estado === 'habla' ? 0.85 : 0.65}
              transform={`rotate(14 ${cx} ${cy})`}
            />
            <ellipse
              cx={cx + 44}
              cy={cy + 20}
              rx={29}
              ry={10}
              fill="#FFF3CC"
              opacity={estado === 'habla' ? 0.8 : 0.45}
              transform={`rotate(20 ${cx} ${cy})`}
            />
            <ellipse
              cx={cx + 10}
              cy={cy - 8}
              rx={62}
              ry={23}
              fill="#FFFFFF"
              opacity="0.55"
              transform={`rotate(-8 ${cx} ${cy})`}
            />
            <ellipse cx={cx - 20} cy={cy + 78} rx={73} ry={31} fill="#163F80" />
          </g>
          <ellipse
            cx={cx - 30}
            cy={cy - 52}
            rx={44}
            ry={21}
            fill="#FFFFFF"
            opacity="0.7"
            filter="url(#dsBlur2)"
          />
        </g>
        <circle
          cx={cx}
          cy={cy}
          r={r - 0.5}
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1"
        />
      </g>
    </svg>
  );
}
