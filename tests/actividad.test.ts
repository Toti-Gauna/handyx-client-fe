// Actividad, mensajes y soporte (lote 3.7).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const leer = (f: string) => readFileSync(f, 'utf8');

describe('actividad', () => {
  const act = leer('src/components/Actividad.tsx');

  it('en curso, agenda e historial en una sola pestaña', () => {
    expect(act).toMatch(/'En curso'[\s\S]*'Agenda'[\s\S]*'Historial'/);
    expect(leer('src/app/(app)/agenda/page.tsx')).toMatch(/<Actividad inicial="agenda" \/>/);
  });

  it('lo que espera tu respuesta va primero', () => {
    expect(act).toMatch(/Espera tu respuesta/);
    expect(act).toMatch(/p\.estado === 'con_propuestas' && p\.propuestasPendientes > 0/);
    expect(act).toMatch(/t\.estado === 'terminado_por_especialista'/);
  });
});

describe('mensajes', () => {
  // Fase 7: la conversación se partió en piezas (_Pies.tsx dibuja las respuestas rápidas y _useEnvios.ts manda).
  const dir = 'src/app/(app)/chats/conversacion/';
  const conv = leer(`${dir}page.tsx`);
  const pies = leer(`${dir}_Pies.tsx`);
  const envios = leer(`${dir}_useEnvios.ts`);

  it('las respuestas rápidas completan el mensaje: nada se manda con un toque', () => {
    // La pastilla solo escribe el texto en el redactor (onTexto = setTexto); mandar es otro toque, en «Enviar».
    expect(pies).toMatch(/onElegir=\{\(\) => onTexto\(r\)\}/);
    expect(conv).toMatch(/onTexto=\{setTexto\}/);
    for (const f of [conv, pies]) expect(f).not.toMatch(/enviarRapida/);
    expect(pies).not.toMatch(/onElegir=\{\(\) => onEnviar/);
  });

  it('el reintento usa el mismo clienteId (no duplica)', () => {
    expect(envios).toMatch(/claveIdempotencia: s\.clienteId/);
    // El id nuevo nace una sola vez, al encolar; reintentar vuelve a mandar el mismo envío.
    expect(envios.match(/crypto\.randomUUID\(\)/g)).toHaveLength(1);
    expect(conv).toMatch(/onReintentar=\{\(s\) => void envios\.mandar\(s\)\}/);
  });
});

describe('soporte', () => {
  it('con la API real queda inactivo hasta el contrato; sin IA ni plazos', () => {
    const datos = leer('src/data/soporte.ts');
    expect(datos).toMatch(/soporteDisponible = esVistaDePrueba[\s\S]*funcion_inactiva/);
    expect(datos).toMatch(/no podemos prometer un plazo/);
    expect(leer('src/app/(app)/soporte/page.tsx')).toMatch(/te responde una persona/);
  });
});

describe('cambiar turno', () => {
  it('es una propuesta: el acuerdo sigue valiendo hasta que la otra parte acepte', () => {
    const cambiar = leer('src/app/(app)/trabajos/cambiar/page.tsx');
    expect(cambiar).toMatch(/Es una <strong>propuesta<\/strong>/);
    expect(cambiar).toMatch(/'trabajoProponerCambio'/);
  });
});
