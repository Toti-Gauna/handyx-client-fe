'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { FormPerfil } from '@/components/FormPerfil';
import { AvatarHx, Barra, entra, Pantalla } from '@/components/hx';
import { Icono } from '@/components/Icono';
import { Enlace } from '@/components/nav';
import { useSesion } from '@/components/SesionProvider';
import { Aviso } from '@/components/ui';
import { fechaNumerica } from '@/domain/fechas';
import { GENEROS_ETIQUETA, nombrePais } from '@/domain/formularios';

const VOLVER = { href: '/cuenta/', etiqueta: 'Volver a tu cuenta' };

/**
 * Datos personales (rediseño 3.8, como u-datos): el perfil operativo en una lista y "Editar mis datos". Lo que falta
 * queda vacío (no se inventa) y no se piden DNI ni documentos. El email de ingreso no es parte del perfil.
 */
export default function Datos() {
  const { sesion } = useSesion();
  const [editando, setEditando] = useState(useSearchParams().get('editar') === '1');
  const [guardado, setGuardado] = useState(false);
  const p = sesion.perfil;
  const nombre = [p.nombre, p.apellido].filter(Boolean).join(' ');
  const u = p.ubicacion;
  const filas: readonly [string, string | null][] = [
    ['Nombre', nombre || null],
    ['Fecha de nacimiento', p.fechaNacimiento ? fechaNumerica(p.fechaNacimiento) : null],
    ['Nacionalidad', p.nacionalidad ? nombrePais(p.nacionalidad) : null],
    ['Género', p.genero ? (GENEROS_ETIQUETA[p.genero] ?? null) : null],
    [
      'Dirección principal',
      u ? [u.direccion, u.barrio, u.ciudad].filter(Boolean).join(', ') : null,
    ],
  ];

  return (
    <Pantalla
      arriba={<Barra titulo={editando ? 'Editar mis datos' : 'Datos personales'} volver={VOLVER} />}
      pie={
        editando ? undefined : (
          <button
            type="button"
            className="hd-boton"
            onClick={() => {
              setGuardado(false);
              setEditando(true);
            }}
          >
            <Icono nombre="editar" />
            Editar mis datos
          </button>
        )
      }
      clase="du-datos-hx"
    >
      <div className="du-cuerpo du-datos">
        <div className="du-yo du-yo--centro" {...entra(1, 'pop')}>
          <AvatarHx nombre={nombre || 'Handyx'} tamano="grande" />
        </div>
        {editando ? (
          <FormPerfil
            onGuardado={() => {
              setGuardado(true);
              setEditando(false);
            }}
            onCancelar={() => setEditando(false)}
          />
        ) : (
          <>
            {guardado ? (
              <Aviso tipo="ok" rol="status">
                Guardamos tus datos.
              </Aviso>
            ) : null}
            <dl className="hd-tarjeta hd-tarjeta--gris hd-tarjeta--compacta hd-lista" {...entra(2)}>
              {filas.map(([etiqueta, valor]) => (
                <div key={etiqueta} className="hd-fila du-fila-dato">
                  <dt>{etiqueta}</dt>
                  <dd className={valor ? undefined : 'du-falta'}>{valor ?? 'Sin completar'}</dd>
                </div>
              ))}
            </dl>
            <p className="du-nota" {...entra(3)}>
              <Icono nombre="escudo" />
              <span>
                No pedimos DNI ni documentos. Lo que falta queda vacío: no inventamos datos. Tu
                dirección la ve solo el especialista con el que acordás un trabajo. Otras
                direcciones, en <Enlace href="/cuenta/direcciones/">Direcciones</Enlace>.
              </span>
            </p>
          </>
        )}
      </div>
    </Pantalla>
  );
}
