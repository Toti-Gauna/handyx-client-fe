// Verificador de la conexión PWA ↔ handyx-client-be (lote 4.7d). Solo lee: GET, OPTIONS y el POST de /v1/auth/csrf
// (que no crea cuentas ni datos: emite un token previo en cookie). Sin login, sin datos personales, sin secretos.
// Correrlo SOLO contra un servidor propio y autorizado (local, staging o producción con permiso de Ignacio).
//
//   node scripts/api-verificar.mjs --api https://api.ejemplo.test --app https://app.ejemplo.test
//   npm run api:verificar -- --api http://127.0.0.1:3100 --app http://127.0.0.1:5175
//
// `--api` cae a NEXT_PUBLIC_API_BASE_URL si no se pasa. Sale con código 1 si algo falla.
import { readFileSync } from 'node:fs';

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .join(' ')
    .split(/\s*--/)
    .filter(Boolean)
    .map((par) => par.split(/\s+/)),
);
const api = (args.api ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');
const app = (args.app ?? '').replace(/\/$/, '');
if (!api || !app) {
  console.error(
    'Uso: node scripts/api-verificar.mjs --api <origen de la API> --app <origen de la PWA>',
  );
  process.exit(2);
}

const CONTRATO = /VERSION_CONTRATO = '([^']+)'/.exec(
  readFileSync(new URL('../src/contracts/v1/endpoints.ts', import.meta.url), 'utf8'),
)?.[1];
const AJENO = 'https://origen-no-permitido.example.test';
const UUID = 'de000000-0000-4000-8000-000000000000';
const seguro = api.startsWith('https://');
let fallas = 0;
let avisos = 0;
const ok = (cond, msg, detalle = '') => {
  console.log(`${cond ? '✔' : '✘'} ${msg}${!cond && detalle ? ` → ${detalle}` : ''}`);
  if (!cond) fallas++;
};
const aviso = (msg) => {
  console.log(`! ${msg}`);
  avisos++;
};

/** Sitio "registrable" aproximado (alcanza para .com, .com.ar, .app…): las cookies SameSite=Lax viajan dentro del sitio. */
function sitio(origen) {
  const partes = new URL(origen).hostname.split('.');
  if (partes.every((p) => /^\d+$/.test(p)) || partes.length < 2) return partes.join('.');
  const n = /^(com|net|org|gob|gov|edu|co)$/.test(partes.at(-2)) ? 3 : 2;
  return partes.slice(-n).join('.');
}

