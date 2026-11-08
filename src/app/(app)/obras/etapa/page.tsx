'use client';

import { useSearchParams } from 'next/navigation';
import { Barra, Pantalla } from '@/components/hx';
import { ruta } from '@/components/nav';
import { TEXTO_ETAPA, pagoVigente } from '@/components/Trabajo';
import { Aviso } from '@/components/ui';
import { useEnvio } from '@/data/hooks';
import { pesos } from '@/domain/dinero';
import { etiquetaPago } from '@/domain/etiquetas';
import { cuando } from '@/domain/fechas';
import { AccionesFijas, Avatar, Boton, Chip, DatoFila, Nota, Tarjeta } from '@/ui';
import { useObra } from '../compartido';

/** Una etapa de la obra: su estado, su monto y su pago. Se confirma cuando el especialista dice que terminó. */
export default function EtapaObra() {
  const etapaId = useSearchParams().get('etapa');
  const o = useObra({ cadaPagos: 4_000 });
  const accion = useEnvio();
  const { t } = o;
  if (o.carga || !t) return o.carga;
  const e = t.etapas.find((x) => x.id === etapaId);
  const volver = { href: ruta('/obras/detalle/', { id: t.id }), etiqueta: 'Volver a la obra' };
  if (!e)
    return (
      <Pantalla arriba={<Barra titulo="Etapa" volver={volver} />}>
        <div className="ds ds-cuerpo">
          <Nota icono="info">No encontramos esa etapa. Volvé a la obra y elegí otra.</Nota>
          <Boton href={volver.href}>Volver a la obra</Boton>
        </div>
      </Pantalla>
    );
  const esp = t.especialista.nombrePublico;
  const est = TEXTO_ETAPA[e.estado] ?? TEXTO_ETAPA.pendiente!;
  const pago = pagoVigente(o.pagos, e.id);
  const ep = pago ? etiquetaPago(pago) : null;

  async function confirmar() {
    const r = await accion.enviar(
      'etapaConfirmar',
      { parametros: { id: t!.id, etapaId: e!.id }, cuerpo: { version: e!.version } },
      `${e!.id}|${e!.version}`,
    );
    if (r?.ok) o.recargar();
  }

  return (
    <Pantalla
      arriba={<Barra titulo={`Etapa ${e.orden}`} volver={volver} sub={e.titulo} />}
      pie={
        <AccionesFijas>
          {e.estado === 'terminada_por_especialista' ? (
            <Boton icono="check" ocupado={accion.pendiente} onClick={() => void confirmar()}>
              Confirmar que terminó esta etapa
            </Boton>
          ) : e.estado === 'confirmada' && !pago ? (
            <Boton icono="billete" href={ruta('/trabajos/pago/', { id: t.id, etapa: e.id })}>
              Pagar {pesos(e.monto.centavos)}
            </Boton>
          ) : pago ? (
            <Boton icono="billete" href={ruta('/trabajos/pago/', { id: t.id, etapa: e.id })}>
              Ver el pago
            </Boton>
          ) : null}
          <Boton
            variante="contorno"
            icono="chat"
            href={ruta('/chats/conversacion/', { id: t.conversacionId })}
          >
            Escribirle a {esp}
          </Boton>
        </AccionesFijas>
      }
    >
      <div className="ds ds-cuerpo">
        <div className="ds-fila">
          <Avatar nombre={esp} tam={3} />
          <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.125rem' }}>
            <strong style={{ fontSize: '1.0625rem' }}>{esp}</strong>
            <span className="ds-fila-enlace__sub">Hace esta etapa</span>
          </span>
          <Chip tono={est.tono} icono={e.estado === 'confirmada' ? 'check' : 'reloj'}>
            {est.texto}
          </Chip>
        </div>
        <Tarjeta etiqueta="Lo que se paga por esta etapa">
          <DatoFila icono="obra" etiqueta={`Etapa ${e.orden}`} valor={e.titulo} />
          <DatoFila icono="billete" etiqueta="Monto de la etapa" valor={pesos(e.monto.centavos)} />
          {pago && ep ? (
            <DatoFila
              icono="etiqueta"
              etiqueta="Pago"
              valor={ep.texto}
              sub={pago.reportadoEn ? `Informado ${cuando(pago.reportadoEn)}` : undefined}
            />
          ) : null}
        </Tarjeta>
        {e.estado === 'terminada_por_especialista' ? (
          <Nota icono="alerta" tono="amarillo" rol="status">
            {esp} dice que terminó. Revisá que esté bien y confirmala: recién ahí se paga.
          </Nota>
        ) : e.estado === 'confirmada' ? (
          <Nota icono="check" tono="exito">
            Confirmaste esta etapa. Le pagás directo a {esp}.
          </Nota>
        ) : (
          <Nota icono="info" tono="gris">
            Las etapas se confirman cuando terminan: esta todavía no.
          </Nota>
        )}
        {accion.error ? <Aviso tipo="error">{accion.error.mensaje}</Aviso> : null}
      </div>
    </Pantalla>
  );
}
