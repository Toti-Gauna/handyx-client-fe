# Plan · HandIA premium (voz, chat, cámara e IA real)

Pedido de Ignacio (07/11/2026): que HandIA sea **súper premium, "deluxe"**, que parezca que vale mucho dinero. El
**modo voz** tiene que sentirse como ChatGPT Voice pero con los personajes de Handyx (degradé de fondo, animaciones con
GSAP, imágenes de estados hechas con ChatGPT y, si suma, 3D con Meshy). El **chat** también tiene que ser muy premium y
**toda la demo se tiene que poder probar escribiendo**. Al final se integra **OpenAI** (razonamiento, con saldo) y
**ElevenLabs** (voz), se suma la **cámara** para sacarle foto al problema y HandIA **busca presupuestos recorriendo toda
la app** por la persona.

Rama de trabajo: `handia-premium` (sale de `fase-3-diseno`, no dispara el deploy). Base ya hecha (commit `4a96774`):
motor de conversación en el celular, ficha editable, avisos de riesgo, modo voz local, pruebas y accesibilidad 299/299.

## Principios (no se negocian)

1. **Todo se prueba en la demo sin gastar nada.** Cada fase deja la vista de prueba funcionando de punta a punta con el
   motor local y la voz del celular. Las integraciones pagas se enchufan al final, detrás de un interruptor, y si fallan
   HandIA sigue andando con el motor local.
2. **La persona decide.** HandIA sugiere, arma y explica; publicar un pedido, aceptar una propuesta, pagar o escribirle a
   un especialista siempre lo confirma la persona (deslizar o botón). Nada se manda solo a terceros.
3. **Privacidad primero.** Hoy rige: sin datos personales, fotos ni voz hacia una IA externa. Las fases 6 y 7 cambian
   eso **solo con autorización explícita de Ignacio**, consentimiento dentro de la app y revisión legal (Ley 25.326).
   Hasta entonces la cámara adjunta fotos al pedido (como ahora) y la voz es local.
4. **Sin promesas de tiempo ni de precio.** HandIA no estima cuánto sale ni cuándo llega nadie: los precios son los de
   las propuestas reales; los tiempos, los del viaje en vivo del servidor.
5. **Premium también es rápido y accesible.** 60 fps en un Android de gama media, animaciones que respetan "reducir
   movimiento", subtítulos siempre, todo usable con lector de pantalla y teclado.

## Fases

| Fase | Qué                                                       | Resultado que se puede probar                                               | Modelo · esfuerzo | Depende de                    |
| ---- | --------------------------------------------------------- | --------------------------------------------------------------------------- | ----------------- | ----------------------------- |
| H0   | Base y decisiones                                         | Rama al día, decisiones de Ignacio anotadas                                 | Opus 5.5 · high   | —                             |
| H1   | Dirección de arte y personajes (imágenes, 3D opcional)    | Galería de estados de HandIA en `/diseno/`, degradés y movimiento aprobados | Opus 5.5 · high   | Imágenes de ChatGPT (Ignacio) |
| H2   | Modo voz estilo ChatGPT Voice                             | Pantalla de voz deluxe en la demo, reacciona a tu voz, subtítulos           | Opus 5.5 · high   | H1                            |
| H3   | Chat premium                                              | Chat con "pensando" visible, respuestas que se escriben, tarjetas ricas     | Opus 5.5 · high   | H1                            |
| H4   | HandIA agente: arma y publica el pedido, sigue propuestas | Demo completa escribiendo: de "se tapó la pileta" a elegir propuesta        | Opus 5.5 · high   | H3                            |
| H5   | Cámara                                                    | Sacar foto al problema, limpiarla (sin GPS) y sumarla; análisis simulado    | Opus 5.5 · high   | H3                            |
| H6   | Backend de IA (OpenAI + ElevenLabs) preparado             | Endpoints en `handyx-client-be` con simuladores, topes de costo y apagado   | Opus 5.5 · high   | Decisiones de H0              |
| H7   | Integración real y lanzamiento                            | Staging con OpenAI y ElevenLabs reales, consentimiento, QA en celulares     | Opus 5.5 · high   | Saldo y claves (Ignacio)      |

### H0 · Base y decisiones

