'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {
  AvatarHx,
  Barra,
  ChipEstado,
  ChipsVerificacion,
  Pantalla,
  entra,
  rubrosDe,
} from '@/components/hx';
import { Icono } from '@/components/Icono';
import { Enlace, ruta } from '@/components/nav';
import { Vigencia } from '@/components/Propuesta';
import { Cargando, ErrorEstado, Vacio } from '@/components/ui';
import type { Propuesta } from '@/contracts/v1/propuestas';
import { useConsulta } from '@/data/hooks';
import { pesos, porcentaje } from '@/domain/dinero';
import { RUBROS_INFO, TIPOS_INFO, etiquetaPropuesta } from '@/domain/etiquetas';
import { cuando, fechaCorta } from '@/domain/fechas';

const total = (p: Propuesta) => p.monto.centavos + p.comisionHandy.importe.centavos;

/**
 * Propuestas de un pedido (rediseño, pantalla modelo del lote 3.1). Como la demo (u-presupuestos): barra "← Propuestas"
 * y una hoja azul que llena la pantalla con las tarjetas, ordenadas por llegada. Elegir abre la confirmación del turno, donde se
 * confirma (nada se acepta desde la tarjeta). "Comparar" muestra todas en una tabla, sin destacar ninguna.
 */
export default function Propuestas() {
  const pedidoId = useSearchParams().get('pedido');
  const pedido = useConsulta('pedido', pedidoId ? { parametros: { id: pedidoId } } : null, {
    cada: 4_000,
  });
  const lista = useConsulta(
    'propuestas',
    pedidoId ? { parametros: { id: pedidoId }, consulta: { limite: 50 } } : null,
    { cada: 4_000 },
  );
  const [vista, setVista] = useState<'tarjetas' | 'comparar'>('tarjetas');

  if (!pedidoId)
    return (
      <Vacio titulo="Falta el pedido" texto="El enlace está incompleto.">
        <Enlace className="boton boton--chico" href="/pedidos/">
          Ver mis pedidos
        </Enlace>
      </Vacio>
    );
  const error = lista.error ?? pedido.error;
  if (error)
    return (
      <ErrorEstado
        error={error}
        onReintentar={() => {
          lista.recargar();
          pedido.recargar();
        }}
      />
    );
  if (!lista.datos || !pedido.datos) return <Cargando />;

  const p = pedido.datos;
  const cotizaciones = lista.datos.items.filter((x) => x.tipo === 'cotizacion');
  const vigentes = cotizaciones.filter(
    (x) => x.autorRol === 'especialista' && x.estado === 'pendiente',
  );
  const mias = cotizaciones.filter((x) => x.autorRol === 'usuario' && x.estado === 'pendiente');
  const anteriores = cotizaciones.filter((x) => x.estado !== 'pendiente');
  const cuandoPedido = p.fechaSolicitada ? fechaCorta(p.fechaSolicitada.fecha) : 'Lo antes posible';

  return (
    <Pantalla
      desplazable={false}
      arriba={
        <div className="du-cuerpo du-cuerpo--ajustado">
          <Barra
            titulo="Propuestas"
            volver={{ href: ruta('/pedidos/detalle/', { id: p.id }), etiqueta: 'Volver al pedido' }}
            icono={RUBROS_INFO[p.rubro].icono}
            sub={`${RUBROS_INFO[p.rubro].nombre} · ${TIPOS_INFO[p.tipo].nombre} · ${cuandoPedido}`}
          />
        </div>
      }
    >
      <section
        className="hd-hoja-azul du-hoja-azul du-hoja-azul--llena"
        aria-labelledby="hoja-propuestas"
      >
        <span className="du-manija" aria-hidden="true" />
        <div className="du-hoja-azul__titulo">
          <h2 id="hoja-propuestas">
            {vigentes.length
              ? `Te ${vigentes.length === 1 ? 'llegó' : 'llegaron'} ${vigentes.length}`
              : 'Sin propuestas vigentes'}
          </h2>
          <span className="hd-chip hd-chip--claro hd-chip--mini">Ordenadas por llegada</span>
        </div>
        {vigentes.length > 1 ? (
          <div className="hd-chips du-vistas" role="group" aria-label="Cómo verlas">
            {(['tarjetas', 'comparar'] as const).map((v) => (
              <button
                key={v}
                type="button"
                className="hd-chip hd-chip--claro"
                aria-pressed={vista === v}
                onClick={() => setVista(v)}
              >
                <Icono nombre={v === 'tarjetas' ? 'menu' : 'expandir'} />
                {v === 'tarjetas' ? 'Tarjetas' : 'Comparar'}
              </button>
            ))}
          </div>
        ) : null}

        <div className="hd-scroll du-lista">
          {p.estado === 'contratado' && p.trabajoId ? (
            <p className="du-hoja-azul__nota">
              <Icono nombre="checkCirculo" />
              <span>
                Ya hay un acuerdo.{' '}
                <Enlace href={ruta('/trabajos/detalle/', { id: p.trabajoId })}>
                  Ver el trabajo
                </Enlace>
              </span>
            </p>
          ) : null}
          {mias.length ? (
            <p className="du-hoja-azul__nota">
              <Icono nombre="reloj" />
              <span>
                Tu contrapropuesta está pendiente: nada queda acordado hasta que el especialista la
                acepte.
              </span>
            </p>
          ) : null}
          {vigentes.length === 0 && mias.length === 0 && p.estado !== 'contratado' ? (
            <p className="du-hoja-azul__nota">
              <Icono nombre="info" />
              <span>Las propuestas que llegaron ya vencieron o se resolvieron.</span>
            </p>
          ) : null}

          {vista === 'comparar' && vigentes.length > 1 ? (
            <Comparacion items={vigentes} />
          ) : (
            vigentes.map((x, i) => <Oferta key={x.id} p={x} i={i} />)
          )}
          {mias.map((x, i) => (
            <Oferta key={x.id} p={x} i={vigentes.length + i} />
          ))}
          {anteriores.length ? (
            <details className="du-anteriores">
              <summary>Anteriores ({anteriores.length})</summary>
              {anteriores.map((x, i) => (
                <Oferta key={x.id} p={x} i={i} />
              ))}
            </details>
          ) : null}

          <p className="du-hoja-azul__nota du-hoja-azul__nota--fin">
            <Icono nombre="info" />
            El precio lo pone cada especialista. No es una recomendación ni un ranking.
          </p>
        </div>
      </section>
    </Pantalla>
  );
}

