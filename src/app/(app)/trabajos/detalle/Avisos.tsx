'use client';

import { ruta } from '@/components/nav';
import { Aviso } from '@/components/ui';
import { PedidoAmarillo } from '@/ui/seguimiento';
import type { ContextoTrabajo } from './contexto';

export function AvisoError({ c }: { c: ContextoTrabajo }) {
  if (!c.error) return null;
  return (
    <Aviso tipo={c.error.codigo === 'conflicto' ? 'alerta' : 'error'} titulo="No se pudo">
      <p>{c.error.mensaje}</p>
    </Aviso>
  );
}

/** Lo que espera una decisión tuya: un adicional o un cambio del acuerdo. Un solo toque grande. */
export function PedidosPendientes({ c }: { c: ContextoTrabajo }) {
  const { adicionalPendiente: a, cambioPendiente: p } = c;
  return (
    <>
      {a ? (
        <PedidoAmarillo
          titulo={`${c.esp} pide un adicional`}
          sub={`${a.alcance.slice(0, 48)} · para aprobar`}
          href={ruta('/trabajos/adicional/', { id: a.id })}
        />
      ) : null}
      {p ? (
        <PedidoAmarillo
          icono="calendario"
          titulo={
            p.autorRol === 'especialista'
              ? `${c.esp} propone un cambio`
              : 'Tu cambio espera respuesta'
          }
          sub="Hasta que se acepte, vale el acuerdo actual"
          href={ruta('/propuestas/detalle/', { id: p.id })}
        />
      ) : null}
    </>
  );
}
