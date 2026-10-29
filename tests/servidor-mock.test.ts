// Reglas del "servidor" simulado: son las que la vista de prueba le enseña a los 18 escenarios y las que el
// servidor real (Fase 4) tiene que cumplir. Reloj congelado: solo avanza con acciones de prueba.
import { describe, expect, it } from 'vitest';
import { ESCENARIOS } from '../src/mapa/escenarios.ts';
import { PANTALLAS } from '../src/mapa/pantallas.ts';
import { ErrorCliente } from '../src/data/cliente.ts';
import { crearClienteMock } from '../src/data/mock/cliente-mock.ts';
import { CONSTRUCTORES } from '../src/data/mock/escenarios-mundo.ts';
import { instanteBA } from '../src/data/mock/mundo.ts';

const crear = (escenario: string) =>
  crearClienteMock({ latenciaMs: 0, congelado: true, escenario });
const UBICACION = {
  ciudad: 'Mar del Plata',
  barrio: 'La Perla',
  direccion: 'Calle Ficticia 1650',
  referencia: null,
  origen: 'manual' as const,
  coordenadas: null,
};
const urgente = {
  rubro: 'plomeria' as const,
  tipo: 'urgente' as const,
  descripcion: 'Pierde la canilla.',
  ubicacion: UBICACION,
  fechaSolicitada: null,
  precioPropuestoCentavos: null,
  autoaceptacion: null,
  fotos: [],
};
const CLAVE = '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
const CLAVE2 = '2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e';

async function codigo(p: Promise<unknown>): Promise<string> {
  try {
    await p;
    return 'ok';
  } catch (e) {
    if (e instanceof ErrorCliente) return e.conflicto ? `${e.codigo}:${e.conflicto}` : e.codigo;
    throw e;
  }
}

describe('escenarios', () => {
  it('cada escenario obligatorio tiene un mundo y una página de entrada', () => {
    expect(ESCENARIOS).toHaveLength(18);
    for (const e of ESCENARIOS) {
      expect(CONSTRUCTORES[e.id], e.id).toBeDefined();
      expect(e.entrada.startsWith('/'), e.id).toBe(true);
      expect(
        PANTALLAS.some((p) => p.ruta === e.entrada),
        e.id,
      ).toBe(true);
    }
  });

  it('todos los mundos responden con datos que cumplen el contrato', async () => {
    for (const e of ESCENARIOS.filter((x) => !['nuevo-usuario', 'sesion-vencida'].includes(x.id))) {
      const api = crear(e.id);
      for (const id of [
        'sesion',
        'pedidos',
        'trabajos',
        'conversaciones',
        'notificaciones',
        'reclamos',
        'fee',
      ] as const)
        await api.llamar(id);
    }
  });
});

