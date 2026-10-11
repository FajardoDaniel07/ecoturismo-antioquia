/**
 * Cargador de islas (ADR 0004): el equivalente de `client:visible` para islas sin framework. Llama
 * a `load` una sola vez, la primera vez que el elemento se acerca a la ventana (300 px de margen).
 * Si el navegador no tiene `IntersectionObserver`, carga de inmediato.
 */
export function whenVisible(element: Element, load: () => unknown, rootMargin = '300px'): void {
  if (!('IntersectionObserver' in window)) {
    load();
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        observer.disconnect();
        load();
      }
    },
    { rootMargin },
  );
  observer.observe(element);
}
