// Inicio y pedir (lote 3.4): garantías del flujo de pedido y de la pantalla de búsqueda.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const leer = (f: string) => readFileSync(f, 'utf8');
// Fase 7: el flujo de pedir se partió en el estado del pedido (_pedido.ts) y un archivo por grupo de pasos.
const DIR = 'src/app/(app)/pedir/';
const flujo = leer(`${DIR}_pedido.ts`);
const inicioPasos = leer(`${DIR}_PasosInicio.tsx`);
const datosPasos = leer(`${DIR}_PasosDatos.tsx`);
const revisar = leer(`${DIR}_Revisar.tsx`);
const todoPedir = [
  'page.tsx',
  '_pedido.ts',
  '_PasosInicio.tsx',
  '_PasosDatos.tsx',
  '_Revisar.tsx',
  '_Publicado.tsx',
  '_problemas.ts',
]
  .map((x) => leer(DIR + x))
  .join('\n');
const buscando = leer('src/components/PedidoBuscando.tsx');
const inicio = leer('src/app/(app)/inicio/page.tsx');
const SIN_ETA = /llegar[áa] en|\bETA\b|tarda(r[áa])? \d|minutos? de distancia/i;

describe('pedir', () => {
  it('una urgencia no pide día ni franja; programado y obra sí', () => {
    // «Lo antes posible» va directo a revisar; «Programar» y «Obra» pasan por el día y la franja.
    expect(inicioPasos).toMatch(/f\.setTipo\('urgente'\);\s*f\.ir\('revisar'\);/);
    expect(inicioPasos).toMatch(/f\.setTipo\('programado'\);\s*f\.ir\('programar'\);/);
    expect(inicioPasos).toMatch(/f\.setTipo\('obra'\);\s*f\.ir\('programar'\);/);
    expect(flujo).toMatch(/const programado = tipo !== 'urgente';/);
    expect(flujo).toMatch(/if \(p === 'programar' && programado\)/);
    // La urgencia nunca manda fecha, y revisar no la marca como faltante.
    expect(flujo).toMatch(/fechaSolicitada:\s*tipo !== 'urgente' && fecha && desde \?/);
    expect(revisar).toMatch(/falta=\{f\.tipo !== 'urgente' && !\(f\.fecha && f\.desde\)\}/);
  });

  it('lo que se elige es una solicitud, sin promesas de llegada', () => {
    expect(datosPasos).toMatch(/Es una solicitud/);
    expect(inicioPasos).toMatch(/no prometemos cuánto tarda/);
    expect(todoPedir).not.toMatch(SIN_ETA);
  });

  it('las franjas de hoy que ya pasaron no se pueden elegir', () => {
    expect(datosPasos).toMatch(/disabled=\{f\.yaPaso\(fr\)\}/);
    expect(flujo).toMatch(
      /const yaPaso = \(f: \{ desde: string \}\) => fecha === hoy && f\.desde <= horaAhora;/,
    );
    // Y aunque se escriba a mano, el paso no se valida con un horario que ya pasó.
    expect(flujo).toMatch(/fecha === hoy && desde <= horaAhora\) n\.desde = 'Ese horario ya pasó/);
  });

  it('las fotos no se pierden al cambiar de paso', () => {
    // El estado de las fotos vive en el flujo (no en el paso), así sobrevive a ir y volver.
    expect(flujo).toMatch(/const estadoFotos = useFotos\(setFotos\);/);
    expect(inicioPasos).toMatch(/estado=\{f\.estadoFotos\}/);
    expect(inicioPasos).not.toMatch(/useFotos\(/);
  });

  it('un rechazo del servidor vuelve al paso del dato', () => {
    expect(flujo).toMatch(/map\(PASO_DEL_CAMPO\)\.find\(Boolean\)/);
    expect(flujo).toMatch(/if \(destino && destino !== 'revisar'\) setPaso\(destino\);/);
  });

  it('la aceptación automática arranca apagada', () => {
    expect(flujo).toMatch(/const \[auto, setAuto\] = useState\(false\);/);
    expect(flujo).toMatch(/autoaceptacion: max \? \{ montoMaximoCentavos: max \} : null/);
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
  it('cada rubro con su ícono y nombre, y la dirección con el mapa', () => {
    // Fase 7: los rubros usan íconos de línea (no los Handys); cada uno lleva su ícono y su nombre, y entra al pedido
    // con el rubro elegido. La dirección se ve en el mapa (solo mirar).
    expect(inicio).toMatch(
      /RUBROS\.map\(\(r\) => \(\s*<Mosaico\s+key=\{r\}\s+icono=\{RUBROS_INFO\[r\]\.icono\}\s+texto=\{RUBROS_INFO\[r\]\.corto\}\s+href=\{destino\(\{ rubro: r \}\)\}/,
    );
    expect(inicio).toMatch(/<MapaHx[\s\S]*modo="ver"/);
  });
});
