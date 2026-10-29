'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { FotoSubida } from '@/components/FotoSubida';
import { Enlace, ruta, useIr } from '@/components/nav';
import { Encabezado } from '@/components/Titulo';
import { Aviso, Boton, Campo, Cargando, ErrorEstado } from '@/components/ui';
import { CATEGORIAS_RECLAMO as CATEGORIAS } from '@/contracts/v1/servicio';
import { useConsulta, useEnvio } from '@/data/hooks';
import { CATEGORIAS_RECLAMO, RUBROS_INFO } from '@/domain/etiquetas';
import { erroresDe } from '@/domain/formularios';
import { cuando } from '@/domain/fechas';

export default function NuevoReclamo() {
  const params = useSearchParams();
  const ir = useIr();
  const trabajos = useConsulta('trabajos', { consulta: { limite: 50 } });
  const pedidos = useConsulta('pedidos', { consulta: { limite: 50 } });
  const { enviar, pendiente, error } = useEnvio();
  const [elegido, setElegido] = useState(params.get('trabajo') ?? '');
  const [categoria, setCategoria] = useState<(typeof CATEGORIAS)[number] | ''>('');
  const [detalle, setDetalle] = useState('');
  const [adjuntos, setAdjuntos] = useState<string[]>([]);
  const [local, setLocal] = useState<Record<string, string>>({});
  const errores = { ...erroresDe(error), ...local };

  if (trabajos.estado === 'cargando' || pedidos.estado === 'cargando') return <Cargando />;
  if (trabajos.error ?? pedidos.error)
    return (
      <ErrorEstado
        error={(trabajos.error ?? pedidos.error)!}
        onReintentar={() => {
          trabajos.recargar();
          pedidos.recargar();
        }}
      />
    );
  const lista = trabajos.datos?.items ?? [];
  const pedidoConocido = params.get('pedido');
  const t = lista.find((x) => x.id === elegido) ?? null;
  const pedidoId = t?.pedidoId ?? pedidoConocido;

  async function mandar(e: React.FormEvent) {
    e.preventDefault();
    const n: Record<string, string> = {};
    if (!pedidoId) n.trabajo = 'Elegí sobre qué trabajo es el reclamo.';
    if (!categoria) n.categoria = 'Elegí una categoría.';
    if (detalle.trim().length < 10) n.detalle = 'Contanos qué pasó (al menos 10 caracteres).';
    setLocal(n);
    if (Object.keys(n).length || !pedidoId || !categoria) return;
    const cuerpo = {
      pedidoId,
      trabajoId: t?.id ?? null,
      categoria,
      detalle: detalle.trim(),
      adjuntos,
    };
    const r = await enviar('reclamoCrear', { cuerpo }, JSON.stringify(cuerpo));
    if (r?.ok) ir(ruta('/reclamos/detalle/', { id: r.datos.id }), { reemplazar: true });
  }

  return (
    <>
      <Encabezado
        titulo="Abrir un ==reclamo=="
        volver={{ href: '/reclamos/', etiqueta: 'Volver a tus reclamos' }}
      />
      <form onSubmit={mandar} noValidate>
        {!pedidoConocido || elegido ? (
          <Campo etiqueta="¿Sobre qué trabajo?" error={errores.trabajo} requerido>
            {(c) => (
              <select
                {...c}
                className="entrada"
                value={elegido}
                onChange={(e) => setElegido(e.target.value)}
              >
                <option value="">Elegí un trabajo</option>
                {lista.map((x) => {
                  const rubro = pedidos.datos?.items.find((p) => p.id === x.pedidoId)?.rubro;
                  return (
                    <option key={x.id} value={x.id}>
                      {rubro ? RUBROS_INFO[rubro].nombre : 'Trabajo'} ·{' '}
                      {x.especialista.nombrePublico}
                      {x.acuerdo.horario ? ` · ${cuando(x.acuerdo.horario.inicio)}` : ''}
                    </option>
                  );
                })}
              </select>
            )}
          </Campo>
        ) : (
          <p className="texto-suave">El reclamo queda asociado a tu pedido.</p>
        )}
        <fieldset style={{ border: 0, padding: 0 }}>
          <legend className="campo__etiqueta">¿Qué pasó?</legend>
          {CATEGORIAS.map((c) => (
            <label key={c} className="opcion">
              <input
                type="radio"
                name="categoria"
                checked={categoria === c}
                onChange={() => setCategoria(c)}
              />
              <span className="opcion__titulo">{CATEGORIAS_RECLAMO[c]}</span>
            </label>
          ))}
          {errores.categoria ? (
            <p className="campo__error" role="alert">
              {errores.categoria}
            </p>
          ) : null}
        </fieldset>
        <Campo
          etiqueta="Contanos el detalle"
          error={errores.detalle}
          ayuda={`${detalle.length} / 2000`}
          requerido
        >
          {(c) => (
            <textarea
              {...c}
              className="entrada"
              maxLength={2000}
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
            />
          )}
        </Campo>
        <h2 className="subtitulo">
          Fotos <span className="campo__opcional">(opcional)</span>
        </h2>
        <FotoSubida onCambio={setAdjuntos} />
        <Aviso tipo="info">
          Lo revisa el equipo de Handy. No te prometemos un plazo de respuesta: vas a ver el estado
          en cada paso.
        </Aviso>
        {error && !Object.keys(erroresDe(error)).length ? (
          <Aviso tipo="error" titulo="No pudimos enviar el reclamo">
            <p>{error.mensaje}</p>
            {error.recuperable ? (
              <p>Tus datos siguen acá: probá de nuevo, no se va a duplicar.</p>
            ) : null}
          </Aviso>
        ) : null}
        <div className="acciones">
          <Boton type="submit" cargando={pendiente}>
            Enviar el reclamo
          </Boton>
          <Enlace className="boton boton--claro" href="/reclamos/">
            Cancelar
          </Enlace>
        </div>
      </form>
    </>
  );
}
