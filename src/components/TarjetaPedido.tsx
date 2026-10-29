import type { Pedido, Rubro } from '@/contracts/v1/pedidos';
import type { Trabajo } from '@/contracts/v1/propuestas';
import { cuando } from '@/domain/fechas';
import { pesos } from '@/domain/dinero';
import {
  RUBROS_INFO,
  TIPOS_INFO,
  etiquetaPedido,
  etiquetaTrabajo,
  type Etiqueta,
} from '@/domain/etiquetas';
import { Icono } from './Icono';
import { Enlace, ruta } from './nav';
import { Pastilla } from './ui';

function Tarjeta({
  href,
  rubro,
  titulo,
  linea,
  etiqueta,
  extra,
}: {
  href: string;
  rubro: Rubro | null;
  titulo: string;
  linea: string;
  etiqueta: Etiqueta;
  extra?: string | undefined;
}) {
  return (
    <li>
      <Enlace href={href} className="tarjeta tarjeta--enlace">
        <div className="tarjeta__cuerpo">
          <div className="tarjeta__fila">
            <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {rubro ? <Icono nombre={RUBROS_INFO[rubro].icono} /> : null}
              <strong className="tarjeta__titulo" style={{ margin: 0 }}>
                {titulo}
              </strong>
            </span>
            <Pastilla tono={etiqueta.tono} {...(etiqueta.icono ? { icono: etiqueta.icono } : {})}>
              {etiqueta.texto}
            </Pastilla>
          </div>
          <p style={{ margin: '6px 0 0' }}>{linea}</p>
          {extra ? (
            <p className="texto-suave" style={{ margin: '4px 0 0' }}>
              {extra}
            </p>
          ) : null}
        </div>
      </Enlace>
    </li>
  );
}

export function TarjetaDePedido({ p }: { p: Pedido }) {
  const f = p.fechaSolicitada;
  return (
    <Tarjeta
      href={ruta('/pedidos/detalle/', { id: p.id })}
      rubro={p.rubro}
      titulo={`${RUBROS_INFO[p.rubro].nombre} · ${TIPOS_INFO[p.tipo].nombre}`}
      linea={p.descripcion.length > 90 ? `${p.descripcion.slice(0, 90)}…` : p.descripcion}
      etiqueta={etiquetaPedido(p)}
      extra={
        f
          ? `Pedido para el ${f.fecha.split('-').reverse().slice(0, 2).join('/')} a las ${f.desde}`
          : p.estado === 'con_propuestas'
            ? `${p.propuestasPendientes} propuestas esperando tu respuesta`
            : undefined
      }
    />
  );
}

export function TarjetaDeTrabajo({ t, rubro }: { t: Trabajo; rubro?: Rubro | null }) {
  const inicio = t.acuerdo.horario?.inicio;
  return (
    <Tarjeta
      href={ruta('/trabajos/detalle/', { id: t.id })}
      rubro={rubro ?? null}
      titulo={`${t.especialista.nombrePublico}`}
      linea={inicio ? cuando(inicio) : 'Horario a coordinar con el especialista'}
      etiqueta={etiquetaTrabajo(t)}
      extra={`Acordado: ${pesos(t.acuerdo.monto.centavos)}`}
    />
  );
}
