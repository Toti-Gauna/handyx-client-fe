// Fase 7 · acceso y alta sin contraseña (fila A del lienzo): reglas del código, de «Armá tu casa» y garantías de
// las pantallas.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ambienteDeGrupo,
  ambientesPorCrear,
  cuentasIniciales,
  equiposPorCrear,
  GRUPOS_EQUIPOS,
} from '@/app/(alta)/casa/casa';
import {
  aceptacionesVigentes,
  destinoTrasAcceso,
  pasoPorError,
  textoReenvio,
} from '@/app/(publico)/ingresar/codigo';
import type { Sesion } from '@/contracts/v1/cuenta';
import type { Hogar } from '@/contracts/v1/hogar';
import { ErrorCliente } from '@/data/cliente';
import { ACCESO7 } from '@/mapa/fase7/acceso';

const leer = (f: string) => readFileSync(f, 'utf8');
const id = (n: number) => `de000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

const hogarVacio: Hogar = {
  vivienda: null,
  ambientes: [],
  equipos: [],
  completitud: 0,
  version: 0,
};
const ambiente = (n: number, tipo: Hogar['ambientes'][number]['tipo'], nombre: string) => ({
  id: id(n),
  tipo,
  nombre,
  medidas: null,
  materiales: null,
  notas: null,
  fotos: [],
  completitud: 0,
  version: 0,
});

describe('acceso con código', () => {
  it('el reenvío muestra la espera en m:ss y después se habilita', () => {
    expect(textoReenvio(42)).toBe('Reenviar el código en 0:42');
    expect(textoReenvio(60)).toBe('Reenviar el código en 1:00');
    expect(textoReenvio(0)).toBe('Reenviar el código');
  });

  it('manda las versiones vigentes de términos y privacidad', () => {
    expect(aceptacionesVigentes().map((a) => a.documento)).toEqual(['terminos', 'privacidad']);
  });

  it('cuenta sin nombre va a los datos mínimos; con nombre, al destino interno', () => {
    const base = {
      perfil: {},
      pendientes: { camposPerfil: ['nombre'], documentos: [] },
    } as unknown as Sesion;
    expect(destinoTrasAcceso(base, '/pedidos/')).toBe('/perfil/');
    const completa = {
      perfil: { nombre: 'Lucía' },
      pendientes: { camposPerfil: [], documentos: [] },
    } as unknown as Sesion;
    expect(destinoTrasAcceso(completa, '/pedidos/')).toBe('/pedidos/');
    expect(destinoTrasAcceso(completa, 'https://otro.example.test/')).toBe('/inicio/');
  });

  it('cada rechazo lleva al paso que lo corrige', () => {
    const conCampo = (campo: string) =>
      new ErrorCliente({
        codigo: 'no_autenticado',
        mensaje: 'x',
        campos: [{ campo, motivo: 'requerido' }],
      });
    expect(pasoPorError(conCampo('segundoFactor'))).toBe('segundo');
    expect(pasoPorError(conCampo('aceptaciones'))).toBe('textos');
    expect(pasoPorError(conCampo('email'))).toBe('email');
    expect(pasoPorError(new ErrorCliente({ codigo: 'no_autenticado', mensaje: 'x' }))).toBeNull();
  });
});

describe('armá tu casa', () => {
  it('una casa vacía arranca con una de cada ambiente principal', () => {
    expect(cuentasIniciales(hogarVacio)).toEqual({
      bano: 1,
      cocina: 1,
      living: 1,
      dormitorio: 1,
      lavadero: 0,
      patio: 0,
    });
  });

  it('crea solo lo que falta y numera cuando hay más de uno', () => {
    const h = { ...hogarVacio, ambientes: [ambiente(1, 'dormitorio', 'Dormitorio')] };
    const cuentas = { ...cuentasIniciales(h), dormitorio: 3 };
    expect(cuentas.dormitorio).toBe(3);
    expect(ambientesPorCrear(h, cuentas)).toEqual([
      { tipo: 'dormitorio', nombre: 'Dormitorio 2' },
      { tipo: 'dormitorio', nombre: 'Dormitorio 3' },
    ]);
    expect(ambientesPorCrear(h, { ...cuentas, dormitorio: 0 })).toEqual([]);
  });

  it('los equipos van al ambiente de su grupo y no se duplican', () => {
    const h: Hogar = {
      ...hogarVacio,
      ambientes: [ambiente(1, 'cocina', 'Cocina'), ambiente(2, 'living', 'Living')],
      equipos: [
        {
          id: id(9),
          ambienteId: id(1),
          tipo: 'calefon',
          nombre: 'Calefón',
          marca: null,
          modelo: null,
          instaladoEn: null,
          ultimoMantenimiento: null,
          garantiaHasta: null,
          etiqueta: null,
          version: 0,
        },
      ],
    };
    expect(ambienteDeGrupo(h, GRUPOS_EQUIPOS[1]!)).toBeNull(); // sin baño, el grupo no se muestra
    expect(equiposPorCrear(h, new Set(['calefon', 'horno', 'ducha', 'tablero_electrico']))).toEqual(
      [
        { ambienteId: id(1), tipo: 'horno', nombre: 'Horno' },
        { ambienteId: id(2), tipo: 'tablero_electrico', nombre: 'Tablero eléctrico' },
      ],
    );
  });
});

describe('pantallas de acceso (fase 7)', () => {
  const flujo = leer('src/app/(publico)/ingresar/FlujoCodigo.tsx');
  const email = leer('src/app/(publico)/ingresar/PasoEmail.tsx');
  const perfil = leer('src/app/(alta)/perfil/page.tsx');
  const listo = leer('src/app/(alta)/registro/listo/page.tsx');

  it('la aceptación arranca sin tildar y solo viaja tildada', () => {
    expect(flujo).toMatch(/const \[acepta, setAcepta\] = useState\(false\)/);
    expect(flujo).toMatch(/alta && acepta \? \{ aceptaciones: aceptacionesVigentes\(\) \}/);
  });

  it('Google y Apple llaman al servidor y, si está inactivo, lo dicen sin bloquear el email', () => {
    expect(email).toMatch(/'accesoProveedor'/);
    expect(email).toMatch(/funcion_inactiva/);
  });

  it('el navegador pregunta por avisos solo después de un toque (pre-permiso)', () => {
    expect(perfil).not.toMatch(/useEffect/);
    expect(perfil).toMatch(/onClick=\{\(\) => void pedirAvisos\(\)\}/);
  });

  it('el fee 0 % se avisa al terminar el alta, sin presentarlo como descuento', () => {
    expect(listo).toMatch(
      /Tarifa de Handy: \{resumen\.porcentajeUsuario\} hasta el \{resumen\.hasta\}/,
    );
    expect(listo).toMatch(/No es un descuento/);
  });

  it('el mapa lista los endpoints del acceso y del alta', () => {
    const endpoints = new Set(ACCESO7.flatMap((p) => p.endpoints));
    for (const e of [
      'accesoCodigo',
      'accesoVerificar',
      'accesoProveedor',
      'segundaVerificacion',
      'segundaVerificacionActivar',
      'hogarEditar',
      'ambienteCrear',
      'equipoCrear',
    ] as const)
      expect(endpoints.has(e), e).toBe(true);
  });
});
