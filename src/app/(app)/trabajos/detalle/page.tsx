'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { estadoDeCarga } from '@/components/Trabajo';
import { useConsulta, useEnvio } from '@/data/hooks';
import { Cierre } from './Cierre';
import type { ContextoTrabajo } from './contexto';
import { HojaCancelar } from './HojaCancelar';
import { Seguimiento } from './Seguimiento';

const ACTIVOS = ['agendado', 'en_camino', 'en_sitio', 'en_curso'];

/**
 * Trabajo contratado (Fase 7). Mientras está activo, el seguimiento del turno (agendado, en camino con el viaje en
 * vivo del servidor, llegó, trabajando); cuando el especialista termina, se revisa y se confirma; confirmado, «¡Quedó
 * arreglado!» con el pago y la reseña.
 */
export default function DetalleTrabajo() {
  const id = useSearchParams().get('id');
  const trabajo = useConsulta('trabajo', id ? { parametros: { id } } : null, { cada: 4_000 });
  const eventos = useConsulta(
    'trabajoEventos',
    id ? { parametros: { id }, consulta: { limite: 50 } } : null,
    { cada: 6_000 },
  );
  const pagos = useConsulta('pagos', id ? { parametros: { id } } : null, { cada: 8_000 });
  const pedidoId = trabajo.datos?.pedidoId ?? null;
  const pedido = useConsulta('pedido', pedidoId ? { parametros: { id: pedidoId } } : null);
  const propuestas = useConsulta(
    'propuestas',
    pedidoId ? { parametros: { id: pedidoId }, consulta: { limite: 50 } } : null,
    { cada: 6_000 },
  );
  const accion = useEnvio();
  const [cancelando, setCancelando] = useState(false);

  const carga = estadoDeCarga(id, [trabajo]);
  const t = trabajo.datos;
  if (carga || !t) return carga;

  const lista = propuestas.datos?.items ?? [];
  const pendientes = lista.filter(
    (p) => p.tipo !== 'cotizacion' && p.estado === 'pendiente' && p.trabajoId === t.id,
  );
  const contexto: ContextoTrabajo = {
    t,
    esp: t.especialista.nombrePublico,
    pedido: pedido.datos,
    propuestas: lista,
    pagos: pagos.datos?.items ?? [],
    eventos: eventos.datos?.items ?? null,
    adicionalPendiente:
      pendientes.find((p) => p.tipo === 'adicional' && p.autorRol === 'especialista') ?? null,
    cambioPendiente: pendientes.find((p) => p.tipo === 'cambio_acuerdo') ?? null,
    pendiente: accion.pendiente,
    error: accion.error,
    limpiarError: accion.limpiar,
    abrirCancelar: () => {
      accion.limpiar();
      setCancelando(true);
    },
    recargar: () => {
      trabajo.recargar();
      eventos.recargar();
      propuestas.recargar();
    },
  };

  return (
    <>
      {ACTIVOS.includes(t.estado) ? <Seguimiento {...contexto} /> : <Cierre {...contexto} />}
      <HojaCancelar
        abierta={cancelando}
        cerrar={() => setCancelando(false)}
        t={t}
        esp={contexto.esp}
        accion={accion}
        alCancelar={contexto.recargar}
      />
    </>
  );
}
