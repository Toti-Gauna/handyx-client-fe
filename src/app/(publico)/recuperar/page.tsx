'use client';

import { useState } from 'react';
import { BotonHx, Escena, Flujo } from '@/components/acceso';
import { Enlace } from '@/components/nav';
import { Aviso, Campo } from '@/components/ui';
import { esVistaDePrueba } from '@/data';
import { useEnvio } from '@/data/hooks';
import { TOKEN_RECUPERACION_PRUEBA } from '@/data/prueba';
import { erroresDe, esEmail } from '@/domain/formularios';

/** Recuperar la contraseña (rediseño 3.2), pasos 1 y 2: email › revisá tu email. El 3 es /recuperar/nueva/. */
export default function Recuperar() {
  const { enviar, pendiente, error } = useEnvio();
  const [email, setEmail] = useState('');
  const [local, setLocal] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function pedir() {
    if (!esEmail(email)) return setLocal('Escribí un email válido.');
    setLocal(null);
    const r = await enviar('recuperacion', { cuerpo: { email: email.trim() } }, email);
    if (r?.ok) setEnviado(true);
  }

  if (enviado)
    return (
      <Flujo
        titulo="Revisá tu ==email=="
        sub="Si hay una cuenta con ese email, te mandamos un enlace para elegir una contraseña nueva. Puede tardar unos minutos; mirá también en correo no deseado."
        atras={{ alTocar: () => setEnviado(false), etiqueta: 'Volver a escribir el email' }}
        paso={2}
        total={3}
        ilustracion={<Escena handy="handy-gota" ancho={93} alto={125} tono="amarillo" />}
        pie={
          <>
            <Enlace href="/ingresar/" className="hd-boton">
              Volver a ingresar
            </Enlace>
            <BotonHx variante="fantasma" cargando={pendiente} onClick={() => void pedir()}>
              Mandármelo de nuevo
            </BotonHx>
          </>
        }
      >
        <p className="du-email-elegido" role="status">
          <span>{email.trim()}</span>
        </p>
        {esVistaDePrueba ? (
          <Aviso tipo="info" titulo="Vista de prueba">
            <p>El email no se envía de verdad. Usá este enlace:</p>
            <p>
              <Enlace
                className="enlace-tarjeta"
                href={`/recuperar/nueva/#t=${TOKEN_RECUPERACION_PRUEBA}`}
              >
                Elegir contraseña nueva
              </Enlace>
            </p>
          </Aviso>
        ) : null}
      </Flujo>
    );

  const funcionInactiva = error?.codigo === 'funcion_inactiva';
  return (
    <Flujo
      titulo="Recuperá tu ==contraseña=="
      sub="Escribí el email de tu cuenta y te mandamos un enlace."
      atras={{ href: '/ingresar/', etiqueta: 'Volver a ingresar' }}
      paso={1}
      total={3}
      onSubmit={(e) => {
        e.preventDefault();
        void pedir();
      }}
      pie={
        <BotonHx type="submit" cargando={pendiente} icono="enviar">
          Mandarme el enlace
        </BotonHx>
      }
    >
      <Campo etiqueta="Email" error={local ?? erroresDe(error).email} requerido>
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
      {funcionInactiva ? (
        <Aviso tipo="alerta" titulo="Todavía no podemos mandar el enlace">
          Por ahora la recuperación por email no está habilitada. Escribile al equipo de Handy que
          te invitó a la demo.
        </Aviso>
      ) : error && !Object.keys(erroresDe(error)).length ? (
        <Aviso tipo="error">{error.mensaje}</Aviso>
      ) : null}
    </Flujo>
  );
}
