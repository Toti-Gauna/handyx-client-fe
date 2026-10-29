import type { Metadata } from 'next';
import Image from 'next/image';
import { Titulo } from '@/components/Titulo';
import { Reintentar } from './Reintentar';

export const metadata: Metadata = { title: 'Sin conexión' };

/**
 * La muestra el service worker cuando no hay red y la pantalla pedida no estaba guardada. No tiene datos ni acciones
 * simuladas: nada de lo que se intentó sin conexión se envió.
 */
export default function SinConexion() {
  return (
    <div className="estado">
      <Image
        className="estado__handy"
        src="/img/handy-cano-roto.webp"
        alt=""
        width={120}
        height={120}
        priority
      />
      <Titulo texto="Estás ==sin conexión==" />
      <p style={{ margin: 0 }}>
        No pudimos abrir esta pantalla. Lo que hayas intentado hacer sin conexión{' '}
        <strong>no se envió</strong>: ni pedidos, ni respuestas a propuestas, ni pagos, ni mensajes.
      </p>
      <p className="texto-suave" style={{ margin: 0 }}>
        Cuando vuelva la señal, reintentá. Vas a ver el estado real que tiene el servidor.
      </p>
      <Reintentar />
    </div>
  );
}
