'use client';

import { useState } from 'react';
import { useEnvio } from '@/data/hooks';
import { resumirFee } from '@/domain/fee';
import { useSesion } from './SesionProvider';
import { Boton, Nota } from '@/ui';
import { Hoja } from './ui';

/**
 * Modal de primer ingreso (2 de 3 lugares del fee 0 %): demo cerrada, tarifa de Handy y reglas de pago.
 * Registra la versión aceptada; vuelve a aparecer solo si cambia la política.
 */
export function ModalFee() {
  const { fee, recargar } = useSesion();
  const { enviar, pendiente, error } = useEnvio();
  const [cerrado, setCerrado] = useState(false);
  const resumen = resumirFee(fee);
  if (resumen.tipo !== 'demo' || !fee?.vigente) return null;
  const vigente = fee.vigente;

  async function entendido() {
    const r = await enviar(
      'feeAceptar',
      { cuerpo: { politicaId: vigente.id, version: vigente.version } },
      vigente.version,
    );
    if (r?.ok) {
      setCerrado(true);
      recargar();
    }
  }

  return (
    <Hoja
      abierta={resumen.pendienteDeAceptar && !cerrado}
      onCerrar={() => undefined}
      titulo="Bienvenida a la demo de Handyx"
      cerrable={false}
    >
      <div className="ds ds-pila">
        <Nota icono="calendario">
          <strong>Demo cerrada.</strong> Del 10/11 al 10/12/2026, solo con invitación y en Mar del
          Plata.
        </Nota>
        <Nota icono="etiqueta" tono="exito">
          <strong>
            Tarifa de Handy: {resumen.porcentajeUsuario} hasta el {resumen.hasta}.
          </strong>{' '}
          No es un descuento sobre el precio del especialista: su servicio se paga entero.
        </Nota>
        <Nota icono="billetera" tono="gris">
          <strong>Pagás directo al especialista</strong>, por Mercado Pago o en efectivo. Handy no
          recibe ni reparte ese dinero.
        </Nota>
        <Nota icono="info" tono="gris">
          <strong>Después del {resumen.hasta}</strong> no se aplica ninguna tarifa sin que esté
          aprobada y te la avisemos antes.
        </Nota>
        {error ? (
          <Nota icono="alerta" tono="error" rol="alert">
            <strong>No pudimos registrarlo.</strong> {error.mensaje}
          </Nota>
        ) : null}
        <Boton ocupado={pendiente} onClick={() => void entendido()}>
          Entendido
        </Boton>
      </div>
    </Hoja>
  );
}
