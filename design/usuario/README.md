# Diseño completo de la app del usuario (fuente del lienzo)

Lienzo publicado (privado, de Ignacio): <https://claude.ai/artifact/A4T5bqyE8WEiQkwD4ogDaZ>. Decisiones:
[`docs/diseno-usuario-deluxe.md`](../../docs/diseno-usuario-deluxe.md).

Es la misma forma de trabajo del especialista (`handyx-specialist-fe/design/deluxe`): generadores en Python que
escriben cada pantalla como `.dc.html` con estilos en línea (fáciles de pasar a Figma), piezas compartidas y chequeos
con Playwright y axe. **Es diseño, no código de la app**: nada de esto se importa desde `src/`.

```
design/usuario/
├── gen/
│   ├── piezas.py, piezas2.py   # copias de las piezas del especialista (4c8ebd2) (colores, íconos, tarjetas, chips, documento)
│   ├── piezas_u.py             # piezas del usuario: pestañas con HandIA al medio, cabecera, botones, campos,
│   │                           # ticket, fotos SVG, ciudad, casa isométrica, cámara, estados de HandIA
│   ├── fila_*.py               # una fila del lienzo por fase (A, I, P, C, S, O, M, H, T, G, X)
│   ├── textos_pantallas.py     # qué es cada pantalla (para los recorridos)
│   ├── descripciones.py        # arma descripciones.json: qué es y «cómo llegás» desde los botones reales
│   ├── recorridos.py           # 13 recorridos con las pantallas en miniatura, paso a paso (como el especialista)
│   ├── flujos_base.py          # dibujo de flujos (copiado del especialista; nodo amarillo = especialista)
│   ├── flujos.py               # 12 flujos, empezando por «Mapa de la app» → flujos.json
│   ├── revision_board.py       # tablero de revisión UX/UI (arriba del lienzo)
│   ├── lienzo.py               # arma project/canvas.json (revisión, flujos, filas)
│   ├── revisar.cjs             # axe + toques < 44 px + letra < 11 px + tapado por lo fijo + desbordes
│   └── foto.cjs                # capturas para revisar a ojo
└── project/                    # lo que se publica: canvas.json + 128 tableros .dc.html
```

## Regenerar y revisar

Desde `design/` (los generadores usan rutas relativas a esa carpeta):

```sh
for f in usuario/gen/fila_*.py; do python3 "$f"; done
python3 usuario/gen/descripciones.py && python3 usuario/gen/recorridos.py
python3 usuario/gen/flujos.py && python3 usuario/gen/revision_board.py && python3 usuario/gen/lienzo.py
node usuario/gen/revisar.cjs          # todas; o un prefijo: node usuario/gen/revisar.cjs X-
node usuario/gen/foto.cjs <carpeta> X-Pagos.dc.html FL-Mapa.dc.html
```

`revisar.cjs` usa `axe-core` y Playwright de este repo. Las imágenes de los Handys apuntan a `/_blob/…` del lienzo:
en las capturas locales se ven vacías, en el lienzo cargan.

## Reglas para tocar esto

- Datos sintéticos siempre: Lucía Ferreyra, `lucia@example.test`, `223 555-0100`, «Calle De Prueba 123 · La Perla»,
  especialistas ficticios (Julián Ortiz, Diego Herrera, Sofía Ruiz, Pablo Vega).
- Nada de `localStorage`, `sessionStorage`, IndexedDB ni `document.cookie` en las pantallas.
- Antes de publicar, `revisar.cjs` en 0 en todas las columnas.
