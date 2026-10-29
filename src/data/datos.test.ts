import { describe, expect, it, vi } from 'vitest';
import { ErrorCliente } from './cliente.ts';
import { crearClienteHttp } from './http/cliente-http.ts';
import { datosIniciales } from './mock/fixtures.ts';
import { crearClienteMock } from './mock/cliente-mock.ts';

const BASE = 'http://127.0.0.1:3100';
const REQ = '7f1d2c3b-4a5e-4f60-8a9b-0c1d2e3f4a5b';
const CLAVE = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
const json = (estado: number, cuerpo: unknown) =>
  new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), {
    status: estado,
    headers: { 'Content-Type': 'application/json' },
  });

function fetchFalso(respuestas: Record<string, () => Response>) {
  const llamadas: { url: string; init: RequestInit }[] = [];
  const fn = vi.fn(async (url: URL | RequestInfo, init?: RequestInit) => {
    const u = new URL(String(url));
    llamadas.push({ url: u.pathname + u.search, init: init ?? {} });
    const clave = `${init?.method ?? 'GET'} ${u.pathname}`;
    const r = respuestas[clave];
    if (!r) throw new TypeError('sin red');
    return r();
  });
  return { fn: fn as unknown as typeof fetch, llamadas };
}

describe('adaptador HTTP', () => {
  it('lee con credenciales, sin caché y valida la respuesta', async () => {
    const { fn, llamadas } = fetchFalso({
      'GET /v1/version': () => json(200, { contrato: '1.0.0-draft.1' }),
    });
    const api = crearClienteHttp({ baseUrl: BASE, fetch: fn });
    await expect(api.llamar('version')).resolves.toEqual({ contrato: '1.0.0-draft.1' });
    expect(llamadas[0]?.init).toMatchObject({
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      redirect: 'error',
    });
  });

  it('una escritura pide CSRF primero y manda CSRF + Idempotency-Key', async () => {
    const sesion = datosIniciales().sesion;
    const { fn, llamadas } = fetchFalso({
      'POST /v1/auth/csrf': () => json(200, { csrfToken: 'x'.repeat(40) }),
      'PATCH /v1/cuenta/notificaciones': () => json(200, { push: false }),
      'POST /v1/cuenta/fee/aceptacion': () => json(200, { ...datosIniciales().fee }),
      'GET /v1/sesion': () => json(200, sesion),
    });
    const api = crearClienteHttp({ baseUrl: BASE, fetch: fn });
    await api.llamar('preferenciasEditar', { cuerpo: { push: false } });
    expect(llamadas.map((l) => l.url)).toEqual(['/v1/auth/csrf', '/v1/cuenta/notificaciones']);
    const cabeceras = new Headers(llamadas[1]?.init.headers);
    expect(cabeceras.get('X-CSRF-Token')).toBe('x'.repeat(40));
    expect(cabeceras.get('Idempotency-Key')).toMatch(/^[0-9a-f-]{36}$/);
    // La clave que pasa la pantalla se reusa tal cual al reintentar.
    await api.llamar('sesion');
    await api.llamar('feeAceptar', {
      cuerpo: {
        politicaId: datosIniciales().fee.vigente?.id ?? '',
        version: 'fee-demo-2026-11-10',
      },
      claveIdempotencia: CLAVE,
    });
    const ultima = new Headers(llamadas.at(-1)?.init.headers);
    expect(ultima.get('Idempotency-Key')).toBe(CLAVE);
    expect(ultima.get('X-CSRF-Token')).toBe(sesion.csrfToken);
  });

  it('valida el cuerpo antes de enviar y devuelve campos (sin valores)', async () => {
    const { fn, llamadas } = fetchFalso({});
    const api = crearClienteHttp({ baseUrl: BASE, fetch: fn });
    const error = await api
      .llamar('login', { cuerpo: { email: 'no-es-email', contrasena: '' } })
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ErrorCliente);
    expect((error as ErrorCliente).campos.map((c) => c.campo).sort()).toEqual([
      'contrasena',
      'email',
    ]);
    expect(JSON.stringify((error as ErrorCliente).campos)).not.toContain('no-es-email');
    expect(llamadas).toHaveLength(0);
  });

  it('normaliza errores del contrato, de red y respuestas fuera de contrato', async () => {
    const { fn } = fetchFalso({
      'GET /v1/sesion': () =>
        json(401, { error: 'sesion_vencida', mensaje: 'Tu sesión venció.', requestId: REQ }),
      'GET /v1/rubros': () => json(200, { items: [{ id: 'jardineria', disponible: true }] }),
    });
    const api = crearClienteHttp({ baseUrl: BASE, fetch: fn });
    const vencida = (await api.llamar('sesion').catch((e: unknown) => e)) as ErrorCliente;
    expect(vencida.requiereIngreso).toBe(true);
    expect(vencida.requestId).toBe(REQ);
    const fuera = (await api.llamar('rubros').catch((e: unknown) => e)) as ErrorCliente;
    expect(fuera.codigo).toBe('error_interno');
    const red = (await api.llamar('fee').catch((e: unknown) => e)) as ErrorCliente;
    expect(red.codigo).toBe('no_disponible');
    expect(red.recuperable).toBe(true);
  });

  it('un id de ruta que no es UUID no llega a la red', async () => {
    const { fn, llamadas } = fetchFalso({});
    const api = crearClienteHttp({ baseUrl: BASE, fetch: fn });
    await expect(api.llamar('pedido', { parametros: { id: '../../admin' } })).rejects.toThrow();
    expect(llamadas).toHaveLength(0);
  });
});

