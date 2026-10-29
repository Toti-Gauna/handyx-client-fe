# handyx-client-fe · PWA de usuario de Handyx

App web (PWA) de usuarios de Handyx — especialistas del hogar en Mar del Plata (handyc.com). Next.js 16 con export
estático para Hostinger, React 19, TypeScript estricto. API: `handyx-client-be` (contrato v1).

Estado: **Fase 2 · Mockup completo** — todas las pantallas navegables con datos ficticios (servidor simulado con las reglas
del negocio, 18 escenarios y un panel de prueba). Sin backend real ni despliegue.

## Desarrollo

```sh
npm ci
npm run dev        # http://127.0.0.1:5175 — sin .env es la vista de prueba (datos ficticios)
                   # cuenta de prueba: usuaria@example.test / handyx-demo-1234 · invitación: DEMO2026
```

Contra el BE local: `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3100` en `.env.local` (ver `.env.example`). Todo
`NEXT_PUBLIC_*` es público.

## Build estático

```sh
npm run build      # out/ (cada ruta es carpeta/index.html)
npm run preview    # sirve out/ como Hostinger en http://127.0.0.1:5176
```

Producción exige `NEXT_PUBLIC_ENTORNO=produccion` y `NEXT_PUBLIC_API_BASE_URL=https://…`; sin API el build falla.

## Comprobaciones

```sh
npm run format:check && npm run lint && npm run typecheck && npm test && npm run mapa:check && npm run contracts:check && npm run build
```

## Documentación

[Plan](docs/plan.md) · [Handoff](docs/handoff.md) · [QA](docs/qa.md) · [Inventario](docs/inventario.md) ·
[Mapa inicial](docs/screens/mapa-inicial.md) · [Matriz](docs/screens/matriz.md) ·
[Contrato mock/HTTP](docs/contrato-mock.md) · [ADR-0001 Next export](docs/adr/ADR-0001-nextjs-export-estatico.md)
