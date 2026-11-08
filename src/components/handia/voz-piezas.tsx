'use client';
// Piezas del modo voz (Fase 7): la frase con lo pendiente tenue, la hoja de ajustes (voz del sistema, subtítulos y
// sonido) y el tono corto al empezar y terminar de escuchar. Nada se guarda: los ajustes viven mientras dura el modo.
import { useEffect, useRef } from 'react';
import { Hoja } from '@/components/ui';
import { type Voz, palabrasDichas } from '@/components/voz';
import { Boton, Interruptor, MosaicoIcono } from '@/ui';

export function Frase({
  momento,
  voz,
  ultimoIa,
  ultimoYo,
}: {
  momento: 'escuchando' | 'pensando' | 'hablando' | 'quieto';
  voz: Voz;
  ultimoIa: string;
  ultimoYo: string;
}) {
  if (momento === 'escuchando') {
    const firme = voz.pendiente
      ? voz.parcial.slice(0, voz.parcial.length - voz.pendiente.length).trim()
      : voz.parcial;
    return (
      <p className="ds-voz__frase" aria-live="polite">
        <span className="ds-solo-lector">Vos: </span>
        {firme}
        {firme && voz.pendiente ? ' ' : null}
        {voz.pendiente || !firme ? (
          <span data-tenue="">{voz.pendiente ? `${voz.pendiente}…` : 'Te escucho…'}</span>
        ) : null}
      </p>
    );
  }
  if (momento === 'pensando')
    return (
      <p className="ds-voz__frase">
        <span className="ds-solo-lector">Vos: </span>
        {ultimoYo}
      </p>
    );
  const dicho = voz.dicho;
  if (!dicho)
    return (
      <p className="ds-voz__frase" aria-live="polite">
        {ultimoIa}
      </p>
    );
  return (
    <p className="ds-voz__frase" aria-live="polite">
      <span className="ds-solo-lector">{dicho.texto}</span>
      <span aria-hidden="true">
        {palabrasDichas(dicho.texto, dicho.hasta).map((w, i) => (
          <span key={i}>
            {i ? ' ' : null}
            <span
              data-tenue={w.estado === 'falta' ? '' : undefined}
              data-actual={w.estado === 'actual' ? '' : undefined}
            >
              {w.p}
            </span>
          </span>
        ))}
      </span>
    </p>
  );
}

/** Tono corto y suave (sin vibrar) al empezar y al terminar de escuchar, si la persona lo prendió. */
export function useTono(escuchando: boolean, activo: boolean) {
  const antes = useRef(escuchando);
  useEffect(() => {
    if (antes.current === escuchando) return;
    antes.current = escuchando;
    if (!activo || typeof window === 'undefined' || !('AudioContext' in window)) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gan = ctx.createGain();
    osc.frequency.value = escuchando ? 880 : 660;
    gan.gain.setValueAtTime(0.0001, ctx.currentTime);
    gan.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.02);
    gan.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.18);
    osc.connect(gan).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
    osc.onended = () => void ctx.close();
  }, [escuchando, activo]);
}

export function AjustesVoz({
  abierta,
  onCerrar,
  nombreVoz,
  subtitulos,
  onSubtitulos,
  sonido,
  onSonido,
}: {
  abierta: boolean;
  onCerrar: () => void;
  nombreVoz: string;
  subtitulos: boolean;
  onSubtitulos: (v: boolean) => void;
  sonido: boolean;
  onSonido: (v: boolean) => void;
}) {
  return (
    <Hoja abierta={abierta} onCerrar={onCerrar} titulo="Modo voz">
      <div className="ds hia7-ajustes">
        <div className="hia7-ajuste">
          <MosaicoIcono icono="onda" tam={2.375} />
          <span className="ds-fila-enlace__textos">
            <span className="ds-fila-enlace__titulo">Voz</span>
            <span className="ds-fila-enlace__sub">
              {nombreVoz
                ? `La del sistema, en español: ${nombreVoz}. La cambiás en los ajustes del celular.`
                : 'Este celular no tiene una voz en español: te muestro todo escrito.'}
            </span>
          </span>
        </div>
        <div className="hia7-ajuste">
          <MosaicoIcono icono="subtitulos" tam={2.375} />
          <Interruptor
            etiqueta="Subtítulos"
            sub="Lo que dice HandIA, escrito"
            activo={subtitulos}
            onCambiar={onSubtitulos}
          />
        </div>
        <div className="hia7-ajuste">
          <MosaicoIcono icono="campana" tam={2.375} />
          <Interruptor
            etiqueta="Sonido al empezar y terminar"
            sub="Un tono corto, sin vibrar"
            activo={sonido}
            onCambiar={onSonido}
          />
        </div>
        <div className="hia7-ajuste">
          <MosaicoIcono icono="candado" tam={2.375} />
          <span className="ds-fila-enlace__textos">
            <span className="ds-fila-enlace__titulo">Tu voz se reconoce en el celular</span>
            <span className="ds-fila-enlace__sub">No se graba ni se manda a ningún lado</span>
          </span>
        </div>
        <Boton onClick={onCerrar} icono="check">
          Listo
        </Boton>
      </div>
    </Hoja>
  );
}
