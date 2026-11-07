# HandIA · R1 · Referentes y diagnóstico

Lote R1 de la fase R ([`handia-premium-plan.md`](handia-premium-plan.md)). Qué hace que ChatGPT Voice, Gemini Live,
Siri y las apps de servicios premium se sientan "caras", qué le falta hoy a HandIA y qué se lleva a R2. Investigado el
7/11/2026. Las fuentes están al final; donde las notas de prensa se contradicen, se dice.

> Se toman **patrones**, no la apariencia de nadie: ni el orbe azul de OpenAI, ni la pastilla de Gemini, ni el
> brillo de Siri. Todo se resuelve con la marca de Handyx (azul, amarillo, Archivo + DM Sans y los Handys).

## 1. Referentes

### ChatGPT Voice (OpenAI)

- **Qué es hoy.** Desde el 25/11/2025 la voz vive **dentro del mismo chat**: lo hablado queda como texto en la
  conversación, con transcripción en vivo, y las respuestas pueden traer tarjetas (mapas, clima). La pantalla
  completa con el orbe azul quedó como opción ("Modo separado" en Ajustes).
- **El orbe** (2024): una esfera azul animada que "respira" y late mientras habla; reemplazó los puntos negros de la
  demo de mayo de 2024.
- **Conversación.** Se lo puede interrumpir hablando; los modelos nuevos de dúplex completo dan señales de escucha
  ("ajá", "sí") mientras la persona habla.
- **Qué lo hace caro.** Una sola forma viva en el centro que cambia con el estado (escucha, piensa, habla); casi
  nada de interfaz alrededor; pasar de voz a texto sin perder el hilo; respuestas que se leen mientras se dicen.

### Gemini Live (Google)

- **Qué es hoy.** En 2026 dejó la pantalla completa: Live **toma la portada de la app** con la barra "Live with
  Gemini", un botón de transcripción y, abajo, una **pastilla con la onda azul**: cámara y pantalla compartida a la
  izquierda, silenciar a la derecha. Hay una versión flotante para usar mientras se hace otra cosa.
- **Subtítulos.** Botón arriba a la derecha que muestra lo que responde (no lo que dice la persona). Las notas de
  prensa no coinciden en si el brillo azul desde el borde inferior sigue o fue reemplazado; una prueba de octubre
  cambia otra vez la animación de la onda.
- **Qué lo hace caro.** La cámara como parte natural de la charla ("mostrame"); controles agrupados en una sola pieza
  que se aprende una vez; poca tinta y mucha luz.

### Siri (Apple, iOS 27)

- **Qué es hoy.** Presentado el 8/6/2026: deja el borde de colores de iOS 18–26 y pasa a una interfaz **oscura que
  nace de la Dynamic Island**, con una animación tipo "bola de cristal" que se expande desde arriba. Se abre
  deslizando hacia abajo sobre la isla. Solo tema oscuro por ahora.
- **Qué lo hace caro.** Nace de un lugar fijo del sistema (no "abre una app"); la luz es el lenguaje (brillos sobre
  fondo oscuro); transición continua entre estar cerrado y estar escuchando; materiales con profundidad (vidrio,
  desenfoque).

### Apps de servicios premium

- **Thumbtack** (abril de 2026): se empieza **contando el problema** con texto, fotos o voz, sin elegir rubro antes;
  pantalla completa con fotos, **preguntas puntuales** y una lista corta de profesionales con **"por qué te
  sirve"** (experiencia, necesidad del proyecto, reseñas, disponibilidad). También integrada en Claude y ChatGPT.
- **Airbnb** (mayo de 2025): abandona el diseño plano: íconos 3D como emojis propios, curvas, todo más animado y
  "dimensional"; íconos que reaccionan (la casa abre la puerta y prende la luz al tocarla).
- **Qué los hace caros.** Personajes/objetos con volumen que reaccionan; el pedido se arma conversando y se ve
  armado (resumen claro); cada sugerencia explica por qué.