- Cerrar la rama actual (hecho: `4a96774`).
- Anotar las decisiones de Ignacio (ver **Decisiones pendientes** al final). Las de diseño (H1–H5) no frenan nada; las
  de IA externa (H6–H7) frenan solo esas fases.

### H1 · Dirección de arte y personajes

**Objetivo:** que HandIA tenga una "actuación" propia: cada momento de la conversación tiene su pose, su color y su
movimiento.

- **Estados del personaje** (HandIA = la lamparita; los demás Handys aparecen como "ayudantes" por rubro):

  | Estado       | Cuándo                                 | Pose                                               | Degradé de fondo               |
  | ------------ | -------------------------------------- | -------------------------------------------------- | ------------------------------ |
  | `saludo`     | Al abrir                               | Saluda con la mano, sonrisa                        | Azul Handyx → noche            |
  | `escuchando` | La persona habla                       | Mano en la "oreja", ojos atentos, se inclina       | Azul → celeste, pulso suave    |
  | `pensando`   | Procesa                                | Mano en el mentón, foquito que titila, mira arriba | Azul → violeta                 |
  | `buscando`   | Busca rubro, especialistas, propuestas | Con lupa, mirando a un costado                     | Azul → turquesa, barrido       |
  | `encontro`   | Hay rubro, propuesta o respuesta       | Salta, brilla, guiño                               | Amarillo Handyx → azul         |
  | `enviando`   | Entrega la respuesta o la ficha        | Extiende una tarjeta/sobre hacia la cámara         | Azul → amarillo                |
  | `hablando`   | Lee en voz alta                        | 3 bocas (cerrada, media, abierta) para sincronizar | Azul con brillo que late       |
  | `no_entendi` | No hay pistas                          | Cabeza ladeada, signo de pregunta                  | Azul apagado                   |
  | `alerta`     | Riesgo (gas, electricidad, agua)       | Seria, mano en alto "pará", señal de advertencia   | Ámbar → azul noche             |
  | `camara`     | Va a sacar una foto                    | Sostiene una cámara, apunta                        | Azul → blanco                  |
  | `listo`      | Pedido publicado                       | Festeja con los otros Handys                       | Amarillo → azul, confeti sutil |

- **Imágenes con ChatGPT** (las genera Ignacio; brief abajo en **Brief para ChatGPT**). Se reciben en PNG transparente
  y se optimizan a WebP/AVIF en `public/img/handia/` (≤ 60 KB cada una), con procedencia anotada en
  `docs/inventario.md`.
- **Movimiento con GSAP** (licencia gratuita, también para uso comercial): transición entre poses (cruce + leve escala
  y rotación con resorte), "respiración" en reposo, parpadeo, halo que late con la voz. GSAP se carga **solo en HandIA**
  (import dinámico), así no pesa en el resto de la app.
- **Degradés vivos**: fondo de 2–3 colores que se desplaza lento (CSS + GSAP), cambia de paleta por estado en 600 ms.
- **3D con Meshy (opcional, se decide con un prototipo):** HandIA en 3D (GLB ≤ 1,5 MB, con rig para "respirar",
  "hablar" y "saludar") dibujado con three.js solo en celulares que lo aguanten; si no, la versión 2D. Se aprueba si en
  un Android de gama media mantiene 60 fps y la carga total de HandIA no pasa de ~600 KB extra.
- **Entregable:** galería `/diseno/#handia` con todos los estados, degradés y transiciones para aprobar antes de H2.

### H2 · Modo voz estilo ChatGPT Voice

**Objetivo:** la pantalla de voz más linda de la app: pantalla completa, degradé vivo, HandIA en el centro dentro de un
"orbe" de luz, controles mínimos abajo.

- **Orbe reactivo:** el halo y el personaje responden al volumen de tu voz (micrófono analizado **en el celular** con Web
  Audio: solo el nivel, nada se graba ni se manda) y, al hablar HandIA, al ritmo de su voz (con la voz del sistema se
  simula; con ElevenLabs se analiza el audio real).
- **Coreografía:** escuchando → pensando → buscando → encontró → enviando/hablando, con las poses de H1. El fondo cambia
  de paleta con cada momento.
- **Interacciones:** tocar para hablar o "manos libres", mantener apretado para dictar largo, tocar para interrumpir,
  deslizar abajo para volver al chat, vibración suave en Android al empezar y terminar de escuchar.
