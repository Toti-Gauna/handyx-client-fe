'use client';

import { Barra, Pantalla } from '@/components/hx';
import { ruta } from '@/components/nav';
import type { Trabajo } from '@/contracts/v1/propuestas';
import type { RegistroPago } from '@/contracts/v1/servicio';
import { pesos } from '@/domain/dinero';
import { etiquetaPago } from '@/domain/etiquetas';
import { cuando } from '@/domain/fechas';
import { AccionesFijas, Boton, DatoFila, Etapas, MosaicoIcono, Nota, Tarjeta, Titulo } from '@/ui';
import type { Objetivo } from './objetivos';

/**
 * Pago informado: lo que dijiste que pagaste. Informado no es verificado: queda verificado cuando otra fuente lo
 * confirma. Si es de Mercado Pago y no se confirmó, se consulta el estado real (volver del checkout no confirma).
 */
export function Informado({ t, objetivo, pago }: { t: Trabajo; objetivo: Objetivo; pago: RegistroPago }) {
  const esp = t.especialista.nombrePublico;
  const mp = pago.metodo === 'mercado_pago_directo';
  const verificado = pago.estado === 'verificado';
  const pendiente = pago.estado === 'pendiente';
  const volver = {
    href: ruta(t.etapas.length ? '/obras/pagos/' : '/trabajos/detalle/', { id: t.id }),
    etiqueta: t.etapas.length ? 'Volver a los pagos de la obra' : 'Volver al trabajo',
  };
  const monto = pesos(pago.monto.centavos);
  const titulo = verificado ? 'Pago ==verificado==' : pendiente ? 'Esperando ==Mercado Pago==' : 'Pago ==informado==';
  const sub = verificado
    ? `${esp} confirmó que recibió ${monto}.`
    : pendiente
      ? 'Todavía no recibimos la confirmación. Volver de Mercado Pago no alcanza para darlo por pagado.'
      : `Avisaste que le pagaste ${monto} ${mp ? 'por Mercado Pago' : 'en efectivo'} a ${esp}.`;
  const hechas = verificado ? 3 : pendiente ? 0 : 1;
  const e = etiquetaPago(pago);

  return (
    <Pantalla
      arriba={<Barra titulo="Pago" volver={volver} sub={objetivo.titulo} />}
      pie={
        <AccionesFijas>
          {pendiente && mp ? (
            <Boton icono="reintentar" href={ruta('/pagos/retorno/', { id: pago.id })}>
              Ver el estado del pago
            </Boton>
          ) : t.estado === 'finalizado' ? (
            <Boton icono="estrella" href={ruta('/trabajos/resena/', { id: t.id })}>
              Dejar una reseña
            </Boton>
          ) : null}
          <Boton variante="contorno" href={volver.href}>
            Listo
          </Boton>
        </AccionesFijas>
      }
    >
      <div className="ds ds-cuerpo">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <MosaicoIcono icono={mp ? 'tarjeta' : 'efectivo'} tam={5.25} />
        </div>
        <div className="ds-pila" style={{ ['--ds-gap' as string]: '0.375rem' }}>
          <Titulo nivel={2} texto={titulo} tam={2} />
          <p className="ds-sub" role="status">
            {sub}
          </p>
        </div>
        <Tarjeta etiqueta="Cómo sigue">
          <Etapas
            etiqueta="Cómo sigue el pago"
            hechas={hechas}
            pasos={[
              { titulo: 'Vos informaste el pago', sub: pago.reportadoEn ? cuando(pago.reportadoEn) : '' },
              { titulo: `${esp} confirma que lo recibió`, sub: 'Le avisamos' },
              { titulo: 'Pago verificado', sub: pago.verificadoEn ? cuando(pago.verificadoEn) : 'Queda en tu historial' },
            ]}
          />
        </Tarjeta>
        <Nota icono="info" tono="gris">
          Informado no es verificado: el pago queda verificado cuando {esp} o el equipo de Handyx lo confirman.
        </Nota>
        <Tarjeta etiqueta="Comprobante">
          <DatoFila icono="etiqueta" etiqueta="Estado" valor={e.texto} />
          <DatoFila icono="billete" etiqueta="Método" valor={mp ? 'Mercado Pago' : 'Efectivo'} />
          <DatoFila icono="etiqueta" etiqueta="Código" valor={pago.id.slice(-8).toUpperCase()} />
          <p className="ds-fila-enlace__sub" style={{ margin: 0 }}>
            No es una factura: es el registro de Handyx de lo que se informó. La factura, si
            corresponde, la emite {esp}.
          </p>
        </Tarjeta>
      </div>
    </Pantalla>
  );
}
