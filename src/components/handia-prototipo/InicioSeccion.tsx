// Sección "Inicio y voz" del prototipo: el teléfono interactivo y qué cambió respecto de la versión anterior.
import { InicioChat } from './InicioChat';

export function InicioSeccion() {
  return (
    <div className="hxi">
      <InicioChat />
      <div className="hxi-texto">
        <p className="hxp-intro">
          Inicio ahora es HandIA a pantalla completa: los rubros arriba, el saludo en el centro y la
          barra para escribir abajo. Conversa de verdad con el motor de HandIA (en el celular, sin
          IA externa): escribí, tocá un rubro o un ejemplo.
        </p>
        <ul>
          <li>
            <strong>Modo voz</strong>: el botón azul abre una pantalla oscura con la esfera (cielo
            Handyx con la luz cálida de la lamparita) y controles finos. Lo que se habla queda en el
            mismo chat.
          </li>
          <li>
            En el prototipo la voz es una <strong>simulación</strong>: no usa el micrófono. Tocar la
            esfera simula que dijiste lo siguiente.
          </li>
          <li>
            Menos amarillo: el amarillo verdoso queda para la marca; la luz de HandIA es ámbar y
            aparece poco.
          </li>
          <li>Botones más chicos y finos; la barra de abajo sin la placa azul.</li>
        </ul>
      </div>
    </div>
  );
}
