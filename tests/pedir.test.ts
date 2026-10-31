// Inicio y pedir (lote 3.4): garantías del flujo de pedido y de la pantalla de búsqueda.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const leer = (f: string) => readFileSync(f, 'utf8');
const pedir = leer('src/app/(app)/pedir/page.tsx');
const buscando = leer('src/components/PedidoBuscando.tsx');
const inicio = leer('src/app/(app)/inicio/page.tsx');
const SIN_ETA = /llegar[áa] en|\bETA\b|tarda(r[áa])? \d|minutos? de distancia/i;

describe('pedir', () => {
  it('una urgencia no pide día ni franja; programado y obra sí', () => {
    expect(pedir).toMatch(
      /programado\s*\?\s*\['rubro', 'cuando', 'programar', 'contanos', 'direccion', 'revisar'\]\s*:\s*\['rubro', 'cuando', 'contanos', 'direccion', 'revisar'\]/,
    );
    expect(pedir).toMatch(/const programado = tipo !== null && tipo !== 'urgente';/);
  });

  it('lo que se elige es una solicitud, sin promesas de llegada', () => {
    expect(pedir).toMatch(/Es una solicitud/);
    expect(pedir).not.toMatch(SIN_ETA);
  });

  it('las franjas de hoy que ya pasaron no se pueden elegir', () => {
    expect(pedir).toMatch(/disabled=\{yaPaso\(f\)\}/);
  });

  it('las fotos no se pierden al cambiar de paso', () => {
    expect(pedir).toMatch(/const estadoFotos = useFotos\(setFotos\);/);
    expect(pedir).toMatch(/estado=\{estadoFotos\}/);
  });

  it('un rechazo del servidor vuelve al paso del dato', () => {
    expect(pedir).toMatch(/PASO_DEL_CAMPO/);
  });

  it('la aceptación automática arranca apagada', () => {
    expect(pedir).toMatch(/const \[auto, setAuto\] = useState\(false\);/);
  });
});

describe('búsqueda', () => {
  it('dice hasta cuándo sigue la búsqueda, nunca cuándo llega alguien', () => {
    expect(buscando).toMatch(/horaDeInstante\(p\.busqueda\.ventanaHasta\)/);
    expect(buscando).toMatch(/no podemos prometer cuándo/);
    expect(buscando).not.toMatch(SIN_ETA);
  });

  it('relanzar respeta el límite de intentos', () => {
    expect(buscando).toMatch(/p\.estado === 'sin_respuesta' && quedanIntentos/);
  });
});

describe('inicio', () => {
  it('cada rubro con su Handy y la dirección con el mapa', () => {
    expect(inicio).toMatch(/<HandyRubro rubro=\{r\} \/>/);
    expect(inicio).toMatch(/<MapaHx[\s\S]*modo="ver"/);
  });
});
