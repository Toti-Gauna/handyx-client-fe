'use client';

import { useState } from 'react';
import { Enlace } from '@/components/nav';
import { Titulo } from '@/components/Titulo';
import { Aviso, Boton, Campo } from '@/components/ui';
import { esVistaDePrueba } from '@/data';
import { useEnvio } from '@/data/hooks';
import { TOKEN_RECUPERACION_PRUEBA } from '@/data/prueba';
import { erroresDe, esEmail } from '@/domain/formularios';

export default function Recuperar() {
  const { enviar, pendiente, error } = useEnvio();
  const [email, setEmail] = useState('');
  const [local, setLocal] = useState<string | null>(null);
  const [enviado, setEnviado] = useState(false);

  async function pedir(e: React.FormEvent) {
    e.preventDefault();
    if (!esEmail(email)) return setLocal('Escribí un email válido.');
    setLocal(null);
    const r = await enviar('recuperacion', { cuerpo: { email: email.trim() } }, email);
    if (r?.ok) setEnviado(true);
  }

  if (enviado)
    return (
      <>
        <Titulo texto="Revisá tu ==email==" />
        <Aviso tipo="ok" rol="status">
          Si hay una cuenta con ese email, te mandamos un enlace para elegir una contraseña nueva.
          Puede tardar unos minutos.
        </Aviso>
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
        <div className="acciones">
          <Enlace href="/ingresar/" className="boton boton--claro">
            Volver a ingresar
          </Enlace>
        </div>
      </>
    );

  const funcionInactiva = error?.codigo === 'funcion_inactiva';
  return (
    <>
      <Titulo texto="Recuperá tu ==contraseña==" />
      <form onSubmit={pedir} noValidate>
        <Campo etiqueta="Email" error={local ?? erroresDe(error).email} requerido>
          {(p) => (
            <input
              {...p}
              className="entrada"
              type="email"
              autoComplete="email"
              inputMode="email"
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
        <div className="acciones">
          <Boton type="submit" cargando={pendiente}>
            Mandarme el enlace
          </Boton>
          <Enlace href="/ingresar/" className="boton boton--texto">
            Volver a ingresar
          </Enlace>
        </div>
      </form>
    </>
  );
}
