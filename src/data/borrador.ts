// Borrador del pedido armado con HandIA, en memoria (nunca en el navegador ni en la URL): HandIA lo deja y la pantalla
// "Pedir" lo toma para precargar "Contanos qué pasó". Se pierde al recargar, a propósito.
import type { Rubro } from '@/contracts/v1/pedidos';

export interface Borrador {
  readonly rubro: Rubro;
  readonly descripcion: string;
}

let borrador: Borrador | null = null;

export const dejarBorrador = (b: Borrador) => {
  borrador = b;
};
export const verBorrador = (): Borrador | null => borrador;
export const descartarBorrador = () => {
  borrador = null;
};
