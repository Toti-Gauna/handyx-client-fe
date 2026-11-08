'use client';
// Tickets del Inicio (lienzo design/usuario · I-Inicio): lo que está en curso, las propuestas para elegir, el pedido
// que se está buscando o el próximo turno. Arriba quién y el estado; abajo cuándo y la acción.
import { Icono } from '@/components/Icono';
import { ruta } from '@/components/nav';
import type { Pedido, Rubro } from '@/contracts/v1/pedidos';
import type { Trabajo } from '@/contracts/v1/propuestas';
import { RUBROS_INFO, TIPOS_INFO, etiquetaPedido, etiquetaTrabajo } from '@/domain/etiquetas';
import { cuando, fechaCorta } from '@/domain/fechas';
import { Chip, Etiqueta, MosaicoIcono, Ticket } from '@/ui';
import { AvatarSello, ChipEtiqueta, FilaTicket } from '@/ui/inicio';

function Seccion({ sobre, children }: { sobre: string; children: React.ReactNode }) {
  return (
    <div className="dsi-seccion">
      <Etiqueta como="h2">{sobre}</Etiqueta>
      {children}
    </div>
  );
}

function Quien({ titulo, rubro, sub }: { titulo: string; rubro: Rubro | null; sub?: string }) {
  return (
    <span className="dsi-quien">
      <strong>{titulo}</strong>
      {rubro ? (
        <small>
          <Icono nombre={RUBROS_INFO[rubro].icono} />
          {RUBROS_INFO[rubro].nombre}
        </small>
      ) : sub ? (
        <small>{sub}</small>
      ) : null}
    </span>
  );
}

export function TicketTrabajo({
  t,
  sobre,
  accion,
  rubro,
}: {
  t: Trabajo;
  sobre: string;
  accion: string;
  rubro: Rubro | null;
}) {
  const horario = t.acuerdo.horario ? cuando(t.acuerdo.horario.inicio) : 'Horario a coordinar';
  return (
    <Seccion sobre={sobre}>
      <Ticket
        href={ruta('/trabajos/detalle/', { id: t.id })}
        etiqueta={`${sobre}: ${t.especialista.nombrePublico}, ${horario}. ${accion}`}
        arriba={
          <>
            <AvatarSello
              nombre={t.especialista.nombrePublico}
              verificado={t.especialista.verificaciones.length > 0}
            />
            <Quien titulo={t.especialista.nombrePublico} rubro={rubro} />
            <ChipEtiqueta e={etiquetaTrabajo(t)} />
          </>
        }
        abajo={<FilaTicket icono="calendario" dato={horario} accion={accion} />}
      />
    </Seccion>
  );
}

export function TicketPropuestas({ p }: { p: Pedido }) {
  const n = p.propuestasPendientes;
  const titulo = `${n} ${n === 1 ? 'propuesta' : 'propuestas'}`;
  return (
    <Seccion sobre="Para resolver">
      <Ticket
        href={ruta('/pedidos/propuestas/', { pedido: p.id })}
        etiqueta={`${titulo} de ${RUBROS_INFO[p.rubro].nombre}. Ver propuestas`}
        arriba={
          <>
            <MosaicoIcono icono={RUBROS_INFO[p.rubro].icono} tam={3} />
            <Quien titulo={titulo} rubro={p.rubro} />
            <Chip tono="amarillo">Para elegir</Chip>
          </>
        }
        abajo={<FilaTicket icono="info" dato="Compará y elegí" accion="Ver propuestas" />}
      />
    </Seccion>
  );
}

const cuandoSolicitado = (f: NonNullable<Pedido['fechaSolicitada']>) =>
  `${fechaCorta(f.fecha)} · ${f.desde}${f.hasta ? ` a ${f.hasta}` : ''}`;

export function TicketPedido({ p }: { p: Pedido }) {
  const titulo = `${RUBROS_INFO[p.rubro].nombre} · ${TIPOS_INFO[p.tipo].nombre}`;
  const fecha = p.fechaSolicitada ? cuandoSolicitado(p.fechaSolicitada) : 'Lo antes posible';
  return (
    <Seccion sobre="Tu pedido">
      <Ticket
        href={ruta('/pedidos/detalle/', { id: p.id })}
        etiqueta={`Tu pedido de ${titulo}, ${fecha}. Ver el pedido`}
        arriba={
          <>
            <MosaicoIcono icono={RUBROS_INFO[p.rubro].icono} tam={3} />
            <Quien
              titulo={RUBROS_INFO[p.rubro].nombre}
              rubro={null}
              sub={TIPOS_INFO[p.tipo].nombre}
            />
            <ChipEtiqueta e={etiquetaPedido(p)} />
          </>
        }
        abajo={<FilaTicket icono="calendario" dato={fecha} accion="Ver el pedido" />}
      />
    </Seccion>
  );
}
