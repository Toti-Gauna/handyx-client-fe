# Instrucciones · handyx-client-fe (PWA de usuario de Handyx)

Retomar siempre desde [`docs/handoff.md`](docs/handoff.md). Plan del bloque: [`docs/plan.md`](docs/plan.md).

## Stack

Next.js 16 (App Router) con **export estático** (`output: 'export'`, `trailingSlash: true`) para Hostinger, React 19,
TypeScript estricto, Zod 4, Vitest. CSS propio con los tokens de la landing (`src/styles/tokens.css`), fuentes empaquetadas
con `@fontsource-variable` (Archivo + DM Sans), íconos y Handys copiados de `Handy-landing-page-fe`.
**Sin SSR, middleware, server actions, route handlers ni `next/image` optimizado** (ver
[ADR-0001](docs/adr/ADR-0001-nextjs-export-estatico.md)). Las pantallas con id usan query (`/pedidos/detalle/?id=`), nunca
segmentos dinámicos `[id]`.

## Reglas

- **Diseño**: el kit visual es el de la demo de la landing, copiado con `npm run kit` a `src/styles/kit/` (no editar
  esos archivos; lo propio va en `kit/ajustes.css`). Las pantallas rediseñadas usan los componentes de
  `src/components/hx.tsx` y el markup `.hd-*`/`.du-*` de la demo; guía en `docs/diseno.md`, plan en `docs/rediseno.md`.
  No inventar otra marca.
  Español rioplatense con voseo, pesos `$ 45.000`, "verificado" solo con dato real, sin "matriculado", sin prometer
  inmediatez ni ETA en la búsqueda ni en las propuestas. Única excepción (decisión de Ignacio del 31/10, contrato
  `1.0.0-draft.2`): el viaje en vivo del especialista en camino muestra posición, trayecto y la llegada estimada **que
  calcula el servidor**, solo mientras se comparte; nunca una estimación propia del front.
- **Datos**: la vista de prueba es un servidor simulado completo (`src/data/mock/`, 54 endpoints, 18 escenarios): una regla de negocio nueva va primero en `docs/state-machines.md` y en `tests/servidor-mock.test.ts`. Las pantallas solo usan `cliente` de `src/data` (interfaz `ClienteApi`). Nunca `fetch` directo ni fixtures
  importados. Con `NEXT_PUBLIC_API_BASE_URL` el cliente es HTTP y **nunca** cae a mocks; sin ella es la vista de prueba
  rotulada. Un build de producción sin API falla.
- **Contrato**: `src/contracts/v1/` es copia byte a byte de `handyx-client-be` (dueño). No se edita acá:
  `npm run contracts:sync` / `contracts:check`.
- **Mapa**: `src/mapa/pantallas.ts` es la fuente de rutas, estados, API y pruebas; `npm run mapa` regenera
  `docs/screens/matriz.md`. Pantalla nueva = entrada en el mapa + página.
- **React Compiler (lint)**: sin `setState` sincrónico en efectos, sin escribir refs en el render y sin llamadas impuras (`Date.now()`) en el render; los hooks de `src/data/hooks.ts` ya resuelven esos casos.
- **Seguridad**: nada en `localStorage`/`sessionStorage`/IndexedDB/cookies propias/URL (lo vigilan ESLint y
  `tests/seguridad.test.ts`). CSRF solo en memoria; sesión en cookie HttpOnly del BE. `NEXT_PUBLIC_*` es público: nunca
  secretos. Tokens de recuperación en el fragmento (`#t=`).
- **Producto**: el preregistro no es una cuenta; demo cerrada con invitación; perfil sin DNI/CUIT; ubicación manual o
  permiso puntual (nunca en segundo plano); fee 0 % hasta el 10/12 avisado después del registro, en el modal de primer
  ingreso y con contador en Cuenta, sin presentarlo como descuento ni anunciar tarifas no aprobadas; pago directo al
  especialista (Mercado Pago o efectivo), reportado ≠ verificado, volver del checkout no confirma nada; sin "Agregar
  tarjeta"; HandIA incluida como asistente para armar el pedido (sugiere el rubro; tacha datos personales antes de
  enviar; nunca recibe fotos ni documentos; con API real, inactiva hasta el endpoint del BE); sin envíos automáticos a terceros.
- **Mapa** (`src/components/MapaHx.tsx`, `src/geo/`): MapLibre + el extracto de OpenStreetMap de Mar del Plata servido por la
  propia app (`public/mapa/mdp.pmtiles`, se genera con `npm run mdp:datos`, no se versiona) y fuentes propias en
  `public/mapa/fuentes/`. **Nada de terceros** (ni teselas, ni claves, ni geocodificadores). Sin el archivo, el mapa
  ilustrado de la demo rotulado "Mapa ilustrativo": nunca una geografía inventada. Atribución de OpenStreetMap visible.
  El pin elige un punto solo cuando la persona mueve el mapa; tiempos de llegada solo los del viaje en vivo (servidor).
- **PWA**: `public/sw.js` guarda solo archivos públicos del mismo origen (páginas por ruta, sin query); nunca la API,
  escrituras ni datos, y no encola acciones. Sin conexión nada se da por hecho. Si cambia su lógica, subir `VERSION`; todo
  archivo de la precarga tiene que existir (lo prueba `tests/pwa.test.ts`). Nunca animar botones de aceptar/pagar.
- **Datos de prueba**: solo ficticios (ids `de000000-…`, `*@example.test`, nombres inventados).
- **Accesibilidad y responsive**: 360/390, 768/820 y escritorio; foco visible, labels, targets ≥ 44 px, contraste, nada
  que dependa solo del color, `prefers-reduced-motion`. Auditoría: `tests/e2e/accesibilidad.cjs` y `teclado.cjs` (ver `docs/qa.md`).

## Comandos

```sh
npm ci
npm run dev                 # http://127.0.0.1:5175 (vista de prueba sin .env)
npm run build && npm run preview   # export estático en out/ servido como Hostinger (127.0.0.1:5176)
npm run lint | typecheck | test | format:check | mapa:check | contracts:check
npm run e2e                 # navegador real (requiere Playwright y `npm run preview`); ver docs/qa.md
npm run capturas            # catálogo de pantallas y estados en docs/screens/capturas/
```

Antes de cada PR: `format:check`, `lint`, `typecheck`, `test`, `mapa:check`, `contracts:check`, `build` y `npm audit`.
