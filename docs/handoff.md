# Handoff · Bloque 3 · App de usuario de Handyx

**Fase actual: 3 · Refinación de diseño — lote 3.1 listo.** Próximo: lote 3.2 (responsive y accesibilidad), misma rama.
Fecha: 29/10/2026. Rama: `fase-3-diseno` (parte de `fase-2-mockup`; los PR de las Fases 1 y 2 siguen abiertos, por eso el PR de
esta fase apunta a `fase-2-mockup`). Modelo de la sesión: **Claude Opus 5.5**, como recomienda el plan para la Fase 3.

Estado real: **mock navegable y probado en un navegador real; nada conectado, nada desplegado, ningún gasto, ningún dato
real.** El contrato v1 y `handyx-client-be` no cambiaron.

## Lote 3.1 · Sistema visual y navegación

Referencia: la demo de la landing (`/demo/`, construida y capturada en local), comparada pantalla por pantalla con la app.

- **Tokens semánticos** sobre los de marca (`src/styles/tokens.css`): superficies, texto, acciones, estados, importes,
  tipografía, espaciado, elevación, íconos, movimiento y capas. Cero colores sueltos en el resto del CSS (lo vigila una prueba).
  Contrastes ajustados: pastilla "ok" (3,5 → 6,5:1) y etiquetas inactivas de la barra (4,2 → 5,0:1).
- **Navegación**: `Encabezado` con botón de volver (destino fijo, nombre accesible) en las 17 pantallas internas, en
  lugar de los enlaces "← Volver…"; botón de avisos azul y táctil como en la demo; pestaña activa de la barra con fondo y
  punto amarillo, además del color.
- **Inicio**: un panel azul con **una** prioridad (trabajo en curso › propuestas › pedido buscando › próximo turno) y su
  acción; rubros; "¿Para cuándo?" con ícono, título y explicación por tipo de pedido.
- **Importes**: `Desglose` (precio del especialista + tarifa de Handy = total, cifras tabulares, total grande en azul) en
  la propuesta, la hoja de aceptar y el trabajo; la tabla comparativa empieza por el total.
- **Propuestas**: tarjeta con avatar de iniciales, verificaciones del backend, total, condiciones (horario y vigencia) en
  caja propia y alcance; en el chat se usa la misma tarjeta, **sin el doble borde**.
- **Decisión**: rechazar (contorno rojo, cruz, izquierda) y aceptar (azul lleno, check, derecha), las dos con hoja de
  confirmación; la de rechazar con Handy y botón rojo lleno. Contrapropuesta y chat, debajo.
- **Chat**: el compositor ya no queda tapado por la barra inferior (`--barra-alto` coincide con la barra real).
- **Pedir**: el rubro elegido muestra un tilde además del cambio de color.
- Guía: [`docs/diseno.md`](diseno.md). Capturas antes/después (390 px, datos ficticios): `docs/screens/lote-3-1/`.

### Comandos ejecutados (29/10/2026, local)

| Comando                                                        | Resultado                                                                    |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `npm run format:check` · `lint` (React Compiler) · `typecheck` | OK                                                                           |
| `npm test`                                                     | **66 pruebas OK** (7 archivos; nuevo `tests/diseno.test.ts` con 7 pruebas)   |
| `npm run mapa:check` · `contracts:check`                       | OK · contrato v1 idéntico al de `handyx-client-be`                           |
| `npm run build`                                                | 36 páginas estáticas                                                         |
| `node tests/e2e/recorrido.cjs`                                 | OK, sin errores de consola                                                   |
| `node tests/e2e/escenarios.cjs`                                | **18 de 18 escenarios OK**                                                   |
| Desborde horizontal en 21 rutas × 360/390/768/1280 px          | ninguno                                                                      |
| `npm audit`                                                    | 2 moderadas solo de desarrollo (`vitest` → `@vitest/mocker`), 0 altas; igual |

Las pruebas e2e cambiaron solo en los nombres de dos controles: el botón "Aceptar" y la fila "Tarifa de Handy" de la tabla.

### Decisiones de diseño (reversibles)

1. "Tarifa de Handy" reemplaza "Comisión de Handy" en la interfaz (mismo dato: `comisionHandy`, calculada con `usuarioBp`);
   el total para el usuario es precio + tarifa, sumado sin redondeos propios. Con 0 % el total es el precio.
2. Avatar con iniciales: el contrato no tiene fotos de perfil (y no se agregan sin decisión de Producto).
3. Volver con destino fijo, no `history.back()`: llegar desde un aviso o un enlace no rompe la vuelta.