describe('cuenta y demo cerrada', () => {
  it('sin invitación válida no hay alta, y el preregistro no crea cuentas', async () => {
    const api = crear('nuevo-usuario');
    const base = {
      email: 'nueva@example.test',
      contrasena: 'una-contrasena-larga',
      aceptaciones: [
        { documento: 'terminos' as const, version: 'terminos-demo-2026-11' },
        { documento: 'privacidad' as const, version: 'privacidad-demo-2026-11' },
      ],
    };
    expect(
      await codigo(api.llamar('registro', { cuerpo: { ...base, codigoInvitacion: 'NOEXISTE1' } })),
    ).toBe('validacion');
    const sesion = await api.llamar('registro', {
      cuerpo: { ...base, codigoInvitacion: 'DEMO2026' },
    });
    expect(sesion.cuenta.estado).toBe('perfil_incompleto');
    expect(sesion.pendientes.camposPerfil).toHaveLength(6);
    // La invitación es de un solo uso.
    expect(
      await codigo(
        api.llamar('registro', {
          cuerpo: { ...base, email: 'otra@example.test', codigoInvitacion: 'DEMO2026' },
        }),
      ),
    ).toBe('validacion');
  });

  it('perfil incompleto no puede pedir; al completarlo queda activa', async () => {
    const api = crear('nuevo-usuario');
    await api.llamar('registro', {
      cuerpo: {
        email: 'nueva@example.test',
        contrasena: 'una-contrasena-larga',
        codigoInvitacion: 'DEMO2026',
        aceptaciones: [
          { documento: 'terminos', version: 'terminos-demo-2026-11' },
          { documento: 'privacidad', version: 'privacidad-demo-2026-11' },
        ],
      },
    });
    expect(await codigo(api.llamar('pedidoCrear', { cuerpo: urgente }))).toBe('sin_permiso');
    expect(
      await codigo(api.llamar('perfil', { cuerpo: { version: 0, fechaNacimiento: '2015-01-01' } })),
    ).toBe('validacion');
    await api.llamar('perfil', {
      cuerpo: {
        version: 0,
        nombre: 'Persona',
        apellido: 'Ficticia',
        fechaNacimiento: '1990-01-01',
        nacionalidad: 'AR',
        genero: 'mujer',
        ubicacion: UBICACION,
      },
    });
    expect((await api.llamar('sesion')).cuenta.estado).toBe('activa');
    // Edición con una versión vieja: conflicto.
    expect(await codigo(api.llamar('perfil', { cuerpo: { version: 0, nombre: 'Otra' } }))).toBe(
      'conflicto:version',
    );
  });

  it('el fee 0 % se acepta una vez por versión', async () => {
    const api = crear('nuevo-usuario');
    await api.llamar('login', {
      cuerpo: { email: 'usuaria@example.test', contrasena: 'handyx-demo-1234' },
    });
    const fee = await api.llamar('fee');
    expect(fee.vigente?.usuarioBp).toBe(0);
    expect(fee.siguiente).toBeNull();
    expect(
      await codigo(
        api.llamar('feeAceptar', {
          cuerpo: { politicaId: fee.vigente?.id ?? '', version: 'fee-vieja-2026-01-01' },
        }),
      ),
    ).toBe('conflicto:version');
  });

  it('la sesión vence y la baja muestra su estado real', async () => {
    const api = crear('sesion-vencida');
    let vencio = false;
    for (let i = 0; i < 9 && !vencio; i += 1)
      vencio = (await codigo(api.llamar('pedidos'))) === 'sesion_vencida';
    expect(vencio).toBe(true);
    const baja = crear('baja-solicitada');
    expect((await baja.llamar('baja')).estado).toBe('en_proceso');
    expect((await baja.llamar('sesion')).cuenta.estado).toBe('baja_solicitada');
    baja.ejecutar('reloj_1d');
    const final = await baja.llamar('baja');
    expect(final.estado).toBe('completada_con_retencion');
    expect(final.retenciones.length).toBeGreaterThan(0);
  });
});

