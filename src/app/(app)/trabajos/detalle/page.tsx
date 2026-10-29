'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Enlace, ruta } from '@/components/nav';
import { Desglose, PerfilProfesional } from '@/components/Propuesta';
import { Encabezado } from '@/components/Titulo';
import { Aviso, Boton, Cargando, Datos, ErrorEstado, Hoja, Pastilla, Vacio } from '@/components/ui';
import type { Trabajo } from '@/contracts/v1/propuestas';
import { useConsulta, useEnvio } from '@/data/hooks';
import { pesos } from '@/domain/dinero';
import { ACTOR_TEXTO, RUBROS_INFO, etiquetaPago, etiquetaTrabajo } from '@/domain/etiquetas';
import { cuando } from '@/domain/fechas';

const MOTIVOS = [
  { id: 'cambio_de_planes', texto: 'Cambié de planes' },
  { id: 'no_se_presento', texto: 'El especialista no se presentó' },
  { id: 'otro', texto: 'Otro motivo' },
] as const;
const ESTADO_ETAPA: Record<string, { texto: string; tono: 'azul' | 'gris' | 'ok' | 'alerta' }> = {
  pendiente: { texto: 'Pendiente', tono: 'gris' },
  en_curso: { texto: 'En curso', tono: 'azul' },
  terminada_por_especialista: { texto: 'Falta tu confirmación', tono: 'alerta' },
  confirmada: { texto: 'Confirmada', tono: 'ok' },
};

