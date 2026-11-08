import '@fontsource-variable/archivo/wdth.css';
import '@fontsource-variable/dm-sans/index.css';
import '@/styles/app.css';
import type { Metadata, Viewport } from 'next';
import { AvisoVistaPrueba } from '@/components/PanelPrueba';
import { AvisoContrato, AvisoRed, AvisoVersion, RegistroSW } from '@/components/Pwa';
import { DesplazarConTeclado } from '@/components/DesplazarConTeclado';
import { SCRIPT_SPLASH, Splash } from '@/components/Splash';
import '@/styles/componentes.css';
// Kit visual de la demo de la landing (generado con scripts/kit.mjs) y sus ajustes para la app.
import '@/styles/kit/app.css';
import '@/styles/kit/hd.css';
import '@/styles/kit/usuario.css';
import '@/styles/kit/ajustes.css';
import '@/styles/splash.css';
// Lenguaje visual de HandIA (fase R · R3/R8): clases .hia-* para los componentes de components/handia/.
import '@/styles/handia.css';
import '@/styles/ds.css';
// Estilos propios de cada grupo de la Fase 7 (clases con prefijo: dsa-, dsi-, dsp-, dss-, ds-m-, dsh-, dh-), cargados
// una vez acá para que el orden de la cascada no dependa de la ruta por la que se entró.
import '@/styles/ds-acceso.css';
import '@/styles/ds-inicio.css';
import '@/styles/ds-pedir.css';
import '@/styles/ds-seguimiento.css';
import '@/styles/ds-mensajes.css';
import '@/styles/ds-hogar.css';
import '@/styles/ds-herramientas.css';

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
        <AvisoContrato />
        <AvisoVersion />
        <RegistroSW />
        <DesplazarConTeclado />
        {children}
      </body>
    </html>
  );
}
