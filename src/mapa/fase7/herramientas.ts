// Pantallas de la Fase 7 · herramientas (lienzo design/usuario). Una entrada por pantalla nueva o rediseñada;
// mismo id que una pantalla base = la reemplaza. Ver src/mapa/pantallas.ts.
import type { Pantalla } from '../pantallas.ts';

// Igual que `p` de pantallas.ts, que no se importa acá para no armar un ciclo de módulos.
const p = (x: Omit<Pantalla, 'tipo'>): Pantalla => ({ tipo: 'pantalla', ...x });

const base = {
  grupo: 'herramientas',
  lote: '7',
  acceso: 'sesion',
  endpoints: [],
  entidades: [],
} as const;
const SIN_SUBIR =
  'nada se sube ni se guarda: todo queda en el teléfono hasta que la persona elige un destino';

export const HERRAMIENTAS7: readonly Pantalla[] = [
  p({
    ...base,
    id: 'herramientas',
    ruta: '/herramientas/',
    titulo: 'Herramientas',
    acciones: [
      'Medir',
      'Nivel',
      'Linterna y lupa',
      'Escanear en 3D, Modelo 3D y Ver en AR (experimentales)',
    ],
    estados: ['normal'],
    pruebas: [SIN_SUBIR, 'aviso: el teléfono no detecta gas, tensión ni monóxido'],
  }),
  p({
    ...base,
    id: 'herramientas-medir',
    ruta: '/herramientas/medir/',
    titulo: 'Medir',
    acciones: [
      'Activar la cámara (se explica antes de pedir el permiso) o medir sobre una foto de la galería',
      'Calibrar con una tarjeta, una hoja A4 u otra medida escrita',
      'Arrastrar dos puntos (o flechas del teclado) y ver la medida aproximada',
      'Guardar y mandar → destino',
    ],
    estados: [
      'sin_permiso',
      'pidiendo_permiso',
      'camara_denegada',
      'sin_camara',
      'calibrando',
      'midiendo',
    ],
    pruebas: ['cálculo de medida y escala', 'la cámara se apaga al salir'],
  }),
  p({
    ...base,
    id: 'herramientas-nivel',
    ruta: '/herramientas/nivel/',
    titulo: 'Nivel',
    acciones: [
      'Activar el sensor (permiso en iPhone solo al tocar)',
      'Burbuja y grados',
      'Fijar y mandar → destino',
    ],
    estados: ['sin_permiso', 'pidiendo_permiso', 'denegado', 'sin_sensor', 'midiendo', 'fijado'],
    pruebas: ['cálculo de inclinación y burbuja', 'sin sensor: texto, no un 0 falso'],
  }),
  p({
    ...base,
    id: 'herramientas-linterna',
    ruta: '/herramientas/linterna/',
    titulo: 'Linterna y lupa',
    acciones: [
      'Activar la cámara',
      'Linterna (si el teléfono lo permite)',
      'Acercar y alejar (1× a 4×)',
    ],
    estados: ['sin_permiso', 'camara_denegada', 'sin_camara', 'sin_linterna', 'lista'],
    pruebas: ['aumento entre 1× y 4×', 'la cámara y la linterna se apagan al salir'],
  }),
  p({
    ...base,
    id: 'herramientas-escanear',
    ruta: '/herramientas/escanear/',
    titulo: 'Escanear en 3D',
    acciones: ['Ver cómo va a ser (experimental)', 'Volver o ir a medir'],
    estados: ['no_disponible'],
    pruebas: ['dice claro que todavía no está disponible; no hay 3D de mentira'],
  }),
  p({
    ...base,
    id: 'herramientas-modelo',
    ruta: '/herramientas/modelo/',
    titulo: 'Modelo 3D y medidas',
    acciones: ['Ver cómo va a ser (experimental)', 'Ir a medir'],
    estados: ['no_disponible'],
    pruebas: ['dice claro que todavía no está disponible; no hay modelo de mentira'],
  }),
  p({
    ...base,
    id: 'herramientas-ar',
    ruta: '/herramientas/ar/',
    titulo: 'Ver en AR',
    acciones: ['Ver cómo va a ser (experimental)', 'Volver o ir a medir'],
    estados: ['no_disponible'],
    pruebas: ['dice claro que todavía no está disponible; no se simula cómo queda'],
  }),
  p({
    ...base,
    id: 'herramientas-destino',
    ruta: '/herramientas/destino/',
    titulo: 'A dónde lo mandás',
    acciones: ['Elegir al chat o a un pedido nuevo', 'Mandar (solo navega)'],
    estados: ['con_item', 'sin_item'],
    pruebas: [SIN_SUBIR],
  }),
];
