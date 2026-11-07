# Plan · HandIA premium (voz, chat, agente, cámara e IA real)

Rama: `handia-premium` (sale de `fase-3-diseno`; no dispara el deploy). Base ya hecha (`4a96774`): motor de conversación
en el celular, ficha editable, avisos de riesgo, modo voz local, pruebas y accesibilidad 299/299.

El **modelo · esfuerzo** de cada lote es una recomendación para elegir en Claude Code (escribirlo acá no lo cambia).
Esfuerzos: `medium` (trabajo acotado y mecánico), `high` (lo normal en este proyecto), `xhigh` (contratos compartidos,
seguridad y privacidad: donde un error cuesta caro). **Ignacio** marca lo que hace él (imágenes, 3D, cuentas, saldo).

## Lo que pidió Ignacio y dónde está en el plan

| Pedido (07/11/2026)                                                               | Lotes                  |
| --------------------------------------------------------------------------------- | ---------------------- |
| Experiencia **súper premium, deluxe**, que parezca que vale mucho dinero          | Todos; criterios abajo |
| **Apartado de rediseño** para que HandIA sea bien premium (pedido del 07/11)      | R1 a R8                |
| **Modo voz como ChatGPT Voice**, pero con los personajes de Handyx                | H2.1 a H2.5            |
| **Imágenes hechas con ChatGPT**: pensando, buscando, encontró, enviando respuesta | H1.1, H1.2             |
| **Degradé de fondo**                                                              | H1.4, H2.1             |
| **GSAP** para las animaciones                                                     | H1.3, H2.1, H3.1       |
| **Meshy** para 3D si hace falta                                                   | H1.5                   |
| **HandIA por chat** también muy premium                                           | H3.1 a H3.5            |
| **Poder escribirle y probar toda la demo**                                        | H3.5, H4.2 a H4.5      |
| Al final, **ChatGPT (OpenAI) con saldo** para el razonamiento y la mejora         | H6.2, H6.5, H7.2, H7.3 |
| **ElevenLabs** para la voz                                                        | H6.3, H7.2, H7.3       |
| **Cámara** para sacarle foto al problema                                          | H5.1 a H5.3, H6.1      |
| **Buscar presupuesto recorriendo toda la app** por la persona                     | H4.1 a H4.5, H6.2      |

## Principios (no se negocian)

1. **Todo se prueba en la demo sin gastar nada.** Cada fase deja la vista de prueba funcionando de punta a punta con el
   motor local y la voz del celular. Las integraciones pagas se enchufan al final, detrás de un interruptor; si fallan o
   llegan al tope, HandIA sigue con el motor local sin mostrar un error.
2. **La persona decide.** HandIA sugiere, arma y explica; publicar un pedido, aceptar una propuesta, pagar o escribirle a
   un especialista siempre lo confirma la persona (deslizar o botón). Nada se manda solo a terceros.
3. **Privacidad primero.** Hoy rige: sin datos personales, fotos ni voz hacia una IA externa. H6–H7 cambian eso **solo
   con autorización explícita de Ignacio**, consentimiento dentro de la app y revisión legal (Ley 25.326). Hasta
   entonces la cámara adjunta fotos al pedido y la voz es local.
4. **Sin promesas de tiempo ni de precio.** Los precios son los de las propuestas reales; los tiempos, los del viaje en
   vivo del servidor.
5. **Premium también es rápido y accesible.** 60 fps en un Android de gama media, "reducir movimiento" respetado,
   subtítulos siempre, usable con lector de pantalla y teclado.

## Lotes

### H0 · Base y decisiones

| Lote | Qué                                                                | Quién  | Modelo · esfuerzo   | Estado    |
| ---- | ------------------------------------------------------------------ | ------ | ------------------- | --------- |
| H0.1 | Base de HandIA premium (motor local, ficha, voz local, pruebas)    | Claude | Opus 5.5 · high     | ✅ listo  |
| H0.2 | Registrar las decisiones de Ignacio (ver al final) y fijar alcance | Claude | Sonnet 5.5 · medium | pendiente |

### R · Rediseño premium de HandIA (antes de construir)

