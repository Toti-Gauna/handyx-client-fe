// Banderas de la vista de prueba (solo existen con el adaptador mock). No se guardan en el navegador.
export type GeoSimulada = 'ok' | 'denegada' | 'imprecisa' | 'sin_senal';

export const prueba: { geo: GeoSimulada; escenario: string | null } = {
  geo: 'ok',
  escenario: null,
};

/** Escenario pedido en la URL (`?escenario=`), leído una sola vez al cargar. */
export function escenarioDeUrl(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('escenario');
}

/** Datos de acceso de la vista de prueba (ficticios): se muestran en pantalla solo con el adaptador mock. */
export const CUENTA_PRUEBA = {
  email: 'usuaria@example.test',
  contrasena: 'handyx-demo-1234',
} as const;
export const INVITACION_PRUEBA = 'DEMO2026';
/** Token del enlace de recuperación de la vista de prueba (el email real no se envía). */
export const TOKEN_RECUPERACION_PRUEBA = 'DEMOtokenDEMOtokenDEMOtokenDEMO1234';
