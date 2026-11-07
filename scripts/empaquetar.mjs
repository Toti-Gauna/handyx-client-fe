// Empaqueta out/ en handyx-web.zip para subirlo a Hostinger (Administrador de archivos → Extraer).
// Igual en Windows, macOS y Linux: rutas con "/", incluye .htaccess y no depende de Compress-Archive (que en Windows
// guarda "\" y rompe las carpetas al extraer en el servidor). Sin dependencias: zlib de Node (deflate + crc32).
// Uso: npm run build && npm run empaquetar
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { crc32, deflateRawSync } from 'node:zlib';

const ORIGEN = 'out';
const DESTINO = 'handyx-web.zip';

function archivos(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const ruta = join(dir, e.name);
    return e.isDirectory() ? archivos(ruta) : e.isFile() ? [ruta] : [];
  });
}

let lista;
try {
  lista = archivos(ORIGEN).sort();
} catch {
  console.error('No hay carpeta out/: corré primero "npm run build".');
  process.exit(1);
}
if (
  !lista.some((f) => relative(ORIGEN, f) === 'index.html') ||
  !lista.some((f) => relative(ORIGEN, f) === '.htaccess')
) {
  console.error(
    'out/ está incompleta (falta index.html o .htaccess): corré "npm run build" de nuevo.',
  );
  process.exit(1);
}

function fechaDos(d) {
  const hora = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2);
  const fecha = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  return { hora, fecha };
}

const locales = [];
const centrales = [];
let desplazamiento = 0;
for (const ruta of lista) {
  const nombre = Buffer.from(relative(ORIGEN, ruta).split(sep).join('/'), 'utf8');
  const datos = readFileSync(ruta);
  const comprimido = deflateRawSync(datos, { level: 9 });
  const usarDeflate = comprimido.length < datos.length;
  const cuerpo = usarDeflate ? comprimido : datos;
  const metodo = usarDeflate ? 8 : 0;
  const crc = crc32(datos) >>> 0;
  const { hora, fecha } = fechaDos(statSync(ruta).mtime);

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0x0800, 6); // nombres en UTF-8
  local.writeUInt16LE(metodo, 8);
  local.writeUInt16LE(hora, 10);
  local.writeUInt16LE(fecha, 12);
  local.writeUInt32LE(crc, 14);
  local.writeUInt32LE(cuerpo.length, 18);
  local.writeUInt32LE(datos.length, 22);
  local.writeUInt16LE(nombre.length, 26);
  local.writeUInt16LE(0, 28);
  locales.push(local, nombre, cuerpo);

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(0x0314, 4); // hecho en "Unix" con versión 2.0: permisos normales al extraer
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0x0800, 8);
  central.writeUInt16LE(metodo, 10);
  central.writeUInt16LE(hora, 12);
  central.writeUInt16LE(fecha, 14);
  central.writeUInt32LE(crc, 16);
  central.writeUInt32LE(cuerpo.length, 20);
  central.writeUInt32LE(datos.length, 24);
  central.writeUInt16LE(nombre.length, 28);
  central.writeUInt32LE((0o100644 << 16) >>> 0, 38); // archivo común, rw-r--r--
  central.writeUInt32LE(desplazamiento, 42);
  centrales.push(central, nombre);

  desplazamiento += local.length + nombre.length + cuerpo.length;
}

const directorio = Buffer.concat(centrales);
const fin = Buffer.alloc(22);
fin.writeUInt32LE(0x06054b50, 0);
fin.writeUInt16LE(lista.length, 8);
fin.writeUInt16LE(lista.length, 10);
fin.writeUInt32LE(directorio.length, 12);
fin.writeUInt32LE(desplazamiento, 16);

writeFileSync(DESTINO, Buffer.concat([...locales, directorio, fin]));
const mb = (statSync(DESTINO).size / 1024 / 1024).toFixed(1);
console.log(
  `Listo: ${DESTINO} (${lista.length} archivos, ${mb} MB). Subilo al public_html de handyx.pro y extraelo ahí.`,
);