/**
 * Tarjeta de la demo (du-oferta). Solo verificaciones reales. "Ver perfil" abre quién es y qué propone; "Elegir" abre
 * directamente la confirmación del turno (que igual pide deslizar o confirmar). Nada se acepta desde la tarjeta.
 */
function Oferta({ p, i }: { p: Propuesta; i: number }) {
  const e = p.especialista;
  const propia = p.autorRol === 'usuario';
  const pendiente = p.estado === 'pendiente';
  const etiqueta = etiquetaPropuesta(p);
  return (
    <article
      className="du-oferta"
      aria-label={`${propia ? 'Tu contrapropuesta a' : 'Propuesta de'} ${e.nombrePublico}`}
      {...entra(i)}
    >
      <div className="du-oferta__cabeza">
        <AvatarHx nombre={e.nombrePublico} verificado={e.verificaciones.length > 0} tono={i} />
        <span className="du-oferta__quien">
          <strong>{e.nombrePublico}</strong>
          <span className="du-oferta__chips">
            <ChipsVerificacion e={e} />
            <small>{rubrosDe(e)}</small>
          </span>
        </span>
      </div>
      <div className="du-oferta__cuerpo">
        <p className="du-oferta__sobre">
          <Icono nombre={propia ? 'editar' : 'etiqueta'} />
          {propia ? 'Tu contrapropuesta' : 'Presupuesto'}
          {pendiente ? null : <ChipEstado e={etiqueta} />}
        </p>
        <p className="du-oferta__trabajo">
          <small>Trabajo</small>
          <strong>{p.alcance}</strong>
        </p>
        <dl className="du-oferta__plata">
          <div className="du-oferta__fila">
            <dt>Precio del especialista</dt>
            <dd>{pesos(p.monto.centavos)}</dd>
          </div>
          <div className="du-oferta__fila">
            <dt>Tarifa de Handyx ({porcentaje(p.comisionHandy.bp)})</dt>
            <dd>{pesos(p.comisionHandy.importe.centavos)}</dd>
          </div>
        </dl>
        <p className="du-oferta__total">
          <span>Total final para vos</span>
          <strong className="hd-precio">{pesos(total(p))}</strong>
        </p>
        <div className="du-oferta__cuando">
          <p>
            <Icono nombre="calendario" />
            <span>
              <small>{propia ? 'Horario que proponés' : 'Horario que propone'}</small>
              <strong>{p.horario ? cuando(p.horario.inicio) : 'Lo declara al aceptar'}</strong>
            </span>
          </p>
          <p>
            <Icono nombre="reloj" />
            <span>
              <small>{pendiente ? 'Vigencia' : 'Respondida'}</small>
              <strong>
                {pendiente ? (
                  <Vigencia hasta={p.venceEn} />
                ) : p.respondidaEn ? (
                  cuando(p.respondidaEn)
                ) : (
                  '—'
                )}
              </strong>
            </span>
          </p>
        </div>
      </div>
      <div className="du-oferta__franja">
        <Enlace
          className="du-oferta__btn"
          href={ruta('/propuestas/detalle/', { id: p.id })}
          aria-label={`Ver perfil de ${e.nombrePublico}`}
        >
          Ver perfil
        </Enlace>
        <Enlace
          className="du-oferta__btn du-oferta__btn--azul"
          href={
            pendiente && !propia
              ? ruta('/propuestas/detalle/', { id: p.id, elegir: '1' })
              : ruta('/propuestas/detalle/', { id: p.id })
          }
          aria-label={
            pendiente && !propia
              ? `Elegir la propuesta de ${e.nombrePublico}`
              : `Ver el detalle de la propuesta de ${e.nombrePublico}`
          }
        >
          {pendiente && !propia ? 'Elegir' : 'Ver detalle'}
          <Icono nombre={pendiente && !propia ? 'check' : 'derecha'} />
        </Enlace>
      </div>
    </article>
  );
}

