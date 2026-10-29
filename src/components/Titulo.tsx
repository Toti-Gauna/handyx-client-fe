import { Fragment } from 'react';

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
