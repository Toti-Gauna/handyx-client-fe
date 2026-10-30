'use client';

import { useSearchParams } from 'next/navigation';
import { Enlace, ruta } from '@/components/nav';
import { BotonHx, Escena, Flujo } from '@/components/acceso';
import { Icono } from '@/components/Icono';
import { Aviso, Cargando, ErrorEstado, Vacio } from '@/components/ui';
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
  if (pago.estado === 'cargando')
    return <Cargando texto="Consultando el estado de tu pago…" forma="detalle" />;
  if (pago.estado === 'error' && pago.error)
    return <ErrorEstado error={pago.error} onReintentar={pago.recargar} />;
  const p = pago.datos;
  if (!p) return null;
  const vista =
    p.estado === 'verificado'
      ? {
          titulo: 'Pago ==confirmado==',
          handy: { img: 'handy-lamparita', ancho: 202, alto: 346 },
          tono: 'amarillo' as const,
          texto: `Mercado Pago confirmó el pago de ${pesos(p.monto.centavos)} al especialista.`,
        }
      : p.estado === 'fallido'
        ? {
            titulo: 'El pago no se ==completó==',
            handy: { img: 'handy-engranaje-roto', ancho: 338, alto: 339 },
            tono: 'azul' as const,
            texto:
              'No se debitó nada de esta operación. Podés volver a intentar o pagar en efectivo.',
          }
        : p.estado === 'cancelado'
          ? {
              titulo: 'Cancelaste el ==pago==',
              handy: { img: 'handy-gota', ancho: 93, alto: 125 },
              tono: 'azul' as const,
              texto: 'No se hizo ningún cobro.',
            }
          : {
              titulo: 'Todavía no está ==confirmado==',
              handy: { img: 'handy-engranaje', ancho: 338, alto: 339 },
              tono: 'azul' as const,
              texto:
                'Volver de Mercado Pago no confirma el pago: esperamos que el proveedor lo confirme. Esto puede tardar unos minutos.',
            };

  return (
    <Flujo
      titulo={vista.titulo}
      atras={{
        href: ruta('/trabajos/detalle/', { id: p.trabajoId }),
        etiqueta: 'Volver al trabajo',
      }}
      ilustracion={
        <Escena
          handy={vista.handy.img}
          ancho={vista.handy.ancho}
          alto={vista.handy.alto}
          tono={vista.tono}
          tilde={p.estado === 'verificado'}
        />
      }
      pie={
        <>
          {p.estado === 'fallido' ? (
            <BotonHx
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
            </BotonHx>
          ) : null}
          <Enlace
            className={p.estado === 'fallido' ? 'hd-boton hd-boton--fantasma' : 'hd-boton'}
            href={ruta('/trabajos/detalle/', { id: p.trabajoId })}
          >
            Volver al trabajo
          </Enlace>
          <Enlace
            className="hd-boton hd-boton--fantasma"
            href={ruta('/trabajos/pago/', { id: p.trabajoId })}
          >
            Ver los pagos del trabajo
          </Enlace>
        </>
      }
    >
      <p className="du-retorno-hx__texto" role="status">
        {vista.texto}
      </p>
      {p.estado === 'pendiente' ? (
        <p className="du-nota">
          <Icono nombre="info" />
          <span>
            Seguimos consultando. Si ya pagaste y no se actualiza, no pagues de nuevo: avisale al
            especialista.
          </span>
        </p>
      ) : null}
      {esVistaDePrueba && p.estado === 'pendiente' ? (
        <Aviso tipo="info" titulo="Vista de prueba">
          Usá el panel de prueba para simular que Mercado Pago confirma o rechaza el pago.
        </Aviso>
      ) : null}
      {accion.error ? <Aviso tipo="error">{accion.error.mensaje}</Aviso> : null}
    </Flujo>
  );
}
