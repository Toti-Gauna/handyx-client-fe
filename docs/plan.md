# Plan · Bloque 3 · App de usuario de Handyx

Cinco fases, ejecutadas por lotes en orden. Una rama por fase (`fase-N-…`) con PR a `main` en `handyx-client-fe` y
`handyx-client-be`. El modelo/esfuerzo es una **recomendación**: se elige en Claude Code; escribirlo acá no lo cambia.

Leyenda de estado: **decidido** (acordado/documentado) · **mock** (navegable con datos ficticios) · **conectado**
(contra el backend real) · **probado** (pruebas ejecutadas con resultado) · **desplegado** (publicado y verificado).

| Fase                   | Lote | Objetivo                                                           | Modelo · esfuerzo | Estado                                   |
| ---------------------- | ---- | ------------------------------------------------------------------ | ----------------- | ---------------------------------------- |
| 1 · Bases              | 1.1  | Auditoría y base ejecutable (Next export + Express)                | Opus 5.5 · high   | ✅ listo · probado (local)               |
|                        | 1.2  | Alcance, pantallas y registro                                      | Opus 5.5 · high   | ✅ listo · decidido                      |
|                        | 1.3  | Contrato común de integración                                      | Opus 5.5 · high   | ✅ listo · decidido + probado (esquemas) |
| 2 · Mockup completo    | 2.1  | Acceso, perfil, cuenta, fee 0 % (3 avisos), baja, sesión vencida   | Sonnet 5.5 · high | ✅ listo · mock probado en navegador     |
|                        | 2.2  | Inicio, pedido, ubicación, agenda, búsqueda sin ETA                | Sonnet 5.5 · high | ✅ listo · mock probado en navegador     |
|                        | 2.3  | Propuestas, contrapropuestas, aceptación explícita, vencimientos   | Sonnet 5.5 · high | ✅ listo · mock probado en navegador     |
|                        | 2.4  | Chat/fotos, trabajo, "Llegué", etapas, reclamos, historial         | Sonnet 5.5 · high | ✅ listo · mock probado en navegador     |
|                        | 2.5  | Pagos directos, avisos y los 18 escenarios                         | Sonnet 5.5 · high | ✅ listo · mock probado en navegador     |
| 3 · Rediseño premium   | 3.1  | Dirección de arte, sistema y 3 pantallas modelo (aprobación)       | Opus 5.5 · high   | ✅ listo · mock probado en navegador     |
|                        | 3.2  | Splash animado, acceso y onboarding                                | Opus 5.5 · high   | ✅ listo · mock probado en navegador     |
|                        | 3.3  | Mapa (MapLibre + PMTiles de MDP, dirección, búsqueda, seguimiento) | Opus 5.5 · high   | ✅ listo · datos reales pendientes       |
|                        | 3.4  | Inicio y pedir                                                     | Opus 5.5 · high   | ✅ listo · mock probado en navegador     |
|                        | 3.5  | Propuestas y decisión                                              | Opus 5.5 · high   | ✅ listo · mock probado en navegador     |
|                        | 3.6  | Trabajo en curso, pago, reseña y reclamo                           | Opus 5.5 · high   | propuesto                                |
|                        | 3.7  | Actividad, mensajes y soporte                                      | Opus 5.5 · high   | propuesto                                |
|                        | 3.8  | Cuenta y ayuda                                                     | Opus 5.5 · high   | propuesto                                |
|                        | 3.9  | Pulido premium y QA (transiciones, gestos, capturas)               | Opus 5.5 · high   | propuesto                                |
| 4 · BE y DB conectados | 4.1  | Esquema compartido y migraciones (base aislada)                    | Opus 5.5 · high   | pendiente                                |
|                        | 4.2  | Auth, cuenta y privacidad reales                                   | Opus 5.5 · high   | pendiente                                |
|                        | 4.3  | Pedidos y propuestas reales (concurrencia, idempotencia)           | Opus 5.5 · high   | pendiente                                |
|                        | 4.4  | Chat, agenda, trabajos y reclamos reales                           | Opus 5.5 · high   | pendiente                                |
|                        | 4.5  | Pago directo, fee y métricas (o gate concreto)                     | Opus 5.5 · high   | pendiente                                |
|                        | 4.6  | Integración con Especialista y regresión                           | Opus 5.5 · high   | pendiente                                |
| 5 · Deploy             | 5.1  | Readiness, CI y deploy de prueba                                   | Sonnet 5.5 · high | pendiente                                |
|                        | 5.2  | Testing integrado en dos celulares                                 | Sonnet 5.5 · high | pendiente                                |
|                        | 5.3  | Deploy web final y rollback                                        | Sonnet 5.5 · high | pendiente                                |
|                        | 5.4  | Mapa final (PROD-26) y Handy Docs                                  | Sonnet 5.5 · high | pendiente                                |

## Rediseño de la Fase 3 (29/10)

Ignacio pidió rehacer el diseño: la versión de los lotes 3.1–3.3 originales quedó lejos de la demo de la landing, con
cabecera fija y pantallas faltantes. Plan nuevo, con mapa de pantallas: [`docs/rediseno.md`](rediseno.md). Se conserva
la infraestructura de esos lotes (tokens semánticos, accesibilidad, PWA, service worker, pruebas, catálogo de capturas);
la tabla de abajo es el registro de lo que se hizo entonces.

