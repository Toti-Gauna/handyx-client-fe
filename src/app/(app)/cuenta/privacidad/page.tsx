'use client';

import { BotonHx } from '@/components/acceso';
import { Barra, entra, Pantalla } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { Enlace } from '@/components/nav';
import { useSesion } from '@/components/SesionProvider';
import { Aviso } from '@/components/ui';
import { AVISO_LEGAL_PROVISORIO, TEXTOS_LEGALES } from '@/content/textos';
import { useEnvio } from '@/data/hooks';
import { diaMes } from '@/domain/fechas';

const VOLVER = { href: '/cuenta/', etiqueta: 'Volver a tu cuenta' };
const DOCUMENTO = { terminos: 'Términos de uso', privacidad: 'Privacidad', politica_fee: 'Tarifa' };

/** Privacidad (rediseño 3.8): lo que aceptaste y en qué versión, los textos, HandIA sin datos personales y tus derechos. */
export default function Privacidad() {
  const { sesion, recargar } = useSesion();
  const { enviar, pendiente, error } = useEnvio();
  const pendientes = sesion.pendientes.documentos;

  async function aceptar(documento: 'terminos' | 'privacidad', version: string) {
    const r = await enviar(
      'aceptacion',
      { cuerpo: { documento, version } },
      `${documento}|${version}`,
    );
    if (r?.ok) recargar();
  }

  return (
    <Pantalla arriba={<Barra titulo="Privacidad" volver={VOLVER} />} clase="du-privacidad-hx">
      <div className="du-cuerpo">
        <Aviso tipo="alerta">{AVISO_LEGAL_PROVISORIO}</Aviso>
        {pendientes.length ? (
          <Aviso tipo="info" titulo="Hay textos nuevos para aceptar">
            {pendientes.map((d) => (
              <p key={d.documento}>
                <BotonHx
                  onClick={() => aceptar(d.documento as 'terminos' | 'privacidad', d.version)}
                  cargando={pendiente}
                >
                  Aceptar{' '}
                  {TEXTOS_LEGALES[d.documento as 'terminos' | 'privacidad'].titulo.toLowerCase()}
                </BotonHx>
              </p>
            ))}
          </Aviso>
        ) : null}
        {error ? <Aviso tipo="error">{error.mensaje}</Aviso> : null}

        <section className="du-bloque" aria-labelledby="aceptaste-t" {...entra(1)}>
          <h2 id="aceptaste-t" className="hd-sobre du-sobre">
            Lo que aceptaste
          </h2>
          {sesion.aceptaciones.length ? (
            <dl className="hd-tarjeta hd-tarjeta--gris du-datos-hx__lista">
              {sesion.aceptaciones.map((a) => (
                <div key={a.documento} className="hd-dato">
                  <dt>{DOCUMENTO[a.documento]}</dt>
                  <dd>
                    {a.version} · {diaMes(a.aceptadaEn)}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="du-nota">
              <Icono nombre="info" />
              <span>Todavía no aceptaste ningún texto.</span>
            </p>
          )}
        </section>

        <section className="du-bloque" aria-labelledby="textos-t" {...entra(2)}>
          <h2 id="textos-t" className="hd-sobre du-sobre">
            Los textos
          </h2>
          {Object.values(TEXTOS_LEGALES).map((t) => (
            <details key={t.version} className="du-legal-hx">
              <summary>
                <Icono nombre="sobre" />
                <span>{t.titulo}</span>
                <Icono nombre="abajo" />
              </summary>
              <div className="du-legal-hx__cuerpo">
                {t.parrafos.map((x) => (
                  <p key={x}>{x}</p>
                ))}
              </div>
            </details>
          ))}
        </section>

        <section className="du-bloque" aria-labelledby="handia-t" {...entra(3)}>
          <h2 id="handia-t" className="hd-sobre du-sobre">
            HandIA, sin datos personales
          </h2>
          <p className="du-nota">
            <Icono nombre="chispas" />
            <span>
              HandIA te ayuda a describir el problema y a elegir el rubro. Antes de enviarle un
              mensaje sacamos emails, teléfonos y números de documento; no recibe fotos ni los datos
              de tu cuenta. Usarla es opcional: siempre podés elegir el rubro vos.
            </span>
          </p>
        </section>

        <section className="du-bloque" aria-labelledby="derechos-t" {...entra(4)}>
          <h2 id="derechos-t" className="hd-sobre du-sobre">
            Tus derechos
          </h2>
          <p className="du-nota">
            <Icono nombre="escudo" />
            <span>
              Podés pedir acceso, corrección o eliminación de tus datos. Tus datos los corregís en{' '}
              <Enlace href="/cuenta/datos/">Datos personales</Enlace> y la cuenta se elimina desde{' '}
              <Enlace href="/cuenta/baja/">Eliminar cuenta</Enlace>.
            </span>
          </p>
        </section>
      </div>
    </Pantalla>
  );
}
