'use client';

import { Icono } from '@/components/Icono';
import { Enlace } from '@/components/nav';
import { TituloDocumento } from '@/components/TituloDocumento';
import { Avatar } from '@/ui';

export function CabeceraCuenta({
  nombre,
  zona,
  datos,
  volver,
}: {
  nombre: string;
  zona?: string;
  datos: readonly { valor: string; texto: string }[];
  volver: { href: string; etiqueta: string };
}) {
  return (
    <header className="ds-m-cuenta">
      <TituloDocumento texto="Tu cuenta" />
      <div className="ds-m-cuenta__fila">
        <Enlace href={volver.href} className="ds-cuadro" aria-label={volver.etiqueta}>
          <Icono nombre="atras" />
        </Enlace>
        <span className="ds-etiqueta">Tu cuenta</span>
        <span style={{ width: '3rem' }} aria-hidden="true" />
      </div>
      <div className="ds-m-cuenta__quien">
        <Avatar nombre={nombre} tam={4.5} propio />
        <div>
          <h1 className="ds-m-cuenta__nombre">{nombre}</h1>
          {zona ? <span className="ds-m-cuenta__zona">{zona}</span> : null}
        </div>
      </div>
      {datos.length ? (
        <dl className="ds-m-cuenta__datos">
          {datos.map((d) => (
            <div key={d.texto}>
              <dd>{d.valor}</dd>
              <dt>{d.texto}</dt>
            </div>
          ))}
        </dl>
      ) : null}
    </header>
  );
}
