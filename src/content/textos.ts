// Textos de la vista de prueba. Los legales son PROVISIONALES: el aviso definitivo lo aprueba Legal (LEG-19, LEG-29).
export const AVISO_LEGAL_PROVISORIO =
  'Texto provisorio de la vista de prueba: el definitivo lo aprueba Legal antes de abrir la demo.';

export const TEXTOS_LEGALES = {
  terminos: {
    titulo: 'Términos de uso',
    version: 'terminos-demo-2026-11',
    parrafos: [
      'Handyx conecta a vecinos de Mar del Plata con especialistas independientes del hogar. Handyx no presta los servicios ni asigna especialistas: vos elegís con quién trabajar.',
      'El precio lo pone el especialista y se acuerda con una propuesta que las dos partes aceptan. Nada cambia sin que la otra parte acepte.',
      'Durante la demo cerrada (del 10/11 al 10/12/2026) la tarifa de Handy es 0 %. El servicio del especialista se paga entero, directo a él, por Mercado Pago o en efectivo. Handy no recibe ni distribuye ese dinero.',
    ],
  },
  privacidad: {
    titulo: 'Política de privacidad',
    version: 'privacidad-demo-2026-11-v2',
    parrafos: [
      'Usamos tus datos para crear tu cuenta, mostrarte propuestas y coordinar el trabajo con el especialista que elijas.',
      'Pedimos tu ubicación solo cuando lo autorizás en ese momento, y nunca la seguimos en segundo plano.',
      'HandIA (asistente con inteligencia artificial) te ayuda a describir el problema y a elegir el rubro. Antes de enviarle un mensaje sacamos emails, teléfonos y números de documento; no recibe fotos, documentos ni los datos de tu cuenta, y lo que le escribís se usa solo para armar tu pedido.',
      'Podés pedir la eliminación real de tu cuenta desde Cuenta › Eliminar cuenta. Te mostramos el estado de la solicitud y qué datos se conservan por obligación legal.',
    ],
  },
} as const;

/** Centro de ayuda (rediseño 3.8, u-ayuda): cada respuesta tiene su id (va en la URL) y, si corresponde, a dónde ir. */
export interface Pregunta {
  readonly id: string;
  readonly p: string;
  readonly r: string;
  readonly ir?: { readonly href: string; readonly texto: string };
}

export const PREGUNTAS: readonly Pregunta[] = [
  {
    id: 'cancelar',
    p: '¿Cómo cancelo o cambio un turno?',
    r: 'Entrá a Actividad, abrí el trabajo y tocá «Cambiar turno o condiciones»: es una propuesta que el especialista tiene que aceptar. Si no lo necesitás más, desde el mismo trabajo podés cancelarlo.',
    ir: { href: '/agenda/', texto: 'Ir a la agenda' },
  },
  {
    id: 'tarifa',
    p: '¿Cuánto cobra Handy?',
    r: 'Durante la demo cerrada (hasta el 10/12) la tarifa de Handy es 0 %. Eso no es un descuento sobre el precio del especialista: su servicio se paga entero. Después del 10/12 no se aplica ninguna tarifa que no esté aprobada y avisada antes.',
    ir: { href: '/cuenta/tarifa/', texto: 'Ver tarifa y demo' },
  },
  {
    id: 'pagar',
    p: '¿Cómo le pago al especialista?',
    r: 'Directo a él, por Mercado Pago o en efectivo. Handy no recibe ni distribuye ese dinero. Cuando reportás un pago queda “reportado”; pasa a “verificado” cuando se confirma.',
    ir: { href: '/cuenta/pagos/', texto: 'Ver mis pagos' },
  },
  {
    id: 'confianza',
    p: '¿Cómo sé que es de confianza?',
    r: 'En el perfil de cada especialista ves sus rubros, su zona y solo las verificaciones que de verdad tiene: nunca mostramos “verificado” sin un dato real. Y vos decidís: no hay acuerdo hasta que aceptás una propuesta.',
  },
  {
    id: 'elegir',
    p: '¿Quién elige al especialista?',
    r: 'Vos. Recibís propuestas y aceptás, rechazás o contraofertás. No hay acuerdo hasta que las dos partes aceptan las mismas condiciones.',
  },
  {
    id: 'sin-respuesta',
    p: '¿Y si nadie responde mi pedido?',
    r: 'Podés relanzar la búsqueda o pedir una búsqueda manual al equipo de Handy. No podemos prometer un plazo ni inventar especialistas disponibles.',
  },
  {
    id: 'algo-mal',
    p: '¿Qué pasa si algo sale mal con un trabajo?',
    r: 'Abrí un reclamo desde el pedido o el trabajo, con una categoría, el detalle y fotos si hace falta. Vas a ver su estado y su historial.',
    ir: { href: '/reclamos/', texto: 'Ver mis reclamos' },
  },
  {
    id: 'borrar',
    p: '¿Puedo borrar mi cuenta?',
    r: 'Sí, de verdad: Cuenta › Eliminar cuenta. Si por obligación legal tenemos que conservar algún dato, te decimos cuál.',
    ir: { href: '/cuenta/baja/', texto: 'Eliminar cuenta' },
  },
  {
    id: 'instalar',
    p: '¿Puedo tener Handyx como app en el celular?',
    r: 'Sí. En Android, entrá a Cuenta y tocá "Instalar" (si tu navegador lo permite). En iPhone, abrí Handyx en Safari, tocá Compartir y después "Agregar a inicio". Sin conexión podés abrirla, pero nada se envía hasta que vuelva la señal.',
  },
];
