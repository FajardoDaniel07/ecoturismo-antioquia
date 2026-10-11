# ADR 0005 — Visor de fotos propio sobre `<dialog>`

Estado: Aceptado (2026-10-10, aprobado por el humano) · Fecha: 2026-10-10 · Feature: 001-landing-completa

## Contexto
`CLAUDE.md` deja abierta la galería: "PhotoSwipe o implementación propia". `design.md` S8.2 define
un visor concreto:

- Botones con su palabra escrita ("Cerrar", "Anterior", "Siguiente"), sin iconos.
- El cambio de foto es inmediato, sin animación; solo abrir y cerrar se desvanecen en 250 ms.
- No da la vuelta: en los extremos el botón queda desactivado pero enfocable y se anuncia así.
- Pie con nombre del destino, etiqueta de piso y crédito con dos enlaces, dentro del ciclo de foco.
- Anuncio de la posición ("3 de 12") y del texto alternativo al cambiar; anuncio del error de carga.
- Deslizamiento horizontal de más de 48 px en móvil. No pide zoom ni arrastre.
- Todo color y duración sale de los tokens (CA-105).

## Decisión
Implementación propia sobre el elemento nativo `<dialog>` abierto con `showModal()`, sin
dependencias. Presupuesto: 4 KB gzip de JavaScript, cargados de forma diferida (ADR 0004).

- `showModal()` aporta el diálogo modal, el foco atrapado, el fondo inerte, el cierre con Esc y la
  vuelta del foco al elemento que lo abrió.
- El marcado del diálogo va en un `<template>` del componente, con los textos en español en el
  HTML y no en el JavaScript. Sin JavaScript no existe.
- El pie se obtiene clonando el `<figcaption>` de la miniatura.
- El estado (índice, extremos, contador, deslizamiento) son funciones puras de `src/lib/gallery/`.

## Alternativas consideradas
**PhotoSwipe 5.4.4** (MIT; última versión de mayo de 2024). Medido el 2026-10-10: 16.4 KB gzip el
núcleo más 4.5 KB el lightbox, y 2.4 KB de CSS.

- Su valor está en el zoom con pellizco, el arrastre y las transiciones entre fotos: el diseño no
  usa lo primero y prohíbe lo último.
- Habría que desmontar o reemplazar la interfaz por defecto (iconos, flechas, contador), registrar
  un pie propio con enlaces enfocables, añadir los anuncios para lector de pantalla y sobrescribir
  su CSS, que trae colores y duraciones ajenos a los tokens.
- Cinco veces el peso para acabar escribiendo casi la misma cantidad de código propio.

**Otras librerías de lightbox** (GLightbox, Fancybox): mismo desajuste; Fancybox además tiene
licencia comercial.

## Consecuencias
- (+) 4 KB frente a 20.9 KB, y ninguna dependencia que vigilar.
- (+) La accesibilidad del diálogo la da el navegador, no una reimplementación.
- (+) El visor cumple el diseño sin luchar contra los estilos de un tercero.
- (−) Mantenemos nosotros los casos límite: bloqueo del desplazamiento del fondo, gesto de
  deslizamiento, error de carga. Cada uno tiene su criterio y su prueba e2e (CA-55 a CA-64).
- (−) El desvanecido de apertura y cierre usa `@starting-style` y `transition-behavior:
  allow-discrete`; en navegadores anteriores a 2024 el cambio es inmediato.
- (−) Si en el futuro se pide zoom con pellizco, habrá que reconsiderar PhotoSwipe en un ADR nuevo.
