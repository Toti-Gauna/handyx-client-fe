// Genera docs/screens/matriz.md desde src/mapa (pantallas y escenarios) y el contrato v1.
// `--check` falla si quedó desactualizado. Uso: npm run mapa [-- --check]
import { readFileSync, writeFileSync } from 'node:fs';
import { ENDPOINTS } from '../src/contracts/v1/endpoints.ts';
import { ESCENARIOS } from '../src/mapa/escenarios.ts';
import { PANTALLAS } from '../src/mapa/pantallas.ts';

const destino = new URL('../docs/screens/matriz.md', import.meta.url);
const celda = (valores: readonly string[]) =>
  (valores.length ? valores.join('<br>') : '—').replace(/\|/g, '\\|');
const api = (ids: readonly string[]) =>
  ids.map((id) => {
    const ep = ENDPOINTS.find((e) => e.id === id);
    return ep ? `\`${ep.metodo} ${ep.ruta}\`` : `⚠ ${id}`;
  });

const lineas = [
  '<!-- Generado por `npm run mapa` desde src/mapa/*.ts y src/contracts/v1. No editar a mano. -->',
  '',
  '# Matriz pantalla → acción → estado → API → entidad → prueba',
  '',
  `${PANTALLAS.length} pantallas/modales · ${ENDPOINTS.length} endpoints del contrato v1 · ${ESCENARIOS.length} escenarios mock.`,
  'Entidades: nombres lógicos de TECH-03 (diccionario en handyx-client-be/docs/data-model.md).',
  '',
];

for (const grupo of [...new Set(PANTALLAS.map((p) => p.grupo))]) {
  lineas.push(`## ${grupo[0]?.toUpperCase()}${grupo.slice(1)}`, '');
  lineas.push('| Pantalla | Ruta | Lote | Acciones | Estados | API | Entidades | Pruebas |');
  lineas.push('| --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const p of PANTALLAS.filter((x) => x.grupo === grupo)) {
    const ruta = `\`${p.ruta}${p.consulta?.length ? `?${p.consulta.join('&')}` : ''}\`${p.tipo === 'modal' ? ' (modal)' : ''}`;
    lineas.push(
      `| **${p.titulo}**${p.demo ? `<br><sub>demo: ${p.demo.join(', ')}</sub>` : ''} | ${ruta} | ${p.lote} | ${celda(p.acciones)} | ${celda(p.estados)} | ${celda(api(p.endpoints))} | ${celda(p.entidades)} | ${celda(p.pruebas)} |`,
    );
  }
  lineas.push('');
}

lineas.push(
  '## Escenarios obligatorios del mock',
  '',
  '| # | Escenario | Lote | Pantallas | Resultado esperado |',
  '| --- | --- | --- | --- | --- |',
);
ESCENARIOS.forEach((e, i) =>
  lineas.push(
    `| ${i + 1} | ${e.titulo} (\`${e.id}\`) | ${e.lote} | ${e.pantallas.join(', ')} | ${e.esperado} |`,
  ),
);

const sinPantalla = ENDPOINTS.filter((e) => !PANTALLAS.some((p) => p.endpoints.includes(e.id)));
lineas.push(
  '',
  '## Endpoints sin pantalla',
  '',
  sinPantalla.length
    ? sinPantalla.map((e) => `- \`${e.metodo} ${e.ruta}\` (${e.id})`).join('\n')
    : 'Ninguno: cada endpoint del contrato tiene al menos una pantalla.',
  '',
);

const texto = `${lineas.join('\n')}`;
if (process.argv.includes('--check')) {
  if (readFileSync(destino, 'utf8') !== texto) {
    console.error('docs/screens/matriz.md está desactualizado: corré `npm run mapa`.');
    process.exit(1);
  }
} else writeFileSync(destino, texto);
