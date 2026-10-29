import type { MetadataRoute } from 'next';

// Export estático: se genera una vez en el build como /manifest.webmanifest.
export const dynamic = 'force-static';

/** Manifest de la PWA. Mismos íconos y colores que la landing (la gota sobre azul respeta la zona segura). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Handyx',
    short_name: 'Handyx',
    description:
      'Especialistas del hogar en Mar del Plata. Pedís, comparás propuestas y elegís vos.',
    lang: 'es-AR',
    dir: 'ltr',
    start_url: '/inicio/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#ffffff',
    theme_color: '#1f57a8',
    categories: ['lifestyle', 'utilities'],
    icons: [
      { src: '/icono-app-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icono-app-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icono-app-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icono-app-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Pedir un servicio', short_name: 'Pedir', url: '/pedir/' },
      { name: 'Mis pedidos', short_name: 'Pedidos', url: '/pedidos/' },
    ],
  };
}
