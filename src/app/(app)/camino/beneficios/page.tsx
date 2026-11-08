'use client';

import { Pantalla } from '@/components/hx';
import { EstadoConsulta } from '@/components/ui';
import { useConsulta } from '@/data/hooks';
import { Chip, MosaicoIcono, Nota, Sub, Tarjeta, Titulo } from '@/ui';
import { BarraHogar, sinMontos } from '@/ui/hogar';

/**
 * Beneficios (G-Beneficios): se desbloquean con el camino. Todos están en borrador hasta que Legal los apruebe: se
 * rotulan «Borrador · Legal» y ningún monto se muestra como vigente.
 */
export default function Beneficios() {
  const camino = useConsulta('camino', {});
  return (
    <Pantalla
      arriba={
        <BarraHogar
          titulo="Beneficios"
          volver={{ href: '/camino/', etiqueta: 'Volver al camino' }}
        />
      }
    >
      <div className="ds ds-cuerpo ds-cuerpo--raiz">
        <Titulo texto="Lo que ==ganás== cuidando tu casa" nivel={2} />
        <Sub>Se desbloquean con tu camino. Sin azar y sin tener que contratar más.</Sub>
        <EstadoConsulta consulta={camino} cargando="Cargando los beneficios…">
          {(c) =>
            c.beneficios.length === 0 ? (
              <Nota tono="gris">Todavía no hay beneficios para mostrar.</Nota>
            ) : (
              c.beneficios.map((b) => (
                <Tarjeta key={b.id} como="article">
                  <div className="ds-fila">
                    <MosaicoIcono icono="regalo" tono="amarillo" />
                    <span
                      className="ds-crece ds-pila"
                      style={{ ['--ds-gap' as string]: '0.125rem' }}
                    >
                      <strong>{sinMontos(b.titulo)}</strong>
                      <span className="dsh-suave">{sinMontos(b.descripcion)}</span>
                    </span>
                  </div>
                  <span
                    className="ds-fila"
                    style={{ flexWrap: 'wrap', ['--ds-gap' as string]: '0.375rem' }}
                  >
                    <Chip icono="medalla">{b.requisito}</Chip>
                    <Chip tono="gris" icono="documento">
                      Borrador · Legal
                    </Chip>
                  </span>
                </Tarjeta>
              ))
            )
          }
        </EstadoConsulta>
        <Nota tono="amarillo">
          Montos, premios y condiciones están en borrador hasta que los apruebe Legal. Nada se
          comparte con tus contactos.
        </Nota>
      </div>
    </Pantalla>
  );
}
