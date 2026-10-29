import type { Route } from 'next';
import Link from 'next/link';
import { ENDPOINTS } from '@/contracts/v1/endpoints';
import { PANTALLAS, pantalla } from '@/mapa/pantallas';
import { Titulo } from './Titulo';

/**
 * Fase 1: cada ruta del mapa existe y se puede navegar. Muestra qué va a hacer la pantalla, sus estados y su API.
 * No simula datos ni acciones: es un mock rotulado que la Fase 2 reemplaza por la pantalla real.
 */
export function PantallaPlanificada({ id }: { id: string }) {
  const p = pantalla(id);
  const modales = PANTALLAS.filter((m) => m.tipo === 'modal' && m.ruta === p.ruta && m.id !== p.id);
  return (
    <article aria-labelledby="titulo-pantalla">
      <p>
        <span className="pastilla pastilla--amarilla">Fase 2 · lote {p.lote}</span>
      </p>
      <div id="titulo-pantalla">
        <Titulo texto={p.titulo} />
      </div>
      <p className="texto-suave">
        Pantalla planificada: todavía no tiene interfaz ni datos. Esto es lo que va a resolver.
      </p>
      {p.nota ? <p>{p.nota}</p> : null}
      <dl className="ficha-mapa">
        <dt>Acciones</dt>
        <dd>
          <ul className="lista-plana">
            {p.acciones.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </dd>
        <dt>Estados</dt>
        <dd>
          <ul className="lista-plana">
            {p.estados.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </dd>
        <dt>API (contrato v1)</dt>
        <dd>
          {p.endpoints.length === 0 ? (
            'Sin llamadas'
          ) : (
            <ul className="lista-plana">
              {p.endpoints.map((eid) => {
                const ep = ENDPOINTS.find((e) => e.id === eid);
                return (
                  <li key={eid} className="codigo">
                    {ep ? `${ep.metodo} ${ep.ruta}` : eid}
                  </li>
                );
              })}
            </ul>
          )}
        </dd>
        {modales.map((m) => (
          <div key={m.id}>
            <dt>Modal: {m.titulo}</dt>
            <dd>{m.nota ?? m.acciones.join(' · ')}</dd>
          </div>
        ))}
      </dl>
      <p className="acciones">
        <Link className="boton boton--claro" href={'/mapa/' as Route}>
          Ver el mapa completo
        </Link>
      </p>
    </article>
  );
}
