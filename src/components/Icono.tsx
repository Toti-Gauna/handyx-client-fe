import { type NombreIcono, TRAZOS } from './trazos';

/** Ícono decorativo de la landing. El nombre accesible lo da el control que lo contiene. */
export function Icono({
  nombre,
  className = 'icono',
}: {
  nombre: NombreIcono;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      // Trazos estáticos del repo (no hay contenido de usuario).
      dangerouslySetInnerHTML={{ __html: TRAZOS[nombre] }}
    />
  );
}
