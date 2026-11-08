'use client';

// Actividad (lienzo X-Actividad): lo que está en curso (con lo que espera tu respuesta arriba), la agenda y el
// historial, en una sola pestaña con segmentos.
import { useMemo, useState } from 'react';
import type { Pedido } from '@/contracts/v1/pedidos';
import type { Trabajo } from '@/contracts/v1/propuestas';
import { useConsulta } from '@/data/hooks';
import { pesos } from '@/domain/dinero';
import {
  RUBROS_INFO,
  TIPOS_INFO,
  etiquetaPedido,
  etiquetaTrabajo,
  type Etiqueta,
} from '@/domain/etiquetas';
import {
  cuando,
  fechaDeInstante,
  fechaLarga,
  hoyEnArgentina,
  type FechaISO,
} from '@/domain/fechas';
import {
  Boton,
  Chip,
  Etiqueta as Rotulo,
  MosaicoIcono,
  Tarjeta,
  Texto,
  Titulo,
  type TonoChip,
} from '@/ui';
import { EscenaVacio, PantallaM, Segmentos } from '@/ui/mensajes';
import { Calendario } from './Calendario';
import { ruta } from './nav';
import { useAhora } from './SesionProvider';
import { TituloDocumento } from './TituloDocumento';
import { Cargando, ErrorEstado } from './ui';

export type VistaActividad = 'curso' | 'agenda' | 'historial';
const TABS: readonly { id: VistaActividad; texto: string }[] = [
  { id: 'curso', texto: 'En curso' },
  { id: 'agenda', texto: 'Agenda' },
  { id: 'historial', texto: 'Historial' },
];
const TONO: Record<Etiqueta['tono'], TonoChip> = {
  azul: 'tinte',
  ok: 'exito',
  alerta: 'amarillo',
  error: 'error',
  gris: 'gris',
};

/** Necesita algo de la persona: elegir entre propuestas o confirmar que el trabajo terminó. */
const esperaPedido = (p: Pedido) => p.estado === 'con_propuestas' && p.propuestasPendientes > 0;
const esperaTrabajo = (t: Trabajo) => t.estado === 'terminado_por_especialista';
const corto = (t: string, n: number) => (t.length > n ? `${t.slice(0, n)}…` : t);

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
  const listo = !cargando && !error;

  return (
    <PantallaM
      arriba={
        <header className="ds ds-pila" style={{ padding: '1.25rem 1rem 0.5rem' }}>
          <TituloDocumento texto="Actividad" />
          <Titulo texto="==Actividad==" tam={2} />
          <Segmentos
            opciones={TABS}
            valor={vista}
            onCambio={setVista}
            etiqueta="Qué querés ver"
            idPanel="panel-actividad"
          />
        </header>
      }
    >
      <div
        id="panel-actividad"
        role="tabpanel"
        aria-labelledby={`seg-${vista}`}
        className="ds-cuerpo ds-cuerpo--raiz"
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
        {listo && vista === 'curso' ? (
          <EnCurso pedidos={soloPedidos} trabajos={listaTrabajos} rubroDe={rubroDe} />
        ) : null}
        {listo && vista === 'agenda' ? <Agenda trabajos={listaTrabajos} rubroDe={rubroDe} /> : null}
        {listo && historial ? (
          soloPedidos.length + listaTrabajos.length ? (
            <Lista pedidos={soloPedidos} trabajos={listaTrabajos} rubroDe={rubroDe} />
          ) : (
            <Nada
              titulo="Todavía no hay historial"
              texto="Acá van a aparecer tus pedidos y trabajos terminados."
            />
          )
        ) : null}
      </div>
    </PantallaM>
  );
}

type RubroDe = (pedidoId: string) => Pedido['rubro'] | null;

