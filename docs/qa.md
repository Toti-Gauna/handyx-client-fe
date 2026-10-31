# QA · App de usuario

Estado: **Fase 3 completa (lotes 3.1–3.3)**. Todo corre con el adaptador mock y datos ficticios; nada contra un backend real ni desplegado.

## Automatizadas (corren en CI)

| Qué                               | Comando                                                       | Cubre                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Reglas del "servidor" simulado    | `npm test` (`tests/servidor-mock.test.ts`)                    | Alta solo con invitación; perfil incompleto no pide; propiedad (ajeno = 404); idempotencia (doble tap no duplica pedido ni trabajo); versiones (409); ventanas de 20 min y 5 min; relanzar con límite y búsqueda manual; autoaceptación solo si se eligió; contrapropuesta y cambio de acuerdo con historial; carrera de aceptación; vencida; pagos reportado ≠ verificado y gate de Mercado Pago; etapas de obra; reclamos; fotos limitadas; sesión vencida persistente; baja con retención |
| Contrato y mapa                   | `npm test`, `mapa:check`, `contracts:check`                   | Cada endpoint tiene pantalla; 18 escenarios con mundo y entrada; copia byte a byte del contrato                                                                                                                                                                                                                                                                                                                                                                                              |
| Datos                             | `npm test` (`src/data/datos.test.ts`)                         | Adaptador HTTP (CSRF, idempotencia, errores normalizados) y mock                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Seguridad del front               | `npm test` (`tests/seguridad.test.ts`)                        | Sin `localStorage`/`sessionStorage`/cookies; sin `fetch` ni fixtures en pantallas; variables públicas                                                                                                                                                                                                                                                                                                                                                                                        |
| Diseño y accesibilidad (estático) | `npm test` (`tests/diseno.test.ts`)                           | Colores solo de tokens; sin rankings ni verificaciones inventadas; aceptar/rechazar distinguibles y con confirmación; saltar al contenido; foco al navegar, en hojas y en errores; pastillas con "Estado:"; objetivos de 44 px; calendario con el número del día en su nombre                                                                                                                                                                                                                |
| Dominio                           | `npm test` (`src/domain/*.test.ts`)                           | Pesos en centavos, fechas de Buenos Aires, fee 0 % y contador                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Estático                          | `format:check`, `lint` (React Compiler), `typecheck`, `build` | 36 páginas exportadas; un build de producción sin API falla                                                                                                                                                                                                                                                                                                                                                                                                                                  |

## Manuales en navegador real (no corren en CI)

Requieren Playwright y `npm run build && npm run preview`. `npm run e2e` los corre en orden; guardan capturas en `capturas-e2e/` (ignorada por Git).

| Script                        | Qué recorre                                                                                                                                                                                                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/e2e/recorrido.cjs`     | Registro con invitación → aviso del fee 0 % → perfil por pasos → modal de primer ingreso → pedido urgente → propuestas → aceptar con confirmación → trabajo (la contraparte lo avanza desde el panel) → confirmar fin → pago en efectivo reportado → verificado por la contraparte |
| `tests/e2e/escenarios.cjs`    | Los 18 escenarios obligatorios, uno por uno, con aserciones sobre el comportamiento                                                                                                                                                                                                |
| `tests/e2e/accesibilidad.cjs` | 32 rutas + 5 hojas abiertas × 360, 390, 820, 1280 px y horizontal (844×390): axe-core 4.14 (WCAG 2.0/2.1/2.2 A y AA + buenas prácticas), objetivos táctiles ≥ 44 px, un h1 por pantalla, desborde horizontal; además texto al 200 % en 18 pantallas                                |
| `tests/e2e/teclado.cjs`       | Solo teclado: saltar al contenido, foco en el primer campo con error, ingreso, foco en el h1 al navegar, título de la pestaña, foco visible en la barra, hoja que abre en su título (un Enter no acepta), Escape devuelve el foco, el foco no sale de la hoja, movimiento reducido |

Otros recorridos (también en `npm run e2e`) y herramientas del rediseño:

| Script                   | Qué recorre                                                                                                                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `tests/e2e/pwa.cjs`      | Instalable, caché sin datos, sin conexión sin éxitos ficticios, pantalla de carga                                                                                                                                                                 |
| `tests/e2e/handia.cjs`   | HandIA: rubro sugerido, datos personales tachados antes de enviar, sin fotos                                                                                                                                                                      |
| `tests/e2e/mapa.cjs`     | Mapa con el extracto de prueba: elegir con el pin, sin terceros, respaldo ilustrado                                                                                                                                                               |
| `tests/e2e/pulido.cjs`   | Lote 3.9: transición tarjeta → detalle, hoja azul de tres alturas (toque, arrastre, flechas), hoja que se cierra deslizando, título que se compacta, versión nueva sin recarga sola, 404 y sin conexión, sin transiciones con movimiento reducido |
| `tests/e2e/capturas.cjs` | Catálogo de capturas (`npm run capturas`); falla si alguna pantalla del mapa (`src/mapa/pantallas.ts`) queda sin captura                                                                                                                          |
| `tests/e2e/comparar.cjs` | Comparación lado a lado con la demo de la landing (`npm run comparar`, necesita la demo construida en `LANDING_DIST`)                                                                                                                             |

## Resultados (29/10/2026, Chromium 390 px, local)

- Recorrido completo: OK, sin errores de consola.
- 18 de 18 escenarios: OK, sin errores de consola (salvo respuestas 4xx simuladas a propósito).
- Desborde horizontal: ninguno en 20 rutas × 360/390/768/1280 px.
- Lote 3.2: accesibilidad **203 de 203 chequeos OK** (la primera corrida dio 181 con fallas: objetivos chicos, calendario y
  desplegables, orden de títulos, desbordes con texto al 200 %); teclado **13 de 13 OK**; recorrido y 18 escenarios OK.
- Lote 3.3: PWA **22 de 22 comprobaciones OK** (instalable, caché sin datos, sin conexión sin éxitos ficticios); catálogo de
  66 capturas + 18 escenarios revisado a ojo (se corrigieron capturas tomadas durante la carga, cortes con guion en títulos
  y el texto "comisión" que quedaba en Pago).

- Lote 3.9 (30/10): accesibilidad **299 de 299** (rutas y hojas nuevas: detalle del reclamo, vuelta del pago, hoja azul
  achicada, versión nueva); la auditoría espera a que terminen transiciones y animaciones antes de medir colores. Pulido
  OK (transiciones, gestos, título que se compacta, versión nueva, 404, sin conexión, movimiento reducido); PWA OK;
  catálogo de 99 capturas con las 40 pantallas del mapa; 20 comparaciones con la demo revisadas a ojo.

## Qué NO se probó todavía

- Dispositivos reales (iOS/Android) y lectores de pantalla reales (VoiceOver, TalkBack): sin acceso en esta sesión; se revisó
  el árbol de accesibilidad de Chromium. Queda para la prueba en dos celulares (Fase 5 · lote 5.2).
- Zoom de texto real de iOS/Android (se aproximó con `font-size: 200%` en la raíz).
- Instalación y modo sin conexión en celulares reales (Chrome Android, Safari iOS): lote 5.2.
- Cualquier cosa contra `handyx-client-be` con base de datos, la app de especialista y Mercado Pago real: Fases 4 y 5.
