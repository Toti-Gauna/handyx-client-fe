// Sistema de diseño atómico de la app del usuario (lienzo: design/usuario; estilos: src/styles/ds.css).
// Átomos → moléculas → organismos → escenas. Las pantallas importan desde acá y nunca redefinen estas piezas.
export * from './atomos';
export * from './moleculas';
export * from './organismos';
export * from './escenas';
// Piezas de los grupos de la Fase 7 sin nombres repetidos. acceso, hogar y mensajes se importan directo
// (`@/ui/acceso`, `@/ui/hogar`, `@/ui/mensajes`): los tres exportan su propio `Segmentos`.
export * from './inicio';
export * from './pedir';
export * from './seguimiento';
export * from './herramientas';
