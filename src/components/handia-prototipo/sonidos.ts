// Sonidos originales de HandIA (R5), sintetizados en el momento con Web Audio: no hay archivos ni nada de terceros.
// Suaves y cortos (< 0,6 s), en un volumen bajo. Solo suenan por una acción de la persona.

export type Sonido = 'empezar' | 'terminar' | 'listo';

/** Notas de cada sonido: [frecuencia en Hz, inicio en s, duración en s]. */
export const NOTAS: Record<Sonido, readonly (readonly [number, number, number])[]> = {
  // Dos notas que suben (quinta justa): "te escucho".
  empezar: [
    [587.33, 0, 0.12],
    [880, 0.09, 0.18],
  ],
  // Las mismas, bajando: "ya está".
  terminar: [
    [880, 0, 0.12],
    [587.33, 0.09, 0.18],
  ],
  // Acorde mayor arpegiado, como una lamparita que se prende.
  listo: [
    [523.25, 0, 0.5],
    [659.25, 0.07, 0.48],
    [783.99, 0.14, 0.46],
    [1046.5, 0.21, 0.4],
  ],
};

export const VOLUMEN = 0.08;

let contexto: AudioContext | null = null;

export function sonar(cual: Sonido): boolean {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return false;
  contexto ??= new AudioContext();
  const ctx = contexto;
  const t0 = ctx.currentTime + 0.01;
  for (const [f, inicio, dur] of NOTAS[cual]) {
    const osc = ctx.createOscillator();
    const brillo = ctx.createOscillator();
    const gan = ctx.createGain();
    osc.type = 'sine';
    brillo.type = 'triangle';
    osc.frequency.value = f;
    brillo.frequency.value = f * 2;
    const g2 = ctx.createGain();
    g2.gain.value = 0.18;
    brillo.connect(g2).connect(gan);
    osc.connect(gan).connect(ctx.destination);
    const t = t0 + inicio;
    gan.gain.setValueAtTime(0, t);
    gan.gain.linearRampToValueAtTime(VOLUMEN, t + 0.015);
    gan.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    for (const o of [osc, brillo]) {
      o.start(t);
      o.stop(t + dur + 0.02);
    }
  }
  return true;
}

/** Vibración (Android; iPhone no la ofrece a la web). Cortísima: confirma, no molesta. */
export const VIBRACION: Record<Sonido, readonly number[]> = {
  empezar: [12],
  terminar: [8, 60, 8],
  listo: [16, 80, 24],
};

export function vibrar(cual: Sonido): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return false;
  return navigator.vibrate([...VIBRACION[cual]]);
}
