'use client';

import { useState } from 'react';
import { BotonHx, CampoContrasena, Escena, Flujo } from '@/components/acceso';
import { Enlace, useIr } from '@/components/nav';
import { Aviso, Campo } from '@/components/ui';
import { AVISO_LEGAL_PROVISORIO, TEXTOS_LEGALES } from '@/content/textos';
import { esVistaDePrueba } from '@/data';
import { useEnvio } from '@/data/hooks';
import { INVITACION_PRUEBA } from '@/data/prueba';
import { CONTRASENA_MINIMA, erroresDe, esEmail } from '@/domain/formularios';

type Paso = 'invitacion' | 'email' | 'contrasena' | 'textos' | 'verificar';
const ORDEN: readonly Paso[] = ['invitacion', 'email', 'contrasena', 'textos', 'verificar'];
/** Paso donde se corrige cada campo que el servidor puede rechazar. */
const PASO_DEL_CAMPO: Record<string, Paso> = {
  codigoInvitacion: 'invitacion',
  email: 'email',
  contrasena: 'contrasena',
  aceptaciones: 'textos',
};
// La confirmación del email depende del proveedor de email del BE (todavía no está en el contrato): en la vista de
// prueba se simula; con la API real el paso no aparece hasta que exista.
const TOTAL = esVistaDePrueba ? 5 : 4;

/**
 * Registro por pasos (rediseño 3.2): invitación › email › contraseña › textos › confirmar email (vista de prueba) ›
 * "¡Listo!" con el fee 0 % (/registro/listo/). Si el servidor rechaza un dato, vuelve al paso de ese dato.
 */
