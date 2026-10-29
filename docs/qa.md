# QA · App de usuario

Estado: **Fase 2 (mockup completo)**. Todo corre con el adaptador mock y datos ficticios; nada contra un backend real ni desplegado.

## Automatizadas (corren en CI)

| Qué                            | Comando                                                       | Cubre                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------ | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reglas del "servidor" simulado | `npm test` (`tests/servidor-mock.test.ts`)                    | Alta solo con invitación; perfil incompleto no pide; propiedad (ajeno = 404); idempotencia (doble tap no duplica pedido ni trabajo); versiones (409); ventanas de 20 min y 5 min; relanzar con límite y búsqueda manual; autoaceptación solo si se eligió; contrapropuesta y cambio de acuerdo con historial; carrera de aceptación; vencida; pagos reportado ≠ verificado y gate de Mercado Pago; etapas de obra; reclamos; fotos limitadas; sesión vencida persistente; baja con retención |
| Contrato y mapa                | `npm test`, `mapa:check`, `contracts:check`                   | Cada endpoint tiene pantalla; 18 escenarios con mundo y entrada; copia byte a byte del contrato                                                                                                                                                                                                                                                                                                                                                                                              |
| Datos                          | `npm test` (`src/data/datos.test.ts`)                         | Adaptador HTTP (CSRF, idempotencia, errores normalizados) y mock                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Seguridad del front            | `npm test` (`tests/seguridad.test.ts`)                        | Sin `localStorage`/`sessionStorage`/cookies; sin `fetch` ni fixtures en pantallas; variables públicas                                                                                                                                                                                                                                                                                                                                                                                        |
| Dominio                        | `npm test` (`src/domain/*.test.ts`)                           | Pesos en centavos, fechas de Buenos Aires, fee 0 % y contador                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Estático                       | `format:check`, `lint` (React Compiler), `typecheck`, `build` | 36 páginas exportadas; un build de producción sin API falla                                                                                                                                                                                                                                                                                                                                                                                                                                  |

## Manuales en navegador real (no corren en CI)

Requieren Playwright y `npm run build && npm run preview`. `npm run e2e` los corre en orden; guardan capturas en `capturas-e2e/` (ignorada por Git).

| Script                     | Qué recorre                                                                                                                                                                                                                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/e2e/recorrido.cjs`  | Registro con invitación → aviso del fee 0 % → perfil por pasos → modal de primer ingreso → pedido urgente → propuestas → aceptar con confirmación → trabajo (la contraparte lo avanza desde el panel) → confirmar fin → pago en efectivo reportado → verificado por la contraparte |
| `tests/e2e/escenarios.cjs` | Los 18 escenarios obligatorios, uno por uno, con aserciones sobre el comportamiento                                                                                                                                                                                                |

## Resultados (29/10/2026, Chromium 390 px, local)

- Recorrido completo: OK, sin errores de consola.
- 18 de 18 escenarios: OK, sin errores de consola (salvo respuestas 4xx simuladas a propósito).
- Desborde horizontal: ninguno en 20 rutas × 360/390/768/1280 px.

## Qué NO se probó todavía

- Dispositivos reales (iOS/Android), teclado y lector de pantalla, contraste medido: Fase 3 (lote 3.2).
- Service worker, instalación y modo sin conexión: Fase 3 (lote 3.3).
- Cualquier cosa contra `handyx-client-be` con base de datos, la app de especialista y Mercado Pago real: Fases 4 y 5.
