import { Fragment } from 'react';
import { Icono } from './Icono';
import { Enlace } from './nav';

/** Título con marcador amarillo: `==texto==` se resalta como en la landing. */
export function Titulo({ texto, nivel = 1 }: { texto: string; nivel?: 1 | 2 }) {
  const partes = texto.split(/==(.+?)==/g);
  const Etiqueta = nivel === 1 ? 'h1' : 'h2';
  return (
    <Etiqueta className={nivel === 1 ? 'titulo' : 'subtitulo'}>
      {partes.map((parte, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="marca">
            {parte}
          </mark>
        ) : (
          <Fragment key={i}>{parte}</Fragment>
        ),
      )}
    </Etiqueta>
  );
}

/**
 * Encabezado de pantalla interna (como la demo de la landing): botón de volver con destino explícito, título y bajada.
 * El destino es siempre una ruta conocida, nunca `history.back()`: entrar por un enlace o un aviso no rompe la vuelta.
 */
export function Encabezado({
  titulo,
  volver,
  bajada,
}: {
  titulo: string;
  volver?: { href: string; etiqueta: string };
  bajada?: React.ReactNode;
}) {
  return (
    <div className="encabezado">
      {volver ? (
        <Enlace
          className="boton-icono boton-icono--claro"
          href={volver.href}
          aria-label={volver.etiqueta}
        >
          <Icono nombre="atras" />
        </Enlace>
      ) : null}
      <div className="encabezado__textos">
        <Titulo texto={titulo} />
        {bajada ? <p className="encabezado__bajada">{bajada}</p> : null}
      </div>
    </div>
  );
}
