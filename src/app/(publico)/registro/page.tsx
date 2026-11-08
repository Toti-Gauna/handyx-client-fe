'use client';

import { FlujoCodigo } from '../ingresar/FlujoCodigo';

/**
 * «Crear cuenta» (alta directa, contrato draft.4): email y aceptación de los textos › código de 6 números. La cuenta
 * se crea al verificar el código; después siguen los datos mínimos (/perfil/). Sin invitación ni contraseña.
 */
export default function Registro() {
  return <FlujoCodigo modo="alta" />;
}