### Patrones comunes

| Patrón                               | ChatGPT            | Gemini       | Siri            | Servicios          | HandIA hoy                       |
| ------------------------------------ | ------------------ | ------------ | --------------- | ------------------ | -------------------------------- |
| Una forma viva que expresa el estado | Orbe               | Onda         | Bola de luz     | Íconos 3D          | Lamparita quieta con aros        |
| Voz y texto en el mismo hilo         | Sí (desde 11/2025) | Sí (portada) | —               | —                  | Pantalla aparte (portal)         |
| Transcripción en vivo                | Sí                 | Subtítulos   | —               | —                  | Texto parcial, sin resaltar      |
| Interrumpir                          | Hablando           | Tocando      | —               | —                  | Tocando el micrófono             |
| Cámara en la charla                  | Sí                 | Sí           | —               | Fotos al contar    | No (fase H5)                     |
| Controles en una sola pieza          | Barra              | Pastilla     | Isla            | —                  | Micrófono + botón arriba         |
| Luz y profundidad                    | Degradé del orbe   | Brillo azul  | Vidrio y brillo | Volumen            | Degradé plano                    |
| Explica el porqué                    | —                  | —            | —               | "Por qué te sirve" | La ficha muestra lo que entendió |
| Sonido / vibración                   | Tono al empezar    | Tono         | Háptica         | —                  | Ninguno                          |

## 2. Diagnóstico de HandIA (rama `handia-premium`, capturas del 7/11)

Lo bueno, y se conserva: el motor local (sugiere el rubro, pregunta lo justo, avisa riesgos primero), la ficha
editable, la voz solo en el dispositivo, el tachado de datos personales y la accesibilidad (axe sin fallas, Escape,
foco).

Lo que no se ve caro todavía:

1. **Voz sin vida.** La lamparita es una imagen quieta con aros; no cambia entre escuchar, pensar y hablar. El estado
   se dice con un rótulo en mayúsculas ("HABLANDO · TOCÁ EL MICRÓFONO…"), que es la señal más pobre de las cuatro.
2. **Fondo plano.** Un degradé azul uniforme, sin luz que salga del personaje ni profundidad.
3. **Dos mundos.** Voz y chat son pantallas distintas: al volver al chat, lo hablado no se siente parte del hilo.
4. **Sin "pensando".** Las respuestas aparecen de golpe; no hay indicación de que está entendiendo ni pasos visibles
   (lo que hace sentir "nivel Claude Code": ver qué está haciendo).
5. **Chat de formulario.** Burbujas planas, cabecera alta que tapa mensajes, la ficha compite con los botones de
   abajo (en 390 px el botón "Programar turno" se apoya sobre el cuadro de texto).
6. **Primera pantalla sin promesa.** No hay bienvenida con el personaje ni ejemplos que inviten a hablar.
7. **Sin sonido ni vibración** al empezar y terminar de escuchar.
8. **Una sola entrada** (Inicio → HandIA); ninguna desde Pedir, Actividad o Ayuda.

## 3. Lo que se lleva a R2 (y a qué fase)

| #   | Decisión de diseño                                                                                                | Referente                    | Fase         |
| --- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------ |
| 1   | La lamparita **es** el orbe: su luz cambia con el estado (respira, escucha con el nivel, piensa, habla, encontró) | ChatGPT, Siri                | R2–R5, H1–H2 |
| 2   | Voz y chat en el mismo hilo; la voz es un modo de la conversación, no otra pantalla                               | ChatGPT 11/2025, Gemini 2026 | H2–H3        |
| 3   | Transcripción en vivo grande, con la respuesta resaltándose mientras se dice                                      | ChatGPT, Gemini              | H2           |
| 4   | Controles en una sola pastilla abajo: micrófono, teclado, cámara (H5), salir                                      | Gemini                       | R4, H2       |
| 5   | "Pensando" con pasos visibles (entendiendo → rubro → preguntas → ficha)                                           | Claude Code                  | H3           |
| 6   | Ficha como tarjeta de vidrio con "por qué te lo pregunto" y lo que entendió                                       | Thumbtack                    | H3           |
| 7   | Riesgo primero: tarjeta propia, con ícono y texto, antes que cualquier pregunta                                   | Ya en el motor               | R4           |
| 8   | Luz y profundidad con CSS liviano (degradés, halos, vidrio), sin imágenes pesadas                                 | Siri, Airbnb                 | R3, R8       |
| 9   | Tono suave al empezar/terminar de escuchar y vibración corta (opcionales, quietos con "reducir movimiento")       | Gemini, Siri                 | R5           |
| 10  | Bienvenida con el personaje y ejemplos tocables                                                                   | Thumbtack                    | R4, R6       |

