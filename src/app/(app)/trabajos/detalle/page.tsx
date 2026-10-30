'use client';

import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { BotonHx, Escena } from '@/components/acceso';
import { AvatarHx, Barra, ChipEstado, Pantalla, entra } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { MapaHx } from '@/components/MapaHx';
import { Enlace, ruta } from '@/components/nav';
import { TituloDocumento } from '@/components/TituloDocumento';
import {
  Acordado,
  EtapasObra,
  HistorialTrabajo,
  horarioAcordado,
  totalAcordado,
} from '@/components/Trabajo';
import { Aviso, Boton, Cargando, ErrorEstado, Hoja, Vacio } from '@/components/ui';
import type { Trabajo } from '@/contracts/v1/propuestas';
import { useConsulta, useEnvio } from '@/data/hooks';
import { pesos } from '@/domain/dinero';
import { RUBROS_INFO, etiquetaPago, etiquetaTrabajo } from '@/domain/etiquetas';

const MOTIVOS = [
  { id: 'cambio_de_planes', texto: 'Cambié de planes' },
  { id: 'no_se_presento', texto: 'El especialista no se presentó' },
  { id: 'otro', texto: 'Otro motivo' },
] as const;

/** Las cuatro etapas del seguimiento (u-seguimiento). */
const PASOS = [
  { estado: 'agendado', texto: 'Confirmado' },
  { estado: 'en_camino', texto: 'En camino' },
  { estado: 'en_sitio', texto: 'Llegó' },
  { estado: 'en_curso', texto: 'Trabajando' },
] as const;
type Activo = (typeof PASOS)[number]['estado'];
const ACTIVOS: readonly Trabajo['estado'][] = PASOS.map((p) => p.estado);