## Comprobaciones de cierre de la Fase 3 (versión anterior al rediseño)

| Lote | Comprobación                                                                                                                        | Evidencia                                                                                                                                                                                                                            |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 3.1  | Acciones de aceptar/rechazar se distinguen y no se inventan claims de verificación                                                  | rechazar (contorno rojo, cruz, izquierda) / aceptar (azul lleno, check, derecha), ambas con hoja de confirmación; verificaciones solo de `especialista.verificaciones`; `tests/diseno.test.ts`; capturas en `docs/screens/lote-3-1/` |
| 3.2  | Responsive 360/390, 768/820 y escritorio sin desborde; foco, labels, contraste y objetivos táctiles                                 | `tests/e2e/accesibilidad.cjs`: 203/203 chequeos (axe WCAG 2.2 AA, ≥ 44 px, un h1, desborde, texto 200 %) en 37 pantallas/estados × 5 tamaños; `tests/e2e/teclado.cjs` 13/13; capturas en `docs/screens/lote-3-2/`                    |
| 3.3  | Movimiento funcional y reducible; PWA instalable; sin conexión nunca registra un éxito ficticio; capturas de cada pantalla y estado | `tests/e2e/pwa.cjs` 22/22 (instalable según Chromium, caché sin API/ids, aceptar y mensaje sin conexión fallan a la vista); `tests/pwa.test.ts`; catálogo en `docs/screens/capturas/` (66 + 18 escenarios)                           |

Guía del sistema visual: [`docs/diseno.md`](diseno.md).

## Comprobaciones de cierre de la Fase 2

| Lote | Comprobación                                                                        | Evidencia                                                                                                                                                                      |
| ---- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 2.1  | Datos y estados de cuenta se pueden probar sin backend y sin datos reales           | cuenta, perfil por pasos, modal y contador del fee 0 %, privacidad, baja real y sesión vencida contra el mock; escenarios `nuevo-usuario`, `sesion-vencida`, `baja-solicitada` |
| 2.2  | Ubicación denegada y falta de oferta son recuperables; no hay ETA ficticia          | escenarios `ubicacion-denegada`, `otra-ciudad`, `sin-especialistas`, `urgencia-sin-respuesta`, `programado`; el test busca "ETA" y "en N minutos"                              |
| 2.3  | No hay acuerdo hasta aceptar las mismas condiciones; expiración y rechazo funcionan | escenarios `varias-propuestas`, `contrapropuesta`, `aceptacion-duplicada`, `propuesta-vencida`                                                                                 |
| 2.4  | Texto/foto fallidos, cancelación y reclamo tienen estados y acciones coherentes     | escenarios `chat-fallido`, `cancelacion`, `obra-por-etapas`, `reclamo`                                                                                                         |
| 2.5  | Volver de checkout no confirma pago; fee cero no significa trabajo gratis           | escenarios `efectivo-reportado`, `mp-pendiente-fallido`; texto explícito en la pantalla de pago                                                                                |

Detalle de las pruebas ejecutadas: [`docs/qa.md`](qa.md).

## Comprobaciones de cierre de la Fase 1

| Lote | Comprobación                                                                                | Evidencia                                                                                                                                                                    |
| ---- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.1  | La app arranca con scripts reproducibles sin sobrescribir cambios del usuario               | repos vacíos (solo README, conservado); `npm ci`, `build` (36 páginas estáticas), `preview`, `test` OK en FE y BE; capturas 390/1280 px sin errores ni desborde              |
| 1.2  | No se añaden documentos de especialista al usuario ni se convierten preregistros en cuentas | perfil sin DNI/CUIT (prueba `mapa.test.ts`), contrato `RegistroEntrada` exige invitación y no acepta campos extra; preregistros fuera (ADR-0001 BE)                          |
| 1.3  | Las dos apps comparten identidad/pedido/propuesta sin tablas o reglas duplicadas            | ADR-0001 (dueño único + escrituras por dominio), contrato v1 único copiado byte a byte (prueba de sincronía), propuestas bidireccionales (`autorRol`), un acuerdo por pedido |

## Decisiones vigentes

Las del prompt del bloque (Handyx/handyc.com, MDP, demo 10/11–10/12, fee 0 %, pago directo, propuestas bidireccionales,
sin asignación obligatoria, sin ETA, urgencias 20/5 min, programados 12 h, antecedentes sin archivos, baja
real, tiendas después del 10/12) más:

- Front: **Next.js 16 export estático** (Ignacio, 29/10).
- Dueño del esquema: **handyx-client-be** (Ignacio, 29/10).
- Fee 0 % avisado **después del registro, en el modal de primer ingreso y con contador en Cuenta**, "hasta el 10/12"
  (Ignacio, 29/10).
- Ramas: una por fase, PR a `main` (Ignacio, 29/10).
- **HandIA incluida** (Ignacio, 29/10): asistente que sugiere el rubro y arma el pedido; sin datos personales (se tachan
  antes de enviar) ni fotos o documentos a la IA; la persona confirma todo.
