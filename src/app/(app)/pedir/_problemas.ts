// «¿Qué pasa?» (P-Que): las situaciones más comunes de cada rubro, para elegir con un toque. Son atajos para escribir
// el pedido (van al texto que lee el especialista), no categorías nuevas del contrato.
import type { Rubro } from '@/contracts/v1/pedidos';

export const PROBLEMAS: Record<Rubro, readonly string[]> = {
  plomeria: [
    'Pierde o gotea una canilla',
    'Se tapó un desagüe',
    'Pérdida de agua en una pared',
    'Instalar o cambiar algo',
  ],
  electricidad: [
    'Se corta la luz o salta la térmica',
    'Un enchufe o una llave no anda',
    'Instalar una luz o un ventilador',
    'Revisar la instalación',
  ],
  gas: [
    'El calefón o el termotanque no prende',
    'Siento olor a gas',
    'Revisar una estufa o la cocina',
    'Instalar o cambiar un artefacto',
  ],
  cerrajeria: [
    'No puedo abrir la puerta',
    'La cerradura se traba',
    'Cambiar la cerradura',
    'Hacer una copia o cambiar el cilindro',
  ],
  albanileria: [
    'Hay humedad en una pared',
    'Se rompió o se cayó revoque',
    'Arreglar cerámica o piso',
    'Un arreglo chico de obra',
  ],
  aire_acondicionado: [
    'No enfría o no calienta',
    'Pierde agua',
    'Service y limpieza',
    'Instalar un equipo',
  ],
};

/** El texto que se manda: lo que eligió y lo que escribió, en ese orden. */
export function armarDescripcion(problema: string | null, texto: string): string {
  const t = texto.trim();
  if (!problema) return t;
  if (!t) return `${problema}.`;
  return `${problema}. ${t}`;
}
