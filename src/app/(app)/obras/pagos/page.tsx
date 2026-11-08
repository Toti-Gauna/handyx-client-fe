'use client';

import { Barra, Pantalla } from '@/components/hx';
import { ruta } from '@/components/nav';
import { adicionalesAprobados, pagoVigente, totalesObra, textoPago } from '@/components/Trabajo';
import { Enlace } from '@/components/nav';
import { Icono } from '@/components/Icono';
import { pesos } from '@/domain/dinero';
import { etiquetaPago } from '@/domain/etiquetas';
import { AccionesFijas, Avatar, Boton, Chip, Nota, Tarjeta } from '@/ui';
import { PestanasObra, useObra } from '../compartido';

/** Pagos de la obra: cada etapa se paga directo a quien la hizo, cuando la confirmás. Informado ≠ verificado. */
export default function PagosObra() {
  const o = useObra({ cadaPagos: 5_000 });
  const { t } = o;
  if (o.carga || !t) return o.carga;
  const esp = t.especialista.nombrePublico;
  const tot = totalesObra(t, o.pagos);
  const extras = adicionalesAprobados(o.propuestas, t.id);
  const siguiente = t.etapas.find((e) => e.estado === 'confirmada' && !pagoVigente(o.pagos, e.id));

  return (
    <Pantalla
      arriba={
        <Barra
          titulo="Pagos de la obra"
          volver={{ href: ruta('/obras/detalle/', { id: t.id }), etiqueta: 'Volver a la obra' }}
          sub={esp}
        />
      }
      pie={
        <AccionesFijas
          nota={siguiente ? undefined : 'Cada etapa se paga cuando la confirmás terminada.'}
        >
          {siguiente ? (
            <Boton
              icono="billete"
              href={ruta('/trabajos/pago/', { id: t.id, etapa: siguiente.id })}
            >
              Pagar la etapa {siguiente.orden}
            </Boton>
          ) : (
            <Boton variante="contorno" href={ruta('/obras/detalle/', { id: t.id })}>
              Volver a la obra
            </Boton>
          )}
        </AccionesFijas>
      }
    >
      <div className="ds ds-cuerpo">
        <PestanasObra id={t.id} activa="pagos" />
        <p className="ds-texto" style={{ margin: 0 }}>
          Informaste <strong>{pesos(tot.informado)}</strong> · verificado{' '}
          <strong>{pesos(tot.verificado)}</strong> · faltan <strong>{pesos(tot.falta)}</strong>
        </p>
        <Tarjeta etiqueta="Pagos por etapa">
          <ul className="ds-pila" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {t.etapas.map((e) => {
              const p = pagoVigente(o.pagos, e.id);
              const ep = p ? etiquetaPago(p) : null;
              return (
                <li key={e.id}>
                  <Enlace
                    href={ruta('/trabajos/pago/', { id: t.id, etapa: e.id })}
                    className="ds-fila-enlace"
                  >
                    <Avatar nombre={esp} tam={2.5} />
                    <span className="ds-fila-enlace__textos">
                      <span className="ds-fila-enlace__titulo">
                        Etapa {e.orden} · {e.titulo}
                      </span>
                      <span className="ds-fila-enlace__sub">A {esp}</span>
                      <span>
                        {ep ? (
                          <Chip
                            tono={p?.estado === 'verificado' ? 'exito' : 'amarillo'}
                            {...(ep.icono ? { icono: ep.icono } : {})}
                          >
                            {textoPago(p!)}
                          </Chip>
                        ) : (
                          <Chip tono="gris" icono={e.estado === 'confirmada' ? 'billete' : 'reloj'}>
                            {e.estado === 'confirmada' ? 'Para pagar' : 'Falta terminarla'}
                          </Chip>
                        )}
                      </span>
                    </span>
                    <strong className="ds-monto" style={{ ['--ds-tam' as string]: '1rem' }}>
                      {pesos(e.monto.centavos)}
                    </strong>
                    <Icono nombre="flecha" />
                  </Enlace>
                </li>
              );
            })}
          </ul>
          {extras ? (
            <p className="ds-fila-enlace__sub" style={{ margin: 0 }}>
              Además aprobaste {pesos(extras)} en repuestos o adicionales: están sumados al total.
            </p>
          ) : null}
        </Tarjeta>
        <Nota icono="billete" tono="gris">
          Le pagás directo a {esp}, por Mercado Pago o en efectivo. Handyx no recibe ni reparte la
          plata.
        </Nota>
      </div>
    </Pantalla>
  );
}