Objetivo: **diseñar y aprobar** cómo se ve, se mueve y suena HandIA antes de programar H2–H5, para que todo lo que se
construya sea una sola experiencia deluxe y no pantallas sueltas. Extiende la marca de la landing y del kit (azul
Handyx, amarillo, Archivo + DM Sans, los Handys): no se inventa otra marca. Se diseña en **Figma** (conector disponible
en la sesión, con el archivo que indique Ignacio) o, si no, como prototipo navegable publicado para revisar desde el
celular.

| Lote | Qué                                                                                                                                                                                                 | Quién            | Modelo · esfuerzo |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ----------------- |
| R1   | Referentes y diagnóstico: ChatGPT Voice, Gemini Live, Siri, apps de servicios premium; qué hace "caro" a cada uno y qué le falta hoy a HandIA                                                       | Claude           | Opus 5.5 · high   |
| R2   | Concepto y moodboard: 2 o 3 direcciones (p. ej. "luz cálida", "noche azul", "vidrio y brillo") con una pantalla de voz y una de chat cada una                                                       | Claude           | Opus 5.5 · high   |
| R3   | Lenguaje visual de HandIA: degradés como tokens, brillos y halos, vidrio/blur, sombras y profundidad, radios, tipografía de display, íconos propios                                                 | Claude           | Opus 5.5 · high   |
| R4   | Pantallas en alta: entrada desde Inicio, bienvenida de HandIA, chat (vacío, pensando, respuesta, ficha, riesgo), voz (cada estado), cámara, agente y propuestas, errores y sin conexión, escritorio | Claude           | Opus 5.5 · high   |
| R5   | Movimiento, sonido y vibración: prototipo de transiciones (GSAP), curvas y duraciones, sonidos originales de inicio/fin, patrón de vibración                                                        | Claude           | Opus 5.5 · high   |
| R6   | Puertas de entrada en toda la app: botón "Preguntale a HandIA" en Inicio, Pedir, Actividad y Ayuda; primer uso con una presentación corta                                                           | Claude           | Sonnet 5.5 · high |
| R7   | Prueba con 5 personas usando la demo (datos ficticios, sin datos reales de nadie) + ajuste, y **aprobación de Ignacio** de una dirección final                                                      | Ignacio + Claude | Opus 5.5 · high   |
| R8   | Base en código: tokens nuevos en `tokens.css`/`ajustes.css`, componentes (Orbe, Degradé vivo, Tarjeta de vidrio, Botón premium, Burbuja HandIA) y galería `/diseno/#handia`                         | Claude           | Sonnet 5.5 · high |

- **Criterio de aprobación:** Ignacio elige una dirección en R2 y aprueba R4 + R5 antes de H2/H3. Lo que no se aprueba
  no se construye.
- **Contraste y accesibilidad desde el diseño:** cada combinación de degradé y texto pasa AA; cada animación tiene su
  versión quieta.
- **Peso:** el lenguaje visual cabe en CSS y SVG livianos; las imágenes de los estados (H1) son las únicas pesadas.

### H1 · Dirección de arte y personajes

| Lote | Qué                                                                                      | Quién            | Modelo · esfuerzo   |
| ---- | ---------------------------------------------------------------------------------------- | ---------------- | ------------------- |
| H1.1 | Generar las imágenes de estados con ChatGPT (brief abajo) y revisar consistencia         | Ignacio + Claude | Sonnet 5.5 · medium |
| H1.2 | Procesar las imágenes: recorte, base opaca, WebP/AVIF ≤ 60 KB, procedencia en inventario | Claude           | Sonnet 5.5 · medium |
| H1.3 | Sistema de movimiento con GSAP: curvas, tiempos y coreografía por estado, reducir movim. | Claude           | Opus 5.5 · high     |
| H1.4 | Degradés vivos por estado + galería `/diseno/#handia` para aprobar                       | Claude           | Sonnet 5.5 · high   |
| H1.5 | (Opcional) Prototipo 3D: Ignacio genera el GLB en Meshy; three.js con caída a 2D         | Ignacio + Claude | Opus 5.5 · high     |

