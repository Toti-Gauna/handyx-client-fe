# Sistema visual de Handyx (usuario) · Fase 3

Fuente de marca: `Handy-landing-page-fe` (`src/brand/tokens.ts`, `src/styles/demo-app.css`, `/demo/`). Esta app no inventa
otra marca: reusa logo, Archivo/DM Sans, Handys, íconos de línea, botones táctiles, mosaicos, marcador amarillo y barra azul.

## Tokens (`src/styles/tokens.css`)

Dos capas. Las pantallas y componentes usan **solo la capa semántica**; una prueba (`tests/diseno.test.ts`) falla si
aparece un color hex fuera de `tokens.css`.

| Grupo       | Tokens                                                                                       | Uso                                                                 |
| ----------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Superficies | `--sup-app`, `--sup-base`, `--sup-tarjeta`, `--sup-hundida`, `--sup-mosaico`, `--sup-marca`  | fondo de página, tarjeta, caja de condiciones, mosaicos, panel azul |
| Texto       | `--texto-titulo`, `--texto-cuerpo`, `--texto-suave` (5,3:1), `--texto-sobre-marca`           | jerarquía de lectura                                                |
| Acciones    | `--accion-primaria`, `--accion-destacada`, `--accion-neutra`, `--accion-peligro` (+ `-base`) | botones táctiles: color de cara y de base que se hunde              |
| Estados     | `--estado-{ok,alerta,error,info,neutro}` + `-fondo` + `-borde`                               | avisos y pastillas, siempre con texto e ícono                       |
| Importes    | `--importe-total`                                                                            | el total de cada bloque, en azul, con cifras tabulares              |
| Tipografía  | `--t-xs … --t-2xl`, `--peso-*`                                                               | escala 1,2                                                          |
| Espaciado   | `--esp-1 … --esp-8` (base 4)                                                                 |                                                                     |
| Elevación   | `--elev-1`, `--elev-2`, `--elev-tactil`                                                      | tarjetas, hojas, base de botones                                    |
| Íconos      | `--icono-sm/md/lg`, `--toque-min` (44 px)                                                    |                                                                     |
| Movimiento  | `--dur-rapida` (120 ms), `--dur-media` (220 ms), `--curva`                                   | se anulan con `prefers-reduced-motion`                              |

Contrastes medidos (WCAG 2.x): texto suave sobre blanco 5,3:1; blanco sobre azul 7,0:1; blanco sobre `--estado-ok` 6,5:1;
`--estado-ok` sobre su fondo 5,7:1; `--estado-alerta` sobre su fondo 5,4:1; `--accion-peligro` sobre blanco 6,5:1; etiquetas
inactivas de la barra 5,0:1 (antes 4,2:1). El verde y el rojo de marca no llegan a 4,5:1 con texto chico y quedan solo
como acento.

## Componentes

| Componente                                      | Dónde                                          | Regla                                                                                      |
| ----------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `Encabezado` (`Titulo.tsx`)                     | toda pantalla interna                          | botón de volver con destino fijo y nombre accesible ("Volver a…"), título y bajada         |
| `.boton-icono`                                  | cabecera (avisos) y volver                     | 48 × 48 px, táctil como en la demo; contador de avisos en amarillo                         |
| `PanelPrioridad` (inicio)                       | inicio                                         | **una** prioridad por vez: trabajo en curso › propuestas › pedido buscando › próximo turno |
| `Avatar`, `PerfilProfesional`, `Verificaciones` | propuestas, trabajo, hojas                     | iniciales (sin fotos en el contrato); verificaciones solo las que manda el backend         |
| `Desglose`                                      | detalle de propuesta, hoja de aceptar, trabajo | precio del especialista + tarifa de Handy (`usuarioBp`, calculada por el servidor) = total |
| `Condiciones`                                   | tarjeta y detalle de propuesta                 | horario y vigencia en una caja propia, separados del precio                                |
| `TarjetaPropuesta`                              | lista de propuestas y chat                     | total grande, desglose en una línea, condiciones, alcance; **no acepta ni rechaza**        |
| `.decision`                                     | detalle de propuesta                           | ver abajo                                                                                  |
| `Hoja` (con `handy` opcional)                   | confirmaciones                                 | la acción destructiva se confirma en rojo lleno; la ilustración ayuda a leer dos veces     |

## Jerarquía de una decisión (aceptar / rechazar)

