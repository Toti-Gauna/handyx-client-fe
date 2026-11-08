'use client';

import { useState } from 'react';
import { Barra, Pantalla } from '@/components/hx';
import { ruta, useIr } from '@/components/nav';
import { Aviso } from '@/components/ui';
import type { Trabajo } from '@/contracts/v1/propuestas';
import type { RegistroPago } from '@/contracts/v1/servicio';
import { esVistaDePrueba } from '@/data';
import { useEnvio } from '@/data/hooks';
import { pesos, porcentaje } from '@/domain/dinero';
import { AccionesFijas, Avatar, Boton, Chip, Etiqueta, Nota, Opcion, Tarjeta } from '@/ui';
import { FilaTotal } from '@/ui/seguimiento';
import type { Objetivo } from './objetivos';

type Metodo = 'mercado_pago_directo' | 'efectivo';

const PASOS: Record<Metodo, (esp: string) => string[]> = {
  mercado_pago_directo: (esp) => [
    `Pagás en Mercado Pago, directo a ${esp}.`,
    'Volver a la app no confirma nada: esperamos el aviso de Mercado Pago.',
    'Cuando llega, el pago queda verificado en tu historial.',
  ],
  efectivo: (esp) => [
    `Le pagás en mano a ${esp}.`,
    'Lo informás acá: queda informado, todavía no verificado.',
    `Cuando ${esp} lo confirma, queda verificado en tu historial.`,
  ],
};

