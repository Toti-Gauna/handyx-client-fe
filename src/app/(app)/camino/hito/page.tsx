'use client';

import { useSearchParams } from 'next/navigation';
import { Pantalla } from '@/components/hx';
import { ruta } from '@/components/nav';
import { TituloDocumento } from '@/components/TituloDocumento';
import { EstadoConsulta } from '@/components/ui';
import { useConsulta } from '@/data/hooks';
import { Boton, Chip, Nota, Sub, Tarjeta, Titulo } from '@/ui';
import { Medalla, sinMontos } from '@/ui/hogar';
import { iconoInsignia } from '../piezas';

/** Papelitos fijos del festejo (decorativos, sin azar): x, y en % y tono. */
const PAPELES = [
  [10, 21, 'amarillo', 20],
  [23, 42, 'blanco', 45],
  [77, 24, 'amarillo', 10],
  [87, 52, 'blanco', 30],
  [15, 73, 'blanco', 60],
  [82, 76, 'amarillo', 75],
  [49, 15, 'amarillo', 15],
  [59, 82, 'blanco', 40],
] as const;

/** Festejo de una insignia nueva (G-Hito). Solo si la insignia está ganada; si no, dice qué falta. */
export default function Hito() {
  const id = useSearchParams().get('id');
  const camino = useConsulta('camino', {});
  const ins = camino.datos?.insignias.find((i) => i.id === id) ?? null;
  const ganada = ins?.obtenidaEn != null;
  return (
    <Pantalla
      pie={
        <>
          <Boton href="/camino/">Ver mi camino</Boton>
          <Boton variante="contorno" chico href="/hogar/">
            Seguir
          </Boton>
        </>
      }
    >
      <TituloDocumento texto={ganada ? '¡Insignia nueva!' : 'Insignia'} />
      <div className="dsh-festejo" aria-hidden="true">
        {PAPELES.map(([x, y, tono, giro]) => (
          <span
            key={`${x}-${y}`}
            className="dsh-festejo__papel"
            data-tono={tono}
            style={{ left: `${x}%`, top: `${y}%`, rotate: `${giro}deg` }}
          />
        ))}
        {ins ? <Medalla icono={iconoInsignia(ins.id)} obtenida={ganada} tam={9.375} /> : null}
      </div>
      <div className="ds ds-cuerpo">
        <EstadoConsulta consulta={camino} cargando="Cargando…">
          {(c) =>
            !ins ? (
              <Nota tono="gris">No encontramos esta insignia.</Nota>
            ) : ganada ? (
              <>
                <Titulo texto={`¡Sos ==${ins.nombre}==!`} tam={2} />
                <Sub>{ins.descripcion}. Lo hiciste vos, cuidando tu casa.</Sub>
                {c.beneficios
                  .filter((b) => b.requisito.includes(`«${ins.nombre}»`))
                  .map((b) => (
                    <Tarjeta key={b.id} tono="hundida">
                      <span className="ds-texto">
                        Se desbloquea <strong>{sinMontos(b.titulo).toLowerCase()}</strong>.
                      </span>
                      <span>
                        <Chip tono="gris" icono="documento">
                          Borrador · Legal
                        </Chip>
                      </span>
                    </Tarjeta>
                  ))}
              </>
            ) : (
              <>
                <Titulo texto={`Todavía no sos ==${ins.nombre}==`} tam={1.75} />
                <Sub>{ins.descripcion}.</Sub>
                <Boton variante="suave" chico href={ruta('/camino/insignia/', { id: ins.id })}>
                  Ver qué falta
                </Boton>
              </>
            )
          }
        </EstadoConsulta>
      </div>
    </Pantalla>
  );
}
