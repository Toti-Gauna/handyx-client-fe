'use client';

import { useState } from 'react';
import { Enlace } from '@/components/nav';
import { TarjetaDePedido, TarjetaDeTrabajo } from '@/components/TarjetaPedido';
import { Titulo } from '@/components/Titulo';
import { Cargando, ErrorEstado, Vacio } from '@/components/ui';
import { useConsulta } from '@/data/hooks';

type Vista = 'activos' | 'programados' | 'historial';
const TABS: readonly { id: Vista; texto: string }[] = [
  { id: 'activos', texto: 'Activos' },
  { id: 'programados', texto: 'Programados' },
  { id: 'historial', texto: 'Historial' },
];

export default function Pedidos() {
  const [vista, setVista] = useState<Vista>('activos');
  const pedidos = useConsulta(
    'pedidos',
    vista === 'programados'
      ? null
      : { consulta: { vista: vista === 'activos' ? 'activos' : 'historial', limite: 50 } },
    { cada: 8_000 },
  );
  const trabajos = useConsulta('trabajos', { consulta: { vista, limite: 50 } }, { cada: 8_000 });
  const rubroDe = (pedidoId: string) =>
    pedidos.datos?.items.find((p) => p.id === pedidoId)?.rubro ?? null;
  const error = trabajos.error ?? (vista !== 'programados' ? pedidos.error : null);
  const cargando =
    trabajos.estado === 'cargando' || (vista !== 'programados' && pedidos.estado === 'cargando');
  // Un pedido contratado se muestra como trabajo, no dos veces.
  const soloPedidos = (pedidos.datos?.items ?? []).filter((p) => p.estado !== 'contratado');
  const vacio =
    !cargando &&
    !error &&
    soloPedidos.length === 0 &&
    (trabajos.datos?.items.length ?? 0) === 0 &&
    (vista === 'programados' || pedidos.datos !== null);

  return (
    <>
      <Titulo texto="Mis ==pedidos==" />
      <div className="tabs" role="tablist" aria-label="Estado de los pedidos">
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`tab-${t.id}`}
            role="tab"
            aria-selected={vista === t.id}
            aria-controls="panel-pedidos"
            className="tabs__tab"
            onClick={() => setVista(t.id)}
          >
            {t.texto}
          </button>
        ))}
      </div>
      <div id="panel-pedidos" role="tabpanel" aria-labelledby={`tab-${vista}`}>
        {cargando ? <Cargando /> : null}
        {error ? (
          <ErrorEstado
            error={error}
            onReintentar={() => {
              trabajos.recargar();
              pedidos.recargar();
            }}
          />
        ) : null}
        {!cargando && !error ? (
          <ul className="lista-tarjetas">
            {vista !== 'programados'
              ? soloPedidos.map((p) => <TarjetaDePedido key={p.id} p={p} />)
              : null}
            {(trabajos.datos?.items ?? []).map((t) => (
              <TarjetaDeTrabajo key={t.id} t={t} rubro={rubroDe(t.pedidoId)} />
            ))}
          </ul>
        ) : null}
        {vacio ? (
          <Vacio
            titulo={
              vista === 'activos'
                ? 'No tenés pedidos activos'
                : vista === 'programados'
                  ? 'No tenés turnos programados'
                  : 'Todavía no hay historial'
            }
            texto={
              vista === 'historial'
                ? 'Acá van a aparecer tus pedidos y trabajos terminados.'
                : 'Cuando pidas un servicio lo ves acá.'
            }
          >
            <Enlace href="/pedir/" className="boton boton--chico">
              Pedir un servicio
            </Enlace>
          </Vacio>
        ) : null}
      </div>
    </>
  );
}
