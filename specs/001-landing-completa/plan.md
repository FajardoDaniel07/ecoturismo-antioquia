# 001 — Plan técnico

Spec: [spec.md](./spec.md) · Diseño: [design.md](./design.md) ·
Dirección visual: [direccion-visual.md](../../docs/design/direccion-visual.md)

Entradas leídas: `CLAUDE.md`, `AGENTS.md`, `spec.md` (APROBADA 2026-10-10, 116 criterios activos),
`design.md` (APROBADO 2026-10-10), `direccion-visual.md` (APROBADO 2026-10-10), `tokens.css`,
ADR 0001 y 0002. Las dos preguntas abiertas de la spec (PA-8 y PA-15) no bloquean el desarrollo
según la propia spec; este plan las trata en "Pendientes".

**Revisión del 2026-10-11 (modo académico y Vercel): aprobada por el humano el 2026-10-11.** El sitio pasa
a ser un ejercicio académico desplegado en Vercel; la spec tiene ahora 131 criterios activos. Los
cambios están en la sección "Revisión del 2026-10-11", que manda sobre el texto anterior donde lo
contradiga, y en la matriz de trazabilidad.

**Revisión del 2026-10-10 (segunda pasada).** El humano respondió las preguntas del plan; sus
decisiones están incorporadas y resumidas en "Decisiones del humano". Después **aprobó
explícitamente el plan y los ADR 0003 a 0010**, incluida la instalación de las cinco dependencias,
y autorizó actualizar `CLAUDE.md`. El desglose está en [tasks.md](./tasks.md).

Este plan no reabre las decisiones ya tomadas (sin ilustrador, contacto por WhatsApp y correo, fotos
de terceros, sin filtros ni precios ni analítica, islas solo para galería y mapa, menú móvil sin
JavaScript).

---

## Resumen de la solución

Sitio estático de Astro. Todo el contenido sale de cinco colecciones validadas con Zod y pasa por
**una sola puerta** (`loadSite()`), que valida las reglas que cruzan archivos, deriva el piso de
cada destino y decide qué se publica. Una compilación de **publicación** falla si queda algo en
borrador, ausente, de relleno o sin verificar; una de **vista previa** sí se genera y queda marcada
como no indexable (ADR 0003).

El perfil del hero, las cuatro láminas, el perfil de elevación de cada ruta, la ficha y todos los
formatos de cifras son **funciones puras de `src/lib/`** ejecutadas en el build: llegan al
navegador como HTML y SVG, sin JavaScript (ADR 0010).

Solo dos piezas llevan JavaScript propio: el visor de fotos (implementación propia sobre
`<dialog>`, sin dependencia, ADR 0005) y el mapa (Leaflet 1.9.4 con teselas de OpenStreetMap,
ADR 0006). Ninguna se descarga hasta que su sección está cerca de la ventana (ADR 0004). Las
fuentes y las fotos son archivos locales del repositorio (ADR 0007 y 0008).

Única dependencia de ejecución nueva: `leaflet`.

---

## Estado real del repositorio (comprobado el 2026-10-10)

| Pieza | Estado | Qué falta |
|---|---|---|
| Astro 7.3.8, TypeScript 6.0.3 (`strict`), Node 24 | Instalado | `astro.config.mjs` solo tiene el plugin de Tailwind: faltan `site`, `trailingSlash`, `outDir` |
| Tailwind 4.3.3 + `@tailwindcss/vite` | Instalado | `global.css` solo importa `tailwindcss`; no importa `tokens.css` y ninguna página importa `global.css` |
| Vitest 5.0.3 | Instalado | Sin configuración ni carpeta `tests/`: `npm run test` hoy termina en error por no encontrar pruebas |
| Playwright 1.64.0 + `@axe-core/playwright` 4.13.0 | Instalado; Chromium descargado | Sin `playwright.config.ts` |
| ESLint 10.12.0 + `eslint-plugin-astro` 3.2.1 | Instalado | Sin `eslint.config.js`: `npm run lint` hoy falla. Falta `typescript-eslint` |
| Prettier 3.9.10 | Instalado | Sin configuración, sin `.prettierignore`, sin `prettier-plugin-astro` (no formatea `.astro`) |
| `sharp` 0.35.5, `zod` 4.6.5 (vía Astro) | Instalado | — |
| Leaflet, `@types/leaflet` | **No instalado** | ADR 0006 |
| Lighthouse CI (`@lhci/cli`) | **No instalado** | ADR 0009 |
| `src/` | Esqueleto: `pages/index.astro` de plantilla (`lang="en"`), `styles/global.css`, `styles/tokens.css` | Todo lo demás |
| `content.config.ts`, `src/content/`, `src/lib/`, `src/components/`, `src/layouts/` | No existen | — |

---

## Decisiones de arquitectura

Cada una tiene su ADR; aquí va lo necesario para leer el resto del plan.

### D1. Modelo de contenido y puerta de publicación (ADR 0003)

- **Cinco colecciones**: `destinos` (Markdown), `rutas` (GeoJSON), `legal` (Markdown), `operador` y
  `territorio` (un JSON cada una). Las tres últimas amplían la estructura de `CLAUDE.md`, que solo
  lista `destinos/` y `rutas/`.
- **Dos niveles de validación.** El esquema Zod valida cada archivo (tipos, rangos, campos
  obligatorios). `validateSite()` valida lo que cruza archivos o depende del modo: dos principales
  en un piso, ruta sin destino, destino fuera de rango, resolución de las fotos, textos en borrador,
  identificadores. Astro no permite validar dimensiones de imagen dentro del esquema
  (`image().refine()` no está soportado), así que la resolución se valida en `validateSite()`.
- **El piso no se guarda: se deriva** de la altitud con `zoneOf()` y los umbrales de `territorio`
  (CA-29). Ningún archivo de contenido escribe el piso.
- **Dos modos**, decididos por el modo de Vite:

  | Guion | Orden | Modo | Uso |
  |---|---|---|---|
  | `npm run dev` | `astro dev` | vista previa | Trabajo diario |
  | `npm run build` | `astro check && astro build --mode preview` | vista previa | Puerta de las fases 6 a 8 y Definition of Done |
  | `npm run build:release` | `astro check && astro build` | **publicación** | Lo único que se despliega al sitio público |

  Guiones nuevos de prueba: `test:build` (criterios `[build]`) y `test:lh` (Lighthouse CI). Los
  cambios de `package.json` los hace `astro-developer` en el paso 1.

  Un `astro build` sin opciones es publicación: lo estricto es el valor por defecto de la
  herramienta y lo permisivo hay que pedirlo. `npm run build` es vista previa porque `CLAUDE.md`
  exige que esté en verde durante la implementación, y los textos legales y los identificadores no
  estarán listos hasta el lanzamiento. Toda página de vista previa lleva `noindex` y su
  `robots.txt` prohíbe el rastreo. **Decidido por el humano (2026-10-10).** El alojamiento debe
  configurarse con `npm run build:release` como orden de construcción; `npm run build` no es
  desplegable.

- **Qué hace cada problema** (`error` detiene siempre; `release` detiene solo la publicación):

  | Problema | CA | Vista previa | Publicación |
  |---|---|---|---|
  | Altitud ausente, no numérica, cero o negativa | CA-20 | error | error |
  | Clima con mínima ≥ máxima; dificultad fuera de lista | CA-24, CA-27 | error | error |
  | Foto sin autor, licencia, enlaces, dato de modificación o texto alternativo; licencia no aceptada | CA-46, CA-47, CA-48 | error | error |
  | Foto con lado mayor menor de 1200 px | CA-43 | error | error |
  | Ruta sin trazado válido, sin destino, sin elevación mínima o máxima, o mínima mayor que máxima | CA-77, CA-78 | error | error |
  | Dos destinos principales en un piso | CA-15 | error | error |
  | Umbrales desordenados o destino fuera del rango declarado | CA-122 | error | error |
  | Ningún destino publicado | CA-100 | error | error |
  | Slug no kebab-case o repetido; título o descripción fuera de límite o repetidos | CA-31, CA-33 | error | error |
  | Altitud de destino sin marca de verificada | CA-104 | el destino se excluye y se avisa | release |
  | Rango o umbrales de `territorio` sin verificar | CA-104 | ningún destino es publicable: termina en CA-100 | release |
  | Texto legal en borrador | CA-118 | se muestra con banda de aviso | release |
  | Identificador oficial ausente | CA-119 | no se muestra | release |
  | Identificador o dato de contacto de relleno o marcado ficticio | CA-120 | identificador oculto; aviso | release |
  | `SITE_URL` sin definir | CA-97 | se usa `http://localhost:4321` | release, con el mensaje "Falta SITE_URL: define la dirección pública del sitio antes de publicar" |
  | Piso sin principal marcado; estrato del perfil menor de 24 px; etiqueta sin sitio; más destinos que la capacidad del perfil; más de tres rutas en un piso; ruta con más de 400 puntos | CA-15, S3 | aviso | aviso |

  Cada problema lleva archivo, campo y regla (CA-99). Se informan todos juntos, no solo el
  primero.

- **Contenido de prueba aparte.** `content.config.ts` lee la raíz del contenido de la variable
  `CONTENT_ROOT` (por defecto `src/content`). Las pruebas construyen escenarios de
  `tests/fixtures/content/`. El desarrollo no depende de que el contenido real esté completo.

### D2. Islas sin framework (ADR 0004)

`CLAUDE.md` pide a la vez islas "sin framework UI" y `client:visible`. Las directivas `client:*` de
Astro solo existen para componentes de un framework. El plan cumple la intención: cada isla es un
componente `.astro` con un guion mínimo que observa su contenedor con `IntersectionObserver`
(margen de 300 px) y hace `import()` dinámico del módulo real cuando se acerca a la ventana. Vite
separa ese módulo en su propio archivo. No hay `client:load`.

Tres ayudas mínimas no son islas y también se documentan en el ADR 0004: la clase `js` en `<html>`
(una línea en `<head>`), el cierre del menú con Esc o al elegir enlace (pedido por S2) y el
cargador de islas.

### D3. Visor propio sobre `<dialog>` (ADR 0005)

El visor de S8.2 no usa ninguna de las cosas que justifican PhotoSwipe (zoom con pellizco,
arrastre, transiciones entre fotos) y exige varias que PhotoSwipe no trae o hay que desmontar:
botones con palabra, cambio de foto sin animación, extremos desactivados pero enfocables, anuncio de
posición y texto alternativo, pie con enlaces de crédito dentro del ciclo de foco.

| | PhotoSwipe 5.4.4 | Propio sobre `<dialog>` |
|---|---|---|
| JS (gzip, medido) | 16.4 KB núcleo + 4.5 KB lightbox = 20.9 KB | 4 KB como máximo |
| CSS (gzip, medido) | 2.4 KB, con colores y duraciones fuera de los tokens | En los estilos del sitio, solo tokens |
| Diálogo modal, foco atrapado, fondo inerte, Esc, foco de vuelta | Propio de la librería | Nativo del navegador (`showModal()`) |
| Última versión | Mayo de 2024 | — |

### D4. Mapa con Leaflet 1.9.4 (ADR 0006)

Última versión estable (la 2.0 sigue en alfa). 42.3 KB de JS y 3.5 KB de CSS en gzip, medidos. Se
detalla en "Mapa: cómo se resuelve cada punto".

### D5. Fuentes locales con `@font-face` (ADR 0007)

Dos archivos WOFF2 en `src/assets/fonts/`, con su licencia OFL al lado, declarados en
`src/styles/fonts.css`. **No implica dependencia.** Se descartó la API de fuentes de Astro porque
genera nombres de familia con sufijo (`Besley-<hash>`) y obligaría a redefinir `--font-display` y
`--font-sans`, que hoy nombran las familias literalmente en `tokens.css`.

| Archivo (subconjunto latino, romana) | Tipo | Peso | Carga |
|---|---|---|---|
| `besley-latin-700-normal.woff2` | Estática, peso 700 | 18.9 KB | Precargada en `BaseLayout` (dibuja el titular) |
| `instrument-sans-latin-wght-normal.woff2` | Variable, 400 a 700 | 30.1 KB | Sin precarga |

Ambas con `font-display: swap`. Origen: paquetes `@fontsource/besley` y
`@fontsource-variable/instrument-sans` 5.3.0, descargados una vez y guardados en el repositorio;
no se instalan como dependencia.

**Besley estática de peso 700: decidido por el humano (2026-10-10), con comprobación.** Se
revisaron todos los usos de Besley en `design.md`, la dirección visual y `tokens.css`: titular del
hero, títulos de sección, títulos de destino (33, 27 y 21 px), nombre del sitio en la cabecera,
título del detalle, y cifra de altitud destacada y de las láminas. **Todos son de peso 700**; no hay
ningún uso de Besley en otro peso ni en cursiva, y `--font-weight-bold` es el único peso que los
tokens asocian a Besley. La decisión se aplica. Condición que queda: todo texto en `--font-display`
debe ir en peso 700, porque con un solo archivo el navegador pintaría cualquier otro peso con la
misma letra negrita. La prueba `style-tokens.test.ts` lo vigila.

### D6. Fotos locales y atribución en el frontmatter (ADR 0008)

- Cada foto es un archivo en `src/assets/photos/<id-del-destino>/`, referenciado desde el
  frontmatter de su destino con `image()`. `astro:assets` genera AVIF y WebP en varios anchos.
- No se usan imágenes remotas: el build no debe depender de que Commons o Flickr respondan, y la
  foto publicada debe ser exactamente la que se verificó.
- El archivo guardado es el original, o una reducción a 2560 px de lado mayor como máximo, sin
  recortar y con un tope de 1.5 MB. El recorte a 3:2, 4:5 o 1:1 lo hace el build según el campo
  `ratio` y el punto de interés `focus`.
- **La atribución vive junto a la foto, en el frontmatter del destino**: autor, licencia (tipo,
  nombre y enlace), enlace a la fuente, modificación y texto alternativo. La página de créditos, el
  pie de cada foto y el pie del visor leen de ahí; no hay una segunda lista que mantener (CA-50).
- "Recortada" se deriva: aparece si el contenido lo declara o si la proporción pedida difiere de
  la del archivo.

### D7. Generación en build del perfil, las láminas y los gráficos (ADR 0010)

- Las funciones de `lib/` devuelven **modelos de datos**, no HTML. Los componentes de `ui/` los
  pintan.
