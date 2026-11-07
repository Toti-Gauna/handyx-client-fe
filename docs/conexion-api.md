# Conexión con la API real (lote 4.7d)

La PWA ya habla con `handyx-client-be` sin cambiar código: alcanza con compilarla con `NEXT_PUBLIC_API_BASE_URL`. Este
documento dice qué está listo, qué hay que configurar de cada lado y cómo comprobarlo antes de dar algo por conectado.
**No hay nada desplegado ni conectado todavía** (eso es la Fase 5 y necesita autorización de Ignacio: Render, Neon,
Hostinger y dominios).

## Qué está listo en el front

| Pieza                      | Dónde                                    | Qué hace con la API real                                                                                                                                   |
| -------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cliente HTTP               | `src/data/http/cliente-http.ts`          | `credentials: 'include'`, sin caché, sin redirecciones; CSRF solo en memoria; `Idempotency-Key`; valida cada respuesta con el contrato. Nunca cae a mocks. |
| Viaje en vivo (SSE)        | `cliente.escuchar('trabajoViajeEnVivo')` | `EventSource` con `withCredentials`, evento `viaje`; cada mensaje se valida; si se corta, `useViaje` consulta `trabajoViaje` cada 5 s hasta que vuelva.    |
| Versión del contrato       | `src/data/compatibilidad.ts`, `Pwa.tsx`  | Al abrir, compara `/v1/version` con la copia compilada (`1.0.0-draft.3`); si no coincide, muestra "Handyx se está actualizando".                           |
| Entorno                    | `src/config/entorno.ts`                  | `NEXT_PUBLIC_API_BASE_URL` tiene que ser solo un origen; con `NEXT_PUBLIC_ENTORNO=produccion` el build falla sin API.                                      |
| Service worker             | `public/sw.js`                           | Solo guarda archivos del mismo origen: la API (otro origen) nunca pasa por la caché.                                                                       |
| Verificador de la conexión | `npm run api:verificar`                  | Comprueba orígenes, mismo sitio, `/health`, versión, CORS, cookie y la ruta SSE (abajo).                                                                   |
| Humo contra la API real    | `tests/e2e/api-real.cjs`                 | Registro con invitación real, sesión en cookie HttpOnly, nada en el almacenamiento, aviso de contrato distinto.                                            |

## Requisitos de la conexión

1. **Mismo sitio.** La sesión es una cookie del BE **host-only, HttpOnly, SameSite=Lax** (`__Host-handyx_sesion` con
   https). El navegador solo la manda en los `fetch` de la PWA si PWA y API comparten el dominio registrable: por
   ejemplo `app.<dominio>` (Hostinger) y `api.<dominio>` (Render). Con dominios distintos (o el `*.onrender.com` de
   Render contra el dominio de Hostinger) **no funciona** y no se arregla en el front: hay que poner la API bajo el mismo
   dominio. No usar `SameSite=None`.
2. **HTTPS** en los dos lados fuera de local.
3. **BE** (entorno privado de Render, nunca en Git ni en el front):
   - `NODE_ENV=production` (cookies `Secure` con prefijo `__Host-`).
   - `APP_ALLOWED_ORIGINS=https://app.<dominio>`: el origen **exacto** de la PWA, sin barra final; si hay preview,
     separado por coma.
   - `TRUST_PROXY_HOPS=1` (Render).
   - `DATABASE_URL` con el rol `handyx_usuario_app`, `PII_ENCRYPTION_KEY`, `PII_KEY_ID`, `PII_HMAC_KEY` (las mismas
     del dominio que usa `handyx-specialist-be`) y `CSRF_SECRET` propia. Ver `handyx-client-be/docs/database.md`.
4. **Front** (variables de build en el entorno que compila; todo `NEXT_PUBLIC_*` es público, nunca secretos):
   - `NEXT_PUBLIC_ENTORNO=produccion` (o `preview`).
   - `NEXT_PUBLIC_API_BASE_URL=https://api.<dominio>`.
