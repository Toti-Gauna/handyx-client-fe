// Trabajo en curso y cierre (lote 3.6; viaje en vivo 4.7): seguimiento sin ETA propia, festejo después del hecho, pago, comprobante y reseña.
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { prepararResena } from '../src/data/resena.ts';
import { distanciaAprox, textosViaje } from '../src/domain/viaje.ts';

const leer = (f: string) => readFileSync(f, 'utf8');
// Fase 7: el detalle del trabajo se partió en seguimiento (agendado, en camino, llegó, trabajando) y cierre, y el pago
// en elegir e informado.
const DET = 'src/app/(app)/trabajos/detalle/';
const pagina = leer(`${DET}page.tsx`);
const seguimiento = leer(`${DET}Seguimiento.tsx`);
const enCamino = leer(`${DET}EnCamino.tsx`);
const cierre = leer(`${DET}Cierre.tsx`);
const detalle = [
  'page.tsx',
  'Seguimiento.tsx',
  'EnCamino.tsx',
  'Cierre.tsx',
  'Avisos.tsx',
  'AtajosTrabajo.tsx',
  'HojaCancelar.tsx',
  'contexto.ts',
]
  .map((x) => leer(DET + x))
  .join('\n');
const trabajoTsx = leer('src/components/Trabajo.tsx');
const etapas = leer('src/ui/moleculas.tsx');
const elegir = leer('src/app/(app)/trabajos/pago/Elegir.tsx');
const informado = leer('src/app/(app)/trabajos/pago/Informado.tsx');
const resena = leer('src/app/(app)/trabajos/resena/page.tsx');
const viajeTxt = leer('src/domain/viaje.ts');
const SIN_ETA = /llegar[áa] en|\bETA\b|tarda(r[áa])? \d|minutos? de distancia|llega en \d/i;

