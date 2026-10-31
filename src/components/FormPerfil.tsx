'use client';

import { useState } from 'react';
import { GENEROS, type PerfilUsuario } from '@/contracts/v1/cuenta';
import { useEnvio } from '@/data/hooks';
import { GENEROS_ETIQUETA, NACIONALIDADES, erroresDe, nombrePais } from '@/domain/formularios';
import { FormUbicacion, aUbicacion, deUbicacion, type UbicacionForm } from './FormUbicacion';
import { BotonHx } from './acceso';
import { useSesion } from './SesionProvider';
import { Aviso, Boton, Campo } from './ui';

/** Grupos del perfil: 1 nombre y apellido · 2 nacimiento, nacionalidad y género · 3 ubicación. */
export type GrupoPerfil = 1 | 2 | 3;

/**
 * Estado y guardado del perfil operativo (PROD-15): nombre, apellido, fecha de nacimiento, nacionalidad, género y
 * ubicación real. Sin DNI, CUIT ni certificados. Lo usan el onboarding por pasos y "Mis datos".
 */
export function usePerfil() {
  const { sesion, recargar } = useSesion();
  const p = sesion.perfil;
  const envio = useEnvio();
  const [nombre, setNombre] = useState(p.nombre ?? '');
  const [apellido, setApellido] = useState(p.apellido ?? '');
  const [nacimiento, setNacimiento] = useState(p.fechaNacimiento ?? '');
  const [nacionalidad, setNacionalidad] = useState(p.nacionalidad ?? 'AR');
  const [genero, setGenero] = useState<PerfilUsuario['genero'] | ''>(p.genero ?? '');
  const [ubicacion, setUbicacion] = useState<UbicacionForm>(deUbicacion(p.ubicacion));
  const [local, setLocal] = useState<Record<string, string>>({});
  // Versión que devolvió el último guardado: el paso siguiente puede guardar antes de que la sesión se recargue.
  const [guardada, setGuardada] = useState(sesion.perfilVersion);
  const version = Math.max(guardada, sesion.perfilVersion);

  function validar(grupos: readonly GrupoPerfil[]): Record<string, string> {
    const n: Record<string, string> = {};
    if (grupos.includes(1)) {
      if (!nombre.trim()) n.nombre = 'Escribí tu nombre.';
      if (!apellido.trim()) n.apellido = 'Escribí tu apellido.';
    }
    if (grupos.includes(2)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(nacimiento))
        n.fechaNacimiento = 'Elegí tu fecha de nacimiento.';
      if (!genero) n.genero = 'Elegí una opción.';
    }
    if (grupos.includes(3)) {
      if (!ubicacion.ciudad.trim()) n.ciudad = 'Escribí tu ciudad.';
      if (!ubicacion.direccion.trim()) n.direccion = 'Escribí tu dirección.';
    }
    return n;
  }

  /** Valida y guarda los grupos indicados. true si quedó guardado. */
  async function guardar(grupos: readonly GrupoPerfil[]): Promise<boolean> {
    const n = validar(grupos);
    setLocal(n);
    if (Object.keys(n).length) return false;
    const cuerpo: Record<string, unknown> = { version };
    if (grupos.includes(1))
      Object.assign(cuerpo, { nombre: nombre.trim(), apellido: apellido.trim() });
    if (grupos.includes(2))
      Object.assign(cuerpo, { fechaNacimiento: nacimiento, nacionalidad, genero });
    if (grupos.includes(3)) Object.assign(cuerpo, { ubicacion: aUbicacion(ubicacion) });
    const r = await envio.enviar('perfil', { cuerpo: cuerpo as never }, JSON.stringify(cuerpo));
    if (r?.ok) {
      setGuardada(r.datos.perfilVersion);
      recargar();
      return true;
    }
    return false;
  }

  return {
    valores: { nombre, apellido, nacimiento, nacionalidad, genero, ubicacion },
    set: { setNombre, setApellido, setNacimiento, setNacionalidad, setGenero, setUbicacion },
    errores: { ...erroresDe(envio.error), ...local },
    guardar,
    pendiente: envio.pendiente,
    error: envio.error,
    limpiar: envio.limpiar,
    recargar,
  };
}

export type Perfil = ReturnType<typeof usePerfil>;