- **Subtítulos en vivo** de lo que decís y de lo que responde, con las opciones como botones grandes.
- **Sonidos sutiles** (inicio y fin de escucha), originales y silenciables.
- **Rendimiento y accesibilidad:** 60 fps, "reducir movimiento" deja todo quieto con cambios de color suaves, foco y
  lector de pantalla correctos.
- **Pruebas:** e2e con voz simulada (ya existe), capturas de cada estado, medición de fps con trazas de Chromium.

### H3 · Chat premium

**Objetivo:** que escribirle a HandIA se sienta como un asistente de primer nivel.

- **"Pensando" visible** al estilo de los asistentes con razonamiento: una línea con el personaje chico y pasos
  ("Leyendo lo que contaste…", "Buscando el rubro…", "Armando el pedido…") que se tachan al terminar.
- **Respuestas que se escriben** (streaming simulado palabra por palabra, como lo hará la IA real), con "Detener".
- **Tarjetas ricas** dentro del chat: rubro detectado con su Handy, preguntas como chips, aviso de riesgo, ficha del
  pedido editable, propuestas recibidas (H4), fotos (H5).
- **Composer premium:** campo que crece, adjuntar foto, micrófono, sugerencias según el momento.
- **Editar el último mensaje** y "empezar de nuevo"; historial de la conversación en memoria (no se guarda en el
  navegador).
- **Escenarios de demo** (`?escenario=handia-…`): pileta tapada, olor a gas, me quedé afuera, humedad, aire que no
  enfría; para mostrar a inversores o probar rápido.

### H4 · HandIA agente: arma, publica y sigue el pedido

**Objetivo:** "buscá presupuesto por mí": HandIA recorre la app por la persona, siempre con su confirmación.

- **Herramientas** (en la demo, contra el servidor simulado; después, en el BE con la sesión de la persona):
  `armarPedido` (rubro, descripción, urgente o día y franja), `elegirDireccion` (de las guardadas),
  `sumarFotos`, `publicarPedido` (**con confirmación deslizando**), `verPropuestas`, `compararPropuestas` (explica
  precio total, horario, reseñas y qué incluye, sin recomendar a ciegas), `abrirPropuesta`, `prepararMensaje` (lo manda
  la persona).
- **Nunca solo:** no acepta propuestas ni paga ni escribe a especialistas por su cuenta; muestra el botón de siempre.
- **Seguimiento:** "Te llegaron 3 propuestas" dentro de HandIA, con la tarjeta de comparación.
- **Reglas** primero en `docs/state-machines.md` del BE y en `tests/servidor-mock.test.ts` (regla del repo).

### H5 · Cámara

**Objetivo:** sacarle foto al problema desde HandIA.

- Visor propio a pantalla completa (o la cámara del sistema), con guía "apuntá al problema", flash y cambio de cámara.
- **Limpieza en el celular** antes de usarla: se re-codifica sin metadatos (sin GPS ni modelo de celular), se reduce a
  1600 px y se avisa si aparece una persona o un documento.
