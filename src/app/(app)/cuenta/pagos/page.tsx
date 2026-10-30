'use client';

import { useEffect, useState } from 'react';
import { Barra, ChipEstado, entra, Pantalla } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { Enlace, ruta } from '@/components/nav';
import { Cargando, ErrorEstado } from '@/components/ui';
import type { Rubro } from '@/contracts/v1/pedidos';
import type { Trabajo } from '@/contracts/v1/propuestas';
import type { RegistroPago } from '@/contracts/v1/servicio';
import { cliente } from '@/data';
import { ErrorCliente } from '@/data/cliente';
import { avisarSiSesion, useConsulta } from '@/data/hooks';
import { pesos } from '@/domain/dinero';
import { RUBROS_INFO, etiquetaPago } from '@/domain/etiquetas';
import { diaMes } from '@/domain/fechas';

const VOLVER = { href: '/cuenta/', etiqueta: 'Volver a tu cuenta' };
const FUENTE: Record<NonNullable<RegistroPago['fuente']> | 'nadie', string> = {
  reporte_usuario: 'Lo reportaste vos',
  reporte_especialista: 'Lo reportó el especialista',
  proveedor: 'Lo confirmó Mercado Pago',
  operaciones: 'Lo confirmó el equipo de Handy',
  nadie: 'Todavía nadie lo reportó',
};

interface Movimiento {
  readonly pago: RegistroPago;
  readonly trabajo: Trabajo;
}

/** Los pagos de cada trabajo (el contrato los da por trabajo): se piden juntos y se ordenan del más nuevo al más viejo. */
function useMovimientos(trabajos: readonly Trabajo[] | null) {
  const [estado, setEstado] = useState<{
    clave: string;
    lista: readonly Movimiento[] | null;
    error: ErrorCliente | null;
  } | null>(null);
  const [vuelta, setVuelta] = useState(0);
  const clave = trabajos ? `${trabajos.map((t) => t.id).join(',')}|${vuelta}` : null;

  useEffect(() => {
    if (!trabajos || !clave) return;
    let activa = true;
    Promise.all(
      trabajos.map((t) =>
        cliente
          .llamar('pagos', { parametros: { id: t.id } })
          .then((r) => r.items.map((pago) => ({ pago, trabajo: t }))),
      ),
    )
      .then((grupos) => {
        const fecha = (m: Movimiento) =>
          m.pago.verificadoEn ?? m.pago.reportadoEn ?? m.trabajo.creadoEn;
        if (activa)
          setEstado({
            clave,
            lista: grupos.flat().sort((a, b) => fecha(b).localeCompare(fecha(a))),
            error: null,
          });
      })
      .catch((e: unknown) => {
        if (!activa) return;
        const error =
          e instanceof ErrorCliente
            ? e
            : new ErrorCliente({
                codigo: 'error_interno',
                mensaje: 'No pudimos cargar tus pagos.',
              });
        avisarSiSesion(error);
        setEstado({ clave, lista: null, error });
      });
    return () => {
      activa = false;
    };
  }, [trabajos, clave]);

  const vigente = estado?.clave === clave ? estado : null;
  return {
    lista: vigente?.lista ?? null,
    error: vigente?.error ?? null,
    recargar: () => setVuelta((v) => v + 1),
  };
}

/**
 * Pagos registrados (rediseño 3.8, u-pagos sin tarjetas): el historial de los pagos directos al especialista, cada uno
 * con su estado real. Un pago reportado no es un pago verificado, y Handy no cobra el servicio ni guarda tarjetas.
 */
