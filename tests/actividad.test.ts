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
  const conv = leer('src/app/(app)/chats/conversacion/page.tsx');

  it('las respuestas rápidas completan el mensaje: nada se manda con un toque', () => {
    expect(conv).toMatch(/setTexto\(r\);/);
    expect(conv).not.toMatch(/enviarRapida/);
  });

  it('el reintento usa el mismo clienteId (no duplica)', () => {
    expect(conv).toMatch(/claveIdempotencia: s\.clienteId/);
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
