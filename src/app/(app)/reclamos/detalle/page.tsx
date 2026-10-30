'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { FotoPrivada } from '@/components/FotoPrivada';
import { FotoSubida } from '@/components/FotoSubida';
import { Enlace, ruta } from '@/components/nav';
import { Encabezado } from '@/components/Titulo';
import { Aviso, Boton, Campo, Cargando, ErrorEstado, Pastilla, Vacio } from '@/components/ui';
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
    <>
      <Encabezado
        titulo="Tu ==reclamo=="
        volver={{ href: '/reclamos/', etiqueta: 'Volver a tus reclamos' }}
        bajada={
          e ? (
            <Pastilla tono={e.tono} {...(e.icono ? { icono: e.icono } : {})}>
              {e.texto}
            </Pastilla>
          ) : null
        }
      />
      <section className="tarjeta">
        <div className="tarjeta__cuerpo">
          <p className="tarjeta__titulo">{CATEGORIAS_RECLAMO[x.categoria]}</p>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{x.detalle}</p>
          {x.adjuntos.length ? (
            <ul className="fotos">
              {x.adjuntos.map((a) => (
                <li key={a.id} className="foto">
                  <FotoPrivada url={a.url} alt="Foto del reclamo" />
                </li>
              ))}
            </ul>
          ) : null}
          <p className="texto-suave" style={{ margin: '8px 0 0' }}>
            Abierto {cuando(x.creadoEn)}
          </p>
        </div>
      </section>
      <div className="acciones" style={{ marginTop: 0 }}>
        <Enlace className="boton boton--claro" href={ruta('/pedidos/detalle/', { id: x.pedidoId })}>
          Ver el pedido
        </Enlace>
        {x.trabajoId ? (
          <Enlace
            className="boton boton--claro"
            href={ruta('/trabajos/detalle/', { id: x.trabajoId })}
          >
            Ver el trabajo
          </Enlace>
        ) : null}
      </div>

      {x.estado === 'esperando_usuario' ? (
        <form onSubmit={responder} noValidate>
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
          <div className="acciones">
            <Boton type="submit" cargando={accion.pendiente}>
              Enviar respuesta
            </Boton>
          </div>
        </form>
      ) : null}

      <h2 className="subtitulo">Historial</h2>
      <ol className="linea">
        {[...x.historial].reverse().map((h, i) => (
          <li key={`${h.ocurridoEn}-${i}`} className="linea__item">
            <strong>{ESTADOS_RECLAMO_TEXTO[h.a]?.texto ?? h.a}</strong>
            <br />
            <span className="linea__quien">
              {cuando(h.ocurridoEn)} · {ACTOR_TEXTO[h.actor] ?? h.actor}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}
