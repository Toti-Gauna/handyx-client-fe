'use client';

import { useSearchParams } from 'next/navigation';
import { Barra, Pantalla } from '@/components/hx';
import { ruta, useIr } from '@/components/nav';
import { desglose, estadoDeCarga, etapasConfirmadas } from '@/components/Trabajo';
import { Aviso } from '@/components/ui';
import { useConsulta, useEnvio } from '@/data/hooks';
import { AccionesFijas, Boton, Nota, SelloListo, Tarjeta, Titulo } from '@/ui';
import { FilaTotal } from '@/ui/seguimiento';

/** Conformidad: con un toque confirmás que el trabajo terminó. Después se paga directo al especialista. */
export default function Conformidad() {
  const id = useSearchParams().get('id');
  const trabajo = useConsulta('trabajo', id ? { parametros: { id } } : null);
  const pedidoId = trabajo.datos?.pedidoId ?? null;
  const propuestas = useConsulta(
    'propuestas',
    pedidoId ? { parametros: { id: pedidoId }, consulta: { limite: 50 } } : null,
  );
  const accion = useEnvio();
  const ir = useIr();

  const carga = estadoDeCarga(id, [trabajo, propuestas]);
  const t = trabajo.datos;
  if (carga || !t || !propuestas.datos) return carga;

  const esp = t.especialista.nombrePublico;
  const d = desglose(t, propuestas.datos.items);
  const volver = { href: ruta('/trabajos/informe/', { id: t.id }), etiqueta: 'Volver al informe' };
  const puede = t.estado === 'terminado_por_especialista';
  const etapasListas = etapasConfirmadas(t) === t.etapas.length;

  async function confirmar() {
    const r = await accion.enviar(
      'trabajoConfirmarFin',
      { parametros: { id: t!.id }, cuerpo: { version: t!.version } },
      `${t!.version}`,
    );
    if (r?.ok) ir(ruta('/trabajos/pago/', { id: t!.id }), { reemplazar: true });
  }

  return (
    <Pantalla
      arriba={<Barra titulo="Conformidad" volver={volver} sub={esp} />}
      pie={
        <AccionesFijas>
          {puede && etapasListas ? (
            <>
              <Boton icono="pulgar" ocupado={accion.pendiente} onClick={() => void confirmar()}>
                Sí, quedó bien
              </Boton>
              <Boton
                variante="peligro"
                href={ruta('/reclamos/nuevo/', { pedido: t.pedidoId, trabajo: t.id })}
              >
                Hay un problema
              </Boton>
            </>
          ) : (
            <Boton href={ruta('/trabajos/detalle/', { id: t.id })}>Volver al trabajo</Boton>
          )}
        </AccionesFijas>
      }
    >
      <div className="ds ds-cuerpo">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <SelloListo tam={124} />
        </div>
        <div className="ds-pila" style={{ ['--ds-gap' as string]: '0.375rem' }}>
          <Titulo nivel={2} texto="¿Quedó ==arreglado==?" tam={2} />
          <p className="ds-sub">
            Con un toque confirmás que el trabajo terminó. Después le pagás directo a {esp}.
          </p>
        </div>
        <Tarjeta etiqueta="Lo que se paga">
          <FilaTotal texto="Acuerdo" centavos={d.acuerdo} />
          {d.adicional ? <FilaTotal texto="Adicional aprobado" centavos={d.adicional} /> : null}
          {d.tarifa ? <FilaTotal texto="Tarifa de Handyx" centavos={d.tarifa} /> : null}
          <FilaTotal texto={`A pagarle a ${esp}`} centavos={d.total} fuerte />
        </Tarjeta>
        {!puede ? (
          <Nota icono="info" rol="status">
            {t.estado === 'finalizado'
              ? 'Ya diste la conformidad de este trabajo.'
              : 'Todavía no se puede dar la conformidad: el especialista no terminó.'}
          </Nota>
        ) : !etapasListas ? (
          <Nota icono="alerta" tono="amarillo" rol="status">
            Primero confirmá cada etapa de la obra.
          </Nota>
        ) : null}
        {accion.error ? <Aviso tipo="error">{accion.error.mensaje}</Aviso> : null}
      </div>
    </Pantalla>
  );
}
