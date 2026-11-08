'use client';

import { Pantalla } from '@/components/hx';
import { Enlace, ruta } from '@/components/nav';
import { EstadoConsulta } from '@/components/ui';
import { useConsulta } from '@/data/hooks';
import { Nota, Sub, Titulo } from '@/ui';
import { BarraHogar, Medalla } from '@/ui/hogar';
import { iconoInsignia } from '../piezas';

/** Insignias (G-Insignias): cada una dice qué hiciste por tu casa. No se compran ni se sortean. */
export default function Insignias() {
  const camino = useConsulta('camino', {});
  const lista = camino.datos?.insignias ?? [];
  const tengo = lista.filter((i) => i.obtenidaEn).length;
  return (
    <Pantalla
      arriba={
        <BarraHogar
          titulo="Insignias"
          sub={lista.length ? `${tengo} de ${lista.length}` : undefined}
          volver={{ href: '/camino/', etiqueta: 'Volver al camino' }}
        />
      }
    >
      <div className="ds ds-cuerpo ds-cuerpo--raiz">
        <Titulo texto="Tus ==insignias==" nivel={2} />
        <Sub>Cada una dice qué hiciste por tu casa. No se compran ni se sortean.</Sub>
        <EstadoConsulta consulta={camino} cargando="Cargando tus insignias…">
          {(c) => (
            <ul
              className="ds-grilla"
              style={{ ['--ds-cols' as string]: 3, listStyle: 'none', margin: 0, padding: 0 }}
            >
              {c.insignias.map((i) => (
                <li key={i.id} style={{ display: 'flex' }}>
                  <Enlace
                    href={ruta('/camino/insignia/', { id: i.id })}
                    className="dsh-insignia ds-crece"
                    data-obtenida={i.obtenidaEn ? '' : undefined}
                  >
                    <Medalla icono={iconoInsignia(i.id)} obtenida={i.obtenidaEn !== null} />
                    <strong>{i.nombre}</strong>
                    <span className="dsh-suave">{i.descripcion}</span>
                    <span className="ds-solo-lector">
                      {i.obtenidaEn ? '(la tenés)' : '(todavía no)'}
                    </span>
                  </Enlace>
                </li>
              ))}
            </ul>
          )}
        </EstadoConsulta>
        <Nota tono="gris" icono="candado">
          Sin rankings ni comparaciones con otras personas. Tus insignias no se comparten con nadie.
        </Nota>
      </div>
    </Pantalla>
  );
}