Lo que **no** se copia: la voz de nadie, la "escucha" en segundo plano, el envío de audio a servidores (la regla de
voz en el dispositivo sigue), prometer tiempos o rankings ("el mejor").

## 4. Prototipo

Ignacio eligió prototipar dentro del proyecto (no en Figma). R2 está en **`/diseno/handia/`** (solo vista de
prueba): tres direcciones, cada una con la pantalla de voz y la de chat en todos sus estados, para elegir desde el
celular. Ver [`handia-r2-direcciones.md`](handia-r2-direcciones.md).

## Fuentes

- OpenAI · voz dentro del chat: [MacRumors](https://www.macrumors.com/2025/11/26/chatgpt-voice-mode-update-seamless-chat/),
  [Android Authority](https://www.androidauthority.com/chatgpt-voice-mode-in-chat-3619633),
  [Engadget](https://www.engadget.com/ai/now-you-can-use-chatgpt-voice-without-leaving-your-chat-195000538.html),
  [TechRadar](https://www.techradar.com/ai-platforms-assistants/chatgpt/chatgpts-new-voice-integration-feels-like-the-missing-piece-in-ai-chat-ive-tried-it-and-its-almost-perfect).
- OpenAI · orbe azul: [TechCrunch](https://techcrunch.com/2024/09/24/openai-rolls-out-advanced-voice-mode-with-more-voices-and-a-new-look);
  dúplex: [Mezha](https://mezha.ua/en/news/gpt-live-1-voice-mode-313064/).
- Gemini Live: [9to5Google (abril 2026)](https://9to5google.com/2026/04/19/gemini-live-app-redesign/),
  [9to5Google (flotante)](https://9to5google.com/2026/02/02/gemini-live-floating-redesign/),
  [Android Authority](https://androidauthority.com/gemini-live-redesign-apk-teardown-3721755),
  [Android Headlines · subtítulos](https://www.androidheadlines.com/2025/06/googles-gemini-live-gets-captions-for-every-conversation-anywhere.html).
- Siri iOS 27: [MacRumors · colores oscuros](https://macrumors.com/2026/05/26/ios-27-siri-dark-colors/),
  [9to5Mac](https://9to5mac.com/2026/04/19/apple-has-already-teased-siris-new-design-coming-in-ios-27/),
  [Tom's Guide](https://www.tomsguide.com/phones/iphones/ios-27-is-official-all-the-new-upgrades-and-features-announced-at-wwdc-2026).
- Thumbtack: [Business Wire](https://www.businesswire.com/news/home/20260430186888/en/),
  [Thumbtack](https://www.thumbtack.com/guide/content/a-first-look-at-our-new-ai-powered-experience).
- Airbnb: [Bloomberg](https://www.bloomberg.com/news/articles/2025-06-13/apple-airbnb-ditch-flat-app-icons-for-new-3d-ui-design),
  [It's Nice That](https://www.itsnicethat.com/articles/airbnb-app-redesign-140525).

Nota: desde esta sesión no se pudieron abrir las notas completas de 9to5Google ni de Thumbtack (la red del entorno
no las permite); lo citado sale de los resúmenes de búsqueda y de las otras notas.
