'use client';
// Pedido y propuestas de un pedido (lista y comparar): se actualizan solas mientras la pantalla está a la vista.
import type { Propuesta } from '@/contracts/v1/propuestas';
import { useConsulta } from '@/data/hooks';

export function usePropuestasDelPedido(pedidoId: string | null) {
  const pedido = useConsulta('pedido', pedidoId ? { parametros: { id: pedidoId } } : null, {
    cada: 4_000,
  });
  const lista = useConsulta(
    'propuestas',
    pedidoId ? { parametros: { id: pedidoId }, consulta: { limite: 50 } } : null,
    { cada: 4_000 },
  );
  const cotizaciones: Propuesta[] = (lista.datos?.items ?? []).filter(
    (x) => x.tipo === 'cotizacion',
  );
  return {
    pedido,
    lista,
    error: lista.error ?? pedido.error,
    recargar: () => {
      lista.recargar();
      pedido.recargar();
    },
    /** Las del especialista que esperan tu respuesta, en el orden en que llegaron. */
    vigentes: cotizaciones
      .filter((x) => x.autorRol === 'especialista' && x.estado === 'pendiente')
      .sort((a, b) => a.creadaEn.localeCompare(b.creadaEn)),
    mias: cotizaciones.filter((x) => x.autorRol === 'usuario' && x.estado === 'pendiente'),
    anteriores: cotizaciones.filter((x) => x.estado !== 'pendiente'),
  };
}
