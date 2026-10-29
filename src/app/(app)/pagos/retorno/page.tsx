'use client';

import { useSearchParams } from 'next/navigation';
import { Enlace, ruta } from '@/components/nav';
import { Titulo } from '@/components/Titulo';
import { Aviso, Boton, Cargando, ErrorEstado, Vacio } from '@/components/ui';
import { useConsulta, useEnvio } from '@/data/hooks';
import { esVistaDePrueba } from '@/data';
import { pesos } from '@/domain/dinero';

/** Volver de la URL de checkout NO confirma el pago: se consulta el estado real al servidor. */
export default function RetornoPago() {
  const id = useSearchParams().get('id');
  const pago = useConsulta('pago', id ? { parametros: { id } } : null, { cada: 3_000 });
  const accion = useEnvio();
  if (!id)
    return (
      <Vacio titulo="Falta el pago">
        <Enlace className="boton boton--chico" href="/pedidos/">
          Ver mis pedidos
        </Enlace>
      </Vacio>
    );
  if (pago.estado === 'cargando') return <Cargando texto="Consultando el estado de tu pago…" />;
  if (pago.estado === 'error' && pago.error)
    return <ErrorEstado error={pago.error} onReintentar={pago.recargar} />;
  const p = pago.datos;
  if (!p) return null;
  const volver = (
    <Enlace className="boton" href={ruta('/trabajos/detalle/', { id: p.trabajoId })}>
      Volver al trabajo
    </Enlace>
  );

  return (
    <>
      <Titulo texto="Tu ==pago==" />
      {p.estado === 'verificado' ? (
        <Aviso tipo="ok" titulo="Pago confirmado" rol="status">
          Mercado Pago confirmó el pago de {pesos(p.monto.centavos)} al especialista.
        </Aviso>
      ) : p.estado === 'fallido' ? (
        <Aviso tipo="error" titulo="El pago no se completó" rol="status">
          No se debitó nada de esta operación. Podés volver a intentar o pagar en efectivo.
        </Aviso>
      ) : p.estado === 'cancelado' ? (
        <Aviso tipo="info" titulo="Cancelaste el pago" rol="status">
          No se hizo ningún cobro.
        </Aviso>
      ) : (
        <Aviso tipo="alerta" titulo="Todavía no está confirmado" rol="status">
          <p>
            Volver de Mercado Pago no confirma el pago: esperamos que el proveedor lo confirme. Esto
            puede tardar unos minutos.
          </p>
          <p>
            Seguimos consultando. Si ya pagaste y no se actualiza, no pagues de nuevo: avisale al
            especialista.
          </p>
        </Aviso>
      )}
      {esVistaDePrueba && p.estado === 'pendiente' ? (
        <Aviso tipo="info" titulo="Vista de prueba">
          Usá el panel de prueba para simular que Mercado Pago confirma o rechaza el pago.
        </Aviso>
      ) : null}
      {accion.error ? <Aviso tipo="error">{accion.error.mensaje}</Aviso> : null}
      <div className="acciones">
        {p.estado === 'fallido' ? (
          <Boton
            icono="reintentar"
            cargando={accion.pendiente}
            onClick={async () => {
              const c = await accion.enviar(
                'pagoCheckout',
                { parametros: { id: p.id } },
                `${p.id}|${p.version}`,
              );
              if (c?.ok) pago.recargar();
            }}
          >
            Volver a intentar
          </Boton>
        ) : null}
        {volver}
        <Enlace className="boton boton--claro" href={ruta('/trabajos/pago/', { id: p.trabajoId })}>
          Ver los pagos del trabajo
        </Enlace>
      </div>
    </>
  );
}
