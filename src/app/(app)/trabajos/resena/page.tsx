'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Barra, Pantalla } from '@/components/hx';
import { Enlace, ruta } from '@/components/nav';
import { TituloDocumento } from '@/components/TituloDocumento';
import { estadoDeCarga } from '@/components/Trabajo';
import { Aviso } from '@/components/ui';
import type { Resena } from '@/contracts/v1/servicio';
import { useConsulta, useEnvio } from '@/data/hooks';
import {
  DESTACADOS_TEXTO,
  TEXTO_PUNTAJE,
  opcionesPara,
  prepararResena,
  type Destacado,
} from '@/data/resena';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { cuando } from '@/domain/fechas';
import {
  Avatar,
  Boton,
  Chip,
  EscenaArreglado,
  Estrellas,
  EstrellasFijas,
  Etiqueta,
  Nota,
  Pastilla,
} from '@/ui';
import '@/styles/ds-seguimiento.css';

/**
 * Reseña: una hoja que sube sobre «¡Quedó arreglado!». Estrellas grandes, qué estuvo bien (o mal) y un comentario
 * opcional sin datos personales. Solo de un trabajo finalizado, una por trabajo.
 */
export default function ResenaTrabajo() {
  const id = useSearchParams().get('id');
  const trabajo = useConsulta('trabajo', id ? { parametros: { id } } : null);
  const previa = useConsulta('resena', id ? { parametros: { id } } : null);
  const pedidoId = trabajo.datos?.pedidoId ?? null;
  const pedido = useConsulta('pedido', pedidoId ? { parametros: { id: pedidoId } } : null);
  const accion = useEnvio();
  const [puntaje, setPuntaje] = useState(0);
  const [destacados, setDestacados] = useState<Destacado[]>([]);
  const [comentario, setComentario] = useState('');
  const [enviada, setEnviada] = useState<Resena | null>(null);

  const carga = estadoDeCarga(id, [trabajo]) ?? (previa.estado === 'cargando' ? estadoDeCarga(id, [previa]) : null);
  const t = trabajo.datos;
  if (carga || !t) return carga;

  const esp = t.especialista.nombrePublico;
  const volver = { href: ruta('/trabajos/detalle/', { id: t.id }), etiqueta: 'Volver al trabajo' };
  const hecha = enviada ?? previa.datos;

  if (t.estado !== 'finalizado' && !hecha)
    return (
      <Pantalla arriba={<Barra titulo="Calificar" volver={volver} sub={esp} />}>
        <div className="ds ds-cuerpo">
          <Nota icono="info" rol="status">
            Todavía no se puede calificar: primero confirmá que el trabajo terminó.
          </Nota>
          <Boton href={volver.href}>Volver al trabajo</Boton>
        </div>
      </Pantalla>
    );

  const rubro = pedido.datos ? RUBROS_INFO[pedido.datos.rubro].nombre : 'Trabajo';
  const opciones = opcionesPara(puntaje);

  async function publicar() {
    const r = await accion.enviar(
      'resenaCrear',
      { parametros: { id: t!.id }, cuerpo: prepararResena(puntaje, destacados, comentario) },
      `${puntaje}|${destacados.join()}|${comentario}`,
    );
    if (r?.ok) setEnviada(r.datos);
  }

  return (
    <div className="pantalla du-app hd-entrando">
      <TituloDocumento texto={hecha ? 'Gracias por calificar' : `¿Cómo te fue con ${esp}?`} />
      <div className="pantalla__scroll">
        <div className="ds dss-resena">
          <div className="dss-resena__escena" aria-hidden="true">
            <div className="ds-escena-cabecera">
              <EscenaArreglado alto={300} />
            </div>
            <p className="dss-resena__titulo">¡Quedó arreglado!</p>
          </div>
          <div className="dss-resena__hoja">
            <span className="dss-resena__avatar">
              <Avatar nombre={esp} tam={5} />
            </span>
            {hecha ? (
              <>
                <div className="ds-pila dss-centro">
                  <h1 className="ds-titulo" style={{ ['--ds-tam' as string]: '1.5rem' }}>
                    ¡Gracias por calificar!
                  </h1>
                  <span className="ds-fila-enlace__sub">
                    {rubro} · {cuando(hecha.creadaEn).split(' · ')[0]}
                  </span>
                </div>
                <div className="dss-centro">
                  <EstrellasFijas valor={hecha.puntaje} />
                </div>
                {hecha.destacados.length ? (
                  <div className="dss-resena__pastillas">
                    {hecha.destacados.map((d) => (
                      <Chip key={d} tono="tinte">
                        {DESTACADOS_TEXTO[d]}
                      </Chip>
                    ))}
                  </div>
                ) : null}
                {hecha.comentario ? <blockquote className="dss-cita">{hecha.comentario}</blockquote> : null}
                <Nota icono="info">
                  Si algo salió mal y necesitás que lo revisemos, abrí un reclamo: la reseña no lo
                  reemplaza.
                </Nota>
                <Boton href="/inicio/">Volver al inicio</Boton>
              </>
            ) : (
              <>
                <div className="ds-pila dss-centro" style={{ ['--ds-gap' as string]: '0.25rem' }}>
                  <h1 className="ds-titulo" style={{ ['--ds-tam' as string]: '1.5rem' }}>
                    ¿Cómo te fue con {esp}?
                  </h1>
                  <span className="ds-fila-enlace__sub">{rubro}</span>
                </div>
                <Estrellas
                  valor={puntaje}
                  onElegir={(n) => {
                    setPuntaje(n);
                    setDestacados([]);
                  }}
                />
                <strong className="dss-centro" style={{ color: 'var(--ds-hondo)' }}>
                  {puntaje ? TEXTO_PUNTAJE[puntaje] : 'Tocá las estrellas para calificar'}
                </strong>
                {opciones.length ? (
                  <>
                    <Etiqueta>{puntaje >= 4 ? '¿Qué estuvo bien?' : '¿Qué pasó?'}</Etiqueta>
                    <div className="dss-resena__pastillas" role="group" aria-label="Qué destacás">
                      {opciones.map((d) => (
                        <Pastilla
                          key={d}
                          elegida={destacados.includes(d)}
                          onElegir={() =>
                            setDestacados((a) => (a.includes(d) ? a.filter((x) => x !== d) : [...a, d]))
                          }
                        >
                          {DESTACADOS_TEXTO[d]}
                        </Pastilla>
                      ))}
                    </div>
                  </>
                ) : null}
                <label className="dss-campo">
                  Comentario (opcional)
                  <textarea
                    value={comentario}
                    maxLength={500}
                    onChange={(e) => setComentario(e.target.value)}
                    placeholder="Contanos cómo fue"
                    aria-describedby="resena-privacidad"
                  />
                </label>
                <p id="resena-privacidad" className="ds-fila-enlace__sub" style={{ margin: 0 }}>
                  Se publica con tu nombre y la inicial del apellido. Sacamos teléfonos, emails y documentos.
                </p>
                {accion.error ? <Aviso tipo="error">{accion.error.mensaje}</Aviso> : null}
                <Boton
                  deshabilitado={puntaje === 0}
                  ocupado={accion.pendiente}
                  onClick={() => void publicar()}
                >
                  Publicar la reseña
                </Boton>
                <Enlace className="dss-enlace-texto" href={volver.href}>
                  Ahora no
                </Enlace>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
