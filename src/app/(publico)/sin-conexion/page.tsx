import type { Metadata } from 'next';
import { EstadoSistema } from '@/components/Sistema';
import { Reintentar } from './Reintentar';

export const metadata: Metadata = { title: 'Sin conexión' };

/**
 * La muestra el service worker cuando no hay red y la pantalla pedida no estaba guardada. No tiene datos ni acciones
 * simuladas: nada de lo que se intentó sin conexión se envió.
 */
export default function SinConexion() {
  return (
    <EstadoSistema
      handy={{ img: 'handy-cano-roto', ancho: 354, alto: 405 }}
      titulo="Estás ==sin conexión=="
      acciones={<Reintentar />}
    >
      <p>
        No pudimos abrir esta pantalla. Lo que hayas intentado hacer sin conexión{' '}
        <strong>no se envió</strong>: ni pedidos, ni respuestas a propuestas, ni pagos, ni mensajes.
      </p>
      <p className="sistema-hx__suave">
        Cuando vuelva la señal, reintentá. Vas a ver el estado real que tiene el servidor.
      </p>
    </EstadoSistema>
  );
}