function Item({
  href,
  rubro,
  titulo,
  detalle,
  etiqueta,
  importe,
  destino,
}: {
  href: string;
  rubro: Pedido['rubro'] | null;
  titulo: string;
  detalle: string;
  etiqueta: Etiqueta;
  importe?: string;
  destino: string;
}) {
  return (
    <li>
      <Tarjeta pie={{ texto: 'Ver', href }} etiqueta={destino} como="article">
        <div className="ds-fila">
          <MosaicoIcono icono={rubro ? RUBROS_INFO[rubro].icono : 'obra'} tam={3.25} tono="gris" />
          <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.1875rem' }}>
            <strong style={{ fontSize: '1rem' }}>{titulo}</strong>
            <span className="ds-fila-enlace__sub">{detalle}</span>
          </span>
        </div>
        <span className="ds-fila" style={{ flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <Chip tono={TONO[etiqueta.tono]} {...(etiqueta.icono ? { icono: etiqueta.icono } : {})}>
            <span className="ds-solo-lector">Estado: </span>
            {etiqueta.texto}
          </Chip>
          {importe ? <strong>{importe}</strong> : null}
        </span>
      </Tarjeta>
    </li>
  );
}

const ItemPedido = ({ p }: { p: Pedido }) => (
  <Item
    href={ruta('/pedidos/detalle/', { id: p.id })}
    rubro={p.rubro}
    titulo={`${RUBROS_INFO[p.rubro].nombre} · ${TIPOS_INFO[p.tipo].nombre}`}
    detalle={
      p.estado === 'con_propuestas'
        ? `${p.propuestasPendientes} ${p.propuestasPendientes === 1 ? 'propuesta espera' : 'propuestas esperan'} tu respuesta`
        : corto(p.descripcion, 70)
    }
    etiqueta={etiquetaPedido(p)}
    destino={`Pedido de ${RUBROS_INFO[p.rubro].nombre}`}
  />
);

const ItemTrabajo = ({ t, rubro }: { t: Trabajo; rubro: Pedido['rubro'] | null }) => {
  const inicio = t.acuerdo.horario?.inicio;
  const titulo = rubro ? RUBROS_INFO[rubro].nombre : 'Trabajo';
  return (
    <Item
      href={ruta('/trabajos/detalle/', { id: t.id })}
      rubro={rubro}
      titulo={titulo}
      detalle={`${inicio ? cuando(inicio) : 'Horario a coordinar'} · ${t.especialista.nombrePublico}`}
      etiqueta={etiquetaTrabajo(t)}
      importe={pesos(t.acuerdo.monto.centavos + t.acuerdo.comisionHandy.importe.centavos)}
      destino={`${titulo} con ${t.especialista.nombrePublico}`}
    />
  );
};

function Lista({
  pedidos,
  trabajos,
  rubroDe,
}: {
  pedidos: Pedido[];
  trabajos: Trabajo[];
  rubroDe: RubroDe;
}) {
  return (
    <ul className="ds-pila" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {trabajos.map((t) => (
        <ItemTrabajo key={t.id} t={t} rubro={rubroDe(t.pedidoId)} />
      ))}
      {pedidos.map((p) => (
        <ItemPedido key={p.id} p={p} />
      ))}
    </ul>
  );
}

function EnCurso({
  pedidos,
  trabajos,
  rubroDe,
}: {
  pedidos: Pedido[];
  trabajos: Trabajo[];
  rubroDe: RubroDe;
}) {
  const esperanP = pedidos.filter(esperaPedido);
  const esperanT = trabajos.filter(esperaTrabajo);
  const restoP = pedidos.filter((p) => !esperaPedido(p));
  const restoT = trabajos.filter((t) => !esperaTrabajo(t));
  if (!esperanP.length && !esperanT.length && !restoP.length && !restoT.length)
    return (
      <Nada
        titulo="No tenés nada en curso"
        texto="Cuando pidas un servicio, lo seguís desde acá."
        pedir
      />
    );
  return (
    <>
      {esperanP.length + esperanT.length ? (
        <section className="ds-pila" aria-labelledby="espera">
          <Rotulo como="h2">
            <span id="espera">Espera tu respuesta</span>
          </Rotulo>
          <Lista pedidos={esperanP} trabajos={esperanT} rubroDe={rubroDe} />
        </section>
      ) : null}
      {restoP.length + restoT.length ? (
        <section className="ds-pila" aria-labelledby="en-marcha">
          <Rotulo como="h2">
            <span id="en-marcha">En marcha</span>
          </Rotulo>
          <Lista pedidos={restoP} trabajos={restoT} rubroDe={rubroDe} />
        </section>
      ) : null}
    </>
  );
}

function Agenda({ trabajos, rubroDe }: { trabajos: Trabajo[]; rubroDe: RubroDe }) {
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
      <Tarjeta como="div">
        <Calendario
          valor={dia}
          onElegir={setElegido}
          marcas={new Set(porDia.keys())}
          sinPasados={false}
        />
      </Tarjeta>
      <Rotulo como="h2">
        <span aria-live="polite">{fechaLarga(dia)}</span>
      </Rotulo>
      {delDia.length ? (
        <Lista pedidos={[]} trabajos={delDia} rubroDe={rubroDe} />
      ) : (
        <Texto>No tenés nada este día. Los días con puntito tienen trabajos.</Texto>
      )}
    </>
  );
}

function Nada({
  titulo,
  texto,
  pedir = false,
}: {
  titulo: string;
  texto: string;
  pedir?: boolean;
}) {
  return (
    <div className="ds-m-vacio">
      <EscenaVacio />
      <Titulo nivel={2} tam={1.375} texto={titulo} />
      <Texto>{texto}</Texto>
      {pedir ? <Boton href="/pedir/">Pedir un servicio</Boton> : null}
    </div>
  );
}