## Próximo paso

Lote 3.2 (Opus 5.5 high) en `fase-3-diseno`: auditoría con teclado y lector de pantalla, axe automatizado, 768/820 px y
horizontal, texto del sistema al 200 %, objetivos táctiles y foco en hojas y formularios. Después 3.3: movimiento, PWA
(manifest, service worker, `/sin-conexion/`) y capturas de todas las pantallas y estados.

---

# Histórico · Fase 2 · Mockup completo

**Fase 2 · Mockup completo — lotes 2.1 a 2.5 listos.**
Fecha: 29/10/2026. Rama: `fase-2-mockup` (parte de `fase-1-bases`; el PR de la Fase 1 sigue abierto, por eso el PR de esta fase apunta a esa rama).
Modelo de la sesión: **Claude Sonnet 5.5**, como recomienda el plan para la Fase 2 (la Fase 1 se hizo con Opus 5.5).

Estado real: **mock navegable y probado en un navegador real; nada conectado a un backend ni a una base, nada desplegado,
ningún gasto, ningún dato real.** `handyx-client-be` no cambió en esta fase (el contrato v1 quedó igual).

## Qué se construyó

- **33 pantallas del mapa + modal**, todas con interfaz real (excepto `/sin-conexion/`, que es del lote 3.3): acceso (bienvenida, ingreso,
  registro con invitación, recuperación), perfil por pasos, inicio, pedido (7 pasos), pedidos, detalle del pedido, propuestas
  (tarjetas y tabla comparativa), detalle de propuesta, contrapropuesta, chats y conversación, trabajo, cambio de turno o
  condiciones, agenda, pago, retorno del checkout, reclamos (lista, nuevo, detalle), ayuda, avisos y 6 pantallas de cuenta.
- **Fee 0 % en los tres lugares pedidos**: aviso después del registro, modal de primer ingreso (registra la versión aceptada) y contador
  en Cuenta (hora del servidor). Siempre "hasta el 10/12", sin presentarlo como descuento ni anunciar una tarifa no aprobada.
- **Servidor simulado** (`src/data/mock/`): los 54 endpoints con las reglas de `docs/state-machines.md` (propiedad, versiones,
  idempotencia, vencimientos, ventanas de 20 min y 5 min, relanzar con límite, búsqueda manual, autoaceptación opt-in, carrera de
  aceptación, historial de acuerdos, pagos reportado ≠ verificado, gate de Mercado Pago, etapas, reclamos, baja con retención).
- **18 escenarios obligatorios** (`?escenario=<id>`) y un **panel de prueba** que hace de especialista, Operations, proveedor de pagos y reloj.
- Infraestructura de interfaz: `useConsulta` (carga, reintento, actualización periódica), `useEnvio` (clave de idempotencia estable entre
  reintentos), `SesionProvider` (sesión, reloj del servidor, avisos sin leer y **reingreso sin salir de la pantalla** cuando la sesión vence),
  componentes (`Campo`, `Hoja`, `Aviso`, estados con Handys, calendario propio, fotos privadas) y estilos de la landing.
- Documentación: `docs/qa.md` (nuevo), `docs/contrato-mock.md` (ampliado), `docs/plan.md` y esta página.

## Comandos ejecutados (29/10/2026, local)

| Comando                                                        | Resultado                                                                                                  |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `npm run format:check` · `lint` (React Compiler) · `typecheck` | OK                                                                                                         |
| `npm test`                                                     | **59 pruebas OK** (6 archivos): reglas del servidor simulado, datos, dominio, mapa, seguridad, entorno     |
| `npm run mapa:check` · `contracts:check`                       | OK · contrato v1 idéntico al de `handyx-client-be`                                                         |
| `npm run build`                                                | 36 páginas estáticas                                                                                       |
| `node tests/e2e/recorrido.cjs` (Chromium 390 px)               | OK: registro → perfil → pedido → propuesta → trabajo → pago reportado → verificado; sin errores de consola |
| `node tests/e2e/escenarios.cjs`                                | **18 de 18 escenarios OK**, sin errores de consola                                                         |
| Desborde horizontal en 20 rutas × 360/390/768/1280 px          | ninguno                                                                                                    |
| `npm audit`                                                    | ver el PR                                                                                                  |

Los scripts de `tests/e2e/` requieren Playwright y no corren en CI (ver `docs/qa.md`).

## Decisiones técnicas (reversibles)

