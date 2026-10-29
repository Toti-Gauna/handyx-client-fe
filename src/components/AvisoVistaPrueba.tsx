import { esVistaDePrueba } from '@/data';

/** Rótulo fijo de la vista de prueba: datos ficticios, sin backend. No existe en un build con API real. */
export function AvisoVistaPrueba() {
  if (!esVistaDePrueba) return null;
  return (
    <p className="aviso-prueba" role="note">
      Vista de prueba · datos ficticios, sin backend ni cuentas reales
    </p>
  );
}
