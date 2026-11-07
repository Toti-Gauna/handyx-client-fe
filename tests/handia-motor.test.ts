// HandIA premium · motor de conversación (src/domain/handia-motor.ts): conversaciones completas, en el celular.
import { describe, expect, it } from 'vitest';
import {
  type EstadoHandia,
  type Turno,
  descripcionPara,
  detallesDe,
  iniciar,
  opcionDe,
  opcionesHabladas,
  responder,
} from '@/domain/handia-motor';
import { GUIAS } from '@/domain/handia-guias';

/** Corre una conversación de textos y devuelve todos los turnos. */
function charla(...entradas: string[]): Turno[] {
  let e: EstadoHandia = iniciar().estado;
  return entradas.map((texto) => {
    const t = responder(e, { texto });
    e = t.estado;
    return t;
  });
}
const textos = (t: Turno) =>
  t.dice.map((s) => ('texto' in s ? s.texto : s.de === 'detectado' ? `[${s.rubro}]` : '[ficha]'));

describe('HandIA premium · conversación', () => {
  it('canilla del baño: deduce dónde y qué pasa, pregunta solo lo que falta y arma la descripción', () => {
    const [t1, t2, t3, t4] = charla(
      'Pierde la canilla del baño',
      'sí',
      'no sé dónde está la llave',
      'desde hoy a la mañana',
    );
    expect(t1!.estado.etapa).toBe('confirmar');
    expect(textos(t1!)).toContain('[plomeria]');
    expect(t2!.estado.respuestas).toMatchObject({ donde: 'bano', que: 'pierde' });
    expect(textos(t2!).join(' ')).toMatch(/Ya me contaste parte/);
    expect(t2!.estado.pregunta).toBe('llave');
    expect(t3!.estado.respuestas.llave).toBe('no_se');
    expect(t4!.estado.etapa).toBe('resumen');
    expect(textos(t4!).join(' ')).toMatch(/cerrá la llave de paso/);
    const d = descripcionPara(t4!.estado);
    expect(d).toMatch(/^Pierde la canilla del baño/);
    expect(d).toMatch(
      /Datos: En el baño · Pierde o gotea · No sabe dónde está la llave de paso · Pasa desde hoy\.$/,
    );
  });

  it('entiende lo que la persona descarta ("no es la luz", "no es de gas")', () => {
    expect(charla('No es la luz, el inodoro no baja')[0]!.estado.rubro).toBe('plomeria');
    expect(charla('No es de gas, salta la térmica')[0]!.estado.rubro).toBe('electricidad');
  });

  it('olor a gas: el aviso va primero, una sola vez, y sugiere pedirlo para hoy', () => {
    const [t1, t2, , t4] = charla(
      'Hay olor a gas en la cocina',
      'sí',
      'la cocina',
      'hay mucho olor a gas',
    );
    expect(t1!.dice[0]).toMatchObject({ de: 'aviso', riesgo: true });
    expect(textos(t1!)[0]).toMatch(/no prendas luces ni fuego/);
    expect(textos(t2!).join(' ')).not.toMatch(/no prendas luces/);
    expect(textos(t4!).join(' ')).not.toMatch(/no prendas luces/);
    expect(t1!.estado.urgente).toBe(true);
  });

  it('llama amarilla: aviso de monóxido; agua en el enchufe: aviso de agua y luz', () => {
    const gas = charla('El calefón tiene la llama amarilla')[0]!;
    expect(textos(gas).join(' ')).toMatch(/llamá al 107 o al 911/);
    const agua = charla('Entra agua en el enchufe de la cocina')[0]!;
    expect(textos(agua).join(' ')).toMatch(/no los toques/);
  });

  it('me quedé afuera: cerrajería y destaca "Pedir para hoy" (sin prometer tiempos)', () => {
    const [, , t3] = charla('Me quedé afuera, se trabó la cerradura', 'dale', 'la de entrada');
    expect(t3!.estado.etapa).toBe('resumen');
    const hoy = t3!.opciones.find((o) => o.texto === 'Pedir para hoy');
    expect(hoy?.destacada).toBe(true);
    expect(textos(t3!).join(' ')).toMatch(/conviene pedirlo para hoy/);
    expect(textos(t3!).join(' ')).not.toMatch(/minutos|llega en|en menos de/i);
  });

  it('"saltear" y respuestas libres: sigue, avanza el progreso y anota lo que dijo', () => {
    const [, t2, t3, t4] = charla(
      'Hay humedad en una pared',
      'sí',
      'saltear',
      'como de dos metros por uno, más o menos',
    );
    // Ya contó qué pasa (humedad): faltan dónde y el tamaño.
    expect(t2!.progreso).toEqual({ actual: 2, total: 3 });
    expect(t3!.estado.respuestas.donde).toBe('saltada');
    expect(t4!.estado.etapa).toBe('resumen');
    expect(detallesDe(t4!.estado).join(' ')).toMatch(/Humedad o manchas/);
  });

  it('una respuesta que no es ninguna opción suma al pedido, se repregunta una vez y después se guarda tal cual', () => {
    const [, , t3, t4] = charla(
      'El aire hace ruido',
      'sí',
      'hace como un zumbido fuerte',
      'uno marca Fictiz de 3000 frigorías',
    );
    expect(t3!.estado.pregunta).toBe('equipo');
    expect(textos(t3!).join(' ')).toMatch(/Lo sumo al pedido\. Y ¿qué equipo es\?/);
    expect(t3!.estado.relato).toMatch(/El aire hace ruido\. Hace como un zumbido fuerte/);
    expect(t4!.estado.respuestas.equipo).toMatch(/^texto:uno marca Fictiz/);
    expect(detallesDe(t4!.estado).join(' ')).toMatch(/Qué equipo es: uno marca Fictiz/);
  });

  it('sin pistas no inventa: pide más y después ofrece los seis rubros; nombrar uno lo elige', () => {
    const [t1, t2, t3] = charla(
      'Quiero arreglar algo',
      'no sé, algo de la casa',
      'es de albañilería',
    );
    expect(textos(t1!).join(' ')).toMatch(/No me quedó claro/);
    expect(t1!.opciones).toHaveLength(6);
    expect(textos(t2!).join(' ')).toMatch(/Sigo sin darme cuenta/);
    expect(t3!.estado.rubro).toBe('albanileria');
  });

  it('"no, es otro" en la confirmación muestra los seis rubros', () => {
    const [, t2] = charla('Se tapó la pileta', 'no, es otro');
    expect(t2!.estado.etapa).toBe('elegir');
    expect(t2!.opciones).toHaveLength(6);
  });

  it('al final, "para hoy" o "programar un turno" eligen cómo pedirlo; "empezar de nuevo" reinicia', () => {
    const base = charla('Se tapó la pileta de la cocina', 'sí', 'desde hoy');
    const fin = base.at(-1)!.estado;
    expect(fin.etapa).toBe('resumen');
    expect(responder(fin, { texto: 'para hoy' }).pedir).toBe('urgente');
    expect(responder(fin, { texto: 'hoy' }).pedir).toBe('urgente');
    expect(responder(fin, { texto: 'Ya probé con el destapador' }).pedir).toBeUndefined();
    expect(responder(fin, { texto: 'mejor programar un turno' }).pedir).toBe('programado');
    expect(responder(fin, { texto: 'empezar de nuevo' }).estado.etapa).toBe('contar');
  });

  it('lo que se agrega en el resumen suma al pedido', () => {
    const base = charla('Se tapó la pileta de la cocina', 'sí', 'desde hoy');
    const t = responder(base.at(-1)!.estado, { texto: 'Ya probé con el destapador' });
    expect(descripcionPara(t.estado)).toMatch(/Ya probé con el destapador/);
  });

  it('el especialista no lee huecos: se quita el dato tachado y la frase que lo pedía', () => {
    const [, t2] = charla('Pierde la canilla del baño, llamame al [teléfono]', 'sí');
    expect(descripcionPara(t2!.estado)).toMatch(/^Pierde la canilla del baño\n/);
    expect(descripcionPara(t2!.estado)).not.toMatch(/llamame|\[teléfono\]/);
  });

  it('la descripción nunca pasa de 1000 caracteres (lo que acepta el contrato)', () => {
    const largo = 'Pierde la canilla del baño. '.repeat(60);
    const [, t2] = charla(largo, 'sí');
    expect(descripcionPara(t2!.estado).length).toBeLessThanOrEqual(1000);
  });
});

describe('HandIA premium · comprensión', () => {
  const llave = GUIAS.plomeria.find((p) => p.id === 'llave')!;
  it('palabras cortas solo como palabra entera ("no" no es "nosotros")', () => {
    expect(opcionDe(llave, 'nosotros la cerramos ayer')).toBeNull();
    expect(opcionDe(llave, 'no')).toBe('no');
    expect(opcionDe(llave, 'sí, la cerré')).toBe('si');
    expect(opcionDe(llave, 'no sé dónde está')).toBe('no_se');
  });

  it('las opciones se leen en voz alta como una lista natural', () => {
    const [, t2] = charla('Saltó la térmica', 'sí');
    expect(opcionesHabladas(t2!.opciones)).toMatch(/^Podés decir: .+, .+ o Saltear\.$/);
  });
});
