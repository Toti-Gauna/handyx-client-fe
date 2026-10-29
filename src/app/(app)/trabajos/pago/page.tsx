'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Enlace, ruta, useIr } from '@/components/nav';
import { Titulo } from '@/components/Titulo';
import { Aviso, Boton, Cargando, Datos, ErrorEstado, Hoja, Pastilla, Vacio } from '@/components/ui';
import type { Trabajo } from '@/contracts/v1/propuestas';
import type { RegistroPago } from '@/contracts/v1/servicio';
import { esVistaDePrueba } from '@/data';
import { useConsulta, useEnvio } from '@/data/hooks';
import { pesos, porcentaje } from '@/domain/dinero';
import { etiquetaPago } from '@/domain/etiquetas';
import { cuando } from '@/domain/fechas';

type Metodo = 'mercado_pago_directo' | 'efectivo';
interface Objetivo {
  readonly etapaId: string | null;
  readonly titulo: string;
  readonly centavos: number;
}

const EXPLICA: Record<string, string> = {
  pendiente:
    'Todavía no se confirmó. Volver de Mercado Pago no alcanza: esperamos la confirmación del proveedor.',
  reportado:
    'Lo registraste vos. Pasa a “verificado” cuando el especialista o el equipo de Handy lo confirman.',
  verificado: 'Confirmado por una fuente distinta de tu reporte.',
  fallido: 'No se pudo completar. Podés volver a intentar.',
  cancelado: 'Se canceló.',
};

export default function Pago() {
  const id = useSearchParams().get('id');
  const trabajo = useConsulta('trabajo', id ? { parametros: { id } } : null, { cada: 6_000 });
  const pagos = useConsulta('pagos', id ? { parametros: { id } } : null, { cada: 4_000 });
  if (!id)
    return (
      <Vacio titulo="Falta el trabajo">
        <Enlace className="boton boton--chico" href="/pedidos/">
          Ver mis pedidos
        </Enlace>
      </Vacio>
    );
  const error = trabajo.error ?? pagos.error;
  if (error)
    return (
      <ErrorEstado
        error={error}
        onReintentar={() => {
          trabajo.recargar();
          pagos.recargar();
        }}
      />
    );
  if (!trabajo.datos || !pagos.datos) return <Cargando />;
  return <Contenido t={trabajo.datos} pagos={pagos.datos.items} recargar={pagos.recargar} />;
}

