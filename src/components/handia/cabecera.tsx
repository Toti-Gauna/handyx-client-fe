'use client';

// Cabecera del chat de HandIA (ajuste del 07/11: "que se vea premium"). Botones de vidrio que flotan sobre el chat,
// una cápsula central con la esfera, el nombre y el estado (abre el menú), un grupo con "nuevo pedido" y voz, y una
// línea de progreso del pedido. Con los `al*` es interactiva; sin ellos, maqueta quieta.
import { type KeyboardEvent, useId, useState } from 'react';
import { Icono } from '@/components/Icono';
import type { NombreIcono } from '@/components/trazos';
import { Esfera } from './esfera';

export type EstadoCabecera = 'lista' | 'pensando' | 'escribiendo' | 'listo' | 'sin_conexion';

const ESTADOS: Record<EstadoCabecera, { texto: string; icono?: NombreIcono }> = {
  lista: { texto: 'En tu celular', icono: 'candado' },
  pensando: { texto: 'Pensando' },
  escribiendo: { texto: 'Armando tu pedido' },
  listo: { texto: 'Pedido listo', icono: 'check' },
  sin_conexion: { texto: 'Sin conexión', icono: 'sinSenal' },
};

function Boton({
  icono,
  etiqueta,
  al,
  className,
}: {
  icono: NombreIcono;
  etiqueta: string;
  al: (() => void) | undefined;
  className: string;
}) {
  const ico = <Icono nombre={icono} className="hia-ico" />;
  return al ? (
    <button type="button" className={className} aria-label={etiqueta} onClick={al}>
      {ico}
    </button>
  ) : (
    <span className={className}>{ico}</span>
  );
}

export function CabeceraHandia({
  estado = 'lista',
  texto,
  progreso = null,
  alVolver,
  alNuevo,
  alAbrirVoz,
  leerEnVoz = false,
  alLeerEnVoz,
  alPrivacidad,
  menuAbierto = false,
}: {
  estado?: EstadoCabecera;
  /** Texto propio del estado (p. ej. "Buscando propuestas"); si no, el del estado. */
  texto?: string | undefined;
  /** Pregunta en curso del pedido (la línea de abajo se llena). */
  progreso?: { actual: number; total: number } | null;
  alVolver?: () => void;
  alNuevo?: () => void;
  alAbrirVoz?: () => void;
  leerEnVoz?: boolean;
  alLeerEnVoz?: (v: boolean) => void;
  alPrivacidad?: () => void;
  /** Solo para mostrar el menú abierto en una maqueta. */
  menuAbierto?: boolean;
}) {
  const [abierto, setAbierto] = useState(menuAbierto);
  const idMenu = `hia-menu-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const interactiva = !!alNuevo;
  const info = ESTADOS[estado];
  const cerrarYHacer = (f?: () => void) => () => {
    setAbierto(false);
    f?.();
  };
  const alTeclear = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && abierto) {
      e.stopPropagation();
      setAbierto(false);
    }
  };

  const capsula = (
    <>
      <span className="hia-capsula__avatar" data-estado={estado}>
        <Esfera tamano="mini" estado={estado === 'pensando' ? 'pensando' : 'reposo'} />
      </span>
      <span className="hia-capsula__texto">
        <span className="hia-capsula__nombre">
          HandIA
          <Icono nombre="abajo" className="hia-capsula__flecha" />
        </span>
        <span className="hia-capsula__estado" data-estado={estado}>
          {info.icono && <Icono nombre={info.icono} className="hia-ico" />}
          <span className={estado === 'pensando' ? 'hia-brillo' : undefined}>
            {texto ?? info.texto}
          </span>
        </span>
      </span>
    </>
  );

  const pct = progreso ? Math.round((progreso.actual / progreso.total) * 100) : 0;

  return (
    <div className="hia-cab2" onKeyDown={alTeclear}>
      <div className="hia-cab2__fila">
        <Boton icono="atras" etiqueta="Volver" al={alVolver} className="hia-vid hia-vid-boton" />
        {interactiva ? (
          <button
            type="button"
            className="hia-vid hia-capsula"
            aria-expanded={abierto}
            aria-controls={idMenu}
            aria-label={`HandIA, ${texto ?? info.texto}. Opciones`}
            onClick={() => setAbierto((a) => !a)}
          >
            {capsula}
          </button>
        ) : (
          <span className="hia-vid hia-capsula" data-abierta={abierto || undefined}>
            {capsula}
          </span>
        )}
        <span className="hia-vid hia-grupo">
          <Boton
            icono="nuevoChat"
            etiqueta="Nuevo pedido"
            al={alNuevo}
            className="hia-grupo__boton"
          />
          <Boton
            icono="onda"
            etiqueta="Modo voz"
            al={alAbrirVoz}
            className="hia-grupo__boton hia-grupo__boton--voz"
          />
        </span>
      </div>

      {progreso ? (
        <div
          className="hia-cab2__progreso"
          role="progressbar"
          aria-label="Preguntas del pedido"
          aria-valuemin={0}
          aria-valuemax={progreso.total}
          aria-valuenow={progreso.actual}
          aria-valuetext={`Pregunta ${progreso.actual} de ${progreso.total}`}
        >
          <span style={{ width: `${pct}%` }} />
        </div>
      ) : (
        <div
          className="hia-cab2__progreso"
          data-indeterminado={estado === 'pensando' || undefined}
          data-lleno={estado === 'listo' || undefined}
          aria-hidden="true"
        >
          <span />
        </div>
      )}

      {abierto && (
        <div className="hia-menu" id={idMenu}>
          <div className="hia-menu__cab">
            <Esfera tamano="chica" />
            <span>
              <strong>HandIA</strong>
              <span>Te ayuda a armar el pedido. Funciona en tu celular, sin IA externa.</span>
            </span>
          </div>
          {(
            [
              ['nuevoChat', 'Nuevo pedido', alNuevo],
              ['onda', 'Modo voz', alAbrirVoz],
              ['escudo', 'Cómo cuido tus datos', alPrivacidad],
            ] as const
          ).map(([ico, txt, al]) =>
            interactiva ? (
              <button key={txt} type="button" className="hia-menu__item" onClick={cerrarYHacer(al)}>
                <Icono nombre={ico} className="hia-ico" />
                {txt}
              </button>
            ) : (
              <span key={txt} className="hia-menu__item">
                <Icono nombre={ico} className="hia-ico" />
                {txt}
              </span>
            ),
          )}
          {interactiva ? (
            <button
              type="button"
              role="switch"
              aria-checked={leerEnVoz}
              className="hia-menu__item"
              onClick={() => alLeerEnVoz?.(!leerEnVoz)}
            >
              <Icono nombre="parlante" className="hia-ico" />
              Leer respuestas en voz alta
              <span className="hia-interruptor" aria-hidden="true" />
            </button>
          ) : (
            <span className="hia-menu__item" data-activo={leerEnVoz || undefined}>
              <Icono nombre="parlante" className="hia-ico" />
              Leer respuestas en voz alta
              <span className="hia-interruptor" aria-hidden="true" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}