describe('seguimiento', () => {
  it('las etapas del turno en orden, con el paso actual marcado', () => {
    // Fase 7: las cuatro de la demo más el cierre («Terminado y pago»).
    expect(trabajoTsx).toMatch(
      /'Turno confirmado'[\s\S]*'En camino'[\s\S]*'Llegó'[\s\S]*'Trabajando'[\s\S]*'Terminado y pago'/,
    );
    expect(etapas).toMatch(/aria-current=\{estado === 'actual' \? 'step' : undefined\}/);
    expect(enCamino).toMatch(
      /pasos=\{pasosTurno\(t\)\}\s*hechas=\{HECHAS_POR_ESTADO\[t\.estado\]\}/,
    );
  });

  it('sin tiempos de llegada propios ni seguimiento de tu ubicación', () => {
    expect(detalle).not.toMatch(SIN_ETA);
    expect(viajeTxt).not.toMatch(SIN_ETA);
    expect(enCamino).toMatch(
      /Nosotros no seguimos tu ubicación\. La del especialista se ve solo mientras viene en\s+camino y la comparte/,
    );
    // Ni reloj ni cuentas propias: la llegada estimada y lo que falta llegan del servidor.
    for (const f of [detalle, viajeTxt]) {
      expect(f).not.toMatch(/Date\.now|new Date\(\)|duracionS|\/\s*VELOCIDAD/);
    }
  });

  it('el viaje en vivo solo en camino y solo mientras comparte (decisión del 31/10)', () => {
    // El viaje se consulta solo dentro de la pantalla «en camino», que se muestra solo con ese estado.
    expect(seguimiento).toMatch(
      /if \(c\.t\.estado === 'en_camino'\) return <EnCamino \{\.\.\.c\} \/>;/,
    );
    expect(detalle.match(/useViaje\(/g)).toHaveLength(1);
    expect(enCamino).toMatch(/const vivo = useViaje\(t\.id, true\);/);
    expect(enCamino).toMatch(/vivo\.viaje\?\.estado === 'compartiendo' \? vivo\.viaje : null/);
    expect(enCamino).toMatch(/trayecto=\{compartiendo\?\.trayecto\?\.linea \?\? null\}/);
    expect(enCamino).toMatch(/compartiendo\?\.ultimaPosicion\s*\?/);
  });
});

describe('textos del viaje en vivo', () => {
  const instante = '2026-11-18T13:42:00.000Z';
  const base = {
    trabajoId: 'de000000-0000-4000-8000-000000000001',
    destino: { lat: -38, lng: -57.55 },
  };
  const vacio = {
    trayecto: null,
    ultimaPosicion: null,
    distanciaRestanteM: null,
    llegadaEstimada: null,
  };

  it('compartiendo: lo que falta y la llegada estimada del servidor, en hora de Buenos Aires', () => {
    const v = textosViaje(
      {
        ...base,
        estado: 'compartiendo',
        trayecto: null,
        ultimaPosicion: null,
        distanciaRestanteM: 1234,
        llegadaEstimada: instante,
      },
      null,
      true,
    );
    expect(v.chip).toBe('Llegada estimada 10:42');
    expect(v.detalle).toMatch(/^Faltan 1,2 km · llegada estimada 10:42\. La estima Handyx/);
    expect(v.nota).toMatch(/Está compartiendo su ubicación/);
    expect(v.corte).toBeNull();
  });

  it('sin compartir, terminado o sin datos: el horario acordado, sin hora de llegada', () => {
    for (const viaje of [
      { ...base, ...vacio, estado: 'sin_compartir' as const },
      { ...base, ...vacio, estado: 'terminado' as const },
      null,
    ]) {
      const v = textosViaje(viaje, null, true);
      expect(v.chip).toBeNull();
      expect(v.detalle).toBeNull();
      expect(v.nota).toMatch(/Va en el horario que acordaron/);
    }
    expect(textosViaje({ ...base, ...vacio, estado: 'sin_compartir' }, null, true).nota).toMatch(
      /Todavía no compartió su ubicación/,
    );
  });

  it('un corte se avisa y un pedido sin punto en el mapa lo explica', () => {
    const corte = { codigo: 'no_disponible', mensaje: 'Se cortó.', recuperable: true };
    expect(textosViaje(null, corte, false).corte).toBe('Se cortó.');
    expect(textosViaje(null, corte, true).corte).toBeNull();
    const sinPunto = { codigo: 'conflicto', mensaje: 'x', recuperable: false };
    expect(textosViaje(null, sinPunto, false).nota).toMatch(/no tiene un punto en el mapa/);
  });

  it('distancias aproximadas', () => {
    expect(distanciaAprox(12)).toBe('unos 50 m');
    expect(distanciaAprox(374)).toBe('unos 350 m');
    expect(distanciaAprox(999)).toBe('unos 1000 m');
    expect(distanciaAprox(2460)).toBe('2,5 km');
  });
});

describe('cierre', () => {
  it('"¡Quedó arreglado!" solo después de que confirmaste', () => {
    expect(cierre).toMatch(
      /\{finalizado \? \(\s*<Titulo nivel=\{2\} texto="¡Quedó ==arreglado==!"/,
    );
    expect(cierre).toMatch(/const finalizado = t\.estado === 'finalizado';/);
    // Mientras está activo, ni el cierre: el seguimiento.
    expect(pagina).toMatch(
      /ACTIVOS\.includes\(t\.estado\) \? <Seguimiento \{\.\.\.contexto\} \/> : <Cierre/,
    );
    expect(seguimiento).not.toMatch(/arreglado/);
  });

  it('una obra no se cierra con etapas sin confirmar', () => {
    expect(cierre).toMatch(/const etapasListas = etapasConfirmadas\(t\) === t\.etapas\.length;/);
    expect(cierre).toMatch(/\{etapasListas \? \(\s*<Boton icono="documento"/);
    const conformidad = leer('src/app/(app)/trabajos/conformidad/page.tsx');
    expect(conformidad).toMatch(/\{puede && etapasListas \? \(/);
  });

  it('un pago registrado por vos se muestra como informado, no como pagado y verificado', () => {
    expect(cierre).toMatch(/queda\s+“informado” hasta que se verifique/);
    expect(cierre).toMatch(/pago\?\.estado === 'verificado'\s*\?\s*'PAGO VERIFICADO'/);
    expect(informado).toMatch(/Informado no es verificado/);
    expect(elegir).toMatch(/queda informado, todavía no verificado/);
  });
});

describe('pago', () => {
  it('se confirma con un botón explícito (sin arrastrar), con el importe y sin duplicar', () => {
    // Fase 7: un solo botón principal que dice qué pasa y cuánto (WCAG 2.5.7: nada exige arrastrar).
    expect(elegir).toMatch(/onClick=\{\(\) => void pagar\(\)\}/);
    expect(elegir).toMatch(/`Ya le pagué \$\{pesos\(objetivo\.centavos\)\} en efectivo`/);
    expect(elegir).not.toMatch(/DeslizarConfirmar/);
    // Reintentar el mismo pago no lo registra dos veces.
    expect(elegir).toMatch(/`\$\{objetivo\.etapaId\}\|\$\{metodo\}\|\$\{objetivo\.centavos\}`/);
    // Volver del checkout no confirma nada: se consulta el estado real.
    expect(elegir).toMatch(/ir\(ruta\('\/pagos\/retorno\/'/);
  });

  it('el comprobante es el registro de Handyx, no una factura', () => {
    expect(informado).toMatch(/No es una factura/);
  });
});

describe('reseña', () => {
  it('solo de un trabajo que confirmaste que terminó', () => {
    expect(resena).toMatch(/if \(t\.estado !== 'finalizado' && !hecha\)/);
    expect(resena).toMatch(/primero confirmá que el trabajo terminó/);
    // El servidor simulado también lo rechaza (como el BE).
    expect(leer('src/data/mock/draft4.ts')).toMatch(
      /resenaCrear: sesion\([\s\S]{0,120}if \(t\.estado !== 'finalizado'\)\s*throw falla/,
    );
  });

  it('el comentario se envía sin datos personales', () => {
    const r = prepararResena(
      5,
      ['puntual'],
      'Excelente, escribime a ana@example.test o al 223 155-123456',
    );
    expect(r.comentario).not.toMatch(/ana@example|155-123456/);
    expect(r.comentario).toMatch(/Excelente/);
    // Y la pantalla manda exactamente eso.
    expect(resena).toMatch(/cuerpo: prepararResena\(puntaje, destacados, comentario\)/);
  });

  it('se publica por resenaCrear del contrato (draft.4), sin guardar nada en el celular', () => {
    // resenaCrear ya existe en el contrato: la reseña va al servidor; si el BE la tiene inactiva, se ve su error.
    expect(resena).toMatch(/accion\.enviar\(\s*'resenaCrear'/);
    expect(resena).toMatch(/accion\.error \? <Aviso tipo="error">/);
    expect(leer('src/data/resena.ts')).not.toMatch(/localStorage|sessionStorage|indexedDB|fetch\(/);
  });
});
