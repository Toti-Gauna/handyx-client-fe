// Herramientas del teléfono (medir, nivel, linterna y lupa): cuentas puras, sin tocar la cámara ni los sensores.
// Todo corre en el dispositivo; lo que se hace queda solo en memoria hasta que la persona elige un destino.

/** Punto en el cuadro de la cámara: 0 a 1 en cada eje (así sobrevive a girar o cambiar el tamaño). */
export interface Punto {
  readonly x: number;
  readonly y: number;
}
export interface Caja {
  readonly ancho: number;
  readonly alto: number;
}

const acotar = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export const limitarPunto = (p: Punto): Punto => ({ x: acotar(p.x, 0, 1), y: acotar(p.y, 0, 1) });

/** Punto bajo el dedo, dentro del cuadro `rect` (en píxeles de pantalla). */
export function puntoDesdeEvento(
  clientX: number,
  clientY: number,
  rect: { left: number; top: number; width: number; height: number },
): Punto {
  if (rect.width <= 0 || rect.height <= 0) return { x: 0.5, y: 0.5 };
  return limitarPunto({
    x: (clientX - rect.left) / rect.width,
    y: (clientY - rect.top) / rect.height,
  });
}

/** Mueve un punto una fracción del cuadro (teclado). */
export const moverPunto = (p: Punto, dx: number, dy: number): Punto =>
  limitarPunto({ x: p.x + dx, y: p.y + dy });

export function distanciaPx(a: Punto, b: Punto, caja: Caja): number {
  return Math.hypot((a.x - b.x) * caja.ancho, (a.y - b.y) * caja.alto);
}

/** Lo mínimo que tiene que separar a dos puntos para calibrar (evita dividir por casi cero). */
export const MIN_PX_CALIBRAR = 24;

/**
 * Escala: centímetros que mide todo el ancho del cuadro, según un objeto de referencia (`cmReferencia`) que ocupa
 * `pxReferencia` píxeles. Va por ancho y no por píxel para que valga aunque gire el teléfono.
 */
export function cmPorAncho(
  cmReferencia: number,
  pxReferencia: number,
  ancho: number,
): number | null {
  if (!(cmReferencia > 0) || !(ancho > 0) || pxReferencia < MIN_PX_CALIBRAR) return null;
  return (cmReferencia * ancho) / pxReferencia;
}

export const medirCm = (px: number, ancho: number, escala: number): number =>
  ancho > 0 ? (px / ancho) * escala : 0;

const numero = (n: number, decimales: number) =>
  n.toLocaleString('es-AR', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });

/** `34 cm`, `7,5 cm`, `1,20 m`. */
export function formatoMedida(cm: number): string {
  if (!Number.isFinite(cm) || cm < 0) return '—';
  if (cm >= 100) return `${numero(cm / 100, 2)} m`;
  return `${numero(cm, cm < 10 ? 1 : 0)} cm`;
}

/** Texto escrito por la persona («12,5» o «12.5») → centímetros, o null si no sirve. */
export function leerCm(texto: string): number | null {
  const n = Number(texto.trim().replace(',', '.'));
  return Number.isFinite(n) && n >= 0.5 && n <= 1000 ? n : null;
}

export interface Referencia {
  readonly id: 'tarjeta' | 'hoja' | 'otra';
  readonly titulo: string;
  readonly sub: string;
  /** Centímetros del lado largo; null = lo escribe la persona. */
  readonly cm: number | null;
}

export const REFERENCIAS: readonly Referencia[] = [
  { id: 'tarjeta', titulo: 'Una tarjeta', sub: 'De banco o de débito: 8,6 cm de largo', cm: 8.56 },
  { id: 'hoja', titulo: 'Una hoja A4', sub: 'El lado largo mide 29,7 cm', cm: 29.7 },
  { id: 'otra', titulo: 'Otra cosa', sub: 'Si sabés cuánto mide, lo escribís', cm: null },
];

// ── Nivel ─────────────────────────────────────────────────────────────────────────────────────────────────
/** Grados hasta los que se mueve la burbuja antes de llegar al borde. */
export const GRADOS_MAX_NIVEL = 15;

/** Inclinación total en grados con el teléfono apoyado: beta (adelante/atrás) y gamma (izquierda/derecha). */
export const inclinacionTotal = (beta: number, gamma: number): number => Math.hypot(beta, gamma);

/** Posición de la burbuja, de -1 a 1 en cada eje, sin salirse del círculo. Se corre hacia el lado alto. */
export function posicionBurbuja(beta: number, gamma: number, maxGrados = GRADOS_MAX_NIVEL): Punto {
  const x = (0 - gamma) / maxGrados;
  const y = (0 - beta) / maxGrados;
  const largo = Math.hypot(x, y);
  return largo > 1 ? { x: x / largo, y: y / largo } : { x, y };
}

export type EstadoNivel = 'derecho' | 'casi' | 'torcido';

export const estadoNivel = (grados: number): EstadoNivel =>
  grados <= 1 ? 'derecho' : grados <= 3 ? 'casi' : 'torcido';

export const TEXTO_NIVEL: Record<EstadoNivel, string> = {
  derecho: 'Está derecho',
  casi: 'Casi derecho',
  torcido: 'Está torcido',
};

export const formatoGrados = (g: number): string => `${numero(g, 1)}°`;

// ── Lupa ──────────────────────────────────────────────────────────────────────────────────────────────────
export const ZOOMS = [1, 2, 3, 4] as const;

/** Siguiente aumento (+1 acerca, -1 aleja) sin pasarse de los extremos. */
export function cambiarZoom(actual: number, paso: 1 | -1): number {
  const i = ZOOMS.findIndex((z) => z === actual);
  return ZOOMS[acotar((i < 0 ? 0 : i) + paso, 0, ZOOMS.length - 1)]!;
}

// ── Lo que se hizo, en memoria hasta elegir destino (nada se guarda en el navegador ni sale a la red) ────────────────────
export interface ItemHerramienta {
  readonly tipo: 'medida' | 'nivel';
  readonly titulo: string;
  readonly detalle: string;
}

let actual: ItemHerramienta | null = null;
export const guardarItem = (item: ItemHerramienta | null): void => {
  actual = item;
};
export const leerItem = (): ItemHerramienta | null => actual;

export interface Destino {
  readonly id: 'chat' | 'pedido';
  readonly titulo: string;
  readonly sub: string;
  readonly icono: 'chat' | 'caja';
  readonly href: `/${string}`;
}

export const DESTINOS: readonly Destino[] = [
  { id: 'chat', titulo: 'Al chat', sub: 'Elegís con quién hablar', icono: 'chat', href: '/chats/' },
  {
    id: 'pedido',
    titulo: 'A un pedido nuevo',
    sub: 'Arrancás un pedido con esto',
    icono: 'caja',
    href: '/pedir/',
  },
];
