# Plan por olas · App del usuario completa (Fase 7)

Fecha: 07/11/2026. Base: el lienzo aprobado
(<https://claude.ai/artifact/A4T5bqyE8WEiQkwD4ogDaZ>: 102 pantallas, 13 recorridos, 12 flujos), su fuente en
[`design/usuario/`](../design/usuario/README.md) y las decisiones de
[`diseno-usuario-deluxe.md`](diseno-usuario-deluxe.md). **Nada se desarrolla hasta el OK de Ignacio.**

## Qué es una ola

Una ola agrupa lotes que **se pueden hacer al mismo tiempo** porque no se pisan: tocan carpetas o repos distintos y
dependen solo de olas anteriores. Cada lote va en su rama (o worktree) y su PR; la ola se cierra cuando todos sus lotes
están en verde. Dentro de una ola el orden no importa; entre olas, sí.

El modelo y el esfuerzo son **recomendaciones** (se eligen en Claude Code; escribirlo acá no lo cambia). Efforts:
`medium` (trabajo acotado y conocido), `high` (pantallas o servicios con reglas), `xhigh` (contrato, seguridad,
esquema o tecnología nueva).

## Punto de partida (lo que ya existe)

| Área                    | Hoy en la app (`handyx-client-fe`, rama `handia-premium`)                                                                                             | Hoy en el BE (`handyx-client-be`, `fase-4-backend-conciliado`)                                                                                    |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Acceso                  | Registro **con invitación y contraseña**, ingreso, recuperar                                                                                          | `auth/registro` con `codigoInvitacion`, login con contraseña                                                                                      |
| Inicio, pedir, HandIA   | Inicio de la demo, pedir en 6 pasos, HandIA en el celular con voz local (prototipo con la esfera y el personaje)                                      | Pedidos idempotentes, rubros, cobertura                                                                                                           |
| Propuestas y trabajo    | Lista, detalle, contraoferta, trabajo con etapas, viaje en vivo (SSE), pago directo, reseña, reclamos                                                 | Propuestas, aceptación concurrente, trabajos, etapas, viaje, pagos                                                                                |
| Mensajes, cuenta, ayuda | Chats, soporte, cuenta, datos, direcciones, pagos, privacidad, tarifa, ayuda, notificaciones                                                          | Conversaciones, notificaciones, cuenta, baja                                                                                                      |
| **No existe**           | Sistema visual nuevo, barra con HandIA al medio, Mi hogar, herramientas, camino, comparar con «la mejor», visita, selección de mensajes, Armá tu casa | Reseñas, informe y antes/después, propuesta extendida, Mi hogar, compartir por pedido, OTP/Google/Apple/2FA, descargar datos, alta sin invitación |

Contrato actual: `1.0.0-draft.3`. Toda pantalla nueva arranca contra el **servidor simulado** del FE (regla del repo)
y se conecta al BE real cuando su servicio existe.

## Las olas

### Ola 0 · Decisiones y preparación (antes de escribir código)

No es desarrollo: son las condiciones para arrancar. Se resuelven en paralelo.

| #   | Qué                                                                                                                   | Quién            |
| --- | --------------------------------------------------------------------------------------------------------------------- | ---------------- |
| 0.1 | OK al plan.                                                                                                           | Ignacio          |
| 0.2 | Figma Professional (para migrar el lienzo; ver la respuesta del 07/11).                                               | Ignacio (compra) |
| 0.3 | Acceso: ¿arrancamos solo con código por **email** (sin proveedor de SMS ni Google/Apple) y sumamos los otros después? | Ignacio          |
| 0.4 | 3D y AR: ¿en el navegador (WebXR/Quick Look) como experimento con bandera, o se postergan?                            | Ignacio          |
| 0.5 | Legal: montos y premios del camino; textos de garantía, privacidad y baja.                                            | Ignacio + Legal  |
| 0.6 | Sesión del especialista: avisar que el contrato sube a `draft.4` (propuesta extendida, informe, obras en equipo).     | Claude (mensaje) |

### Ola 1 · Fundaciones (3 lotes en paralelo)

| Lote | Repo  | Qué incluye                                                                                                                                                                                                                                                                                                                                                                                                         | Depende de | Modelo · esfuerzo |
| ---- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ----------------- |
| 1A   | FE    | **Sistema visual del lienzo en código**: tokens y piezas de `design/usuario/gen` pasados a CSS y componentes (`hx`): barra de vidrio azul con HandIA encastrada, cabeceras, tarjetas azul/noche/amarilla, chips, botones sin verde, hojas que suben, ticket, escenas SVG, íconos de línea. Galería `/diseno/` actualizada. Navegación de 5 pestañas.                                                                | Ola 0      | Opus 5.5 · high   |
| 1B   | BE    | **Contrato `1.0.0-draft.4`** (solo el contrato, sin servicios): alta sin invitación y acceso por código; propuesta extendida (materiales, equipo, duración, no incluye, tipo visita); reseña; informe con antes/después y garantía; Mi hogar (ambientes, equipos, fotos, etiqueta); compartir por pedido y revocar; recordatorios; descargar datos. OpenAPI regenerado y copia byte a byte al FE y al especialista. | Ola 0      | Opus 5.5 · xhigh  |
| 1C   | Figma | **Migración del lienzo a Figma**: primero las piezas como componentes, después una página por sección, recorridos y flujos.                                                                                                                                                                                                                                                                                         | 0.2        | Sonnet 5.5 · high |

### Ola 2 · Pantallas sobre el servidor simulado + esquema (6 lotes en paralelo)

Cada lote del FE toca su propia carpeta de rutas y su parte del mock; todos usan las piezas de 1A y el contrato de 1B.

| Lote | Repo | Pantallas del lienzo                                                                                                                                                                                                    | Qué incluye                                                                                                                                                     | Modelo · esfuerzo |
| ---- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| 2A   | FE   | A-Bienvenida, A-Entrar, A-Codigo, A-Datos, A-Zona, A-Avisos, A-Casa, A-CasaAmbientes, A-CasaEquipos, A-CasaFotos, A-Listo, A-Segunda                                                                                    | Alta sin invitación ni contraseña, código, datos mínimos, zona, avisos, «Armá tu casa» opcional, segunda verificación                                           | Opus 5.5 · high   |
| 2B   | FE   | I-Inicio, I-HandIA, I-HandIAChat, I-HandIAPiensa, I-HandIAFicha, I-Voz, I-VozHabla, I-VozAjustes, I-Avisos                                                                                                              | Inicio como la app real; chat con mensajes abajo e ilustración solo vacío; voz sin personaje (esfera), textos y ajustes. Reusa el motor y la voz local actuales | Opus 5.5 · high   |
| 2C   | FE   | P-Rubro, P-Que, P-Fotos, P-Anotar, P-Medir, P-Cuando, P-Fecha, P-Zona, P-Revisar, P-Publicado · C-Buscando, C-Propuestas, C-Comparar, C-Detalle, C-Visita, C-Certificados, C-Cambios, C-Rechazar, C-Aceptar, C-Aceptada | Pedir en 3 toques; propuestas con aceptar/rechazar/perfil; «la mejor en perfil y precio» (cálculo con pesos fijos y prueba); detalle extendido; visita          | Opus 5.5 · high   |
| 2D   | FE   | S-Agendado, S-EnCamino, S-Llego, S-Trabajando, S-Adicional, S-AntesDespues, S-LadoALado, S-Informe, S-Conformidad, S-Pagar, S-PagoInformado, S-Resena                                                                   | Seguimiento con piezas del especialista, adicional con foto y total, informe, pago rehecho, reseña en hoja tipo Uber                                            | Sonnet 5.5 · high |
| 2E   | FE   | M-Mensajes, M-Chat, M-Seleccion, M-Presupuesto, M-Adjuntar, M-Soporte · X-Actividad, X-Cuenta, X-Datos, X-Seguridad, X-Pagos, X-Privacidad, X-Ayuda, X-Respuesta, X-Error, X-SinConexion, X-NoEncontrado                | Chats apoyados abajo, tarjetas accionables, selección; Actividad como pestaña; cuenta desde el avatar; errores                                                  | Sonnet 5.5 · high |
| 2F   | BE   | —                                                                                                                                                                                                                       | **Esquema y migraciones** de `draft.4` (tablas nuevas, permisos por rol, reglas, `down.sql`, pruebas de esquema) en la base aislada                             | Opus 5.5 · xhigh  |

### Ola 3 · Áreas nuevas + servicios del BE (5 lotes en paralelo)

| Lote | Repo | Qué incluye                                                                                                                                                                                                                                                    | Depende de     | Modelo · esfuerzo |
| ---- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ----------------- |
| 3A   | FE   | **Mi hogar** (H-Hogar, H-MiCasa, H-Ambiente, H-Equipo, H-Sumar, H-Rompio, H-Compartir, H-Compartido, H-Recordatorios, H-Historial, H-Garantias): cuatro puertas, ficha completa con fotos, «algo se rompió» que arma el pedido, compartir por pedido y revocar | 1A, 1B, 2C     | Opus 5.5 · high   |
| 3B   | FE   | **Obras de varios días y en equipo** (O-Propuesta, O-Obra, O-Dia, O-Repuesto, O-Fecha, O-Grupo, O-Pagos, O-Gastado), alineado con la sesión del especialista                                                                                                   | 1A, 1B, 2D, 2E | Opus 5.5 · high   |
| 3C   | FE   | **Herramientas** (T-Herramientas, T-Medir, T-Nivel, T-Linterna, T-Escanear, T-Destino; H-Modelo3D y H-AR detrás de una bandera según 0.4). Medir y nivel con sensores del teléfono; nada sale del dispositivo sin elegirlo                                     | 1A, 0.4        | Opus 5.5 · xhigh  |
| 3D   | BE   | **Servicios de acceso**: alta sin invitación, código por email (y SMS/Google/Apple si 0.3 lo habilita), segunda verificación, sesiones abiertas, descargar datos                                                                                               | 2F, 0.3        | Opus 5.5 · xhigh  |
| 3E   | BE   | **Servicios de dominio**: propuesta extendida y visita, reseñas, informe con antes/después, Mi hogar y compartir por pedido (con vencimiento y revocación), recordatorios                                                                                      | 2F             | Opus 5.5 · xhigh  |

### Ola 4 · Conexión, camino y cierre (4 lotes en paralelo)

| Lote | Repo    | Qué incluye                                                                                                                                                       | Depende de  | Modelo · esfuerzo   |
| ---- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------- |
| 4A   | FE + BE | **Conexión real** de todo lo nuevo (sin caer a mocks), pruebas contra la base aislada y regresión de las dos APIs juntas (usuario + especialista)                 | Ola 3       | Opus 5.5 · high     |
| 4B   | FE + BE | **Camino del hogar** (G-Camino, G-Insignias, G-Insignia, G-Beneficios, G-Hito): hitos por cuidar la casa, sin azar ni rankings; montos y premios recién con Legal | 0.5, 3A, 3E | Sonnet 5.5 · high   |
| 4C   | FE      | **QA final**: axe, teclado, 320 px, texto al 200 %, `prefers-reduced-motion`, e2e de los 13 recorridos, capturas comparadas con el lienzo                         | 4A          | Sonnet 5.5 · high   |
| 4D   | Docs    | Handoff, mapa de pantallas, plan, Figma sincronizado con lo construido                                                                                            | 4A, 1C      | Sonnet 5.5 · medium |

### Después: Fase 5 · Deploy (ya planificada)

Readiness, CI, deploy de prueba, prueba en dos celulares y deploy final: **solo con autorización** (Render, Neon,
Hostinger, Mercado Pago).

## Resumen

| Ola | Lotes en paralelo           | Termina cuando                                                      |
| --- | --------------------------- | ------------------------------------------------------------------- |
| 0   | 6 decisiones                | OK al plan y respuestas 0.2–0.5 (0.4 y 0.5 pueden esperar a su ola) |
| 1   | 1A · 1B · 1C                | Piezas en código, contrato `draft.4` publicado, Figma en curso      |
| 2   | 2A · 2B · 2C · 2D · 2E · 2F | 70 pantallas sobre el mock + esquema migrado en base aislada        |
| 3   | 3A · 3B · 3C · 3D · 3E      | Mi hogar, obras y herramientas sobre el mock + servicios del BE     |
| 4   | 4A · 4B · 4C · 4D           | Todo conectado, camino con Legal, QA en 0, docs al día              |

## Reglas que valen para todas las olas

- Cada lote: su rama, pruebas propias, entrada en `src/mapa/pantallas.ts` por pantalla nueva, capturas, y antes del PR
  `format:check`, `lint`, `typecheck`, `test`, `mapa:check`, `contracts:check`, `build` y `npm audit` (FE) o la lista de
  `handyx-client-be` (BE).
- El contrato se cambia solo en `handyx-client-be` y se copia byte a byte; ningún lote del FE lo edita.
- Datos sintéticos siempre; nada en `localStorage`/`sessionStorage`/IndexedDB/cookies propias; HandIA sin datos personales
  ni IA externa; fee 0 % hasta el 10/12/2026; Handyx no recibe ni reparte el pago; informado ≠ verificado; sin ETA salvo
  el viaje del servidor; nunca animar aceptar o pagar.
- Nada remoto ni compras sin autorización (Neon, Render, Mercado Pago, proveedores de SMS/OAuth, Figma).
- Si dos lotes de una misma ola necesitan tocar el mismo archivo compartido (por ejemplo el mock), el de menor número
  lo deja preparado y el otro lo usa; si no alcanza, el segundo pasa a la ola siguiente.