- **Estados** (HandIA = la lamparita; los otros Handys, como ayudantes por rubro):

  | Estado       | Cuándo                                 | Pose                                             | Degradé                        |
  | ------------ | -------------------------------------- | ------------------------------------------------ | ------------------------------ |
  | `saludo`     | Al abrir                               | Saluda con la mano, sonrisa                      | Azul Handyx → noche            |
  | `escuchando` | La persona habla                       | Mano en la "oreja", ojos atentos, inclinada      | Azul → celeste, pulso suave    |
  | `pensando`   | Procesa                                | Mano en el mentón, rayitos que titilan           | Azul → violeta                 |
  | `buscando`   | Busca rubro, especialistas, propuestas | Con lupa, mirando a un costado                   | Azul → turquesa, barrido       |
  | `encontro`   | Hay rubro, propuesta o respuesta       | Salta, brilla                                    | Amarillo Handyx → azul         |
  | `enviando`   | Entrega la respuesta o la ficha        | Extiende una tarjeta hacia la cámara             | Azul → amarillo                |
  | `hablando`   | Lee en voz alta                        | 3 bocas (cerrada, media, abierta)                | Azul con brillo que late       |
  | `no_entendi` | No hay pistas                          | Cabeza ladeada, signo de pregunta                | Azul apagado                   |
  | `alerta`     | Riesgo (gas, electricidad, agua)       | Seria, mano en alto "pará", señal de advertencia | Ámbar → azul noche             |
  | `camara`     | Va a sacar una foto                    | Sostiene una cámara                              | Azul → blanco                  |
  | `listo`      | Pedido publicado                       | Festeja con los otros Handys                     | Amarillo → azul, confeti sutil |

- **GSAP** (licencia gratuita, también comercial) se carga **solo en HandIA** con import dinámico.
- **3D** se aprueba solo si en un Android de gama media mantiene 60 fps y suma ≤ ~600 KB a HandIA; si no, queda 2D.
- **Aprobación:** Ignacio aprueba cada estado en la galería antes de H2 y H3.

### H2 · Modo voz estilo ChatGPT Voice

| Lote | Qué                                                                                                           | Quién  | Modelo · esfuerzo |
| ---- | ------------------------------------------------------------------------------------------------------------- | ------ | ----------------- |
| H2.1 | Escena: pantalla completa, degradé vivo, HandIA dentro de un orbe de luz, coreografía de estados con GSAP     | Claude | Opus 5.5 · high   |
| H2.2 | Reactividad al audio: nivel del micrófono (Web Audio en el celular, nada se graba) y de la voz de HandIA      | Claude | Opus 5.5 · high   |
| H2.3 | Interacción: tocar o mantener para hablar, interrumpir, deslizar para salir, manos libres, vibración, sonidos | Claude | Sonnet 5.5 · high |
| H2.4 | Subtítulos en vivo, opciones grandes, lector de pantalla, foco, reducir movimiento                            | Claude | Sonnet 5.5 · high |
| H2.5 | Rendimiento (60 fps en gama media, carga diferida), e2e con voz simulada y capturas de cada estado            | Claude | Sonnet 5.5 · high |

### H3 · Chat premium

| Lote | Qué                                                                                                    | Quién  | Modelo · esfuerzo   |
| ---- | ------------------------------------------------------------------------------------------------------ | ------ | ------------------- |
| H3.1 | "Pensando" visible por pasos ("Leyendo…", "Buscando el rubro…", "Armando el pedido…") con el personaje | Claude | Sonnet 5.5 · high   |
| H3.2 | Respuestas en streaming simulado palabra por palabra + "Detener", listo para el SSE real               | Claude | Opus 5.5 · high     |
| H3.3 | Tarjetas ricas (rubro, riesgo, ficha, propuestas, fotos) y composer premium (crece, foto, micrófono)   | Claude | Sonnet 5.5 · high   |
| H3.4 | Editar el último mensaje, empezar de nuevo, historial en memoria (nunca en el navegador)               | Claude | Sonnet 5.5 · medium |
| H3.5 | Escenarios de demo `?escenario=handia-…` (pileta, gas, me quedé afuera, humedad, aire) y guion         | Claude | Sonnet 5.5 · medium |

### H4 · HandIA agente: busca presupuesto recorriendo la app

