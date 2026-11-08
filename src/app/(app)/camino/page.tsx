'use client';

import { Pantalla } from '@/components/hx';
import { Enlace, ruta } from '@/components/nav';
import { TituloDocumento } from '@/components/TituloDocumento';
import { EstadoConsulta } from '@/components/ui';
import { useConsulta } from '@/data/hooks';
import { Boton, CabeceraAzul, Chip, Nota } from '@/ui';
import { useHoy } from '@/ui/hogar';
import { CaminoHitos } from './piezas';

/**
 * Camino del hogar (G-Camino): cinco hitos que se cumplen cuidando la casa (ficha, informe leído, mantenimientos a
 * tiempo, conformidades). Vale igual lo que se hace por cuenta propia. Sin sorteos, sin rankings, sin contactos.
 */
export default function CaminoDelHogar() {
  const hoy = useHoy();
  const camino = useConsulta('camino', {});
  const hitos = camino.datos?.hitos ?? [];
  const hechos = hitos.filter((h) => h.estado === 'hecho').length;
  const nueva = camino.datos?.insignias.find((i) => i.obtenidaEn === hoy) ?? null;
  return (
    <Pantalla
      arriba={
        <CabeceraAzul
          titulo="El camino de tu ==casa=="
          volver={{ href: '/hogar/', etiqueta: 'Volver a Mi hogar' }}
          sub={
            hitos.length
              ? `${hechos} de ${hitos.length} · se avanza cuidando la casa, no gastando más`
              : 'Se avanza cuidando la casa, no gastando más'
          }
          accion={
            <Chip tono="blanco" icono="check">
              Sin sorteos ni azar
            </Chip>
          }
        />
      }
    >
      <TituloDocumento texto="Camino del hogar" />
      <div className="ds ds-cuerpo ds-cuerpo--raiz">
        <EstadoConsulta consulta={camino} cargando="Cargando tu camino…">
          {(c) => (
            <>
              {nueva ? (
                <Nota tono="amarillo" icono="medalla" rol="status">
                  Ganaste la insignia «{nueva.nombre}».{' '}
                  <Enlace className="dsh-enlace" href={ruta('/camino/hito/', { id: nueva.id })}>
                    Verla
                  </Enlace>
                </Nota>
              ) : null}
              <CaminoHitos hitos={c.hitos} />
              <div className="ds-grilla">
                <Boton variante="suave" chico icono="medalla" href="/camino/insignias/">
                  Insignias
                </Boton>
                <Boton variante="suave" chico icono="regalo" href="/camino/beneficios/">
                  Beneficios
                </Boton>
              </div>
              <Nota tono="gris" icono="candado">
                Tu camino es solo tuyo: no se compara con nadie ni se comparte con tus contactos.
              </Nota>
            </>
          )}
        </EstadoConsulta>
      </div>
    </Pantalla>
  );
}
