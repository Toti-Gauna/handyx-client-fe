# HandIA · R2 · Tres direcciones (prototipo navegable)

Lote R2 de la fase R ([`handia-premium-plan.md`](handia-premium-plan.md)), a partir de
[R1](handia-r1-referentes.md). Ignacio pidió prototiparlo **dentro del proyecto** en lugar de Figma.

## Dónde verlo

- **`/diseno/handia/`** en la vista de prueba (`npm run dev` → `http://127.0.0.1:5175/diseno/handia/`, o en el
  despliegue de prueba de Hostinger cuando esté configurado). No existe en un build con API real.
- Tiene su propio grupo de rutas, `src/app/(prototipo)/`, sin el marco de la app, para ver los dos teléfonos lado a
  lado en escritorio; en el celular se apilan.
- Código: `src/components/handia-prototipo/` (maqueta + textos de ejemplo) y `src/styles/handia-prototipo.css`.
  Colores nuevos en `tokens.css`, sección 3 (`--hia-*`).

## Cómo se usa

1. Elegí una dirección arriba.
2. Cada dirección muestra **modo voz** (Lista, Escucha, Piensa, Habla, Encontró) y **chat** (Bienvenida, Pensando,
   Pregunta, Ficha, Riesgo). Se cambia de estado con las pastillas de abajo de cada teléfono o tocando adentro: el
   micrófono avanza la voz; una sugerencia arranca el chat, la respuesta llega sola y una opción muestra la ficha.
3. "Reproducir recorrido" pasa por todos los estados.

Es una maqueta: no conversa con el motor, no usa el micrófono ni guarda nada (lo fija `tests/handia-prototipo.test.ts`).

## Las tres direcciones

|             | A · Luz cálida                                         | B · Noche azul                                                   | C · Vidrio y brillo                                         |
| ----------- | ------------------------------------------------------ | ---------------------------------------------------------------- | ----------------------------------------------------------- |
| Idea        | La lamparita es la fuente de luz que calienta la noche | Oscura y precisa, la luz sube desde los controles                | Clara, manchas de color detrás de vidrio esmerilado         |
| Voz         | Azul noche + resplandor ámbar                          | Casi negro + brillo azul abajo, texto más grande, orbe más chico | Hielo y blanco, la lamparita dentro de una esfera de vidrio |
| Chat        | Papel cálido, burbujas crema, micrófono azul           | Oscuro también                                                   | Claro con degradé vivo y burbujas de vidrio                 |
| Se parece a | La landing (azul + amarillo)                           | Siri iOS 27, Gemini Live                                         | Airbnb 2025, "Liquid Glass"                                 |
| A favor     | La más propia de Handyx; cálida, de casa               | La más "tecnología cara"; se lee perfecto de noche               | La más fresca; el vidrio luce en fotos y redes              |
| En contra   | Menos sorpresa                                         | Se aleja del resto de la app (clara)                             | El vidrio cuesta más en gama baja (desenfoque)              |

Lo común a las tres (sale de R1 y no se negocia):

- **La lamparita es el orbe**: respira en reposo, late con el nivel al escuchar, un aro gira al pensar, la luz pulsa al
  hablar y suelta chispas cuando el pedido está listo. El estado también se dice con texto (nunca solo con movimiento
  o color).
- **Controles en una sola pastilla**: teclado, micrófono, cámara (llega en H5).
- **Transcripción grande** y la respuesta que se resalta palabra por palabra mientras se dice.
- **Pensando con pasos visibles** (Entendí → Rubro → Preguntas → Tu pedido).
- **"Por qué te lo pregunto"** debajo de cada pregunta; **ficha de vidrio** con editar; **riesgo primero** con el
  mismo texto que usa el motor.
- Botones de pedir sin animación; todo quieto con "reducir movimiento"; axe sin fallas en las tres (Playwright,
  1280 y 390 px).

## Mi recomendación

**A · Luz cálida**, con dos cosas de las otras: el texto grande y el brillo que sube desde los controles de **B** en
el modo voz, y las tarjetas de vidrio de **C** para la ficha. Es la que mejor dice "Handyx" (azul + amarillo, el
personaje como luz), no choca con el resto de la app clara y el desenfoque queda solo donde suma.

## Qué decide Ignacio

1. La dirección (A, B, C o la mezcla recomendada).
2. Si el chat de HandIA puede ser oscuro aunque el resto de la app sea claro (solo aplica a B).

Con eso sigue R3 (lenguaje visual como tokens y componentes) y R4 (todas las pantallas en alta, dentro del mismo
prototipo).