/** Campos de uno o más grupos del perfil (mismos campos en el onboarding y en "Mis datos"). */
export function CamposPerfil({
  perfil,
  grupos,
  geo,
}: {
  perfil: Perfil;
  grupos: readonly GrupoPerfil[];
  geo?: React.ComponentProps<typeof FormUbicacion>['geo'];
}) {
  const { valores: v, set, errores } = perfil;
  return (
    <>
      {grupos.includes(1) ? (
        <>
          <Campo etiqueta="Nombre" error={errores.nombre} requerido>
            {(c) => (
              <input
                {...c}
                className="entrada"
                autoComplete="given-name"
                value={v.nombre}
                onChange={(e) => set.setNombre(e.target.value)}
              />
            )}
          </Campo>
          <Campo etiqueta="Apellido" error={errores.apellido} requerido>
            {(c) => (
              <input
                {...c}
                className="entrada"
                autoComplete="family-name"
                value={v.apellido}
                onChange={(e) => set.setApellido(e.target.value)}
              />
            )}
          </Campo>
        </>
      ) : null}
      {grupos.includes(2) ? (
        <>
          <Campo
            etiqueta="Fecha de nacimiento"
            error={errores.fechaNacimiento}
            ayuda="Tenés que ser mayor de 18 años."
            requerido
          >
            {(c) => (
              <input
                {...c}
                className="entrada"
                type="date"
                autoComplete="bday"
                value={v.nacimiento}
                onChange={(e) => set.setNacimiento(e.target.value)}
              />
            )}
          </Campo>
          <Campo etiqueta="Nacionalidad" error={errores.nacionalidad} requerido>
            {(c) => (
              <select
                {...c}
                className="entrada"
                value={v.nacionalidad}
                onChange={(e) => set.setNacionalidad(e.target.value)}
              >
                {NACIONALIDADES.map((n) => (
                  <option key={n} value={n}>
                    {nombrePais(n)}
                  </option>
                ))}
              </select>
            )}
          </Campo>
          <Campo etiqueta="Género" error={errores.genero} requerido>
            {(c) => (
              <select
                {...c}
                className="entrada"
                value={v.genero}
                onChange={(e) => set.setGenero(e.target.value as PerfilUsuario['genero'])}
              >
                <option value="">Elegí una opción</option>
                {GENEROS.map((g) => (
                  <option key={g} value={g}>
                    {GENEROS_ETIQUETA[g]}
                  </option>
                ))}
              </select>
            )}
          </Campo>
        </>
      ) : null}
      {grupos.includes(3) ? (
        <FormUbicacion
          valor={v.ubicacion}
          onCambio={set.setUbicacion}
          errores={errores}
          {...(geo ? { geo } : {})}
        />
      ) : null}
    </>
  );
}

/** Avisos de error y de conflicto de versión al guardar el perfil. */
export function ErroresPerfil({ perfil }: { perfil: Perfil }) {
  const { error, limpiar, recargar } = perfil;
  if (error?.conflicto === 'version')
    return (
      <Aviso tipo="alerta" titulo="Tu perfil cambió en otro lado">
        <Boton
          chico
          variante="claro"
          onClick={() => {
            limpiar();
            recargar();
          }}
        >
          Actualizar
        </Boton>
      </Aviso>
    );
  if (error && !Object.keys(erroresDe(error)).length)
    return (
      <Aviso tipo="error" titulo="No pudimos guardar">
        {error.mensaje}
      </Aviso>
    );
  return null;
}

/** "Datos personales": el perfil completo en un formulario. */
export function FormPerfil({
  onGuardado,
  onCancelar,
}: {
  onGuardado?: () => void;
  onCancelar?: () => void;
}) {
  const perfil = usePerfil();
  return (
    <form
      className="du-form-perfil"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await perfil.guardar([1, 2, 3])) onGuardado?.();
      }}
      noValidate
    >
      <CamposPerfil perfil={perfil} grupos={[1, 2, 3]} />
      <ErroresPerfil perfil={perfil} />
      <div className="du-form-perfil__botones">
        <BotonHx type="submit" icono="check" cargando={perfil.pendiente}>
          Guardar cambios
        </BotonHx>
        {onCancelar ? (
          <BotonHx variante="fantasma" onClick={onCancelar} disabled={perfil.pendiente}>
            Cancelar
          </BotonHx>
        ) : null}
      </div>
    </form>
  );
}
