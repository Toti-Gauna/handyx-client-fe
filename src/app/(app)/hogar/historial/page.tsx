'use client';

import { Pantalla } from '@/components/hx';
import { Enlace, ruta } from '@/components/nav';
import { EstadoConsulta } from '@/components/ui';
import type { Rubro } from '@/contracts/v1/pedidos';
import type { Trabajo } from '@/contracts/v1/propuestas';
import { useConsulta } from '@/data/hooks';
import { pesos } from '@/domain/dinero';
import { RUBROS_INFO, etiquetaTrabajo } from '@/domain/etiquetas';
import { fechaDeInstante, partes } from '@/domain/fechas';
import { Etiqueta, MosaicoIcono, Nota } from '@/ui';
import { BarraHogar, Segmentos } from '@/ui/hogar';

const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

/** Historial de la casa (H-Historial, puerta D): los trabajos que terminaron, agrupados por año. */
export default function Historial() {
  const trabajos = useConsulta('trabajos', { consulta: { vista: 'historial', limite: 50 } });
  const pedidos = useConsulta('pedidos', { consulta: { vista: 'historial', limite: 50 } });
  const rubroDe = (t: Trabajo): Rubro =>
    pedidos.datos?.items.find((p) => p.id === t.pedidoId)?.rubro ?? t.especialista.rubros[0]!;
  return (
    <Pantalla
      arriba={
        <BarraHogar
          titulo="Historial"
          sub="Todo lo que se hizo en tu casa"
          volver={{ href: '/hogar/', etiqueta: 'Volver a Mi hogar' }}
        />
      }
    >
      <div className="ds ds-cuerpo ds-cuerpo--raiz">
        <Segmentos
          etiqueta="Filtrar el historial"
          actual="Todo"
          opciones={[
            { texto: 'Todo', href: '/hogar/historial/' },
            { texto: 'Informes y garantías', href: '/hogar/garantias/' },
          ]}
        />
        <EstadoConsulta consulta={trabajos} cargando="Cargando el historial…">
          {({ items }) => {
            if (items.length === 0)
              return (
                <Nota tono="gris" icono="reloj">
                  Todavía no hay trabajos terminados. Cuando termine el primero, queda acá con su informe.
                </Nota>
              );
            const porAnio = new Map<number, Trabajo[]>();
            for (const t of [...items].sort((a, b) => b.creadoEn.localeCompare(a.creadoEn))) {
              const anio = partes(fechaDeInstante(t.creadoEn)).anio;
              porAnio.set(anio, [...(porAnio.get(anio) ?? []), t]);
            }
            return [...porAnio].map(([anio, lista]) => (
              <section key={anio} className="ds-pila" aria-label={`Trabajos de ${anio}`}>
                <Etiqueta como="h2">{anio}</Etiqueta>
                <div>
                  {lista.map((t) => {
                    const { dia, mes } = partes(fechaDeInstante(t.creadoEn));
                    const rubro = RUBROS_INFO[rubroDe(t)];
                    return (
                      <Enlace key={t.id} href={ruta('/trabajos/detalle/', { id: t.id })} className="dsh-hist">
                        <span className="dsh-hist__fecha">
                          {dia} {MESES[mes - 1]}
                        </span>
                        <MosaicoIcono icono={rubro.icono} tam={2.5} />
                        <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.125rem' }}>
                          <strong>{rubro.nombre}</strong>
                          <span className="dsh-suave">
                            {t.especialista.nombrePublico} · {etiquetaTrabajo(t).texto.toLowerCase()}
                          </span>
                        </span>
                        <strong className="ds-monto" style={{ ['--ds-tam' as string]: '0.875rem' }}>
                          {pesos(t.acuerdo.monto.centavos)}
                        </strong>
                      </Enlace>
                    );
                  })}
                </div>
              </section>
            ));
          }}
        </EstadoConsulta>
        <Nota tono="gris" icono="candado">
          El historial es tuyo: lo podés descargar o borrar desde Privacidad, en Cuenta.
        </Nota>
      </div>
    </Pantalla>
  );
}