1. **Mundo en memoria, sin persistencia**: recargar vuelve al punto de partida del escenario (`?escenario=`). Es a propósito: `localStorage` está prohibido.
2. **Reloj del mock en tiempo real** desde el martes 17/11/2026 12:00 BA, adelantable desde el panel. Los contadores usan la hora del servidor.
3. **Sesión vencida = hoja de reingreso** sobre la misma pantalla (no redirección): no se pierde lo tipeado ni se simula la acción.
4. **Ruta de pedido/propuesta/trabajo por query** (`?id=`), nunca `[id]` (export estático).
5. **`useSearchParams` + `Suspense`** en el marco de las pantallas; el token de recuperación va en el fragmento `#t=`.
6. **Push**: solo el estado del permiso y la preferencia (en la vista de prueba se simula el registro del dispositivo). Con API real responde `funcion_inactiva` hasta la Fase 3/4.
7. El rótulo "Vista de prueba" y el panel no existen cuando hay `NEXT_PUBLIC_API_BASE_URL`.

## Preguntas de contrato para la Fase 4

Están en `docs/contrato-mock.md` (sección final): `propuestas` con todos los tipos, semántica de `pagoReportar` con Mercado Pago,
versión de etapa vs. trabajo, contrapropuesta solo en cotizaciones, `sesion_vencida` persistente, texto de avisos del lado del cliente
y edad mínima. Ninguna cambia el contrato v1; si el servidor real decide otra cosa, se ajusta el mock y el contrato juntos.

## Bloqueos y pendientes (ninguno frena la Fase 3)

| Tema                                                      | Qué falta                                             | Bloquea                                         |
| --------------------------------------------------------- | ----------------------------------------------------- | ----------------------------------------------- |
| Fin exacto del fee 0 %                                    | ¿incluye el 10/12? (se asume hasta 10/12 00:00 BA)    | texto y contador (parametrizado en el servidor) |
| Textos legales y de privacidad                            | aviso definitivo de Legal (hoy provisorio y rotulado) | producción                                      |
| Proveedor de email transaccional                          | autorización/contratación                             | recuperación y verificación reales (4.2)        |
| Ruta de Mercado Pago aprobada                             | checkout del especialista / enlace / manual           | checkout productivo (4.5)                       |
| Base Neon de la app, Render, Hostinger, subdominio        | accesos y autorización                                | 4.1 remoto y Fase 5                             |
| Opciones de género, edad mínima                           | Legal/Producto                                        | perfil de producción                            |
| Reseñas y contactos guardados                             | decisión de producto (están en la demo de la landing) | fuera del contrato v1                           |
| CSP con Next export                                       | hashes por build o cabecera                           | Fase 5                                          |
| Notion (TECH-03 y tickets)                                | no se consultó en esta sesión                         | conciliar el modelo en 4.1                      |
| Accesibilidad medida, dispositivos reales, service worker | trabajo de la Fase 3                                  | lotes 3.2 y 3.3                                 |

## Próximo paso (al cerrar la Fase 2)

Fase 3 · lote 3.1 — hecho, ver arriba.

---

# Histórico · Fase 1 · Bases

**Fase actual: 1 · Bases — lotes 1.1, 1.2 y 1.3 listos.** Próxima: Fase 2 · lote 2.1.
Fecha: 29/10/2026. Ramas: `fase-1-bases` en `handyx-client-fe` y `handyx-client-be` → PR a `main`.
Modelo: la sesión empezó en Claude Sonnet 5.5 (plan y auditoría) e Ignacio la cambió a **Claude Opus 5.5** para los lotes
1.1–1.3, como recomienda el plan.

Estado real: **decidido + mock base + probado en local.** Nada conectado a una base, nada desplegado, ningún gasto,
ningún dato real. Notion no se consultó en esta sesión (limitación registrada; se usaron las decisiones del prompt).

## Cambios

`handyx-client-fe`

- Next.js 16.4.3 + React 19.3 + TS estricto, `output: 'export'`, `trailingSlash`, guarda de entorno en el build
  (producción sin API = falla). ESLint (Next) + Prettier + Vitest.
- Marca de la landing: tokens, Archivo/DM Sans empaquetadas, logo Handyx, Handys, íconos, botón táctil, marcador
  amarillo, barra azul inferior, rótulo "Vista de prueba".
- **Mapa funcional** (`src/mapa/pantallas.ts`): 33 pantallas + 1 modal, con acciones, estados, endpoints, entidades,
  pruebas y referencia a la demo de la landing; 18 escenarios obligatorios (`escenarios.ts`). Una página por ruta
  (planificada y rotulada, sin datos inventados) y `/mapa/` navegable solo en la vista de prueba.
