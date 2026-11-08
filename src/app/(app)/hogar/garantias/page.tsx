'use client';

import { Pantalla } from '@/components/hx';
import { ruta } from '@/components/nav';
import { EstadoConsulta } from '@/components/ui';
import type { Trabajo } from '@/contracts/v1/propuestas';
import { useConsulta } from '@/data/hooks';
import { fechaDeInstante } from '@/domain/fechas';
import { Chip, Etiqueta, MosaicoIcono, Nota, Progreso, Sub, Tarjeta, Titulo } from '@/ui';
import {
  BarraHogar,
  Segmentos,
  avanceGarantia,
  fechaDMA,
  garantiaVigente,
  useHoy,
} from '@/ui/hogar';

/**
 * Informes y garantías (H-Garantias): cada informe guarda qué se hizo, con qué materiales y hasta cuándo cubre. Abajo,
 * los equipos de la casa que tienen garantía cargada.
 */
export default function Garantias() {
  const hoy = useHoy();
  const trabajos = useConsulta('trabajos', { consulta: { vista: 'historial', limite: 50 } });
  const hogar = useConsulta('hogar', {});
  const conGarantia = hogar.datos?.equipos.filter((e) => e.garantiaHasta) ?? [];
  return (
    <Pantalla
      arriba={
        <BarraHogar
          titulo="Informes y garantías"
          volver={{ href: '/hogar/historial/', etiqueta: 'Volver al historial' }}
        />
      }
    >
      <div className="ds ds-cuerpo ds-cuerpo--raiz">
        <Segmentos
          etiqueta="Filtrar el historial"
          actual="Informes y garantías"
          opciones={[
            { texto: 'Todo', href: '/hogar/historial/' },
            { texto: 'Informes y garantías', href: '/hogar/garantias/' },
          ]}
        />
        <Titulo texto="Tus ==garantías==" nivel={2} />
        <Sub>
          Cada informe guarda qué se hizo, con qué materiales y hasta cuándo lo cubre la garantía.
        </Sub>
        <EstadoConsulta consulta={trabajos} cargando="Cargando tus informes…">
          {({ items }) => {
            const terminados = items.filter((t) =>
              ['terminado_por_especialista', 'finalizado'].includes(t.estado),
            );
            return terminados.length === 0 ? (
              <Nota tono="gris" icono="documento">
                Todavía no hay informes. El especialista lo arma cuando termina un trabajo.
              </Nota>
            ) : (
              terminados.map((t) => <TarjetaInforme key={t.id} trabajo={t} hoy={hoy} />)
            );
          }}
        </EstadoConsulta>
        {conGarantia.length ? (
          <Tarjeta>
            <Etiqueta como="h2">Equipos con garantía</Etiqueta>
            {conGarantia.map((e) => (
              <div key={e.id} className="ds-fila">
                <MosaicoIcono icono="escudo" tam={2.5} />
                <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.125rem' }}>
                  <strong>{e.nombre}</strong>
                  <span className="dsh-suave">Hasta el {fechaDMA(e.garantiaHasta!)}</span>
                </span>
                {garantiaVigente(e.garantiaHasta, hoy) ? (
                  <Chip tono="exito" icono="check">
                    Vigente
                  </Chip>
                ) : (
                  <Chip tono="gris" icono="reloj">
                    Vencida
                  </Chip>
                )}
              </div>
            ))}
          </Tarjeta>
        ) : null}
        <Nota tono="gris">
          Si algo falla dentro de la garantía, escribile al especialista desde el trabajo o pedile
          ayuda a Soporte.
        </Nota>
      </div>
    </Pantalla>
  );
}

function TarjetaInforme({ trabajo: t, hoy }: { trabajo: Trabajo; hoy: string }) {
  const informe = useConsulta('informe', { parametros: { id: t.id } });
  const desde = fechaDeInstante(t.creadoEn);
  const i = informe.datos;
  const vigente = i?.garantiaHasta ? garantiaVigente(i.garantiaHasta, hoy) : false;
  return (
    <Tarjeta
      como="article"
      pie={{ texto: 'Ver el trabajo', href: ruta('/trabajos/detalle/', { id: t.id }) }}
    >
      <div className="ds-fila">
        <MosaicoIcono icono="escudo" tono={vigente ? 'tinte' : 'gris'} />
        <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.125rem' }}>
          <strong>{t.especialista.nombrePublico}</strong>
          <span className="dsh-suave">Trabajo del {fechaDMA(desde)}</span>
        </span>
        {i?.garantiaHasta ? (
          <Chip tono={vigente ? 'exito' : 'gris'} icono={vigente ? 'check' : 'reloj'}>
            {vigente ? 'Vigente' : 'Vencida'}
          </Chip>
        ) : null}
      </div>
      {informe.estado === 'cargando' ? (
        <span className="dsh-suave">Cargando el informe…</span>
      ) : !i ? (
        <span className="dsh-suave">Este trabajo todavía no tiene informe.</span>
      ) : (
        <>
          <p className="ds-texto">{i.encontrado}</p>
          {i.materiales.length ? (
            <span className="dsh-suave">Materiales: {i.materiales.join(', ')}</span>
          ) : null}
          {i.garantiaHasta ? (
            <>
              <span
                className="ds-fila"
                style={{ justifyContent: 'space-between', fontSize: '0.8125rem' }}
              >
                <span>Garantía hasta</span>
                <strong>{fechaDMA(i.garantiaHasta)}</strong>
              </span>
              <Progreso
                valor={avanceGarantia(desde, i.garantiaHasta, hoy)}
                etiqueta="Cuánto de la garantía ya pasó"
                alto={0.375}
              />
            </>
          ) : (
            <span className="dsh-suave">Sin garantía en el informe.</span>
          )}
        </>
      )}
    </Tarjeta>
  );
}
