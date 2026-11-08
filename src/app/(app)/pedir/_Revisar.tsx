'use client';
// Pedir · P-Revisar: resumen azul, lo que falta se completa ahí mismo («Cambiar»/«Sumar») y el precio en noche.
import { useState } from 'react';
import { Aviso, Campo, Hoja } from '@/components/ui';
import { pesos } from '@/domain/dinero';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { fechaLarga } from '@/domain/fechas';
import { centavosDePesos } from '@/domain/formularios';
import { Boton, Etiqueta, Interruptor, MosaicoIcono, Nota, Tarjeta } from '@/ui';
import { FilaResumen, PantallaPedir } from '@/ui/pedir';
import type { Pedido } from './_pedido';

export function PasoRevisar({ f }: { f: Pedido }) {
  const [hojaPrecio, setHojaPrecio] = useState(false);
  if (!f.rubro) return null;
  const info = RUBROS_INFO[f.rubro];
  const { envio } = f;
  const error = envio.error;
  const cuando =
    f.tipo === 'urgente'
      ? 'Lo antes posible'
      : f.fecha && f.desde
        ? `${fechaLarga(f.fecha)} · ${f.franja?.texto ?? `${f.desde} h`}`
        : 'Falta elegir el día';
  const direccion = [f.ubicacion.direccion, f.ubicacion.barrio].filter(Boolean).join(' · ');
  const precioOk = f.precio ? centavosDePesos(f.precio) : null;
  const maxOk = f.auto ? centavosDePesos(f.autoMax) : null;
  const texto = f.texto.trim();

  return (
    <PantallaPedir
      titulo="Revisar y publicar"
      sub="Paso 2 de 2"
      volver={{ alTocar: () => f.ir('que'), etiqueta: 'Volver a qué pasa' }}
      pie={
        <Boton icono="enviar" ocupado={envio.pendiente} onClick={() => void f.publicar()}>
          {envio.pendiente ? 'Publicando…' : 'Publicar el pedido'}
        </Boton>
      }
    >
      <Tarjeta tono="azul" etiqueta="Tu pedido">
        <div className="ds-fila">
          <MosaicoIcono icono={info.icono} tam={3.25} tono="velo" />
          <span className="ds-pila" style={{ ['--ds-gap' as string]: '0.125rem' }}>
            <Etiqueta>Tu pedido</Etiqueta>
            <strong
              className="ds-titulo"
              style={{ ['--ds-tam' as string]: '1.375rem', color: 'inherit' }}
            >
              {info.nombre}
            </strong>
            {f.problema ? <span className="ds-sub">{f.problema}</span> : null}
          </span>
        </div>
        {texto ? (
          <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.4 }}>«{texto}»</p>
        ) : null}
      </Tarjeta>

      <Tarjeta>
        <div>
          <FilaResumen
            icono="reloj"
            etiqueta="Cuándo"
            valor={cuando}
            accion="Cambiar"
            falta={f.tipo !== 'urgente' && !(f.fecha && f.desde)}
            onClick={() => f.ir('cuando')}
          />
          <FilaResumen
            icono="pin"
            etiqueta="Dónde"
            valor={direccion ? `${direccion} · guardada` : 'Falta la dirección'}
            accion="Cambiar"
            falta={!direccion}
            onClick={() => f.ir('direccion')}
          />
          <FilaResumen
            icono="camara"
            etiqueta="Fotos"
            valor={
              f.fotos.length
                ? `${f.fotos.length} ${f.fotos.length === 1 ? 'foto' : 'fotos'}`
                : 'Ninguna (opcional)'
            }
            accion="Sumar"
            onClick={() => f.ir('fotos')}
          />
        </div>
      </Tarjeta>

      <Tarjeta tono="noche" etiqueta="El precio">
        <Etiqueta>El precio lo pone cada especialista</Etiqueta>
        <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: 1.4 }}>
          Te llegan propuestas con precio, día y perfil. Las ves todas antes de elegir.
        </p>
        {precioOk || maxOk ? (
          <p style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800 }}>
            {[
              precioOk ? `Proponés ${pesos(precioOk)}` : null,
              maxOk ? `Aceptación automática hasta ${pesos(maxOk)}` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        ) : null}
        <Boton variante="blanco" chico icono="billete" onClick={() => setHojaPrecio(true)}>
          {precioOk || maxOk ? 'Cambiar mi precio' : 'Proponer un precio (opcional)'}
        </Boton>
      </Tarjeta>

      <Nota icono="billete" tono="gris">
        Tarifa de servicio: 0 % hasta el 10/12/2026. El trabajo lo pagás directo al especialista.
      </Nota>

      {error ? (
        <Aviso tipo="error" titulo="No pudimos publicar el pedido">
          <p>{error.mensaje}</p>
          {error.recuperable ? (
            <p>
              Tus datos siguen acá: tocá «Publicar el pedido» para reintentar. No se va a crear dos
              veces.
            </p>
          ) : null}
        </Aviso>
      ) : null}

      <Hoja abierta={hojaPrecio} onCerrar={() => setHojaPrecio(false)} titulo="Proponer un precio">
        <div className="ds ds-pila">
          <Campo
            etiqueta="Precio que te gustaría pagar"
            opcional
            error={f.errores.precio}
            ayuda="Es una propuesta para empezar: el especialista puede aceptarla, rechazarla o proponerte otra."
          >
            {(p) => (
              <input
                {...p}
                className="entrada"
                inputMode="numeric"
                placeholder="45.000"
                value={f.precio}
                onChange={(e) => f.setPrecio(e.target.value)}
              />
            )}
          </Campo>
          <Interruptor
            etiqueta="Aceptar sola una propuesta de hasta cierto importe"
            sub="Está apagado. Si lo prendés, la primera propuesta que entre en tu máximo se acepta sola y se crea el trabajo."
            activo={f.auto}
            onCambiar={f.setAuto}
          />
          {f.auto ? (
            <Campo etiqueta="Importe máximo" error={f.errores.autoMax} requerido>
              {(p) => (
                <input
                  {...p}
                  className="entrada"
                  inputMode="numeric"
                  placeholder="50.000"
                  value={f.autoMax}
                  onChange={(e) => f.setAutoMax(e.target.value)}
                />
              )}
            </Campo>
          ) : null}
          <Boton icono="check" onClick={() => setHojaPrecio(false)}>
            Listo
          </Boton>
          {f.precio || f.auto ? (
            <Boton
              variante="contorno"
              icono="cerrar"
              onClick={() => {
                f.setPrecio('');
                f.setAuto(false);
                f.setAutoMax('');
                setHojaPrecio(false);
              }}
            >
              Sin precio propio
            </Boton>
          ) : null}
        </div>
      </Hoja>
    </PantallaPedir>
  );
}
