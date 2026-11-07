// Compatibilidad con la API real (lote 4.7d): al abrir la app con `NEXT_PUBLIC_API_BASE_URL`, se compara la versión
// del contrato que compiló el front (src/contracts/v1, copia byte a byte del BE) con la que publica el servidor en
// `/v1/version`. Si no coinciden, la app lo avisa en vez de mostrar errores raros de validación pantalla por pantalla.
import { VERSION_CONTRATO } from '../contracts/v1/endpoints.ts';
import type { ClienteApi } from './cliente.ts';

/** `sin_respuesta`: no se pudo preguntar (red, servidor caído); cada pantalla ya muestra su propio error. */
export type Compatibilidad = 'compatible' | 'incompatible' | 'sin_respuesta';

export async function revisarContrato(
  api: Pick<ClienteApi, 'llamar'>,
  local: string = VERSION_CONTRATO,
): Promise<Compatibilidad> {
  try {
    const { contrato } = await api.llamar('version');
    return contrato === local ? 'compatible' : 'incompatible';
  } catch {
    return 'sin_respuesta';
  }
}