describe('pedidos, búsqueda y propuestas', () => {
  it('crear es idempotente: doble tap con la misma clave no duplica el pedido', async () => {
    const api = crear('otra-ciudad');
    expect(
      await codigo(
        api.llamar('pedidoCrear', {
          cuerpo: { ...urgente, ubicacion: { ...UBICACION, ciudad: 'Rosario' } },
        }),
      ),
    ).toBe('sin_permiso');
    const ok = crear('varias-propuestas');
    const a = await ok.llamar('pedidoCrear', { cuerpo: urgente, claveIdempotencia: CLAVE });
    const b = await ok.llamar('pedidoCrear', { cuerpo: urgente, claveIdempotencia: CLAVE });
    expect(b.id).toBe(a.id);
    expect(
      (await ok.llamar('pedidos')).items.filter((p) => p.descripcion === urgente.descripcion),
    ).toHaveLength(1);
    const c = await ok.llamar('pedidoCrear', { cuerpo: urgente, claveIdempotencia: CLAVE2 });
    expect(c.id).not.toBe(a.id);
  });

  it('un pedido sin ETA: busca, llegan ofertas al pasar el tiempo y las urgentes vencen a los 5 min', async () => {
    const api = crear('varias-propuestas');
    const p = await api.llamar('pedidoCrear', { cuerpo: urgente });
    expect(p.estado).toBe('buscando');
    expect(Date.parse(p.busqueda.ventanaHasta) - Date.parse(p.busqueda.iniciadaEn)).toBe(
      20 * 60_000,
    );
    api.ejecutar('reloj_5m');
    const con = await api.llamar('pedido', { parametros: { id: p.id } });
    expect(con.estado).toBe('con_propuestas');
    const props = await api.llamar('propuestas', { parametros: { id: p.id } });
    expect(props.items.length).toBeGreaterThan(0);
    for (const x of props.items) {
      expect(Date.parse(x.venceEn) - Date.parse(x.creadaEn)).toBe(5 * 60_000);
      expect(x.comisionHandy.bp).toBe(0);
      expect(x.comisionHandy.importe.centavos).toBe(0);
    }
    api.ejecutar('reloj_5m');
    const venc = await api.llamar('propuestas', { parametros: { id: p.id } });
    expect(venc.items.every((x) => x.estado === 'vencida')).toBe(true);
    const primera = venc.items[0];
    expect(
      await codigo(
        api.llamar('propuestaAceptar', {
          parametros: { id: primera?.id ?? '' },
          cuerpo: { version: primera?.version ?? 0 },
        }),
      ),
    ).toBe('conflicto:vencida');
  });

  it('sin oferta: sin respuesta a los 20 min, relanzar con límite y búsqueda manual', async () => {
    const api = crear('urgencia-sin-respuesta');
    const [p] = (await api.llamar('pedidos')).items;
    expect(p?.estado).toBe('sin_respuesta');
    let actual = p!;
    for (let intento = 1; intento < actual.busqueda.maxIntentos; intento += 1) {
      actual = await api.llamar('pedidoRelanzar', {
        parametros: { id: actual.id },
        cuerpo: { version: actual.version },
      });
      expect(actual.estado).toBe('buscando');
      api.ejecutar('reloj_30m');
      actual = await api.llamar('pedido', { parametros: { id: actual.id } });
      expect(actual.estado).toBe('sin_respuesta');
    }
    expect(
      await codigo(
        api.llamar('pedidoRelanzar', {
          parametros: { id: actual.id },
          cuerpo: { version: actual.version },
        }),
      ),
    ).toBe('conflicto:transicion');
    const manual = await api.llamar('pedidoBusquedaManual', {
      parametros: { id: actual.id },
      cuerpo: { version: actual.version },
    });
    expect(manual.estado).toBe('busqueda_manual');
    api.ejecutar('ofertas_ahora');
    expect((await api.llamar('pedido', { parametros: { id: actual.id } })).estado).toBe(
      'con_propuestas',
    );
  });

  it('aceptar crea un solo trabajo; repetir con la misma clave es seguro y con otra, 409', async () => {
    const api = crear('varias-propuestas');
    const [p] = (await api.llamar('pedidos')).items;
    const { items } = await api.llamar('propuestas', { parametros: { id: p?.id ?? '' } });
    const [a, b] = items;
    const r1 = await api.llamar('propuestaAceptar', {
      parametros: { id: a?.id ?? '' },
      cuerpo: { version: a?.version ?? 0 },
      claveIdempotencia: CLAVE,
    });
    const r2 = await api.llamar('propuestaAceptar', {
      parametros: { id: a?.id ?? '' },
      cuerpo: { version: a?.version ?? 0 },
      claveIdempotencia: CLAVE,
    });
    expect(r2.trabajo.id).toBe(r1.trabajo.id);
    expect(
      await codigo(
        api.llamar('propuestaAceptar', {
          parametros: { id: a?.id ?? '' },
          cuerpo: { version: 1 },
          claveIdempotencia: CLAVE2,
        }),
      ),
    ).toBe('conflicto:ya_resuelta');
    expect(
      await codigo(
        api.llamar('propuestaAceptar', {
          parametros: { id: b?.id ?? '' },
          cuerpo: { version: b?.version ?? 0 },
        }),
      ),
    ).toBe('conflicto:ya_resuelta');
    expect((await api.llamar('trabajos')).items.filter((t) => t.pedidoId === p?.id)).toHaveLength(
      1,
    );
    expect(r1.trabajo.acuerdo.monto.centavos).toBe(a?.monto.centavos);
    expect((await api.llamar('pedido', { parametros: { id: p?.id ?? '' } })).estado).toBe(
      'contratado',
    );
  });

  it('la carrera con otro dispositivo deja un solo acuerdo y avisa ya_resuelta', async () => {
    const api = crear('aceptacion-duplicada');
    const [p] = (await api.llamar('pedidos')).items;
    const [a] = (await api.llamar('propuestas', { parametros: { id: p?.id ?? '' } })).items;
    expect(
      await codigo(
        api.llamar('propuestaAceptar', {
          parametros: { id: a?.id ?? '' },
          cuerpo: { version: a?.version ?? 0 },
        }),
      ),
    ).toBe('conflicto:ya_resuelta');
    expect(
      (await api.llamar('pedido', { parametros: { id: p?.id ?? '' } })).trabajoId,
    ).not.toBeNull();
  });

  it('contrapropuesta: la anterior queda reemplazada y no hay acuerdo hasta que la otra parte acepta', async () => {
    const api = crear('contrapropuesta');
    const [p] = (await api.llamar('pedidos')).items;
    const [orig] = (await api.llamar('propuestas', { parametros: { id: p?.id ?? '' } })).items;
    const contra = await api.llamar('contrapropuesta', {
      parametros: { id: orig?.id ?? '' },
      cuerpo: {
        reemplazaA: orig?.id ?? '',
        versionAnterior: orig?.version ?? 0,
        montoCentavos: 4_000_000,
        alcance: orig?.alcance ?? 'x',
        horario: orig?.horario ?? null,
      },
    });
    expect(contra.autorRol).toBe('usuario');
    expect(contra.estado).toBe('pendiente');
    expect((await api.llamar('propuesta', { parametros: { id: orig?.id ?? '' } })).estado).toBe(
      'reemplazada',
    );
    expect((await api.llamar('pedido', { parametros: { id: p?.id ?? '' } })).trabajoId).toBeNull();
    // El usuario no puede aceptar su propia propuesta.
    expect(
      await codigo(
        api.llamar('propuestaAceptar', {
          parametros: { id: contra.id },
          cuerpo: { version: contra.version },
        }),
      ),
    ).toBe('sin_permiso');
    api.ejecutar('contra_acepta');
    const pedido = await api.llamar('pedido', { parametros: { id: p?.id ?? '' } });
    expect(pedido.estado).toBe('contratado');
    const trabajo = await api.llamar('trabajo', { parametros: { id: pedido.trabajoId ?? '' } });
    expect(trabajo.acuerdo.monto.centavos).toBe(4_000_000);
  });

  it('la autoaceptación solo actúa si el usuario la eligió y la oferta entra en su máximo', async () => {
    const api = crear('varias-propuestas');
    const sin = await api.llamar('pedidoCrear', {
      cuerpo: { ...urgente, descripcion: 'Sin auto' },
    });
    const con = await api.llamar('pedidoCrear', {
      cuerpo: {
        ...urgente,
        descripcion: 'Con auto',
        autoaceptacion: { montoMaximoCentavos: 10_000_000 },
      },
    });
    api.ejecutar('reloj_5m');
    expect((await api.llamar('pedido', { parametros: { id: sin.id } })).estado).toBe(
      'con_propuestas',
    );
    expect((await api.llamar('pedido', { parametros: { id: con.id } })).estado).toBe('contratado');
  });

  it('fechas pasadas y ciudades sin cobertura se rechazan en el servidor', async () => {
    const api = crear('varias-propuestas');
    const pasada = {
      ...urgente,
      tipo: 'programado' as const,
      fechaSolicitada: { fecha: '2026-11-16', desde: '10:00', hasta: null },
    };
    expect(await codigo(api.llamar('pedidoCrear', { cuerpo: pasada }))).toBe('validacion');
    const futura = {
      ...pasada,
      fechaSolicitada: { fecha: '2026-11-25', desde: '03:00', hasta: null },
    };
    const p = await api.llamar('pedidoCrear', { cuerpo: futura });
    expect(p.fechaSolicitada?.desde).toBe('03:00');
    expect(instanteBA('2026-11-25', '03:00')).toBe('2026-11-25T06:00:00.000Z');
    expect(
      await codigo(
        api.llamar('pedidoCrear', {
          cuerpo: { ...urgente, ubicacion: { ...UBICACION, ciudad: 'Rosario' } },
        }),
      ),
    ).toBe('sin_permiso');
  });

  it('cancelar un pedido retira sus propuestas y no se puede cancelar dos veces', async () => {
    const api = crear('varias-propuestas');
    const [p] = (await api.llamar('pedidos')).items;
    const c = await api.llamar('pedidoCancelar', {
      parametros: { id: p?.id ?? '' },
      cuerpo: { version: p?.version ?? 0, motivo: 'ya_no_lo_necesito' },
    });
    expect(c.estado).toBe('cancelado');
    expect(
      (await api.llamar('propuestas', { parametros: { id: p?.id ?? '' } })).items.every(
        (x) => x.estado === 'retirada',
      ),
    ).toBe(true);
    expect(
      await codigo(
        api.llamar('pedidoCancelar', {
          parametros: { id: p?.id ?? '' },
          cuerpo: { version: c.version, motivo: 'otro' },
        }),
      ),
    ).toBe('conflicto:transicion');
  });
});

