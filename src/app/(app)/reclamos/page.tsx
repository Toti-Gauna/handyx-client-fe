'use client';

import Image from 'next/image';
import { Barra, ChipEstado, entra, Pantalla } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { Enlace, ruta } from '@/components/nav';
import { EstadoConsulta } from '@/components/ui';
import { useConsulta } from '@/data/hooks';
import { CATEGORIAS_RECLAMO, ESTADOS_RECLAMO_TEXTO } from '@/domain/etiquetas';
import { cuando } from '@/domain/fechas';

/** Reclamos (rediseño 3.9): tarjetas con franja, el estado verdadero de cada uno y "Abrir un reclamo" abajo. */
export default function Reclamos() {
  const lista = useConsulta('reclamos', { consulta: { limite: 50 } }, { cada: 10_000 });
  return (
    <Pantalla
      arriba={
        <Barra
          titulo="Tus reclamos"
          volver={{ href: '/cuenta/', etiqueta: 'Volver a tu cuenta' }}
        />
      }
      pie={
        <Enlace className="hd-boton" href="/reclamos/nuevo/">
          <Icono nombre="mas" />
          Abrir un reclamo
        </Enlace>
      }
      clase="du-reclamos-hx"
    >
      <div className="du-cuerpo">
        <p className="du-nota" {...entra(1)}>
          <Icono nombre="escudo" />
          <span>
            Si algo salió mal con un pedido o un trabajo, contanos. Vas a ver el estado y el
            historial; lo revisa una persona del equipo.
          </span>
        </p>
        <EstadoConsulta consulta={lista}>
          {(d) =>
            d.items.length === 0 ? (
              <div className="du-vacio-hx" {...entra(2)}>
                <Image
                  className="hd-handy"
                  src="/img/handy-llave.webp"
                  alt=""
                  width={581}
                  height={547}
                />
                <p className="hd-titulo hd-titulo--chico">No tenés reclamos</p>
                <p className="du-vacio-hx__texto">Cuando abras uno, lo seguís desde acá.</p>
              </div>
            ) : (
              <ul className="du-lista-tarjetas" {...entra(2)}>
                {d.items.map((r) => {
                  const e = ESTADOS_RECLAMO_TEXTO[r.estado];
                  const titulo = CATEGORIAS_RECLAMO[r.categoria];
                  return (
                    <li key={r.id} className="du-tarjeta du-tarjeta-hx" data-vt-origen>
                      <div className="du-tarjeta__cuerpo">
                        <span className="du-tarjeta__ico du-tarjeta__ico--azul" aria-hidden="true">
                          <Icono nombre="alerta" />
                        </span>
                        <span className="du-tarjeta__datos">
                          <strong>{titulo}</strong>
                          <small>Abierto {cuando(r.creadoEn)}</small>
                          {e ? <ChipEstado e={e} /> : null}
                        </span>
                      </div>
                      <Enlace
                        className="du-tarjeta__franja tarjeta--enlace"
                        href={ruta('/reclamos/detalle/', { id: r.id })}
                        aria-label={`Ver el reclamo: ${titulo}`}
                      >
                        Ver el reclamo
                        <Icono nombre="derecha" />
                      </Enlace>
                    </li>
                  );
                })}
              </ul>
            )
          }
        </EstadoConsulta>
      </div>
    </Pantalla>
  );
}
