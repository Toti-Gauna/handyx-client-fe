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

## Pendiente para los lotes 3.2 y 3.3

- 3.2: auditoría con lector de pantalla y teclado, axe automatizado, 820 px y orientación horizontal, tamaños de texto
  del sistema (200 %).
- 3.3: movimiento funcional (aparición de propuestas, hoja), manifest e íconos, service worker y `/sin-conexion/`,
  capturas de todas las pantallas y estados.

Capturas del lote 3.1 (antes / después, 390 px, datos ficticios): `docs/screens/lote-3-1/`.
