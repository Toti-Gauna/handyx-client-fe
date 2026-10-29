# Handoff · Bloque 3 · App de usuario de Handyx

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