export default function PagosRegistrados() {
  const trabajos = useConsulta('trabajos', { consulta: { limite: 50 } });
  const pedidos = useConsulta('pedidos', { consulta: { limite: 50 } });
  const movimientos = useMovimientos(trabajos.datos?.items ?? null);
  const [abierto, setAbierto] = useState<string | null>(null);
  const rubroDe = (t: Trabajo): Rubro | null =>
    pedidos.datos?.items.find((p) => p.id === t.pedidoId)?.rubro ?? null;
  const error = trabajos.error ?? movimientos.error;
  const lista = movimientos.lista;
  const verificados = lista?.filter((m) => m.pago.estado === 'verificado').length ?? 0;
  const sinVerificar =
    lista?.filter((m) => ['pendiente', 'reportado'].includes(m.pago.estado)).length ?? 0;

  return (
    <Pantalla
      desplazable={false}
      arriba={
        <div className="du-cuerpo du-cuerpo--ajustado du-pagos-hx">
          <Barra titulo="Pagos registrados" volver={VOLVER} />
          <div className="hd-tarjeta hd-tarjeta--gris du-pagos-hx__resumen" {...entra(1)}>
            <p className="du-pagos-hx__cifras">
              <span>
                <strong>{lista ? verificados : '–'}</strong>
                <small>verificados</small>
              </span>
              <span>
                <strong>{lista ? sinVerificar : '–'}</strong>
                <small>sin verificar</small>
              </span>
            </p>
            <p className="du-nota">
              <Icono nombre="escudo" />
              <span>
                Le pagás directo al especialista, por Mercado Pago o en efectivo. Handy no cobra el
                servicio ni guarda tarjetas: acá queda el registro.
              </span>
            </p>
          </div>
        </div>
      }
    >
      <section
        className="hd-hoja-azul du-hoja-azul du-hoja-azul--llena"
        aria-labelledby="hoja-pagos"
      >
        <span className="du-manija" aria-hidden="true" />
        <div className="du-hoja-azul__titulo">
          <h2 id="hoja-pagos">Tus movimientos</h2>
        </div>
        <div className="hd-scroll du-lista">
          {error ? (
            <ErrorEstado
              error={error}
              onReintentar={() => {
                trabajos.recargar();
                movimientos.recargar();
              }}
            />
          ) : !lista ? (
            <Cargando />
          ) : lista.length === 0 ? (
            <p className="du-hoja-azul__nota">
              <Icono nombre="info" />
              <span>
                Todavía no hay pagos registrados. Cuando le pagues a un especialista, lo registrás
                desde el trabajo.
              </span>
            </p>
          ) : (
            <ul className="du-lista-tarjetas">
              {lista.map(({ pago, trabajo }, i) => {
                const rubro = rubroDe(trabajo);
                const esp = trabajo.especialista.nombrePublico;
                const abiertoEste = abierto === pago.id;
                const fecha = pago.verificadoEn ?? pago.reportadoEn;
                return (
                  <li key={pago.id} className="du-tarjeta du-mov-tarjeta" {...entra(i + 1)}>
                    <div className="du-tarjeta__cuerpo">
                      <span className="du-tarjeta__ico du-tarjeta__ico--azul" aria-hidden="true">
                        <Icono nombre={rubro ? RUBROS_INFO[rubro].icono : 'billetera'} />
                      </span>
                      <span className="du-tarjeta__datos">
                        <strong>Pago a {esp}</strong>
                        <small>
                          {rubro ? RUBROS_INFO[rubro].nombre : 'Trabajo'}
                          {fecha ? ` · ${diaMes(fecha)}` : ''}
                        </small>
                      </span>
                      <span className="du-tarjeta__der">
                        <strong className="hd-precio">{pesos(pago.monto.centavos)}</strong>
                        <small>{pago.metodo === 'efectivo' ? 'Efectivo' : 'Mercado Pago'}</small>
                      </span>
                    </div>
                    <div className="du-mov-hx__estado">
                      <ChipEstado e={etiquetaPago(pago)} />
                    </div>
                    {abiertoEste ? (
                      <div className="du-mov" id={`mov-${pago.id}`}>
                        <div className="hd-dato">
                          <span>Quién lo registró</span>
                          <span>{FUENTE[pago.fuente ?? 'nadie']}</span>
                        </div>
                        <div className="hd-dato">
                          <span>Reportado</span>
                          <span>{pago.reportadoEn ? diaMes(pago.reportadoEn) : 'No'}</span>
                        </div>
                        <div className="hd-dato">
                          <span>Verificado</span>
                          <span>
                            {pago.verificadoEn ? diaMes(pago.verificadoEn) : 'Todavía no'}
                          </span>
                        </div>
                        <Enlace
                          className="du-mov-hx__ver"
                          href={ruta('/trabajos/pago/', { id: trabajo.id })}
                        >
                          Ver el pago del trabajo
                          <Icono nombre="derecha" />
                        </Enlace>
                      </div>
                    ) : null}
                    <button
                      type="button"
                      className="du-tarjeta__franja du-tarjeta__franja--plegable"
                      aria-expanded={abiertoEste}
                      aria-controls={abiertoEste ? `mov-${pago.id}` : undefined}
                      aria-label={`${abiertoEste ? 'Ver menos' : 'Ver más'} del pago a ${esp}`}
                      onClick={() => setAbierto(abiertoEste ? null : pago.id)}
                    >
                      {abiertoEste ? 'Ver menos' : 'Ver más'}
                      <Icono nombre="abajo" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          <p className="du-hoja-azul__nota du-hoja-azul__nota--fin">
            <Icono nombre="info" />
            <span>
              “Reportado” quiere decir que alguien lo anotó; “verificado”, que se confirmó.
            </span>
          </p>
        </div>
      </section>
    </Pantalla>
  );
}
