import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Marco } from '@/components/Marco';

export default function NoEncontrada() {
  return (
    <Marco>
      <div className="estado">
        <Image
          className="estado__handy"
          src="/img/handy-llave-rota.webp"
          alt=""
          width={120}
          height={120}
        />
        <h1 className="subtitulo">No encontramos esta página</h1>
        <Link className="boton" href={'/' as Route}>
          Volver al inicio
        </Link>
      </div>
    </Marco>
  );
}
