# Cobertura de la suite esencial (C-8)

Qué criterios de `spec.md` comprueba hoy la suite automática y cuáles no. Generado el 2026-10-12 a partir
de las pruebas existentes. **No hay una prueba por criterio** (decisión del humano del 2026-10-11); lo que no
aparece aquí queda sin verificar automáticamente.

- `~` marca una cobertura **parcial**: la prueba comprueba una parte del criterio; la nota dice cuál.
- Las filas "unitaria" salen de los criterios que cada prueba cita en su título (`describe`, `test`, `it`); no
  se auditaron una a una contra el texto del criterio.
- Alcance: solo el modo académico. El modo de operador real queda en el código, sin pruebas (CA-118 a, CA-119 a,
  CA-121 b).
- Retirados en la spec y fuera de la cuenta: CA-73, CA-84, CA-85, CA-86, CA-87, CA-88, CA-89, CA-90, CA-92, CA-138.

Cómo se ejecutan: `npm run test` (unitarias), `npm run test:build` (compila escenarios, unos 5 minutos),
`npm run test:e2e` (Playwright con axe, unos 3 minutos) y `npm run test:lh` (Lighthouse CI, unos 2 minutos).

## Criterios comprobados

| Criterio | Tipo | Archivo | Qué se comprueba |
|---|---|---|---|
| CA-2 | unitaria | tests/unit/units.test.ts | según el título de la prueba |
| CA-4 | unitaria | tests/unit/profile-geometry.test.ts | según el título de la prueba |
| CA-5 | unitaria | tests/unit/profile-geometry.test.ts | según el título de la prueba |
| CA-7 | unitaria | tests/unit/profile-geometry.test.ts | según el título de la prueba |
| CA-12 | unitaria | tests/unit/sort.test.ts | según el título de la prueba |
| CA-13 | unitaria | tests/unit/sort.test.ts | según el título de la prueba |
| CA-14 | unitaria | tests/unit/sort.test.ts | según el título de la prueba |
| CA-15 | build | tests/build/gates.test.ts | dos destinos principales en un piso: falla en vista previa y publicación |
| CA-15 | unitaria | tests/unit/sort.test.ts, tests/unit/validate-destinos.test.ts | según el título de la prueba |
| CA-20 | build | tests/build/gates.test.ts | altitud de 0 m: falla en las dos compilaciones, con archivo y campo |
| CA-20 | unitaria | tests/unit/schemas.test.ts | según el título de la prueba |
| CA-21 | unitaria | tests/unit/ficha.test.ts | según el título de la prueba |
| CA-22 | unitaria | tests/unit/ficha.test.ts, tests/unit/units.test.ts | según el título de la prueba |
| CA-23 | unitaria | tests/unit/units.test.ts | según el título de la prueba |
| CA-24 | unitaria | tests/unit/schemas.test.ts, tests/unit/units.test.ts | según el título de la prueba |
| CA-25 | unitaria | tests/unit/units.test.ts | según el título de la prueba |
| CA-26 | unitaria | tests/unit/units.test.ts | según el título de la prueba |
| CA-27 | unitaria | tests/unit/ficha.test.ts, tests/unit/schemas.test.ts, tests/unit/units.test.ts | según el título de la prueba |
| CA-28 | unitaria | tests/unit/units.test.ts | según el título de la prueba |
| CA-29 | unitaria | tests/unit/validate-destinos.test.ts, tests/unit/zones.test.ts | según el título de la prueba |
| CA-31 | build | tests/build/gates.test.ts | siete páginas /destinos/<slug>/ en kebab-case; el destino sin altitud verificada no tiene página |
| CA-31 | unitaria | tests/unit/validate-destinos.test.ts | según el título de la prueba |
| CA-33 | unitaria | tests/unit/schemas.test.ts, tests/unit/small-utils.test.ts, tests/unit/validate-destinos.test.ts | según el título de la prueba |
| CA-36 | unitaria | tests/unit/small-utils.test.ts | según el título de la prueba |
| CA-38 | unitaria | tests/unit/photos.test.ts | según el título de la prueba |
| CA-39 | unitaria | tests/unit/contours.test.ts | según el título de la prueba |
| CA-40 | unitaria | tests/unit/photos.test.ts | según el título de la prueba |
| CA-42 | unitaria | tests/unit/photos.test.ts | según el título de la prueba |
| CA-43 | unitaria | tests/unit/photos.test.ts, tests/unit/validate-resto.test.ts | según el título de la prueba |
| CA-44 | unitaria | tests/unit/photos.test.ts | según el título de la prueba |
| CA-45 | unitaria | tests/unit/photos.test.ts | según el título de la prueba |
| CA-46 | unitaria | tests/unit/schemas.test.ts | según el título de la prueba |
| CA-47 | unitaria | tests/unit/schemas.test.ts, tests/unit/validate-resto.test.ts | según el título de la prueba |
| CA-48 | build | tests/build/gates.test.ts | texto alternativo vacío: falla (el alt con el nombre del autor, solo en unitarias) |
| CA-48 | unitaria | tests/unit/schemas.test.ts, tests/unit/validate-resto.test.ts | según el título de la prueba |
| CA-49 | unitaria | tests/unit/photos.test.ts | según el título de la prueba |
| CA-51 | unitaria | tests/unit/validate-resto.test.ts | según el título de la prueba |
| CA-52 | unitaria | tests/unit/gallery-group.test.ts | según el título de la prueba |
| CA-54 | e2e | tests/e2e/paginas.spec.ts | ~ el visor se abre con Enter sobre una miniatura (clic y toque no se prueban) |
| CA-56 | e2e | tests/e2e/paginas.spec.ts | ~ Esc cierra el visor y el foco vuelve a la miniatura (el tamaño del botón Cerrar no se mide) |
| CA-57 | e2e | tests/e2e/paginas.spec.ts | ~ las flechas cambian de foto (el contador cambia y vuelve); los botones no se prueban |
| CA-57 | unitaria | tests/unit/viewer-state.test.ts | según el título de la prueba |
| CA-60 | unitaria | tests/unit/viewer-state.test.ts | según el título de la prueba |
| CA-64 | unitaria | tests/unit/viewer-state.test.ts | según el título de la prueba |
| CA-65 | e2e | tests/e2e/paginas.spec.ts | sin JavaScript la galería es una cuadrícula de imágenes, sin botones ni diálogo |
| CA-67 | unitaria | tests/unit/validate-resto.test.ts | según el título de la prueba |
| CA-68 | e2e | tests/e2e/mapa.spec.ts | ~ la lista de rutas es visible con y sin JavaScript (se cuentan los elementos; no se comprueba su ficha ni su perfil) |
| CA-70 | e2e | tests/e2e/mapa.spec.ts | ~ al activar una línea (por clic programático) el popup lleva a una entrada existente de la lista; clic real, toque y teclado no se prueban |
| CA-72 | e2e | tests/e2e/mapa.spec.ts | ~ 360 px sin desplazamiento horizontal con el mapa cargado; el mínimo de 24 px de los controles no se mide |
| CA-74 | e2e | tests/e2e/mapa.spec.ts | la atribución de OpenStreetMap es visible con el mapa cargado |
| CA-75 | e2e | tests/e2e/mapa.spec.ts | con las teselas bloqueadas la caja del mapa se oculta (`data-failed`) y la lista queda completa; el fallo del módulo no se prueba |
| CA-76 | unitaria | tests/unit/routes.test.ts | según el título de la prueba |
| CA-77 | unitaria | tests/unit/schemas.test.ts, tests/unit/validate-resto.test.ts | según el título de la prueba |
| CA-78 | unitaria | tests/unit/schemas.test.ts, tests/unit/validate-resto.test.ts | según el título de la prueba |
| CA-79 | e2e | tests/e2e/mapa.spec.ts | la carga inicial no pide el módulo, el CSS de Leaflet, los trazados ni teselas (con las teselas interceptadas) |
| CA-79 | unitaria | tests/unit/routes.test.ts | según el título de la prueba |
| CA-80 | e2e | tests/e2e/mapa.spec.ts | ~ sin JavaScript no hay caja del mapa, la lista sigue y cada ruta enlaza a su destino |
| CA-83 | unitaria | tests/unit/small-utils.test.ts | según el título de la prueba |
| CA-93 | unitaria | tests/unit/small-utils.test.ts | según el título de la prueba |
| CA-97 | unitaria | tests/unit/small-utils.test.ts, tests/unit/validate-resto.test.ts | según el título de la prueba |
| CA-99 | build | tests/build/gates.test.ts | el mensaje de los ocho errores nombra el archivo, el campo y el criterio |
| CA-99 | unitaria | tests/unit/validate-destinos.test.ts | según el título de la prueba |
| CA-100 | unitaria | tests/unit/validate-destinos.test.ts | según el título de la prueba |
| CA-104 | build | tests/build/gates.test.ts | altitud sin verificar: avisa en vista previa, excluye el destino y falla en publicación |
| CA-104 | unitaria | tests/unit/validate-destinos.test.ts | según el título de la prueba |
| CA-106 | e2e | tests/e2e/paginas.spec.ts | ~ solo el teclado en el visor de fotos; no se recorre cada página con Tab |
| CA-108 | e2e (axe) | tests/e2e/paginas.spec.ts, tests/e2e/mapa.spec.ts | ~ axe sin serious ni critical en inicio, un detalle con fotos, una legal, créditos y 404, y en inicio con el mapa cargado; faltan el detalle sin fotos y las otras dos legales |
| CA-110 | e2e | tests/e2e/paginas.spec.ts | ~ 360 px sin desplazamiento horizontal en inicio, detalle, legal, créditos y 404 (no se recorren los siete detalles ni las tres legales) |
| CA-112 | e2e | tests/e2e/paginas.spec.ts, tests/e2e/mapa.spec.ts | ~ sin JavaScript: contenido, enlaces a destinos y créditos, galería como cuadrícula y lista de rutas; no se recorre toda la página |
| CA-115 | Lighthouse | lighthouserc.json (npm run test:lh) | ~ móvil, una pasada: inicio, un detalle con fotos y una legal ≥ 90 en las cuatro categorías, sin la auditoría `is-crawlable`; no se mide un detalle sin fotos |
| CA-116 | Lighthouse | lighthouserc.json (npm run test:lh) | ~ LCP ≤ 2,5 s, CLS ≤ 0,1 y TBT ≤ 200 ms en móvil, una pasada, en las tres páginas |
| CA-118 | unitaria | tests/unit/schemas.test.ts, tests/unit/validate-modos.test.ts, tests/unit/validate-resto.test.ts | según el título de la prueba |
| CA-119 | build | tests/build/gates.test.ts | rama académica: un identificador cargado falla en ambas compilaciones |
| CA-119 | unitaria | tests/unit/schemas.test.ts, tests/unit/validate-modos.test.ts, tests/unit/validate-resto.test.ts | según el título de la prueba |
| CA-120 | unitaria | tests/unit/placeholders.test.ts, tests/unit/validate-modos.test.ts, tests/unit/validate-resto.test.ts | según el título de la prueba |
| CA-121 | build | tests/build/gates.test.ts | ~ rama académica: los legales sin fecha ni identificador y con rótulo; no se prueba el enlace desde el pie |
| CA-121 | unitaria | tests/unit/schemas.test.ts | según el título de la prueba |
| CA-122 | build | tests/build/gates.test.ts | destino fuera del rango declarado (umbrales desordenados: solo unitarias) |
| CA-122 | unitaria | tests/unit/schemas.test.ts, tests/unit/validate-destinos.test.ts | según el título de la prueba |
| CA-125 | build | tests/build/gates.test.ts | sin `siteKind`: falla en ambas compilaciones |
| CA-125 | unitaria | tests/unit/schemas.test.ts, tests/unit/validate-modos.test.ts | según el título de la prueba |
| CA-126 | build + e2e | tests/build/gates.test.ts, tests/e2e/paginas.spec.ts | ~ el aviso está en cada página (HTML construido y región visible en cinco tipos de página); no se mide que quede dentro de la primera pantalla a 360 px |
| CA-132 | unitaria | tests/unit/small-utils.test.ts | según el título de la prueba |
| CA-133 | build + e2e | tests/build/gates.test.ts, tests/e2e/paginas.spec.ts | ~ metaetiqueta noindex en cada página, `robots.txt` sin bloqueo ni `Sitemap` y sin `sitemap.xml`; la cabecera `X-Robots-Tag` de `vercel.json` no se prueba |
| CA-133 | unitaria | tests/unit/small-utils.test.ts | según el título de la prueba |
| CA-134 | build | tests/build/gates.test.ts | texto legal sin rótulo de muestra: falla; los tres legales publicados llevan el rótulo |
| CA-134 | unitaria | tests/unit/schemas.test.ts, tests/unit/validate-modos.test.ts | según el título de la prueba |
| CA-135 | build | tests/build/gates.test.ts | política de datos sin nombrar a Vercel: falla |
| CA-135 | unitaria | tests/unit/routes.test.ts, tests/unit/third-parties.test.ts, tests/unit/validate-modos.test.ts | según el título de la prueba |
| CA-136 | unitaria | tests/unit/third-parties.test.ts | según el título de la prueba |
| CA-137 | unitaria | tests/unit/commercial-terms.test.ts, tests/unit/validate-promesas.test.ts | según el título de la prueba |
| CA-139 | build | tests/build/gates.test.ts | ~ sin `SITE_URL` o con una no absoluta: falla en publicación; altitud sin verificar y dos principales también. Faltan en build: foto inválida, ruta inválida y contacto de relleno (solo unitarias) |
| CA-139 | unitaria | tests/unit/validate-modos.test.ts | según el título de la prueba |

## No verificado automáticamente

52 criterios activos sin ninguna prueba que los cite o los compruebe:

CA-1, CA-3, CA-6, CA-8, CA-9, CA-10, CA-11, CA-16, CA-17, CA-18, CA-19, CA-30, CA-32, CA-34, CA-35, CA-37, CA-41, CA-50, CA-53, CA-55, CA-58, CA-59, CA-61, CA-62, CA-63, CA-66, CA-69, CA-71, CA-81, CA-82, CA-91, CA-94, CA-95, CA-96, CA-98, CA-101, CA-102, CA-103, CA-105, CA-107, CA-109, CA-111, CA-113, CA-114, CA-117, CA-123, CA-124, CA-127, CA-128, CA-129, CA-130, CA-131.

Algunos de ellos se revisan a mano (`[manual]` en la spec: contraste, lector de pantalla, capturas del perfil
aprobadas por el humano el 2026-10-11) y otros dependen de piezas sin prueba, como el hero, la navegación a 360 px
(CA-123), el pie, el contacto y las láminas de altitud.
