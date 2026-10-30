'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { FotoPrivada } from '@/components/FotoPrivada';
import { FotoSubida } from '@/components/FotoSubida';
import { Enlace, ruta } from '@/components/nav';
import { BotonHx } from '@/components/acceso';
import { Barra, ChipEstado, Pantalla, entra } from '@/components/hx';
import { Aviso, Campo, Cargando, ErrorEstado, Vacio } from '@/components/ui';
import { useConsulta, useEnvio } from '@/data/hooks';
import { ACTOR_TEXTO, CATEGORIAS_RECLAMO, ESTADOS_RECLAMO_TEXTO } from '@/domain/etiquetas';
import { cuando } from '@/domain/fechas';

export default function DetalleReclamo() {
  const id = useSearchParams().get('id');
  const r = useConsulta('reclamo', id ? { parametros: { id } } : null, { cada: 5_000 });
  const accion = useEnvio();
  const [detalle, setDetalle] = useState('');
  const [adjuntos, setAdjuntos] = useState<string[]>([]);
  const [local, setLocal] = useState<string | null>(null);

  if (!id)
    return (
      <Vacio titulo="Falta el reclamo">
        <Enlace className="boton boton--chico" href="/reclamos/">
          Ver mis reclamos
        </Enlace>
      </Vacio>
    );
  if (r.estado === 'cargando') return <Cargando forma="detalle" />;
  if (r.estado === 'error' && r.error)
    return <ErrorEstado error={r.error} onReintentar={r.recargar} />;
  const x = r.datos;
  if (!x) return null;
  const e = ESTADOS_RECLAMO_TEXTO[x.estado];

  async function responder(ev: React.FormEvent) {
    ev.preventDefault();
    if (!x) return;
    if (detalle.trim().length < 3) return setLocal('Escribí tu respuesta.');
    setLocal(null);
    const cuerpo = { version: x.version, detalle: detalle.trim(), adjuntos };
    const res = await accion.enviar(
      'reclamoResponder',
      { parametros: { id: x.id }, cuerpo },
      JSON.stringify(cuerpo),
    );
    if (res?.ok) {
      setDetalle('');
      r.recargar();
    }
  }

  return (
    <Pantalla
      arriba={
        <Barra
          titulo="Tu reclamo"
          volver={{ href: '/reclamos/', etiqueta: 'Volver a tus reclamos' }}
          sub={CATEGORIAS_RECLAMO[x.categoria]}
          icono="alerta"
        />
      }
      pie={
        x.estado === 'esperando_usuario' ? (
          <BotonHx type="submit" form="form-reclamo" icono="enviar" cargando={accion.pendiente}>
            Enviar respuesta
          </BotonHx>
        ) : undefined
      }
      clase="du-reclamo-hx"
    >
      <div className="du-cuerpo">
        {e ? (
          <div {...entra(1)}>
            <ChipEstado e={e} vivo />
          </div>
        ) : null}
        <section
          className="hd-tarjeta hd-tarjeta--gris du-reclamo-hx__detalle"
          data-vt-destino
          {...entra(1)}
        >
          <p className="du-reclamo-hx__texto">{x.detalle}</p>
          {x.adjuntos.length ? (
            <ul className="fotos">
              {x.adjuntos.map((a) => (
                <li key={a.id} className="foto">
                  <FotoPrivada url={a.url} alt="Foto del reclamo" />
                </li>
              ))}
            </ul>
          ) : null}
          <small className="du-reclamo-hx__fecha">Abierto {cuando(x.creadoEn)}</small>
        </section>
        <div className="du-reclamo-hx__enlaces" {...entra(2)}>
          <Enlace
            className="hd-boton hd-boton--blanco du-boton-claro-hx"
            href={ruta('/pedidos/detalle/', { id: x.pedidoId })}
          >
            Ver el pedido
          </Enlace>
          {x.trabajoId ? (
            <Enlace
              className="hd-boton hd-boton--blanco du-boton-claro-hx"
              href={ruta('/trabajos/detalle/', { id: x.trabajoId })}
            >
              Ver el trabajo
            </Enlace>
          ) : null}
        </div>

        {x.estado === 'esperando_usuario' ? (
          <form id="form-reclamo" className="du-reclamo-hx__form" onSubmit={responder} noValidate>
            <Aviso tipo="alerta" titulo="Necesitamos más información" rol="status">
              Respondé acá para que sigamos con la revisión.
            </Aviso>
            <Campo etiqueta="Tu respuesta" error={local} requerido>
              {(c) => (
                <textarea
                  {...c}
                  className="entrada"
                  maxLength={2000}
                  value={detalle}
                  onChange={(ev) => setDetalle(ev.target.value)}
                />
              )}
            </Campo>
            <FotoSubida onCambio={setAdjuntos} etiqueta="Agregar fotos" />
            {accion.error ? <Aviso tipo="error">{accion.error.mensaje}</Aviso> : null}
          </form>
        ) : null}

        <section className="du-bloque" aria-labelledby="historial-t" {...entra(3)}>
          <h2 id="historial-t" className="hd-sobre du-sobre">
            Historial
          </h2>
          <ol className="du-linea-hx">
            {[...x.historial].reverse().map((h, i) => (
              <li key={`${h.ocurridoEn}-${i}`} className={i === 0 ? 'is-actual' : ''}>
                <i aria-hidden="true" />
                <span>
                  <strong>{ESTADOS_RECLAMO_TEXTO[h.a]?.texto ?? h.a}</strong>
                  <small>
                    {cuando(h.ocurridoEn)} · {ACTOR_TEXTO[h.actor] ?? h.actor}
                  </small>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </Pantalla>
  );
}
