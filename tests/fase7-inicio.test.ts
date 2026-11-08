// Fase 7 · Inicio y HandIA (lienzo design/usuario, fila I): reglas de las pantallas rediseñadas.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { palabrasDichas } from '@/components/voz';
import { RUBROS } from '@/contracts/v1/pedidos';
import { SUGERENCIAS_HANDIA, TAREAS } from '@/content/inicio';
import { ESTADO_INICIAL, responder } from '@/domain/handia-motor';
import { INICIO7 } from '@/mapa/fase7/inicio';
import { PANTALLAS } from '@/mapa/pantallas';

const leer = (p: string) => readFileSync(p, 'utf8');
const inicio = leer('src/app/(app)/inicio/page.tsx') + leer('src/app/(app)/inicio/tickets.tsx');
const pagina = leer('src/app/(app)/handia/page.tsx');
const chat =
  leer('src/components/handia/chat.tsx') +
  leer('src/components/handia/conversacion.tsx') +
  leer('src/components/handia/marco.tsx');
const voz =
  leer('src/components/handia/voz-panel.tsx') + leer('src/components/handia/voz-piezas.tsx');

describe('Fase 7 · Inicio', () => {
  it('los seis rubros con íconos de línea (no los Handys) y las tareas de «Quiero…»', () => {
    expect(inicio).toMatch(/RUBROS\.map/);
    expect(inicio).toMatch(/<Mosaico[\s\S]*?icono=\{RUBROS_INFO\[r\]\.icono\}/);
    expect(inicio).not.toMatch(/HandyRubro/);
    expect(RUBROS).toHaveLength(6);
    expect(TAREAS).toHaveLength(6);
    expect(new Set(TAREAS.map((t) => t.rubro)).size).toBe(6);
  });

  it('el sello del avatar solo con una verificación real', () => {
    expect(inicio).toMatch(/verificado=\{t\.especialista\.verificaciones\.length > 0\}/);
  });

  it('mantiene el modal del fee y los datos solo por hooks (sin fetch ni fixtures)', () => {
    expect(inicio).toMatch(/<ModalFee \/>/);
    expect(inicio).toMatch(/useConsulta\('trabajos'/);
    expect(inicio).not.toMatch(/fetch\(|data\/mock|fixtures/);
  });

  it('la cabecera lleva a la cuenta desde el avatar', () => {
    const hx = leer('src/components/hx.tsx');
    // El nombre accesible incluye las iniciales que se ven (WCAG 2.5.3) y siempre dice «tu cuenta».
    expect(hx).toMatch(
      /href="\/cuenta\/"\s+className="app-cuadrado"\s+aria-label=\{ini \? `\$\{ini\}, tu cuenta` : 'Tu cuenta'\}/,
    );
  });
});

describe('Fase 7 · HandIA', () => {
  it('las sugerencias de la bienvenida llevan al rubro que corresponde', () => {
    const esperado = ['plomeria', 'electricidad', 'gas'];
    SUGERENCIAS_HANDIA.forEach((s, i) => {
      const t = responder(ESTADO_INICIAL, { texto: s.texto });
      expect(t.estado.rubro).toBe(esperado[i]);
    });
  });

  it('la bienvenida solo con la conversación vacía; «pensando» es una fila chica', () => {
    expect(chat).toMatch(/!conversando \? \(\s*<Bienvenida/);
    expect(chat).toMatch(/export function Pensando\(\) \{[\s\S]*?role="status"[\s\S]*?Pensando/);
    expect(chat).not.toMatch(/Orbe|Esfera\b/);
  });

  it('la ficha es un ticket con «Corregir» y «Pedir así»', () => {
    expect(chat).toMatch(/<Ticket/);
    expect(chat).toMatch(/'Corregir'/);
    expect(chat).toMatch(/Pedir así/);
  });

  it('nunca recibe fotos ni archivos', () => {
    expect(pagina + chat).not.toMatch(/type="file"|camara|adjuntar/);
  });

  it('el modo voz no tiene personajes y cuenta que la voz no sale del celular', () => {
    expect(voz).toMatch(/<EsferaVoz/);
    expect(voz).not.toMatch(/handy-lamparita|<Image/);
    expect(voz).toMatch(/Se reconoce en tu celular · no se graba/);
    expect(voz).toMatch(/solo reconoce la voz mandándola a internet/);
    expect(voz).not.toMatch(/localStorage|sessionStorage|indexedDB|getUserMedia|MediaRecorder/);
  });

  it('subtítulos: marca hasta dónde se leyó', () => {
    const t = 'Parece un trabajo de plomería';
    expect(palabrasDichas(t, 0).map((w) => w.estado)).toEqual([
      'actual',
      'falta',
      'falta',
      'falta',
      'falta',
    ]);
    expect(palabrasDichas(t, t.indexOf('trabajo')).map((w) => w.estado)).toEqual([
      'dicha',
      'dicha',
      'actual',
      'falta',
      'falta',
    ]);
    expect(palabrasDichas(t, t.length).every((w) => w.estado === 'dicha')).toBe(true);
  });
});

describe('Fase 7 · mapa', () => {
  it('reemplaza las pantallas base inicio y handia', () => {
    for (const id of ['inicio', 'handia']) {
      const p = PANTALLAS.filter((x) => x.id === id);
      expect(p).toHaveLength(1);
      expect(p[0]!.lote).toBe('7');
    }
    expect(INICIO7.map((p) => p.ruta)).toEqual(['/inicio/', '/handia/']);
  });
});