export default function Registro() {
  const ir = useIr();
  const { enviar, pendiente, error } = useEnvio();
  const [paso, setPaso] = useState<Paso>('invitacion');
  const [codigo, setCodigo] = useState('');
  const [email, setEmail] = useState('');
  const [contrasena, setContrasena] = useState('');
  // Sin tildar por defecto: la aceptación tiene que ser un acto explícito.
  const [terminos, setTerminos] = useState(false);
  const [privacidad, setPrivacidad] = useState(false);
  const [local, setLocal] = useState<Record<string, string>>({});
  const errores = { ...erroresDe(error), ...local };
  const numero = ORDEN.indexOf(paso) + 1;
  const anterior = (p: Paso) => ORDEN[ORDEN.indexOf(p) - 1] ?? 'invitacion';

  function validar(p: Paso): Record<string, string> {
    if (p === 'invitacion' && !/^[A-Za-z0-9]{6,16}$/.test(codigo.trim()))
      return { codigoInvitacion: 'El código tiene entre 6 y 16 letras y números.' };
    if (p === 'email' && !esEmail(email)) return { email: 'Escribí un email válido.' };
    if (p === 'contrasena' && contrasena.length < CONTRASENA_MINIMA)
      return { contrasena: `Usá al menos ${CONTRASENA_MINIMA} caracteres.` };
    if (p === 'textos' && (!terminos || !privacidad))
      return { aceptaciones: 'Tenés que aceptar los términos y la política de privacidad.' };
    return {};
  }

  async function seguir() {
    const n = validar(paso);
    setLocal(n);
    if (Object.keys(n).length) return;
    if (paso !== 'textos') return setPaso(ORDEN[numero] ?? 'textos');
    const r = await enviar(
      'registro',
      {
        cuerpo: {
          email: email.trim(),
          contrasena,
          codigoInvitacion: codigo.trim().toUpperCase(),
          aceptaciones: [
            { documento: 'terminos', version: TEXTOS_LEGALES.terminos.version },
            { documento: 'privacidad', version: TEXTOS_LEGALES.privacidad.version },
          ],
        },
      },
      `${codigo}|${email}|${contrasena}`,
    );
    if (r?.ok) {
      if (esVistaDePrueba) setPaso('verificar');
      else ir('/registro/listo/', { reemplazar: true });
    } else if (r && !r.ok) {
      const campo = Object.keys(erroresDe(r.error))[0];
      const destino = campo ? PASO_DEL_CAMPO[campo] : undefined;
      if (destino) setPaso(destino);
    }
  }

  const comunes = {
    paso: numero,
    total: TOTAL,
    onSubmit: (e: React.FormEvent) => {
      e.preventDefault();
      void seguir();
    },
    atras:
      paso === 'invitacion'
        ? { href: '/', etiqueta: 'Volver a la bienvenida' }
        : { alTocar: () => setPaso(anterior(paso)), etiqueta: 'Volver al paso anterior' },
    pie: (
      <BotonHx type="submit" cargando={pendiente}>
        {paso === 'textos' ? 'Crear cuenta' : 'Seguir'}
      </BotonHx>
    ),
  };
  const errorGeneral =
    error && !Object.keys(erroresDe(error)).length ? (
      <Aviso tipo="error" titulo="No pudimos crear la cuenta">
        {error.mensaje}{' '}
        {error.codigo === 'conflicto' ? (
          <Enlace className="enlace-tarjeta" href="/ingresar/">
            Ingresar
          </Enlace>
        ) : null}
      </Aviso>
    ) : null;

  if (paso === 'invitacion')
    return (
      <Flujo
        {...comunes}
        titulo="¿Tenés tu ==invitación==?"
        sub="La demo de Handyx es cerrada: entrás con el código que te mandamos."
        ilustracion={<Escena handy="handy-lamparita" ancho={202} alto={346} tono="amarillo" />}
      >
        <Campo etiqueta="Código de invitación" error={errores.codigoInvitacion} requerido>
          {(p) => (
            <input
              {...p}
              className="entrada du-codigo"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
          )}
        </Campo>
        {esVistaDePrueba ? (
          <Aviso tipo="info" titulo="Vista de prueba">
            Código de invitación ficticio: <span className="codigo">{INVITACION_PRUEBA}</span>
          </Aviso>
        ) : null}
      </Flujo>
    );

  if (paso === 'email')
    return (
      <Flujo
        {...comunes}
        titulo="¿Cuál es tu ==email==?"
        sub="Lo usás para ingresar y para recuperar tu contraseña. No lo compartimos con especialistas."
      >
        <Campo etiqueta="Email" error={errores.email} requerido>
          {(p) => (
            <input
              {...p}
              className="entrada"
              type="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="off"
              spellCheck={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
        </Campo>
      </Flujo>
    );

  if (paso === 'contrasena')
    return (
      <Flujo
        {...comunes}
        titulo="Creá una ==contraseña=="
        sub="Mejor si es larga y no la usás en otro lado."
      >
        {/* Para los gestores de contraseñas: el usuario de esta cuenta. */}
        <input type="email" autoComplete="username" value={email} readOnly hidden />
        <CampoContrasena
          etiqueta="Contraseña"
          valor={contrasena}
          onCambio={setContrasena}
          error={errores.contrasena}
          nueva
        />
      </Flujo>
    );

  if (paso === 'textos')
    return (
      <Flujo
        {...comunes}
        titulo="Antes de ==crear tu cuenta=="
        sub="Leé y aceptá los textos de la demo. Podés volver a verlos cuando quieras en Cuenta."
      >
        <fieldset className="du-aceptar">
          <legend className="sr-only">Aceptaciones</legend>
          <label className="opcion">
            <input
              type="checkbox"
              checked={terminos}
              onChange={(e) => setTerminos(e.target.checked)}
            />
            <span>
              <span className="opcion__titulo">Acepto los términos de uso</span>
              <span className="opcion__texto">{TEXTOS_LEGALES.terminos.version}</span>
            </span>
          </label>
          <label className="opcion">
            <input
              type="checkbox"
              checked={privacidad}
              onChange={(e) => setPrivacidad(e.target.checked)}
            />
            <span>
              <span className="opcion__titulo">Acepto la política de privacidad</span>
              <span className="opcion__texto">{TEXTOS_LEGALES.privacidad.version}</span>
            </span>
          </label>
          {errores.aceptaciones ? (
            <p className="campo__error" role="alert">
              {errores.aceptaciones}
            </p>
          ) : null}
        </fieldset>
        <details className="du-textos">
          <summary>Leer los textos</summary>
          <Aviso tipo="alerta">{AVISO_LEGAL_PROVISORIO}</Aviso>
          {Object.values(TEXTOS_LEGALES).map((t) => (
            <section key={t.version}>
              <h2>{t.titulo}</h2>
              {t.parrafos.map((x) => (
                <p key={x}>{x}</p>
              ))}
            </section>
          ))}
        </details>
        {errorGeneral}
      </Flujo>
    );

  return (
    <Flujo
      titulo="Confirmá tu ==email=="
      sub={`Te mandamos un enlace a ${email.trim()} para confirmar que es tuyo.`}
      paso={numero}
      total={TOTAL}
      ilustracion={<Escena handy="handy-gota" ancho={93} alto={125} />}
      pie={
        <BotonHx onClick={() => ir('/registro/listo/', { reemplazar: true })}>
          Ya lo confirmé
        </BotonHx>
      }
    >
      <Aviso tipo="info" titulo="Vista de prueba">
        No se manda ningún email. Con el envío real, este paso espera a que abras el enlace.
      </Aviso>
    </Flujo>
  );
}