5. **Hostinger**: subir `out/` tal cual. Si se agrega una Content-Security-Policy, `connect-src` tiene que incluir el
   origen de la API (fetch y SSE).
6. **SSE detrás de proxies**: la transmisión manda un latido cada 25 s; si un proxy corta igual, el front reintenta solo
   (el `EventSource` a los 5 s) y mientras tanto consulta por JSON. No hace falta configurar nada más.

## Pasos para conectar (Fase 5, con autorización)

1. Desplegar `handyx-client-be` con el entorno del punto 3 y migrar con `db:migrate` desde el proceso privado del
   propietario (nunca al arrancar).
2. Desde una terminal, contra el servidor propio:

   ```sh
   npm run api:verificar -- --api https://api.<dominio> --app https://app.<dominio>
   ```

   Solo lee (`GET`, `OPTIONS` y el `POST /v1/auth/csrf`, que no crea datos). Tiene que terminar en **"Conexión OK"**.

3. Compilar el front con el punto 4 (`npm run build`) y subir `out/` a Hostinger.
4. Humo en staging con una invitación **de prueba** (emitida con `npm run invitacion` del BE) y datos sintéticos:

   ```sh
   E2E_BASE=https://app.<dominio> INVITACION=<código> node tests/e2e/api-real.cjs
   ```

   Crea una cuenta `humo-…@example.test`: correrlo solo en staging o pedir la baja de esa cuenta después.

5. A mano, con una cuenta de especialista de prueba: pedido → propuesta → aceptar → "Salí" con ubicación compartida →
   en la PWA se ven la posición, el recorrido y la llegada estimada; al marcar "Llegué" desaparecen.

Hasta que los pasos 2 a 5 pasen contra la URL real, no se declara la URL probada.

## Ensayo local (lo que se corrió en el 4.7d)

Con la base aislada de pruebas (`handyx-client-be/docs/testing.md`) y claves descartables generadas en el momento:

```sh
# BE (handyx-client-be), entorno local con APP_ALLOWED_ORIGINS=http://127.0.0.1:5175,http://127.0.0.1:5176
npx tsx src/server.ts
npx tsx scripts/invitacion.ts 2          # con OPS_DATABASE_URL (rol handyx_ops) y OPERADOR_ID
# Front
npm run api:verificar -- --api http://127.0.0.1:3100 --app http://127.0.0.1:5175   # → Conexión OK (17 ✔)
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3100 npm run build && npm run preview
INVITACION=<código> node tests/e2e/api-real.cjs                                       # → API real OK (11 ✔)
```

El viaje en vivo de punta a punta (con la API de especialista publicando posiciones) está probado del lado del BE
(`tests/viaje*.integration.test.ts` e integración con `handyx-specialist-be`); en el front, con el adaptador HTTP y un
`EventSource` falso (`src/data/datos.test.ts`) y en navegador con la vista de prueba (`tests/e2e/mapa.cjs`).

## Si algo falla

| Síntoma                                                   | Causa probable                                                                        |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Todo responde "origen no permitido" (403)                 | `APP_ALLOWED_ORIGINS` no tiene el origen exacto de la PWA (esquema, puerto, barra).   |
| Ingresa pero la pantalla siguiente pide ingresar de nuevo | PWA y API en sitios distintos: la cookie `SameSite=Lax` no viaja.                     |
| `csrf_invalido` al registrarse o ingresar                 | Cookie previa bloqueada (sitio distinto) o reloj del servidor corrido.                |
| "Handyx se está actualizando"                             | El BE publica otra versión del contrato: desplegar el par que corresponde.            |
| "Recibimos una respuesta inesperada"                      | Respuesta fuera de contrato: BE y front con copias distintas de `src/contracts/v1`.   |
| /v1/* con sesión responde 503                             | El BE arrancó sin base o sin claves (`docs/database.md`).                             |
| El viaje se actualiza cada 5 s en vez de en vivo          | La transmisión SSE se corta (proxy, CSP `connect-src`): revisar la red del navegador. |
