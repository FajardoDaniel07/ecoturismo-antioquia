/**
 * Visor de fotos (S8.2, ADR 0005): módulo diferido de la isla `GalleryLightbox`. Sobre el elemento
 * nativo <dialog> abierto con `showModal()`, que aporta el diálogo modal, el foco atrapado, el fondo
 * inerte, Esc y la vuelta del foco. Los textos viven en el <template> del HTML; aquí solo hay
 * comportamiento. El estado (índice, extremos, contador, deslizamiento) son funciones puras de
 * `src/lib/gallery/viewer-state.ts`.
 */
import { controls, step, swipeDirection, type ViewerState } from '../../lib/gallery/viewer-state';

function required<T extends Element>(root: ParentNode, selector: string): T {
  const el = root.querySelector<T>(selector);
  if (!el) throw new Error(`El visor necesita "${selector}"`);
  return el;
}

export function initLightbox(root: HTMLElement): void {
  const items = Array.from(root.querySelectorAll<HTMLElement>('[data-photo-item]'));
  const template = root.querySelector<HTMLTemplateElement>('template[data-lightbox-template]');
  if (items.length === 0 || !template) return;

  let dialog: HTMLDialogElement | null = null;
  let state: ViewerState = { index: 0, total: items.length };
  let opener: HTMLElement | null = null;

  // Miniaturas como botones: la imagen se envuelve, no se reemplaza (CA-54).
  items.forEach((item, index) => {
    const picture = item.querySelector('picture');
    if (!picture) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'lightbox-thumb';
    button.setAttribute(
      'aria-label',
      `Abrir foto de ${item.dataset.destino ?? ''}: ${item.dataset.alt ?? ''}`,
    );
    picture.replaceWith(button);
    button.append(picture);
    button.addEventListener('click', () => open(index, button));
  });

  function build(): HTMLDialogElement {
    const fragment = template!.content.cloneNode(true) as DocumentFragment;
    const dlg = required<HTMLDialogElement>(fragment, 'dialog');
    root.append(fragment);

    required<HTMLButtonElement>(dlg, '[data-close]').addEventListener('click', () => dlg.close());
    const prev = required<HTMLButtonElement>(dlg, '[data-prev]');
    const next = required<HTMLButtonElement>(dlg, '[data-next]');
    prev.addEventListener('click', () => go(-1));
    next.addEventListener('click', () => go(1));

    dlg.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') go(-1);
      else if (event.key === 'ArrowRight') go(1);
    });

    // Un clic en el fondo oscuro, fuera de los controles, no cierra: solo Cerrar o Esc.
    dlg.addEventListener('close', () => {
      abortImage();
      if (opener?.isConnected) opener.focus();
    });

    // Deslizamiento horizontal de más de 48 px (CA-60).
    const stage = required<HTMLElement>(dlg, '[data-stage]');
    let startX = 0;
    let startY = 0;
    stage.addEventListener(
      'touchstart',
      (e) => {
        const t = e.changedTouches[0];
        if (t) [startX, startY] = [t.clientX, t.clientY];
      },
      { passive: true },
    );
    stage.addEventListener(
      'touchend',
      (e) => {
        const t = e.changedTouches[0];
        if (!t) return;
        const dir = swipeDirection(t.clientX - startX, t.clientY - startY);
        if (dir !== 0) go(dir);
      },
      { passive: true },
    );
    return dlg;
  }

  function abortImage(): void {
    if (!dialog) return;
    const img = required<HTMLImageElement>(dialog, '[data-image]');
    // Soltar la petición pendiente de la foto que ya no se muestra (CA-63).
    img.removeAttribute('src');
    img.removeAttribute('srcset');
    img.onload = null;
    img.onerror = null;
  }

  function announce(text: string): void {
    if (!dialog) return;
    const live = required<HTMLElement>(dialog, '[data-live]');
    live.textContent = '';
    window.setTimeout(() => {
      live.textContent = text;
    }, 30);
  }

  function render(): void {
    if (!dialog) return;
    const item = items[state.index];
    if (!item) return;
    const c = controls(state);

    required<HTMLElement>(dialog, '[data-counter]').textContent = c.counter ?? '';
    required<HTMLElement>(dialog, '[data-nav]').hidden = !c.showNav;
    const prev = required<HTMLButtonElement>(dialog, '[data-prev]');
    const next = required<HTMLButtonElement>(dialog, '[data-next]');
    prev.setAttribute('aria-disabled', String(c.prevDisabled));
    next.setAttribute('aria-disabled', String(c.nextDisabled));

    // Pie: se clona el pie sobre tinta de la foto (nombre, piso y crédito con sus enlaces).
    const caption = required<HTMLElement>(dialog, '[data-caption]');
    caption.replaceChildren();
    const captionTemplate = item.querySelector<HTMLTemplateElement>(
      'template[data-viewer-caption]',
    );
    if (captionTemplate) caption.append(captionTemplate.content.cloneNode(true));

    // Imagen ampliada: se pide solo ahora, al abrir o llegar a esta foto (CA-66).
    const status = required<HTMLElement>(dialog, '[data-status]');
    const picture = required<HTMLElement>(dialog, '[data-picture]');
    const img = required<HTMLImageElement>(dialog, '[data-image]');
    abortImage();
    status.hidden = false;
    status.textContent = 'Cargando la foto…';
    picture.hidden = true;
    required<HTMLSourceElement>(dialog, '[data-source-avif]').srcset = item.dataset.fullAvif ?? '';
    required<HTMLSourceElement>(dialog, '[data-source-webp]').srcset = item.dataset.fullWebp ?? '';
    const alt = item.dataset.alt ?? '';
    img.alt = alt;
    img.width = Number(item.dataset.fullWidth) || 0;
    img.height = Number(item.dataset.fullHeight) || 0;
    img.onload = () => {
      status.hidden = true;
      picture.hidden = false;
    };
    img.onerror = () => {
      status.textContent = 'No pudimos cargar esta foto';
      status.hidden = false;
      picture.hidden = true;
      announce('No pudimos cargar esta foto');
    };
    // La alternativa más ligera para navegadores sin <source>: el WebP más grande declarado.
    const webp = (item.dataset.fullWebp ?? '').split(',').pop()?.trim().split(' ')[0] ?? '';
    img.src = webp;

    announce([c.counter, alt].filter(Boolean).join('. '));
  }

  function go(dir: -1 | 1): void {
    const next = step(state, dir);
    // En los extremos no pasa nada: el botón sigue enfocable y anuncia que está desactivado.
    if (next.index === state.index) return;
    state = next;
    render();
  }

  function open(index: number, from: HTMLElement): void {
    opener = from;
    dialog ??= build();
    state = { index, total: items.length };
    render();
    dialog.showModal();
  }
}
