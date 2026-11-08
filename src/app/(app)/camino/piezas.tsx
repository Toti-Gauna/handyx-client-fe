'use client';
// Piezas del camino del hogar (lienzo design/usuario/gen/fila_camino.py): íconos, a dónde lleva cada hito y el
// trazo en zigzag. Se avanza cuidando la casa, no gastando más: sin azar, sin rankings y sin envíos a contactos.
import { Icono } from '@/components/Icono';
import { Enlace } from '@/components/nav';
import type { NombreIcono } from '@/components/trazos';
import type { Camino } from '@/contracts/v1/camino';

export type Hito = Camino['hitos'][number];
export type Insignia = Camino['insignias'][number];

export const ICONO_HITO: Record<string, NombreIcono> = {
  ficha_casa: 'hogar',
  primer_informe: 'documento',
  mantenimiento: 'campana',
  conformidades: 'pulgar',
  casa_al_dia: 'medalla',
};

/** Dónde se hace lo que pide cada hito (todo en la app, nada se manda a terceros). */
export const HREF_HITO: Record<string, string> = {
  ficha_casa: '/hogar/casa/',
  primer_informe: '/hogar/garantias/',
  mantenimiento: '/hogar/recordatorios/',
  conformidades: '/pedidos/',
  casa_al_dia: '/hogar/recordatorios/',
};

export const ICONO_INSIGNIA: Record<string, NombreIcono> = {
  casa_fichada: 'hogar',
  ojo_inspector: 'lupa',
  al_dia: 'campana',
  conforme: 'pulgar',
  medidor: 'regla',
  buen_vecino: 'estrella',
};

/** El hito que mide el avance de cada insignia (las que no tienen, se ganan o no). */
export const HITO_DE_INSIGNIA: Record<string, string> = {
  casa_fichada: 'ficha_casa',
  ojo_inspector: 'primer_informe',
  al_dia: 'mantenimiento',
  conforme: 'conformidades',
};

export const iconoHito = (id: string): NombreIcono => ICONO_HITO[id] ?? 'medalla';
export const iconoInsignia = (id: string): NombreIcono => ICONO_INSIGNIA[id] ?? 'medalla';

/** Columna (en % del ancho) de cada hito, de abajo hacia arriba, como el lienzo (70, 270, 90, 260, 110 de 390). */
const COLUMNAS = [18, 70, 23, 67, 28] as const;
/** Alto de cada fila en unidades del SVG (= 6rem en pantalla). */
export const FILA = 60;

/** Centro de cada hito en el SVG (viewBox 0 0 100 n·FILA): el primero abajo. */
export function puntosCamino(n: number): { x: number; y: number }[] {
  return Array.from({ length: n }, (_, i) => ({
    x: COLUMNAS[i % COLUMNAS.length]!,
    y: (n - i - 0.5) * FILA,
  }));
}

/** Curva que une los puntos (cúbicas verticales: sale y llega derecho). */
export function trazoCamino(puntos: readonly { x: number; y: number }[]): string {
  if (puntos.length === 0) return '';
  const [p0, ...resto] = puntos;
  let d = `M${p0!.x} ${p0!.y}`;
  let prev = p0!;
  for (const p of resto) {
    const medio = (prev.y - p.y) / 2;
    d += ` C${prev.x} ${prev.y - medio} ${p.x} ${p.y + medio} ${p.x} ${p.y}`;
    prev = p;
  }
  return d;
}

/** Hasta qué hito llega el tramo azul: el más alto entre el de «ahora» y el último hecho. */
export function hastaDonde(hitos: readonly Hito[]): number {
  return hitos.reduce((u, h, i) => (h.estado === 'falta' ? u : i), -1);
}

const ESTADO_TEXTO = { hecho: 'hecho', ahora: 'ahora', falta: 'falta' } as const;

/** El camino: trazo gris completo, tramo azul hasta donde llegaste y cada hito con su cartel. */
export function CaminoHitos({ hitos }: { hitos: readonly Hito[] }) {
  const n = hitos.length;
  const puntos = puntosCamino(n);
  const hasta = hastaDonde(hitos);
  return (
    <div className="dsh-camino" style={{ height: `${n * 6}rem` }}>
      <svg viewBox={`0 0 100 ${n * FILA}`} preserveAspectRatio="none" aria-hidden="true">
        <path
          d={trazoCamino(puntos)}
          fill="none"
          stroke="var(--ds-mosaico)"
          strokeWidth="22"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {hasta > 0 ? (
          <path
            d={trazoCamino(puntos.slice(0, hasta + 1))}
            fill="none"
            stroke="var(--ds-azul)"
            strokeWidth="22"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
      </svg>
      <ol aria-label="Pasos del camino">
        {hitos.map((h, i) => {
          const x = puntos[i]!.x;
          const izq = x >= 50;
          return (
            <li
              key={h.id}
              style={{ bottom: `${i * 6}rem` }}
              aria-current={h.estado === 'ahora' ? 'step' : undefined}
            >
              <span
                className="dsh-nodo"
                data-estado={h.estado}
                style={{ left: `${x}%` }}
                aria-hidden="true"
              >
                <Icono nombre={h.estado === 'hecho' ? 'check' : iconoHito(h.id)} />
              </span>
              <Enlace
                href={HREF_HITO[h.id] ?? '/hogar/'}
                className="dsh-nodo__texto"
                data-lado={izq ? 'izq' : 'der'}
                style={
                  izq
                    ? { right: `calc(${100 - x}% + 2.25rem)`, left: '0.5rem', marginLeft: 'auto' }
                    : { left: `calc(${x}% + 2.25rem)`, right: '0.5rem', marginRight: 'auto' }
                }
              >
                <strong>{h.titulo}</strong>
                <span className="dsh-suave">
                  {h.descripcion}
                  {h.progreso.total > 1 && h.estado !== 'hecho'
                    ? ` · ${h.progreso.actual} de ${h.progreso.total}`
                    : ''}
                </span>
                <span className="ds-solo-lector"> ({ESTADO_TEXTO[h.estado]})</span>
              </Enlace>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