- **Perfil del hero.** Un SVG decorativo (`aria-hidden`, `preserveAspectRatio="none"`, trazos con
  `vector-effect: non-scaling-stroke`) y, encima, una capa HTML con los textos fijos y una `<ol>`
  de enlaces colocados con `left` en porcentaje y `top` en px. Así la figura se estira solo a lo
  ancho, los textos y los puntos conservan su tamaño, y la lista accesible es la misma que se ve
  (S3.9). Las tres variantes se pintan en el HTML y CSS muestra una por rango; las otras dos
  quedan con `display: none`, fuera del foco y del árbol de accesibilidad.
- **Cubierta animada** en CSS puro: estado por defecto retirada; una animación de
  `--duration-draw` la trae desde el inicio una vez.
- **Láminas.** Cada dibujo se define una vez por página como `<symbol>` y cada lámina lo usa con
  `<use>` y `preserveAspectRatio="xMidYMid slice"` (recorte centrado para 4:5 y 1:1). Los colores
  entran por variables CSS heredadas. El tamaño de la cifra depende del ancho de la lámina:
  consultas de contenedor, sin JavaScript. La ficha usa lo mismo para su umbral de 400 px.
- **Respaldo de S3.10** (regla vertical): no se construye salvo que el humano lo pida en la
  revisión de CA-124. El contrato de `Hero` no cambia si se activa.

### D8. Sin dependencia para el mapa del sitio

`sitemap.xml` y `robots.txt` son dos endpoints estáticos que usan la misma lista de páginas
publicadas. Se descarta `@astrojs/sitemap` (dos dependencias transitivas para unas veinte líneas).

---

## Componentes

Rutas relativas a `src/`. Todo es nuevo salvo lo indicado.

### Contenido y configuración

| Archivo | Capa | N/M | Responsabilidad |
|---|---|---|---|
| `content.config.ts` | content | N | Registra las cinco colecciones con los esquemas de `lib/content/schemas.ts`; lee `CONTENT_ROOT` |
| `content/destinos/*.md` | content | N | Un destino por archivo; el nombre del archivo es el slug |
| `content/rutas/*.json` | content | N | Una ruta por archivo: `Feature` GeoJSON con `LineString` |
| `content/legal/*.md` | content | N | Tres textos legales con estado `draft` o `reviewed` |
| `content/sitio/operador.json` | content | N | Nombre, WhatsApp, horario, correo, identificadores oficiales |
| `content/sitio/territorio.json` | content | N | Altitud mínima y máxima de Antioquia, umbrales, marca de verificado y fuente |
| `assets/photos/<destino>/*` | content | N | Fotos de terceros |
| `assets/fonts/*` | — | N | Dos WOFF2 y sus licencias |
| `styles/global.css` | — | M | Importa Tailwind, `tokens.css` y `fonts.css`; anillo de foco, base de imágenes, clase `js` |
| `styles/fonts.css` | — | N | Dos reglas `@font-face` |
| `../astro.config.mjs` | — | M | `site` desde `SITE_URL`, `trailingSlash: 'always'`, `outDir` desde `OUT_DIR` |

### `lib/` (lógica pura, con pruebas unitarias)

| Archivo | Responsabilidad |
|---|---|
| `lib/content/schemas.ts` | Esquemas Zod (fábricas que reciben `image` y la referencia a destinos) y tipos inferidos |
| `lib/content/placeholders.ts` | Detecta valores de relleno (CA-120) |
| `lib/content/validate.ts` | `validateSite()`: reglas entre archivos, modo, modelo publicado |
| `lib/content/load.ts` | **Único módulo que importa `astro:content`.** Lee las colecciones, llama a `validateSite()`, memoriza el resultado y lanza el error de build. Sin lógica propia |
| `lib/altitude/zones.ts` | Pisos, umbrales, rango de cada piso |
| `lib/altitude/sort.ts` | Orden por altitud y nombre; bloques por piso; destino principal |
| `lib/altitude/profile.ts` | Geometría del perfil (S3.4 a S3.8) |
| `lib/altitude/contours.ts` | Curvas de nivel de las cuatro láminas (S6.3) |
| `lib/format/units.ts` | Altitud, clima, duración, distancia y desnivel, edad, fecha larga |
| `lib/ficha/build.ts` | Filas de la ficha para destino y para ruta |
| `lib/photos/policy.ts` | Tamaño permitido, foto principal, disposición del detalle, partes del crédito, anchos |
| `lib/gallery/group.ts` | Grupos y orden de la galería (CA-52) |
| `lib/gallery/viewer-state.ts` | Estado del visor: índice, extremos, umbral de deslizamiento |
| `lib/routes/geo.ts` | Elevación por punto, distancia acumulada, mínimos y máximos, caja envolvente |
| `lib/routes/elevation-profile.ts` | Modelo del gráfico de elevación (S9.4) |
| `lib/routes/style.ts` | Orden de la lista, letra clave, patrón y variante de trazo |
| `lib/routes/map-config.ts` | URL de teselas, atribución, límites y zoom del mapa |
| `lib/contact/whatsapp.ts` | Enlace `wa.me` y número con formato |
| `lib/seo/meta.ts` | Título de documento, `sitemap.xml`, `robots.txt` |
| `lib/nav.ts` | Enlaces de navegación según las secciones publicadas |

### `components/ui/` (presentación sin estado)

| Archivo | Responsabilidad |
|---|---|
| `Button.astro`, `TextLink.astro`, `SkipLink.astro` | Controles de S1 con sus cuatro estados |
| `ZoneRail.astro` | Regla de altitud: columna fija en escritorio, franja de 6 px en el resto |
| `ZoneTag.astro` | Cuadrado de 10 px y nombre del piso |
| `Ficha.astro`, `DifficultyMarks.astro` | `<dl>` de la ficha; marcas ocultas al lector de pantalla |
| `Photo.astro`, `PhotoCredit.astro` | `<Picture>` con caja reservada y anchos limitados; crédito de una línea |
| `AltitudePlate.astro`, `ContourDefs.astro` | Lámina; símbolos de curvas de la página |
| `AltitudeProfile.astro` | Pinta los tres modelos del perfil y la cubierta |
| `ElevationProfile.astro`, `RouteStrokeSample.astro` | Gráfico de elevación; muestra de trazo de 48 px |
| `DraftBanner.astro` | Banda "Borrador pendiente de revisión" |

### `components/sections/`

| Archivo | Responsabilidad |
|---|---|
| `SiteHeader.astro` | Nombre del sitio, navegación, menú móvil con `<details>` |
| `SiteFooter.astro` | Identidad, identificador si existe, contacto, legales, créditos |
| `Hero.astro` | Titular, explicación, botón, perfil, nota |
| `Destinos.astro`, `DestinoCard.astro` | Bloques por piso; tarjeta principal y menor |
| `Galeria.astro`, `PhotoGrid.astro` | Grupos de la galería; cuadrícula reutilizada en el detalle |
| `MapaRutas.astro`, `RouteList.astro`, `RoutePanelTemplates.astro` | Sección, lista siempre visible, contenido del panel por ruta |
| `Contacto.astro` | Sección del inicio y llamada del detalle |
| `DestinoDetalle.astro` | Bloques 1 a 9 de S7 |

### `components/islands/`

| Archivo | Responsabilidad |
|---|---|
| `GalleryLightbox.astro` | Envuelve una cuadrícula; plantilla del diálogo; guion cargador |
| `gallery-lightbox.client.ts` | Convierte miniaturas en botones; abre, cierra, cambia, anuncia |
| `RouteMap.astro` | Caja del mapa, estados de carga y de fallo, controles, guion cargador |
| `route-map.client.ts` | Leaflet: teselas, rutas, marcadores, selección, teclado, tacto, fallo |
| `runtime/when-visible.ts` | `IntersectionObserver` + `import()` |

### Layouts y páginas

| Archivo | N/M | Responsabilidad |
|---|---|---|
| `layouts/BaseLayout.astro` | N | `lang="es-CO"`, título, descripción, datos para redes sin imagen, canónica, `noindex` en vista previa, precarga de Besley, saltar al contenido, cabecera, `<main>`, pie |
| `pages/index.astro` | M | Hero, Destinos, Galería, Mapa de rutas, Contacto |
| `pages/destinos/[slug].astro` | N | Una página por destino publicado |
| `pages/legal/[slug].astro` | N | `politica-de-datos`, `terminos-y-condiciones`, `politica-de-cancelacion` |
| `pages/creditos.astro` | N | Créditos de todas las fotos publicadas |
| `pages/404.astro` | N | Dirección inexistente |
| `pages/sitemap.xml.ts`, `pages/robots.txt.ts` | N | Archivos de rastreo |
| `pages/data/rutas.json.ts` | N | Trazados para el mapa; se pide solo al activarse la isla |

### Pruebas y herramientas

| Archivo | Responsabilidad |
|---|---|
| `tests/unit/**` | Una suite por módulo de `lib/`; `style-tokens.test.ts` recorre `src/` (CA-105) |
| `tests/build/**` | Construye escenarios inválidos y comprueba que el build falla con archivo, campo y regla |
| `tests/e2e/**` | Playwright y axe sobre los escenarios construidos |
| `tests/fixtures/content/{completo,minimo,sin-fotos}/` | Escenarios válidos |
| `tests/fixtures/content/invalido-*/` | Escenarios que deben fallar |
| `eslint.config.js`, `.prettierrc`, `.prettierignore`, `vitest.config.ts`, `playwright.config.ts`, `lighthouserc.json` | Configuración |

`tests/build/` y `tests/fixtures/` amplían la estructura de `CLAUDE.md` (`unit/` y `e2e/`).

---

## Contratos

Bosquejo de contratos; no es código de producción. Los identificadores van en inglés, como pide
`CLAUDE.md`; decidido por el humano el 2026-10-10.

### Tipos de dominio (derivados de Zod)

```ts
// lib/content/schemas.ts — los tipos salen de los esquemas; no se escriben a mano
export type ZoneId = 'warm' | 'temperate' | 'cold' | 'paramo';
export type DestinoData = z.infer<ReturnType<typeof destinoSchema>>;
export type PhotoData = DestinoData['photos'][number];
export type RutaData = z.infer<ReturnType<typeof rutaSchema>>;
export type LegalData = z.infer<typeof legalSchema>;
export type Operator = z.infer<typeof operatorSchema>;
export type Territory = z.infer<typeof territorySchema>;

// Modelo publicado: datos del esquema más lo derivado
export interface Destino extends DestinoData {
  id: string;            // slug
  href: string;          // /destinos/<id>/
  zone: ZoneId;          // derivado
  isFeatured: boolean;   // principal de su piso, ya resuelto
  photos: Photo[];
}
export interface Photo extends PhotoData {
  destinoId: string; destinoName: string; zone: ZoneId;
  width: number; height: number;      // del archivo, tras el recorte a `ratio`
  tier: 'large' | 'small';            // lado mayor >= 2000 px, o >= 1200 px
  isCropped: boolean;
}
export interface Ruta extends RutaData {
  id: string; destino: Destino; zone: ZoneId;
  key: string;                         // letra clave: A, B, C…
  style: RouteStyle;
  hasPointElevation: boolean;
}
```

### `lib/content`

```ts
export type BuildMode = 'release' | 'preview';
export interface Issue {
  severity: 'error' | 'release' | 'warning';
  file: string; field: string; rule: string; criterion: string; message: string;
}
export interface SiteModel {
  mode: BuildMode;
  territory: Territory; operator: PublishedOperator;
  destinos: Destino[];                 // publicados, por altitud y nombre
  rutas: Ruta[];                       // publicadas, en el orden de la lista
  photos: Photo[];                     // todas las publicadas, en el orden de la galería
  legal: LegalDoc[];
  sections: { galeria: boolean; mapa: boolean };
}
export function validateSite(raw: RawSite, mode: BuildMode): { site: SiteModel | null; issues: Issue[] };
export function isPlaceholder(value: string): boolean;
export function loadSite(): Promise<SiteModel>;   // load.ts: lanza si hay problemas que detienen
```

`PublishedOperator` solo contiene los identificadores entregados y no de relleno: un componente no
puede mostrar un identificador que la puerta haya retirado.

### `lib/altitude`

```ts
export const ZONES: readonly ZoneId[];             // warm, temperate, cold, paramo
export function zoneOf(altitudeM: number, t: Territory['thresholds']): ZoneId; // el umbral es del piso superior
export function zoneRange(zone: ZoneId, t: Territory): { fromM: number; toM: number };
export function zoneName(zone: ZoneId): string;    // "cálido", "templado", "frío", "páramo"

export function compareByAltitude(a: Destino, b: Destino): number;   // altitud, luego nombre con Intl.Collator('es')
export interface ZoneBlock { zone: ZoneId; range: { fromM: number; toM: number }; featured: Destino; others: Destino[] }
export function groupByZone(destinos: Destino[], t: Territory): ZoneBlock[];   // sin pisos vacíos
export function resolveFeatured(inZone: DestinoData[]): { featuredIndex: number; issue?: 'two-featured' | 'none-featured' };

export type ProfileVariantId = 'compact' | 'medium' | 'wide';
export interface ProfilePoint {
  id: string; name: string; altitudeM: number; href: string;
  xFraction: number; y: number;        // posición del disco
  label: { lines: string[]; side: 'rock' | 'sky'; offsetY: number; leader: boolean };
}
export interface ProfileModel {
  variant: ProfileVariantId; width: number; height: number;
  silhouettePath: string; ridgePath: string; echoPaths: string[];
  strata: { zone: ZoneId; y: number; height: number }[];
  boundaries: number[];
  zoneLabels: { zone: ZoneId; baselineY: number }[];
  minLabel: { text: string; y: number }; maxLabel: { text: string; xFraction: number; y: number };
  points: ProfilePoint[]; omitted: number; warnings: string[];
}
export function selectCompactDestinos(destinos: Destino[]): Destino[];          // CA-7, máximo 5
export function buildAltitudeProfile(territory: Territory, destinos: Destino[], variant: ProfileVariantId): ProfileModel;

export interface ContourPlate { zone: ZoneId; viewBox: [number, number]; curves: { d: string; master: boolean }[] }
export function buildContourPlate(zone: ZoneId): ContourPlate;                   // determinista
```

### `lib/format`, `lib/ficha`