/** Pagar: a quién, cuánto, cómo y qué pasa después, en ese orden y con un solo botón principal. */
export function Elegir({
  t,
  objetivo,
  objetivos,
  pagos,
  recargar,
}: {
  t: Trabajo;
  objetivo: Objetivo;
  objetivos: readonly Objetivo[];
  pagos: readonly RegistroPago[];
  recargar: () => void;
}) {
  const ir = useIr();
  const accion = useEnvio();
  const [metodo, setMetodo] = useState<Metodo>('efectivo');
  const esp = t.especialista.nombrePublico;
  const d = objetivo.desglose;
  const bp = t.acuerdo.comisionHandy.bp;
  const fallido = pagos.some((p) => p.etapaId === objetivo.etapaId && p.estado === 'fallido');
  const volver = {
    href: ruta(t.etapas.length ? '/obras/pagos/' : '/trabajos/detalle/', { id: t.id }),
    etiqueta: t.etapas.length ? 'Volver a los pagos de la obra' : 'Volver al trabajo',
  };
  const sinGate = accion.error?.codigo !== 'funcion_inactiva';

  async function pagar() {
    const r = await accion.enviar(
      'pagoReportar',
      {
        parametros: { id: t.id },
        cuerpo: { metodo, montoCentavos: objetivo.centavos, etapaId: objetivo.etapaId },
      },
      `${objetivo.etapaId}|${metodo}|${objetivo.centavos}`,
    );
    if (!r?.ok) return;
    if (metodo === 'efectivo') return recargar();
    const c = await accion.enviar('pagoCheckout', { parametros: { id: r.datos.id } }, r.datos.id);
    if (!c?.ok) return;
    // En la vista de prueba no se abre Mercado Pago de verdad: se pasa directo a la pantalla de retorno.
    if (esVistaDePrueba) ir(ruta('/pagos/retorno/', { id: r.datos.id }));
    else window.location.assign(c.datos.url);
  }

  return (
    <Pantalla
      arriba={<Barra titulo="Pagar" volver={volver} sub={objetivo.titulo} />}
      pie={
        objetivo.pagable ? (
          <AccionesFijas>
            <Boton
              icono={metodo === 'efectivo' ? 'efectivo' : 'tarjeta'}
              ocupado={accion.pendiente}
              onClick={() => void pagar()}
            >
              {metodo === 'efectivo'
                ? `Ya le pagué ${pesos(objetivo.centavos)} en efectivo`
                : `Pagar ${pesos(objetivo.centavos)} con Mercado Pago`}
            </Boton>
          </AccionesFijas>
        ) : (
          <AccionesFijas>
            <Boton href={volver.href}>{volver.etiqueta}</Boton>
          </AccionesFijas>
        )
      }
    >
      <div className="ds ds-cuerpo">
        <Tarjeta tono="azul" etiqueta="Resumen del pago">
          <div className="ds-fila">
            <Avatar nombre={esp} tam={2.75} />
            <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: 0 }}>
              <span className="dss-claro" style={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                Le pagás a
              </span>
              <strong style={{ fontSize: '1.0625rem' }}>{esp}</strong>
            </span>
            {t.estado === 'finalizado' ? (
              <Chip tono="amarillo" icono="check">
                Conformidad dada
              </Chip>
            ) : null}
          </div>
          {d ? (
            <>
              <FilaTotal texto="Acuerdo" centavos={d.acuerdo} suave />
              {d.adicional ? (
                <FilaTotal texto="Adicional aprobado" centavos={d.adicional} suave />
              ) : null}
              {d.tarifa ? (
                <FilaTotal
                  texto={`Tarifa de Handyx (${porcentaje(bp)})`}
                  centavos={d.tarifa}
                  suave
                />
              ) : null}
            </>
          ) : (
            <p style={{ margin: 0 }}>{objetivo.titulo}</p>
          )}
          <FilaTotal texto="Total" centavos={objetivo.centavos} fuerte />
        </Tarjeta>

        {!objetivo.pagable ? (
          <Nota icono="info" tono="amarillo" rol="status">
            {t.etapas.length
              ? 'Esta etapa se paga cuando la confirmás terminada.'
              : 'El pago se registra cuando el trabajo está en curso o terminado.'}
          </Nota>
        ) : (
          <>
            {objetivos.length > 1 ? (
              <Nota icono="info">
                Estás pagando: <strong>{objetivo.titulo}</strong>.
              </Nota>
            ) : null}
            {fallido ? (
              <Nota icono="alerta" tono="amarillo" rol="status">
                El intento anterior no se pudo completar. Podés volver a intentar.
              </Nota>
            ) : null}
            <Etiqueta como="h2">¿Cómo le pagás?</Etiqueta>
            <div className="ds-pila" role="radiogroup" aria-label="Cómo le pagás">
              <Opcion
                icono="tarjeta"
                titulo="Mercado Pago"
                sub={`Te llevamos al cobro de ${esp}`}
                elegida={metodo === 'mercado_pago_directo'}
                onElegir={() => setMetodo('mercado_pago_directo')}
              />
              <Opcion
                icono="efectivo"
                titulo="Efectivo"
                sub="Le pagás en mano y lo informás acá"
                elegida={metodo === 'efectivo'}
                onElegir={() => setMetodo('efectivo')}
              />
            </div>
            {metodo === 'efectivo' ? (
              <Nota icono="alerta" tono="amarillo">
                Informá el pago solo si ya se lo diste a {esp}.
              </Nota>
            ) : null}
            {!sinGate ? (
              <Aviso tipo="alerta" titulo="Mercado Pago todavía no está habilitado">
                Podés pagar en efectivo. Te avisamos cuando se habilite.
              </Aviso>
            ) : accion.error ? (
              <Aviso tipo="error">{accion.error.mensaje}</Aviso>
            ) : null}
            <ol className="dss-pasos" aria-label="Qué pasa después">
              {PASOS[metodo](esp).map((p, i) => (
                <li key={p}>
                  <b aria-hidden="true">{i + 1}</b>
                  <span>{p}</span>
                </li>
              ))}
            </ol>
          </>
        )}
        <p className="ds-fila-enlace__sub" style={{ margin: 0 }}>
          Handyx no recibe ni reparte la plata.{' '}
          {bp === 0
            ? 'Tarifa de servicio: 0 % hasta el 10/12/2026.'
            : `Tarifa de Handyx: ${porcentaje(bp)}.`}
        </p>
      </div>
    </Pantalla>
  );
}
