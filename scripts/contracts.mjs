// Copia byte a byte del contrato v1 desde handyx-client-be (dueño). Acá no se edita.
// Uso: npm run contracts:sync            (copia)
//      npm run contracts:check           (falla si difiere)
// Ruta del BE: HANDYX_CLIENT_BE (por defecto ../handyx-client-be). Sin el BE, `--check` se saltea con aviso
// salvo con CONTRACTS_STRICT=1 (CI con el BE disponible).
import { copyFileSync, existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const be = resolve(process.env.HANDYX_CLIENT_BE ?? '../handyx-client-be');
const origen = join(be, 'src/contracts/v1');
const destino = resolve('src/contracts/v1');
const revisar = process.argv.includes('--check');

if (!existsSync(origen)) {
  const mensaje = `No encontré el contrato en ${origen}.`;
  if (revisar && process.env.CONTRACTS_STRICT !== '1') {
    console.warn(`${mensaje} Se saltea la comparación.`);
    process.exit(0);
  }
  console.error(mensaje);
  process.exit(1);
}

const archivos = readdirSync(origen)
  .filter((f) => f.endsWith('.ts'))
  .sort();
const locales = readdirSync(destino)
  .filter((f) => f.endsWith('.ts'))
  .sort();
const diferentes = archivos.filter(
  (f) =>
    !locales.includes(f) || !readFileSync(join(origen, f)).equals(readFileSync(join(destino, f))),
);
const sobrantes = locales.filter((f) => !archivos.includes(f));

if (revisar) {
  if (diferentes.length || sobrantes.length) {
    console.error(
      `Contrato desincronizado: ${[...diferentes, ...sobrantes].join(', ')}. Corré npm run contracts:sync.`,
    );
    process.exit(1);
  }
  console.log(`Contrato v1 sincronizado (${archivos.length} archivos).`);
} else {
  if (sobrantes.length)
    console.warn(`Archivos que ya no existen en el BE (borralos a mano): ${sobrantes.join(', ')}`);
  for (const f of diferentes) copyFileSync(join(origen, f), join(destino, f));
  console.log(`Copiados ${diferentes.length} de ${archivos.length} archivos del contrato.`);
}