```ts
export function formatAltitude(m: number, form: 'short' | 'long'): string;   // "2500 m" | "2500 metros de altitud"
export function formatAltitudeRange(minM: number, maxM: number): string;     // "de 125 a 4080 metros de altitud"
export function formatClimate(minC: number, maxC: number): string;           // "Entre 16 y 24 °C"
export function formatDuration(value: number, unit: 'hours' | 'days'): string;
export function formatDistanceAscent(km?: number, ascentM?: number): { label: string; value: string } | null;
export function formatMinAge(years: number): string;
export function difficultyInfo(d: Difficulty): { word: string; marks: 1 | 2 | 3 };
export function formatLongDate(d: Date): string;                              // "10 de octubre de 2026"

export type FichaKey = 'altitude' | 'climate' | 'access' | 'duration' | 'distance' | 'difficulty' | 'age';
export interface FichaRow { key: FichaKey; label: string; value: string; zone?: ZoneId; marks?: 1 | 2 | 3 }
export function buildFicha(subject: Destino | Ruta, variant: 'full' | 'summary'): FichaRow[];
// Orden fijo; fila ausente si falta el dato. Para una ruta, la fila de altitud es la de su destino.
```

### `lib/photos`, `lib/gallery`

```ts
export function photoTier(width: number, height: number): 'large' | 'small' | 'rejected';
export function mainPhoto(photos: Photo[]): Photo | null;                      // primera 'large'
export type DetailLayout = 'plate' | 'beside-ficha' | 'main-and-grid' | 'plate-and-small' | 'plate-and-grid';
export function detailLayout(photos: Photo[]): DetailLayout;                   // S6.4
export function cardMedia(d: Destino): { kind: 'photo'; photo: Photo } | { kind: 'plate' };
export function creditParts(p: Photo): { author: string; licenseName: string; licenseUrl: string; sourceUrl: string; note?: 'Recortada' | 'Modificada' };
export function allowedWidths(p: Photo, candidates: number[]): number[];       // nunca por encima del original

export interface GalleryGroup { zones: ZoneId[]; heading: string; photos: Photo[] }
export function groupGalleryPhotos(photos: Photo[]): GalleryGroup[];

export interface ViewerState { index: number; total: number }
export function step(s: ViewerState, dir: -1 | 1): ViewerState;                // no da la vuelta
export function controls(s: ViewerState): { showNav: boolean; prevDisabled: boolean; nextDisabled: boolean; counter: string | null };
export function swipeDirection(dxPx: number, dyPx: number): -1 | 0 | 1;        // umbral de 48 px
```

### `lib/routes`, `lib/contact`, `lib/seo`, `lib/nav`

```ts
export function hasPointElevation(coords: RutaData['geometry']['coordinates']): boolean;
export function cumulativeKm(coords: number[][]): number[];
export function elevationStats(coords: number[][]): { minM: number; maxM: number; ascentM: number } | null;
export interface ElevationProfileModel { width: number; height: number; linePath: string; areaPath: string; minM: number; maxM: number; totalKm: number; altText: string }
export function buildElevationProfile(ruta: Ruta): ElevationProfileModel | null;

export interface RouteStyle { zone: ZoneId; pattern: 'solid' | 'long-dash' | 'dash-dot' | 'dots'; variant: 'regular' | 'double' | 'thin'; dashArray: string | null; weight: number }
export function orderRoutes(rutas: Ruta[]): Ruta[];                            // elevación mínima, luego nombre
export function routeKey(index: number): string;
export function routeStyle(zone: ZoneId, indexInZone: number): RouteStyle;

export function buildWhatsAppUrl(phoneE164: string, message: string): string;  // https://wa.me/…?text=…
export function whatsAppMessage(destinoName?: string): string;
export function formatPhone(phoneE164: string): string;                         // "+57 312 795 1683"

export function documentTitle(pageName?: string): string;
export function buildSitemapXml(urls: string[]): string;
export function buildRobotsTxt(sitemapUrl: string, mode: BuildMode): string;
export function navLinks(sections: SiteModel['sections']): { label: string; href: string }[];
```

### Props de componentes

```ts
// layouts/BaseLayout.astro
interface Props { title: string; description: string; destinoName?: string }

// ui
interface ButtonProps { variant: 'primary' | 'secondary' | 'on-ink'; href?: string; type?: 'button'; pressed?: boolean; fullWidth?: boolean }
interface ZoneRailProps { zones: ZoneId[]; range?: { fromM: number; toM: number }; heading?: string; headingLevel?: 2 | 3 }
interface FichaProps { rows: FichaRow[]; variant: 'full' | 'summary' }
interface PhotoProps { photo: Photo; slot: 'large' | 'small' | 'thumb'; sizes: string; loading?: 'lazy' | 'eager'; credit?: boolean }
interface PhotoCreditProps { photo: Photo; onInk?: boolean }
interface AltitudePlateProps { zone: ZoneId; altitudeM: number; ratio: '3:2' | '4:5' | '1:1' }
interface ContourDefsProps { zones: ZoneId[] }
interface AltitudeProfileProps { models: Record<ProfileVariantId, ProfileModel> }
interface ElevationProfileProps { model: ElevationProfileModel; zone: ZoneId }

// sections
interface HeroProps { territory: Territory; destinos: Destino[] }
interface DestinosProps { blocks: ZoneBlock[] }
interface DestinoCardProps { destino: Destino; size: 'featured' | 'minor' }
interface GaleriaProps { groups: GalleryGroup[] }
interface PhotoGridProps { photos: Photo[]; showDestino: boolean }
interface MapaRutasProps { rutas: Ruta[] }
interface ContactoProps { operator: PublishedOperator; variant: 'section' | 'cta'; destinoName?: string }
interface SiteHeaderProps { links: { label: string; href: string }[] }
interface SiteFooterProps { operator: PublishedOperator; legal: LegalDoc[] }

// islands
interface GalleryLightboxProps { label: string }                     // envuelve un <slot /> con la cuadrícula
interface RouteMapProps { dataUrl: string; tileUrl: string; attributionHref: string }
```

Regla de capas (se vigila con `no-restricted-imports` de ESLint): `ui/` no importa `astro:content`
ni `lib/content/load.ts`; solo las páginas y `BaseLayout` llaman a `loadSite()` y pasan datos por
props. `lib/` no importa nada de `components/`.

---

## Cambios de esquema (`content.config.ts`)

Bosquejo. `z` viene de `astro/zod` (Zod 4); los cargadores, de `astro/loaders`.

```ts
// lib/content/schemas.ts
const fichaFields = {
  climate: z.object({ minC: z.number(), maxC: z.number() })
    .refine((c) => c.minC < c.maxC, 'CA-24: la temperatura mínima debe ser menor que la máxima').optional(),
  access: z.string().min(1).optional(),                       // cómo llegar
  duration: z.object({ value: z.number().positive(), unit: z.enum(['hours', 'days']) }).optional(),
  distanceKm: z.number().positive().optional(),
  ascentM: z.number().int().nonnegative().optional(),
  difficulty: z.enum(['easy', 'moderate', 'demanding']).optional(),   // Fácil, Moderada, Exigente
  minAge: z.number().int().min(0).optional(),
};

export const photoSchema = ({ image }: Ctx) => z.object({
  file: image(),
  alt: z.string().min(1),
  author: z.string().min(1),
  license: z.object({
    kind: z.enum(['cc0', 'public-domain', 'cc-by', 'cc-by-sa']),     // CA-47
    name: z.string().min(1),                                         // "CC BY-SA 4.0"
    url: z.url(),
  }),
  sourceUrl: z.url(),
  modification: z.enum(['none', 'cropped', 'modified']),             // obligatorio, sin valor por defecto (CA-46)
  ratio: z.enum(['3:2', '4:5', '1:1']),
  focus: z.enum(['center', 'top', 'bottom', 'left', 'right']).default('center'),
});

export const destinoSchema = (ctx: Ctx) => z.object({
  name: z.string().min(1).max(37),          // "{name} | Ecoturismo Antioquia" <= 60 (CA-33)
  summary: z.string().min(1).max(160),      // descripción corta y meta descripción
  altitude: z.object({
    meters: z.number().int().positive(),    // CA-20
    verified: z.boolean(),                  // CA-104
    source: z.string().min(1).optional(),   // obligatoria si verified (PA-12)
  }),
  featured: z.boolean().default(false),     // destino principal del piso (CA-15)
  ...fichaFields,
  photos: z.array(photoSchema(ctx)).default([]),
});                                         // el cuerpo Markdown es la descripción larga

export const rutaSchema = ({ destinoRef }: RefCtx) => z.object({
  type: z.literal('Feature'),
  geometry: z.object({
    type: z.literal('LineString'),
    coordinates: z.array(z.union([
      z.tuple([lon, lat]),
      z.tuple([lon, lat, z.number()]),      // tercer valor: elevación en metros
    ])).min(2),                             // CA-77
  }),
  properties: z.object({
    name: z.string().min(1),
    destino: destinoRef,                    // reference('destinos') (CA-78)
    elevation: z.object({ minM: z.number().int(), maxM: z.number().int() })
      .refine((e) => e.minM <= e.maxM, 'CA-78: la elevación mínima no puede superar la máxima'),
    ...fichaFields,
  }),
});

export const legalSchema = z.object({
  kind: z.enum(['privacy', 'terms', 'cancellation']),
  title: z.string().min(1).max(37),
  summary: z.string().min(1).max(160),
  status: z.enum(['draft', 'reviewed']),    // CA-118: nace en 'draft'
  reviewedOn: z.coerce.date().optional(),   // obligatoria si 'reviewed' (CA-121)
});

const identifier = z.object({ value: z.string().min(1), fictitious: z.boolean().default(false) });
export const operatorSchema = z.object({
  name: z.string().min(1),
  whatsapp: z.string().regex(/^\+57\d{10}$/),
  hours: z.string().min(1),
  email: z.email(),
  identifiers: z.object({                   // clave ausente = dato no entregado (CA-119)
    rnt: identifier.optional(),
    nit: identifier.optional(),
    legalName: identifier.optional(),
    others: z.array(identifier.extend({ label: z.string().min(1) })).default([]),
  }).default({ others: [] }),
});

export const territorySchema = z.object({
  minM: z.number().int().positive(),
  maxM: z.number().int().positive(),
  thresholds: z.object({ temperate: z.number().int(), cold: z.number().int(), paramo: z.number().int() }),
  verified: z.boolean(),
  source: z.string().min(1).optional(),
}).refine((t) => t.minM < t.thresholds.temperate && t.thresholds.temperate < t.thresholds.cold
  && t.thresholds.cold < t.thresholds.paramo && t.thresholds.paramo < t.maxM,
  'CA-122: debe cumplirse mínima < umbral templado < umbral frío < umbral páramo < máxima');
```

Reglas que no caben en el esquema y viven en `validateSite()`:

- Slug en kebab-case sin tildes y único (CA-31); nombres y descripciones no repetidos (CA-33).
- Como máximo un `featured` por piso; ninguno produce aviso (CA-15).
- Altitud de cada destino dentro de `minM`–`maxM` (CA-122).
- Elevación por punto: o todos los puntos la traen o ninguno; una mezcla es un error. Longitud y
  latitud dentro de rango; aviso si un punto cae fuera de la caja aproximada de Antioquia (detecta
  coordenadas invertidas).
- Lado mayor de cada foto: menos de 1200 px es error (CA-43); 2000 px o más habilita el tamaño
  grande (CA-42).
- El texto alternativo no contiene el autor ni el nombre de la licencia (CA-48). El nombre de la
  licencia no contiene "NC" ni "ND" (CA-47).
- Exactamente un texto legal de cada tipo; un `operador` y un `territorio`.
- Identificadores exigidos para publicar: `rnt`, `nit` y `legalName`. La lista está en una
  constante y depende de PA-8.

---

## Islas y mejora progresiva

| Isla | Directiva | Presupuesto JS (KB gzip) | Comportamiento sin JS |
|---|---|---|---|
| `GalleryLightbox` (inicio y detalle con tres o más fotos) | Equivalente a `client:visible`: `IntersectionObserver` con 300 px de margen e `import()` (ADR 0004) | 4 propio, sin dependencias. Ninguna imagen ampliada hasta abrir el visor o llegar a esa foto | Cuadrícula de imágenes con etiqueta de piso y crédito. Las miniaturas son `<img>`, no botones. El diálogo está en un `<template>`: no existe (CA-65) |
| `RouteMap` (inicio) | La misma | 50: Leaflet 42.3 más 7 propios. Aparte y también diferidos: 3.5 de CSS de Leaflet y 15 como máximo de trazados | Solo título, línea y lista de rutas a todo el ancho, con fichas y enlaces. La caja del mapa y el panel no se muestran (CA-80) |
| Cargador de islas, menú y clase `js` (no son islas) | En línea o módulo diferido | 1.5 en total, en la carga inicial | El menú abre y cierra con `<details>`; "Ver destinos" y el enlace para saltar son anclas |

**Cómo se oculta la caja del mapa sin JS.** Un guion de una línea en `<head>` añade la clase `js` a
`<html>`. La caja del mapa, el panel y el diseño en dos columnas del mapa solo existen bajo
`.js`. Así la caja queda reservada desde el primer pintado cuando hay JavaScript (sin salto de
diseño) y no existe cuando no lo hay.

**Miniaturas.** El servidor entrega `<figure>` con `<img>` y `<figcaption>`. La isla envuelve cada
`<img>` en un `<button>` con el nombre "Abrir foto de {destino}: {texto alternativo}". El pie del
visor se obtiene clonando el `<figcaption>`: los enlaces del crédito son los mismos y no hay datos
duplicados. Los `srcset` de la imagen ampliada (AVIF y WebP) viajan en atributos `data-*` generados
en el build.

**Visor.** `<dialog>` con `showModal()` da el diálogo modal, el foco atrapado, el fondo inerte,
Esc y la vuelta del foco a la miniatura. El desplazamiento del fondo se bloquea con
`html:has(dialog[open]) { overflow: hidden }` más `scrollbar-gutter: stable`. El desvanecido de
250 ms usa `@starting-style` y `transition-behavior: allow-discrete`; en un navegador sin soporte
el cambio es inmediato. Los extremos usan `aria-disabled`, no `disabled`, para seguir enfocables.
Una región `aria-live="polite"` anuncia "3 de 12" con el texto alternativo y el error de carga.

### Mapa: cómo se resuelve cada punto

