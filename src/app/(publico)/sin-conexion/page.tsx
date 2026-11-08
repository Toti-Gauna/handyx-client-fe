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
    <EstadoSistema sinSenal titulo="Estás sin ==conexión==" acciones={<Reintentar />}>
      <p>
        No se mandó nada. Lo que hayas intentado hacer sin conexión <strong>no se envió</strong>: ni
        pedidos, ni respuestas a propuestas, ni pagos, ni mensajes.
      </p>
      <p>Cuando vuelva la señal, reintentá y revisá que tu mensaje o tu pedido se hayan enviado.</p>
    </EstadoSistema>
  );
}
