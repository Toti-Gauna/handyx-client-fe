# Deploy en Hostinger · handyx.pro (vista de prueba)

Publica la PWA en **https://handyx.pro** como **vista de prueba**: datos ficticios, rótulo "Vista de prueba" y panel de
prueba. No crea cuentas ni guarda datos de nadie (todo vive en la memoria del navegador). La app real necesita la API
(`handyx-client-be` en Render + Neon, bajo `api.handyx.pro`): ver [`conexion-api.md`](conexion-api.md).

Decisión de Ignacio (07/11/2026): publicar la vista de prueba en handyx.pro desde Windows.

## Qué se sube

`npm run build` deja el export estático en `out/` (≈357 archivos, 14 MB) y `npm run empaquetar` lo comprime en
`handyx-web.zip` (≈3,5 MB) con rutas `/` y el `.htaccess` incluido. **No usar `Compress-Archive`** de Windows: guarda
las rutas con `\` y en el servidor (Linux) las carpetas quedan rotas.

`public/.htaccess` (sale en `out/.htaccess`): página 404, HTTPS obligatorio, sin listado de carpetas, tipos MIME del
manifiesto y del mapa, caché correcta (HTML y `sw.js` siempre se revisan, `_next/static` un año) y cabeceras de
seguridad. Todo lo que depende de un módulo va dentro de `<IfModule>`: si el servidor no lo tiene, se ignora.

## Primera vez (Windows, PowerShell)

```powershell
# 1. Herramientas (una sola vez). Node tiene que ser 22 (package.json: >=22.12 <23).
winget install --id Git.Git -e
winget install --id CoreyButler.NVMforWindows -e
# cerrar y abrir PowerShell
nvm install 22
nvm use 22
node -v            # v22.x
# Si PowerShell dice que "la ejecución de scripts está deshabilitada":
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned

# 2. Código
cd $HOME\Documents
git clone https://github.com/Toti-Gauna/handyx-client-fe.git
cd handyx-client-fe
git checkout fase-3-diseno
npm ci

# 3. Build de la vista de prueba (el archivo .env.* no se versiona)
Set-Content -Path .env.production.local -Value "NEXT_PUBLIC_ENTORNO=preview" -Encoding ascii
npm run build
npm run preview    # abrir http://127.0.0.1:5176 y revisar; cortar con Ctrl+C
npm run empaquetar # crea handyx-web.zip
```

## Subir a Hostinger (hPanel)

1. **Sitios web** → handyx.pro → **Administrador de archivos** → carpeta `public_html` (la del dominio handyx.pro).
2. Si hay algo adentro que sirva, descargarlo antes. Borrar todo lo demás (por ejemplo `default.php`).
3. **Subir** `handyx-web.zip` a `public_html`, clic derecho → **Extraer** → destino `public_html` (no una subcarpeta).
4. Mostrar archivos ocultos y comprobar que en `public_html` quedaron `index.html`, `.htaccess`, `404.html`, `sw.js` y
   la carpeta `_next`. Borrar `handyx-web.zip` del servidor.
5. **Seguridad → SSL**: certificado activo para handyx.pro (Hostinger lo instala gratis; si no, "Instalar SSL").

## Comprobar

```powershell
curl.exe -I http://handyx.pro/                       # 301 → https://handyx.pro/
curl.exe -I https://handyx.pro/                      # 200, Cache-Control: no-cache
curl.exe -I https://handyx.pro/pedidos/              # 200 (link directo a una pantalla)
curl.exe -I https://handyx.pro/no-existe/            # 404
curl.exe -I https://handyx.pro/manifest.webmanifest  # 200, Content-Type: application/manifest+json
```

En el celular: abrir https://handyx.pro, ver el rótulo "Vista de prueba", recorrer pedir → propuestas → trabajo, y
"Agregar a pantalla de inicio" (se instala como app).

**Si la web da "Error 500"**: el servidor no aceptó alguna línea del `.htaccess`. En el Administrador de archivos
renombrarlo a `.htaccess.off` (la web vuelve enseguida, sin HTTPS forzado ni caché fina) y avisar qué dijo el error.

## Actualizar

```powershell
cd $HOME\Documents\handyx-client-fe
git pull
npm ci
npm run build
npm run empaquetar
```

En `public_html`: borrar todo, subir el zip nuevo y extraer. Quien tenga la app abierta ve "Hay una versión nueva de
Handyx" y actualiza cuando quiere (el service worker no recarga solo).

## Pendiente (no incluido)

- **Mapa con calles**: sin `public/mapa/mdp.pmtiles` se ve el mapa ilustrado rotulado. Generarlo con `npm run mdp:datos`
  (necesita la herramienta `pmtiles` y un shell `sh`, p. ej. Git Bash) y volver a compilar.
- **App real**: API en `https://api.handyx.pro` (mismo sitio que la PWA, por la cookie `SameSite=Lax`), y en
  `.env.production.local`: `NEXT_PUBLIC_ENTORNO=produccion` + `NEXT_PUBLIC_API_BASE_URL=https://api.handyx.pro`. Antes,
  `npm run api:verificar -- --api https://api.handyx.pro --app https://handyx.pro` tiene que dar "Conexión OK".