| Punto | Solución |
|---|---|
| Filtro de teselas | CSS sobre `.leaflet-tile-pane`: `filter: var(--map-tiles-filter); opacity: var(--map-tiles-opacity)`. El contenedor lleva fondo `--color-bg`. Solo afecta a las teselas: rutas y marcadores están en otros paneles |
| Patrones y colores | Cada `L.polyline` lleva clases (`route-line route-line--cold route-line--double`) y **todo su aspecto está en CSS** con tokens: `stroke`, `stroke-dasharray`, `stroke-width`. El JavaScript no contiene colores. `routeStyle()` decide patrón y variante y alimenta también la muestra de trazo de la lista |
| Halo | Una segunda polilínea debajo, continua, 4 px más ancha, color papel; pasa a tinta al seleccionar. La variante doble añade encima un hilo de 2 px color papel |
| Zona activa de la línea | Una polilínea transparente de 24 px, interactiva |
| Marcadores | `L.marker` con `L.divIcon` (sin las imágenes por defecto de Leaflet). Área de 44 px, `role="button"`, `aria-label="Ruta {nombre}"`, Enter (propio de Leaflet) y Espacio (manejador propio). Rótulo junto al marcador con la búsqueda de lado de S9.3 |
| Orden de tabulación | Se desactivan el control de zoom y la atribución de fábrica. Los tres botones propios se insertan al principio del contenedor del mapa y la atribución propia al final: mapa, Acercar, Alejar, Ver todas las rutas, marcadores, atribución |
| Teclado | El de Leaflet: flechas mueven 80 px (`keyboardPanDelta`), "+" y "−" amplían. El contenedor lleva anillo de foco y `aria-describedby` con la instrucción. Sin trampa de foco |
| Un dedo y dos dedos | En punteros táctiles (`pointer: coarse`) se crea el mapa con `dragging: false` y `touchZoom: true`. Leaflet deja entonces `touch-action: pan-x pan-y`: un dedo desplaza la página y dos dedos mueven y amplían. Sin complemento. El aviso de 1.5 s se muestra al detectar un arrastre de un dedo |
| Rueda del ratón | `scrollWheelZoom` desactivado; se activa al hacer clic en el mapa y se desactiva al perder el foco |
| Movimiento reducido | Sin animación de zoom ni de encuadre (`zoomAnimation`, `fadeAnimation` y `animate` en falso) |
| Selección y panel | La ficha y el gráfico de cada ruta ya están en el HTML, dentro de un `<template>` por ruta generado en el build. La isla clona el de la ruta elegida, pone `aria-pressed` en su botón y anuncia "Ruta seleccionada: {nombre}" |
| "El mapa no carga" | Tres causas llevan al mismo estado: falla el `import()` o la creación del mapa; falla la descarga de los trazados; pasan 10 s sin ningún `tileload`. Se muestra el mensaje de S9.6 con `role="status"`, se retiran el panel y los añadidos de la lista, y "Volver a cargar el mapa" reintenta; si el módulo vuelve a fallar, recarga la página en el ancla de la sección |
| Atribución | Texto propio "© colaboradores de OpenStreetMap" con enlace a la página de derechos de OSM, abajo a la derecha, siempre visible |

**Política de uso de teselas de OpenStreetMap** (consultada el 2026-10-10). Qué exige y cómo se
cumple:

| Exigencia | Cumplimiento |
|---|---|
| URL exacta `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, sin subdominios | Constante única en `lib/routes/map-config.ts`, pasada a la isla por atributo; cambiar de proveedor es cambiar una línea |
| Atribución visible, no escondida | Fila anterior; CA-74 |
| El navegador debe enviar `Referer` | El sitio no define ninguna `Referrer-Policy` que lo suprima. Condición para el alojamiento |
| Respetar la caché; sin descargas masivas ni precarga | Solo se piden las teselas de la vista. Zoom limitado (8 a 16), límites del mapa ceñidos a Antioquia, `detectRetina` en falso |
| Sin robots que fuercen el render | **Las pruebas e2e no piden teselas reales**: Playwright intercepta el dominio y sirve una tesela local. Lighthouse no llega a la sección |
| Sin garantía de servicio; puede bloquear sin aviso, en especial a sitios comerciales | El estado de S9.6 cubre el corte. Riesgo R4 |

---

## Imágenes

| Lugar | Anchos generados (limitados al original) | `sizes` | Carga |
|---|---|---|---|
| Principal del listado y del detalle (3:2) | 480, 720, 960, 1200 | Según la grilla de S4 y S7 | `lazy`; ninguna está en la primera pantalla |
| Menor, junto a la ficha | 320, 480, 960 | Hasta `--size-photo-small` | `lazy` |
| Miniatura 1:1 del listado | 104, 208, 240 | Fijo | `lazy` |
| Miniatura de galería | 160, 320, 480, 760 | Según columnas | `lazy` |
| Miniatura de créditos | 96, 192 | 96 px | `lazy` |
| Ampliada del visor | 960, 1600, 2560 | `100vw` | Solo al abrir o llegar a la foto |

AVIF y WebP con `<Picture>`. Toda imagen lleva `width`, `height` y fondo `--color-surface`
(CA-117). El estilo base de `img` fija 14 px y tinta suave, que es lo que muestra el navegador
cuando la imagen no llega.

---

## Revisión del 2026-10-11: modo académico y despliegue en Vercel

**Estado de esta revisión: aprobada por el humano el 2026-10-11.** Recoge la revisión de la spec aprobada
el 2026-10-11 (sección N, CA-125 a CA-139; criterios ajustados CA-1, CA-97, CA-98, CA-108, CA-115,
CA-118 a CA-121; CA-110 y CA-28) y la decisión de desplegar en Vercel. **Donde esta sección
contradiga texto anterior del plan, manda esta sección.** La puerta de dos modos de compilación ya
construida no se rediseña: se extiende.

Lo que queda sin efecto del plan anterior: los identificadores oficiales como requisito universal
para publicar (D1), `robots.txt` cerrado en vista previa (D1 y D8), y un mapa del sitio que existe
siempre (D8).

### R1. Declaración del modo (CA-125)

- **Dónde vive:** campo obligatorio `siteKind` en `src/content/sitio/operador.json`, con valor
  `"academic"` u `"operator"`. Sin valor por defecto. Si falta o no es válido, el esquema detiene
  cualquier compilación con archivo, campo y regla. El modo nunca se deduce de otros datos (por
  ejemplo, de que falten identificadores).
- **Por qué ahí:** `operador.json` ya es el archivo de "quién está detrás del sitio" (nombre,
  contacto, identificadores). Un archivo o una colección aparte añadiría piezas a cada escenario
  de prueba sin aportar nada.
- **Dos ejes independientes.** `BuildMode` (`preview` o `release`) sale de la orden de compilación;
  `SiteKind` (`academic` u `operator`) sale de los datos. Ninguno condiciona al otro.
- **Propagación:** `validateSite()` copia `siteKind` al `SiteModel` y calcula un único dato
  derivado, `indexable = siteKind === 'operator' && mode === 'release'`. `BaseLayout` y las páginas
  leen esos dos campos de `loadSite()` y los pasan por props; ningún componente vuelve a decidir
  el modo por su cuenta.

  | Quién lo lee | Para qué |
  |---|---|
  | `BaseLayout` | Pintar el aviso académico antes del contenido; metaetiqueta `robots` si `indexable` es falso |
  | `SiteFooter` | Nombre con "proyecto académico"; sin identificador |
  | `Contacto` | Frase de aclaración y mensaje inicial de WhatsApp de prueba |
  | `pages/legal/[slug].astro` | Rótulo de texto de muestra, o banda de borrador y fecha |
  | `pages/[sitemap].xml.ts`, `pages/robots.txt.ts` | Mapa del sitio solo si `indexable`; texto de `robots.txt` |

### R2. Los cuatro cruces

| | Vista previa (`npm run build`, `astro dev`) | Publicación (`npm run build:release`) |
|---|---|---|
| **Académico** | **Muestra:** aviso en todas las páginas; pie con "proyecto académico"; aclaración en el contacto; legales con rótulo de muestra. **Indexación:** no; sin mapa del sitio. **Exige:** `siteKind` válido; tres textos legales con `status: sample`; ningún identificador cargado; todo lo que es `error` en D1. **Tolera con aviso:** altitud de un destino sin verificar (el destino se excluye); `SITE_URL` ausente (usa un valor local) | **Muestra e indexación:** igual que a la izquierda. **Exige además:** altitudes y umbrales verificados; datos de contacto completos y no de relleno; `SITE_URL` definida. **No exige:** identificadores ni revisión legal. Es lo que se despliega |
| **Operador real** | **Muestra:** sin aviso; borradores legales con la banda "Borrador pendiente de revisión"; identificadores ausentes o de relleno ocultos. **Indexación:** no (es vista previa); sin mapa del sitio. **Exige:** `siteKind` válido; tres textos legales `draft` o `reviewed`; todo lo que es `error` en D1 | **Muestra:** sin aviso; legales revisados con fecha; identificador en el pie. **Indexación:** sí; mapa del sitio y `robots.txt` que lo referencia. **Exige además:** legales `reviewed`; RNT, NIT y razón social entregados y no de relleno; altitudes y umbrales verificados; contacto no de relleno; `SITE_URL` definida |

Reglas nuevas o cambiadas en `validateSite()`:

| Problema | CA | Académico | Operador real |
|---|---|---|---|
| `siteKind` ausente o no válido | CA-125 | error (esquema) | error (esquema) |
| Identificador oficial cargado (`rnt`, `nit`, `legalName` u `others`) | CA-119 (b) | **error** en ambas compilaciones | — |
| Identificador exigido ausente | CA-119 (a) | no aplica | release |
| Identificador de relleno o ficticio | CA-120 | no aplica (cargarlo ya es error) | release |
| Texto legal cuyo `status` no es `sample` | CA-134 | **error**: "le falta el rótulo de texto de muestra" | — |
| Texto legal con `status: sample` | CA-118 (a) | correcto | **error**: un operador real no publica textos de muestra |
| Texto legal en `draft` | CA-118 (a) | (cae en la fila de CA-134) | release |
| `sample` con `reviewedOn` | CA-121 (b) | error (esquema) | — |
| La política de datos no nombra a un tercero del registro (R4) | CA-135 | error | error |
| Dato de contacto de relleno | CA-120, CA-139 | release | release |
| `SITE_URL` ausente o no es una URL absoluta | CA-139 | release | release |
| Comentario HTML (`<!--`) en el cuerpo de un destino o texto legal | — | aviso | aviso |
| Término de la lista de promesas comerciales en un texto (R5) | CA-137 | aviso | aviso |

El resto de D1 no cambia y sigue estricto en los dos modos (CA-139).

### R3. Sin indexar: metaetiqueta, cabecera y `robots.txt` (CA-133)

`spec-writer` advirtió que, si `robots.txt` bloquea el rastreo, un buscador no llega a leer la
instrucción de no indexar y puede listar la dirección igualmente. Es correcto, y decide el diseño:

| Pieza | Sitio no indexable (académico, o cualquier vista previa) | Sitio indexable (operador real en publicación) |
|---|---|---|
| Metaetiqueta en cada página, incluida la 404 | `<meta name="robots" content="noindex, nofollow">` | No se emite |
| Cabecera HTTP en Vercel | `X-Robots-Tag: noindex, nofollow` en todas las rutas (`vercel.json`). Cubre lo que la metaetiqueta no alcanza: imágenes, fuentes y `data/rutas.json` | No se declara |
| `robots.txt` | **No bloquea el rastreo** (`User-agent: *` y `Disallow:` vacío), no anuncia mapa del sitio y lleva un comentario que dice que el sitio no debe indexarse y dónde se declara | `Allow` general y línea `Sitemap:` |
| Mapa del sitio | **No existe el archivo** | `sitemap.xml` con el inicio y los detalles |

- El mapa del sitio se genera con una ruta dinámica (`src/pages/[sitemap].xml.ts`) cuyo
  `getStaticPaths()` devuelve una ruta si `indexable` y ninguna si no. Así el archivo no existe, en
  lugar de existir vacío.
- La cabecera vive en `vercel.json`, que es estático y no conoce el contenido. Una prueba de
  `tests/build/` comprueba la coherencia: si el contenido real declara `academic`, la cabecera debe
  estar; si declara `operator`, no debe estar.
- Vercel añade por su cuenta `X-Robots-Tag: noindex` a sus despliegues de vista previa, pero no al
  dominio de producción `*.vercel.app`. Por eso la cabecera propia es necesaria.
- **Diferencia con la letra de la spec:** CA-133 dice que el archivo de instrucciones "pide no
  indexar el sitio". `robots.txt` no tiene una directiva estándar para eso; lo único que puede
  hacer es bloquear el rastreo, que es lo que hay que evitar. Ver inconsistencia 15.

### R4. Política de datos veraz (CA-135, CA-136)

- **Registro de terceros** en `src/lib/privacy/third-parties.ts`: una lista con nombre, orígenes y
  momento del contacto.

  | Tercero | Orígenes | Cuándo |
  |---|---|---|
  | OpenStreetMap | `https://tile.openstreetmap.org` | Al cargarse el mapa |
  | WhatsApp | `https://wa.me` | Solo al activar el enlace |
  | Vercel (alojamiento) | El propio origen del sitio | Siempre |

- **En el build:** `validateSite()` exige que el cuerpo de la política de datos nombre a cada
  tercero del registro. Una prueba unitaria exige que el origen de la URL de teselas de
  `map-config.ts` esté en el registro: no se puede añadir un tercero al código sin declararlo.
- **En e2e (CA-136):** por cada página, y en el inicio también con la sección del mapa cargada, la
  prueba escucha el evento `request` del navegador, reúne los orígenes distintos del propio y
  falla si alguno no está en el registro o si su nombre no aparece en el texto de la página de
  política de datos. **La interceptación de teselas no lo impide:** Playwright emite el evento
  `request` con la URL original aunque después responda con la tesela local, así que el origen de
  OpenStreetMap queda registrado sin que salga ninguna petición real.
- La misma prueba comprueba que el sitio no deja cookies ni escribe en el almacenamiento del
  navegador, que es lo que la política afirma (y lo que pide CA-129 para el aviso).
- Que el texto sea veraz en lo demás (correo, datos técnicos del alojamiento, ausencia de
  analítica) es revisión manual con lista de pasos.

