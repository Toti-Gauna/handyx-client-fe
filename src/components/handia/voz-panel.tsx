'use client';
// Modo voz de HandIA (Fase 7, lienzo design/usuario · I-Voz, I-VozHabla, I-VozAjustes). Sin personajes: la esfera de
// luz, el estado arriba, la frase en el medio (lo pendiente, tenue), respuestas rápidas y abajo teclado, micrófono y
// terminar. Escucha solo con reconocimiento en el celular y habla con voces del sistema (src/components/voz.ts).
import { type KeyboardEvent, useEffect, useRef, useState } from 'react';
import { Icono } from '@/components/Icono';
import type { Voz } from '@/components/voz';
import type { Opcion } from '@/domain/handia-motor';
import { EsferaVoz } from '@/ui';
import { AjustesVoz, Frase, useTono } from './voz-piezas';

type Momento = 'escuchando' | 'pensando' | 'hablando' | 'quieto';

const ESTADOS: Record<Momento, string> = {
  escuchando: 'Escuchando',
  pensando: 'Pensando',
  hablando: 'HandIA está hablando',
  quieto: 'Lista para escucharte',
};

export function PanelVoz({
  voz,
  pensando,
  ultimoIa,
  ultimoYo,
  opciones,
  resumen,
  onElegir,
  onHablar,
  onCerrar,
  onTeclado,
  prueba,
}: {
  voz: Voz;
  pensando: boolean;
  ultimoIa: string;
  ultimoYo: string;
  opciones: readonly Opcion[];
  resumen: boolean;
  onElegir: (o: Opcion) => void;
  onHablar: () => void;
  onCerrar: () => void;
  onTeclado: () => void;
  /** Vista de prueba: el modo voz tapa el rótulo de arriba, así que lo repite. */
  prueba: boolean;
}) {
  const mic = useRef<HTMLButtonElement>(null);
  const cerrar = useRef<HTMLButtonElement>(null);
  const [ajustes, setAjustes] = useState(false);
  const [subtitulos, setSubtitulos] = useState(true);
  const [sonido, setSonido] = useState(false);
  useTono(voz.escuchando, sonido);
  useEffect(() => {
    (mic.current ?? cerrar.current)?.focus();
  }, []);
  const momento: Momento = voz.escuchando
    ? 'escuchando'
    : pensando
      ? 'pensando'
      : voz.hablando
        ? 'hablando'
        : 'quieto';
  const puedeEscuchar = voz.oido === 'local';
  const teclas = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && !ajustes) {
      e.stopPropagation();
      onCerrar();
    }
  };

  return (
    <div
      className={`hx ds ds-voz hia7-voz ds-voz--${momento === 'hablando' ? 'habla' : 'escucha'}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="hia7-voz-titulo"
      data-momento={momento}
      onKeyDown={teclas}
    >
      <h2 id="hia7-voz-titulo" className="ds-solo-lector">
        Modo voz de HandIA
      </h2>
      <header className="hia7-voz__arriba">
        <button
          ref={cerrar}
          type="button"
          className="ds-voz__redondo ds-voz__vidrio hia7-voz__chico"
          aria-label="Volver al chat"
          onClick={onCerrar}
        >
          <Icono nombre="atras" />
        </button>
        <span className="ds-voz__estado ds-voz__vidrio" role="status">
          <span className="ds-voz__punto" aria-hidden="true" />
          {momento === 'quieto' && !puedeEscuchar ? 'Te leo las respuestas' : ESTADOS[momento]}
        </span>
        <button
          type="button"
          className="ds-voz__redondo ds-voz__vidrio hia7-voz__chico"
          aria-label="Ajustes del modo voz"
          aria-haspopup="dialog"
          onClick={() => setAjustes(true)}
        >
          <Icono nombre="ajustes" />
        </button>
      </header>
      {prueba ? <p className="hia7-voz__prueba">Vista de prueba · datos ficticios</p> : null}

      <div className="hia7-voz__esfera">
        <EsferaVoz
          estado={
            momento === 'hablando' ? 'habla' : momento === 'escuchando' ? 'escucha' : 'piensa'
          }
        />
      </div>

      <div className="hia7-voz__medio">
        {subtitulos ? (
          <Frase momento={momento} voz={voz} ultimoIa={ultimoIa} ultimoYo={ultimoYo} />
        ) : (
          <p className="hia7-voz__ayuda">Subtítulos apagados: los prendés en los ajustes.</p>
        )}
        {momento === 'escuchando' ? (
          <p className="hia7-voz__ayuda">Hacé una pausa y te respondo.</p>
        ) : null}
        {opciones.length && !voz.escuchando ? (
          <div
            className="hia7-voz__opciones"
            role="group"
            aria-label={resumen ? '¿Cómo lo pedís?' : 'Respuestas rápidas'}
          >
            {opciones.map((o) => (
              <button
                key={o.texto}
                type="button"
                className="hia7-voz__opcion ds-voz__vidrio"
                onClick={() => onElegir(o)}
                disabled={pensando}
              >
                {o.texto}
              </button>
            ))}
          </div>
        ) : null}
        <Avisos voz={voz} />
      </div>

      <div className="hia7-voz__pie">
        <span className="hia7-voz__candado">
          <Icono nombre="candado" />
          {puedeEscuchar
            ? 'Se reconoce en tu celular · no se graba'
            : 'Tu voz nunca sale del celular'}
        </span>
        <div className="hia7-voz__controles">
          <button
            type="button"
            className="ds-voz__redondo ds-voz__vidrio"
            aria-label="Escribir en el chat"
            onClick={onTeclado}
          >
            <Icono nombre="teclado" />
          </button>
          {puedeEscuchar ? (
            <button
              ref={mic}
              type="button"
              className="ds-voz__redondo ds-voz__micro"
              aria-label={voz.escuchando ? 'Dejar de escuchar' : 'Hablarle a HandIA'}
              aria-pressed={voz.escuchando}
              onClick={onHablar}
              disabled={pensando}
            >
              <Icono nombre="microfono" />
            </button>
          ) : voz.oido === 'descargable' || voz.oido === 'descargando' ? (
            <button
              type="button"
              className="hia7-voz__instalar"
              onClick={() => void voz.instalar()}
              disabled={voz.oido === 'descargando'}
            >
              <Icono nombre="microfono" />
              {voz.oido === 'descargando' ? 'Preparando la voz…' : 'Activar la voz (una vez)'}
            </button>
          ) : (
            <span
              className="ds-voz__redondo ds-voz__micro hia7-voz__micro-no"
              role="img"
              aria-label="Micrófono apagado: este navegador no reconoce la voz en el celular"
            >
              <Icono nombre="microfonoNo" />
            </span>
          )}
          <button
            type="button"
            className="ds-voz__redondo ds-voz__terminar"
            aria-label="Terminar el modo voz"
            onClick={onCerrar}
          >
            <Icono nombre="cerrar" />
          </button>
        </div>
      </div>

      <AjustesVoz
        abierta={ajustes}
        onCerrar={() => setAjustes(false)}
        nombreVoz={voz.nombreVoz}
        subtitulos={subtitulos}
        onSubtitulos={setSubtitulos}
        sonido={sonido}
        onSonido={setSonido}
      />
    </div>
  );
}

/** Lo que impide escuchar o hablar, dicho en palabras simples. */
function Avisos({ voz }: { voz: Voz }) {
  return (
    <>
      {voz.error === 'permiso' ? (
        <p className="hia7-voz__aviso" role="alert">
          Para hablarme, permití el micrófono en la configuración del navegador.
        </p>
      ) : voz.error === 'no_te_escuche' ? (
        <p className="hia7-voz__aviso" role="alert">
          No te escuché. Tocá el micrófono y probá de nuevo.
        </p>
      ) : null}
      {voz.oido === 'no' ? (
        <p className="hia7-voz__aviso">
          <Icono nombre="escudo" />
          Este navegador solo reconoce la voz mandándola a internet. Por privacidad, acá no te
          escucho: te leo las respuestas y vos tocás las opciones o volvés al chat para escribir.
        </p>
      ) : null}
      {!voz.habla ? (
        <p className="hia7-voz__aviso">
          <Icono nombre="parlante" />
          Este celular no tiene una voz en español instalada: te muestro las respuestas en pantalla.
        </p>
      ) : null}
    </>
  );
}
