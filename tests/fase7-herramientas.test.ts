import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DESTINOS,
  REFERENCIAS,
  cambiarZoom,
  cmPorAncho,
  distanciaPx,
  estadoNivel,
  formatoGrados,
  formatoMedida,
  guardarItem,
  inclinacionTotal,
  leerCm,
  leerItem,
  limitarPunto,
  medirCm,
  moverPunto,
  posicionBurbuja,
  puntoDesdeEvento,
} from '../src/domain/herramientas';

const caja = { ancho: 400, alto: 800 };

describe('medir', () => {
  it('distancia en píxeles según el tamaño del cuadro', () => {
    expect(distanciaPx({ x: 0, y: 0 }, { x: 0.5, y: 0 }, caja)).toBe(200);
    expect(distanciaPx({ x: 0, y: 0 }, { x: 0, y: 0.5 }, caja)).toBe(400);
  });

  it('calibra con un objeto de referencia y mide proporcionalmente', () => {
    // Una tarjeta de 8,56 cm ocupa 100 px en un cuadro de 400 px de ancho.
    const escala = cmPorAncho(8.56, 100, 400)!;
    expect(escala).toBeCloseTo(34.24);
    expect(medirCm(100, 400, escala)).toBeCloseTo(8.56);
    expect(medirCm(300, 400, escala)).toBeCloseTo(25.68);
  });

  it('la escala sobrevive a girar el teléfono (va por ancho, no por píxel)', () => {
    const escala = cmPorAncho(29.7, 200, 400)!;
    // El mismo objeto, con el cuadro de 800 de ancho, ocupa 400 px: da lo mismo.
    expect(medirCm(400, 800, escala)).toBeCloseTo(29.7);
  });

  it('no calibra con puntos casi juntos ni con datos inválidos', () => {
    expect(cmPorAncho(8.56, 5, 400)).toBeNull();
    expect(cmPorAncho(0, 100, 400)).toBeNull();
    expect(cmPorAncho(8.56, 100, 0)).toBeNull();
    expect(medirCm(10, 0, 5)).toBe(0);
  });

  it('formatea en cm o en metros, con coma', () => {
    expect(formatoMedida(7.5)).toBe('7,5 cm');
    expect(formatoMedida(34.2)).toBe('34 cm');
    expect(formatoMedida(120)).toBe('1,20 m');
    expect(formatoMedida(Number.NaN)).toBe('—');
  });

  it('lee centímetros escritos con coma o punto y rechaza lo que no sirve', () => {
    expect(leerCm('12,5')).toBe(12.5);
    expect(leerCm(' 30.2 ')).toBe(30.2);
    expect(leerCm('')).toBeNull();
    expect(leerCm('abc')).toBeNull();
    expect(leerCm('0')).toBeNull();
    expect(leerCm('5000')).toBeNull();
  });

  it('los puntos no salen del cuadro', () => {
    expect(limitarPunto({ x: -1, y: 2 })).toEqual({ x: 0, y: 1 });
    expect(moverPunto({ x: 0.99, y: 0.5 }, 0.05, 0)).toEqual({ x: 1, y: 0.5 });
    const rect = { left: 10, top: 20, width: 200, height: 400 };
    expect(puntoDesdeEvento(110, 220, rect)).toEqual({ x: 0.5, y: 0.5 });
    expect(puntoDesdeEvento(-50, 900, rect)).toEqual({ x: 0, y: 1 });
    expect(puntoDesdeEvento(5, 5, { left: 0, top: 0, width: 0, height: 0 })).toEqual({
      x: 0.5,
      y: 0.5,
    });
  });

  it('las referencias traen medidas reales y una opción para escribir la propia', () => {
    expect(REFERENCIAS.find((r) => r.id === 'tarjeta')?.cm).toBe(8.56);
    expect(REFERENCIAS.find((r) => r.id === 'hoja')?.cm).toBe(29.7);
    expect(REFERENCIAS.find((r) => r.id === 'otra')?.cm).toBeNull();
  });
});

describe('nivel', () => {
  it('apoyado y derecho no marca inclinación', () => {
    expect(inclinacionTotal(0, 0)).toBe(0);
    expect(posicionBurbuja(0, 0)).toEqual({ x: 0, y: 0 });
    expect(estadoNivel(0.4)).toBe('derecho');
  });

  it('la burbuja se corre hacia el lado alto y no sale del círculo', () => {
    expect(posicionBurbuja(0, 7.5)).toEqual({ x: -0.5, y: 0 });
    const lejos = posicionBurbuja(80, 80);
    expect(Math.hypot(lejos.x, lejos.y)).toBeCloseTo(1);
  });

  it('clasifica y formatea los grados', () => {
    expect(estadoNivel(2)).toBe('casi');
    expect(estadoNivel(5)).toBe('torcido');
    expect(formatoGrados(0.4)).toBe('0,4°');
    expect(inclinacionTotal(3, 4)).toBe(5);
  });
});

describe('lupa y destino', () => {
  it('el aumento se queda entre 1× y 4×', () => {
    expect(cambiarZoom(1, -1)).toBe(1);
    expect(cambiarZoom(1, 1)).toBe(2);
    expect(cambiarZoom(4, 1)).toBe(4);
    expect(cambiarZoom(3, -1)).toBe(2);
    expect(cambiarZoom(7, 1)).toBe(2);
  });

  it('lo hecho queda solo en memoria y se puede borrar', () => {
    guardarItem({ tipo: 'medida', titulo: 'Ventana', detalle: '1,20 m' });
    expect(leerItem()?.titulo).toBe('Ventana');
    guardarItem(null);
    expect(leerItem()).toBeNull();
  });

  it('los destinos son el chat y el pedido', () => {
    expect(DESTINOS.map((d) => d.href)).toEqual(['/chats/', '/pedir/']);
  });

  it('nada de lo de herramientas toca el almacenamiento del navegador ni la red', () => {
    const sinComentarios = (t: string) =>
      t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    const rutas = readdirSync('src/app/(app)/herramientas', { recursive: true, encoding: 'utf8' })
      .filter((f) => /\.tsx?$/.test(f))
      .map((f) => join('src/app/(app)/herramientas', f));
    for (const f of ['src/domain/herramientas.ts', 'src/ui/herramientas.tsx', ...rutas])
      expect(sinComentarios(readFileSync(f, 'utf8')), f).not.toMatch(
        /localStorage|sessionStorage|indexedDB|document\.cookie|fetch\(|FormData|sendBeacon/,
      );
  });
});
