'use client';

import { Enlace, ruta } from '@/components/nav';
import { Cargando, ErrorEstado } from '@/components/ui';
import type { Rubro } from '@/contracts/v1/pedidos';
import type { Trabajo } from '@/contracts/v1/propuestas';
import type { RegistroPago } from '@/contracts/v1/servicio';
import { useConsulta } from '@/data/hooks';
import { pesos } from '@/domain/dinero';
import { RUBROS_INFO, etiquetaPago } from '@/domain/etiquetas';
import { diaMes } from '@/domain/fechas';
import { Chip, Nota, Tarjeta, Texto, type TonoChip } from '@/ui';
import { BarraCentro, EscenaVacio, Movimiento, PantallaM } from '@/ui/mensajes';
import { useMovimientos } from './_useMovimientos';

const VOLVER = { href: '/cuenta/', etiqueta: 'Volver a tu cuenta' };
const FUENTE: Record<NonNullable<RegistroPago['fuente']> | 'nadie', string> = {
  reporte_usuario: 'Lo reportaste vos',
  reporte_especialista: 'Lo reportó el especialista',
  proveedor: 'Lo confirmó Mercado Pago',
  operaciones: 'Lo confirmó el equipo de Handy',
  nadie: 'Todavía nadie lo reportó',
};
const TONO: Record<string, TonoChip> = {
  ok: 'exito',
  alerta: 'tinte',
  error: 'error',
  azul: 'tinte',
  gris: 'gris',
};

/**
 * Pagos registrados (lienzo X-Pagos, sin tarjetas): el historial de los pagos directos al especialista, cada uno con
 * su estado real. Un pago reportado no es un pago verificado, y Handy no cobra el servicio ni guarda tarjetas.
 */
export default function PagosRegistrados() {
  const trabajos = useConsulta('trabajos', { consulta: { limite: 50 } });
  const pedidos = useConsulta('pedidos', { consulta: { limite: 50 } });
  const movimientos = useMovimientos(trabajos.datos?.items ?? null);
  const rubroDe = (t: Trabajo): Rubro | null =>
    pedidos.datos?.items.find((p) => p.id === t.pedidoId)?.rubro ?? null;
  const error = trabajos.error ?? movimientos.error;
  const lista = movimientos.lista;

  return (
    <PantallaM arriba={<BarraCentro titulo="Pagos registrados" volver={VOLVER} />}>
      <div className="ds-cuerpo">
        <Nota icono="billete" tono="gris">
          Le pagás directo al especialista, por Mercado Pago o en efectivo. Handy no cobra el
          servicio ni guarda tarjetas: acá queda el registro.
        </Nota>
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
          <div className="ds-m-vacio">
            <EscenaVacio />
            <Texto>
              Todavía no hay pagos registrados. Cuando le pagues a un especialista, lo registrás
              desde el trabajo.
            </Texto>
          </div>
        ) : (
          <Tarjeta etiqueta="Tus movimientos">
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {lista.map(({ pago, trabajo }) => {
                const rubro = rubroDe(trabajo);
                const e = etiquetaPago(pago);
                const fecha = pago.verificadoEn ?? pago.reportadoEn;
                return (
                  <li key={pago.id}>
                    <Movimiento
                      titulo={`Pago a ${trabajo.especialista.nombrePublico}`}
                      sub={`${rubro ? RUBROS_INFO[rubro].nombre : 'Trabajo'} · ${pago.metodo === 'efectivo' ? 'Efectivo' : 'Mercado Pago'}${fecha ? ` · ${diaMes(fecha)}` : ''}`}
                      chip={
                        <>
                          <Chip
                            tono={TONO[e.tono] ?? 'tinte'}
                            {...(e.icono ? { icono: e.icono } : {})}
                          >
                            <span className="ds-solo-lector">Estado: </span>
                            {etiquetaPago(pago).texto}
                          </Chip>
                          <span className="ds-m-movimiento__sub">
                            {FUENTE[pago.fuente ?? 'nadie']}
                          </span>
                          <Enlace
                            className="ds-m-enlace"
                            href={ruta('/trabajos/pago/', { id: trabajo.id })}
                          >
                            Ver el pago del trabajo
                          </Enlace>
                        </>
                      }
                      derecha={<strong>{pesos(pago.monto.centavos)}</strong>}
                    />
                  </li>
                );
              })}
            </ul>
          </Tarjeta>
        )}
        <Nota icono="info" tono="gris">
          “Reportado” quiere decir que alguien lo anotó; “verificado”, que se confirmó.
        </Nota>
      </div>
    </PantallaM>
  );
}
