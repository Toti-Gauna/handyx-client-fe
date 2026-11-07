# Inventario y auditoría (Fase 1 · lote 1.1)

Fecha: 29/10/2026. Fuente: lectura de los repos clonados en esta sesión. Notion **no** se consultó (no se usó el
conector en esta sesión); los tickets citados (TECH-03, TECH-20, PROD-03/15/18/23/26, LEG-39/40) se toman de las
decisiones explícitas del prompt del bloque.

## Repos

| Repo                           | Rama / commit al empezar         | Qué hay                                                                                                                                          | Uso en este bloque                                                       |
| ------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `handyx-client-fe`             | `main` · `9f3aa58` (solo README) | vacío                                                                                                                                            | **este repo**: PWA de usuario                                            |
| `handyx-client-be`             | `main` · `e0a40da` (solo README) | vacío                                                                                                                                            | API de usuario, **dueña del esquema**                                    |
| `handyx-specialist-fe` / `-be` | `main`, solo README              | vacíos                                                                                                                                           | contraparte (otro bloque); consume el contrato                           |
| `Handy-landing-page-fe`        | `main` (clon de lectura)         | Vite + TS sin framework, landing + **demo de la app** (`/demo/`, ~40 pantallas de usuario y especialista con datos mock), tokens, Handys, íconos | **fuente de diseño**                                                     |
| `Handy-landing-page-be`        | `main` · `bacee8b`               | Express 5 + Prisma 7 + PostgreSQL: captura de preregistros, CRM, auth del equipo por ENV; 281 + 64 pruebas                                       | patrones de backend (logger, errores, entorno, CORS, auth)               |
| `handy-internal-portal`        | `main` · `5ab1895`               | Vite + TS: portal del equipo contra `landing-be`                                                                                                 | patrones de front (cliente de sesión, CSRF en memoria, fuente demo/HTTP) |

## Qué se reutilizó

| De               | Qué                                                                                    | Dónde                                                               |
| ---------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| landing          | tokens de marca (colores, radios, fuentes)                                             | `src/styles/tokens.css`                                             |
| landing          | Handys (incluidos los "rotos" para errores), logo Handyx, íconos de la app             | `public/img/`, `public/icono-app-*.png`, `src/components/trazos.ts` |
| landing          | botón táctil, marcador amarillo, mosaicos, tarjeta con franja, barra azul inferior     | `src/styles/app.css`                                                |
| landing          | fechas en Buenos Aires (calendario, formatos)                                          | `src/domain/fechas.ts`                                              |
| landing          | estados de propuesta `pendiente/aceptada/rechazada/reemplazada`                        | contrato v1 (+ `vencida`, `retirada`)                               |
| landing `/demo/` | inventario de pantallas de usuario como referencia visual                              | columna `demo` del mapa                                             |
| landing-be       | logger con lista blanca, request id, entorno validado, CORS exacto, apagado            | `handyx-client-be`                                                  |
| portal           | patrón fuente demo/HTTP, CSRF en memoria, guardia de almacenamiento, rótulo de muestra | `src/data`, `tests/seguridad.test.ts`                               |

## Qué de la demo de la landing NO se toma como regla

La demo es referencia visual "no código de producción". Donde contradice las decisiones del bloque, mandan estas:

| Demo de la landing                                       | Bloque 3                                                                 |
| -------------------------------------------------------- | ------------------------------------------------------------------------ |
| Tarifa cliente 5 % y especialista 10 % (`tarifas.json`)  | fee de Handy **0 %** durante la demo (10/11–10/12)                       |
| "Handy retiene solo su tarifa" / cobro vía Handy         | pago **directo** al especialista (MP o efectivo); Handy no recibe fondos |
| Llegada por geocerca simulada, "sin confirmación manual" | "Llegué" lo marca el especialista; sin seguimiento en segundo plano      |
| "Agregar tarjeta" con tarjeta de prueba                  | fuera: Handy no recolecta tarjetas                                       |
| HandIA                                                   | incluida: sugiere el rubro; sin datos personales, fotos ni documentos    |
| Reseña (`u-resena`) y contactos guardados                | sin decisión de producto: fuera del contrato v1 (pendiente)              |

## Recursos activos

Ninguno creado. No hay dominio de la app, Hostinger, Render ni Neon configurados para este bloque en lo visible desde
los repos; `handyc.com` está adquirido (prompt). Nada se compró ni se creó.
