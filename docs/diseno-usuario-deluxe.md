# Diseño completo de la app del usuario (deluxe)

Fecha: 07/11/2026. Pedido de Ignacio: diseñar la app del usuario completa (no un MVP) con la misma calidad, sistema
visual y forma de trabajo que la app del especialista. **Es solo diseño: no se desarrolla nada hasta el OK de Ignacio.**

- Lienzo (privado): <https://claude.ai/artifact/A4T5bqyE8WEiQkwD4ogDaZ>. Arriba, el tablero de revisión UX/UI; después
  12 flujos (empezando por «Mapa de la app»), con cada pantalla tocable; abajo, 89 pantallas de 390 × 844 en 11 filas.
- Fuente para pasar a Figma: [`design/usuario/`](../design/usuario/README.md).
- Fases nuevas del plan: sección «Fase 7» de [`plan.md`](plan.md).

## Qué se leyó y qué se reutilizó

| Fuente                                                                    | Qué se tomó                                                                                                                                                                  |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handyx-specialist-fe` (`claude/pensive-hypatia-jajjgm`), `design/deluxe` | Piezas (`piezas.py`, `piezas2.py`), dibujo de flujos, tablero de revisión, chequeos (`revisar.cjs`) y las reglas de §6–§12 de `rediseno-deluxe.md` y `revision-ux.md`.       |
| `handyx-client-fe` (`handia-premium`)                                     | El Inicio de la demo de la landing con HandIA, el chat y la voz de HandIA tal como quedaron (Ignacio: «está muy bien como hiciste a HandIA por voz»), reglas de `AGENTS.md`. |
| `handyx-client-be` (`src/contracts/v1/`)                                  | Estados del trabajo y de las etapas, tipos de pedido y de propuesta, verificaciones (`identidad`, `antecedentes`, `matricula`), tarifa y pago directo.                       |

No se tiró nada: el Inicio sigue siendo el de la demo, con los seis rubros como mosaicos y la tarjeta azul de HandIA.

## Navegación

- **Cinco pestañas** en una barra flotante de vidrio (con fondo sólido de respaldo): Inicio · Actividad · **HandIA** ·
  Mensajes · Mi hogar. HandIA es el **círculo azul flotante del medio**, más alto que la barra, con la lamparita (PD de
  Ignacio). Las pestañas aparecen solo en las pantallas raíz.
- **Cuenta** se abre desde el avatar (iniciales) de la cabecera azul, como en el especialista.
- **Cabecera azul redondeada** en Inicio, Mi hogar, Cuenta, Ayuda y Camino; **barra compacta con «volver»** en el resto.
- Una **acción principal fija abajo**; aceptar en verde (`#137140`), rechazar en rojo de contorno.
- Fondo oscuro solo en cámara, nivel, escaneo, AR y la voz de HandIA.

## Sistema visual (el del especialista)

Fondo blanco, mosaicos grises, tarjetas blancas con borde fino, sombra en capas y franja gris «Ver …», botones azules
con base que se hunde, chips de estado con ícono y texto, montos en Archivo 900 ensanchado (`$ 45.000`), una palabra
por título con marcador amarillo `#F5F59A`, Handys en vacíos, éxitos y errores, ilustraciones SVG propias (Mar del
Plata con el faro y la rambla en la bienvenida, casa isométrica, fotos de canilla, humedad, tablero, calefón y
cerradura). Personas con iniciales y nombres ficticios.

## Decisiones por sección

