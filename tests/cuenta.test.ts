// Cuenta y ayuda (lote 3.8): sin tarjetas, pagos con su estado real, direcciones guardadas fuera del contrato, ayuda con
// "¿te sirvió?" que no envía nada y baja real.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { PREGUNTAS } from '@/content/textos';
import { PANTALLAS } from '@/mapa/pantallas';

const leer = (f: string) => readFileSync(f, 'utf8');
const archivos = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    const r = join(dir, n);
    return statSync(r).isDirectory() ? archivos(r) : /\.tsx?$/.test(n) ? [r] : [];
  });
const cuenta = leer('src/app/(app)/cuenta/page.tsx');
const pagos = leer('src/app/(app)/cuenta/pagos/page.tsx');
const respuesta = leer('src/app/(app)/ayuda/respuesta/page.tsx');
const baja = leer('src/app/(app)/cuenta/baja/page.tsx');
const UBICACION = {
  ciudad: 'Mar del Plata',
  barrio: 'La Perla',
  direccion: 'Calle Ficticia 99',
  referencia: null,
  origen: 'manual' as const,
  coordenadas: null,
};

describe('cuenta', () => {
  it('ninguna pantalla ofrece agregar ni guardar tarjetas', () => {
    for (const f of archivos('src/app'))
      expect(leer(f), f).not.toMatch(/Agregar tarjeta|tarjeta de (crédito|débito)/i);
  });

  it('el fee 0 % se avisa con el contador y sin presentarlo como descuento (3 de 3)', () => {
    expect(cuenta).toMatch(/<Contador hasta=/);
    expect(cuenta).toMatch(/No es un\s+descuento/);
  });

  it('cerrar sesión no es eliminar la cuenta', () => {
    expect(cuenta).toMatch(/Cerrar sesión no elimina tu cuenta/);
  });
});

describe('datos personales', () => {
  it('el nacimiento se muestra como fecha completa', async () => {
    const { fechaNumerica } = await import('@/domain/fechas');
    expect(fechaNumerica('1990-03-20' as never)).toBe('20/03/1990');
  });
});

describe('pagos registrados', () => {
  it('cada pago muestra su estado real: reportado no es verificado', () => {
    expect(pagos).toMatch(/etiquetaPago\(pago\)/);
    expect(pagos).toMatch(
      /“Reportado” quiere decir que alguien lo anotó; “verificado”, que se confirmó/,
    );
  });

  it('Handy no cobra el servicio ni guarda tarjetas', () => {
    expect(pagos).toMatch(/Handy no cobra el\s+servicio ni guarda tarjetas/);
  });
});

describe('direcciones guardadas', () => {
  beforeEach(async () => (await import('@/data/direcciones')).vaciarDirecciones());

  it('se guardan en memoria con un nombre y se pueden quitar', async () => {
    const d = await import('@/data/direcciones');
    const nueva = await d.guardarDireccion({
      tipo: 'trabajo',
      nombre: ' Trabajo ',
      ubicacion: UBICACION,
    });
    expect(nueva.nombre).toBe('Trabajo');
    expect(d.direccionesGuardadas()).toHaveLength(1);
    await d.quitarDireccion(nueva.id);
    expect(d.direccionesGuardadas()).toHaveLength(0);
  });

  it('hasta 5 contando la principal, y sin nombre no se guarda', async () => {
    const d = await import('@/data/direcciones');
    for (let i = 0; i < d.MAXIMO_DIRECCIONES - 1; i++)
      await d.guardarDireccion({ tipo: 'otra', nombre: `Lugar ${i}`, ubicacion: UBICACION });
    await expect(
      d.guardarDireccion({ tipo: 'otra', nombre: 'Una más', ubicacion: UBICACION }),
    ).rejects.toMatchObject({ codigo: 'conflicto' });
    await expect(
      d.guardarDireccion({ tipo: 'otra', nombre: '  ', ubicacion: UBICACION }),
    ).rejects.toMatchObject({ codigo: 'validacion' });
  });

  it('nunca en el navegador, y con la API real queda inactiva hasta el contrato', () => {
    const fuente = leer('src/data/direcciones.ts');
    expect(fuente).not.toMatch(/localStorage|sessionStorage|indexedDB|document\.cookie/);
    expect(fuente).toMatch(/direccionesDisponibles = esVistaDePrueba[\s\S]*funcion_inactiva/);
  });
});

describe('centro de ayuda', () => {
  it('cada pregunta tiene un id único y sus atajos llevan a pantallas que existen', () => {
    const ids = PREGUNTAS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    const rutas = new Set(PANTALLAS.map((p) => p.ruta));
    for (const q of PREGUNTAS) if (q.ir) expect(rutas, q.ir.href).toContain(q.ir.href);
  });

  it('"¿Te sirvió?" no envía ni guarda nada', () => {
    expect(respuesta).toMatch(/¿Te sirvió la respuesta\?/);
    expect(respuesta).not.toMatch(/@\/data|fetch\(|localStorage/);
  });
});

describe('eliminar cuenta', () => {
  it('es una baja real con contraseña, y muestra el estado verdadero', () => {
    expect(baja).toMatch(/enviar\('bajaSolicitar', \{ cuerpo: \{ contrasena \} \}/);
    expect(baja).toMatch(/plazo a confirmar por Legal/);
    expect(baja).toMatch(/Cerrar sesión no cancela la eliminación/);
  });
});