- **Datos**: `ClienteApi` con adaptador HTTP (cookie, CSRF en memoria, Idempotency-Key, validación de ida y vuelta,
  errores normalizados) y mock (fixtures validados, latencia y fallas configurables).
- Dominio: fechas en Buenos Aires (de la landing), pesos en centavos, resumen y contador del fee 0 %.
- Docs: `plan.md`, `inventario.md`, `adr/ADR-0001`, `screens/mapa-inicial.md`, `screens/matriz.md` (generada),
  `contrato-mock.md`. CI de GitHub Actions.

`handyx-client-be`: base Express, contrato v1 (54 endpoints) + OpenAPI generado, ADR de dueño del esquema y de auth,
modelo de datos con ERD, máquinas de estado, permisos. Ver `handyx-client-be/docs/handoff.md`.

## Comandos ejecutados (29/10/2026, local)

| Comando                                                                                                    | Resultado                                                                                                         |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `npm ci` (lockfile generado con npm 11 por un bug de peers de npm 10.9; `npm ci` con npm 10.9 OK)          | OK                                                                                                                |
| `npm run format:check` · `lint` · `typecheck`                                                              | OK                                                                                                                |
| `npm test`                                                                                                 | 35 pruebas OK (5 archivos), incluida la sincronía byte a byte del contrato con el BE                              |
| `npm run mapa:check` · `contracts:check`                                                                   | OK · "Contrato v1 sincronizado (9 archivos)"                                                                      |
| `npm run build`                                                                                            | 36 páginas estáticas en `out/`                                                                                    |
| `NEXT_PUBLIC_ENTORNO=produccion npm run build` sin API                                                     | falla con `EntornoInvalido` (esperado)                                                                            |
| `npm run preview` + curl `/`, `/cuenta/`, `/no-existe/`                                                    | 200 · 200 · 404 propio                                                                                            |
| Chromium (Playwright) a 390 y 1280 px: `/`, `/mapa/`, `/inicio/`, `/cuenta/`, 404; navegación por la barra | sin desborde horizontal, sin errores de consola (salvo el 404 esperado), `aria-current` correcto                  |
| Integración real: adaptador HTTP del front (`crearClienteHttp`) contra `handyx-client-be` local            | `GET /v1/version` validada contra el contrato; `GET /v1/pedidos` → `ErrorCliente` `no_encontrado` con `requestId` |
| `npm audit`                                                                                                | 2 moderadas solo de desarrollo (`vitest` → `@vitest/mocker`); 0 altas                                             |

## Bloqueos y pendientes (ninguno frena la Fase 2)

| Tema                                                         | Qué falta                                         | Bloquea                                  |
| ------------------------------------------------------------ | ------------------------------------------------- | ---------------------------------------- |
| Fin exacto del fee 0 %                                       | ¿incluye el 10/12? Supuesto: hasta 10/12 00:00 BA | texto y contador (parametrizado)         |
| Proveedor de email transaccional                             | autorización/contratación                         | recuperación y verificación reales (4.2) |
| Ruta de Mercado Pago aprobada                                | checkout del especialista / enlace / manual       | checkout productivo (4.5)                |
| Base Neon de la app, Render, Hostinger, subdominio de la app | accesos y autorización                            | 4.1 remoto y Fase 5                      |
| Opciones de género, edad mínima, avisos legales de la app    | Legal/Producto                                    | textos de producción                     |
| Reseñas y contactos guardados                                | decisión de producto                              | fuera del contrato v1                    |
| CSP con Next export                                          | hashes por build o cabecera                       | Fase 5                                   |
| Notion (TECH-03 y tickets)                                   | acceso en la sesión                               | conciliar el modelo en 4.1               |

## Contratos

`src/contracts/v1` (copia de `handyx-client-be`, `VERSION_CONTRATO = 1.0.0-draft.1`) · OpenAPI:
`handyx-client-be/docs/api/openapi.json` · matriz: `docs/screens/matriz.md`.

## Próximo paso

Fase 2 · lote 2.1 (recomendado Sonnet 5.5 high), rama `fase-2-mockup` desde `main` ya con la Fase 1: registro con
invitación, login/recuperación, aviso post-registro, perfil por pasos, modal de primer ingreso, Cuenta con contador,
privacidad, baja y sesión vencida, todo contra el adaptador mock.
