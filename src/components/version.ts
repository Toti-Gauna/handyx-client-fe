'use client';

// Versión nueva de la app (rediseño 3.9): cuando el service worker nuevo queda instalado y esperando, la app lo avisa y
// la persona decide cuándo actualizar (recarga la pantalla). Nunca se recarga sola: podría perder lo que estaba
// escribiendo. En la vista de prueba se puede simular desde el panel.

export interface VersionNueva {
  /** Activa la versión nueva y recarga. */
  readonly actualizar: () => void;
}

let actual: VersionNueva | null = null;
let descartada = false;
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((f) => f());

export function suscribirVersion(f: () => void): () => void {
  oyentes.add(f);
  return () => oyentes.delete(f);
}
export const versionNueva = (): VersionNueva | null => (descartada ? null : actual);
export const versionNuevaServidor = (): VersionNueva | null => null;

export function hayVersionNueva(v: VersionNueva): void {
  actual = v;
  descartada = false;
  avisar();
}

/** "Después": se oculta hasta la próxima versión (la nueva se activa sola al cerrar todas las pestañas). */
export function descartarVersion(): void {
  descartada = true;
  avisar();
}
