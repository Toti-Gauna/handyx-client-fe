'use client';

// Lo que comparten las pantallas de una obra (trabajo con etapas): la carga de datos y las pestañas.
import { useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { ruta } from '@/components/nav';
import { estadoDeCarga, esObra } from '@/components/Trabajo';
import { useConsulta } from '@/data/hooks';
import { SelectorVistas } from '@/ui/seguimiento';

export function useObra(extra: { cadaPagos?: number; exigirObra?: boolean } = {}) {
  const id = useSearchParams().get('id');
  const trabajo = useConsulta('trabajo', id ? { parametros: { id } } : null, { cada: 6_000 });
  const pagos = useConsulta('pagos', id ? { parametros: { id } } : null, {
    cada: extra.cadaPagos ?? 8_000,
  });
  const pedidoId = trabajo.datos?.pedidoId ?? null;
  const pedido = useConsulta('pedido', pedidoId ? { parametros: { id: pedidoId } } : null);
  const propuestas = useConsulta(
    'propuestas',
    pedidoId ? { parametros: { id: pedidoId }, consulta: { limite: 50 } } : null,
    { cada: 8_000 },
  );
  const t = trabajo.datos;
  let carga: ReactNode | null = estadoDeCarga(id, [trabajo, pagos, propuestas]);
  if (!carga && t && extra.exigirObra !== false && !esObra(t))
    carga = estadoDeCarga(null, [], 'Este trabajo no es una obra por etapas');
  const lista = propuestas.datos?.items ?? [];
  return {
    id,
    carga,
    t: carga ? null : t,
    pagos: pagos.datos?.items ?? [],
    pedido: pedido.datos,
    propuestas: lista,
    pendientes: lista.filter((p) => p.estado === 'pendiente' && p.trabajoId === id && p.tipo !== 'cotizacion'),
    recargar: () => {
      trabajo.recargar();
      pagos.recargar();
      propuestas.recargar();
    },
  };
}

export function PestanasObra({ id, activa }: { id: string; activa: 'etapas' | 'pagos' | 'gastado' }) {
  return (
    <SelectorVistas
      etiqueta="Secciones de la obra"
      opciones={[
        { texto: 'Etapas', activa: activa === 'etapas', href: ruta('/obras/detalle/', { id }) },
        { texto: 'Pagos', activa: activa === 'pagos', href: ruta('/obras/pagos/', { id }) },
        { texto: 'Gastado', activa: activa === 'gastado', href: ruta('/obras/gastado/', { id }) },
      ]}
    />
  );
}
