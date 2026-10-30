'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { BotonHx } from '@/components/acceso';
import { DeslizarConfirmar } from '@/components/Deslizar';
import { Barra, ChipEstado, Pantalla, entra } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { Enlace, ruta, useIr } from '@/components/nav';
import { Aviso, Boton, Cargando, ErrorEstado, Hoja, Vacio } from '@/components/ui';
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
  const [comprobante, setComprobante] = useState<string | null>(null);
  const objetivos: Objetivo[] = t.etapas.length
    ? t.etapas.map((e) => ({
        etapaId: e.id,
        titulo: `Etapa ${e.orden}: ${e.titulo}`,
        centavos: e.monto.centavos,
      }))
    : [{ etapaId: null, titulo: 'Trabajo completo', centavos: t.acuerdo.monto.centavos }];
  const ultimo = (o: Objetivo) => [...pagos].reverse().find((p) => p.etapaId === o.etapaId) ?? null;
  const puedePagar = ['en_curso', 'terminado_por_especialista', 'finalizado'].includes(t.estado);

  async function pagar(o: Objetivo): Promise<boolean> {
    const r = await accion.enviar(
      'pagoReportar',
      {
        parametros: { id: t.id },
        cuerpo: { metodo, montoCentavos: o.centavos, etapaId: o.etapaId },
      },
      `${o.etapaId}|${metodo}|${o.centavos}`,
    );
    if (!r?.ok) return false;
    if (metodo === 'efectivo') {
      setObjetivo(null);
      recargar();
      return true;
    }
    const c = await accion.enviar('pagoCheckout', { parametros: { id: r.datos.id } }, r.datos.id);
    if (!c?.ok) return false;
    // En la vista de prueba no se abre Mercado Pago de verdad: se pasa directo a la pantalla de retorno.
    if (esVistaDePrueba) ir(ruta('/pagos/retorno/', { id: r.datos.id }));
    else window.location.assign(c.datos.url);
    return true;
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
  const comprobanteDe = comprobante ? pagos.find((x) => x.id === comprobante) : null;
  const tituloDe = (etapaId: string | null) =>
    objetivos.find((o) => o.etapaId === etapaId)?.titulo ?? 'Trabajo completo';
  return (
    <Pantalla
      arriba={
        <Barra
          titulo="Pago al ==especialista=="
          volver={{ href: ruta('/trabajos/detalle/', { id: t.id }), etiqueta: 'Volver al trabajo' }}
          sub={t.especialista.nombrePublico}
          icono="usuario"
        />
      }
      clase="du-pago-pantalla"
    >
      <div className="du-cuerpo">
        <p className="du-nota" {...entra(1)}>
          <Icono nombre="billetera" />
          <span>
            <strong>Pagás directo, sin pasar por Handy.</strong> Le pagás al especialista, por
            Mercado Pago o en efectivo. Handy no recibe ni reparte ese dinero. La tarifa de Handy es{' '}
            {pesos(t.acuerdo.comisionHandy.importe.centavos)} (
            {porcentaje(t.acuerdo.comisionHandy.bp)}) durante la demo: el servicio se paga entero.
          </span>
        </p>
        {!puedePagar ? (
          <Aviso tipo="alerta">
            El pago se registra cuando el trabajo está en curso o terminado.
          </Aviso>
        ) : null}

        {objetivos.map((o, i) => {
          const p = ultimo(o);
          const cerrado = p !== null && ['pendiente', 'reportado', 'verificado'].includes(p.estado);
          return (
            <section
              key={o.etapaId ?? 'todo'}
              className="hd-ticket du-ticket du-ticket--pago"
              aria-label={o.titulo}
              {...entra(2 + i)}
            >
              <div className="hd-ticket__papel">
                <div className="du-ticket__total">
                  <small className="hd-sobre">{o.titulo}</small>
                  <span className="hd-precio hd-precio--grande">{pesos(o.centavos)}</span>
                  {p ? (
                    <ChipEstado e={etiquetaPago(p)} />
                  ) : (
                    <span className="hd-chip hd-chip--mini">Sin pago registrado</span>
                  )}
                </div>
                <div className="hd-ticket__corte" />
                <div className="du-ticket__abajo du-pago-objetivo">
                  {p ? (
                    <>
                      <p className="du-pago-objetivo__metodo">
                        <Icono nombre={p.metodo === 'efectivo' ? 'billetera' : 'tarjeta'} />
                        {p.metodo === 'efectivo'
                          ? 'Efectivo'
                          : 'Mercado Pago (directo al especialista)'}
                        {p.reportadoEn ? ` · ${cuando(p.reportadoEn)}` : ''}
                      </p>
                      <p className="du-pago-objetivo__explica">{EXPLICA[p.estado]}</p>
                      <button
                        type="button"
                        className="du-pago-objetivo__comprobante"
                        onClick={() => setComprobante(p.id)}
                      >
                        <Icono nombre="etiqueta" />
                        Ver comprobante
                      </button>
                    </>
                  ) : null}
                  {p?.estado === 'pendiente' && p.metodo === 'mercado_pago_directo' ? (
                    <Enlace
                      className="hd-boton hd-boton--claro"
                      href={ruta('/pagos/retorno/', { id: p.id })}
                    >
                      Ver el estado del pago
                    </Enlace>
                  ) : null}
                  {p?.estado === 'fallido' && p.metodo === 'mercado_pago_directo' ? (
                    <BotonHx
                      icono="reintentar"
                      cargando={accion.pendiente}
                      onClick={() => reintentar(p)}
                    >
                      Volver a intentar el pago
                    </BotonHx>
                  ) : null}
                  {puedePagar && !cerrado && p?.estado !== 'fallido' ? (
                    <BotonHx
                      variante="exito"
                      onClick={() => {
                        accion.limpiar();
                        setObjetivo(o);
                      }}
                    >
                      Pagar
                    </BotonHx>
                  ) : null}
                  {puedePagar && p?.estado === 'fallido' ? (
                    <BotonHx
                      variante="claro"
                      onClick={() => {
                        accion.limpiar();
                        setObjetivo(o);
                      }}
                    >
                      Pagar de otra forma
                    </BotonHx>
                  ) : null}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <Hoja abierta={objetivo !== null} onCerrar={() => setObjetivo(null)} titulo="¿Cómo le pagás?">
        {objetivo ? (
          <>
            <p className="du-pago-hoja__que">
              <strong>{objetivo.titulo}</strong> · {pesos(objetivo.centavos)}
            </p>
            <fieldset className="du-pagos du-pagos--elegir">
              <legend className="sr-only">Método de pago</legend>
              <label className="du-pago">
                <input
                  type="radio"
                  name="metodo"
                  checked={metodo === 'efectivo'}
                  onChange={() => setMetodo('efectivo')}
                />
                <span className="du-pago__ico">
                  <Icono nombre="billetera" />
                </span>
                <strong>Efectivo</strong>
                <small>Le pagás en mano. Queda “reportado” hasta que se verifique.</small>
              </label>
              <label className="du-pago">
                <input
                  type="radio"
                  name="metodo"
                  checked={metodo === 'mercado_pago_directo'}
                  onChange={() => setMetodo('mercado_pago_directo')}
                />
                <span className="du-pago__ico">
                  <Icono nombre="tarjeta" />
                </span>
                <strong>Mercado Pago</strong>
                <small>Directo al especialista. No pedimos ni guardamos datos de tu tarjeta.</small>
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
            <DeslizarConfirmar
              key={metodo}
              texto={metodo === 'efectivo' ? 'Deslizá si ya le pagaste' : 'Deslizá para ir a pagar'}
              textoCargando="Un momento…"
              cargando={accion.pendiente}
              onConfirmar={() => pagar(objetivo)}
            />
            <div className="acciones">
              <Boton
                variante="claro"
                cargando={accion.pendiente}
                onClick={() => void pagar(objetivo)}
              >
                {metodo === 'efectivo' ? 'Ya le pagué en efectivo' : 'Ir a Mercado Pago'}
              </Boton>
              <Boton variante="texto" onClick={() => setObjetivo(null)}>
                Volver
              </Boton>
            </div>
          </>
        ) : null}
      </Hoja>

      <Hoja
        abierta={comprobanteDe !== null && comprobanteDe !== undefined}
        onCerrar={() => setComprobante(null)}
        titulo="Comprobante del registro"
      >
        {comprobanteDe ? (
          <>
            <div className="hd-ticket du-ticket du-comprobante">
              <div className="hd-ticket__papel">
                <div className="du-ticket__total">
                  <small className="hd-sobre">{tituloDe(comprobanteDe.etapaId)}</small>
                  <span className="hd-precio hd-precio--grande">
                    {pesos(comprobanteDe.monto.centavos)}
                  </span>
                  <ChipEstado e={etiquetaPago(comprobanteDe)} />
                </div>
                <div className="hd-ticket__corte" />
                <dl className="du-ticket__abajo du-comprobante__datos">
                  <div className="hd-dato">
                    <dt>Especialista</dt>
                    <dd>{t.especialista.nombrePublico}</dd>
                  </div>
                  <div className="hd-dato">
                    <dt>Método</dt>
                    <dd>{comprobanteDe.metodo === 'efectivo' ? 'Efectivo' : 'Mercado Pago'}</dd>
                  </div>
                  <div className="hd-dato">
                    <dt>Registrado</dt>
                    <dd>{comprobanteDe.reportadoEn ? cuando(comprobanteDe.reportadoEn) : '—'}</dd>
                  </div>
                  <div className="hd-dato">
                    <dt>Verificado</dt>
                    <dd>
                      {comprobanteDe.verificadoEn
                        ? cuando(comprobanteDe.verificadoEn)
                        : 'Todavía no'}
                    </dd>
                  </div>
                  <div className="hd-dato">
                    <dt>Código</dt>
                    <dd className="codigo">{comprobanteDe.id.slice(-8).toUpperCase()}</dd>
                  </div>
                </dl>
              </div>
            </div>
            <p className="texto-suave">
              {EXPLICA[comprobanteDe.estado]} No es una factura: es el registro de Handyx de lo que
              se informó. La factura, si corresponde, la emite el especialista.
            </p>
            <div className="acciones">
              <Boton variante="claro" onClick={() => setComprobante(null)}>
                Cerrar
              </Boton>
            </div>
          </>
        ) : null}
      </Hoja>
    </Pantalla>
  );
}
