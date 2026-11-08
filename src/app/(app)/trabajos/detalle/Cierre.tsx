'use client';

import { Barra, Pantalla } from '@/components/hx';
import { Enlace, ruta } from '@/components/nav';
import {
  HistorialTrabajo,
  desglose,
  esObra,
  etapasConfirmadas,
  pagoVigente,
  textoPago,
} from '@/components/Trabajo';
import { RUBROS_INFO, etiquetaPago, etiquetaTrabajo } from '@/domain/etiquetas';
import { pesos } from '@/domain/dinero';
import {
  AccionesFijas,
  Boton,
  Chip,
  EscenaArreglado,
  FilaEnlace,
  Nota,
  SelloListo,
  Tarjeta,
  Titulo,
} from '@/ui';
import { PedidoAmarillo } from '@/ui/seguimiento';
import { AtajosTrabajo } from './AtajosTrabajo';
import { AvisoError } from './Avisos';
import type { ContextoTrabajo } from './contexto';

const VOLVER = { href: '/pedidos/', etiqueta: 'Volver a Actividad' };

/**
 * Cierre del trabajo: terminado por el especialista (revisar el informe y dar la conformidad), finalizado («¡Quedó
 * arreglado!» con el pago y la reseña) o cancelado.
 */
export function Cierre(c: ContextoTrabajo) {
  const { t, esp } = c;
  const rubro = c.pedido ? RUBROS_INFO[c.pedido.rubro].nombre : 'Trabajo';
  const finalizado = t.estado === 'finalizado';
  const cancelado = t.estado === 'cancelado';
  const obra = esObra(t);
  const etapasListas = etapasConfirmadas(t) === t.etapas.length;
  const pago = pagoVigente(c.pagos, null);
  const d = desglose(t, c.propuestas);

  const pie = cancelado ? (
    <AccionesFijas>
      <Boton href="/pedir/">Hacer un pedido nuevo</Boton>
    </AccionesFijas>
  ) : finalizado ? (
    <AccionesFijas>
      <Boton icono="billete" href={ruta(obra ? '/obras/pagos/' : '/trabajos/pago/', { id: t.id })}>
        {pago ? 'Ver el pago' : `Pagar a ${esp}`}
      </Boton>
      <Boton variante="contorno" icono="estrella" href={ruta('/trabajos/resena/', { id: t.id })}>
        Calificar a {esp}
      </Boton>
    </AccionesFijas>
  ) : (
    <AccionesFijas nota={etapasListas ? undefined : 'Primero confirmá cada etapa de la obra.'}>
      {etapasListas ? (
        <Boton icono="documento" href={ruta('/trabajos/informe/', { id: t.id })}>
          Ver el informe y dar la conformidad
        </Boton>
      ) : (
        <Boton icono="obra" href={ruta('/obras/detalle/', { id: t.id })}>
          Confirmar las etapas
        </Boton>
      )}
      <Boton
        variante="peligro"
        icono="alerta"
        href={ruta('/reclamos/nuevo/', { pedido: t.pedidoId, trabajo: t.id })}
      >
        Hay un problema
      </Boton>
    </AccionesFijas>
  );

  return (
    <Pantalla
      arriba={
        <Barra titulo={`${rubro} con ${esp}`} volver={VOLVER} sub={etiquetaTrabajo(t).texto} />
      }
      pie={pie}
    >
      <div className="ds">
        {finalizado ? (
          <div className="ds-escena-cabecera">
            <EscenaArreglado alto={260} />
          </div>
        ) : null}
        <div className="ds-cuerpo">
          {finalizado ? (
            <Titulo nivel={2} texto="¡Quedó ==arreglado==!" tam={2} />
          ) : cancelado ? (
            <Titulo nivel={2} texto="Trabajo ==cancelado==" tam={1.75} />
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <SelloListo tam={104} etiqueta="Terminó el trabajo" />
              </div>
              <Titulo nivel={2} texto={`${esp} ==terminó== el trabajo`} tam={1.75} />
            </>
          )}
          {t.estado === 'terminado_por_especialista' ? (
            <Nota icono="alerta" tono="amarillo" rol="status">
              Falta tu confirmación. Revisá que esté todo como se acordó. Si hay un problema,
              avisanos.
            </Nota>
          ) : null}
          {finalizado ? (
            <Nota icono="check" tono="exito">
              Lo confirmaste vos. Si falta algo, podés abrir un reclamo.
            </Nota>
          ) : null}
          {cancelado ? <Nota icono="info">Este trabajo se canceló.</Nota> : null}
          <PagoResumen c={c} total={d.total} pago={pago} />
          {obra ? (
            <PedidoAmarillo
              icono="obra"
              titulo="Obra por etapas"
              sub={`${etapasConfirmadas(t)} de ${t.etapas.length} etapas confirmadas`}
              href={ruta('/obras/detalle/', { id: t.id })}
            />
          ) : null}
          <AvisoError c={c} />
          {!cancelado ? (
            <FilaEnlace
              icono="documento"
              titulo="Informe del trabajo"
              sub="Qué encontró, pruebas, materiales y garantía"
              href={ruta('/trabajos/informe/', { id: t.id })}
            />
          ) : null}
          <AtajosTrabajo c={c} />
          <HistorialTrabajo eventos={c.eventos} />
          <Enlace
            className="dss-enlace-texto"
            href={ruta('/reclamos/nuevo/', { pedido: t.pedidoId, trabajo: t.id })}
          >
            Abrir un reclamo
          </Enlace>
        </div>
      </div>
    </Pantalla>
  );
}

function PagoResumen({
  c,
  total,
  pago,
}: {
  c: ContextoTrabajo;
  total: number;
  pago: ReturnType<typeof pagoVigente>;
}) {
  if (c.t.estado === 'cancelado' || c.t.estado === 'agendado') return null;
  const e = pago ? etiquetaPago(pago) : null;
  return (
    <Tarjeta etiqueta="Pago" tono="azul">
      <span className="ds-etiqueta" style={{ color: 'inherit' }}>
        {pago?.estado === 'verificado'
          ? 'PAGO VERIFICADO'
          : pago
            ? 'PAGO INFORMADO'
            : 'TOTAL A PAGAR'}
      </span>
      <strong className="ds-monto" style={{ ['--ds-tam' as string]: '2.125rem' }}>
        {pesos(total)}
      </strong>
      {e ? (
        <span>
          <Chip
            tono={pago?.estado === 'verificado' ? 'exito' : 'amarillo'}
            {...(e.icono ? { icono: e.icono } : {})}
          >
            {textoPago(pago!)}
          </Chip>
        </span>
      ) : null}
      <p className="ds-sub" style={{ margin: 0 }}>
        Directo a {c.esp}, por Mercado Pago o en efectivo. Un pago que informás vos queda
        “informado” hasta que se verifique.
      </p>
    </Tarjeta>
  );
}
