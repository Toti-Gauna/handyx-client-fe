'use client';

// Actividad (rediseño 3.7): lo que está en curso (con lo que espera tu respuesta arriba), la agenda y el historial, en
// una sola pestaña como en la demo.
import Image from 'next/image';
import { useMemo, useState } from 'react';
import type { Pedido } from '@/contracts/v1/pedidos';
import type { Trabajo } from '@/contracts/v1/propuestas';
import { useConsulta } from '@/data/hooks';
import { fechaDeInstante, fechaLarga, hoyEnArgentina, type FechaISO } from '@/domain/fechas';
import { Calendario } from './Calendario';
import { Pantalla, entra } from './hx';
import { Enlace } from './nav';
import { useAhora } from './SesionProvider';
import { TarjetaDePedido, TarjetaDeTrabajo } from './TarjetaPedido';
import { TituloDocumento } from './TituloDocumento';
import { Cargando, ErrorEstado } from './ui';

export type VistaActividad = 'curso' | 'agenda' | 'historial';
const TABS: readonly { id: VistaActividad; texto: string }[] = [
  { id: 'curso', texto: 'En curso' },
  { id: 'agenda', texto: 'Agenda' },
  { id: 'historial', texto: 'Historial' },
];

/** Necesita algo de la persona: elegir entre propuestas o confirmar que el trabajo terminó. */
const esperaPedido = (p: Pedido) => p.estado === 'con_propuestas' && p.propuestasPendientes > 0;
const esperaTrabajo = (t: Trabajo) => t.estado === 'terminado_por_especialista';

export function Actividad({ inicial = 'curso' }: { inicial?: VistaActividad }) {
  const [vista, setVista] = useState<VistaActividad>(inicial);
  const historial = vista === 'historial';
  const pedidos = useConsulta(
    'pedidos',
    { consulta: { vista: historial ? 'historial' : 'activos', limite: 50 } },
    { cada: 8_000 },
  );
  // En curso y la agenda necesitan todos los trabajos (los activos y los programados); el historial, los terminados.
  const trabajos = useConsulta(
    'trabajos',
    { consulta: historial ? { vista: 'historial', limite: 50 } : { limite: 50 } },
    { cada: 8_000 },
  );
  const rubroDe = (pedidoId: string) =>
    pedidos.datos?.items.find((p) => p.id === pedidoId)?.rubro ?? null;
  const error = trabajos.error ?? pedidos.error;
  const cargando = trabajos.estado === 'cargando' || pedidos.estado === 'cargando';
  // Un pedido contratado se muestra como trabajo, no dos veces.
  const soloPedidos = (pedidos.datos?.items ?? []).filter((p) => p.estado !== 'contratado');
  const listaTrabajos = (trabajos.datos?.items ?? []).filter(
    (t) => historial || vista === 'agenda' || !['finalizado', 'cancelado'].includes(t.estado),
  );

  return (
    <Pantalla
      arriba={
        <div className="du-actividad__cabeza">
          <TituloDocumento texto="Actividad" />
          <h1 className="hd-titulo hd-titulo--grande">Actividad</h1>
          <div className="du-segmentos" role="tablist" aria-label="Qué querés ver">
            {TABS.map((t) => (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                type="button"
                role="tab"
                aria-selected={vista === t.id}
                aria-controls="panel-actividad"
                className="du-segmentos__tab"
                onClick={() => setVista(t.id)}
              >
                {t.texto}
              </button>
            ))}
          </div>
        </div>
      }
      clase="du-actividad"
    >
      <div
        id="panel-actividad"
        role="tabpanel"
        aria-labelledby={`tab-${vista}`}
        className="du-cuerpo du-actividad__panel"
        key={vista}
      >
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
        {!cargando && !error && vista === 'curso' ? (
          <EnCurso pedidos={soloPedidos} trabajos={listaTrabajos} rubroDe={rubroDe} />
        ) : null}
        {!cargando && !error && vista === 'agenda' ? (
          <Agenda trabajos={listaTrabajos} rubroDe={rubroDe} />
        ) : null}
        {!cargando && !error && historial ? (
          soloPedidos.length + listaTrabajos.length ? (
            <ul className="du-lista-tarjetas" {...entra(1)}>
              {listaTrabajos.map((t) => (
                <TarjetaDeTrabajo key={t.id} t={t} rubro={rubroDe(t.pedidoId)} />
              ))}
              {soloPedidos.map((p) => (
                <TarjetaDePedido key={p.id} p={p} />
              ))}
            </ul>
          ) : (
            <Nada
              titulo="Todavía no hay historial"
              texto="Acá van a aparecer tus pedidos y trabajos terminados."
            />
          )
        ) : null}
      </div>
    </Pantalla>
  );
}

