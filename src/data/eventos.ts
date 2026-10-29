// Canales internos (en memoria) entre los hooks de datos y los proveedores de la app.
type Canal = 'sesion_vencida' | 'no_autenticado' | 'reingreso' | 'actualizar';

const oyentes: Record<Canal, Set<() => void>> = {
  sesion_vencida: new Set(),
  no_autenticado: new Set(),
  reingreso: new Set(),
  actualizar: new Set(),
};

export function emitir(canal: Canal): void {
  for (const f of [...oyentes[canal]]) f();
}

export function escuchar(canal: Canal, f: () => void): () => void {
  oyentes[canal].add(f);
  return () => oyentes[canal].delete(f);
}
