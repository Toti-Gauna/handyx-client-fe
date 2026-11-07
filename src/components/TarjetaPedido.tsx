// Tarjetas de pedidos y trabajos para las listas (rediseño 3.7): la tarjeta con franja de la demo (u-turnos): ícono del
// rubro, qué y cuándo, el estado y el total; la franja de abajo abre el detalle.
import type { Pedido, Rubro } from '@/contracts/v1/pedidos';
import type { Trabajo } from '@/contracts/v1/propuestas';
import { pesos } from '@/domain/dinero';
import {
  RUBROS_INFO,
  TIPOS_INFO,
  etiquetaPedido,
  etiquetaTrabajo,
  type Etiqueta,
} from '@/domain/etiquetas';
import { cuando } from '@/domain/fechas';
import { ChipEstado } from './hx';
import { Icono } from './Icono';
import { Enlace, ruta } from './nav';

function Tarjeta({
  href,
  rubro,
  titulo,
  detalle,
  extra,
  etiqueta,
  importe,
  destino,
}: {
  href: string;
  rubro: Rubro | null;
  titulo: string;
  detalle: string;
  extra?: string | undefined;
  etiqueta: Etiqueta;
  importe?: string | undefined;
  /** Nombre del enlace: qué abre (incluye rubro y quién, para distinguir tarjetas iguales). */
  destino: string;
}) {
  return (
    <li className="du-tarjeta du-tarjeta-hx" data-vt-origen>
      <div className="du-tarjeta__cuerpo">
        <span className="du-tarjeta__ico du-tarjeta__ico--azul" aria-hidden="true">
          <Icono nombre={rubro ? RUBROS_INFO[rubro].icono : 'calendario'} />
        </span>
        <span className="du-tarjeta__datos">
          <strong>{titulo}</strong>
          <small>{detalle}</small>
          {extra ? <small>{extra}</small> : null}
        </span>
        <span className="du-tarjeta__der">
          <ChipEstado e={etiqueta} />
          {importe ? <strong className="hd-precio">{importe}</strong> : null}
        </span>
      </div>
      <Enlace
        href={href}
        className="du-tarjeta__franja tarjeta--enlace"
        aria-label={`Ver detalle: ${destino}`}
      >
        Ver detalle
        <Icono nombre="derecha" />
      </Enlace>
    </li>
  );
}

export function TarjetaDePedido({ p }: { p: Pedido }) {
  const f = p.fechaSolicitada;
  const titulo = `${RUBROS_INFO[p.rubro].nombre} · ${TIPOS_INFO[p.tipo].nombre}`;
  return (
    <Tarjeta
      href={ruta('/pedidos/detalle/', { id: p.id })}
      rubro={p.rubro}
      titulo={titulo}
      detalle={p.descripcion.length > 70 ? `${p.descripcion.slice(0, 70)}…` : p.descripcion}
      extra={
        f
          ? `Pedido para el ${f.fecha.split('-').reverse().slice(0, 2).join('/')} a las ${f.desde}`
          : p.estado === 'con_propuestas'
            ? `${p.propuestasPendientes} ${p.propuestasPendientes === 1 ? 'propuesta espera' : 'propuestas esperan'} tu respuesta`
            : undefined
      }
      etiqueta={etiquetaPedido(p)}
      destino={titulo}
    />
  );
}

export function TarjetaDeTrabajo({ t, rubro }: { t: Trabajo; rubro?: Rubro | null }) {
  const inicio = t.acuerdo.horario?.inicio;
  const quien = t.especialista.nombrePublico;
  const titulo = rubro ? RUBROS_INFO[rubro].nombre : 'Trabajo';
  return (
    <Tarjeta
      href={ruta('/trabajos/detalle/', { id: t.id })}
      rubro={rubro ?? null}
      titulo={titulo}
      detalle={`${inicio ? cuando(inicio) : 'Horario a coordinar'} · ${quien}`}
      extra={
        t.acuerdo.alcance.length > 60 ? `${t.acuerdo.alcance.slice(0, 60)}…` : t.acuerdo.alcance
      }
      etiqueta={etiquetaTrabajo(t)}
      importe={pesos(t.acuerdo.monto.centavos + t.acuerdo.comisionHandy.importe.centavos)}
      destino={`${titulo} con ${quien}`}
    />
  );
}