### R5. Búsqueda de promesas comerciales (CA-137)

- **La lista vive en `src/lib/content/commercial-terms.ts`**: "reserva", "reservar" y sus formas,
  "cupo", "precio", "tarifa", "COP" (solo en mayúsculas y como palabra completa) y "guía incluido".
  La función pura `findCommercialTerms(texto)` devuelve cada coincidencia con su contexto;
  compara sin tildes y por palabra completa.
- **Dos usos.** En el build, `validateSite()` la pasa por los textos de destinos, rutas, contacto y
  legales y emite **avisos** (no errores): el curador ve la coincidencia al escribir. En e2e, la
  prueba la pasa por el texto visible de todas las páginas construidas con el contenido real y
  **falla** ante cualquier coincidencia que no esté revisada.
- **Usos legítimos.** Ya existen: "Reserva Natural" como nombre propio de un lugar y la propia
  aclaración de CA-131 ("no se reservan ni se venden salidas"). Se resuelven con una lista de
  frases revisadas, `tests/e2e/data/terminos-revisados.json`, donde cada entrada lleva la frase
  exacta, el motivo, quién la revisó y la fecha. Una coincidencia se acepta solo si su contexto
  contiene una de esas frases. Añadir una entrada es la "revisión a mano" que pide el criterio.

### R6. Lighthouse en modo académico (CA-115)

- `scripts/lhci.mjs` mide dos compilaciones de publicación, en serie:

  | Escenario | Indexable | SEO |
  |---|---|---|
  | `academico` | No | Lighthouse se ejecuta con `skipAudits: ["is-crawlable"]`: la auditoría de indexación no se ejecuta y la nota de la categoría se calcula sin ella. Las demás auditorías de SEO siguen contando; nota mínima 90 |
  | `completo` (operador real) | Sí | Categoría completa, sin omisiones; nota mínima 90 |

- Las otras tres categorías y las métricas de CA-116 se exigen igual en los dos.
- Hoy el guion mide una vista previa del contenido real, que nunca es indexable: con la
  configuración actual, la categoría SEO fallaría siempre.

### R7. Despliegue en Vercel (ADR 0012)

**Sin adaptador y sin dependencia nueva.** El sitio es estático; la guía de Astro dice que un sitio
estático no necesita configuración adicional en Vercel. `@astrojs/vercel` solo hace falta para
renderizado bajo demanda, que el sitio no usa.

| Ajuste | Valor | Dónde |
|---|---|---|
| Framework | Astro | `vercel.json` (`framework`) |
| Orden de build | `npm run build:vercel` | `vercel.json` (`buildCommand`) |
| Directorio de salida | `dist` | `vercel.json` (`outputDirectory`) |
| Instalación | `npm ci` (por defecto) | — |
| Node.js | 24.x, la misma versión mayor que en desarrollo; 22.x también cumple `engines` | Ajustes del proyecto en Vercel |
| `SITE_URL` | La dirección pública, con `https://` y sin barra final. **Solo en el entorno Production** | Variables de entorno de Vercel |
| `OUT_DIR`, `CONTENT_ROOT` | No se definen | — |
| Barras finales | `"trailingSlash": true`: `/destinos/jardin` redirige con 308 a `/destinos/jardin/`; las rutas con extensión (`robots.txt`, `data/rutas.json`) no se redirigen. Coherente con `trailingSlash: 'always'` de Astro | `vercel.json` |
| Cabeceras | `X-Robots-Tag` en todas las rutas (R3); `Cache-Control: public, max-age=31536000, immutable` en `/_astro/` | `vercel.json` (`headers`) |
| Página 404 | `dist/404.html`, que Vercel sirve en las rutas inexistentes | Se comprueba tras el primer despliegue |
| `Referrer-Policy` | No se define ninguna: la política de teselas de OpenStreetMap exige que el navegador envíe `Referer` | — |

**Qué orden ejecuta Vercel.** `npm run build:vercel` llama a `scripts/vercel-build.mjs`, que mira
la variable de sistema `VERCEL_ENV`:

| Despliegue de Vercel | `VERCEL_ENV` | Orden | Resultado |
|---|---|---|---|
| Production (rama principal) | `production` | `npm run build:release` | Compilación estricta. Si falta `SITE_URL` o hay una altitud sin verificar, el despliegue falla y el sitio anterior sigue en línea |
| Preview (otras ramas y solicitudes de cambio) | `preview` | `npm run build` | Vista previa permisiva y no indexable. No necesita `SITE_URL`: `astro.config.mjs` usa `https://$VERCEL_URL` como dirección de reserva |

**El significado de los guiones no cambia:** `npm run build` sigue siendo la vista previa y la
puerta de las fases 6 a 8; `build:release` sigue siendo la única compilación publicable. Lo que se
configura en Vercel es `build:vercel`, que elige entre los dos. El despliegue de vista previa de
Vercel corresponde a la vista previa del proyecto, y el de producción a la publicación.

**Dominio (PA-17).** Sigue sin definir. El subdominio `*.vercel.app` que Vercel asigna al proyecto
sirve como dirección pública mientras tanto. Definir `SITE_URL` es un paso humano (T-139).

### R8. Escenarios de prueba

| Escenario | `siteKind` | Compilación | Cambio | Para qué |
|---|---|---|---|---|
| `academico` | academic | publicación | **Nuevo. Pasa a ser el escenario por defecto** de los proyectos de Playwright. Mismo contenido que `completo`, con legales `sample`, sin identificadores y con una política de datos que nombra a los tres terceros | Casi todo e2e y axe; CA-126 a CA-136; Lighthouse sin auditoría de indexación |
| `completo` | operator | publicación | Solo añade `siteKind` | CA-138, CA-97, CA-121 (a); Lighthouse con SEO completo |
| `minimo` | operator | vista previa | Solo añade `siteKind` | CA-14, CA-64, CA-67, CA-118 (a), CA-119 (a) |
| `sin-fotos` | academic | vista previa | Pasa a académico: legales `sample`, sin identificadores | CA-38, CA-39, CA-51, CA-124; aviso en vista previa |
| `invalido-sin-modo` | — | ambas | Nuevo | CA-125 |
| `invalido-identificador-en-academico` | academic | ambas | Nuevo | CA-119 (b) |
| `invalido-legal-sin-rotulo` | academic | ambas | Nuevo: un texto legal en `draft` | CA-134 |
| `invalido-muestra-en-operador` | operator | ambas | Nuevo: un texto legal `sample` | CA-118 (a), CA-138 |
| Demás `invalido-*` | academic | ambas | Añaden `siteKind` | Los de antes |

El contenido real de `src/content/` declara `siteKind: "academic"` (T-126). La búsqueda de promesas
comerciales (R5) y la medición de CA-73 se hacen sobre el contenido real, no sobre escenarios.

### R9. Problemas reportados y qué decide el plan

| Problema | Decisión |
|---|---|
| `territorySchema` exigía `minM` positivo; la mínima real es 0 m | El esquema admite 0 (corrección ya encargada, T-119). CA-2 y CA-122 no necesitan cambio de redacción: "de 0 a 4080 metros de altitud" cumple CA-2, y CA-122 solo pide orden estrictamente ascendente. La altitud de un **destino** sigue siendo mayor que cero (CA-20) |
| `altitude` no admite un rango por destino (Parque Arví va de 2340 a 2680 m) | **Límite documentado, sin cambio de esquema.** El perfil, el orden y el piso necesitan una sola cifra por destino. `altitude.meters` es la cota representativa y `altitude.source` dice cuál es (la cabecera, el punto de llegada o el límite inferior). El rango se cuenta en `summary` y en el cuerpo. Un rango en la ficha cambiaría CA-17, CA-21 y el diseño |
| `climate` no admite una sola cifra (Jardín solo tiene temperatura media) | **Límite documentado.** CA-24 fija la forma "Entre X y Y °C". Sin rango con fuente, el campo se omite y la media se cuenta en el cuerpo |
| `access` y otros datos no tienen fuente propia; las citas están en comentarios HTML del `.md` | **Cambio de esquema pequeño:** campo opcional `sources`, una lista de citas en texto libre, en destinos y rutas. No se pinta. Los comentarios HTML del cuerpo se retiran: Markdown los copia al HTML publicado y quedarían a la vista en el código de la página. `validateSite()` avisa si queda alguno |
| La mayoría de los destinos no tiene duración, distancia, desnivel ni edad | **Soportado sin cambios.** `buildFicha()` omite la fila sin dato (CA-22) y S5 del diseño retira fila, etiqueta y separador. La ficha mínima tiene una fila (altitud) y, con los datos actuales, dos o tres. En el listado, un destino puede mostrar solo la altitud. Conviene que `ui-designer` vea esa ficha corta junto a la imagen en el detalle de escritorio (se revisa en T-076) |
| `load.ts` no entrega el cuerpo Markdown renderizado | `load.ts` exporta `renderBody(coleccion, id)`, que devuelve el componente `Content` de Astro. Sigue siendo el único módulo que importa `astro:content`. Las páginas de detalle y legales lo llaman y pasan el contenido por `slot` |
| `content-curator` no puede descargar archivos binarios | T-034 se divide en tres: manifiesto (curador), descarga y verificación de dimensiones con un guion (`astro-developer`), y frontmatter de las fotos (curador) |
| Orden real de ejecución | T-040 a T-045 se adelantaron a T-027; T-027 va después de T-051; lo que le faltaba a T-022 va en T-125. Reflejado en `tasks.md` |

### R10. Contratos que cambian

```ts
// lib/content/schemas.ts
export const SITE_KINDS = ['academic', 'operator'] as const;
export type SiteKind = (typeof SITE_KINDS)[number];
// operatorSchema: + siteKind: z.enum(SITE_KINDS)            obligatorio, sin valor por defecto (CA-125)
// legalSchema:    status: 'draft' | 'reviewed' | 'sample'    'sample' no admite reviewedOn (CA-134, CA-121 b)
// destinoSchema y rutaSchema.properties: + sources: string[]  opcional; citas que no se pintan
// territorySchema: minM >= 0

// lib/content/validate.ts
export interface SiteModel {
  mode: BuildMode;
  siteKind: SiteKind;      // nuevo
  indexable: boolean;      // nuevo: siteKind === 'operator' && mode === 'release'
  // …el resto no cambia
}

// lib/content/load.ts
export function renderBody(collection: 'destinos' | 'legal', id: string): Promise<AstroComponentFactory>;

// lib/content/commercial-terms.ts
export const COMMERCIAL_TERMS: readonly { id: string; pattern: RegExp }[];
export function findCommercialTerms(text: string): { term: string; index: number; context: string }[];

// lib/privacy/third-parties.ts
export interface ThirdParty { id: string; name: string; origins: string[]; when: 'always' | 'map' | 'link' }
export const THIRD_PARTIES: readonly ThirdParty[];
export function isDeclaredOrigin(origin: string, siteOrigin: string): boolean;

// lib/contact/whatsapp.ts
export function whatsAppMessage(siteKind: SiteKind, destinoName?: string): string;   // CA-83, CA-132

// lib/seo/meta.ts
export function buildRobotsTxt(indexable: boolean, sitemapUrl: string): string;      // sustituye a (sitemapUrl, mode)

// components
interface AcademicNoticeProps {}                                  // ui/AcademicNotice.astro: texto fijo, sin estado ni JS
interface SampleLabelProps {}                                     // ui/SampleLabel.astro: rótulo de CA-134
interface SiteFooterProps { operator: PublishedOperator; legal: LegalDoc[]; siteKind: SiteKind }
interface ContactoProps { operator: PublishedOperator; siteKind: SiteKind; variant: 'section' | 'cta'; destinoName?: string }
```

Archivos nuevos: `src/lib/content/commercial-terms.ts`, `src/lib/privacy/third-parties.ts`,
`src/components/ui/AcademicNotice.astro`, `src/components/ui/SampleLabel.astro`,
`src/pages/[sitemap].xml.ts` (en lugar de `sitemap.xml.ts`), `vercel.json`,
`scripts/vercel-build.mjs`, `scripts/fetch-photos.mjs`, `scripts/photos-manifest.json`,
`tests/e2e/data/terminos-revisados.json`.

**Presentación.** El texto exacto y el aspecto del aviso, de la aclaración del contacto, del rótulo
de las páginas legales y del pie los fija `design.md`, que `ui-designer` está completando y aún no
está aprobado. El plan fija el comportamiento: el aviso es HTML estático dentro de una región con
nombre, antes de `<main>` en el orden del documento, sin `role="alert"` ni región viva, sin control
de cierre, sin JavaScript y sin nada guardado en el navegador (CA-126 a CA-130).

---

## Matriz de trazabilidad

Rutas relativas a `src/`. Pruebas: `unit` en `tests/unit/`, `e2e` y `axe` en `tests/e2e/`, `build`
en `tests/build/`, `manual` con lista de pasos en el informe de `qa-engineer`. Entre paréntesis, el
escenario de prueba cuando no es `completo`.

### A. Hero y perfil

| Criterio | Archivo(s) responsable(s) | Prueba |
|---|---|---|
| CA-1 | `sections/Hero.astro`, `pages/index.astro`, `layouts/BaseLayout.astro` (aviso) | e2e: orden de los cuatro elementos; en modo académico el aviso puede ir antes del titular |
| CA-2 | `lib/format/units.ts` (`formatAltitudeRange`), `Hero.astro` | unit |
| CA-3 | `Hero.astro` (ancla), `sections/Destinos.astro` (`h2` con `id` y `tabindex="-1"`) | e2e: clic, toque y Enter; elemento activo |
| CA-4 | `lib/altitude/profile.ts`, `ui/AltitudeProfile.astro` | e2e: cuatro nombres visibles |
| CA-5 | `lib/altitude/profile.ts` | unit: un punto por destino; cambiar una altitud solo mueve su punto |
| CA-6 | `ui/AltitudeProfile.astro` | e2e: destino del enlace; caja de 44 × 44 px |
| CA-7 | `lib/altitude/profile.ts` (`selectCompactDestinos`), `AltitudeProfile.astro` | unit; e2e a 360 px |
| CA-8 | `ui/AltitudeProfile.astro` | axe; manual con lector de pantalla |
| CA-9 | `ui/AltitudeProfile.astro`, `styles/global.css` | e2e: duración calculada de la animación; movimiento reducido; sin JS |
| CA-10 | `Hero.astro`, `BaseLayout.astro` (precarga) | e2e: el elemento LCP es el `h1`; ninguna imagen en el hero |
| CA-11 | `Hero.astro` | e2e |