- **Hasta H7:** la foto se suma al pedido (como hoy) y en la demo HandIA muestra un **análisis simulado** ("Veo una
  pileta con agua estancada…") para probar la experiencia. Con IA real, ver H6/H7.

### H6 · Backend de IA preparado (sin gastar)

**Objetivo:** dejar todo listo en `handyx-client-be` para enchufar OpenAI y ElevenLabs con un interruptor.

- **Contrato** `handia` (sube `VERSION_CONTRATO`): mensajes por **SSE en streaming**, voz (texto → audio y audio →
  texto), fotos para análisis; esquemas Zod y OpenAPI.
- **OpenAI (razonamiento):** API de respuestas con el modelo de razonamiento vigente al integrar (se elige midiendo
  calidad y costo), con las herramientas de H4 ejecutadas **del lado del servidor** con la sesión de la persona;
  `store: false`; sin datos personales (tachado en el servidor también); límites de longitud.
- **ElevenLabs (voz):** texto a voz en streaming con una voz rioplatense elegida (o diseñada) para HandIA; voz a texto
  con su modelo de transcripción o el de OpenAI. Audio solo en memoria, nunca guardado.
- **Costos y "saldo":** tope por cuenta por día, tope global por mes, corte automático al llegar al tope, métricas de
  uso sin contenido; si se corta, vuelve el motor local sin que la persona note un error.
- **Seguridad:** claves solo en el entorno privado del BE; rate limit; registro sin contenidos; interruptor de apagado.
- **Pruebas:** con simuladores de OpenAI y ElevenLabs (sin red), incluidas fallas, cortes y topes.

### H7 · Integración real y lanzamiento (con autorización)

- **Antes:** autorización de Ignacio para crear/usar las cuentas y cargar saldo; revisión legal; política de privacidad
  y consentimiento en la app ("Para entender tu voz y tus fotos usamos servicios de terceros…", aceptar o seguir con la
  versión local).
- Staging con claves reales y topes bajos; medir costo por conversación, latencia (meta: respuesta hablada en < 1,5 s)
  y calidad con un set de casos de prueba sintéticos.
- QA en iPhone (Safari) y Android (Chrome): en iPhone, la voz en la nube (con consentimiento) habilita escuchar, que hoy
  no se puede sin mandar el audio afuera.
- Lanzamiento gradual (primero la demo cerrada), con el interruptor para volver al motor local.

## Brief para ChatGPT (imágenes de HandIA)

Adjuntar como referencia `public/img/handy-lamparita.webp` (y `handys-grupo.webp` para los otros). Pedir **una imagen por
estado**, todas con:

- **Mismo personaje y estilo:** la lamparita de Handyx, dibujo plano con contorno suave, vidrio amarillo claro (#F5F59A)
  con borde amarillo más intenso, ojos negros redondos con brillo, base gris **opaca** con vendas (sin huecos
  transparentes: ya hubo que arreglar la base del dibujo original), patitas y bracitos finos.
- **Mismo encuadre:** cuerpo entero centrado, mismo tamaño en todas, 1024 × 1024 px, **fondo transparente (PNG)**, sin
  sombra en el piso, sin texto ni letras.
- **Sin elementos de otras marcas.**

Prompt base (cambiar la parte de la pose):

> "Ilustración del personaje de la imagen de referencia (la lamparita de Handyx), mismo estilo plano y mismos colores,
> cuerpo entero, centrado, fondo transparente, 1024x1024, sin texto. Pose: **[pose del estado]**."

Poses: saludando con una mano y sonriendo · con una mano en la oreja escuchando atento, inclinado hacia adelante ·
pensando con una mano en el mentón, mirando hacia arriba, con rayitos de luz titilando · buscando con una lupa grande
· saltando de alegría con brillo alrededor · entregando una tarjeta con las dos manos hacia el frente · hablando
(tres versiones: boca cerrada, entreabierta, abierta) · confundido con la cabeza ladeada y un signo de pregunta ·
serio con una mano en alto como diciendo "pará", con una señal de advertencia · sosteniendo una cámara de fotos ·
festejando con los brazos arriba y confeti.

Opcional para el 3D (Meshy): una vista de frente y una de perfil del personaje en pose "A" (brazos abiertos), mismo
estilo, fondo liso, para generar el modelo.

## Decisiones pendientes (Ignacio)

1. **Imágenes:** ¿las genera Ignacio con el brief de arriba? (bloquea H1).
2. **3D:** ¿probamos el prototipo con Meshy o arrancamos solo 2D + GSAP? (recomendado: 2D primero, 3D como prueba).
3. **IA externa:** cambiar la regla "sin datos personales ni documentos a una IA externa" para voz, texto y fotos, con
   consentimiento y tachado (bloquea H6–H7). Incluye **revisión legal**.
4. **Cuentas y saldo:** crear/usar las cuentas de OpenAI y ElevenLabs y cargar saldo, con topes mensuales a definir
   (bloquea H7; hasta entonces todo funciona con simuladores).
5. **HandIA con la API real:** habilitarla también con la app real usando el motor local (hoy queda inactiva ahí).
6. **Voz de HandIA:** elegir una voz de ElevenLabs (rioplatense, cálida) o diseñar una propia.

## Cómo se mide "premium"

- Primera respuesta visible en < 300 ms (local) y < 1,5 s (IA real); animaciones a 60 fps en gama media.
- Cero errores de axe, texto al 200 % sin desbordes, "reducir movimiento" respetado.
- Un recorrido de demo completo (contar → preguntas → ficha → publicar → propuestas → elegir) en menos de 2 minutos,
  escribiendo o hablando.
- Cada estado del personaje aprobado en la galería por Ignacio antes de usarlo.
