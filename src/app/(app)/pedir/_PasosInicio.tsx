'use client';
// Pedir · P-Rubro, P-Que (el centro del camino corto), P-Fotos y P-Cuando.
import { FotoSubida } from '@/components/FotoSubida';
import { Icono } from '@/components/Icono';
import { useIr } from '@/components/nav';
import { RUBROS } from '@/contracts/v1/pedidos';
import { dejarBorrador } from '@/data/borrador';
import { RUBROS_INFO } from '@/domain/etiquetas';
import { AVISO_SEGURIDAD, detectarRubro } from '@/domain/handia';
import {
  Boton,
  Chip,
  Etiqueta,
  FilaEnlace,
  MosaicoIcono,
  Nota,
  Opcion,
  Sub,
  Titulo,
} from '@/ui';
import { MiniAccion, PantallaPedir, type Volver } from '@/ui/pedir';
import type { Pedido } from './_pedido';
import { PROBLEMAS } from './_problemas';

const AL_INICIO: Volver = { href: '/inicio/', etiqueta: 'Volver al inicio' };

export function PasoRubro({ f }: { f: Pedido }) {
  return (
    <PantallaPedir titulo="Pedir un arreglo" volver={AL_INICIO}>
      <div className="ds-pila">
        <Titulo nivel={2} texto="¿Qué tipo de ==arreglo==?" />
        <Sub>Elegí el rubro. Si no sabés cuál es, HandIA te ayuda.</Sub>
      </div>
      <div className="ds-grilla" style={{ ['--ds-cols' as string]: 3 }} role="group" aria-label="Rubros">
        {RUBROS.map((r) => (
          <button
            key={r}
            type="button"
            className="ds-mosaico"
            aria-pressed={f.rubro === r}
            onClick={() => {
              f.setRubro(r);
              f.setProblema(null);
              f.ir('que');
            }}
          >
            <Icono nombre={RUBROS_INFO[r].icono} />
            <span aria-hidden="true">{RUBROS_INFO[r].corto}</span>
            <span className="ds-solo-lector">
              {RUBROS_INFO[r].nombre}: {RUBROS_INFO[r].ejemplo}
            </span>
          </button>
        ))}
      </div>
      <FilaEnlace
        icono="chispas"
        tono="gris"
        titulo="¿No sabés qué rubro es?"
        sub="Contale a HandIA lo que pasa"
        href="/handia/"
      />
      <Nota icono="info" tono="gris">
        Por ahora Handyx trabaja con estos seis rubros en Mar del Plata.
      </Nota>
    </PantallaPedir>
  );
}