/** Todas las vigentes lado a lado. Ninguna se destaca: es para leer, no para empujar. */
function Comparacion({ items }: { items: Propuesta[] }) {
  const filas: readonly [string, (p: Propuesta) => React.ReactNode][] = [
    ['Total para vos', (p) => <strong className="hd-precio">{pesos(total(p))}</strong>],
    ['Precio del especialista', (p) => pesos(p.monto.centavos)],
    [
      'Tarifa de Handyx',
      (p) => `${pesos(p.comisionHandy.importe.centavos)} (${porcentaje(p.comisionHandy.bp)})`,
    ],
    ['Horario', (p) => (p.horario ? cuando(p.horario.inicio) : 'A declarar')],
    ['Vigencia', (p) => <Vigencia hasta={p.venceEn} />],
    [
      'Verificaciones',
      (p) =>
        p.especialista.verificaciones.length ? (
          <ChipsVerificacion e={p.especialista} />
        ) : (
          'Sin registrar'
        ),
    ],
    ['Qué incluye', (p) => p.alcance],
  ];
  return (
    <div className="du-comparar" role="region" aria-label="Comparación de propuestas" tabIndex={0}>
      <table>
        <thead>
          <tr>
            <td />
            {items.map((p) => (
              <th key={p.id} scope="col">
                {p.especialista.nombrePublico}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map(([titulo, valor]) => (
            <tr key={titulo}>
              <th scope="row">{titulo}</th>
              {items.map((p) => (
                <td key={p.id}>{valor(p)}</td>
              ))}
            </tr>
          ))}
          <tr>
            <th scope="row">
              <span className="sr-only">Acción</span>
            </th>
            {items.map((p) => (
              <td key={p.id}>
                {p.estado === 'pendiente' && p.autorRol !== 'usuario' ? (
                  <Enlace
                    className="hd-boton hd-boton--chico"
                    href={ruta('/propuestas/detalle/', { id: p.id, elegir: '1' })}
                    aria-label={`Elegir la propuesta de ${p.especialista.nombrePublico}`}
                  >
                    Elegir
                  </Enlace>
                ) : (
                  <Enlace
                    className="hd-boton hd-boton--chico hd-boton--claro"
                    href={ruta('/propuestas/detalle/', { id: p.id })}
                    aria-label={`Ver la propuesta de ${p.especialista.nombrePublico}`}
                  >
                    Ver
                  </Enlace>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