/**
 * Trabajo contratado (rediseño 3.6). Mientras está activo, el seguimiento de la demo: tu casa en el mapa y la hoja azul
 * con el paso actual (sin tiempos de llegada y sin seguir la ubicación de nadie). Cuando el especialista termina, se
 * revisa y se confirma; recién confirmado, "¡Listo, quedó arreglado!" con el pago y la reseña.
 */
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
  const esp = t.especialista.nombrePublico;
  const cambioPendiente =
    propuestas.datos?.items.find(
      (p) => p.tipo !== 'cotizacion' && p.estado === 'pendiente' && p.trabajoId === t.id,
    ) ?? null;
  const pagosTrabajo = pagos.datos?.items ?? [];
  const cancelable = ['agendado', 'en_camino', 'en_sitio'].includes(t.estado);
  const rubro = pedido.datos?.rubro;
  const casa = pedido.datos?.ubicacion ?? null;

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
  async function confirmarEtapa(etapaId: string, version: number) {
    const r = await accion.enviar(
      'etapaConfirmar',
      { parametros: { id: t!.id, etapaId }, cuerpo: { version } },
      `${etapaId}|${version}`,
    );
    if (r?.ok) trabajo.recargar();
  }

  const avisoError = accion.error ? (
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
  ) : null;
  const avisoCambio = cambioPendiente ? (
    <Aviso
      tipo="alerta"
      titulo={
        cambioPendiente.autorRol === 'especialista'
          ? `${esp} propone un cambio`
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
  ) : null;
  const reclamo = (
    <Enlace
      className="hd-boton hd-boton--fantasma"
      href={ruta('/reclamos/nuevo/', { pedido: t.pedidoId, trabajo: t.id })}
    >
      Abrir un reclamo
    </Enlace>
  );

  const hojas = (
    <>
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
          <strong>{pesos(totalAcordado(t))}</strong>. Después podés pagar y, si hace falta, abrir un
          reclamo.
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

  // ── Seguimiento (u-seguimiento) ────────────────────────────────────────────────────────────────────
  if (ACTIVOS.includes(t.estado)) {
    const actual = ACTIVOS.indexOf(t.estado);
    const titulo = {
      agendado: `${esp} confirmó tu turno`,
      en_camino: `${esp} va para tu casa`,
      en_sitio: `${esp} llegó a tu casa`,
      en_curso: `${esp} está trabajando`,
    }[t.estado as Activo];
    const nota = {
      agendado: 'Cuando salga para tu casa, te avisamos.',
      en_camino: 'Va en el horario que acordaron. Cuando llegue, lo marca él desde su celular.',
      en_sitio: 'Lo marcó él desde su celular al llegar.',
      en_curso:
        'Si te propone algún cambio o adicional, te avisamos: hasta que lo aceptes, no cambia nada.',
    }[t.estado as Activo];
    return (
      <div className="pantalla du-app du-mapa-pantalla du-seguimiento-hx hd-entrando">
        <TituloDocumento texto={titulo} />
        <div className="du-mapa-zona">
          {casa?.coordenadas ? (
            <MapaHx
              modo="ver"
              centro={casa.coordenadas}
              etiqueta="Mapa: tu casa, donde es el trabajo"
              clase="du-buscando__mapa"
            />
          ) : (
            <div className="du-buscando__sin-mapa" aria-hidden="true" />
          )}
          <Enlace href="/pedidos/" className="du-atras du-flotante" aria-label="Volver a Actividad">
            <Icono nombre="atras" />
          </Enlace>
          <span className="hd-chip hd-chip--noche du-mapa-chip" {...entra(1, 'pop')}>
            <Icono nombre="reloj" />
            {horarioAcordado(t)}
          </span>
        </div>
        <section
          className="hd-hoja-azul du-hoja-azul du-hoja-azul--mapa du-seg-hx"
          aria-labelledby="seg-titulo"
        >
          <span className="du-manija" aria-hidden="true" />
          <div className="du-seg-hx__scroll">
            <h1 id="seg-titulo" className="du-buscando__titulo" aria-live="polite">
              {titulo}
            </h1>
            <ol className="du-pasos-seg" aria-label={`Paso ${actual + 1} de ${PASOS.length}`}>
              {PASOS.map((p, i) => (
                <li
                  key={p.estado}
                  className={i < actual ? 'is-hecho' : i === actual ? 'is-actual' : ''}
                  aria-current={i === actual ? 'step' : undefined}
                >
                  <i aria-hidden="true">{i < actual ? <Icono nombre="check" /> : null}</i>
                  <span>{p.texto}</span>
                </li>
              ))}
            </ol>
            <p className="du-hoja-azul__nota" role="status">
              <Icono nombre="info" />
              <span>{nota}</span>
            </p>
            {avisoCambio}
            {avisoError}
            <Acordado t={t} desplegable />
            <EtapasObra t={t} pendiente={accion.pendiente} onConfirmar={confirmarEtapa} />
            <div className="du-seg-hx__acciones">
              {t.estado === 'en_curso' ? (
                <Enlace
                  className="hd-boton hd-boton--blanco"
                  href={ruta('/trabajos/pago/', { id: t.id })}
                >
                  <Icono nombre="billetera" />
                  Pago al especialista
                </Enlace>
              ) : null}
              <Enlace
                className="hd-boton du-boton-borde"
                href={ruta('/trabajos/cambiar/', { id: t.id })}
              >
                Cambiar turno o condiciones
              </Enlace>
              <Enlace
                className="du-buscando__cancelar"
                href={ruta('/reclamos/nuevo/', { pedido: t.pedidoId, trabajo: t.id })}
              >
                Abrir un reclamo
              </Enlace>
              {cancelable ? (
                <button
                  type="button"
                  className="du-buscando__cancelar"
                  onClick={() => {
                    accion.limpiar();
                    setHoja('cancelar');
                  }}
                >
                  Cancelar el trabajo
                </button>
              ) : null}
            </div>
            <p className="du-hoja-azul__nota">
              <Icono nombre="escudo" />
              <span>Nosotros no seguimos tu ubicación ni la del especialista.</span>
            </p>
            <HistorialTrabajo eventos={eventos.datos?.items ?? null} />
          </div>
          <div className="du-seg-hx__pie">
            <AvatarHx nombre={esp} tamano="chico" clase="du-avatar-blanco" />
            <span>
              <small>Tu especialista es</small>
              <strong>{esp}</strong>
            </span>
            <Enlace
              href={ruta('/chats/conversacion/', { id: t.conversacionId })}
              className="app-cuadrado du-seg-hx__chat"
              aria-label={`Chatear con ${esp}`}
            >
              <Icono nombre="chat" />
            </Enlace>
          </div>
        </section>
        {hojas}
      </div>
    );
  }

  // ── Cierre (u-terminado) y cancelado ─────────────────────────────────────────────────────────────
  const finalizado = t.estado === 'finalizado';
  const etapasListas = t.etapas.every((x) => x.estado === 'confirmada');
  const ultimoPago = [...pagosTrabajo].reverse().find((p) => p.etapaId === null) ?? null;
  const pagoHecho = ultimoPago !== null && ['reportado', 'verificado'].includes(ultimoPago.estado);
  const titulo =
    t.estado === 'cancelado'
      ? 'Trabajo ==cancelado=='
      : finalizado
        ? '¡Listo, quedó ==arreglado==!'
        : `${esp} ==terminó== el trabajo`;
  const pie =
    t.estado === 'terminado_por_especialista' ? (
      <>
        {etapasListas ? (
          <BotonHx
            icono="check"
            onClick={() => {
              accion.limpiar();
              setHoja('terminar');
            }}
          >
            Confirmar que terminó
          </BotonHx>
        ) : null}
        <Enlace className="hd-boton hd-boton--claro" href={ruta('/trabajos/pago/', { id: t.id })}>
          Pago al especialista
        </Enlace>
        {reclamo}
      </>
    ) : finalizado ? (
      <>
        <Enlace
          className={`hd-boton ${pagoHecho ? 'hd-boton--claro' : 'hd-boton--exito'}`}
          href={ruta('/trabajos/pago/', { id: t.id })}
        >
          Pago al especialista
        </Enlace>
        <Enlace className="hd-boton" href={ruta('/trabajos/resena/', { id: t.id })}>
          <Icono nombre="estrella" />
          Calificar a {esp}
        </Enlace>
        {reclamo}
      </>
    ) : (
      <Enlace className="hd-boton hd-boton--claro" href="/pedir/">
        Hacer un pedido nuevo
      </Enlace>
    );

  return (
    <Pantalla
      arriba={
        <Barra
          titulo={rubro ? `${RUBROS_INFO[rubro].nombre} con ==${esp}==` : `Trabajo con ==${esp}==`}
          volver={{ href: '/pedidos/', etiqueta: 'Volver a mis pedidos' }}
        />
      }
      pie={pie}
      clase="du-cierre"
    >
      <div className="du-cuerpo du-terminado">
        {finalizado ? (
          <Escena handy="handys-grupo" ancho={600} alto={311} tilde />
        ) : t.estado === 'terminado_por_especialista' ? (
          <Escena handy="handy-llave" ancho={581} alto={547} tono="amarillo" />
        ) : (
          <Image
            className="hd-handy du-cierre__roto"
            src="/img/handy-engranaje-roto.webp"
            alt=""
            width={338}
            height={339}
          />
        )}
        <p className="hd-titulo du-centro du-cierre__titulo" {...entra(2)}>
          {titulo.split(/==(.+?)==/).map((x, i) => (i % 2 ? <mark key={i}>{x}</mark> : x))}
        </p>
        <p className="du-centro du-cierre__estado">
          <ChipEstado e={etiquetaTrabajo(t)} />
        </p>
        {t.estado === 'terminado_por_especialista' ? (
          <Aviso tipo="alerta" titulo="Falta tu confirmación" rol="status">
            Revisá que esté todo como se acordó y confirmalo. Si hay un problema, abrí un reclamo.
            {etapasListas ? null : ' Primero confirmá cada etapa de la obra.'}
          </Aviso>
        ) : null}
        {finalizado ? (
          <p className="du-nota">
            <Icono nombre="checkCirculo" />
            <span>
              Trabajo finalizado: lo confirmaste vos. Si falta algo, podés abrir un reclamo.
            </span>
          </p>
        ) : null}
        {t.estado === 'cancelado' ? <Aviso tipo="info">Este trabajo se canceló.</Aviso> : null}
        {avisoCambio}
        {avisoError}
        <EtapasObra t={t} pendiente={accion.pendiente} onConfirmar={confirmarEtapa} />

        {finalizado || pagosTrabajo.length ? (
          <div className="hd-ticket du-ticket du-ticket--pago" {...entra(3)}>
            <div className="hd-ticket__papel">
              <div className="du-ticket__total">
                <small className="hd-sobre">
                  {pagoHecho ? 'Registraste el pago' : 'Total a pagar'}
                </small>
                <span className="hd-precio hd-precio--grande">{pesos(totalAcordado(t))}</span>
                {ultimoPago ? <ChipEstado e={etiquetaPago(ultimoPago)} /> : null}
              </div>
              <div className="hd-ticket__corte" />
              <p className="du-ticket__abajo du-cierre__pago-nota">
                Directo a {esp}, por Mercado Pago o en efectivo. Un pago que registrás vos queda
                “reportado” hasta que lo confirma otra parte.
              </p>
            </div>
          </div>
        ) : null}
        <Acordado t={t} />
        <HistorialTrabajo eventos={eventos.datos?.items ?? null} />
        <Enlace
          className="hd-boton hd-boton--claro"
          href={ruta('/chats/conversacion/', { id: t.conversacionId })}
        >
          Chatear con {esp}
        </Enlace>
      </div>
      {hojas}
    </Pantalla>
  );
}
