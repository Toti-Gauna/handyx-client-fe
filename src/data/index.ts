import { configuracion } from '../config/index.ts';
import type { ClienteApi } from './cliente.ts';
import { crearClienteHttp } from './http/cliente-http.ts';
import { type ClienteMock, crearClienteMock } from './mock/cliente-mock.ts';

/**
 * Un solo cliente por build: con API configurada es HTTP y nunca mock (si la API falla, se muestra el error);
 * sin API es la vista de prueba rotulada. `leerEntorno` impide un build de producción sin API.
 */
const mock: ClienteMock | null = configuracion.modo === 'http' ? null : crearClienteMock();

export const cliente: ClienteApi =
  mock ?? crearClienteHttp({ baseUrl: configuracion.apiBaseUrl ?? '' });

export const esVistaDePrueba = mock !== null;
/** Controles de la contraparte y del reloj (solo existen en la vista de prueba). */
export const controlesPrueba: ClienteMock | null = mock;
export { ErrorCliente } from './cliente.ts';
