'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Enlace, ruta, useIr } from '@/components/nav';
import { Condiciones, Desglose, PerfilProfesional } from '@/components/Propuesta';
import { Encabezado } from '@/components/Titulo';
import { Aviso, Boton, Cargando, Datos, ErrorEstado, Hoja, Pastilla, Vacio } from '@/components/ui';
import type { Propuesta } from '@/contracts/v1/propuestas';
import { useConsulta, useEnvio } from '@/data/hooks';
import { etiquetaPropuesta } from '@/domain/etiquetas';
import { cuando } from '@/domain/fechas';
import { pesos } from '@/domain/dinero';

export default function DetallePropuesta() {
  const id = useSearchParams().get('id');
  const ir = useIr();
  const prop = useConsulta('propuesta', id ? { parametros: { id } } : null, { cada: 3_000 });
  const pedidoId = prop.datos?.pedidoId ?? null;
  const historial = useConsulta(
    'propuestas',
    pedidoId ? { parametros: { id: pedidoId }, consulta: { limite: 50 } } : null,
    { cada: 6_000 },
  );
  const accion = useEnvio();
  const [hoja, setHoja] = useState<'aceptar' | 'rechazar' | null>(null);

  if (!id)
    return (
      <Vacio titulo="Falta la propuesta" texto="El enlace está incompleto.">
        <Enlace className="boton boton--chico" href="/pedidos/">
          Ver mis pedidos
        </Enlace>
      </Vacio>
    );
  if (prop.estado === 'cargando') return <Cargando />;
  if (prop.estado === 'error' && prop.error)
    return <ErrorEstado error={prop.error} onReintentar={prop.recargar} />;
  const p = prop.datos;
  if (!p) return null;
  const e = etiquetaPropuesta(p);
  const propia = p.autorRol === 'usuario';
  const error = accion.error;
  const conflicto = error?.conflicto ?? null;
  const total = p.monto.centavos + p.comisionHandy.importe.centavos;

  async function aceptar(x: Propuesta) {
    const r = await accion.enviar(
      'propuestaAceptar',
      { parametros: { id: x.id }, cuerpo: { version: x.version } },
      `${x.id}|${x.version}`,
    );
    if (r?.ok) ir(ruta('/trabajos/detalle/', { id: r.datos.trabajo.id }), { reemplazar: true });
    else if (r) {
      setHoja(null);
      prop.recargar();
    }
  }
  async function rechazar(x: Propuesta) {
    const r = await accion.enviar(
      'propuestaRechazar',
      { parametros: { id: x.id }, cuerpo: { version: x.version } },
      `${x.id}|${x.version}`,
    );
    if (r?.ok) {
      setHoja(null);
      prop.recargar();
    } else if (r) {
      setHoja(null);
      prop.recargar();
    }
  }

  // Historial de la negociación con este especialista, de la más vieja a la más nueva.
  const cadena = (historial.datos?.items ?? [])
    .filter((x) => x.especialista.id === p.especialista.id)
    .sort((a, b) => a.creadaEn.localeCompare(b.creadaEn));

  return (
    <>
      <Encabezado
        titulo={
          p.tipo === 'cotizacion'
            ? propia
              ? 'Tu ==contrapropuesta=='
              : '==Propuesta=='
            : p.tipo === 'adicional'
              ? 'Un ==adicional=='
              : 'Cambio del ==acuerdo=='
        }
        volver={
          p.tipo === 'cotizacion'
            ? {
                href: ruta('/pedidos/propuestas/', { pedido: p.pedidoId }),
                etiqueta: 'Volver a todas las propuestas',
              }
            : p.trabajoId
              ? {
                  href: ruta('/trabajos/detalle/', { id: p.trabajoId }),
                  etiqueta: 'Volver al trabajo',
                }
              : {
                  href: ruta('/pedidos/detalle/', { id: p.pedidoId }),
                  etiqueta: 'Volver al pedido',
                }
        }
        bajada={
          <Pastilla tono={e.tono} {...(e.icono ? { icono: e.icono } : {})}>
            {e.texto}
          </Pastilla>
        }
      />

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
      {error && !conflicto ? (
        <Aviso tipo="error" titulo="No se pudo">
          {error.mensaje}
        </Aviso>
      ) : null}

      <section className="tarjeta" aria-label="Condiciones de la propuesta">
        <div className="tarjeta__cuerpo">
          <PerfilProfesional e={p.especialista} />
          <Desglose monto={p.monto} comision={p.comisionHandy} />
          <Condiciones p={p} />
          <h2 className="subtitulo">Qué incluye</h2>
          <p style={{ margin: 0 }}>{p.alcance}</p>
          <Datos
            filas={[
              ['Quién la propuso', propia ? 'Vos' : p.especialista.nombrePublico],
              ['Enviada', cuando(p.creadaEn)],
            ]}
          />
        </div>
      </section>

      {p.estado === 'pendiente' && !propia ? (
        <section className="decision" aria-labelledby="decision-titulo">
          <h2 id="decision-titulo" className="decision__titulo">
            {p.tipo === 'cotizacion' ? '¿Aceptás esta propuesta?' : '¿Aceptás este cambio?'}
          </h2>
          <p className="decision__resumen">
            Total {pesos(total)} · {p.horario ? cuando(p.horario.inicio) : 'horario a declarar'}
          </p>
          <Aviso tipo="info">
            {p.tipo === 'cotizacion'
              ? 'Aceptar crea el trabajo con exactamente estas condiciones. Cualquier cambio después necesita otra propuesta que la otra parte acepte.'
              : 'Mientras no aceptes, sigue valiendo el acuerdo actual.'}
          </Aviso>
          <div className="decision__botones">
            <Boton
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
              icono="check"
              onClick={() => {
                accion.limpiar();
                setHoja('aceptar');
              }}
            >
              Aceptar
            </Boton>
          </div>
          <div className="decision__otras">
            {p.tipo === 'cotizacion' ? (
              <Enlace
                className="boton boton--contorno"
                href={ruta('/propuestas/contraoferta/', { id: p.id })}
              >
                Hacer una contrapropuesta
              </Enlace>
            ) : null}
            <Enlace
              className="boton boton--texto"
              href={ruta('/chats/conversacion/', { id: p.conversacionId })}
            >
              Hablar con {p.especialista.nombrePublico}
            </Enlace>
          </div>
        </section>
      ) : null}
      {p.estado === 'pendiente' && propia ? (
        <>
          <Aviso tipo="info" titulo="Esperando respuesta" rol="status">
            Nada queda acordado hasta que {p.especialista.nombrePublico} acepte las mismas
            condiciones.
          </Aviso>
          <div className="acciones">
            <Enlace
              className="boton boton--claro"
              href={ruta('/chats/conversacion/', { id: p.conversacionId })}
            >
              Ir al chat
            </Enlace>
          </div>
        </>
      ) : null}
      {p.estado === 'aceptada' && p.trabajoId ? (
        <div className="acciones">
          <Enlace className="boton" href={ruta('/trabajos/detalle/', { id: p.trabajoId })}>
            Ver el trabajo
          </Enlace>
        </div>
      ) : null}
      {['vencida', 'rechazada', 'retirada', 'reemplazada'].includes(p.estado) ? (
        <div className="acciones">
          <Enlace
            className="boton boton--claro"
            href={ruta('/pedidos/propuestas/', { pedido: p.pedidoId })}
          >
            Ver las otras propuestas
          </Enlace>
        </div>
      ) : null}

      {cadena.length > 1 ? (
        <>
          <h2 className="subtitulo">Historial con {p.especialista.nombrePublico}</h2>
          <ol className="linea">
            {cadena.map((x) => {
              const ex = etiquetaPropuesta(x);
              return (
                <li key={x.id} className="linea__item">
                  <strong>{pesos(x.monto.centavos)}</strong> ·{' '}
                  {x.autorRol === 'usuario' ? 'Vos' : x.especialista.nombrePublico}
                  <br />
                  <span className="linea__quien">
                    {cuando(x.creadaEn)} · {ex.texto}
                    {x.id === p.id ? ' · (esta)' : ''}
                  </span>
                </li>
              );
            })}
          </ol>
        </>
      ) : null}

      <Hoja
        abierta={hoja === 'aceptar'}
        onCerrar={() => setHoja(null)}
        titulo="Aceptar estas condiciones"
      >
        <PerfilProfesional e={{ ...p.especialista, trabajosRealizados: null }} />
        <Desglose monto={p.monto} comision={p.comisionHandy} />
        <Condiciones p={p} />
        <p style={{ margin: '10px 0 0' }}>{p.alcance}</p>
        <Aviso tipo="info">Pagás directo al especialista, por Mercado Pago o en efectivo.</Aviso>
        {error ? <Aviso tipo="error">{error.mensaje}</Aviso> : null}
        <div className="acciones">
          <Boton icono="check" cargando={accion.pendiente} onClick={() => aceptar(p)}>
            Sí, acepto estas condiciones
          </Boton>
          <Boton variante="claro" onClick={() => setHoja(null)}>
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
        <p>
          Se la avisamos a {p.especialista.nombrePublico}. Podés seguir con las otras propuestas.
        </p>
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
    </>
  );
}
