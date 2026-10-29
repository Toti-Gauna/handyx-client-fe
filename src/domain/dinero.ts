// Montos en centavos enteros (contrato v1). Solo se formatean: nunca se calcula plata con floats en el cliente;
// las sumas y la comisión de Handy las devuelve el servidor.

const miles = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0, useGrouping: true });

/** 4500000 → "$ 45.000"; 4500050 → "$ 45.000,50". Formato de la landing, siempre pesos argentinos. */
export function pesos(centavos: number): string {
  if (!Number.isSafeInteger(centavos) || centavos < 0)
    throw new Error('Importe inválido: tienen que ser centavos enteros');
  const enteros = Math.trunc(centavos / 100);
  const resto = centavos % 100;
  return `$ ${miles.format(enteros)}${resto ? `,${String(resto).padStart(2, '0')}` : ''}`;
}

/** Puntos básicos → "0 %", "5 %", "2,5 %". */
export function porcentaje(bp: number): string {
  if (!Number.isInteger(bp) || bp < 0 || bp > 10000) throw new Error('Porcentaje inválido');
  const enteros = Math.trunc(bp / 100);
  const resto = bp % 100;
  return `${enteros}${resto ? `,${String(resto).padStart(2, '0').replace(/0$/, '')}` : ''} %`;
}
