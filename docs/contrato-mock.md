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

El "servidor" simulado (`src/data/mock/`) reproduce las reglas de `docs/state-machines.md` sobre un mundo en memoria (nunca en el navegador):
`mundo.ts` (estado y reloj), `reglas.ts` (propuestas, acuerdos, vencimientos, respuestas de la contraparte), `servidor.ts`
(los 54 endpoints), `escenarios-mundo.ts` (los 18 escenarios) y `simulador.ts` (acciones del panel de prueba).

- **Contrato**: cada cuerpo y consulta se validan con el Zod del contrato y cada respuesta se valida antes de devolverse (si un fixture se desvía, falla a la vista).
- **Reloj**: arranca el martes 17/11/2026 12:00 (Buenos Aires) y avanza en tiempo real; el panel lo adelanta (5 min, 30 min, 12 h, 1 día). Todo contador de la app usa la hora del servidor, no la del celular.
- **Idempotencia**: la misma `Idempotency-Key` devuelve la misma respuesta sin repetir el efecto (crear pedido, aceptar, reportar pago, reclamo, mensaje).
- **Escenarios**: `?escenario=<id>` (ver `docs/screens/matriz.md`). Recargar vuelve al punto de partida; nada se guarda en el navegador.
- **Panel de prueba**: botón en el rótulo amarillo. Representa lo que en producción hacen el especialista, Operations, el proveedor de pagos y el reloj. No existe con una API real.
- **Cuenta y datos de prueba (ficticios)**: `usuaria@example.test` / `handyx-demo-1234`, invitación `DEMO2026`; ids `de000000-…`.
- **Contraparte automática**: ofertas a los ~8 s de crear un pedido (salvo "pedidos sin respuesta"); respuesta a una contrapropuesta a los 45 s (acepta si es ≥ 85 % del precio; si no, ofrece el punto medio); respuesta en el chat a los 6 s.
- **Mercado Pago**: `checkoutActivo` apagado por defecto (gate); con la ruta aprobada, `pagoReportar` crea el pago `pendiente` y `pagoCheckout` devuelve la URL. En la vista de prueba no se abre Mercado Pago: se pasa a la pantalla de retorno y el panel simula la confirmación o el rechazo.

## Decisiones del mock que el servidor real tiene que confirmar (Fase 4)

1. `GET /v1/pedidos/{id}/propuestas` devuelve **todos** los tipos (cotización, cambio de acuerdo, adicional); el cliente filtra por `tipo`.
2. `pagoReportar` con Mercado Pago crea el pago en `pendiente` (esperando al proveedor) y con efectivo en `reportado`.
3. `etapaConfirmar` usa la `version` de la **etapa**; `trabajoConfirmarFin`, la del trabajo.
4. Una propuesta de cambio del acuerdo no admite contrapropuesta (solo aceptar o rechazar).
5. La sesión vencida responde `sesion_vencida` en todas las llamadas hasta reingresar.
6. Las notificaciones no traen texto: el cliente lo arma a partir de `tipo`.
7. Edad mínima 18 años (supuesto a confirmar con Legal).
8. **HandIA** no está en el contrato v1: la vista de prueba usa `src/data/handia.ts` (reglas locales, sin IA). En la
   Fase 4 el BE suma `handiaMensaje` (texto ya tachado de datos personales, sin fotos) y la pantalla pasa a usarlo.