async function pedir(ruta, init = {}) {
  try {
    return await fetch(api + ruta, { redirect: 'manual', ...init });
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}

console.log(`API ${api} · PWA ${app} · contrato de esta app ${CONTRATO}\n`);

// 1. Orígenes: https en producción, solo origen, y mismo sitio (la cookie es SameSite=Lax y host-only).
for (const [nombre, o] of [
  ['API', api],
  ['PWA', app],
]) {
  const u = new URL(o);
  ok(u.origin === o, `${nombre}: es solo un origen (sin ruta, query ni barra final)`, o);
  if (u.protocol !== 'https:' && !['127.0.0.1', 'localhost'].includes(u.hostname))
    ok(false, `${nombre}: https fuera de local`, o);
}
if (sitio(api) !== sitio(app))
  ok(
    false,
    'PWA y API en el mismo sitio (p. ej. app.dominio y api.dominio)',
    `${sitio(app)} ≠ ${sitio(api)}: la cookie SameSite=Lax no viajaría en los fetch de la PWA`,
  );
else ok(true, `PWA y API en el mismo sitio (${sitio(api)})`);

// 2. Vida y versión del contrato.
const salud = await pedir('/health');
ok(salud.status === 200, 'GET /health responde 200', salud.error ?? String(salud.status));
const version = await pedir('/v1/version', { headers: { Origin: app } });
const cuerpoVersion = version.ok ? await version.json().catch(() => null) : null;
ok(
  cuerpoVersion?.contrato === CONTRATO,
  `GET /v1/version = ${CONTRATO} (la misma copia del contrato)`,
  version.error ?? JSON.stringify(cuerpoVersion ?? version.status),
);

// 3. CORS: el origen exacto de la PWA, con credenciales y las cabeceras del contrato; otro origen, rechazado.
const previo = await pedir('/v1/auth/login', {
  method: 'OPTIONS',
  headers: {
    Origin: app,
    'Access-Control-Request-Method': 'POST',
    'Access-Control-Request-Headers': 'content-type,x-csrf-token,idempotency-key',
  },
});
const h = previo.headers;
ok(
  h?.get('access-control-allow-origin') === app,
  'CORS: devuelve exactamente el origen de la PWA (APP_ALLOWED_ORIGINS)',
  previo.error ?? `${h?.get('access-control-allow-origin')}`,
);
ok(
  h?.get('access-control-allow-credentials') === 'true',
  'CORS: con credenciales (cookie de sesión)',
);
const permitidas = (h?.get('access-control-allow-headers') ?? '').toLowerCase();
ok(
  ['content-type', 'x-csrf-token', 'idempotency-key'].every((c) => permitidas.includes(c)),
  'CORS: permite Content-Type, X-CSRF-Token e Idempotency-Key',
  permitidas,
);
const ajeno = await pedir('/v1/version', { headers: { Origin: AJENO } });
ok(
  ajeno.headers?.get('access-control-allow-origin') !== AJENO,
  'CORS: un origen ajeno no queda permitido',
);

// 4. Cookie del CSRF previo: host-only, HttpOnly, SameSite=Lax, Path=/; Secure y `__Host-` con https.
const csrf = await pedir('/v1/auth/csrf', { method: 'POST', headers: { Origin: app } });
if (csrf.error || csrf.status === 503) {
  aviso(
    `POST /v1/auth/csrf: ${csrf.error ?? '503 (¿API sin base ni claves?)'}; no se pudo revisar la cookie`,
  );
} else {
  const token = (await csrf.json().catch(() => ({}))).csrfToken;
  ok(
    csrf.status === 200 && typeof token === 'string',
    'POST /v1/auth/csrf entrega el token (para la memoria)',
  );
  const cookie = csrf.headers.getSetCookie?.()[0] ?? '';
  const flags = cookie.toLowerCase();
  ok(/httponly/.test(flags), 'cookie HttpOnly');
  ok(/samesite=lax/.test(flags), 'cookie SameSite=Lax');
  ok(/path=\//.test(flags), 'cookie Path=/');
  ok(!/domain=/.test(flags), 'cookie host-only (sin Domain)');
  if (seguro) {
    ok(/;\s*secure/.test(flags), 'cookie Secure');
    ok(cookie.startsWith('__Host-'), 'cookie con prefijo __Host-');
  }
  // CSRF previo de doble envío firmado: la cookie HttpOnly y la cabecera llevan el mismo token (docs/auth-permissions.md).
  ok(cookie.includes(`=${token};`), 'la cookie lleva el token previo firmado (doble envío)');
}

// 5. Viaje en vivo (SSE): la ruta existe y sin sesión responde 401 en JSON (no 404 ni 503).
const vivo = await pedir(`/v1/trabajos/${UUID}/viaje/eventos`, {
  headers: { Origin: app, Accept: 'text/event-stream' },
});
const sinSesion = vivo.status === 401 || vivo.status === 403;
ok(sinSesion, 'GET …/viaje/eventos sin sesión: 401', vivo.error ?? String(vivo.status));
if (vivo.headers) {
  ok(
    vivo.headers.get('access-control-allow-origin') === app,
    'SSE: CORS con el origen de la PWA (EventSource withCredentials)',
  );
  await vivo.body?.cancel().catch(() => {});
}

console.log(
  `\n${fallas ? `${fallas} comprobación(es) fallaron` : 'Conexión OK'}${avisos ? ` · ${avisos} aviso(s)` : ''}`,
);
process.exitCode = fallas ? 1 : 0;
