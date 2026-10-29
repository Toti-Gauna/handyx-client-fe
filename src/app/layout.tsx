import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/dm-sans/index.css';
import '@/styles/app.css';
import type { Metadata, Viewport } from 'next';
import { AvisoVistaPrueba } from '@/components/PanelPrueba';
import { AvisoRed, RegistroSW } from '@/components/Pwa';
import { SCRIPT_SPLASH, Splash } from '@/components/Splash';
import '@/styles/componentes.css';
// Kit visual de la demo de la landing (generado con scripts/kit.mjs) y sus ajustes para la app.
import '@/styles/kit/app.css';
import '@/styles/kit/hd.css';
import '@/styles/kit/usuario.css';
import '@/styles/kit/ajustes.css';
import '@/styles/splash.css';

export const metadata: Metadata = {
  title: { default: 'Handyx', template: '%s · Handyx' },
  description: 'Especialistas del hogar en Mar del Plata.',
  applicationName: 'Handyx',
  robots: { index: false, follow: false },
  icons: { icon: '/icono-app-192.png', apple: '/icono-app-180.png' },
  appleWebApp: { capable: true, title: 'Handyx', statusBarStyle: 'default' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1f57a8',
};

export default function RaizLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_SPLASH }} />
      </head>
      <body>
        <Splash />
        <AvisoVistaPrueba />
        <AvisoRed />
        <RegistroSW />
        {children}
      </body>
    </html>
  );
}
