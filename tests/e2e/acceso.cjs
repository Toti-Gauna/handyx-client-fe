// Pasos de acceso que comparten los scripts e2e: ingresar (email › contraseña), registrarse (invitación › email ›
// contraseña › textos › confirmar email simulado) y completar el perfil por pasos. Datos ficticios.

/** Ingresar en 2 pasos, desde /ingresar/ (o la pantalla que ya esté en el paso del email). */
async function ingresar(p, email = 'usuaria@example.test', clave = 'handyx-demo-1234') {
  await p.getByLabel('Email').fill(email);
  await p.getByRole('button', { name: 'Seguir' }).click();
  await p.getByLabel('Contraseña', { exact: true }).fill(clave);
  await p.getByRole('button', { name: 'Ingresar' }).click();
}

/**
 * Registro con la invitación de prueba hasta "¡Listo!". `enTextos(p)` corre en el paso de los textos antes de tildarlos
 * (para probar que sin aceptar no se crea la cuenta).
 */
async function registrarse(p, base, enTextos) {
  await p.goto(base + '/registro/', { waitUntil: 'networkidle' });
  await p.getByLabel('Código de invitación').fill('DEMO2026');
  await p.getByRole('button', { name: 'Seguir' }).click();
  await p.getByLabel('Email').fill('nueva@example.test');
  await p.getByRole('button', { name: 'Seguir' }).click();
  await p.getByLabel('Contraseña', { exact: true }).fill('una-contrasena-larga');
  await p.getByRole('button', { name: 'Seguir' }).click();
  if (enTextos) await enTextos(p);
  await p.getByLabel('Acepto los términos de uso').check();
  await p.getByLabel('Acepto la política de privacidad').check();
  await p.getByRole('button', { name: 'Crear cuenta' }).click();
  await p.getByRole('button', { name: 'Ya lo confirmé' }).click();
  await p.waitForURL('**/registro/listo/');
  await p.getByText('hasta el 10/12').first().waitFor();
}

/**
 * Perfil por pasos desde la pantalla actual (/perfil/). `ubicacion`: 'usar' (permiso puntual) o 'mano'. `antesDeTerminar`
 * corre en el paso de la dirección, ya completa.
 */
async function completarPerfil(p, { ubicacion = 'usar', antesDeTerminar, completar = true } = {}) {
  if (completar) {
    await p.getByLabel('Nombre', { exact: true }).fill('Persona');
    await p.getByLabel('Apellido').fill('Ficticia');
  }
  await p.getByRole('button', { name: 'Seguir' }).click();
  if (completar) {
    await p.getByLabel('Fecha de nacimiento').fill('1990-03-04');
    await p.getByLabel('Género').selectOption('mujer');
  }
  await p.getByRole('button', { name: 'Seguir' }).click();
  await p.getByRole('heading', { name: '¿Usamos tu ubicación?' }).waitFor();
  if (ubicacion === 'usar') await p.getByRole('button', { name: 'Usar mi ubicación' }).click();
  else await p.getByRole('button', { name: 'Escribirla a mano' }).click();
  await p.getByLabel('Dirección').waitFor();
  if (completar || !(await p.getByLabel('Dirección').inputValue()))
    await p.getByLabel('Dirección').fill('Calle Ficticia 123');
  if (antesDeTerminar) await antesDeTerminar(p);
  await p.getByRole('button', { name: /^(Terminar|Seguir)$/ }).click();
  // Pre-permiso de avisos: solo si el navegador todavía puede preguntar.
  const ahoraNo = p.getByRole('button', { name: 'Ahora no' });
  await Promise.race([
    p.waitForURL('**/inicio/**').catch(() => {}),
    ahoraNo.waitFor().catch(() => {}),
  ]);
  if (await ahoraNo.count()) await ahoraNo.click();
  await p.waitForURL('**/inicio/**');
}

module.exports = { ingresar, registrarse, completarPerfil };
