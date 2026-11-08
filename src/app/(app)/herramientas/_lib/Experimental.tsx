'use client';
import type { ReactNode } from 'react';
import { Barra, Pantalla } from '@/components/hx';
import { Boton, Chip, Nota, Sub, Titulo } from '@/ui';
import { NoDisponible, PasosExplicados } from '@/ui/herramientas';

/**
 * Herramienta experimental que todavía no funciona en el teléfono: se cuenta cómo va a ser y se dice claro que no
 * está disponible. Nada de 3D ni AR de mentira.
 */
export function PantallaExperimental({
  titulo,
  titular,
  intro,
  pasos,
  porQue,
  nota,
  arriba,
  principal,
  secundaria,
}: {
  titulo: string;
  /** Admite ==marca==. */
  titular: string;
  intro: string;
  pasos: readonly { titulo: string; sub: string }[];
  /** Por qué no está todavía (se suma a «Todavía no está disponible…»). */
  porQue: string;
  nota: string;
  /** Algo antes de los pasos (por ejemplo, un cuadro vacío). */
  arriba?: ReactNode;
  principal: { texto: string; href: string };
  secundaria?: { texto: string; href: string };
}) {
  return (
    <Pantalla
      arriba={
        <Barra
          titulo={titulo}
          volver={{ href: '/herramientas/', etiqueta: 'Volver a las herramientas' }}
        />
      }
      pie={
        <>
          <Boton href={principal.href}>{principal.texto}</Boton>
          {secundaria ? (
            <Boton href={secundaria.href} variante="contorno">
              {secundaria.texto}
            </Boton>
          ) : null}
        </>
      }
    >
      <div className="ds ds-cuerpo">
        <span>
          <Chip tono="amarillo" icono="chispas">
            Experimental
          </Chip>
        </span>
        <Titulo nivel={2} tam={1.625} texto={titular} />
        <Sub>{intro}</Sub>
        <NoDisponible>{porQue}</NoDisponible>
        {arriba}
        <PasosExplicados pasos={pasos} />
        <Nota icono="candado" tono="gris">
          {nota}
        </Nota>
      </div>
    </Pantalla>
  );
}
