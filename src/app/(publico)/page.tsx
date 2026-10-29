import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Titulo } from '@/components/Titulo';
import { esVistaDePrueba } from '@/data';

// Entrada de la demo cerrada: sin invitación no hay alta. La pantalla definitiva es del lote 2.1.
export default function Bienvenida() {
  return (
    <>
      <Image
        className="estado__handy"
        src="/img/handys-grupo.webp"
        alt=""
        width={240}
        height={160}
        priority
        style={{ width: '70%', height: 'auto', margin: '8px auto 0' }}
      />
      <Titulo texto="Especialistas del hogar en ==Mar del Plata==" />
      <p>
        Pedís lo que necesitás, recibís propuestas y elegís con quién trabajar. Durante la demo
        cerrada se entra con invitación.
      </p>
      <div className="acciones">
        <Link className="boton" href={'/registro/' as Route}>
          Tengo invitación
        </Link>
        <Link className="boton boton--contorno" href={'/ingresar/' as Route}>
          Ya tengo cuenta
        </Link>
        {esVistaDePrueba ? (
          <Link className="boton boton--claro" href={'/mapa/' as Route}>
            Ver el mapa de pantallas
          </Link>
        ) : null}
      </div>
    </>
  );
}
