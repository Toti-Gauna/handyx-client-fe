import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ENDPOINTS } from '../src/contracts/v1/endpoints.ts';
import { ESCENARIOS } from '../src/mapa/escenarios.ts';
import { NAVEGACION, PANTALLAS } from '../src/mapa/pantallas.ts';

const APP = 'src/app';
const GRUPOS = readdirSync(APP).filter((d) => /^\(.+\)$/.test(d));
const paginaDe = (ruta: string) =>
  GRUPOS.map((g) => join(APP, g, ruta, 'page.tsx')).find((archivo) => existsSync(archivo));

describe('mapa funcional', () => {
  it('ids únicos y una sola pantalla por ruta', () => {
    expect(new Set(PANTALLAS.map((p) => p.id)).size).toBe(PANTALLAS.length);
    const rutas = PANTALLAS.filter((p) => p.tipo === 'pantalla').map((p) => p.ruta);
    expect(new Set(rutas).size).toBe(rutas.length);
  });

  it('cada pantalla tiene su página en el export estático (rutas con barra final)', () => {
    for (const p of PANTALLAS) {
      expect(p.ruta.endsWith('/'), p.id).toBe(true);
      expect(paginaDe(p.ruta), p.id).toBeDefined();
    }
  });

  it('las páginas de pantallas con id reciben el id por query, no por segmento dinámico', () => {
    const recorrer = (dir: string): string[] =>
      readdirSync(dir).flatMap((f) =>
        statSync(join(dir, f)).isDirectory() ? [f, ...recorrer(join(dir, f))] : [],
      );
    expect(recorrer(APP).filter((d) => d.startsWith('['))).toEqual([]);
  });

  it('cada endpoint citado existe y cada endpoint tiene pantalla', () => {
    const ids = new Set(ENDPOINTS.map((e) => e.id));
    for (const p of PANTALLAS)
      for (const e of p.endpoints) expect(ids.has(e), `${p.id} → ${e}`).toBe(true);
    for (const e of ENDPOINTS)
      expect(
        PANTALLAS.some((p) => p.endpoints.includes(e.id)),
        e.id,
      ).toBe(true);
  });

  it('los 18 escenarios obligatorios apuntan a pantallas existentes', () => {
    expect(ESCENARIOS).toHaveLength(18);
    const ids = new Set(PANTALLAS.map((p) => p.id));
    for (const e of ESCENARIOS)
      for (const p of e.pantallas) expect(ids.has(p), `${e.id} → ${p}`).toBe(true);
  });

  it('el fee 0 % se avisa en los tres lugares pedidos', () => {
    for (const id of ['registro-listo', 'modal-fee', 'cuenta'])
      expect(PANTALLAS.find((p) => p.id === id)?.endpoints, id).toContain('fee');
  });

  it('la barra inferior navega a pantallas con sesión', () => {
    for (const item of NAVEGACION)
      expect(PANTALLAS.find((p) => p.id === item.id)?.acceso).toBe('sesion');
  });

  it('el usuario común no carga DNI, CUIT ni certificados', () => {
    const texto = JSON.stringify(
      PANTALLAS.filter((p) => p.grupo === 'acceso' || p.grupo === 'perfil').map((p) => p.acciones),
    );
    expect(texto).not.toMatch(/\b(dni|cuit|cuil|matr[ií]cula|certificado)\b/i);
  });

  it('docs/screens/matriz.md está al día', () => {
    expect(readFileSync('docs/screens/matriz.md', 'utf8')).toContain(
      `${PANTALLAS.length} pantallas/modales`,
    );
  });
});