function EnCurso({
  pedidos,
  trabajos,
  rubroDe,
}: {
  pedidos: Pedido[];
  trabajos: Trabajo[];
  rubroDe: (pedidoId: string) => Pedido['rubro'] | null;
}) {
  const esperan = [...pedidos.filter(esperaPedido), ...trabajos.filter(esperaTrabajo)];
  const resto = [
    ...trabajos.filter((t) => !esperaTrabajo(t)),
    ...pedidos.filter((p) => !esperaPedido(p)),
  ];
  const tarjeta = (x: Pedido | Trabajo) =>
    'acuerdo' in x ? (
      <TarjetaDeTrabajo key={x.id} t={x} rubro={rubroDe(x.pedidoId)} />
    ) : (
      <TarjetaDePedido key={x.id} p={x} />
    );
  if (!esperan.length && !resto.length)
    return (
      <Nada
        titulo="No tenés nada en curso"
        texto="Cuando pidas un servicio, lo seguís desde acá."
      />
    );
  return (
    <>
      {esperan.length ? (
        <section className="du-bloque" aria-labelledby="espera" {...entra(1)}>
          <h2 id="espera" className="hd-sobre du-sobre du-actividad__espera">
            Espera tu respuesta
          </h2>
          <ul className="du-lista-tarjetas">{esperan.map(tarjeta)}</ul>
        </section>
      ) : null}
      {resto.length ? (
        <section className="du-bloque" aria-labelledby="en-marcha" {...entra(2)}>
          <h2 id="en-marcha" className="hd-sobre du-sobre">
            En marcha
          </h2>
          <ul className="du-lista-tarjetas">{resto.map(tarjeta)}</ul>
        </section>
      ) : null}
    </>
  );
}

function Agenda({
  trabajos,
  rubroDe,
}: {
  trabajos: Trabajo[];
  rubroDe: (pedidoId: string) => Pedido['rubro'] | null;
}) {
  const ahora = useAhora(60_000);
  const [elegido, setElegido] = useState<FechaISO | null>(null);
  const dia = elegido ?? hoyEnArgentina(new Date(ahora));
  const porDia = useMemo(() => {
    const mapa = new Map<string, Trabajo[]>();
    for (const t of trabajos) {
      if (t.estado === 'cancelado') continue;
      const f = fechaDeInstante(t.acuerdo.horario?.inicio ?? t.creadoEn);
      mapa.set(f, [...(mapa.get(f) ?? []), t]);
    }
    return mapa;
  }, [trabajos]);
  const delDia = porDia.get(dia) ?? [];
  return (
    <>
      <div className="hd-tarjeta du-actividad__calendario" {...entra(1)}>
        <Calendario
          valor={dia}
          onElegir={setElegido}
          marcas={new Set(porDia.keys())}
          sinPasados={false}
        />
      </div>
      <h2 className="hd-sobre du-sobre" aria-live="polite">
        {fechaLarga(dia)}
      </h2>
      {delDia.length ? (
        <ul className="du-lista-tarjetas">
          {delDia.map((t) => (
            <TarjetaDeTrabajo key={t.id} t={t} rubro={rubroDe(t.pedidoId)} />
          ))}
        </ul>
      ) : (
        <p className="du-nota">
          <span>No tenés nada este día. Los días con puntito tienen trabajos.</span>
        </p>
      )}
    </>
  );
}

function Nada({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="du-vacio-hx" {...entra(1)}>
      <Image className="hd-handy" src="/img/handy-gota.webp" alt="" width={93} height={125} />
      <p className="hd-titulo hd-titulo--chico">{titulo}</p>
      <p className="du-vacio-hx__texto">{texto}</p>
      <Enlace href="/pedir/" className="hd-boton">
        Pedir un servicio
      </Enlace>
    </div>
  );
}
