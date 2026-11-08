import { Marco } from '@/components/Marco';
import { EstadoSistema } from '@/components/Sistema';
import { Boton } from '@/ui';

export default function NoEncontrada() {
  return (
    <Marco>
      <EstadoSistema
        handy={{ img: 'handy-llave-rota', ancho: 581, alto: 547 }}
        titulo="No encontramos esta ==página=="
        acciones={
          <>
            <Boton icono="casa" href="/inicio/">
              Ir al inicio
            </Boton>
            <Boton variante="contorno" icono="pregunta" href="/ayuda/">
              Centro de ayuda
            </Boton>
          </>
        }
      >
        <p>
          Puede que el enlace esté viejo o que ya no tengas acceso. No se perdió nada de tu cuenta.
        </p>
      </EstadoSistema>
    </Marco>
  );
}
