'use client';

// Foco para teclado y lectores de pantalla (Fase 3 · lote 3.2).
//  - Al cambiar de pantalla, el foco va al h1 de la nueva (si todavía está cargando, cuando aparezca).
//  - Al enviar un formulario con errores, el foco va al primer campo inválido (una sola vez por envío).

let focoPendiente = false;

const h1DelContenido = () => document.querySelector<HTMLElement>('#contenido h1');

function enfocar(el: HTMLElement) {
  if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

/** Lo llama el marco cuando cambia la ruta (no en la primera carga). */
export function alNavegar() {
  const h1 = h1DelContenido();
  if (h1) enfocar(h1);
  else focoPendiente = true;
}

/** Lo llama el título de la página al montarse: toma el foco si quedó pendiente de una navegación. */
export function alMontarTitulo() {
  if (!focoPendiente) return;
  const h1 = h1DelContenido();
  if (!h1) return;
  focoPendiente = false;
  enfocar(h1);
}

let envio: { form: HTMLFormElement; en: number } | null = null;

if (typeof document !== 'undefined') {
  document.addEventListener(
    'submit',
    (e) => {
      if (e.target instanceof HTMLFormElement) envio = { form: e.target, en: Date.now() };
    },
    true,
  );
}

/** Si el control `id` es el primer campo inválido del formulario recién enviado, recibe el foco. */
export function enfocarSiPrimerError(id: string) {
  const el = document.getElementById(id);
  const form = el?.closest('form');
  if (!el || !form || !envio || envio.form !== form || Date.now() - envio.en > 15_000) return;
  if (form.querySelector('[aria-invalid="true"]') !== el) return;
  envio = null;
  el.focus();
}
