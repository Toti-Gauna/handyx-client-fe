# Contrato de datos: mock y HTTP (Fase 1 · lote 1.3)

Las pantallas solo hablan con `cliente` (`src/data/index.ts`), que implementa `ClienteApi`:

```ts
cliente.llamar('propuestaAceptar', {
  parametros: { id }, // solo UUID (rutaDe del contrato)
  cuerpo: { version }, // validado con el mismo Zod que el servidor
  claveIdempotencia, // la misma al reintentar
});
```

Tipos de cuerpo, consulta y respuesta salen del registro `ENDPOINTS` del contrato v1 (`RespuestaDe<'id'>`, etc.).
Errores siempre como `ErrorCliente` (`codigo`, `mensaje` seguro, `requestId`, `campos`, `conflicto`, `recuperable`,
`requiereIngreso`).

## Cuál se usa

| Build                                          | Cliente | Datos                                                                |
| ---------------------------------------------- | ------- | -------------------------------------------------------------------- |
| Sin `NEXT_PUBLIC_API_BASE_URL` (local/preview) | mock    | ficticios, en memoria, rótulo "Vista de prueba" visible              |
| Con `NEXT_PUBLIC_API_BASE_URL`                 | HTTP    | `handyx-client-be`; si falla se muestra el error, **nunca** fixtures |
| `NEXT_PUBLIC_ENTORNO=produccion` sin API       | —       | **el build falla**                                                   |

## Adaptador HTTP

`credentials: 'include'`, `cache: 'no-store'`, `redirect: 'error'`, timeout 15 s. Escrituras: pide el CSRF previo si
no hay, manda `X-CSRF-Token` e `Idempotency-Key`. Valida la respuesta contra el contrato: fuera de contrato = error.

## Adaptador mock

- Fixtures en `src/data/mock/fixtures.ts` (ids `de000000-…`, "hoy" fijo 17/11/2026 como la demo de la landing) que se
  validan contra el contrato en cada respuesta.
- `latenciaMs` (450 por defecto) y `fallas` por endpoint (`{ pedidos: 'no_disponible' }`) para ver carga/error/reintento.
- Lo no implementado responde `funcion_inactiva` ("todavía no tiene datos ficticios"): nunca inventa un éxito.
- Fase 1 implementa: versión, CSRF, sesión, fee (+ aceptar), rubros, cobertura y listas vacías. La Fase 2 suma el
  resto y los 18 escenarios (`?escenario=<id>`, en memoria, sin `localStorage`).
