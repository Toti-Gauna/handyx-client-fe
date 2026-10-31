'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { BotonHx, Escena, Flujo } from '@/components/acceso';
import { AvatarHx } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { Enlace, ruta } from '@/components/nav';
import { Aviso, Campo, Cargando, ErrorEstado, Vacio } from '@/components/ui';
import { ErrorCliente } from '@/data/cliente';
import { useConsulta } from '@/data/hooks';
import { enviarResena, resenaDe, resenaDisponible, type Resena } from '@/data/resena';
import { RUBROS_INFO } from '@/domain/etiquetas';

const BIEN = ['Puntual', 'Prolijo', 'Explicó todo', 'Buen trato'] as const;
const MAL = ['Llegó tarde', 'Quedó a medias', 'Dejó desorden', 'Otra cosa'] as const;

/**
 * Reseña (rediseño 3.6, como u-resena de la demo): solo de un trabajo que confirmaste que terminó. Estrellas, lo mejor o
 * lo que estuvo mal, y un comentario opcional sin datos personales. Si algo salió mal de verdad, el camino es un
 * reclamo: la reseña no lo reemplaza.
 */
export default function ResenaTrabajo() {
  const id = useSearchParams().get('id');
  const trabajo = useConsulta('trabajo', id ? { parametros: { id } } : null);
  const pedidoId = trabajo.datos?.pedidoId ?? null;
  const pedido = useConsulta('pedido', pedidoId ? { parametros: { id: pedidoId } } : null);
  const [estrellas, setEstrellas] = useState<Resena['estrellas'] | null>(null);
  const [destacados, setDestacados] = useState<string[]>([]);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enviada, setEnviada] = useState<Resena | null>(() => (id ? resenaDe(id) : null));

  if (!id)
    return (
      <Vacio titulo="Falta el trabajo">
        <Enlace className="boton boton--chico" href="/pedidos/">
          Ver mis pedidos
        </Enlace>
      </Vacio>
    );
  if (trabajo.estado === 'cargando') return <Cargando forma="detalle" />;
  if (trabajo.estado === 'error' && trabajo.error)
    return <ErrorEstado error={trabajo.error} onReintentar={trabajo.recargar} />;
  const t = trabajo.datos;
  if (!t) return null;
  const esp = t.especialista.nombrePublico;
  const volver = { href: ruta('/trabajos/detalle/', { id: t.id }), etiqueta: 'Volver al trabajo' };
  const rubro = pedido.datos?.rubro;

  if (enviada)
    return (
      <Flujo
        titulo="¡Gracias por ==calificar==!"
        sub="Tu calificación nos ayuda a cuidar la calidad de cada trabajo."
        atras={volver}
        ilustracion={
          <Escena handy="handy-lamparita" ancho={202} alto={346} tono="amarillo" tilde />
        }
        pie={
          <Enlace href="/inicio/" className="hd-boton">
            Volver al inicio
          </Enlace>
        }
      >
        <p className="du-nota">
          <Icono nombre="info" />
          <span>
            Si algo salió mal y necesitás que lo revisemos, abrí un reclamo: la reseña no lo
            reemplaza.
          </span>
        </p>
      </Flujo>
    );

  if (t.estado !== 'finalizado')
    return (
      <Flujo
        titulo="¿Cómo te ==fue==?"
        atras={volver}
        pie={
          <Enlace href={volver.href} className="hd-boton">
            Volver al trabajo
          </Enlace>
        }
      >
        <Aviso tipo="info" titulo="Todavía no se puede calificar">
          Podés calificar a {esp} cuando confirmes que el trabajo terminó.
        </Aviso>
      </Flujo>
    );

  const chips = estrellas === null ? [] : estrellas >= 4 ? BIEN : MAL;
  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!estrellas || !id) return;
    setEnviando(true);
    setError(null);
    try {
      setEnviada(
        await enviarResena({
          trabajoId: id,
          estrellas,
          destacados: destacados.filter((d) => (chips as readonly string[]).includes(d)),
          comentario,
        }),
      );
    } catch (err) {
      setError(err instanceof ErrorCliente ? err.mensaje : 'No pudimos enviar la reseña.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Flujo
      titulo="¿Cómo te ==fue==?"
      atras={volver}
      onSubmit={enviar}
      pie={
        <BotonHx
          type="submit"
          icono="enviar"
          cargando={enviando}
          disabled={!estrellas || !resenaDisponible}
        >
          Enviar
        </BotonHx>
      }
    >
      <div className="du-resena-hx__quien">
        <AvatarHx
          nombre={esp}
          verificado={t.especialista.verificaciones.length > 0}
          tamano="grande"
        />
        <p className="hd-titulo hd-titulo--chico">{esp}</p>
        {rubro ? (
          <span className="hd-chip hd-chip--tinte">
            <Icono nombre={RUBROS_INFO[rubro].icono} />
            {RUBROS_INFO[rubro].nombre}
          </span>
        ) : null}
      </div>
      {!resenaDisponible ? (
        <Aviso tipo="info" titulo="Las reseñas todavía no están disponibles">
          Te avisamos cuando puedas calificar a {esp}.
        </Aviso>
      ) : null}
      <fieldset className="du-estrellas-hx">
        <legend className="sr-only">Calificación de 1 a 5 estrellas</legend>
        {([1, 2, 3, 4, 5] as const).map((n) => (
          <button
            key={n}
            type="button"
            className="du-estrella-hx"
            aria-pressed={estrellas !== null && n <= estrellas}
            aria-label={n === 1 ? '1 estrella' : `${n} estrellas`}
            onClick={() => {
              setEstrellas(n);
              setDestacados([]);
            }}
          >
            <Icono nombre="estrella" />
          </button>
        ))}
      </fieldset>
      <p className="du-resena-hx__ayuda" role="status">
        {estrellas === null
          ? 'Tocá las estrellas para calificar'
          : estrellas === 1
            ? '1 estrella'
            : `${estrellas} estrellas`}
      </p>
      {chips.length ? (
        <fieldset className="du-resena-hx__chips">
          <legend className="hd-sobre du-sobre">
            {estrellas !== null && estrellas >= 4
              ? '¿Qué fue lo mejor?'
              : 'Contanos qué estuvo mal'}
          </legend>
          <div className="hd-chips">
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                className="hd-chip hd-chip--tinte du-chip-voto"
                aria-pressed={destacados.includes(c)}
                onClick={() =>
                  setDestacados((d) => (d.includes(c) ? d.filter((x) => x !== c) : [...d, c]))
                }
              >
                {c}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}
      <Campo
        etiqueta="Contá algo más (opcional)"
        opcional
        ayuda="Sin datos personales: si escribís un teléfono o un email, lo sacamos antes de enviar."
      >
        {(p) => (
          <textarea
            {...p}
            className="entrada"
            maxLength={500}
            rows={3}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
          />
        )}
      </Campo>
      {error ? <Aviso tipo="error">{error}</Aviso> : null}
    </Flujo>
  );
}