describe('trabajo, chat, pagos y reclamos', () => {
  it('el chat existe desde la cotización, reintentar no duplica y falla como se configura', async () => {
    const api = crear('chat-fallido');
    const [conv] = (await api.llamar('conversaciones')).items;
    const cuerpo = {
      clienteId: CLAVE,
      tipo: 'texto' as const,
      texto: 'Hola, ¿venís el miércoles?',
    };
    expect(
      await codigo(api.llamar('mensajeEnviar', { parametros: { id: conv?.id ?? '' }, cuerpo })),
    ).toBe('no_disponible');
    const ok = await api.llamar('mensajeEnviar', { parametros: { id: conv?.id ?? '' }, cuerpo });
    const otra = await api.llamar('mensajeEnviar', { parametros: { id: conv?.id ?? '' }, cuerpo });
    expect(otra.id).toBe(ok.id);
    const { items } = await api.llamar('mensajes', { parametros: { id: conv?.id ?? '' } });
    expect(items.filter((x) => x.clienteId === CLAVE)).toHaveLength(1);
    expect((items[0]?.creadoEn ?? '') >= (items.at(-1)?.creadoEn ?? '')).toBe(true);
  });

  it('un chat y un trabajo ajenos son 404', async () => {
    const api = crear('chat-fallido');
    expect(await codigo(api.llamar('mensajes', { parametros: { id: CLAVE } }))).toBe(
      'no_encontrado',
    );
    expect(await codigo(api.llamar('trabajo', { parametros: { id: CLAVE } }))).toBe(
      'no_encontrado',
    );
  });

  it('el pago en efectivo queda reportado (no verificado) y solo lo verifica la contraparte', async () => {
    const api = crear('efectivo-reportado');
    const [t] = (await api.llamar('trabajos')).items;
    const { items } = await api.llamar('pagos', { parametros: { id: t?.id ?? '' } });
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      estado: 'reportado',
      fuente: 'reporte_usuario',
      verificadoEn: null,
    });
    expect(
      await codigo(
        api.llamar('pagoReportar', {
          parametros: { id: t?.id ?? '' },
          cuerpo: {
            metodo: 'efectivo',
            montoCentavos: t?.acuerdo.monto.centavos ?? 0,
            etapaId: null,
          },
        }),
      ),
    ).toBe('conflicto:ya_resuelta');
    api.ejecutar('pago_verificar');
    expect((await api.llamar('pago', { parametros: { id: items[0]?.id ?? '' } })).estado).toBe(
      'verificado',
    );
  });

  it('Mercado Pago: inactivo por defecto; con la ruta aprobada, volver del checkout no confirma nada', async () => {
    const cerrado = crear('efectivo-reportado');
    expect(
      await codigo(
        cerrado.llamar('pagoReportar', {
          parametros: { id: (await cerrado.llamar('trabajos')).items[0]?.id ?? '' },
          cuerpo: { metodo: 'mercado_pago_directo', montoCentavos: 4_500_000, etapaId: null },
        }),
      ),
    ).toBe('funcion_inactiva');
    const api = crear('mp-pendiente-fallido');
    const [t] = (await api.llamar('trabajos')).items;
    const pagos = await api.llamar('pagos', { parametros: { id: t?.id ?? '' } });
    expect(pagos.items[0]?.estado).toBe('fallido');
    const nuevo = await api.llamar('pagoReportar', {
      parametros: { id: t?.id ?? '' },
      cuerpo: {
        metodo: 'mercado_pago_directo',
        montoCentavos: t?.acuerdo.monto.centavos ?? 0,
        etapaId: null,
      },
    });
    expect(nuevo.estado).toBe('pendiente');
    const { url } = await api.llamar('pagoCheckout', { parametros: { id: nuevo.id } });
    expect(url.startsWith('https://')).toBe(true);
    // Volver de la URL de checkout no cambia el estado.
    expect((await api.llamar('pago', { parametros: { id: nuevo.id } })).estado).toBe('pendiente');
    api.ejecutar('checkout_ok');
    expect(await api.llamar('pago', { parametros: { id: nuevo.id } })).toMatchObject({
      estado: 'verificado',
      fuente: 'proveedor',
    });
  });

  it('obra por etapas: cada etapa se confirma antes de cerrar y los montos suman el total', async () => {
    const api = crear('obra-por-etapas');
    const [t] = (await api.llamar('trabajos')).items;
    expect(t?.etapas.reduce((s, e) => s + e.monto.centavos, 0)).toBe(t?.acuerdo.monto.centavos);
    const e1 = t!.etapas[0]!;
    const c = await api.llamar('etapaConfirmar', {
      parametros: { id: t!.id, etapaId: e1.id },
      cuerpo: { version: e1.version },
    });
    expect(c.etapas.map((e) => e.estado)).toEqual(['confirmada', 'en_curso', 'pendiente']);
    expect(
      await codigo(
        api.llamar('trabajoConfirmarFin', {
          parametros: { id: t!.id },
          cuerpo: { version: c.version },
        }),
      ),
    ).toBe('conflicto:transicion');
  });

  it('cambiar el acuerdo exige otra propuesta aceptada y deja historial', async () => {
    const api = crear('cancelacion');
    const [t] = (await api.llamar('trabajos')).items;
    const prop = await api.llamar('trabajoProponerCambio', {
      parametros: { id: t!.id },
      cuerpo: {
        montoCentavos: 5_000_000,
        alcance: t!.acuerdo.alcance,
        horario: t!.acuerdo.horario,
      },
    });
    expect(prop.tipo).toBe('cambio_acuerdo');
    expect(
      (await api.llamar('trabajo', { parametros: { id: t!.id } })).acuerdo.monto.centavos,
    ).toBe(4_500_000);
    api.ejecutar('contra_acepta');
    const despues = await api.llamar('trabajo', { parametros: { id: t!.id } });
    expect(despues.acuerdo.monto.centavos).toBe(5_000_000);
    expect(despues.historialAcuerdos).toHaveLength(1);
  });

  it('cancelar un trabajo agendado queda en el historial con actor y fecha', async () => {
    const api = crear('cancelacion');
    const [t] = (await api.llamar('trabajos')).items;
    const c = await api.llamar('trabajoCancelar', {
      parametros: { id: t!.id },
      cuerpo: { version: t!.version, motivo: 'cambio_de_planes' },
    });
    expect(c.estado).toBe('cancelado');
    const ev = await api.llamar('trabajoEventos', { parametros: { id: t!.id } });
    expect(ev.items[0]).toMatchObject({ a: 'cancelado', actor: 'usuario' });
    expect(
      await codigo(
        api.llamar('trabajoCancelar', {
          parametros: { id: t!.id },
          cuerpo: { version: c.version, motivo: 'otro' },
        }),
      ),
    ).toBe('conflicto:transicion');
  });

  it('reclamos: se abren sobre un trabajo propio, se responde solo cuando lo piden y el historial es auditable', async () => {
    const api = crear('reclamo');
    const [existente] = (await api.llamar('reclamos')).items;
    expect(existente?.estado).toBe('esperando_usuario');
    const r = await api.llamar('reclamoResponder', {
      parametros: { id: existente!.id },
      cuerpo: { version: existente!.version, detalle: 'Adjunto el detalle.', adjuntos: [] },
    });
    expect(r.estado).toBe('en_revision');
    expect(r.historial.at(-1)).toMatchObject({ a: 'en_revision', actor: 'usuario' });
    expect(
      await codigo(
        api.llamar('reclamoResponder', {
          parametros: { id: r.id },
          cuerpo: { version: r.version, detalle: 'Otra vez', adjuntos: [] },
        }),
      ),
    ).toBe('conflicto:transicion');
    const [t] = (await api.llamar('trabajos')).items;
    const nuevo = await api.llamar('reclamoCrear', {
      cuerpo: {
        pedidoId: t!.pedidoId,
        trabajoId: t!.id,
        categoria: 'calidad',
        detalle: 'La terminación quedó dispareja.',
        adjuntos: [],
      },
      claveIdempotencia: CLAVE,
    });
    expect(nuevo.estado).toBe('abierto');
    expect(nuevo.historial).toHaveLength(1);
    expect(
      await codigo(
        api.llamar('reclamoCrear', {
          cuerpo: {
            pedidoId: CLAVE,
            trabajoId: null,
            categoria: 'otro',
            detalle: 'x',
            adjuntos: [],
          },
        }),
      ),
    ).toBe('no_encontrado');
  });

  it('las fotos tienen tipo y tamaño limitados y pueden fallar', async () => {
    const api = crear('chat-fallido');
    const form = (tipo: string, bytes: number) => {
      const f = new FormData();
      f.set('archivo', new File([new Uint8Array(bytes)], 'foto', { type: tipo }));
      return f;
    };
    expect(await codigo(api.llamar('media', { cuerpo: form('image/jpeg', 10) }))).toBe(
      'no_disponible',
    );
    expect(await codigo(api.llamar('media', { cuerpo: form('application/pdf', 10) }))).toBe(
      'tipo_no_permitido',
    );
    expect(await codigo(api.llamar('media', { cuerpo: form('image/png', 6 * 1024 * 1024) }))).toBe(
      'payload_grande',
    );
    const ok = await api.llamar('media', { cuerpo: form('image/webp', 2048) });
    expect(ok.url.startsWith('https://')).toBe(true);
  });
});
