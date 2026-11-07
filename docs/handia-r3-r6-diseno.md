# HandIA · R3 a R6 · Lenguaje, pantallas, movimiento y puertas

Lotes R3, R4, R5 y R6 de la fase R ([`handia-premium-plan.md`](handia-premium-plan.md)). Todo vive en el prototipo
**`/diseno/handia/`** (solo vista de prueba), en las secciones Pantallas, Lenguaje y Movimiento y sonido.

**Dirección de trabajo:** Ignacio pidió seguir sin frenar; se avanzó con la recomendada en R2, **Luz cálida+** (la luz
cálida de A, el texto grande y el brillo desde los controles de B, la ficha de vidrio de C). Si elige otra, cambia el
bloque §4 de `tokens.css`; las pantallas no se rehacen.

## R3 · Lenguaje visual

| Pieza          | Dónde                                                             | Regla                                                                           |
| -------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Colores HandIA | `tokens.css` §3 (`--hia-noche` … `--hia-riesgo`)                  | Extienden el azul y el amarillo de Handyx; solo se usan en HandIA               |
| Escenas        | `--hia-voz-fondo`, `--hia-chat-fondo`                             | Voz oscura con la luz que sale del personaje; chat en papel cálido              |
| Degradé vivo   | `.hia-fondo` / `DegradeVivo`                                      | En la voz, manchas azules (ámbar + azul se ve gris); en el chat, miel y celeste |
| Vidrio         | `.hia-vidrio`, `.hia-vidrio--oscuro`                              | Siempre con borde; desenfoque `--hia-desenfoque`                                |
| Formas         | `--hia-radio-burbuja` 20, `--hia-radio-tarjeta` 22                | Burbujas con una esquina chica hacia quien habla                                |
| Tipografía     | `.hia-display` (Archivo 800, `--hia-t-display`)                   | Transcripción, saludos y títulos; DM Sans para el resto                         |
| Orbe           | `.hia-orbe` / `Orbe`                                              | 6 estados: reposo, escuchando, pensando, hablando, listo, apagado               |
| Íconos propios | `trazos.ts`: handia, onda, subtítulos, encuadre, sinSenal, vibrar | Línea 24×24 como los de la landing                                              |

Clases en `styles/handia.css` (sin colores propios: todo de tokens). Contraste AA verificado con axe en todas las
muestras.

## R4 · Pantallas en alta (22)

- **Chat:** bienvenida (personaje + promesa + 3 ejemplos), pensando con pasos, pregunta con progreso y "por qué te lo
  pregunto", ficha de vidrio, riesgo primero.
- **Voz:** lista, escucha (transcripción en vivo), piensa, habla (texto que se resalta), encontró; **no puede
  escuchar** (el navegador mandaría la voz afuera) y **sin permiso** de micrófono.
- **Cámara (H5):** visor con encuadre y "sin ubicación ni datos del teléfono"; control antes de sumar la foto (caras,
  documentos, direcciones). La foto va al pedido para el especialista; **HandIA no la ve** (la regla actual sigue).
- **Agente (H4):** buscando, con pasos ("publiqué tu pedido, lo confirmaste vos"); propuestas en orden de llegada,
  sin rankings, "vos elegís: HandIA no acepta por vos".
- **Errores:** no entendí (otra forma o elegir rubro) y sin conexión (no se mandó nada; lo escrito sigue).
- **Escritorio:** chat a la izquierda y la ficha que se arma en vivo a la derecha.

## R5 · Movimiento, sonido y vibración

- **Curvas:** entrada `cubic-bezier(.16,1,.3,1)`, resorte `(.34,1.56,.64,1)` (solo personaje y chispas), salida
  `(.7,0,.84,0)`.
- **Duraciones:** micro 160 ms, entrada 380 ms, estado 520 ms, escena 700 ms.
- **Escenas con GSAP 3.15.0** (solo en el prototipo): del chat a la voz (círculo que se abre desde el botón, chat
  desenfocado detrás, orbe que baja al centro); la ficha se arma (datos uno a uno; los botones de pedir quietos); pedido
  listo (rebote del orbe + sonido + vibración).
- **Sonidos originales** sintetizados con Web Audio, sin archivos: empezar (dos notas que suben), terminar (bajan),
  listo (acorde arpegiado). Volumen bajo, menos de 0,6 s.
- **Vibración** (Android; el iPhone no la ofrece a la web): 12 ms; 8-60-8; 16-80-24.
- La app **sigue sin sonido ni vibración** (`tests/pwa.test.ts`) hasta que se aprueben y H2 los construya: solo en modo
  voz y con un interruptor para apagarlos.
- "Reducir movimiento": todo salta al estado final (probado con Playwright).

## R6 · Puertas de entrada

Una sola pieza, igual en todos lados: tarjeta azul noche con el orbe chico, un título según el contexto y el
micrófono amarillo.

| Pantalla  | Título                    | Para qué                                     |
| --------- | ------------------------- | -------------------------------------------- |
| Inicio    | Contale a HandIA          | La puerta principal, arriba de los rubros    |
| Pedir     | ¿No sabés qué rubro es?   | Sugerir el rubro                             |
| Actividad | ¿Te faltó contar algo?    | Corregir un pedido abierto sin rehacerlo     |
| Ayuda     | ¿Querés pedir un arreglo? | Llevar a quien entró a Ayuda queriendo pedir |

**Primer uso:** tres pantallas cortas que se pueden saltear (quién es, qué pregunta, privacidad: la voz se reconoce
en el teléfono, se tachan datos, vos revisás antes de publicar).

## Qué decide Ignacio

1. Confirmar Luz cálida+ (o elegir otra dirección).
2. Aprobar R4 y R5 (pantallas y movimiento) antes de H2/H3.
3. Sonido y vibración en modo voz: sí o no (cambia una regla de la app).
4. La cámara y el agente son diseño de H5/H4: siguen esperando sus decisiones (fotos e IA externa).