export function PasoQue({ f, desdeInicio }: { f: Pedido; desdeInicio: boolean }) {
  const irA = useIr();
  if (!f.rubro) return null;
  const rubro = f.rubro;
  const info = RUBROS_INFO[rubro];
  const seguridad = detectarRubro(f.descripcion).seguridad;
  const error = f.errores.descripcion;
  return (
    <PantallaPedir
      titulo={info.nombre}
      sub="Paso 1 de 2"
      volver={
        desdeInicio ? AL_INICIO : { alTocar: () => f.ir('rubro'), etiqueta: 'Cambiar el rubro' }
      }
      onSubmit={() => f.confirmar('que', 'revisar')}
      nota="Si no elegís día, va como «lo antes posible»."
      pie={
        <Boton type="submit" icono="flecha">
          Revisar y publicar
        </Boton>
      }
    >
      <div className="ds-fila">
        <MosaicoIcono icono={info.icono} tam={3.5} />
        <Titulo nivel={2} tam={1.75} texto="¿Qué ==pasa==?" id="que-pasa" />
      </div>
      <div className="ds-pila" role="radiogroup" aria-labelledby="que-pasa" style={{ ['--ds-gap' as string]: '0.5rem' }}>
        {PROBLEMAS[rubro].map((p) => (
          <Opcion
            key={p}
            titulo={p}
            elegida={f.problema === p}
            onElegir={() => {
              f.setProblema(f.problema === p ? null : p);
              f.setLocal({});
            }}
          />
        ))}
      </div>
      {seguridad ? (
        <Nota icono="alerta" tono="error" rol="alert">
          {AVISO_SEGURIDAD[seguridad]}
        </Nota>
      ) : null}
      <label className="ds-pila" style={{ ['--ds-gap' as string]: '0.375rem' }}>
        <span className="ds-fila-enlace__titulo" style={{ fontSize: '0.875rem' }}>
          Contalo con tus palabras {f.problema ? '(opcional)' : ''}
        </span>
        <textarea
          className="entrada"
          rows={3}
          maxLength={900}
          value={f.texto}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'que-error' : undefined}
          onChange={(e) => f.setTexto(e.target.value)}
        />
      </label>
      {error ? (
        <p className="campo__error" id="que-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="ds-fila" style={{ justifyContent: 'space-between' }}>
        <Etiqueta como="h3">Fotos y medidas</Etiqueta>
        <Chip tono="gris">Opcional</Chip>
      </div>
      <div className="ds-grilla" style={{ ['--ds-cols' as string]: 3, ['--ds-gap' as string]: '0.5rem' }}>
        <MiniAccion
          icono="camara"
          texto={f.fotos.length ? `Fotos (${f.fotos.length})` : 'Foto'}
          onClick={() => f.ir('fotos')}
          etiqueta={f.fotos.length ? `Fotos: ${f.fotos.length} sumadas` : 'Sumar fotos'}
        />
        <MiniAccion
          icono="regla"
          texto="Medir"
          etiqueta="Medir con la cámara"
          onClick={() => {
            // Lo escrito queda en memoria para cuando vuelvas (nunca en el navegador).
            dejarBorrador({ rubro, descripcion: f.descripcion });
            irA('/herramientas/medir/');
          }}
        />
        <MiniAccion
          icono="hogar"
          texto="De Mi hogar"
          marcada={f.deMiHogar}
          onClick={() => f.setDeMiHogar(!f.deMiHogar)}
          etiqueta="Sumar datos de Mi hogar al publicar"
        />
      </div>
      {f.deMiHogar ? (
        <Nota icono="hogar">Al publicar, elegís qué datos de Mi hogar ven los especialistas.</Nota>
      ) : null}
    </PantallaPedir>
  );
}

export function PasoFotos({ f }: { f: Pedido }) {
  const volver = () => f.ir('revisar');
  return (
    <PantallaPedir
      titulo="Fotos"
      sub="Opcional"
      volver={{ alTocar: volver, etiqueta: 'Volver a revisar el pedido' }}
      pie={
        <Boton icono="check" onClick={volver}>
          Listo
        </Boton>
      }
    >
      <div className="ds-pila">
        <Titulo nivel={2} texto="Sumá ==fotos==" />
        <Sub>Opcional: ayudan a que las propuestas sean más justas. Hasta 5.</Sub>
      </div>
      <FotoSubida onCambio={() => undefined} estado={f.estadoFotos} etiqueta="Sacar o elegir una foto" />
      <Nota icono="escudo">
        Que no se vean caras, documentos ni la dirección. Quedan privadas: solo las ven quienes participan
        del pedido.
      </Nota>
      <Nota icono="info" tono="gris">
        HandIA no ve tus fotos: van al pedido, para los especialistas.
      </Nota>
    </PantallaPedir>
  );
}

export function PasoCuando({ f }: { f: Pedido }) {
  const volver: Volver = { alTocar: () => f.ir('revisar'), etiqueta: 'Volver a revisar el pedido' };
  return (
    <PantallaPedir titulo="¿Para cuándo?" sub="Cambiar" volver={volver}>
      <div className="ds-pila">
        <Titulo nivel={2} texto="¿Para ==cuándo==?" id="para-cuando" />
        <Sub>Si es urgente, no hace falta el calendario. Los especialistas proponen día y precio.</Sub>
      </div>
      <div className="ds-pila" role="radiogroup" aria-labelledby="para-cuando" style={{ ['--ds-gap' as string]: '0.5rem' }}>
        <Opcion
          icono="reloj"
          titulo="Lo antes posible"
          sub="Les avisamos a especialistas de tu zona; elegís entre las propuestas que lleguen"
          elegida={f.tipo === 'urgente'}
          onElegir={() => {
            f.setTipo('urgente');
            f.ir('revisar');
          }}
        />
        <Opcion
          icono="calendario"
          titulo="Programar un día"
          sub="Elegís el día y la franja que te queden bien"
          elegida={f.tipo === 'programado'}
          onElegir={() => {
            f.setTipo('programado');
            f.ir('programar');
          }}
        />
        <Opcion
          icono="obra"
          titulo="Es una obra de varios días"
          sub="Baño, cocina, pintura o ampliación: propuesta por etapas"
          elegida={f.tipo === 'obra'}
          onElegir={() => {
            f.setTipo('obra');
            f.ir('programar');
          }}
        />
      </div>
      <Nota icono="info" tono="gris">
        En una urgencia cada especialista te dice a qué hora puede ir: no prometemos cuánto tarda.
      </Nota>
    </PantallaPedir>
  );
}
