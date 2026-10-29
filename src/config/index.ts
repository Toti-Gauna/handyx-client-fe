import { leerEntorno } from './entorno';

// Acceso literal a cada variable: Next solo reemplaza `process.env.NEXT_PUBLIC_*` escrito así, completo.
export const configuracion = leerEntorno({
  NEXT_PUBLIC_ENTORNO: process.env.NEXT_PUBLIC_ENTORNO,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});
