'use client';

import { useSesion } from '@/components/SesionProvider';
import { TEXTOS_LEGALES } from '@/content/textos';
import { useEnvio } from '@/data/hooks';
import { diaMes } from '@/domain/fechas';
import { Boton, DatoFila, Etiqueta, Nota, Tarjeta } from '@/ui';
import { Pregunta } from '@/ui/mensajes';

const DOCUMENTO = { terminos: 'Términos de uso', privacidad: 'Privacidad', politica_fee: 'Tarifa' };

/** Lo que aceptaste (con versión y día), los textos para leer y, si hay una versión nueva, aceptarla. */
export function Textos() {
  const { sesion, recargar } = useSesion();
  const { enviar, pendiente, error } = useEnvio();
  const pendientes = sesion.pendientes.documentos;

  async function aceptar(documento: 'terminos' | 'privacidad', version: string) {
    const r = await enviar('aceptacion', { cuerpo: { documento, version } }, `${documento}|${version}`);
    if (r?.ok) recargar();
  }

  return (
    <>
      {pendientes.length ? (
        <Tarjeta etiqueta="Hay textos nuevos para aceptar" tono="amarilla">
          <Etiqueta como="h2">Hay textos nuevos para aceptar</Etiqueta>
          {pendientes.map((d) => (
            <Boton
              key={d.documento}
              ocupado={pendiente}
              onClick={() => void aceptar(d.documento as 'terminos' | 'privacidad', d.version)}
            >
              {`Aceptar ${TEXTOS_LEGALES[d.documento as 'terminos' | 'privacidad'].titulo.toLowerCase()}`}
            </Boton>
          ))}
          {error ? (
            <Nota icono="alerta" tono="error" rol="alert">
              {error.mensaje}
            </Nota>
          ) : null}
        </Tarjeta>
      ) : null}
      <Tarjeta etiqueta="Lo que aceptaste">
        <Etiqueta como="h2">Lo que aceptaste</Etiqueta>
        {sesion.aceptaciones.length ? (
          sesion.aceptaciones.map((a) => (
            <DatoFila
              key={a.documento}
              icono="documento"
              etiqueta={DOCUMENTO[a.documento]}
              valor={`${a.version} · ${diaMes(a.aceptadaEn)}`}
            />
          ))
        ) : (
          <Nota icono="info" tono="gris">
            Todavía no aceptaste ningún texto.
          </Nota>
        )}
      </Tarjeta>
      <div>
        <Etiqueta como="h2">Políticas y textos</Etiqueta>
        {Object.values(TEXTOS_LEGALES).map((t) => (
          <Pregunta key={t.version} texto={t.titulo}>
            {t.parrafos.map((x) => (
              <p key={x}>{x}</p>
            ))}
          </Pregunta>
        ))}
      </div>
    </>
  );
}