export default function DetalleTrabajo() {
  const id = useSearchParams().get('id');
  const trabajo = useConsulta('trabajo', id ? { parametros: { id } } : null, { cada: 4_000 });
  const eventos = useConsulta(
    'trabajoEventos',
    id ? { parametros: { id }, consulta: { limite: 50 } } : null,
    { cada: 6_000 },
  );
  const pagos = useConsulta('pagos', id ? { parametros: { id } } : null, { cada: 8_000 });
  const pedidoId = trabajo.datos?.pedidoId ?? null;
  const pedido = useConsulta('pedido', pedidoId ? { parametros: { id: pedidoId } } : null);
  const propuestas = useConsulta(
    'propuestas',
    pedidoId ? { parametros: { id: pedidoId }, consulta: { limite: 50 } } : null,
    { cada: 6_000 },
  );
  const accion = useEnvio();
  const [hoja, setHoja] = useState<'cancelar' | 'terminar' | null>(null);
  const [motivo, setMotivo] = useState<(typeof MOTIVOS)[number]['id']>('cambio_de_planes');

  if (!id)
    return (
      <Vacio titulo="Falta el trabajo">
        <Enlace className="boton boton--chico" href="/pedidos/">
          Ver mis pedidos
        </Enlace>
      </Vacio>
    );
  if (trabajo.estado === 'cargando') return <Cargando />;
  if (trabajo.estado === 'error' && trabajo.error)
    return <ErrorEstado error={trabajo.error} onReintentar={trabajo.recargar} />;
  const t = trabajo.datos;
  if (!t) return null;
  const e = etiquetaTrabajo(t);
  const cambioPendiente =
    propuestas.datos?.items.find(
      (p) => p.tipo !== 'cotizacion' && p.estado === 'pendiente' && p.trabajoId === t.id,
    ) ?? null;
  const pagosTrabajo = pagos.datos?.items ?? [];
  const activo = ['agendado', 'en_camino', 'en_sitio', 'en_curso'].includes(t.estado);
  const cancelable = ['agendado', 'en_camino', 'en_sitio'].includes(t.estado);
  const rubro = pedido.datos?.rubro;

  async function ejecutar(x: Trabajo, que: 'cancelar' | 'terminar') {
    const r =
      que === 'cancelar'
        ? await accion.enviar(
            'trabajoCancelar',
            { parametros: { id: x.id }, cuerpo: { version: x.version, motivo } },
            `${x.version}|${motivo}`,
          )
        : await accion.enviar(
            'trabajoConfirmarFin',
            { parametros: { id: x.id }, cuerpo: { version: x.version } },
            `${x.version}`,
          );
    if (r?.ok) {
      setHoja(null);
      trabajo.recargar();
      eventos.recargar();
    }
  }
  async function confirmarEtapa(x: Trabajo, etapaId: string, version: number) {
    const r = await accion.enviar(
      'etapaConfirmar',
      { parametros: { id: x.id, etapaId }, cuerpo: { version } },
      `${etapaId}|${version}`,
    );
    if (r?.ok) trabajo.recargar();
  }

  return (
    <>
      <Encabezado
        titulo={
          rubro
            ? `${RUBROS_INFO[rubro].nombre} con ==${t.especialista.nombrePublico}==`
            : `Trabajo con ==${t.especialista.nombrePublico}==`
        }
        volver={{ href: '/pedidos/', etiqueta: 'Volver a mis pedidos' }}
        bajada={
          <Pastilla tono={e.tono} {...(e.icono ? { icono: e.icono } : {})}>
            {e.texto}
          </Pastilla>
        }
      />

      {t.estado === 'en_camino' ? (
        <Aviso tipo="info" titulo="El especialista va en camino" rol="status">
          Te avisamos cuando llegue.
        </Aviso>
      ) : null}
      {t.estado === 'en_sitio' ? (
        <Aviso tipo="ok" titulo="El especialista avisó que llegó" rol="status">
          Lo marcó él desde su celular. Nosotros no seguimos tu ubicación ni la suya.
        </Aviso>
      ) : null}
      {t.estado === 'terminado_por_especialista' ? (
        <Aviso tipo="alerta" titulo="El especialista terminó el trabajo" rol="status">
          Revisá que esté todo bien y confirmalo. Si hay un problema, abrí un reclamo.
        </Aviso>
      ) : null}
      {t.estado === 'finalizado' ? (
        <Aviso tipo="ok">Trabajo finalizado. Si falta algo, podés abrir un reclamo.</Aviso>
      ) : null}
      {t.estado === 'cancelado' ? <Aviso tipo="info">Este trabajo se canceló.</Aviso> : null}
      {cambioPendiente ? (
        <Aviso
          tipo="alerta"
          titulo={
            cambioPendiente.autorRol === 'especialista'
              ? 'El especialista propone un cambio'
              : 'Tu cambio está esperando respuesta'
          }
        >
          <p>Mientras no se acepte, sigue valiendo el acuerdo actual.</p>
          <Enlace
            className="enlace-tarjeta"
            href={ruta('/propuestas/detalle/', { id: cambioPendiente.id })}
          >
            {cambioPendiente.autorRol === 'especialista' ? 'Ver y responder' : 'Ver el cambio'}
          </Enlace>
        </Aviso>
      ) : null}
      {accion.error ? (
        <Aviso
          tipo={accion.error.codigo === 'conflicto' ? 'alerta' : 'error'}
          titulo={accion.error.codigo === 'conflicto' ? 'Esto cambió' : 'No se pudo'}
        >
          <p>{accion.error.mensaje}</p>
          {accion.error.codigo === 'conflicto' ? (
            <Boton
              chico
              variante="claro"
              onClick={() => {
                accion.limpiar();
                trabajo.recargar();
              }}
            >
              Actualizar
            </Boton>
          ) : null}
        </Aviso>
      ) : null}

      <section className="tarjeta" aria-labelledby="acuerdo">
        <div className="tarjeta__cuerpo">
          <h2 id="acuerdo" className="tarjeta__titulo">
            Lo acordado
          </h2>
          <Desglose
            monto={t.acuerdo.monto}
            comision={t.acuerdo.comisionHandy}
            etiquetaTotal="Total acordado"
          />
          <Datos
            filas={[
              [
                'Horario',
                t.acuerdo.horario
                  ? cuando(t.acuerdo.horario.inicio)
                  : 'A coordinar con el especialista',
              ],
              ['Aceptado', cuando(t.acuerdo.aceptadoEn)],
            ]}
          />
          <p style={{ margin: '10px 0 0' }}>{t.acuerdo.alcance}</p>
          <hr style={{ border: 0, borderTop: '1px solid var(--linea)', margin: '12px 0' }} />
          <PerfilProfesional e={t.especialista} />
          {t.historialAcuerdos.length ? (
            <details style={{ marginTop: 10 }}>
              <summary>Acuerdos anteriores ({t.historialAcuerdos.length})</summary>
              <ul className="lista-plana">
                {[...t.historialAcuerdos].reverse().map((a) => (
                  <li key={a.propuestaId}>
                    {pesos(a.monto.centavos)} ·{' '}
                    {a.horario ? cuando(a.horario.inicio) : 'sin horario'} · aceptado{' '}
                    {cuando(a.aceptadoEn)}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      </section>

      {t.etapas.length ? (
        <section aria-labelledby="etapas">
          <h2 id="etapas" className="subtitulo">
            Etapas de la obra
          </h2>
          {t.etapas.map((et) => {
            const s = ESTADO_ETAPA[et.estado] ?? ESTADO_ETAPA.pendiente!;
            return (
              <div key={et.id} className="etapa">
                <div className="tarjeta__fila">
                  <strong>
                    {et.orden}. {et.titulo}
                  </strong>
                  <Pastilla tono={s.tono}>{s.texto}</Pastilla>
                </div>
                <p style={{ margin: '4px 0 0' }}>{pesos(et.monto.centavos)}</p>
                {et.estado === 'terminada_por_especialista' ? (
                  <div className="acciones">
                    <Boton
                      chico
                      cargando={accion.pendiente}
                      onClick={() => confirmarEtapa(t, et.id, et.version)}
                    >
                      Confirmar esta etapa
                    </Boton>
                  </div>
                ) : null}
              </div>
            );
          })}
        </section>
      ) : null}

      {pagosTrabajo.length ? (
        <section aria-labelledby="pagos-r">
          <h2 id="pagos-r" className="subtitulo">
            Pagos
          </h2>
          <ul className="lista-plana" style={{ listStyle: 'none', padding: 0 }}>
            {pagosTrabajo.map((p) => {
              const ep = etiquetaPago(p);
              return (
                <li key={p.id}>
                  {pesos(p.monto.centavos)} ·{' '}
                  {p.metodo === 'efectivo' ? 'Efectivo' : 'Mercado Pago'}{' '}
                  <Pastilla tono={ep.tono} {...(ep.icono ? { icono: ep.icono } : {})}>
                    {ep.texto}
                  </Pastilla>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className="acciones">
        {t.estado === 'terminado_por_especialista' &&
        t.etapas.every((x) => x.estado === 'confirmada') ? (
          <Boton
            icono="check"
            onClick={() => {
              accion.limpiar();
              setHoja('terminar');
            }}
          >
            Confirmar que terminó
          </Boton>
        ) : null}
        <Enlace
          className="boton boton--claro"
          href={ruta('/chats/conversacion/', { id: t.conversacionId })}
        >
          Chatear con {t.especialista.nombrePublico}
        </Enlace>
        {['en_curso', 'terminado_por_especialista', 'finalizado'].includes(t.estado) ? (
          <Enlace className="boton boton--claro" href={ruta('/trabajos/pago/', { id: t.id })}>
            Pago al especialista
          </Enlace>
        ) : null}
        {activo ? (
          <Enlace className="boton boton--contorno" href={ruta('/trabajos/cambiar/', { id: t.id })}>
            Cambiar turno o condiciones
          </Enlace>
        ) : null}
        <Enlace
          className="boton boton--texto"
          href={ruta('/reclamos/nuevo/', { pedido: t.pedidoId, trabajo: t.id })}
        >
          Abrir un reclamo
        </Enlace>
        {cancelable ? (
          <Boton
            variante="peligro"
            icono="cerrar"
            onClick={() => {
              accion.limpiar();
              setHoja('cancelar');
            }}
          >
            Cancelar el trabajo
          </Boton>
        ) : null}
      </div>

      <h2 className="subtitulo">Historial</h2>
      {eventos.datos ? (
        <ol className="linea">
          {eventos.datos.items.map((ev) => (
            <li key={ev.id} className="linea__item">
              <strong>{etiquetaTrabajo({ estado: ev.a }).texto}</strong>
              <br />
              <span className="linea__quien">
                {cuando(ev.ocurridoEn)} · {ACTOR_TEXTO[ev.actor] ?? ev.actor}
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <Cargando />
      )}

      <Hoja
        abierta={hoja === 'cancelar'}
        onCerrar={() => setHoja(null)}
        titulo="¿Cancelar el trabajo?"
      >
        <p>Se avisa al especialista. Queda en tu historial.</p>
        <fieldset style={{ border: 0, padding: 0 }}>
          <legend className="sr-only">Motivo</legend>
          {MOTIVOS.map((m) => (
            <label key={m.id} className="opcion">
              <input
                type="radio"
                name="motivo-t"
                checked={motivo === m.id}
                onChange={() => setMotivo(m.id)}
              />
              <span className="opcion__titulo">{m.texto}</span>
            </label>
          ))}
        </fieldset>
        {accion.error ? <Aviso tipo="error">{accion.error.mensaje}</Aviso> : null}
        <div className="acciones">
          <Boton
            variante="peligro"
            cargando={accion.pendiente}
            onClick={() => ejecutar(t, 'cancelar')}
          >
            Sí, cancelar el trabajo
          </Boton>
          <Boton variante="claro" onClick={() => setHoja(null)}>
            No, volver
          </Boton>
        </div>
      </Hoja>
      <Hoja
        abierta={hoja === 'terminar'}
        onCerrar={() => setHoja(null)}
        titulo="Confirmar que terminó"
      >
        <p>
          Vas a confirmar que el trabajo quedó como se acordó:{' '}
          <strong>{pesos(t.acuerdo.monto.centavos)}</strong>. Después podés pagar y, si hace falta,
          abrir un reclamo.
        </p>
        {accion.error ? <Aviso tipo="error">{accion.error.mensaje}</Aviso> : null}
        <div className="acciones">
          <Boton cargando={accion.pendiente} onClick={() => ejecutar(t, 'terminar')}>
            Sí, está todo bien
          </Boton>
          <Boton variante="claro" onClick={() => setHoja(null)}>
            Volver
          </Boton>
        </div>
      </Hoja>
    </>
  );
}
