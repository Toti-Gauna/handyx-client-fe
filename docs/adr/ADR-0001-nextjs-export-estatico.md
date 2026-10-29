# ADR-0001 · Next.js con export estático para la PWA de usuario

Estado: **aceptada** (Ignacio eligió Next.js el 29/10/2026) · Fase 1 · lote 1.1

## Contexto

El repo estaba vacío (solo README). La landing y el portal usan Vite + TypeScript sin framework; el prompt del bloque
propone React + Vite + TypeScript por defecto y pide no imponer SSR porque el front va a Hostinger (estático). Se
recomendó Vite; Ignacio prefirió Next.js.

## Decisión

- Next.js 16 (App Router) + React 19 + TypeScript estricto, con `output: 'export'`: el build genera `out/` con HTML,
  JS y CSS estáticos. Sin servidor Node en producción ni instancia nueva en Render.
- `trailingSlash: true`: cada ruta es `carpeta/index.html`, así recargar o abrir un link directo funciona en Hostinger
  sin reglas de rewrite.
- Pantallas con id por **query** (`?id=`), no `[id]`: un export estático no puede generar ids desconocidos en build.
- No se usan: SSR, middleware, server actions, route handlers, ISR, `next/image` optimizado (`unoptimized: true`).
  La lógica de negocio y la seguridad viven en `handyx-client-be`.
- Mismo tooling de calidad que los BE: Vitest, ESLint (config de Next), Prettier, TS estricto.

## Consecuencias

- CSP: Next inyecta scripts inline (`self.__next_f`), así que una CSP estricta `script-src 'self'` como la del portal no
  alcanza; se resuelve en la Fase 5 (hashes por build o cabecera en Hostinger). Registrado como pendiente.
- El service worker y el manifest son propios (Fase 3.3), sin plugins que requieran servidor.
- Si en el futuro se quisiera SSR, implicaría un servicio Node (Render) y otra decisión explícita.
- El contrato del BE importa con extensión `.ts` porque Turbopack no resuelve `.js`→`.ts`.
