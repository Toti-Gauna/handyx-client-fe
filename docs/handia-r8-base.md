# HandIA · R8 · Base en código

Lote R8 de la fase R ([`handia-premium-plan.md`](handia-premium-plan.md)): lo que construyen H2 (modo voz) y H3 (chat
premium) ya existe como base probada. Sale de R3 a R6 ([`handia-r3-r6-diseno.md`](handia-r3-r6-diseno.md)).

## Qué hay

| Pieza                                   | Archivo                                           | Para qué                                                                                                |
| --------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Tokens de color                         | `src/styles/tokens.css` §3                        | Paleta HandIA (`--hia-noche` … `--hia-riesgo`)                                                          |
| Tokens de la dirección                  | `src/styles/tokens.css` §4                        | Escenas, vidrio, burbujas, formas, tipografía, movimiento                                               |
| Clases                                  | `src/styles/handia.css` (global, en `layout.tsx`) | `.hia-*`: escenas, orbe, vidrio, burbujas, chips, botones, controles de voz, chat, ficha, riesgo        |
| `Orbe`                                  | `src/components/handia/piezas.tsx`                | Estados reposo, escuchando, pensando, hablando, listo, apagado; `nivel` 0–1 para el micrófono real (H2) |
| `DegradeVivo`, `Escena`                 | ídem                                              | Fondo vivo y escena `voz` / `chat`                                                                      |
| `TarjetaVidrio`                         | ídem                                              | Clara u oscura, siempre con borde                                                                       |
| `BotonPremium`                          | ídem                                              | Primario, destacado, vidrio; nunca animado                                                              |
| `BurbujaHandia`                         | ídem                                              | `ia` o `yo`                                                                                             |
| `PasosPensando`, `Dicho`, `AvisoRiesgo` | ídem                                              | Pensando visible, texto que se resalta al decirlo, riesgo primero                                       |
| Íconos propios                          | `src/components/trazos.ts`                        | handia, onda, subtítulos, encuadre, sinSenal, vibrar                                                    |
| Galería                                 | `/diseno/#handia`                                 | Las piezas juntas                                                                                       |
| Prototipo                               | `/diseno/handia/`                                 | Pantallas, lenguaje, movimiento y las 3 direcciones                                                     |

Las piezas son presentacionales: no escuchan, no suenan, no guardan ni piden datos. El estado lo decide quien las
usa (en H2/H3, el motor `src/domain/handia-motor.ts` y el hook de voz). La pantalla real `/handia/` **todavía no** se
cambió: eso es H2/H3, después de la aprobación de R7.

## Reglas que fijan las pruebas

`tests/handia-prototipo.test.ts`: la dirección vive en un bloque de tokens; los botones premium no se animan; "reducir
movimiento" deja todo quieto; las piezas no usan micrófono, voz, audio, vibración, almacenamiento ni red; el orbe es
decorativo. `tests/diseno.test.ts`: sin colores fuera de `tokens.css`. `tests/pwa.test.ts`: la app sigue sin sonido ni
vibración (el prototipo es la única excepción, para aprobar R5).

## Verificación (07/11)

- `format:check`, `lint`, `typecheck`, `test` (215), `mapa:check`, `contracts:check`, `build`.
- Playwright: el prototipo en 1280 y 390 px en sus 4 secciones, sin fallas de axe y sin desborde horizontal; escenas
  de GSAP con y sin "reducir movimiento"; la galería `#handia` sin fallas de axe; `tests/e2e/handia.cjs` sigue OK.
- `npm audit --omit=dev`: 0. Con dependencias de desarrollo aparecen dos avisos moderados que ya estaban (vitest
  ≤ 4.1.11 y minimatch vía eslint); no los trae GSAP.

## Cómo se usa en H2/H3

```tsx
import { Escena, Orbe, BurbujaHandia, PasosPensando } from '@/components/handia/piezas';

<Escena tipo="voz" className="hia-voz">
  <Orbe estado={voz.escuchando ? 'escuchando' : 'reposo'} nivel={nivelMicrofono} />
  <p className="hia-rotulo">Te escucho</p>
</Escena>;
```
