// Datos 100 % ficticios de la vista de prueba. Ids deterministas `de000000-…` (de = demo), nombres inventados,
// direcciones inexistentes. Nada de esto representa personas reales ni se mezcla con la API real.
import type { Sesion } from '../../contracts/v1/cuenta.ts';
import type { EstadoFee, PoliticaFee } from '../../contracts/v1/fee.ts';
import type { Pedido, Rubro } from '../../contracts/v1/pedidos.ts';
import { RUBROS } from '../../contracts/v1/pedidos.ts';

export const idDemo = (n: number): string =>
  `de000000-0000-4000-8000-${n.toString(16).padStart(12, '0')}`;

/** "Hoy" fijo de la vista de prueba: martes 17/11/2026 12:00 en Buenos Aires (como la demo de la landing). */
export const AHORA_DEMO = '2026-11-17T15:00:00.000Z';

/** Demo cerrada: 10/11/2026 00:00 → 10/12/2026 00:00 (Buenos Aires). Supuesto de fin a confirmar (handoff). */
export const POLITICA_DEMO: PoliticaFee = {
  id: idDemo(900),
  version: 'fee-demo-2026-11-10',
  alcance: 'demo_cerrada',
  usuarioBp: 0,
  especialistaBp: 0,
  vigenteDesde: '2026-11-10T03:00:00.000Z',
  vigenteHasta: '2026-12-10T03:00:00.000Z',
  zonaHoraria: 'America/Argentina/Buenos_Aires',
};

export interface DatosMock {
  sesion: Sesion;
  fee: EstadoFee;
  rubros: { id: Rubro; disponible: boolean }[];
  ciudadesConCobertura: string[];
  pedidos: Pedido[];
}

export function datosIniciales(ahora: string = AHORA_DEMO): DatosMock {
  return {
    sesion: {
      cuenta: { id: idDemo(1), estado: 'activa', roles: ['usuario'] },
      perfil: {
        nombre: 'Usuaria',
        apellido: 'Demo',
        fechaNacimiento: '1990-05-20',
        nacionalidad: 'AR',
        genero: 'prefiero_no_decir',
        ubicacion: {
          ciudad: 'Mar del Plata',
          barrio: 'La Perla',
          direccion: 'Calle Ficticia 1650',
          referencia: null,
          origen: 'manual',
          coordenadas: null,
        },
      },
      perfilVersion: 1,
      pendientes: { camposPerfil: [], documentos: [] },
      aceptaciones: [
        {
          documento: 'terminos',
          version: 'terminos-demo-2026-11',
          aceptadaEn: '2026-11-10T13:00:00.000Z',
        },
        {
          documento: 'privacidad',
          version: 'privacidad-demo-2026-11',
          aceptadaEn: '2026-11-10T13:00:00.000Z',
        },
      ],
      expiraEn: '2026-11-17T23:00:00.000Z',
      csrfToken: 'csrf-de-la-vista-de-prueba-0000000000000000',
    },
    fee: { vigente: POLITICA_DEMO, siguiente: null, aceptada: null, ahora },
    rubros: RUBROS.map((id) => ({ id, disponible: true })),
    ciudadesConCobertura: ['mar del plata'],
    pedidos: [],
  };
}