describe('adaptador mock', () => {
  const nuevo = (opciones: Parameters<typeof crearClienteMock>[0] = {}) =>
    crearClienteMock({ latenciaMs: 0, congelado: true, escenario: 'nuevo-usuario', ...opciones });

  it('sin sesión pide ingresar; con la cuenta de prueba entra y valida contra el contrato', async () => {
    const api = nuevo();
    await expect(api.llamar('sesion')).rejects.toMatchObject({ codigo: 'no_autenticado' });
    await expect(
      api.llamar('login', {
        cuerpo: { email: 'usuaria@example.test', contrasena: 'incorrecta-123' },
      }),
    ).rejects.toMatchObject({ codigo: 'no_autenticado' });
    const sesion = await api.llamar('login', {
      cuerpo: { email: 'usuaria@example.test', contrasena: 'handyx-demo-1234' },
    });
    expect(sesion.cuenta.roles).toEqual(['usuario']);
    expect((await api.llamar('rubros')).items).toHaveLength(6);
    expect(
      (await api.llamar('cobertura', { consulta: { ciudad: 'Mar del Plata' } })).cubierta,
    ).toBe(true);
    expect((await api.llamar('cobertura', { consulta: { ciudad: 'Rosario' } })).cubierta).toBe(
      false,
    );
  });

  it('simula fallas configurables y un recurso ajeno es 404', async () => {
    const api = nuevo({ escenario: 'varias-propuestas', fallas: { pedidos: 'no_disponible' } });
    await expect(api.llamar('pedidos')).rejects.toMatchObject({ codigo: 'no_disponible' });
    await expect(api.llamar('propuesta', { parametros: { id: REQ } })).rejects.toMatchObject({
      codigo: 'no_encontrado',
    });
  });

  it('aceptar el fee registra la versión vigente', async () => {
    const api = nuevo({ escenario: 'otra-ciudad' });
    const antes = await api.llamar('fee');
    expect(antes.aceptada).not.toBeNull();
    const api2 = nuevo();
    await api2.llamar('login', {
      cuerpo: { email: 'usuaria@example.test', contrasena: 'handyx-demo-1234' },
    });
    const f = await api2.llamar('fee');
    expect(f.aceptada).toBeNull();
    const despues = await api2.llamar('feeAceptar', {
      cuerpo: { politicaId: f.vigente?.id ?? '', version: f.vigente?.version ?? '' },
    });
    expect(despues.aceptada?.version).toBe('fee-demo-2026-11-10');
  });

  it('los fixtures son ficticios', () => {
    const texto = JSON.stringify(datosIniciales());
    expect(texto).toMatch(/de000000-0000-4000-8000-/);
    expect(texto).toContain('Ficticia');
    expect(texto).not.toMatch(/@(?!example\.test)[a-z0-9-]+\.[a-z]/i);
  });
});
