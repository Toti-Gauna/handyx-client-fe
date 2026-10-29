'use client';

import { esVistaDePrueba } from '@/data';
import { urlDeFoto } from '@/data/media';

/** Foto privada y firmada: se muestra tal cual (no pasa por el optimizador de imágenes, que no existe en un export estático). */
export function FotoPrivada({
  url,
  alt,
  className,
}: {
  url: string;
  alt: string;
  className?: string;
}) {
  const src = urlDeFoto(url, esVistaDePrueba);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src={src} alt={alt} loading="lazy" />
  );
}
