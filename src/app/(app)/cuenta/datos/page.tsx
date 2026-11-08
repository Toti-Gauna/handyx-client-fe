'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
import { FormPerfil } from '@/components/FormPerfil';
import { useSesion } from '@/components/SesionProvider';
import type { Ubicacion } from '@/contracts/v1/cuenta';
import { direccionesGuardadas, direccionesServidor, suscribirDirecciones } from '@/data/direcciones';
import { fechaNumerica } from '@/domain/fechas';
import { GENEROS_ETIQUETA, nombrePais } from '@/domain/formularios';
import { AccionesFijas, Boton, Chip, DatoFila, Etiqueta, Nota, Tarjeta } from '@/ui';
import { BarraCentro, Movimiento, PantallaM } from '@/ui/mensajes';

const VOLVER = { href: '/cuenta/', etiqueta: 'Volver a tu cuenta' };
const texto = (u: Ubicacion) => [u.direccion, u.barrio, u.ciudad].filter(Boolean).join(' · ');

/**
 * Tus datos y direcciones (lienzo X-Datos): el perfil operativo y las direcciones. Lo que falta queda vacío (no se
 * inventa) y no se piden DNI ni documentos. El email de ingreso no es parte del perfil.
 */
export default function Datos() {
  const { sesion } = useSesion();
  const [editando, setEditando] = useState(useSearchParams().get('editar') === '1');
  const [guardado, setGuardado] = useState(false);
  const otras = useSyncExternalStore(suscribirDirecciones, direccionesGuardadas, direccionesServidor);
  const p = sesion.perfil;
  const nombre = [p.nombre, p.apellido].filter(Boolean).join(' ');
  const filas = [
    { icono: 'usuario', etiqueta: 'Nombre', valor: nombre || null },
    { icono: 'calendario', etiqueta: 'Fecha de nacimiento', valor: p.fechaNacimiento ? fechaNumerica(p.fechaNacimiento) : null },
    { icono: 'pin', etiqueta: 'Nacionalidad', valor: p.nacionalidad ? nombrePais(p.nacionalidad) : null },
    { icono: 'personas', etiqueta: 'Género', valor: p.genero ? (GENEROS_ETIQUETA[p.genero] ?? null) : null },
  ] as const;

  return (
    <PantallaM
      arriba={<BarraCentro titulo={editando ? 'Editar mis datos' : 'Tus datos'} volver={VOLVER} />}
      pie={
        editando ? null : (
          <AccionesFijas>
            <Boton
              icono="editar"
              onClick={() => {
                setGuardado(false);
                setEditando(true);
              }}
            >
              Editar mis datos
            </Boton>
          </AccionesFijas>
        )
      }
    >
      <div className="ds-cuerpo">
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
              <Nota icono="check" tono="exito" rol="status">
                Guardamos tus datos.
              </Nota>
            ) : null}
            <Tarjeta etiqueta="Tus datos">
              {filas.map((f) => (
                <DatoFila key={f.etiqueta} icono={f.icono} etiqueta={f.etiqueta} valor={f.valor ?? 'Sin completar'} />
              ))}
            </Tarjeta>
            <Tarjeta etiqueta="Direcciones" pie={{ texto: 'Sumar una dirección', href: '/cuenta/direcciones/' }}>
              <Etiqueta como="h2">Direcciones</Etiqueta>
              {p.ubicacion ? (
                <Movimiento
                  icono="casa"
                  titulo="Principal"
                  sub={texto(p.ubicacion)}
                  derecha={<Chip icono="check">Principal</Chip>}
                />
              ) : (
                <Nota icono="info" tono="gris">
                  Todavía no cargaste tu dirección.
                </Nota>
              )}
              {otras.map((d) => (
                <Movimiento key={d.id} icono={d.tipo === 'trabajo' ? 'maletin' : 'pin'} titulo={d.nombre} sub={texto(d.ubicacion)} />
              ))}
            </Tarjeta>
            <Nota icono="candado" tono="gris">
              Sin DNI ni CUIT. La dirección exacta la ve solo el especialista que elegís.
            </Nota>
          </>
        )}
      </div>
    </PantallaM>
  );
}
