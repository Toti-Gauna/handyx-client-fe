'use client';

import { useAhora } from '@/components/SesionProvider';
import { useConsulta, useEnvio } from '@/data/hooks';
import { cuando } from '@/domain/fechas';
import { Boton, Chip, MosaicoIcono, Nota, Tarjeta, Texto } from '@/ui';

/**
 * «Descargar mis datos»: se pide, se prepara en el servidor y llega un enlace de un solo uso que vence. Mientras se
 * prepara se consulta cada pocos segundos; el enlace se abre en una pestaña nueva (https del servidor).
 */
export function Exportacion() {
  const ahora = useAhora(60_000);
  const estado = useConsulta('exportacion', {}, { cada: 6_000 });
  const pedir = useEnvio();
  const e = estado.datos;
  const vencida = e ? e.estado === 'vencida' || (e.venceEn !== null && Date.parse(e.venceEn) < ahora) : false;

  async function pedirDatos() {
    const r = await pedir.enviar('exportacionPedir', {}, 'exportacion');
    if (r?.ok) estado.recargar();
  }

  return (
    <Tarjeta etiqueta="Descargar mis datos">
      <div className="ds-fila">
        <MosaicoIcono icono="documento" tam={2.75} />
        <span className="ds-crece ds-pila" style={{ ['--ds-gap' as string]: '0.125rem' }}>
          <strong style={{ fontSize: '1.0625rem' }}>Descargar mis datos</strong>
          <span className="ds-fila-enlace__sub">Un archivo con todo lo tuyo</span>
        </span>
        {e && !vencida ? (
          e.estado === 'preparando' ? (
            <Chip tono="amarillo" icono="reloj">Preparando</Chip>
          ) : (
            <Chip tono="exito" icono="check">Lista</Chip>
          )
        ) : null}
      </div>
      {e && !vencida && e.estado === 'preparando' ? (
        <Texto>Lo estamos preparando. Podés salir de acá: cuando esté lista, el botón aparece en esta pantalla.</Texto>
      ) : null}
      {e && !vencida && e.estado === 'lista' && e.url ? (
        <>
          <a className="ds-boton ds-boton--primario ds-boton--ancho" href={e.url} target="_blank" rel="noopener noreferrer">
            Descargar el archivo
          </a>
          {e.venceEn ? <Texto>El enlace sirve una sola vez y vence el {cuando(e.venceEn)}.</Texto> : null}
        </>
      ) : null}
      {!e || vencida ? (
        <>
          {vencida ? <Texto>El enlace anterior venció. Podés pedir otro archivo.</Texto> : null}
          <Boton variante="contorno" ocupado={pedir.pendiente} onClick={() => void pedirDatos()}>
            Pedir mis datos
          </Boton>
        </>
      ) : null}
      {pedir.error ? (
        <Nota icono="alerta" tono="error" rol="alert">
          {pedir.error.mensaje}
        </Nota>
      ) : null}
      {estado.error && !e ? (
        <Nota icono="alerta" tono="error" rol="alert">
          {estado.error.mensaje}
        </Nota>
      ) : null}
    </Tarjeta>
  );
}