function Contenido({
  t,
  pagos,
  recargar,
}: {
  t: Trabajo;
  pagos: RegistroPago[];
  recargar: () => void;
}) {
  const ir = useIr();
  const accion = useEnvio();
  const [objetivo, setObjetivo] = useState<Objetivo | null>(null);
  const [metodo, setMetodo] = useState<Metodo>('efectivo');
  const objetivos: Objetivo[] = t.etapas.length
    ? t.etapas.map((e) => ({
        etapaId: e.id,
        titulo: `Etapa ${e.orden}: ${e.titulo}`,
        centavos: e.monto.centavos,
      }))
    : [{ etapaId: null, titulo: 'Trabajo completo', centavos: t.acuerdo.monto.centavos }];
  const ultimo = (o: Objetivo) => [...pagos].reverse().find((p) => p.etapaId === o.etapaId) ?? null;
  const puedePagar = ['en_curso', 'terminado_por_especialista', 'finalizado'].includes(t.estado);

  async function pagar(o: Objetivo) {
    const r = await accion.enviar(
      'pagoReportar',
      {
        parametros: { id: t.id },
        cuerpo: { metodo, montoCentavos: o.centavos, etapaId: o.etapaId },
      },
      `${o.etapaId}|${metodo}|${o.centavos}`,
    );
    if (!r?.ok) return;
    if (metodo === 'efectivo') {
      setObjetivo(null);
      recargar();
      return;
    }
    const c = await accion.enviar('pagoCheckout', { parametros: { id: r.datos.id } }, r.datos.id);
    if (!c?.ok) return;
    // En la vista de prueba no se abre Mercado Pago de verdad: se pasa directo a la pantalla de retorno.
    if (esVistaDePrueba) ir(ruta('/pagos/retorno/', { id: r.datos.id }));
    else window.location.assign(c.datos.url);
  }
  async function reintentar(p: RegistroPago) {
    const c = await accion.enviar(
      'pagoCheckout',
      { parametros: { id: p.id } },
      `${p.id}|${p.version}`,
    );
    if (c?.ok) {
      if (esVistaDePrueba) ir(ruta('/pagos/retorno/', { id: p.id }));
      else window.location.assign(c.datos.url);
    }
  }

  const gate = accion.error?.codigo === 'funcion_inactiva';
  return (
    <>
      <Titulo texto="Pago al ==especialista==" />
      <p>
        <Enlace className="enlace-tarjeta" href={ruta('/trabajos/detalle/', { id: t.id })}>
          ← Volver al trabajo
        </Enlace>
      </p>
      <Aviso tipo="info" titulo="Pagás directo, sin pasar por Handy">
        <p>
          Le pagás al especialista, por Mercado Pago o en efectivo. Handy no recibe ni reparte ese
          dinero.
        </p>
        <p>
          La comisión de Handy es <strong>{pesos(t.acuerdo.comisionHandy.importe.centavos)}</strong>{' '}
          ({porcentaje(t.acuerdo.comisionHandy.bp)}) durante la demo. Eso no significa que el
          trabajo sea gratis: el servicio se paga entero.
        </p>
      </Aviso>
      {!puedePagar ? (
        <Aviso tipo="alerta">
          El pago se registra cuando el trabajo está en curso o terminado.
        </Aviso>
      ) : null}

      {objetivos.map((o) => {
        const p = ultimo(o);
        const e = p ? etiquetaPago(p) : null;
        const cerrado = p !== null && ['pendiente', 'reportado', 'verificado'].includes(p.estado);
        return (
          <section key={o.etapaId ?? 'todo'} className="tarjeta" aria-label={o.titulo}>
            <div className="tarjeta__cuerpo">
              <div className="tarjeta__fila">
                <strong className="tarjeta__titulo" style={{ margin: 0 }}>
                  {o.titulo}
                </strong>
                {e ? (
                  <Pastilla tono={e.tono} {...(e.icono ? { icono: e.icono } : {})}>
                    {e.texto}
                  </Pastilla>
                ) : (
                  <Pastilla tono="gris">Sin pago registrado</Pastilla>
                )}
              </div>
              <p className="importe" style={{ margin: '6px 0' }}>
                {pesos(o.centavos)}
              </p>
              {p ? (
                <>
                  <Datos
                    filas={[
                      [
                        'Método',
                        p.metodo === 'efectivo'
                          ? 'Efectivo'
                          : 'Mercado Pago (directo al especialista)',
                      ],
                      ['Registrado', p.reportadoEn ? cuando(p.reportadoEn) : '—'],
                      ['Verificado', p.verificadoEn ? cuando(p.verificadoEn) : 'Todavía no'],
                    ]}
                  />
                  <p className="texto-suave" style={{ margin: '8px 0 0' }}>
                    {EXPLICA[p.estado]}
                  </p>
                </>
              ) : null}
              <div className="acciones">
                {p?.estado === 'pendiente' && p.metodo === 'mercado_pago_directo' ? (
                  <Enlace
                    className="boton boton--claro"
                    href={ruta('/pagos/retorno/', { id: p.id })}
                  >
                    Ver el estado del pago
                  </Enlace>
                ) : null}
                {p?.estado === 'fallido' && p.metodo === 'mercado_pago_directo' ? (
                  <Boton
                    icono="reintentar"
                    cargando={accion.pendiente}
                    onClick={() => reintentar(p)}
                  >
                    Volver a intentar el pago
                  </Boton>
                ) : null}
                {puedePagar && !cerrado && p?.estado !== 'fallido' ? (
                  <Boton
                    onClick={() => {
                      accion.limpiar();
                      setObjetivo(o);
                    }}
                  >
                    Pagar
                  </Boton>
                ) : null}
                {puedePagar && p?.estado === 'fallido' ? (
                  <Boton
                    variante="claro"
                    onClick={() => {
                      accion.limpiar();
                      setObjetivo(o);
                    }}
                  >
                    Pagar de otra forma
                  </Boton>
                ) : null}
              </div>
            </div>
          </section>
        );
      })}

      <Hoja abierta={objetivo !== null} onCerrar={() => setObjetivo(null)} titulo="¿Cómo le pagás?">
        {objetivo ? (
          <>
            <p>
              <strong>{objetivo.titulo}</strong> · {pesos(objetivo.centavos)}
            </p>
            <fieldset style={{ border: 0, padding: 0 }}>
              <legend className="sr-only">Método de pago</legend>
              <label className="opcion">
                <input
                  type="radio"
                  name="metodo"
                  checked={metodo === 'efectivo'}
                  onChange={() => setMetodo('efectivo')}
                />
                <span>
                  <span className="opcion__titulo">Efectivo</span>
                  <span className="opcion__texto">
                    Le pagás en mano. Lo registramos como “reportado” hasta que se verifique.
                  </span>
                </span>
              </label>
              <label className="opcion">
                <input
                  type="radio"
                  name="metodo"
                  checked={metodo === 'mercado_pago_directo'}
                  onChange={() => setMetodo('mercado_pago_directo')}
                />
                <span>
                  <span className="opcion__titulo">Mercado Pago</span>
                  <span className="opcion__texto">
                    Pagás en el sitio de Mercado Pago, directo al especialista. No pedimos ni
                    guardamos datos de tu tarjeta.
                  </span>
                </span>
              </label>
            </fieldset>
            {gate ? (
              <Aviso tipo="alerta" titulo="Mercado Pago todavía no está habilitado">
                Podés pagar en efectivo. Te avisamos cuando se habilite.
              </Aviso>
            ) : accion.error ? (
              <Aviso tipo="error">{accion.error.mensaje}</Aviso>
            ) : null}
            {metodo === 'efectivo' ? (
              <Aviso tipo="alerta">Registrá el pago solo si ya se lo diste al especialista.</Aviso>
            ) : null}
            <div className="acciones">
              <Boton cargando={accion.pendiente} onClick={() => pagar(objetivo)}>
                {metodo === 'efectivo' ? 'Ya le pagué en efectivo' : 'Ir a Mercado Pago'}
              </Boton>
              <Boton variante="claro" onClick={() => setObjetivo(null)}>
                Volver
              </Boton>
            </div>
          </>
        ) : null}
      </Hoja>
    </>
  );
}