| Fila | Sección                           | Decisiones                                                                                                                                                                                                                                                                                                                                                           |
| ---- | --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A    | Acceso y alta                     | Demo cerrada: primero la invitación. **Sin contraseñas**: código de 6 números por email o SMS, o Google y Apple. Segunda verificación opcional. Datos mínimos (nombre y celular, sin DNI ni CUIT). Zona aproximada; la dirección exacta se comparte solo al aceptar una propuesta. La tarifa 0 % hasta el 10/12/2026 se avisa al final del alta.                     |
| I    | Inicio y HandIA                   | Inicio de la demo + HandIA en tarjeta y en el círculo central. Chat, «pensando», ficha que revisa la persona y modo voz con reconocimiento en el dispositivo. Los estados pensando/respondiendo son **provisionales**: Ignacio va a mandar SVG propios.                                                                                                              |
| P    | Pedir                             | Seis rubros en mosaicos, opciones del rubro, fotos con anotaciones (flechas, círculos, texto), medir con la cámara (aproximado), urgente o programado, día y franja en calendario, zona aproximada y revisar. Las fotos van al pedido, nunca a HandIA.                                                                                                               |
| C    | Propuestas                        | Cada especialista pone su precio; Handyx muestra un rango sugerido que **no obliga**. Comparar en tabla, perfil con certificados («verificado» solo con dato real; cargado ≠ verificado). Aceptar, pedir cambios u otro horario. Búsqueda sin prometer tiempos.                                                                                                      |
| S    | Seguimiento y pago                | Viaje en vivo solo mientras el especialista lo comparte, con la llegada **que calcula el servidor**. Adicional que se aprueba o no. Antes y después en deslizador y lado a lado. Informe con garantía, conformidad en un toque, pago directo por Mercado Pago o efectivo (informado ≠ verificado), reseña opcional.                                                  |
| O    | Obras                             | Propuesta de obra con días y etapas, el día a día, repuestos y cambios de fecha aprobados desde el chat, grupo con el equipo, pagos por etapa según el reparto (directo a quien la hizo) y total gastado separando informado y verificado.                                                                                                                           |
| M    | Mensajes                          | Tarjetas de presupuesto, repuesto y fecha que se aceptan o responden ahí mismo; adjuntar foto, medida o modelo 3D; Soporte de Handyx atendido por personas. Las respuestas rápidas las manda siempre la persona.                                                                                                                                                     |
| H    | Mi hogar                          | Ficha de la casa (ambientes y equipos), historial, garantías, recordatorios de mantenimiento, modelo 3D con medidas compartidas y **ver en AR un equipo propuesto antes de aceptarlo**.                                                                                                                                                                              |
| T    | Herramientas compartidas          | Las mismas del especialista: medir con la cámara, nivel, linterna y lupa, foto anotada, escanear en 3D y AR. Todo termina en el chat o en el pedido («¿A dónde va?»). El teléfono no detecta gas, tensión ni monóxido.                                                                                                                                               |
| G    | Camino del hogar                  | Gamificación pensada de cero: se avanza **cuidando la casa, no gastando más** (ficha completa, informe leído, mantenimiento a tiempo, conformidades). Vale igual lo que se hace por cuenta propia. Insignias y beneficios sin azar, sin rankings, sin presión para contratar, sin envíos a contactos. Montos y premios con «Borrador · Legal» y `$ [MONTO]`.         |
| X    | Actividad, cuenta, ayuda, errores | Actividad con En curso · Agenda · Historial. Cuenta con datos y direcciones, seguridad (sesiones abiertas), pagos registrados **sin tarjetas guardadas**, privacidad (HandIA sin datos personales, descargar datos, borrar cuenta en rojo de contorno), ayuda con temas y preguntas, «¿Te sirvió?», error, sin conexión («no se mandó nada») y 404 con Handys rotos. |

## Reglas que se respetan

- Rioplatense con voseo; montos `$ 45.000`; «verificados» sí; sin «inmediato» ni «al instante»; nada de tiempos de
  llegada salvo el viaje en vivo del servidor.
- Tarifa 0 % hasta el 10/12/2026, sin presentarla como descuento ni anunciar tarifas no aprobadas. Handyx no recibe ni
  reparte el pago; volver del checkout no confirma nada.
- HandIA y cualquier IA sin datos personales; sin fotos, documentos ni audio hacia una IA.
- Datos sintéticos en todo: Lucía Ferreyra, `lucia@example.test`, `223 555-0100`, «Calle De Prueba 123 · La Perla»,
  código `HX-PRUEBA-24`.
- Nada en `localStorage`, `sessionStorage`, IndexedDB ni `document.cookie` (verificado sobre las 102 piezas).
- Sin envíos automáticos a contactos; nunca animar botones de aceptar o pagar.

## Revisión

`node usuario/gen/revisar.cjs` sobre las 102 piezas (89 pantallas, 12 flujos y el tablero): **0** errores de axe
(WCAG 2 A y AA), **0** toques de menos de 44 px, **0** textos de menos de 11 px, **0** contenidos tapados por los botones
fijos, **0** desbordes. Todos los enlaces entre pantallas apuntan a tableros que existen. Correcciones hechas en la
revisión: verde de aceptar a 4,5:1, chips sobre la voz, montos que se partían, botón fijo que tapaba los pagos de la obra,
nodos del camino bajo la cabecera, cabeceras legibles sobre la cámara.

## Lo que pide contrato nuevo (no existe en `v1`)

El contrato actual cubre pedidos, propuestas, trabajos, etapas, viaje, chat, reclamos, avisos y pagos. Para este
diseño faltan, y los define `handyx-client-be` (dueño del contrato) antes de desarrollar:

- Acceso con código por email o SMS, Google y Apple, segunda verificación y sesiones abiertas (hoy: email y contraseña).
- Reseñas; informe con garantía y antes/después como objetos del trabajo.
- Mi hogar: ambientes, equipos, historial, garantías y recordatorios.
- Modelos 3D y medidas compartidas por pedido; AR de un equipo propuesto.
- Camino del hogar: hitos, insignias y beneficios (después de Legal).
- Obras en equipo: integrantes, reparto por etapa y dirección exacta por día.
- Descargar mis datos.

## Decisiones abiertas para Ignacio

1. Proveedores para el código por SMS y para Google/Apple (y si arrancamos solo con email).
2. 3D y AR: en el navegador (WebXR, Quick Look) o esperar una app nativa.
3. Legal: montos y premios del camino; textos de garantía, privacidad y baja.
4. Obras en equipo: ¿cada profesional ve la dirección exacta solo los días que trabaja? (así está diseñado).
5. Los SVG definitivos de HandIA pensando y respondiendo (Ignacio los manda).

**Siguiente paso: esperar el OK de Ignacio antes de desarrollar.**