| Lote | Qué                                                                                                     | Quién  | Modelo · esfuerzo |
| ---- | ------------------------------------------------------------------------------------------------------- | ------ | ----------------- |
| H4.1 | Reglas del agente en `docs/state-machines.md` (BE) y `tests/servidor-mock.test.ts` (qué puede y qué no) | Claude | Opus 5.5 · high   |
| H4.2 | Herramientas en la demo: armar pedido, dirección guardada, urgente o día y franja, sumar fotos          | Claude | Opus 5.5 · high   |
| H4.3 | Publicar el pedido **solo con confirmación deslizando**                                                 | Claude | Opus 5.5 · high   |
| H4.4 | Seguir y comparar propuestas dentro de HandIA (precio total, horario, reseñas, qué incluye; no decide)  | Claude | Opus 5.5 · high   |
| H4.5 | Preparar el mensaje al especialista (lo envía la persona) y llevar a la pantalla que corresponde        | Claude | Sonnet 5.5 · high |

- Nunca acepta, paga ni escribe a especialistas por su cuenta: muestra el botón de siempre.

### H5 · Cámara

| Lote | Qué                                                                                                    | Quién  | Modelo · esfuerzo   |
| ---- | ------------------------------------------------------------------------------------------------------ | ------ | ------------------- |
| H5.1 | Visor de cámara premium (pantalla completa, guía "apuntá al problema") y caída a la cámara del sistema | Claude | Sonnet 5.5 · high   |
| H5.2 | Limpieza en el celular: sin metadatos ni GPS, ≤ 1600 px, aviso si aparece una persona o un documento   | Claude | Opus 5.5 · high     |
| H5.3 | Fotos al pedido y, en la demo, análisis simulado ("Veo una pileta con agua estancada…")                | Claude | Sonnet 5.5 · medium |

### H6 · Backend de IA preparado (sin gastar)

| Lote | Qué                                                                                                                        | Quién  | Modelo · esfuerzo |
| ---- | -------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------- |
| H6.1 | Contrato `handia` en `handyx-client-be` (sube `VERSION_CONTRATO`): mensajes por SSE, voz, fotos; Zod, OpenAPI, copia al FE | Claude | Opus 5.5 · xhigh  |
| H6.2 | Razonamiento con OpenAI: API de respuestas, herramientas de H4 del lado del servidor con la sesión; simulador sin red      | Claude | Opus 5.5 · xhigh  |
| H6.3 | Voz con ElevenLabs: texto a voz en streaming y voz a texto; audio solo en memoria; simulador sin red                       | Claude | Opus 5.5 · high   |
| H6.4 | Privacidad en el servidor: tachado, `store: false`, logs sin contenido, nada guardado                                      | Claude | Opus 5.5 · xhigh  |
| H6.5 | Saldo y topes: por cuenta por día y global por mes, corte automático, métricas sin contenido, interruptor de apagado       | Claude | Opus 5.5 · high   |
| H6.6 | Adaptador HTTP en la PWA (SSE + audio) con caída automática al motor local                                                 | Claude | Opus 5.5 · high   |
| H6.7 | Revisión de seguridad del diff (agente `cybersecurity-arquitect`)                                                          | Claude | Opus 5.5 · xhigh  |

- Claves solo en el entorno privado del BE; nunca en el front ni en `NEXT_PUBLIC_*`.

### H7 · Integración real y lanzamiento (con autorización)

| Lote | Qué                                                                                                | Quién            | Modelo · esfuerzo |
| ---- | -------------------------------------------------------------------------------------------------- | ---------------- | ----------------- |
| H7.1 | Consentimiento en la app y borrador de política de privacidad para Legal                           | Claude           | Opus 5.5 · high   |
| H7.2 | Cuentas, saldo y claves de OpenAI y ElevenLabs; staging con topes bajos                            | Ignacio + Claude | Sonnet 5.5 · high |
| H7.3 | Elegir modelo de razonamiento y voz con un set de casos sintéticos (calidad, costo, latencia)      | Claude           | Opus 5.5 · high   |
| H7.4 | QA en iPhone (Safari) y Android (Chrome): respuesta hablada < 1,5 s, costo por conversación medido | Claude           | Sonnet 5.5 · high |
| H7.5 | Lanzamiento gradual en la demo cerrada, con vuelta al motor local por interruptor                  | Claude           | Sonnet 5.5 · high |

