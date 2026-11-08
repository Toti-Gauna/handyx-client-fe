'use client';

import { Enlace } from '@/components/nav';
import { TituloDocumento } from '@/components/TituloDocumento';
import { esVistaDePrueba } from '@/data';
import { AccionesFijas, Boton, Etiqueta, Marca, Texto } from '@/ui';
import { EscenaCiudad } from '@/ui/acceso';

/**
 * Bienvenida (fila A del lienzo): Mar del Plata ilustrada, una frase y las dos entradas. Las dos llevan al mismo
 * acceso con código (sin contraseña): si la cuenta no existe, se crea al verificar el código.
 */
export default function Bienvenida() {
  return (
    <div className="pantalla du-app dsa-pantalla">
      <TituloDocumento texto="Bienvenida" />
      <div className="pantalla__scroll">
        <div className="dsa-cabecera dsa-cabecera--ciudad">
          <EscenaCiudad alto={430} />
          <p className="dsa-marca">
            <strong>Handyx</strong>
            <span>Soluciones, no problemas</span>
          </p>
        </div>
        <div className="ds-cuerpo" style={{ gap: '0.625rem' }}>
          <Etiqueta>Para vecinos de Mar del Plata</Etiqueta>
          <h1 className="ds-titulo" style={{ ['--ds-tam' as string]: '2rem' }} tabIndex={-1}>
            <Marca texto="Arreglos de casa con especialistas ==verificados==" />
          </h1>
          <Texto>
            Contás qué pasa, recibís propuestas con precio y elegís vos. Pagás directo al
            especialista.
          </Texto>
          {esVistaDePrueba ? (
            <Enlace className="dsa-enlace" href="/mapa/">
              Ver el mapa de pantallas
            </Enlace>
          ) : null}
        </div>
      </div>
      <AccionesFijas>
        <Boton href="/registro/">Crear cuenta</Boton>
        <Boton href="/ingresar/" variante="contorno">
          Ya tengo cuenta
        </Boton>
      </AccionesFijas>
    </div>
  );
}
