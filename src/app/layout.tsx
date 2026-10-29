import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/dm-sans/index.css';
import '@/styles/app.css';
import type { Metadata, Viewport } from 'next';
import { AvisoVistaPrueba } from '@/components/PanelPrueba';
import { AvisoRed, RegistroSW } from '@/components/Pwa';
import '@/styles/componentes.css';

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
    <html lang="es-AR">
      <body>
        <AvisoVistaPrueba />
        <AvisoRed />
        <RegistroSW />
        {children}
      </body>
    </html>
  );
}
