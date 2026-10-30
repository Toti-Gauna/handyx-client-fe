import type { Route } from 'next';
import Link from 'next/link';
import { Icono } from '@/components/Icono';
import { Marco } from '@/components/Marco';
import { EstadoSistema } from '@/components/Sistema';

export default function NoEncontrada() {
  return (
    <Marco>
      <EstadoSistema
        handy={{ img: 'handy-llave-rota', ancho: 581, alto: 547 }}
        titulo="No encontramos esta ==página=="
        acciones={
          <>
            <Link className="hd-boton" href={'/' as Route}>
              <Icono nombre="casa" />
              Volver al inicio
            </Link>
            <Link className="hd-boton hd-boton--fantasma" href={'/ayuda/' as Route}>
              Centro de ayuda
            </Link>
          </>
        }
      >
        <p>
          Puede que el enlace esté incompleto o que la pantalla ya no exista. No se perdió nada de
          tu cuenta.
        </p>
      </EstadoSistema>
    </Marco>
  );
}