- En iPhone, la voz en la nube (con consentimiento) habilita escuchar: hoy Safari no puede sin mandar el audio afuera.

## Orden y dependencias

```
H0 ─▶ R (rediseño, aprobado) ─▶ H1 ─┬─▶ H2 (voz)
                                    └─▶ H3 (chat) ─┬─▶ H4 (agente)
                                                   └─▶ H5 (cámara)
H0 (decisión 3) ─▶ H6 (backend, simuladores) ─▶ H7 (real, con saldo)
```

R1–R3 pueden arrancar ya (no necesitan las imágenes); R4 usa las poses que existen como provisorias. H3 puede
arrancar con las poses actuales una vez aprobado R. H6 puede avanzar en paralelo a H2–H5 porque
usa simuladores; H7 espera cuentas, saldo y la revisión legal.

## Brief para ChatGPT (imágenes de HandIA)

Adjuntar como referencia `public/img/handy-lamparita.webp` (y `handys-grupo.webp` para los otros). Una imagen por
estado, todas con:

- **Mismo personaje y estilo:** la lamparita de Handyx, dibujo plano con contorno suave, vidrio amarillo claro (#F5F59A)
  con borde amarillo más intenso, ojos negros redondos con brillo, base gris **opaca** con vendas (sin huecos
  transparentes), patitas y bracitos finos.
- **Mismo encuadre:** cuerpo entero centrado, mismo tamaño en todas, 1024 × 1024 px, **fondo transparente (PNG)**, sin
  sombra en el piso, sin texto, sin elementos de otras marcas.

Prompt base:

> "Ilustración del personaje de la imagen de referencia (la lamparita de Handyx), mismo estilo plano y mismos colores,
> cuerpo entero, centrado, fondo transparente, 1024x1024, sin texto. Pose: **[pose]**."

Poses: saludando con una mano y sonriendo · con una mano en la oreja escuchando atento, inclinado hacia adelante ·
pensando con una mano en el mentón, mirando hacia arriba, con rayitos de luz titilando · buscando con una lupa grande ·
saltando de alegría con brillo alrededor · entregando una tarjeta con las dos manos hacia el frente · hablando (tres
versiones: boca cerrada, entreabierta, abierta) · confundido con la cabeza ladeada y un signo de pregunta · serio con
una mano en alto como diciendo "pará", con una señal de advertencia · sosteniendo una cámara de fotos · festejando con
los brazos arriba y confeti.

Para Meshy (H1.5): una vista de frente y una de perfil en pose "A" (brazos abiertos), mismo estilo, fondo liso.

## Decisiones pendientes (Ignacio)

1. **Rediseño:** ¿en Figma (indicar el archivo) o como prototipo navegable? Y elegir una dirección en R2 (bloquea R4).
2. **Imágenes:** generarlas con el brief (bloquea H1.1 y todo H1).
3. **3D:** prototipo con Meshy o solo 2D + GSAP (recomendado: 2D primero, 3D como prueba en H1.5).
4. **IA externa:** cambiar la regla "sin datos personales ni documentos a una IA externa" para voz, texto y fotos, con
   consentimiento y tachado, y pedir revisión legal (bloquea H6.2 en adelante con datos reales).
5. **Cuentas y saldo:** crear/usar las cuentas de OpenAI y ElevenLabs, cargar saldo y fijar el tope mensual (bloquea H7).
6. **HandIA con la app real:** habilitarla con el motor local (hoy queda inactiva fuera de la demo).
7. **Voz de HandIA:** una voz de ElevenLabs rioplatense y cálida, o diseñar una propia (H7.3).

## Criterios de "premium" (se miden en cada fase)

- Primera respuesta visible en < 300 ms (local) y < 1,5 s (IA real); animaciones a 60 fps en gama media.
- Cero fallas de axe, texto al 200 % sin desbordes, "reducir movimiento" respetado.
- Recorrido de demo completo (contar → preguntas → ficha → publicar → propuestas → elegir) en < 2 minutos, escribiendo
  o hablando.
- Cada estado del personaje y cada pantalla del rediseño aprobados por Ignacio antes de construirlos.
