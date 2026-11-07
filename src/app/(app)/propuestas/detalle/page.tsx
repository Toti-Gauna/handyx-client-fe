'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { DeslizarConfirmar } from '@/components/Deslizar';
import { AvatarHx, Barra, ChipEstado, ChipsVerificacion, Pantalla, entra } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { Enlace, ruta, useIr } from '@/components/nav';
import { Vigencia } from '@/components/Propuesta';
import { Aviso, Boton, Cargando, ErrorEstado, Hoja, Vacio } from '@/components/ui';
import type { Propuesta } from '@/contracts/v1/propuestas';
import { useConsulta, useEnvio } from '@/data/hooks';
import { pesos, porcentaje } from '@/domain/dinero';
import { RUBROS_INFO, etiquetaPropuesta } from '@/domain/etiquetas';
import { cuando } from '@/domain/fechas';

/**
 * Propuesta (rediseño 3.5, como u-perfil + u-confirmar de la demo): arriba quién es el especialista (solo verificaciones
 * reales), después qué propone y cuánto sale en total. Aceptar abre "Confirmá el turno" con todo el acuerdo a la vista;
 * se confirma deslizando o con el botón alternativo. Nada se acepta desde la tarjeta ni con un toque apurado.
 */
export default function DetallePropuesta() {
  const params = useSearchParams();
  const id = params.get('id');
  const ir = useIr();
  const prop = useConsulta('propuesta', id ? { parametros: { id } } : null, { cada: 3_000 });
  const pedidoId = prop.datos?.pedidoId ?? null;
  const pedido = useConsulta('pedido', pedidoId ? { parametros: { id: pedidoId } } : null);
  const historial = useConsulta(
    'propuestas',
    pedidoId ? { parametros: { id: pedidoId }, consulta: { limite: 50 } } : null,
    { cada: 6_000 },
  );
  const accion = useEnvio();
  // "Elegir" desde la tarjeta abre directamente la confirmación (que igual pide deslizar o confirmar).
  const [hoja, setHoja] = useState<'aceptar' | 'rechazar' | null>(
    params.get('elegir') === '1' ? 'aceptar' : null,
  );

  if (!id)
    return (
      <Vacio titulo="Falta la propuesta" texto="El enlace está incompleto.">
        <Enlace className="boton boton--chico" href="/pedidos/">
          Ver mis pedidos
        </Enlace>
      </Vacio>
    );
  if (prop.estado === 'cargando') return <Cargando forma="detalle" />;
  if (prop.estado === 'error' && prop.error)
    return <ErrorEstado error={prop.error} onReintentar={prop.recargar} />;
  const p = prop.datos;
  if (!p) return null;
  const e = p.especialista;
  const etiqueta = etiquetaPropuesta(p);
  const propia = p.autorRol === 'usuario';
  const decidible = p.estado === 'pendiente' && !propia;
  const error = accion.error;
  const conflicto = error?.conflicto ?? null;
  const total = p.monto.centavos + p.comisionHandy.importe.centavos;
  const ubicacion = pedido.datos?.ubicacion ?? null;
  const horario = p.horario ? cuando(p.horario.inicio) : 'Lo declara al aceptar';

  async function aceptar(x: Propuesta): Promise<boolean> {
    const r = await accion.enviar(
      'propuestaAceptar',
      { parametros: { id: x.id }, cuerpo: { version: x.version } },
      `${x.id}|${x.version}`,
    );
    if (r?.ok) {
      ir(ruta('/trabajos/detalle/', { id: r.datos.trabajo.id }), { reemplazar: true });
      return true;
    }
    if (r) {
      setHoja(null);
      prop.recargar();
    }
    return false;
  }
  async function rechazar(x: Propuesta) {
    const r = await accion.enviar(
      'propuestaRechazar',
      { parametros: { id: x.id }, cuerpo: { version: x.version } },
      `${x.id}|${x.version}`,
    );
    if (r) {
      setHoja(null);
      prop.recargar();
    }
  }

  // Historial de la negociación con este especialista, de la más vieja a la más nueva.
  const cadena = (historial.datos?.items ?? [])
    .filter((x) => x.especialista.id === e.id)
    .sort((a, b) => a.creadaEn.localeCompare(b.creadaEn));

  const titulo =
    p.tipo === 'cotizacion'
      ? propia
        ? 'Tu ==contrapropuesta=='
        : '==Propuesta=='
      : p.tipo === 'adicional'
        ? 'Un ==adicional=='
        : 'Cambio del ==acuerdo==';
  const volver =
    p.tipo === 'cotizacion'
      ? {
          href: ruta('/pedidos/propuestas/', { pedido: p.pedidoId }),
          etiqueta: 'Volver a todas las propuestas',
        }
      : p.trabajoId
        ? { href: ruta('/trabajos/detalle/', { id: p.trabajoId }), etiqueta: 'Volver al trabajo' }
        : { href: ruta('/pedidos/detalle/', { id: p.pedidoId }), etiqueta: 'Volver al pedido' };

  const pie = decidible ? (
    <>
      <p id="decision-resumen" className="du-resumen-linea">
        <Icono nombre="billetera" />
        <span>Total final</span>
        <strong>
          {pesos(total)} · {horario}
        </strong>
      </p>
      <div className="decision__botones">
        <Boton
          aria-describedby="decision-resumen"
          variante="peligro"
          icono="cerrar"
          onClick={() => {
            accion.limpiar();
            setHoja('rechazar');
          }}
        >
          Rechazar
        </Boton>
        <Boton
          aria-describedby="decision-resumen"
          icono="check"
          onClick={() => {
            accion.limpiar();
            setHoja('aceptar');
          }}
        >
          Aceptar
        </Boton>
      </div>
    </>
  ) : p.estado === 'pendiente' && propia ? (
    <Enlace
      className="hd-boton hd-boton--claro"
      href={ruta('/chats/conversacion/', { id: p.conversacionId })}
    >
      Ir al chat
    </Enlace>
  ) : p.estado === 'aceptada' && p.trabajoId ? (
    <Enlace className="hd-boton" href={ruta('/trabajos/detalle/', { id: p.trabajoId })}>
      Ver el trabajo
    </Enlace>
  ) : (
    <Enlace
      className="hd-boton hd-boton--claro"
      href={ruta('/pedidos/propuestas/', { pedido: p.pedidoId })}
    >
      Ver las otras propuestas
    </Enlace>
  );

  return (
    <Pantalla arriba={<Barra titulo={titulo} volver={volver} />} pie={pie} clase="du-perfil">
      <div className="du-cuerpo du-propuesta">
        <section
          className="du-heroe"
          data-vt-destino
          aria-label={`Quién es ${e.nombrePublico}`}
          {...entra(1)}
        >
          <AvatarHx
            nombre={e.nombrePublico}
            verificado={e.verificaciones.length > 0}
            tamano="grande"
          />
          <p className="hd-titulo hd-titulo--claro du-heroe__nombre">{e.nombrePublico}</p>
          <span className="du-heroe__chips">
            {e.verificaciones.length ? (
              <ChipsVerificacion e={e} />
            ) : (
              <span className="hd-chip hd-chip--claro hd-chip--mini">
                Sin verificaciones todavía
              </span>
            )}
          </span>
          {e.trabajosRealizados !== null ? (
            <small>
              {e.trabajosRealizados === 0
                ? 'Todavía no hizo trabajos con Handyx'
                : `${e.trabajosRealizados} ${e.trabajosRealizados === 1 ? 'trabajo' : 'trabajos'} con Handyx`}
            </small>
          ) : null}
        </section>

        <section className="du-bloque" {...entra(2)}>
          <p className="hd-sobre du-sobre">Rubros</p>
          <div className="hd-chips">
            {e.rubros.map((r) => (
              <span key={r} className="hd-chip hd-chip--tinte">
                <Icono nombre={RUBROS_INFO[r].icono} />
                {RUBROS_INFO[r].nombre}
              </span>
            ))}
          </div>
        </section>

        {conflicto === 'vencida' ? (
          <Aviso tipo="alerta" titulo="La propuesta venció">
            Ya no se puede aceptar. Mirá si hay otras o pedí una nueva.
          </Aviso>
        ) : null}
        {conflicto === 'ya_resuelta' ? (
          <Aviso tipo="info" titulo="Esto ya se resolvió">
            <p>
              Otra acción (quizás desde otro celular) ya resolvió este pedido. No se creó otro
              trabajo.
            </p>
            <Enlace className="enlace-tarjeta" href={ruta('/pedidos/detalle/', { id: p.pedidoId })}>
              Ver el pedido
            </Enlace>
          </Aviso>
        ) : null}
        {conflicto === 'version' ? (
          <Aviso tipo="alerta" titulo="La propuesta cambió">
            Actualizamos lo que ves. Revisala de nuevo antes de aceptar.
          </Aviso>
        ) : null}
        {error && !conflicto && hoja === null ? (
          <Aviso tipo="error" titulo="No se pudo">
            {error.mensaje}
          </Aviso>
        ) : null}

        <section className="du-bloque" {...entra(3)}>
          <p className="hd-sobre du-sobre du-propuesta__sobre">
            {propia ? 'Lo que proponés' : 'Lo que propone'}
            {p.estado === 'pendiente' ? null : <ChipEstado e={etiqueta} />}
          </p>
          <div className="hd-tarjeta hd-tarjeta--gris du-propuesta__alcance">
            <small>Qué incluye</small>
            <p>{p.alcance}</p>
          </div>
        </section>

        <div className="hd-ticket hd-ticket--azul du-precio" {...entra(4)}>
          <div className="hd-ticket__papel">
            <div className="du-precio__arriba">
              <small className="hd-sobre">Total final para vos</small>
              <span className="hd-precio hd-precio--grande">{pesos(total)}</span>
              <small className="du-precio__sub">
                Precio del especialista {pesos(p.monto.centavos)} + Tarifa de Handyx (
                {porcentaje(p.comisionHandy.bp)}) {pesos(p.comisionHandy.importe.centavos)}
              </small>
            </div>
            <div className="hd-ticket__corte" />
            <p className="du-precio__abajo">
              <Icono nombre="calendario" />
              <span>
                {propia ? 'Horario que proponés' : 'Horario que propone'}:{' '}
                <strong>{horario}</strong>
                {p.estado === 'pendiente' ? (
                  <>
                    <br />
                    Vigencia: <Vigencia hasta={p.venceEn} />
                  </>
                ) : null}
              </span>
            </p>
          </div>
        </div>
        <p className="du-nota" {...entra(5)}>
          <Icono nombre="billetera" />
          <span>
            Le pagás directo al especialista, por Mercado Pago o en efectivo. Handy no recibe ni
            reparte ese dinero.
          </span>
        </p>

        <div className="hd-tarjeta hd-tarjeta--gris hd-tarjeta--compacta hd-lista" {...entra(6)}>
          {decidible && p.tipo === 'cotizacion' ? (
            <Enlace className="hd-fila" href={ruta('/propuestas/contraoferta/', { id: p.id })}>
              <span className="hd-fila__ico">
                <Icono nombre="editar" />
              </span>
              <span className="hd-fila__texto">
                <strong>Hacer una contrapropuesta</strong>
                <small>Otro precio, otro horario o qué incluye</small>
              </span>
              <span className="hd-fila__fin">
                <Icono nombre="derecha" />
              </span>
            </Enlace>
          ) : null}
          <Enlace className="hd-fila" href={ruta('/chats/conversacion/', { id: p.conversacionId })}>
            <span className="hd-fila__ico">
              <Icono nombre="chat" />
            </span>
            <span className="hd-fila__texto">
              <strong>Hablar con {e.nombrePublico}</strong>
              <small>Consultale lo que necesites antes de decidir</small>
            </span>
            <span className="hd-fila__fin">
              <Icono nombre="derecha" />
            </span>
          </Enlace>
        </div>

        {cadena.length > 1 ? (
          <section className="du-bloque" {...entra(7)}>
            <p className="hd-sobre du-sobre">Historial con {e.nombrePublico}</p>
            <ol className="hd-tarjeta hd-tarjeta--gris hd-tarjeta--compacta du-cadena">
              {cadena.map((x) => (
                <li key={x.id} aria-current={x.id === p.id ? 'true' : undefined}>
                  <strong>{pesos(x.monto.centavos + x.comisionHandy.importe.centavos)}</strong>
                  <span>
                    {x.autorRol === 'usuario' ? 'Vos' : e.nombrePublico} · {cuando(x.creadaEn)} ·{' '}
                    {etiquetaPropuesta(x).texto}
                    {x.id === p.id ? ' · (esta)' : ''}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>

      <Hoja
        abierta={hoja === 'aceptar' && decidible}
        onCerrar={() => setHoja(null)}
        titulo={p.tipo === 'cotizacion' ? 'Confirmá el turno' : 'Aceptar el cambio'}
      >
        <div className="hd-ticket du-ticket du-confirmar">
          <div className="hd-ticket__papel">
            <div className="du-ticket__arriba">
              <div className="du-ticket__quien">
                <AvatarHx nombre={e.nombrePublico} verificado={e.verificaciones.length > 0} />
                <span>
                  <strong>{e.nombrePublico}</strong>
                  <small>{e.rubros.map((r) => RUBROS_INFO[r].nombre).join(' · ')}</small>
                </span>
              </div>
              <p className="du-ticket__trabajo">{p.alcance}</p>
              <div className="du-ticket__grilla">
                <div className="du-ticket__dato">
                  <Icono nombre="calendario" />
                  <small>Cuándo</small>
                  <strong>{horario}</strong>
                </div>
                <div className="du-ticket__dato">
                  <Icono nombre="casa" />
                  <small>Dónde</small>
                  <strong>{ubicacion?.direccion ?? 'Tu dirección'}</strong>
                  <span>
                    {ubicacion
                      ? [ubicacion.barrio, ubicacion.ciudad].filter(Boolean).join(', ')
                      : ''}
                  </span>
                </div>
              </div>
            </div>
            <div className="hd-ticket__corte" />
            <dl className="du-ticket__abajo du-confirmar__plata">
              <div className="hd-dato">
                <dt>Precio del especialista</dt>
                <dd>{pesos(p.monto.centavos)}</dd>
              </div>
              <div className="hd-dato">
                <dt>Tarifa de Handyx ({porcentaje(p.comisionHandy.bp)})</dt>
                <dd>{pesos(p.comisionHandy.importe.centavos)}</dd>
              </div>
              <div className="hd-dato hd-dato--total">
                <dt>Total final</dt>
                <dd className="hd-precio">{pesos(total)}</dd>
              </div>
            </dl>
          </div>
        </div>
        <p className="du-nota">
          <Icono nombre="info" />
          <span>
            {p.tipo === 'cotizacion'
              ? 'Aceptar crea el trabajo con exactamente estas condiciones. Cualquier cambio después necesita otra propuesta que la otra parte acepte.'
              : 'Mientras no aceptes, sigue valiendo el acuerdo actual.'}
          </span>
        </p>
        <section className="du-bloque">
          <p className="hd-sobre du-sobre">Cómo se paga</p>
          <ul className="du-pagos du-pagos--info">
            <li className="du-pago">
              <span className="du-pago__ico">
                <Icono nombre="tarjeta" />
              </span>
              <strong>Mercado Pago</strong>
              <small>Al terminar, desde la app</small>
            </li>
            <li className="du-pago">
              <span className="du-pago__ico">
                <Icono nombre="billetera" />
              </span>
              <strong>Efectivo</strong>
              <small>Al terminar, en mano</small>
            </li>
          </ul>
          <p className="du-confirmar__pago-nota">
            Directo al especialista: lo elegís cuando termina el trabajo.
          </p>
        </section>
        {error && hoja === 'aceptar' ? <Aviso tipo="error">{error.mensaje}</Aviso> : null}
        <DeslizarConfirmar
          texto="Deslizá para confirmar"
          cargando={accion.pendiente}
          onConfirmar={() => aceptar(p)}
        />
        <div className="acciones du-confirmar__acciones">
          <Boton
            variante="claro"
            icono="check"
            cargando={accion.pendiente}
            onClick={() => void aceptar(p)}
          >
            Sí, acepto estas condiciones
          </Boton>
          <Boton variante="texto" onClick={() => setHoja(null)}>
            Volver
          </Boton>
        </div>
      </Hoja>
      <Hoja
        abierta={hoja === 'rechazar'}
        onCerrar={() => setHoja(null)}
        titulo="¿Rechazar la propuesta?"
        handy="/img/handy-cano-roto.webp"
      >
        <p>Se la avisamos a {e.nombrePublico}. Podés seguir con las otras propuestas.</p>
        {error ? <Aviso tipo="error">{error.mensaje}</Aviso> : null}
        <div className="acciones">
          <Boton
            variante="peligro-lleno"
            icono="cerrar"
            cargando={accion.pendiente}
            onClick={() => rechazar(p)}
          >
            Sí, rechazar
          </Boton>
          <Boton variante="claro" onClick={() => setHoja(null)}>
            Volver
          </Boton>
        </div>
      </Hoja>
    </Pantalla>
  );
}