### B. Listado de destinos

| Criterio | Archivo(s) responsable(s) | Prueba |
|---|---|---|
| CA-12 | `lib/altitude/sort.ts`, `sections/Destinos.astro` | unit; e2e |
| CA-13 | `lib/altitude/sort.ts` (`compareByAltitude`) | unit |
| CA-14 | `lib/altitude/sort.ts` (`groupByZone`), `Destinos.astro` | e2e (`minimo`) |
| CA-15 | `lib/altitude/sort.ts` (`resolveFeatured`), `lib/content/validate.ts`, `sections/DestinoCard.astro` | unit; e2e: el principal ocupa más área; build (`invalido-dos-principales`) |
| CA-16 | `ui/ZoneRail.astro` | e2e a 360, 768 y 1280 px |
| CA-17 | `sections/DestinoCard.astro`, `lib/ficha/build.ts` (`summary`) | e2e |
| CA-18 | `sections/DestinoCard.astro` | axe; e2e: nombres de enlace distintos |
| CA-19 | `sections/Destinos.astro` | e2e: recuento y alcance con Tab |
| CA-20 | `lib/content/schemas.ts` | unit; build (`invalido-altitud`) |

### C. Ficha

| Criterio | Archivo(s) responsable(s) | Prueba |
|---|---|---|
| CA-21 | `lib/ficha/build.ts`, `ui/Ficha.astro` | unit del orden; e2e en detalle, lista de rutas y panel |
| CA-22 | `lib/ficha/build.ts`, `lib/format/units.ts` | unit; e2e |
| CA-23 | `lib/format/units.ts`, `Hero.astro`, `sections/DestinoDetalle.astro` | unit; e2e: sin "m s. n. m." ni separador de miles en todas las páginas |
| CA-24 | `lib/format/units.ts`, `lib/content/schemas.ts` | unit; build (`invalido-clima`) |
| CA-25 | `lib/format/units.ts` (`formatDuration`) | unit |
| CA-26 | `lib/format/units.ts` (`formatDistanceAscent`) | unit |
| CA-27 | `lib/format/units.ts` (`difficultyInfo`), `ui/DifficultyMarks.astro`, `schemas.ts` | unit; axe |
| CA-28 | `lib/format/units.ts` (`formatMinAge`) | unit, con "Apta desde 1 año" y "Apta para todas las edades" |
| CA-29 | `lib/altitude/zones.ts` (`zoneOf`), `lib/content/validate.ts` | unit, con casos en el umbral |
| CA-30 | `ui/Ficha.astro` (`<dl>`, `<dt>`, `<dd>`) | axe; manual |

### D. Detalle

| Criterio | Archivo(s) responsable(s) | Prueba |
|---|---|---|
| CA-31 | `pages/destinos/[slug].astro`, `lib/content/validate.ts` | build: recuento de páginas en `dist`; e2e |
| CA-32 | `sections/DestinoDetalle.astro` | e2e |
| CA-33 | `BaseLayout.astro`, `lib/seo/meta.ts`, `schemas.ts`, `validate.ts` | e2e: unicidad y longitudes en todas las páginas |
| CA-34 | `DestinoDetalle.astro`, `sections/SiteHeader.astro` | e2e |
| CA-35 | `DestinoDetalle.astro` | e2e: con rutas y sin rutas |
| CA-36 | `sections/Contacto.astro` (`cta`), `lib/contact/whatsapp.ts` | e2e: texto del enlace decodificado; unit |
| CA-37 | `pages/404.astro` | e2e |

### E. Fotos, láminas y créditos

| Criterio | Archivo(s) responsable(s) | Prueba |
|---|---|---|
| CA-38 | `ui/AltitudePlate.astro`, `ui/ContourDefs.astro`, `DestinoCard.astro`, `DestinoDetalle.astro` | e2e (`sin-fotos`) |
| CA-39 | `lib/altitude/contours.ts`, `ui/ContourDefs.astro` | unit: determinismo y cuatro dibujos distintos; e2e |
| CA-40 | `lib/photos/policy.ts` (`detailLayout`), `DestinoDetalle.astro` | e2e |
| CA-41 | `lib/photos/policy.ts`, `DestinoDetalle.astro`, `sections/PhotoGrid.astro`, `sections/Galeria.astro` | e2e |
| CA-42 | `lib/photos/policy.ts` (`photoTier`, `mainPhoto`, `cardMedia`) | unit; e2e |
| CA-43 | `lib/photos/policy.ts` (`allowedWidths`), `ui/Photo.astro`, `validate.ts` | e2e: ancho pintado ≤ ancho natural; build (`invalido-foto-pequena`) |
| CA-44 | `ui/PhotoCredit.astro` | e2e en listado, detalle, galería, visor y créditos |
| CA-45 | `lib/photos/policy.ts` (`creditParts`) | unit; e2e |
| CA-46 | `lib/content/schemas.ts` (`photoSchema`) | unit; build (`invalido-foto-sin-autor`) |
| CA-47 | `lib/content/schemas.ts`, `validate.ts` | unit; build |
| CA-48 | `lib/content/schemas.ts`, `validate.ts`, `ui/Photo.astro` | build; axe. Que el texto describa la imagen es revisión manual |
| CA-49 | `ui/Photo.astro`, `schemas.ts` (`ratio`) | e2e: proporción calculada y sin `filter`; manual |
| CA-50 | `pages/creditos.astro`, `sections/SiteFooter.astro` | e2e: recuento igual al de fotos publicadas |

### F. Galería y visor

| Criterio | Archivo(s) responsable(s) | Prueba |
|---|---|---|
| CA-51 | `lib/content/validate.ts` (`sections`), `lib/nav.ts`, `pages/index.astro` | e2e (`sin-fotos`) |
| CA-52 | `lib/gallery/group.ts`, `sections/Galeria.astro` | unit; e2e |
| CA-53 | `sections/PhotoGrid.astro`, `ui/PhotoCredit.astro` | e2e |
| CA-54 | `islands/gallery-lightbox.client.ts` | e2e; axe |
| CA-55 | `islands/GalleryLightbox.astro`, `gallery-lightbox.client.ts` | e2e; axe con el visor abierto |
| CA-56 | `gallery-lightbox.client.ts` | e2e |
| CA-57 | `lib/gallery/viewer-state.ts`, `gallery-lightbox.client.ts` | unit; e2e |
| CA-58 | `gallery-lightbox.client.ts` (región viva) | e2e; manual |
| CA-59 | `gallery-lightbox.client.ts`, `sections/PhotoGrid.astro` | e2e |
| CA-60 | `lib/gallery/viewer-state.ts` (`swipeDirection`), `gallery-lightbox.client.ts` | unit; e2e a 360 px con toque emulado |
| CA-61 | `styles/global.css`, `GalleryLightbox.astro` | e2e |
| CA-62 | `GalleryLightbox.astro` (estilos) | e2e: duración calculada, con y sin movimiento reducido |
| CA-63 | `gallery-lightbox.client.ts` | e2e: petición de la imagen abortada |
| CA-64 | `lib/gallery/viewer-state.ts` (`controls`) | unit; e2e (`minimo`) |
| CA-65 | `sections/PhotoGrid.astro`, `GalleryLightbox.astro` | e2e sin JS |
| CA-66 | `islands/runtime/when-visible.ts`, `GalleryLightbox.astro`, `ui/Photo.astro` | e2e: peticiones registradas en la carga inicial |

### G. Mapa de rutas

| Criterio | Archivo(s) responsable(s) | Prueba |
|---|---|---|
| CA-67 | `lib/content/validate.ts`, `lib/nav.ts`, `pages/index.astro` | e2e (`minimo`) |
| CA-68 | `sections/RouteList.astro`, `lib/routes/style.ts` | e2e con y sin JS |
| CA-69 | `lib/routes/style.ts`, `route-map.client.ts`, `styles/global.css` | e2e: patrón de cada trazo; manual |
| CA-70 | `route-map.client.ts`, `sections/RoutePanelTemplates.astro` | e2e |
| CA-71 | `route-map.client.ts`, `islands/RouteMap.astro` | e2e de teclado; axe con el mapa cargado |
| CA-72 | `route-map.client.ts` | e2e a 360 px: tamaños y ausencia de desplazamiento horizontal; manual en un celular para los gestos |
| CA-73 | `styles/tokens.css` (los dos tokens de teselas), `styles/global.css` | manual: medición sobre el mapa construido, por `ui-designer` y `quality-reviewer` |
| CA-74 | `route-map.client.ts` | e2e |
| CA-75 | `route-map.client.ts`, `islands/RouteMap.astro` | e2e: teselas abortadas y reloj adelantado; módulo abortado |
| CA-76 | `lib/routes/elevation-profile.ts`, `lib/routes/geo.ts`, `ui/ElevationProfile.astro` | unit; e2e con y sin elevación por punto |
| CA-77 | `lib/content/schemas.ts` (`rutaSchema`), `validate.ts` | unit; build (`invalido-ruta-sin-trazado`) |
| CA-78 | `lib/content/schemas.ts`, `validate.ts` | unit; build |
| CA-79 | `islands/runtime/when-visible.ts`, `RouteMap.astro` | e2e: sin peticiones de Leaflet, trazados ni teselas en la carga inicial |
| CA-80 | `sections/MapaRutas.astro`, `styles/global.css` (clase `js`) | e2e sin JS |

### H. Contacto

| Criterio | Archivo(s) responsable(s) | Prueba |
|---|---|---|
| CA-81 | `sections/Contacto.astro`, `SiteHeader.astro`, `pages/index.astro` | e2e |
| CA-82 | `sections/Contacto.astro`, `lib/contact/whatsapp.ts` (`formatPhone`), `content/sitio/operador.json` | e2e |
| CA-83 | `lib/contact/whatsapp.ts`, `Contacto.astro` | unit; e2e con y sin JS |
| CA-91 | `sections/Contacto.astro` | e2e a 360 px; manual |

### I. Navegación, estructura y SEO

| Criterio | Archivo(s) responsable(s) | Prueba |
|---|---|---|
| CA-93 | `lib/nav.ts`, `sections/SiteHeader.astro` | unit; e2e en los tres escenarios |
| CA-94 | `ui/SkipLink.astro`, `BaseLayout.astro` | e2e |
| CA-95 | `BaseLayout.astro` y todas las secciones | axe; e2e: `lang`, un `h1`, niveles sin saltos, regiones |
| CA-96 | `BaseLayout.astro` | e2e: metadatos presentes y sin imagen |
| CA-97 | `pages/[sitemap].xml.ts`, `pages/robots.txt.ts`, `lib/seo/meta.ts` | unit; build (`completo`): el mapa lista inicio y detalles y `robots.txt` lo referencia; build (`academico`): no existe el mapa |
| CA-98 | `sections/SiteFooter.astro` | e2e en todas las páginas: (`academico`) nombre con "proyecto académico"; (`completo`) nombre del operador |
| CA-99 | `lib/content/validate.ts`, `lib/content/load.ts`, `schemas.ts` (mensajes) | build: el mensaje contiene archivo, campo y regla |
| CA-100 | `lib/content/validate.ts` | unit; build (`invalido-sin-destinos`) |

### J. Lenguaje y contenido

| Criterio | Archivo(s) responsable(s) | Prueba |
|---|---|---|
| CA-101 | Todos los textos de `components/` y `src/content/**` | manual con lista; e2e: sin "usted" ni "vos" en ninguna página |
| CA-102 | `Hero.astro`, `src/content/**` | manual |
| CA-103 | `lib/format/units.ts`, `lib/ficha/build.ts` | unit; e2e: ninguna cifra sin unidad en fichas y perfil; sin "COP" ni precios |
| CA-104 | `lib/content/validate.ts`, `schemas.ts` | unit; build (`invalido-sin-verificar`, en publicación y en vista previa) |
| CA-105 | `styles/tokens.css`, `styles/global.css`, todos los componentes | unit `style-tokens.test.ts` (colores, tamaños de letra, duraciones y degradados fuera de los tokens); manual |

### K. Transversales

| Criterio | Archivo(s) responsable(s) | Prueba |
|---|---|---|
| CA-106 | Todos los componentes interactivos | e2e de teclado por página, con visor y mapa abiertos y cerrados |
| CA-107 | `styles/global.css` (`:focus-visible`) | e2e: contorno calculado; manual de contraste |
| CA-108 | Todas las páginas | axe: inicio, detalle con fotos, detalle sin fotos, las tres legales, créditos, 404, visor abierto, mapa cargado, mapa fallido |
| CA-109 | Todas las páginas | manual: NVDA y TalkBack con las cinco tareas |
| CA-110 | Todos los componentes | e2e a 360 px: sin desplazamiento horizontal; controles ≥ 44 px salvo los enlaces del crédito y las líneas de ruta del mapa |
| CA-111 | Todos los componentes | manual a 320 px y 200 % |
| CA-112 | Páginas, `MapaRutas.astro`, `PhotoGrid.astro`, `SiteHeader.astro` | e2e sin JS |
| CA-113 | `styles/tokens.css`, `styles/global.css`, `route-map.client.ts` | e2e con movimiento reducido emulado |
| CA-114 | `styles/tokens.css` y su uso | axe (contraste); manual de los pares de la sección 4.3 |
| CA-115 | Todo el sitio; `scripts/lhci.mjs`, `lighthouserc.json` | Lighthouse CI, tres páginas: (`academico`) sin la auditoría `is-crawlable`; (`completo`) categoría SEO completa; las cuatro categorías ≥ 90 |
| CA-116 | `BaseLayout.astro`, `styles/fonts.css`, `Hero.astro` | Lighthouse CI: LCP ≤ 2.5 s, CLS ≤ 0.1, TBT ≤ 200 ms |
| CA-117 | `ui/Photo.astro`, `styles/global.css` | e2e: imágenes abortadas; la posición del contenido no cambia |

### L y M. Legales, operador y adiciones

