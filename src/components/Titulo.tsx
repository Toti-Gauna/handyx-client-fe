import { Fragment } from 'react';
import { Barra } from './hx';
import { TituloDocumento } from './TituloDocumento';

/** Título con marcador amarillo: `==texto==` se resalta como en la landing. */
export function Titulo({ texto, nivel = 1 }: { texto: string; nivel?: 1 | 2 }) {
  const partes = texto.split(/==(.+?)==/g);
  const Etiqueta = nivel === 1 ? 'h1' : 'h2';
  return (
    <>
      {nivel === 1 ? <TituloDocumento texto={partes.join('')} /> : null}
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
    </>
  );
}

/**
 * Encabezado de pantalla interna con el lenguaje de la demo: barra "← Título" (botón de volver con destino fijo, nunca
 * `history.back()`) y, debajo, la bajada (estado, rubro). Las pantallas rediseñadas usan `Barra` directamente.
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
  if (!volver)
    return (
      <>
        <Titulo texto={titulo} />
        {bajada ? <p className="encabezado__bajada">{bajada}</p> : null}
      </>
    );
  return (
    <div className="encabezado-hx">
      <Barra titulo={titulo} volver={volver} />
      {bajada ? <p className="encabezado__bajada">{bajada}</p> : null}
    </div>
  );
}
