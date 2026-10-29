import type { NextConfig } from 'next';
import { leerEntorno } from './src/config/entorno';

// Falla el build ante un entorno inválido (p. ej. producción sin API real): nunca se publica una app en mocks.
leerEntorno({
  NEXT_PUBLIC_ENTORNO: process.env.NEXT_PUBLIC_ENTORNO,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

const nextConfig: NextConfig = {
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
