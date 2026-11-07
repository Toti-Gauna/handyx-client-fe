# Deploy en Hostinger · handyx.pro (vista de prueba)

Publica la PWA en **https://handyx.pro** como **vista de prueba**: datos ficticios, rótulo "Vista de prueba" y panel de
prueba. No crea cuentas ni guarda datos de nadie (todo vive en la memoria del navegador). La app real necesita la API
(`handyx-client-be` en Render + Neon, bajo `api.handyx.pro`): ver [`conexion-api.md`](conexion-api.md).

Decisiones de Ignacio (07/11/2026): vista de prueba en handyx.pro, deploy automático con GitHub Actions por SSH.

## Cómo funciona

`.github/workflows/deploy-hostinger.yml` corre en cada push a `fase-3-diseno` o `main` (y a mano desde la pestaña
**Actions** cuando el archivo esté en `main`): `npm ci` → lint, typecheck y pruebas → `npm run build` → comprueba el
export → lo publica en el `public_html` de handyx.pro. Si algo falla, no se publica nada. Sin credenciales, compila igual
y deja un aviso amarillo.

- **SSH + rsync (preferido)**: entra con una clave (no contraseña), solo si la huella del servidor coincide con la
  guardada, sube lo que cambió y borra lo que sobra (menos `.well-known/`, que usa el SSL). Se niega a correr si el
  destino no termina en `/public_html`.
- **FTPS (respaldo)**: solo si no hay secretos de SSH (planes sin SSH). No borra lo que no subió.

`public/.htaccess` (sale en `out/.htaccess`): página 404, HTTPS obligatorio, sin listado de carpetas, tipos MIME del
manifiesto y del mapa, caché correcta (HTML y `sw.js` siempre se revisan, `_next/static` un año) y cabeceras de
seguridad. Todo lo que depende de un módulo va dentro de `<IfModule>`: si el servidor no lo tiene, se ignora.

## Configuración por SSH (una sola vez, desde Windows)

1. **Hostinger → activar SSH.** hPanel → Sitios web → handyx.pro → **Avanzado → Acceso SSH** → Habilitar. Anotar
   **IP**, **puerto** (normalmente `65002`) y **usuario** (`u123456789`). Si esa opción no aparece, el plan no tiene
   SSH: usar la configuración por FTP de abajo.
2. **Crear una clave solo para el deploy** (PowerShell; cuando pida frase de contraseña, Enter dos veces):

   ```powershell
   ssh-keygen -t ed25519 -C "github-actions-handyx" -f $HOME\.ssh\handyx_deploy
   Get-Content $HOME\.ssh\handyx_deploy.pub | Set-Clipboard
   ```

3. **Hostinger → cargar la clave pública.** En **Acceso SSH → Claves SSH → Agregar**, pegar lo copiado (empieza con
   `ssh-ed25519`).
4. **Huella del servidor** (para que GitHub solo se conecte a Hostinger y no a un impostor; cambiar la IP):

   ```powershell
   ssh-keyscan -p 65002 145.0.0.0 | Set-Clipboard
   ```

5. **GitHub → secretos.** Repositorio `handyx-client-fe` → **Settings → Secrets and variables → Actions → New
   repository secret**:

   | Nombre                      | Valor                                                                              |
   | --------------------------- | ---------------------------------------------------------------------------------- |
   | `HOSTINGER_SSH_HOST`        | la IP del paso 1                                                                   |
   | `HOSTINGER_SSH_USER`        | el usuario (`u123456789`)                                                          |
   | `HOSTINGER_SSH_KEY`         | la clave **privada**: `Get-Content $HOME\.ssh\handyx_deploy -Raw \| Set-Clipboard` |
   | `HOSTINGER_SSH_KNOWN_HOSTS` | lo copiado en el paso 4                                                            |

   Si el puerto no es `65002`, crear la **variable** (pestaña Variables) `HOSTINGER_SSH_PORT`. Si la carpeta del sitio
   no es `domains/handyx.pro/public_html`, la variable `HOSTINGER_SSH_DIR` (tiene que terminar en `/public_html`).
   La clave privada no se comparte ni se sube a ningún lado más: si se filtra, borrarla en Hostinger y crear otra.

6. **SSL.** Seguridad → SSL: certificado activo para handyx.pro (gratis; si no está, "Instalar SSL").
7. **Primer deploy.** Actions → **Deploy Hostinger** → el último run → **Re-run all jobs**. Tarda 2 a 4 minutos.

## Configuración por FTP (solo si el plan no tiene SSH)

1. hPanel → handyx.pro → **Archivos → Cuentas FTP** → cuenta nueva (p. ej. `deploy`) con directorio = el
   `public_html` de handyx.pro. Anotar el host FTP y el usuario completo (`u123456789.deploy`).
2. En el Administrador de archivos, borrar lo que traiga `public_html` por defecto (`default.php`).
3. Secretos `HOSTINGER_FTP_HOST`, `HOSTINGER_FTP_USER` y `HOSTINGER_FTP_PASSWORD`. Si el error dice "TLS"/"SSL",
   variable `HOSTINGER_FTP_PROTOCOLO` = `ftp`.

Variables para la app real (más adelante): `HX_ENTORNO` = `produccion` y `HX_API_BASE_URL` = `https://api.handyx.pro`.

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
