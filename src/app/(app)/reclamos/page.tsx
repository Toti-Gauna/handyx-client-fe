'use client';

import { Enlace, ruta } from '@/components/nav';
import { Titulo } from '@/components/Titulo';
import { EstadoConsulta, Pastilla, Vacio } from '@/components/ui';
import { useConsulta } from '@/data/hooks';
import { CATEGORIAS_RECLAMO, ESTADOS_RECLAMO_TEXTO } from '@/domain/etiquetas';
import { cuando } from '@/domain/fechas';

export default function Reclamos() {
  const lista = useConsulta('reclamos', { consulta: { limite: 50 } }, { cada: 10_000 });
  return (
    <>
      <Titulo texto="Tus ==reclamos==" />
      <p>
        Si algo salió mal con un pedido o un trabajo, contanos. Vas a ver el estado y el historial.
      </p>
      <div className="acciones">
        <Enlace className="boton" href="/reclamos/nuevo/">
          Abrir un reclamo
        </Enlace>
      </div>
      <EstadoConsulta consulta={lista}>
        {(d) =>
          d.items.length === 0 ? (
            <Vacio titulo="No tenés reclamos" texto="Cuando abras uno, lo seguís desde acá." />
          ) : (
            <ul className="lista-tarjetas">
              {d.items.map((r) => {
                const e = ESTADOS_RECLAMO_TEXTO[r.estado];
                return (
                  <li key={r.id}>
                    <Enlace
                      className="tarjeta tarjeta--enlace"
                      href={ruta('/reclamos/detalle/', { id: r.id })}
                    >
                      <div className="tarjeta__cuerpo">
                        <div className="tarjeta__fila">
                          <strong className="tarjeta__titulo" style={{ margin: 0 }}>
                            {CATEGORIAS_RECLAMO[r.categoria]}
                          </strong>
                          {e ? (
                            <Pastilla tono={e.tono} {...(e.icono ? { icono: e.icono } : {})}>
                              {e.texto}
                            </Pastilla>
                          ) : null}
                        </div>
                        <p className="texto-suave" style={{ margin: '4px 0 0' }}>
                          Abierto {cuando(r.creadoEn)}
                        </p>
                      </div>
                    </Enlace>
                  </li>
                );
              })}
            </ul>
          )
        }
      </EstadoConsulta>
    </>
  );
}