1. **Qué se acepta**, antes que el botón: total, desglose, horario, vigencia y alcance.
2. **Rechazar** a la izquierda, **contorno rojo + cruz**. **Aceptar** a la derecha, **azul lleno + check**. Se distinguen
   por ícono, texto, relleno y posición, no solo por color, y los separa un hueco de 12 px.
3. Ninguno actúa directo: los dos abren una hoja de confirmación ("Sí, acepto estas condiciones" / "Sí, rechazar") con el
   resumen. El botón se deshabilita mientras se envía, y el reintento usa la misma clave de idempotencia.
4. Contrapropuesta y chat quedan debajo, como caminos alternativos, sin competir con la decisión.
5. La tarjeta de la lista nunca acepta: solo "Ver y responder".

## Comparación sin rankings

Las propuestas se listan **por llegada** ("No es una recomendación ni un ranking"). La tabla compara total, precio,
tarifa, horario, alcance, verificaciones y vigencia, sin destacar ninguna fila. No se usan "el mejor", "recomendado",
"más barato", "top", "matriculado" ni "verificado por Handy" (prueba en `tests/diseno.test.ts`). "Verificado" solo
aparece si `especialista.verificaciones` lo trae; si no, "Todavía sin verificaciones registradas".

## Responsive (lote 3.2)

| Ancho / forma                       | Diseño                                                                                                                        |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| < 768 px (360, 390)                 | columna completa, barra azul inferior                                                                                         |
| 768–1023 px (768, 820)              | columna de 600 px centrada; las hojas pasan a diálogo centrado (sin manija)                                                   |
| ≥ 1024 px                           | la barra pasa a ser una columna de navegación a la izquierda (232 px); contenido hasta 704 px; el rótulo de prueba no es fijo |
| Horizontal con poco alto (≤ 500 px) | barra compacta (ícono y texto en fila, 52 px), cabecera más baja, rótulo de prueba no fijo                                    |
| Texto del sistema al 200 %          | filas de datos, desglose y pestañas pasan a dos líneas; títulos cortan palabras con guion; nada se sale de la pantalla        |

El compositor del chat se apoya siempre sobre la barra (`--barra-alto`, que vale 0 en escritorio).

## Accesibilidad (lote 3.2)

- **Saltar al contenido**: primer foco de cada pantalla, visible solo con teclado.
- **Foco al navegar**: va al h1 de la pantalla nueva (también si todavía estaba cargando). Cada h1 pone el **título de la
  pestaña** ("Propuesta · Handyx"), que es lo que anuncia el anunciador de rutas de Next.
- **Hojas**: diálogos modales nativos (`showModal`); el foco arranca en el **título**, nunca en el botón de confirmar (un
  Enter apurado no acepta ni rechaza); Escape cierra y el foco vuelve al botón que la abrió; Tab no sale de la hoja.
- **Formularios**: al enviar con errores, el foco va al primer campo inválido; cada error está asociado con
  `aria-describedby` y se anuncia (`role="alert"`).
- **Estados**: las pastillas se leen "Estado: Pendiente"; Aceptar y Rechazar se describen con el resumen de la decisión
  (total y horario).
- **Objetivos táctiles ≥ 44 px** en todo control, incluidos desplegables, enlaces sueltos, días del calendario a 360 px y
  el panel de prueba. Los enlaces dentro de un párrafo son la excepción "en línea" de WCAG 2.5.8.
- **Calendario**: cada día se llama "20 · Viernes 20/11, con trabajos" (el número visible está en el nombre).
- **Abreviaturas**: "Aire acond." se lee "Aire acondicionado".
- **Movimiento reducido**: todas las transiciones y animaciones se anulan.

Auditoría: `tests/e2e/accesibilidad.cjs` (axe-core + chequeos propios) y `tests/e2e/teclado.cjs`. Resultados en `docs/qa.md`.

## Pendiente para el lote 3.3

- Movimiento funcional (aparición de propuestas, hoja), manifest e íconos, service worker y `/sin-conexion/`, capturas de
  todas las pantallas y estados.
- Lectores de pantalla y zoom reales en iOS/Android: en la prueba con dos celulares (lote 5.2).

Capturas del lote 3.1 (antes / después, 390 px, datos ficticios): `docs/screens/lote-3-1/`. Lote 3.2 (escritorio, tablet,
horizontal y hojas): `docs/screens/lote-3-2/`.