| Criterio | Archivo(s) responsable(s) | Prueba |
|---|---|---|
| CA-118 | `schemas.ts` (`legalSchema`), `validate.ts`, `pages/legal/[slug].astro`, `ui/DraftBanner.astro` | (a) build: publicación de `minimo` falla nombrando el texto; e2e (`minimo`): banda visible. (b) unit: en académico no se exige revisión |
| CA-119 | `schemas.ts` (`operatorSchema`), `validate.ts`, `SiteFooter.astro` | unit en los cuatro cruces. (a) build: publicación de `minimo` falla nombrando el identificador; e2e (`minimo`): sin línea ni hueco. (b) build (`invalido-identificador-en-academico`): falla en ambas compilaciones; e2e (`academico`): ningún identificador |
| CA-120 | `lib/content/placeholders.ts`, `validate.ts` | unit con la lista de marcadores, incluidos el WhatsApp y el correo reales como no relleno; build (`invalido-relleno`) |
| CA-121 | `pages/legal/[slug].astro`, `SiteFooter.astro`, `ui/SampleLabel.astro`, `lib/format/units.ts` (`formatLongDate`) | (a) e2e (`completo`): `h1`, fecha e identificador. (b) e2e (`academico`): `h1` y rótulo, sin fecha ni identificador |
| CA-122 | `schemas.ts` (`territorySchema`), `validate.ts` | unit; build (`invalido-fuera-de-rango`, `invalido-umbrales`) |
| CA-123 | `sections/SiteHeader.astro` | e2e a 360 px y en el borde de 767 y 768 px, con y sin JS; axe con el menú abierto |
| CA-124 | `tests/e2e/capturas.spec.ts` genera las capturas en `specs/001-landing-completa/capturas/`: perfil a 320, 360, 768 y 1280 px y las cuatro láminas en los cuatro tamaños de cifra | manual: aprobación escrita del humano en `specs/001-landing-completa/revision-capturas.md` |

### N. Modo de ejercicio académico

| Criterio | Archivo(s) responsable(s) | Prueba |
|---|---|---|
| CA-125 | `schemas.ts` (`operatorSchema.siteKind`), `validate.ts`, `content/sitio/operador.json` | unit; build (`invalido-sin-modo`) en ambas compilaciones |
| CA-126 | `ui/AcademicNotice.astro`, `layouts/BaseLayout.astro` | e2e (`academico`) a 360 px: aviso dentro de la primera pantalla en inicio, cada detalle, tres legales, créditos y 404 |
| CA-127 | `ui/AcademicNotice.astro`, `BaseLayout.astro` | axe; e2e: texto real, región con nombre, antes de `main` en el documento, sin `role="alert"` ni región viva |
| CA-128 | `ui/AcademicNotice.astro`, `styles/global.css` | e2e sin JS y a 360 px: completo, sin desplazamiento horizontal y sin tapar ningún elemento enfocable |
| CA-129 | `ui/AcademicNotice.astro` | e2e: sin botones ni enlaces de cierre; sigue tras recargar, navegar y abrir un contexto nuevo; sin cookies ni almacenamiento |
| CA-130 | `ui/AcademicNotice.astro`, `styles/tokens.css` | axe (contraste); e2e: tamaño de letra ≥ 14 px; manual del par de color |
| CA-131 | `sections/Contacto.astro` | e2e (`academico`): frase presente junto a WhatsApp y correo; (`completo`): ausente |
| CA-132 | `lib/contact/whatsapp.ts`, `Contacto.astro` | unit; e2e (`academico`): texto del enlace decodificado, con y sin destino |
| CA-133 | `BaseLayout.astro`, `pages/robots.txt.ts`, `pages/[sitemap].xml.ts`, `lib/seo/meta.ts`, `vercel.json` | build (`academico`, publicación): metaetiqueta en todos los HTML, sin `sitemap.xml`, `robots.txt` sin línea `Sitemap`; e2e: metaetiqueta en cada tipo de página; build: coherencia de `vercel.json` |
| CA-134 | `schemas.ts` (`status: sample`), `validate.ts`, `pages/legal/[slug].astro`, `ui/SampleLabel.astro` | unit; build (`invalido-legal-sin-rotulo`); e2e (`academico`): rótulo antes del contenido en las tres |
| CA-135 | `content/legal/politica-de-datos.md`, `lib/privacy/third-parties.ts`, `validate.ts` | unit: la política nombra a cada tercero; e2e: sin cookies ni almacenamiento; manual: veracidad del texto con lista de pasos |
| CA-136 | `lib/privacy/third-parties.ts`, `lib/routes/map-config.ts`, todas las páginas | e2e: orígenes pedidos por cada página y por el inicio con el mapa cargado, contra el registro y el texto de la política; unit: el origen de las teselas está en el registro |
| CA-137 | `lib/content/commercial-terms.ts`, `validate.ts` (aviso), `src/content/**`, `tests/e2e/data/terminos-revisados.json` | unit de la búsqueda; e2e sobre el contenido real: ninguna coincidencia sin revisar; manual: revisión de cada coincidencia |
| CA-138 | `validate.ts`, `BaseLayout.astro`, `pages/[sitemap].xml.ts`, `SiteFooter.astro` | unit en los cuatro cruces; build y e2e (`completo`): sin aviso, sin metaetiqueta, con mapa del sitio, fecha e identificador; build (`invalido-muestra-en-operador`) |
| CA-139 | `validate.ts`, `load.ts` (`siteUrlIssues`) | build en publicación, para cada causa y en los dos modos: sin verificar, foto inválida, ruta inválida, dos principales, sin destinos, contacto de relleno, sin `SITE_URL` |

Los 131 criterios activos tienen archivo responsable. Ninguno queda sin asignar.

### Escenarios de prueba

**Actualizado por R8** de la revisión del 2026-10-11: se añade `academico`, que pasa a ser el escenario por defecto, y cada escenario declara `siteKind`. La tabla siguiente es la del 2026-10-10.

| Escenario | Modo | Contenido | Para qué |
|---|---|---|---|
| `completo` | publicación | Siete destinos en los cuatro pisos (un piso con tres, dos con la misma altitud, uno sin fotos, uno con dos fotos, uno con cuatro, uno principal con solo fotos pequeñas); cuatro rutas (dos en un mismo piso, una sin elevación por punto); legales revisados; identificadores presentes | La mayoría de e2e, axe y Lighthouse |
| `minimo` | vista previa | Un destino, una foto, ninguna ruta, legales en borrador, sin identificadores | CA-14, CA-64, CA-67, CA-118, CA-119 |
| `sin-fotos` | vista previa | Cuatro destinos sin fotos, uno por piso; una ruta | CA-38, CA-39, CA-51, CA-124 |
| `invalido-*` | ambos | Un defecto cada uno | Criterios `[build]` |

Las fotos de los escenarios son imágenes sintéticas de color plano, con las dimensiones que cada
caso necesita.

---

## Presupuesto de rendimiento

| Recurso | Presupuesto | Nota |
|---|---|---|
| HTML del inicio | 45 KB gzip | Incluye las tres variantes del perfil, los símbolos de las láminas y las plantillas de ruta |
| CSS total | 15 KB gzip | Un archivo |
| JS en la carga inicial | 1.5 KB gzip | Cargador, menú, clase `js` |
| Isla del visor | 4 KB gzip | Diferida |
| Isla del mapa | 50 KB gzip de JS, 3.5 de CSS, 15 de trazados | Diferida. Las teselas (unos 300 a 500 KB por vista) no son del sitio |
| Fuentes | 49.0 KB: Besley 18.9 e Instrument Sans 30.1 | WOFF2 ya comprimido. Solo Besley se precarga |
| Imágenes en la primera pantalla | 0 KB | El hero no tiene fotos |
| Foto principal 3:2 | 120 KB como máximo a 1200 px | AVIF |
| Miniatura de galería | 30 KB como máximo a 480 px | AVIF |
| Foto ampliada | 350 KB como máximo | AVIF, al abrir el visor |
| Peso transferido del inicio sin desplazarse | 180 KB | HTML, CSS, JS inicial y las dos fuentes |
| Foto en el repositorio | 1.5 MB y 2560 px de lado mayor como máximo | ADR 0008 |
| Trazado de una ruta | 400 puntos como máximo | Aviso en el build si se supera |

Lighthouse CI comprueba CA-115 y CA-116. Los pesos de JS se comprueban en una prueba de `tests/build/`
que mide los archivos de `dist/_astro/`.

---

## Riesgos

| N.º | Riesgo | Efecto | Mitigación |
|---|---|---|---|
| R1 | El perfil generado no convence en la captura (CA-124) | Rehacer el hero | Construir perfil y láminas al principio de la implementación y pedir la revisión antes de seguir. El respaldo de S3.10 no cambia el contrato de `Hero` |
| R2 | A 320 px la variante compacta queda por debajo de su ancho de cálculo (360): con cinco puntos la separación baja de 45 a 40 px y las etiquetas no están comprobadas | CA-111 | Incluir la captura a 320 px en la revisión de CA-124. Las áreas siguen por encima de los 24 px de WCAG 2.5.8. Decide `ui-designer` (corrección pendiente C6) |
| R3 | El cambio de fuente del titular mueve el contenido | CLS de CA-116 | Precarga de Besley. Si la medición supera 0.05, añadir una fuente de respaldo con métricas ajustadas; eso cambia `--font-display` en los tokens y pasa por `ui-designer` |
| R4 | OpenStreetMap limita o bloquea las teselas | Mapa caído en producción | Estado de S9.6 con la lista completa; URL en una constante para cambiar de proveedor; ADR 0001 ya lo anota |
| R5 | El contraste de las rutas sobre las teselas no llega a 3:1 (CA-73) | Ajuste de tokens | El halo de color papel hace que la línea se lea contra el halo. Medir pronto; el ajuste es de dos tokens |
| R6 | Gestos táctiles del mapa difíciles de automatizar | CA-72 con cobertura parcial | e2e para tamaños y desplazamiento; prueba manual en un celular real |
| R7 | `@starting-style` sin soporte en navegadores antiguos | El visor abre sin desvanecido | Degradación aceptable: CA-62 se cumple en navegadores actuales y el contenido no se pierde |
| R8 | El texto alternativo de una imagen rota se pinta distinto según el navegador | CA-117 parcial en Safari | La caja y el `alt` se conservan siempre; el estilo del texto es mejora |
| R9 | Reintentar un `import()` fallido no siempre vuelve a pedir el módulo | "Volver a cargar el mapa" sin efecto | Segundo intento con recarga de la página en el ancla de la sección |
| R10 | Alguien despliega la vista previa | Borradores públicos | La vista previa lleva `noindex` y `robots.txt` cerrado; la orden de despliegue documentada es `build:release` |
| R11 | Compilar varios escenarios a la vez comparte el almacén de contenido de Astro | Pruebas inestables | Construir los escenarios en serie, cada uno con su `OUT_DIR`, antes de levantar los servidores |
| R12 | El repositorio crece con las fotos | Clonado lento | Tope por foto; con el contenido previsto (unas 25 fotos) son menos de 40 MB |
| R13 | Marcadores de relleno demasiado estrictos o laxos (CA-120) | Falsos positivos o datos de prueba publicados | Lista explícita con pruebas unitarias; el campo `fictitious` es la vía segura |
| R14 | Numerales tabulares de Instrument Sans en el subconjunto latino sin confirmar | Columnas de cifras desalineadas | Comprobar al cargar la fuente; el diseño ya lo trata como opcional |
| R16 | `vercel.json` es estático y no conoce `siteKind` | Si el sitio pasara a operador real, la cabecera `X-Robots-Tag` seguiría impidiendo indexar | Prueba de `tests/build/` que exige coherencia entre `siteKind` del contenido real y la cabecera |
| R17 | La nota de SEO de Lighthouse con `skipAudits` depende de cómo esa versión recalcula la categoría | CA-115 con medición distinta de la esperada | Comprobar en T-137 que el informe no lista `is-crawlable` y que la nota sale de las demás auditorías; si no, afirmar cada auditoría de SEO por separado |
| R18 | La lista de promesas comerciales da falsos positivos ("Reserva Natural", textos legales de muestra que hablan de cancelaciones) | Ruido que lleva a ampliar la lista de frases revisadas sin leer | Cada frase revisada lleva motivo, revisor y fecha; `quality-reviewer` las repasa en la fase 8 |
| R19 | El contenido real es escaso: seis destinos sin fotos, sin rutas todavía, fichas de una a tres filas | La galería y el mapa no se publican; el sitio real ejercita menos que los escenarios | Es un estado válido (CA-51, CA-67). Las pruebas usan escenarios completos; T-131 y T-035 amplían el contenido |
| R20 | La descarga de fotos depende de Wikimedia Commons y de su política de agente de usuario | T-131 falla o se bloquea | El guion se identifica con un agente de usuario propio, descarga en serie y se ejecuta una sola vez; las fotos quedan en el repositorio |
| R21 | Vercel sirve `404.html` y aplica las cabeceras como se espera, pero no se ha comprobado en este proyecto | CA-37 o CA-133 fallan solo en producción | T-140 lo verifica con peticiones reales tras el primer despliegue |
| R22 | Un despliegue de producción con `siteKind` mal declarado | Operador real declarado académico: aviso visible y sin indexar. Académico declarado operador: la publicación falla por faltar identificadores | Las dos fallas son visibles y seguras; por eso la declaración es obligatoria (CA-125) |
| R15 | `--mode preview` cambia `import.meta.env.MODE` pero no `PROD` | Confusión entre modos | El modo se lee en un solo sitio (`load.ts`) y se pasa como dato |

---

## Orden de construcción y paralelismo

`CLAUDE.md` pone el contenido (fase 5) antes de la implementación (fase 6), pero `content-curator`
necesita el esquema para validar lo que escribe, y el esquema es código. El orden propuesto adelanta
solo esa parte:

| Paso | Quién | Qué | Depende de |
|---|---|---|---|
| 0 | humano | Aprobar este plan y los ADR (hecho el 2026-10-10) | — |
| 1 | `astro-developer` | Fundaciones: dependencias aprobadas, configuración de ESLint, Prettier, Vitest y Playwright, `global.css` con tokens y fuentes, `astro.config`, guiones de `package.json` | 0 |
| 2 | `astro-developer` | Esquemas, `validateSite()`, `loadSite()` y los escenarios de prueba | 1 |
| 3a | `content-curator` | `territorio.json` verificado, destinos, rutas, fotos con atribución, textos legales en borrador, `operador.json`. El humano aprueba la lista (PA-15) | 2 |
| 3b | `astro-developer` con `qa-engineer` | Resto de `lib/` con sus pruebas unitarias | 2 |
| 4 | `astro-developer` | `BaseLayout`, cabecera, pie, hero con perfil, láminas | 3b |
| 5 | humano | **Revisión con capturas (CA-124).** Decide si aplica el respaldo | 4 |
| 6 | `astro-developer` | Ficha, destinos, detalle, contacto, legales, créditos, 404, archivos de rastreo | 4 |
| 7a | `astro-developer` | Isla del visor | 6 |
| 7b | `astro-developer` | Isla del mapa | 6 |
| 8 | `qa-engineer` | e2e, axe, Lighthouse, listas manuales | Avanza detrás de 4, 6 y 7 |
| 9 | `ui-designer`, `quality-reviewer` | Medición de CA-73 y revisión final | 7b, 3a |

