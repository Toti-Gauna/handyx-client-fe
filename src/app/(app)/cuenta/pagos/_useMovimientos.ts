'use client';

import { useEffect, useState } from 'react';
import type { Trabajo } from '@/contracts/v1/propuestas';
import type { RegistroPago } from '@/contracts/v1/servicio';
import { cliente } from '@/data';
import { ErrorCliente } from '@/data/cliente';
import { avisarSiSesion } from '@/data/hooks';

export interface Movimiento {
  readonly pago: RegistroPago;
  readonly trabajo: Trabajo;
}

/** Los pagos de cada trabajo (el contrato los da por trabajo): se piden juntos y se ordenan del más nuevo al más viejo. */
export function useMovimientos(trabajos: readonly Trabajo[] | null) {
  const [estado, setEstado] = useState<{
    clave: string;
    lista: readonly Movimiento[] | null;
    error: ErrorCliente | null;
  } | null>(null);
  const [vuelta, setVuelta] = useState(0);
  const clave = trabajos ? `${trabajos.map((t) => t.id).join(',')}|${vuelta}` : null;

  useEffect(() => {
    if (!trabajos || !clave) return;
    let activa = true;
    Promise.all(
      trabajos.map((t) =>
        cliente
          .llamar('pagos', { parametros: { id: t.id } })
          .then((r) => r.items.map((pago) => ({ pago, trabajo: t }))),
      ),
    )
      .then((grupos) => {
        const fecha = (m: Movimiento) =>
          m.pago.verificadoEn ?? m.pago.reportadoEn ?? m.trabajo.creadoEn;
        if (activa)
          setEstado({
            clave,
            lista: grupos.flat().sort((a, b) => fecha(b).localeCompare(fecha(a))),
            error: null,
          });
      })
      .catch((e: unknown) => {
        if (!activa) return;
        const error =
          e instanceof ErrorCliente
            ? e
            : new ErrorCliente({
                codigo: 'error_interno',
                mensaje: 'No pudimos cargar tus pagos.',
              });
        avisarSiSesion(error);
        setEstado({ clave, lista: null, error });
      });
    return () => {
      activa = false;
    };
  }, [trabajos, clave]);

  const vigente = estado?.clave === clave ? estado : null;
  return {
    lista: vigente?.lista ?? null,
    error: vigente?.error ?? null,
    recargar: () => setVuelta((v) => v + 1),
  };
}
