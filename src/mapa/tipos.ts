// Tipos del mapa funcional y el constructor `p`. Viven aparte de pantallas.ts para que los archivos de
// src/mapa/fase7/ puedan usar `p` sin armar un ciclo de módulos (pantallas.ts los importa a ellos).
import type { EndpointId } from '../contracts/v1/endpoints.ts';

export type Grupo =
  | 'acceso'
  | 'perfil'
  | 'inicio'
  | 'pedido'
  | 'propuestas'
  | 'chat'
  | 'trabajo'
  | 'pagos'
  | 'soporte'
  | 'avisos'
  | 'cuenta'
  | 'sistema'
  | 'hogar'
  | 'herramientas'
  | 'camino'
  | 'obras';

export type Lote =
  '2.1' | '2.2' | '2.3' | '2.4' | '2.5' | '3.1' | '3.3' | '3.6' | '3.7' | '3.8' | '7';

export interface Pantalla {
  readonly id: string;
  readonly tipo: 'pantalla' | 'modal';
  /** Ruta del export estático (con barra final). Los detalles reciben el id por query (`?id=`). */
  readonly ruta: `/${string}`;
  readonly titulo: string;
  readonly grupo: Grupo;
  readonly lote: Lote;
  /** `publica`: sin sesión. `sesion`: requiere cuenta (y perfil completo salvo en el alta). */
  readonly acceso: 'publica' | 'sesion';
  readonly consulta?: readonly string[];
  readonly acciones: readonly string[];
  readonly estados: readonly string[];
  readonly endpoints: readonly EndpointId[];
  readonly entidades: readonly string[];
  readonly pruebas: readonly string[];
  readonly demo?: readonly string[];
  readonly nota?: string;
}

export const p = (pantalla: Omit<Pantalla, 'tipo'> & { tipo?: Pantalla['tipo'] }): Pantalla => ({
  tipo: 'pantalla',
  ...pantalla,
});
