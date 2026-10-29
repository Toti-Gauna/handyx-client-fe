import { configuracion } from '../config/index.ts';
import type { ClienteApi } from './cliente.ts';
import { crearClienteHttp } from './http/cliente-http.ts';
import { crearClienteMock } from './mock/cliente-mock.ts';

/**
 * Un solo cliente por build: con API configurada es HTTP y nunca mock (si la API falla, se muestra el error);
 * sin API es la vista de prueba rotulada. `leerEntorno` impide un build de producción sin API.
 */
export const cliente: ClienteApi =
  configuracion.modo === 'http' && configuracion.apiBaseUrl
    ? crearClienteHttp({ baseUrl: configuracion.apiBaseUrl })
    : crearClienteMock();

export const esVistaDePrueba = cliente.modo === 'mock';
export { ErrorCliente } from './cliente.ts';
