// Sección "Inicio y voz" del prototipo: el teléfono interactivo y cómo se tradujo la idea al diseño de Handyx.
import { InicioChat } from './InicioChat';

export function InicioSeccion() {
  return (
    <div className="hxi">
      <InicioChat />
      <div className="hxi-texto">
        <p className="hxp-intro">
          La idea de un asistente a pantalla completa, dicha con el diseño que Handyx ya tiene.
          Conversa de verdad con el motor de HandIA (en el celular, sin IA externa): escribí, tocá
          un rubro o un ejemplo.
        </p>
        <ul>
          <li>
            <strong>Inicio</strong>: el logo y los cuadrados azules de siempre, los rubros como
            mosaicos con los Handys, y el saludo con el título de la marca y su subrayado amarillo:
            «¿Qué arreglo podemos hacer hoy?».
          </li>
          <li>
            <strong>Chat</strong>: la cabecera de los chats de Handyx con la lamparita, los tramos
            de progreso como en Pedir, HandIA en burbuja azul y vos en blanco, y la ficha como el
            ticket troquelado de la app, con los botones táctiles.
          </li>
          <li>
            <strong>Modo voz</strong>: el azul de Handyx, la lamparita como foco de luz (ondas
            cuando escucha, se inclina cuando piensa, brilla cuando habla) y lo que dice se va
            subrayando en amarillo, como los títulos. Controles chicos y táctiles. Lo hablado queda
            en el mismo chat.
          </li>
          <li>
            En el prototipo la voz es una <strong>simulación</strong>: no usa el micrófono. Tocar la
            lamparita simula que dijiste lo siguiente; nunca elige por vos cómo pedir.
          </li>
        </ul>
      </div>
    </div>
  );
}
