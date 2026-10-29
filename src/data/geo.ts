// Ubicación: se pide UNA vez, con permiso puntual y a pedido del usuario. Nunca se sigue en segundo plano.
import { esVistaDePrueba } from './index.ts';
import { prueba } from './prueba.ts';

export type ResultadoGeo =
  | {
      readonly tipo: 'ok';
      readonly lat: number;
      readonly lng: number;
      readonly precisionMetros: number;
    }
  | {
      readonly tipo: 'imprecisa';
      readonly lat: number;
      readonly lng: number;
      readonly precisionMetros: number;
    }
  | { readonly tipo: 'denegada' }
  | { readonly tipo: 'sin_senal' }
  | { readonly tipo: 'no_soportada' };

/** Coordenadas públicas del centro de Mar del Plata para la vista de prueba (no son de ninguna persona). */
const CENTRO_PRUEBA = { lat: -38.0055, lng: -57.5426 } as const;
const PRECISION_MAXIMA_METROS = 1000;

export async function pedirUbicacionUnaVez(): Promise<ResultadoGeo> {
  if (esVistaDePrueba) {
    await new Promise((r) => setTimeout(r, 400));
    if (prueba.geo === 'denegada') return { tipo: 'denegada' };
    if (prueba.geo === 'sin_senal') return { tipo: 'sin_senal' };
    return prueba.geo === 'imprecisa'
      ? { tipo: 'imprecisa', ...CENTRO_PRUEBA, precisionMetros: 3200 }
      : { tipo: 'ok', ...CENTRO_PRUEBA, precisionMetros: 25 };
  }
  if (typeof navigator === 'undefined' || !('geolocation' in navigator))
    return { tipo: 'no_soportada' };
  return new Promise((resolver) => {
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const datos = {
          lat: p.coords.latitude,
          lng: p.coords.longitude,
          precisionMetros: Math.round(p.coords.accuracy),
        };
        resolver(
          datos.precisionMetros > PRECISION_MAXIMA_METROS
            ? { tipo: 'imprecisa', ...datos }
            : { tipo: 'ok', ...datos },
        );
      },
      (e) =>
        resolver(e.code === e.PERMISSION_DENIED ? { tipo: 'denegada' } : { tipo: 'sin_senal' }),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 0 },
    );
  });
}
