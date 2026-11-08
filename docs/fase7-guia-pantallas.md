# Guía para construir las pantallas de la Fase 7

Fuente de diseño: el lienzo `design/usuario/` (cada pantalla es un generador Python legible en
`design/usuario/gen/fila_*.py`; las capturas se regeneran con `node design/usuario/gen/foto.cjs`). Decisiones:
`docs/diseno-usuario-deluxe.md`. Plan: `docs/plan-olas.md`.

## Principio rector: que la pueda usar una persona de 90 años

Pedido de Ignacio (08/11): cada parte de la app tiene que ser **totalmente accesible y nada engorrosa**.

- **Una decisión por pantalla.** Un solo botón principal, grande (`Boton` mide 56 px), con un verbo claro
  («Publicar el pedido», «Aceptar a Julián»). Lo secundario, en contorno y debajo.
- **Letra grande y en rem** (respeta el tamaño que eligió la persona en el teléfono): cuerpo de 15–16 px como mínimo,
  nada por debajo de 12 px (11 px solo en etiquetas en mayúsculas).
- **Palabras simples, voseo, frases cortas.** Nada de siglas ni jerga. Lo que va a pasar, dicho antes de que pase.
- **Toques de 44 px o más**, separados; nada que dependa solo del color (siempre ícono + texto).
- **Volver siempre visible** (barra compacta con flecha) y deshacer o cancelar a mano en todo lo que importa.
- **Nada se mueve solo** si la persona pidió reducir el movimiento (`prefers-reduced-motion`); los botones de aceptar y
  pagar nunca se animan.
- **Ilustraciones propias en SVG en cada pantalla que lo merezca** (edificios de Mar del Plata, la casa, el arreglo):
  por ejemplo, al publicar un pedido la escena «construye» el arreglo; al terminar, la casa queda con su sello.
  Las escenas viven en `src/ui/escenas.tsx`; si hace falta una nueva, se suma ahí (decorativa: `aria-hidden`).

## Cómo se construye una pantalla

1. **Componentes**: solo los de `src/ui` (sistema atómico: átomos → moléculas → organismos → escenas, estilos en
   `src/styles/ds.css`) y, para el armazón, `Pantalla`/`Barra` de `src/components/hx.tsx`, `Hoja` y `Campo` de
   `src/components/ui.tsx`, `Enlace`/`ruta`/`useIr` de `src/components/nav.tsx`. No se crean estilos sueltos: si falta
   una pieza, se agrega al sistema (átomo o molécula) y se reutiliza.
2. **Datos**: solo `cliente` de `src/data` vía `useConsulta`/`useEnvio` (`src/data/hooks.ts`). Nunca `fetch`, nunca
   fixtures. El contrato `draft.4` está en `src/contracts/v1/` (no se edita: es copia del BE). El servidor simulado ya
   responde todos los endpoints nuevos (`src/data/mock/draft4.ts`, código de prueba `246810`).
3. **Mapa**: cada pantalla nueva o rediseñada va en `src/mapa/fase7/<grupo>.ts` con `p({ ... lote: '7' })`
   (mismo id que una pantalla base = la reemplaza). Rutas con barra final; ids por query (`?id=`), nunca `[id]`.
4. **Reglas del producto** (AGENTS.md): datos ficticios, fee 0 % hasta el 10/12/2026, pago directo al especialista,
   informado ≠ verificado, sin ETA salvo el viaje del servidor, «verificado» solo con dato real, HandIA sin datos
   personales ni IA externa, nada en localStorage/sessionStorage/IndexedDB/cookies propias.
5. **React Compiler**: sin `setState` sincrónico en efectos, sin leer/escribir refs en el render, sin `Date.now()` en el
   render.
6. **Pruebas**: lógica nueva (cálculos, reglas) con prueba en `tests/fase7-<grupo>.test.ts`. Revisar a mano en
   `http://127.0.0.1:5175/<ruta>?escenario=varias-propuestas` (vista de prueba; la cuenta ficticia entra sola con
   el escenario).
