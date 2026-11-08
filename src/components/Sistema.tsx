'use client';

import type { ReactNode } from 'react';
import { AccionesFijas, Boton } from '@/ui';
import { EscenaSinSenal, PantallaError } from '@/ui/mensajes';

type Handy = { img: string; ancho: number; alto: number };

/**
 * Pantalla del sistema (lienzo X-Error, X-SinConexion y X-NoEncontrado): una ilustración propia (un Handy roto o la
 * señal cortada), el título con marcador, qué pasó en palabras simples y las salidas abajo. Sin datos ni acciones
 * simuladas.
 */
export function EstadoSistema({
  handy,
  sinSenal = false,
  titulo,
  children,
  acciones,
}: {
  handy?: Handy;
  sinSenal?: boolean;
  titulo: string;
  children: ReactNode;
  acciones: ReactNode;
}) {
  return (
    <div className="pantalla du-app ds ds-m">
      <div className="pantalla__scroll">
        <PantallaError
          titulo={titulo}
          sub={children}
          {...(handy ? { handy } : {})}
          {...(sinSenal ? { dibujo: <EscenaSinSenal /> } : {})}
        />
      </div>
      <AccionesFijas>{acciones}</AccionesFijas>
    </div>
  );
}

/** «Algo se rompió»: lo que muestra la app cuando una pantalla falla. Nada de lo hecho se pierde. */
export function AlgoSeRompio({ onReintentar }: { onReintentar: () => void }) {
  return (
    <EstadoSistema
      handy={{ img: 'handy-lamparita-rota', ancho: 202, alto: 346 }}
      titulo="Algo se ==rompió=="
      acciones={
        <>
          <Boton icono="reintentar" onClick={onReintentar}>
            Reintentar
          </Boton>
          <Boton variante="contorno" icono="chat" href="/soporte/">
            Escribirle a Soporte
          </Boton>
        </>
      }
    >
      <p>
        No pudimos cargar esto. No se perdió nada de lo que hiciste. Probá de nuevo en un rato.
      </p>
    </EstadoSistema>
  );
}
