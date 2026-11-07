import { existsSync } from 'node:fs';
import type { NextConfig } from 'next';
import { leerEntorno } from './src/config/entorno';

// Falla el build ante un entorno inválido (p. ej. producción sin API real): nunca se publica una app en mocks.
leerEntorno({
  NEXT_PUBLIC_ENTORNO: process.env.NEXT_PUBLIC_ENTORNO,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// El mapa de Mar del Plata (npm run mdp:datos) es un archivo generado: si no está al compilar, la app muestra el mapa
// ilustrado sin pedir un archivo que no existe.
const mapaDatos = existsSync('public/mapa/mdp.pmtiles');
if (!mapaDatos)
  console.warn(
    'Sin public/mapa/mdp.pmtiles: el mapa se ve ilustrado (generalo con npm run mdp:datos).',
  );

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_MAPA_DATOS: mapaDatos ? '1' : '' },
  // Export estático para Hostinger (ADR-0001): sin servidor Node, sin SSR, sin middleware ni server actions.
  output: 'export',
  // Cada ruta sale como carpeta/index.html: recargar o abrir un link directo funciona sin reglas de rewrite.
  trailingSlash: true,
  images: { unoptimized: true },
  poweredByHeader: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  typedRoutes: true,
};

export default nextConfig;