**En paralelo:** 3a con 3b, 4, 6 y 7 (el desarrollo trabaja sobre los escenarios de prueba, no
sobre el contenido real); 7a con 7b, que no comparten archivos; 8 con 6 y 7.

**No en paralelo:** nada empieza antes del paso 2; el paso 6 no debería cerrarse antes del 5,
porque el respaldo cambia el hero.

El contenido real solo se necesita para el paso 9 y para la compilación de publicación.

---

## Inconsistencias detectadas

No se editó ningún documento. Cada punto dice qué asume el plan.

| N.º | Entre | Inconsistencia | Qué asume el plan |
|---|---|---|---|
| 1 | spec (CA-123, "Móvil significa 360 px") y `design.md` S1 y S2 | La spec exige el control "Menú" a 360 px; el diseño lo aplica a todo el rango de 360 a 767 px | **Aceptado por el humano:** el rango del diseño, de 360 a 767 px. Se prueba a 360 px y en el borde de 767 y 768 px |
| 2 | Comentario de `--shadow-overlay`, dirección visual 5.3 y `design.md` S9.3 | Tokens y dirección visual hablan de "ventana emergente del mapa y controles del visor"; el diseño no tiene ventana emergente (el panel va fuera del mapa) ni sombra en el visor, y usa la sombra solo en los controles flotantes del mapa | **Aceptado por el humano:** la sombra solo en los controles del mapa. Corrección pendiente C4 |
| 3 | spec CA-68 y `design.md` S9.1 y tabla de estados | La spec pide la letra clave en la lista "con o sin JavaScript"; el diseño la añade solo "cuando el mapa está activo" y dice que sin JS la lista va "sin letras ni botones" | **Decidido por el humano:** manda la spec. La letra clave aparece con y sin JavaScript; la muestra de trazo y el botón, solo con el mapa activo. Corrección pendiente C1 |
| 4 | `CLAUDE.md`, regla 1 y sección "Stack" | Pide `client:visible` y también islas sin framework; la directiva solo existe para componentes de framework | Carga diferida equivalente (ADR 0004) |
| 5 | `design.md` S6.2 y `tokens.css` | El crédito pide interlineado de 24 px; `--text-sm` trae 1.45 (20.3 px) y no hay token de interlineado de 24 px | Usar `--space-6` como interlineado del crédito. Si se prefiere un token propio, lo añade `ui-designer` |
| 6 | `design.md` S1 y S3.4 | A 320 px "vale el layout móvil", pero la variante compacta se calcula para 360 px y su capacidad de cinco puntos no se sostiene a 320 px | Riesgo R2; se revisa con captura |
| 7 | `design.md`, "Trazabilidad" | Dice "los 113 criterios activos"; la spec tiene 116. Faltan CA-122, CA-123 y CA-124, que el diseño sí cubre en S3.5, S2 y el punto de control | La matriz de este plan cubre los 116 |
| 8 | `CLAUDE.md`, regla 1, y `design.md` S2 | "Todo es estático salvo galería y mapa"; el diseño pide que, con JavaScript, el menú se cierre con Esc y al elegir un enlace | Un guion mínimo de mejora, documentado en el ADR 0004 |
| 9 | spec CA-23 y `design.md` S7 | La primera altitud de la página de detalle debe decir "metros de altitud", pero en escritorio la regla de altitud ("De 1000 a 2000 m") acompaña a los bloques 2 a 6 y podría quedar antes en el HTML | La regla de altitud va después del bloque 3 en el orden del documento y se coloca con la grilla |
| 10 | Dirección visual 4.2 y `design.md` S1 | El rango de los pisos extremos: "menos de 1000 m" y "más de 3000 m" frente a la forma única "De X a Y m" | "De {mínima} a {umbral} m" y "De {umbral} a {máxima} m" |
| 11 | Dirección visual 3.1 y `design.md` S4 | El nombre de un destino menor mide 21 px en tableta y móvil; la tabla tipográfica solo prevé 33 y 27 px para títulos de destino | El diseño; el tamaño está en la escala |
| 12 | Comentarios de `tokens.css` | Mencionan formularios (`--color-surface`, `--color-ink-muted`, `--color-danger`, `--radius-md`), tinte como "fondo de bloque" (`--color-zone-*-tint`) y "desplegar un panel" (`--duration-base`), que ya no existen en el diseño | Solo son comentarios; no afectan valores |
| 13 | Dirección visual 3.3 y uso real | Pide dos archivos variables; Besley solo se usa en peso 700 y su archivo estático pesa 18.9 KB frente a 36.6 KB | **Decidido por el humano:** Besley estática de peso 700 (decisión D5). Corrección pendiente C3 |
| 14 | ADR 0001 y 0002 | Seguían en "Propuesto" | Resuelto: aceptados por el humano el 2026-10-11 |
| 15 | spec CA-133 y el funcionamiento de los buscadores | Pide que el archivo de instrucciones para buscadores "pida no indexar el sitio". `robots.txt` no tiene directiva estándar de no indexar; solo puede bloquear el rastreo, y eso impide que el buscador lea la instrucción real | `robots.txt` no bloquea, no anuncia mapa y lleva un comentario; la instrucción va en la metaetiqueta y en la cabecera `X-Robots-Tag` (R3). Conviene que `spec-writer` ajuste la frase |
| 16 | spec CA-97, tarea T-026 y código | El problema "falta `SITE_URL`" lleva hoy el criterio CA-97; tras la revisión corresponde a CA-139 | Se corrige la etiqueta en T-121 |
| 17 | spec CA-21, CA-24 y el contenido real | La ficha pide una altitud y un rango de clima; hay destinos con rango de altitud y destinos con solo temperatura media | Límite documentado (R9); sin cambio de esquema ni de spec |
| 18 | spec CA-118 (b) y CA-134 | En modo académico "no se exige revisión", pero el contenido necesita un estado que no sea borrador ni revisado | Estado nuevo `sample` en el esquema (R2) |
| 19 | `design.md` y la spec | El diseño aún no recoge el aviso, la aclaración del contacto, el rótulo de muestra ni el pie académico | En curso por `ui-designer` (T-118); el plan fija comportamiento y remite la presentación al diseño |
| 20 | `CLAUDE.md`, `scripts/lhci.mjs` y CA-115 | El guion de Lighthouse mide una vista previa del contenido real, que nunca es indexable | Se mide la publicación de dos escenarios (R6) |

---

## Skills recomendadas

Ninguna. Se buscó con `npx skills find` (`leaflet`, `astro`, `accessibility wcag`, `playwright`):

| Candidata | Datos | Por qué no |
|---|---|---|
| Skills de Leaflet (`zenobi-us/dotfiles@leaflet-mapping` y otras) | Menos de 220 instalaciones; autores sin relación con Leaflet | Por debajo del umbral de confianza |
| `astrolicious/agent-skills@astro` | 16.7 K instalaciones; 14 estrellas | Remite a la documentación oficial, que `AGENTS.md` ya enlaza |
| `addyosmani/web-quality-skills@accessibility` | 60.1 K instalaciones; 2.9 K estrellas; WCAG 2.2 | Autor reconocido, pero la spec ya fija cada requisito de accesibilidad con su prueba; se apoya en una herramienta de navegador que el proyecto no tiene; licencia no visible |
| `anthropics/skills@webapp-testing` | 173.9 K instalaciones | Orientada a guiones de Playwright en Python; el proyecto usa `@playwright/test` |

---

## Decisiones del humano (2026-10-10)

| N.º | Tema | Decisión | Dónde queda |
|---|---|---|---|
| 1 | Dominio y alojamiento | Aún sin definir. `SITE_URL` solo es obligatoria en la compilación de publicación, que falla con un mensaje claro si falta; la vista previa usa un valor local. Sin subruta mientras no se diga otra cosa | D1; ADR 0003; pendiente 1 |
| 2 | `npm run build` | Es vista previa (permisiva, `noindex`, borradores marcados). `build:release` es la compilación estricta. El alojamiento se configura con `build:release` | D1; ADR 0003 |
| 3 | Idioma de las claves del contenido | Inglés | Contratos; ADR 0003 |
| 4 | Letra clave de las rutas sin JavaScript | Se sigue la spec (CA-68): aparece con y sin JavaScript | Inconsistencia 3; corrección pendiente C1 |
| 5 | Besley estática de peso 700 | Aceptada. Comprobado que ningún texto en Besley usa otro peso | D5; ADR 0007; corrección pendiente C3 |
| 6 | Identificadores exigidos para publicar | RNT, NIT y razón social como punto de partida; la confirmación legal sigue abierta | D1; pendiente 2 |
| 7 | Supuestos del plan | Aceptados: menú móvil de 360 a 767 px; CA-122 falla también en vista previa; `--shadow-overlay` solo en los controles del mapa; el aviso de privacidad sobre el envío de la IP a OpenStreetMap entra en el borrador de la política de datos; el esquema se construye primero y después contenido y desarrollo van en paralelo | Inconsistencias 1 y 2; D1; orden de construcción |

## Correcciones pendientes de documentos

Este plan no edita esos documentos. Cada corrección es una tarea de `tasks.md`.

| N.º | Documento | Corrección | Quién |
|---|---|---|---|
| C1 | `design.md` S9.1 y tabla "Estados" (fila "Lista de rutas") | La letra clave aparece siempre, con y sin JavaScript (CA-68). Solo la muestra de trazo y el botón "Ver en el mapa" dependen del mapa activo | `ui-designer` |
| C2 | `design.md`, "Trazabilidad" | Dice 113 criterios activos; son 116 (faltan CA-122, CA-123 y CA-124) | `ui-designer` |
| C3 | Dirección visual 3.3 | "Dos archivos variables" pasa a: Besley estática de peso 700 e Instrument Sans variable | `ui-designer` |
| C4 | Dirección visual 5.3 y comentario de `--shadow-overlay` en `tokens.css` | La sombra solo la usan los controles flotantes del mapa; no hay ventana emergente ni sombra en el visor. Los dos archivos cambian en el mismo commit | `ui-designer` |
| C5 | `design.md` S6.2 y `tokens.css` | Interlineado de 24 px del crédito: confirmar `--space-6` o añadir un token | `ui-designer` |
| C6 | `design.md` S1 y S3.4 | Qué pasa con el perfil a 320 px; se decide con la captura de CA-124 | `ui-designer` |
| C7 | Comentarios de `tokens.css` | Retirar las menciones a formularios, a "fondo de bloque" y a "desplegar un panel" | `ui-designer` |
| C8 | `CLAUDE.md` | Estructura (`content/legal`, `content/sitio`, `assets/`, `tests/build`, `tests/fixtures`); regla 1 ("carga diferida equivalente a `client:visible`" y las tres ayudas mínimas); guiones `build:release`, `test:build` y `test:lh`; tabla de stack. **Autorizado por el humano el 2026-10-10** | asistente principal |
| C9 | ADR 0001 y 0002 | Siguen en "Propuesto" | humano |

## Pendientes

Ninguno bloquea el desarrollo.

1. **Dominio (PA-17).** El alojamiento es Vercel (R7). Falta decidir la dirección pública y definir
   `SITE_URL` en el entorno Production. Bloquea la publicación, no el desarrollo.
2. **PA-8.** Reclasificada: no aplica en modo académico. Solo vuelve si el sitio pasa a un operador
   real.
3. **PA-15.** Cerrada: lista aprobada el 2026-10-11.
7. **Aprobación de la revisión del 2026-10-11** de este plan, del ADR 0003 revisado y del ADR 0012.
8. **Redacción de CA-133** (inconsistencia 15), para `spec-writer`.
9. **Aprobación del `design.md`** con el aviso, la aclaración del contacto, el rótulo y el pie.
4. **CA-124.** Revisión con capturas del perfil y las láminas; decide si aplica el respaldo.
5. **CA-73.** Medición del contraste de las rutas sobre las teselas, con el mapa construido.

---

## ADRs relacionados

- [0001 — Astro + TypeScript como stack base](../../docs/adr/0001-stack-astro-typescript.md) (existente)
- [0002 — Uso de skills en el flujo SDD](../../docs/adr/0002-politica-de-skills.md) (existente)
- [0003 — Modelo de contenido y puerta de publicación](../../docs/adr/0003-modelo-de-contenido-y-puerta-de-publicacion.md) (revisado el 2026-10-11; la revisión fue aprobada por el humano el 2026-10-11)
- [0004 — Islas sin framework con carga diferida](../../docs/adr/0004-islas-sin-framework.md)
- [0005 — Visor de fotos propio sobre `<dialog>`](../../docs/adr/0005-visor-propio-sobre-dialog.md)
- [0006 — Leaflet y teselas de OpenStreetMap](../../docs/adr/0006-leaflet-y-teselas-osm.md)
- [0007 — Fuentes autoalojadas sin dependencia](../../docs/adr/0007-fuentes-autoalojadas.md)
- [0008 — Fotos de terceros locales y atribución en el contenido](../../docs/adr/0008-fotos-locales-y-atribucion.md)
- [0009 — Herramientas de calidad: dependencias de desarrollo](../../docs/adr/0009-herramientas-de-calidad.md)
- [0010 — Perfil, láminas y gráficos generados en el build](../../docs/adr/0010-graficos-generados-en-build.md)
- [0011 — `yaml` como dependencia de desarrollo](../../docs/adr/0011-yaml-para-probar-la-guia-de-contenido.md)
- [0012 — Despliegue en Vercel sin adaptador y política de no indexación](../../docs/adr/0012-despliegue-en-vercel.md) (propuesto)

---
Estado: APROBADO (2026-10-10, aprobado por el humano). Revisión del 2026-10-11 (modo académico y
despliegue en Vercel): APROBADA (2026-10-11, por el humano).
