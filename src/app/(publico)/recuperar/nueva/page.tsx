'use client';

import { useState } from 'react';
import { BotonHx, CampoContrasena, Escena, Flujo } from '@/components/acceso';
import { Enlace, useIr } from '@/components/nav';
import { Aviso } from '@/components/ui';
import { useEnvio, useParametroDeFragmento } from '@/data/hooks';
import { CONTRASENA_MINIMA } from '@/domain/formularios';

/** Recuperar la contraseña, paso 3 (rediseño 3.2): contraseña nueva con el token del enlace. */
export default function NuevaContrasena() {
  const ir = useIr();
  const { enviar, pendiente, error } = useEnvio();
  // El token viaja en el fragmento (#t=): no llega al servidor ni al Referer.
  const token = useParametroDeFragmento('t');
  const [contrasena, setContrasena] = useState('');
  const [repetida, setRepetida] = useState('');
  const [local, setLocal] = useState<Record<string, string>>({});

  async function guardar() {
    const n: Record<string, string> = {};
    if (contrasena.length < CONTRASENA_MINIMA)
      n.contrasena = `Usá al menos ${CONTRASENA_MINIMA} caracteres.`;
    if (repetida !== contrasena) n.repetida = 'Las contraseñas no coinciden.';
    setLocal(n);
    if (Object.keys(n).length || !token) return;
    const r = await enviar(
      'recuperacionConfirmar',
      { cuerpo: { token, contrasena } },
      `${token}|${contrasena}`,
    );
    if (r?.ok) ir('/ingresar/?motivo=clave', { reemplazar: true });
  }

  if (token === null) return null;
  if (!token)
    return (
      <Flujo
        titulo="Enlace ==incompleto=="
        sub="Este enlace no es válido. Pedí uno nuevo y abrilo desde el email."
        atras={{ href: '/ingresar/', etiqueta: 'Volver a ingresar' }}
        ilustracion={<Escena handy="handy-llave-rota" ancho={581} alto={547} />}
        pie={
          <Enlace href="/recuperar/" className="hd-boton">
            Pedir un enlace nuevo
          </Enlace>
        }
      />
    );

  return (
    <Flujo
      titulo="Elegí una ==contraseña nueva=="
      atras={{ href: '/ingresar/', etiqueta: 'Volver a ingresar' }}
      paso={3}
      total={3}
      onSubmit={(e) => {
        e.preventDefault();
        void guardar();
      }}
      pie={
        <BotonHx type="submit" cargando={pendiente}>
          Guardar contraseña
        </BotonHx>
      }
    >
      <CampoContrasena
        etiqueta="Contraseña nueva"
        valor={contrasena}
        onCambio={setContrasena}
        error={local.contrasena}
        nueva
      />
      <CampoContrasena
        etiqueta="Repetila"
        valor={repetida}
        onCambio={setRepetida}
        error={local.repetida}
      />
      {error ? (
        <Aviso
          tipo="error"
          titulo={error.codigo === 'conflicto' ? 'El enlace ya no sirve' : 'No pudimos guardarla'}
        >
          {error.mensaje}{' '}
          {error.codigo === 'conflicto' ? (
            <Enlace className="enlace-tarjeta" href="/recuperar/">
              Pedir uno nuevo
            </Enlace>
          ) : null}
        </Aviso>
      ) : null}
    </Flujo>
  );
}
