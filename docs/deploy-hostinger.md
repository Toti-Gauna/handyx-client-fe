# Deploy en Hostinger · handyx.pro (vista de prueba)

Publica la PWA en **https://handyx.pro** como **vista de prueba**: datos ficticios, rótulo "Vista de prueba" y panel de
prueba. No crea cuentas ni guarda datos de nadie (todo vive en la memoria del navegador). La app real necesita la API
(`handyx-client-be` en Render + Neon, bajo `api.handyx.pro`): ver [`conexion-api.md`](conexion-api.md).

Decisiones de Ignacio (07/11/2026): vista de prueba en handyx.pro, deploy automático con GitHub Actions.

## Cómo funciona

`.github/workflows/deploy-hostinger.yml` corre en cada push a `fase-3-diseno` o `main` (y a mano desde la pestaña
**Actions** cuando el archivo esté en `main`): `npm ci` → lint, typecheck y pruebas → `npm run build` → comprueba el
export → lo sube por **FTPS** al `public_html` de handyx.pro. Solo sube lo que cambió (guarda un archivo de estado,
`.ftp-deploy-sync-state.json`, que el `.htaccess` no deja leer). Si algo falla, no se publica nada. Sin las
credenciales, compila igual pero no sube y deja un aviso amarillo.

`public/.htaccess` (sale en `out/.htaccess`): página 404, HTTPS obligatorio, sin listado de carpetas, tipos MIME del
manifiesto y del mapa, caché correcta (HTML y `sw.js` siempre se revisan, `_next/static` un año) y cabeceras de
seguridad. Todo lo que depende de un módulo va dentro de `<IfModule>`: si el servidor no lo tiene, se ignora.

## Configuración (una sola vez)

1. **Hostinger → cuenta FTP.** hPanel → Sitios web → handyx.pro → **Archivos → Cuentas FTP** → crear una cuenta
   nueva (por ejemplo `deploy`) con contraseña larga y con el **directorio** = el `public_html` de handyx.pro. En esa
   misma pantalla figura el **host FTP** (una IP o `ftp.handyx.pro`).
2. **Hostinger → limpiar `public_html`.** En el Administrador de archivos, borrar lo que traiga por defecto
   (`default.php`): el deploy no borra archivos que no subió él. Si hay algo que sirva, descargarlo antes.
3. **Hostinger → SSL.** Seguridad → SSL: certificado activo para handyx.pro (gratis; si no está, "Instalar SSL").
4. **GitHub → secretos.** Repositorio `handyx-client-fe` → **Settings → Secrets and variables → Actions → New
   repository secret**, tres veces:

   | Nombre                   | Valor                                            |
   | ------------------------ | ------------------------------------------------ |
   | `HOSTINGER_FTP_HOST`     | el host FTP del paso 1                           |
   | `HOSTINGER_FTP_USER`     | el usuario completo (p. ej. `u123456789.deploy`) |
   | `HOSTINGER_FTP_PASSWORD` | la contraseña de esa cuenta                      |

   Nunca en el código, en `.env` versionados ni en el chat.

5. **Primer deploy.** Actions → **Deploy Hostinger** → el último run → **Re-run all jobs** (o hacer cualquier push a
   `fase-3-diseno`). Tarda 2 a 4 minutos.

Variables opcionales (Settings → Secrets and variables → Actions → **Variables**):

| Variable                        | Para qué                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| `HOSTINGER_FTP_PROTOCOLO`       | `ftp` si el servidor no acepta FTPS (el error dice "TLS"/"SSL"); por defecto `ftps` |
| `HOSTINGER_DIR`                 | otra carpeta de destino si la cuenta FTP no apunta directo a `public_html`          |
| `HX_ENTORNO`, `HX_API_BASE_URL` | para la app real: `produccion` y `https://api.handyx.pro`                           |

## Comprobar

En PowerShell (o cualquier terminal):

```powershell
curl.exe -I http://handyx.pro/                       # 301 → https://handyx.pro/
curl.exe -I https://handyx.pro/                      # 200, Cache-Control: no-cache
curl.exe -I https://handyx.pro/pedidos/              # 200 (link directo a una pantalla)
curl.exe -I https://handyx.pro/no-existe/            # 404
curl.exe -I https://handyx.pro/.ftp-deploy-sync-state.json   # 403
```

En el celular: abrir https://handyx.pro, ver el rótulo "Vista de prueba", recorrer pedir → propuestas → trabajo, y
"Agregar a pantalla de inicio".

**Si la web da "Error 500"**: el servidor no aceptó alguna línea del `.htaccess`. En el Administrador de archivos
renombrarlo a `.htaccess.off` (la web vuelve enseguida, sin HTTPS forzado ni caché fina) y avisar qué pasó.

## Actualizar

Push a `fase-3-diseno` (o merge a `main`): se publica solo. Quien tenga la app abierta ve "Hay una versión nueva de
Handyx" y actualiza cuando quiere.

## Alternativa a mano (sin Actions)

Con Node 22: `npm ci`, crear `.env.production.local` con `NEXT_PUBLIC_ENTORNO=preview`, `npm run build`,
`npm run empaquetar` (crea `handyx-web.zip` con rutas `/` y el `.htaccess`; no usar `Compress-Archive`, que guarda
`\`) y en el Administrador de archivos subirlo a `public_html` y **Extraer** ahí.

## Pendiente (no incluido)

- **Mapa con calles**: sin `public/mapa/mdp.pmtiles` se ve el mapa ilustrado rotulado (`npm run mdp:datos`).
- **App real**: API en `https://api.handyx.pro` (mismo sitio que la PWA, por la cookie `SameSite=Lax`). Antes,
  `npm run api:verificar -- --api https://api.handyx.pro --app https://handyx.pro` tiene que dar "Conexión OK".
