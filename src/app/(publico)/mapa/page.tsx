import type { Metadata, Route } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Titulo } from '@/components/Titulo';
import { esVistaDePrueba } from '@/data';
import { ESCENARIOS } from '@/mapa/escenarios';
import { PANTALLAS } from '@/mapa/pantallas';

export const metadata: Metadata = { title: 'Mapa de pantallas' };

/** Índice para revisar el recorrido en la vista de prueba. No existe en un build con API real. */
export default function Mapa() {
  if (!esVistaDePrueba) notFound();
  const grupos = [...new Set(PANTALLAS.map((p) => p.grupo))];
  return (
    <>
      <Titulo texto="Mapa de ==pantallas==" />
      <p className="texto-suave">
        {PANTALLAS.length} pantallas y modales del recorrido de usuario. Cada una dice qué hace, sus
        estados y su API.
      </p>
      {grupos.map((grupo) => (
        <section key={grupo} aria-labelledby={`g-${grupo}`}>
          <h2 id={`g-${grupo}`} className="subtitulo">
            {grupo[0]?.toUpperCase() + grupo.slice(1)}
          </h2>
          <ul className="lista-plana">
            {PANTALLAS.filter((p) => p.grupo === grupo).map((p) => (
              <li key={p.id}>
                <Link href={p.ruta as Route}>{p.titulo}</Link>{' '}
                <span className="texto-suave">
                  · lote {p.lote}
                  {p.tipo === 'modal' ? ' · modal' : ''}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      <h2 className="subtitulo">Escenarios obligatorios (Fase 2)</h2>
      <ol className="lista-plana">
        {ESCENARIOS.map((e) => (
          <li key={e.id}>
            <strong>{e.titulo}</strong>: {e.esperado}
          </li>
        ))}
      </ol>
    </>
  );
}
