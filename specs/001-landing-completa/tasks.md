# 001 — Tareas

Spec: [spec.md](./spec.md) · Diseño: [design.md](./design.md) · Plan: [plan.md](./plan.md)

**Listo para ejecutar.** El humano aprobó el plan y los ADR 0003 a 0010 el 2026-10-10, incluida la
instalación de las cinco dependencias (`leaflet`, `@types/leaflet`, `typescript-eslint`,
`prettier-plugin-astro`, `@lhci/cli`). `specs/_plantillas/` no tiene plantilla de tareas; este
documento sigue el formato pedido en la definición del agente (tarea atómica, verificación "hecho
cuando…", agente).

## Cómo leerlo

- Cada tarea cabe en una hora aproximada y la ejecuta un solo agente.
- **[P]** marca una tarea que puede hacerse a la vez que las demás tareas [P] de su mismo bloque,
  una vez cumplidas sus dependencias. Sin [P], va en el orden escrito.
- "Depende de" lista tareas que deben estar hechas antes.
- Rutas relativas a la raíz del repositorio.
- Toda instalación (`npm install`) sigue pidiendo confirmación por `.claude/settings.json`. Sus
  ADR ya están aceptados.
- **Cierre de hito:** `npm run build`, `npm run lint` y `npm run test` en verde. `npm run build` es
  la compilación de vista previa (ADR 0003).

## Resumen de hitos

| Hito | Contenido | Tareas | Corre en paralelo con |
|---|---|---|---|
| H0 | Aprobaciones y correcciones de documentos | T-001 a T-006 | T-002 a T-006 no bloquean H1 |
| H1 | Puesta a punto del repositorio | T-007 a T-017 | — |
| H2 | Esquema de contenido y puerta de publicación | T-018 a T-027 | — |
| H3 | Contenido real | T-028 a T-039 | H4, H5 y H6 |
| H4 | Base, hero, perfil, láminas y punto de control CA-124 | T-040 a T-061 | H3 |
| H5 | Páginas y secciones estáticas | T-062 a T-077 | H3 |
| H6 | Islas: visor y mapa | T-078 a T-091 | H3; el visor con el mapa |
| H7 | Pruebas (fase 7) | T-092 a T-110 | Las suites, entre sí |
| H8 | Revisión (fase 8) y cierre | T-111 a T-116 | — |

Escenarios de prueba citados: `completo`, `minimo`, `sin-fotos`, `invalido-*` (plan, "Escenarios de
prueba").

---

## H0 — Aprobaciones y correcciones de documentos

- [x] **T-001** · humano — Aprobar `plan.md` y los ADR 0003 a 0010. **Hecho el 2026-10-10.**
  - Archivos: `specs/001-landing-completa/plan.md`, `docs/adr/0003` a `0010`.
  - Depende de: —
  - Hecho cuando: el plan dice "APROBADO (fecha, quién)" y cada ADR "Aceptado". **Bloquea todo lo
    demás.**
- [x] **T-002** · `ui-designer` [P] — Corregir `design.md`: letra clave de las rutas visible con y
  sin JavaScript (S9.1 y fila "Lista de rutas" de "Estados"); recuento de 116 criterios en
  "Trazabilidad" (correcciones C1 y C2 del plan).
  - CA: CA-68. Depende de: T-001.
  - Hecho cuando: S9.1 y la tabla de estados coinciden con CA-68, y el humano aprueba el cambio.
- [x] **T-003** · `ui-designer` [P] — Corregir la dirección visual 3.3 (Besley estática de peso 700,
  Instrument Sans variable) y 5.3 (sombra solo en los controles del mapa), con el comentario de
  `--shadow-overlay` en `tokens.css` en el mismo commit (C3 y C4).
  - Archivos: `docs/design/direccion-visual.md`, `src/styles/tokens.css` (solo comentario).
  - Depende de: T-001.
  - Hecho cuando: los dos documentos dicen lo mismo y el humano aprueba el cambio.
- [x] **T-004** · `ui-designer` [P] — Resolver el interlineado de 24 px del crédito (usar
  `--space-6` o añadir un token) y limpiar los comentarios de `tokens.css` que hablan de formularios,
  "fondo de bloque" y "desplegar un panel" (C5 y C7).
  - Archivos: `specs/001-landing-completa/design.md`, `src/styles/tokens.css`,
    `docs/design/direccion-visual.md` si se añade token.
  - CA: CA-44, CA-105. Depende de: T-001.
  - Hecho cuando: S6.2 nombra el token que da los 24 px y el humano aprueba el cambio.
- [x] **T-005** · asistente principal [P] — Actualizar `CLAUDE.md`, autorizado por el humano el
  2026-10-10: tabla de stack, sección de comandos, bloque de estructura (`content/legal`,
  `content/sitio`, `assets/`, `tests/build`, `tests/fixtures`) y regla 1 (carga diferida
  equivalente a `client:visible` y las tres ayudas mínimas) (C8). El texto propuesto lo entregó
  `software-architect` con el plan. Ningún subagente edita este archivo.
  - Archivos: `CLAUDE.md`.
  - Depende de: T-001.
  - Hecho cuando: `CLAUDE.md` refleja los ADR 0003, 0004, 0007 y 0009.
- [ ] **T-006** · humano [P] — Pasar los ADR 0001 y 0002 de "Propuesto" a su estado real (C9).
  - Depende de: —
  - Hecho cuando: ambos ADR tienen estado decidido.

---

## H1 — Puesta a punto del repositorio

- [x] **T-007** · `astro-developer` — Instalar `typescript-eslint` y `prettier-plugin-astro` como
  dependencias de desarrollo.
  - Archivos: `package.json`, `package-lock.json`.
  - Depende de: T-001 (**ADR 0009 aprobado**).
  - Hecho cuando: `npm ls typescript-eslint prettier-plugin-astro` las lista sin errores.
- [x] **T-008** · `astro-developer` — Configurar ESLint: reglas recomendadas de TypeScript y de
  Astro, `no-explicit-any` como error y las reglas de capas con `no-restricted-imports`.
  - Archivos: `eslint.config.js`.
  - Depende de: T-007.
  - Hecho cuando: `npx eslint .` termina sin errores, y un archivo de prueba en `src/components/ui/`
    que importe `astro:content` produce error.
- [x] **T-009** · `astro-developer` [P] — Configurar Prettier con el complemento de Astro y su lista
  de exclusiones (`dist/`, `.astro/`, `.claude/`, `.agents/`, `specs/`, `docs/`, archivos de bloqueo).
  - Archivos: `.prettierrc`, `.prettierignore`.
  - Depende de: T-007.
  - Hecho cuando: `npx prettier --check .` pasa y `npm run lint` queda en verde.
- [x] **T-010** · `astro-developer` [P] — Ajustar `astro.config.mjs` (`site` desde `SITE_URL` con
  valor local por defecto, `trailingSlash: 'always'`, `outDir` desde `OUT_DIR`) y los guiones de
  `package.json`: `build` en modo vista previa, `build:release`, `test:build`, `test:lh`.
  - Archivos: `astro.config.mjs`, `package.json`.
  - CA: CA-97, CA-118, CA-119. Depende de: T-001 (**ADR 0003 aprobado**).
  - Hecho cuando: `npm run build` y `npm run build:release` generan `dist/` con la página de
    plantilla.
- [x] **T-011** · `astro-developer` [P] — Añadir las dos fuentes y sus licencias, y declararlas.
  - Archivos: `src/assets/fonts/besley-latin-700-normal.woff2`,
    `src/assets/fonts/instrument-sans-latin-wght-normal.woff2`, dos archivos de licencia OFL,
    `src/styles/fonts.css`.
  - CA: CA-116. Depende de: T-001 (**ADR 0007 aprobado**).
  - Hecho cuando: los archivos pesan 18.9 KB y 30.1 KB (± 1 KB) y `fonts.css` declara "Besley" con
    peso 700 e "Instrument Sans" con peso 400 a 700, ambas con `font-display: swap`.
- [x] **T-012** · `astro-developer` — Importar `tokens.css` y `fonts.css` desde `global.css`;
  añadir estilos base: anillo de foco, base de `img`, bloqueo de desplazamiento con diálogo abierto.
  Hacer que `src/pages/index.astro` importe `global.css` y declare `lang="es-CO"`.
  - Archivos: `src/styles/global.css`, `src/pages/index.astro`.
  - CA: CA-95, CA-105, CA-107, CA-113, CA-117. Depende de: T-011.
  - Hecho cuando: en `npm run dev` el fondo de la página es `--color-bg`, el texto usa Instrument
    Sans y una clase `bg-blue-500` no produce ningún estilo.
- [x] **T-013** · `astro-developer` [P] — Configurar Vitest y dejar una prueba de humo.
  - Archivos: `vitest.config.ts`, `tests/unit/smoke.test.ts`.
  - Depende de: T-007.
  - Hecho cuando: `npm run test` pasa con una prueba.
- [ ] **T-014** · `qa-engineer` [P] — Configurar Playwright: proyectos de escritorio (1280 px),
  tableta (768 px), móvil (360 px, táctil), sin JavaScript y movimiento reducido; arranque que
  construye cada escenario en serie con `CONTENT_ROOT` y `OUT_DIR` y luego lo sirve; interceptación
  global de `tile.openstreetmap.org` con una tesela local.
  - Archivos: `playwright.config.ts`, `tests/e2e/global-setup.ts`, `tests/e2e/fixtures.ts`,
    `tests/fixtures/tile.png`.
  - CA: CA-79 (política de teselas, ADR 0006). Depende de: T-010.
  - Hecho cuando: `npm run test:e2e` arranca, sirve la página de plantilla y pasa una prueba de humo
    en los cinco proyectos.
- [x] **T-015** · `astro-developer` [P] — Instalar `@lhci/cli` como dependencia de desarrollo.
  - Archivos: `package.json`, `package-lock.json`.
  - Depende de: T-001 (**ADR 0009 aprobado**).
  - Hecho cuando: `npx lhci --version` responde.
- [ ] **T-016** · `qa-engineer` — Configurar Lighthouse CI: modo móvil, tres pasadas, aserciones de
  CA-115 y CA-116, usando el Chromium de Playwright.
  - Archivos: `lighthouserc.json`, `scripts/lhci.mjs`.
  - CA: CA-115, CA-116. Depende de: T-014, T-015.
  - Hecho cuando: `npm run test:lh` se ejecuta contra la página de plantilla y entrega un informe.
- [ ] **T-017** · `astro-developer` — **Cierre de H1.**
  - Depende de: T-008 a T-016.
  - Hecho cuando: `npm run build`, `npm run lint` y `npm run test` están en verde.

---

## H2 — Esquema de contenido y puerta de publicación

Al terminar T-021 y T-023, `content-curator` puede empezar H3.

- [ ] **T-018** · `astro-developer` — Pisos térmicos: `zoneOf`, `zoneRange`, `zoneName`, `ZONES`,
  con pruebas en el umbral exacto.
  - Archivos: `src/lib/altitude/zones.ts`, `tests/unit/zones.test.ts`.
  - CA: CA-29. Depende de: T-017.
  - Hecho cuando: las pruebas pasan, incluida "altitud igual al umbral pertenece al piso superior".
- [ ] **T-019** · `astro-developer` [P] — Detector de valores de relleno.
  - Archivos: `src/lib/content/placeholders.ts`, `tests/unit/placeholders.test.ts`.
  - CA: CA-120. Depende de: T-017.
  - Hecho cuando: las pruebas rechazan "000", "123456", "XXXX", "ejemplo", "pendiente" y
    "NIT 000.000.000-0", y aceptan el WhatsApp y el correo reales.
- [ ] **T-020** · `astro-developer` — Esquemas Zod de las cinco colecciones, con mensajes en español
  que citan el criterio, y tipos inferidos.
  - Archivos: `src/lib/content/schemas.ts`, `tests/unit/schemas.test.ts`.
  - CA: CA-20, CA-24, CA-27, CA-46, CA-47, CA-48, CA-77, CA-78, CA-118, CA-119, CA-122.
  - Depende de: T-018.
  - Hecho cuando: por cada criterio hay una prueba con un dato válido y otra con uno inválido.
- [ ] **T-021** · `astro-developer` — Registrar las colecciones en `content.config.ts`, leyendo la
  raíz de `CONTENT_ROOT`.
  - Archivos: `src/content.config.ts`.
  - CA: CA-99. Depende de: T-020.
  - Hecho cuando: `npx astro sync` termina sin errores con `src/content` vacío y con un escenario de
    prueba.
- [ ] **T-022** · `qa-engineer` [P] — Generar los escenarios `completo`, `minimo` y `sin-fotos`,
  con imágenes sintéticas de las dimensiones necesarias.
  - Archivos: `tests/fixtures/content/{completo,minimo,sin-fotos}/**`, `scripts/make-fixtures.mjs`.
  - Depende de: T-020.
  - Hecho cuando: cada escenario pasa `astro sync` y contiene los casos que lista el plan.
- [ ] **T-023** · `astro-developer` [P] — Guía de contenido para `content-curator`: campos, valores
  permitidos, dónde van las fotos y un ejemplo completo de destino, ruta y texto legal.
  - Archivos: `src/content/README.md`.
  - Depende de: T-020.
  - Hecho cuando: el ejemplo de la guía pasa los esquemas en una prueba unitaria.
- [ ] **T-024** · `astro-developer` — `validateSite()`, primera parte: modelo publicado, pisos
  derivados, orden, destino principal, slugs, títulos y descripciones, rango y umbrales, CA-100.
  - Archivos: `src/lib/content/validate.ts`, `tests/unit/validate-destinos.test.ts`.
  - CA: CA-15, CA-31, CA-33, CA-99, CA-100, CA-104, CA-122. Depende de: T-020, T-018.
  - Hecho cuando: cada regla tiene una prueba y cada problema trae archivo, campo, regla y criterio.
- [ ] **T-025** · `astro-developer` — `validateSite()`, segunda parte: fotos (dimensiones, texto
  alternativo, licencia), rutas (destino, elevación por punto completa o ausente, coordenadas),
  textos legales, identificadores, modos de publicación y vista previa.
  - Archivos: `src/lib/content/validate.ts`, `tests/unit/validate-resto.test.ts`.
  - CA: CA-43, CA-47, CA-48, CA-51, CA-67, CA-77, CA-78, CA-118, CA-119, CA-120.
  - Depende de: T-024, T-019.
  - Hecho cuando: las pruebas cubren cada fila de la tabla de severidades del plan (D1), en los dos
    modos.
- [ ] **T-026** · `astro-developer` — `loadSite()`: lee las colecciones, decide el modo, comprueba
  `SITE_URL` en publicación, memoriza y lanza un único error con todos los problemas.
  - Archivos: `src/lib/content/load.ts`.
  - CA: CA-97, CA-99. Depende de: T-025, T-021, T-022.
  - Hecho cuando: con `completo` y `SITE_URL` definida, `npm run build:release` pasa; sin
    `SITE_URL`, falla con el mensaje "Falta SITE_URL…"; con `minimo`, `npm run build` pasa y
    `build:release` falla nombrando los tres textos y los tres identificadores.
- [ ] **T-027** · `qa-engineer` — Escenarios `invalido-*` y pruebas de build que comprueban código
  de salida y mensaje. **Cierre de H2.**
  - Archivos: `tests/fixtures/content/invalido-*/**`, `tests/build/gates.test.ts`.
  - CA: CA-15, CA-20, CA-24, CA-43, CA-46, CA-47, CA-77, CA-78, CA-99, CA-100, CA-104, CA-118,
    CA-119, CA-120, CA-122.
  - Depende de: T-026.
  - Hecho cuando: `npm run test:build` pasa y `npm run build`, `npm run lint` y `npm run test` están
    en verde.

---

## H3 — Contenido real

Corre en paralelo con H4, H5 y H6: el desarrollo trabaja sobre los escenarios de prueba.

- [ ] **T-028** · `content-curator` — Proponer la lista del primer lanzamiento: de 6 a 8 destinos con
  al menos uno por piso y de 3 a 5 rutas, con la fuente prevista de cada altitud y de cada foto
  (PA-15).
  - Archivos: `specs/001-landing-completa/contenido-propuesto.md`.
  - Depende de: T-021, T-023.
  - Hecho cuando: el documento lista destinos, pisos, rutas y fotos candidatas con su licencia.
- [ ] **T-029** · humano — Aprobar la lista propuesta (PA-15).
  - Depende de: T-028.
  - Hecho cuando: el documento dice "APROBADA (fecha, quién)".
- [ ] **T-030** · `content-curator` — Verificar con fuente citada la altitud mínima y máxima de
  Antioquia y los tres umbrales entre pisos; escribir `territorio.json`.
  - Archivos: `src/content/sitio/territorio.json`.
  - CA: CA-2, CA-29, CA-104, CA-122. Depende de: T-029.
  - Hecho cuando: `verified` es verdadero, `source` cita la fuente y `astro sync` pasa.
- [ ] **T-031** · `content-curator` [P] — Escribir `operador.json` con nombre, WhatsApp, horario y
  correo confirmados, sin identificadores oficiales.
  - Archivos: `src/content/sitio/operador.json`.
  - CA: CA-82, CA-119. Depende de: T-029.
  - Hecho cuando: los datos coinciden con PA-2 de la spec y no hay ningún identificador inventado.
- [ ] **T-032** · `content-curator` — Escribir los destinos del piso cálido y templado: nombre,
  descripción corta y larga, altitud verificada con fuente, ficha y destino principal.
  - Archivos: `src/content/destinos/*.md`.
  - CA: CA-17, CA-20 a CA-28, CA-33, CA-101, CA-102, CA-104. Depende de: T-030.
  - Hecho cuando: cada destino tiene `altitude.verified` verdadero con fuente y `npm run build` no
    da errores ni avisos sobre ellos.
- [ ] **T-033** · `content-curator` [P] — Lo mismo para los destinos del piso frío y del páramo.
  - Archivos: `src/content/destinos/*.md`.
  - CA: los de T-032. Depende de: T-030.
  - Hecho cuando: igual que T-032.
- [ ] **T-034** · `content-curator` — Seleccionar las fotos: comprobar licencia y lugar en la fuente,
  descargar el original o su reducción a 2560 px, y registrar autor, licencia, fuente, modificación,
  proporción, punto de interés y texto alternativo.
  - Archivos: `src/assets/photos/<destino>/*`, frontmatter de `src/content/destinos/*.md`.
  - CA: CA-43, CA-45 a CA-49. Depende de: T-032, T-033.
  - Hecho cuando: `npm run build` no da errores de fotos, ninguna pesa más de 1.5 MB y cada enlace
    de fuente y de licencia abre la página correcta.
- [ ] **T-035** · `content-curator` [P] — Escribir las rutas en GeoJSON: trazado de 400 puntos como
  máximo, elevación mínima y máxima, elevación por punto si existe, ficha y destino.
  - Archivos: `src/content/rutas/*.json`.
  - CA: CA-21, CA-76, CA-77, CA-78. Depende de: T-032, T-033.
  - Hecho cuando: `npm run build` no da errores ni avisos de rutas.
- [ ] **T-036** · `content-curator` [P] — Redactar el borrador de la política de tratamiento de
  datos, incluyendo que el mapa envía la dirección IP del visitante a OpenStreetMap y que el contacto
  lleva a WhatsApp.
  - Archivos: `src/content/legal/politica-de-datos.md`.
  - CA: CA-118. Depende de: T-021.
  - Hecho cuando: el archivo tiene `status: draft` y menciona los dos terceros.
- [ ] **T-037** · `content-curator` [P] — Redactar los borradores de términos y condiciones y de
  política de cancelación.
  - Archivos: `src/content/legal/terminos-y-condiciones.md`,
    `src/content/legal/politica-de-cancelacion.md`.
  - CA: CA-118. Depende de: T-021.
  - Hecho cuando: ambos tienen `status: draft` y `npm run build` muestra la banda de borrador.
- [ ] **T-038** · humano — Confirmar con asesoría legal los identificadores exigidos (PA-8),
  entregar RNT, NIT y razón social, y revisar los tres textos legales. **Bloquea el lanzamiento, no
  el desarrollo.**
  - Archivos: `src/content/sitio/operador.json`, `src/content/legal/*.md` (los carga
    `content-curator` con los datos entregados).
  - CA: CA-118 a CA-121. Depende de: T-031, T-036, T-037.
  - Hecho cuando: los tres textos tienen `status: reviewed` con fecha y `npm run build:release` no
    informa de borradores ni de identificadores ausentes.
- [ ] **T-039** · humano — Decidir dominio y alojamiento; definir `SITE_URL`; configurar el
  alojamiento con `npm run build:release`, comprobando que sirve `404.html` y que no suprime la
  cabecera `Referer`. **Bloquea el lanzamiento, no el desarrollo.**
  - CA: CA-37, CA-74, CA-97. Depende de: —
  - Hecho cuando: `npm run build:release` con `SITE_URL` real pasa.

Cierre de H3 (sin contar T-038 y T-039): `npm run build` en verde con el contenido real y sin
avisos de contenido.

---

## H4 — Base, hero, perfil, láminas y punto de control CA-124

- [ ] **T-040** · `astro-developer` — Formatos de cifras: altitud, rango, clima, duración,
  distancia y desnivel, edad, dificultad, fecha larga.
  - Archivos: `src/lib/format/units.ts`, `tests/unit/units.test.ts`.
  - CA: CA-2, CA-22 a CA-28, CA-103. Depende de: T-027.
  - Hecho cuando: las pruebas cubren los ejemplos literales de la spec ("2500 m", "8,5 km, 400 m de
    subida", "1 hora", "Apta para todas las edades").
- [ ] **T-041** · `astro-developer` [P] — Orden y bloques por piso: `compareByAltitude`,
  `groupByZone`, `resolveFeatured`.
  - Archivos: `src/lib/altitude/sort.ts`, `tests/unit/sort.test.ts`.
  - CA: CA-12 a CA-15. Depende de: T-027.
  - Hecho cuando: las pruebas cubren empate de altitud, piso vacío, piso con un destino y piso sin
    principal marcado.
- [ ] **T-042** · `astro-developer` [P] — Utilidades pequeñas: título de documento, enlaces de
  navegación según secciones publicadas, enlace y mensaje de WhatsApp, formato del número.
  - Archivos: `src/lib/seo/meta.ts`, `src/lib/nav.ts`, `src/lib/contact/whatsapp.ts`, y sus pruebas.
  - CA: CA-33, CA-36, CA-83, CA-93. Depende de: T-027.
  - Hecho cuando: las pruebas pasan; el enlace generado abre `wa.me/573127951683` con el texto
    codificado.
- [ ] **T-043** · `astro-developer` — Geometría del perfil: escala, posiciones, línea de cumbres,
  silueta, estratos, límites, curvas de eco, selección compacta de cinco puntos.
  - Archivos: `src/lib/altitude/profile.ts`, `tests/unit/profile-geometry.test.ts`.
  - CA: CA-4, CA-5, CA-7. Depende de: T-041.
  - Hecho cuando: las pruebas comprueban un punto por destino, que subir una altitud sube solo su
    punto, la selección de S3.8 y los casos límite de S3.7.
- [ ] **T-044** · `astro-developer` — Etiquetas del perfil: lado, partición en dos líneas, búsqueda
  de sitio sin colisiones, línea guía y avisos.
  - Archivos: `src/lib/altitude/profile.ts`, `tests/unit/profile-labels.test.ts`.
  - CA: CA-5, CA-6. Depende de: T-043.
  - Hecho cuando: con el escenario `completo` ninguna etiqueta se solapa con otra ni con un obstáculo
    en las tres variantes, y un caso forzado produce aviso con el nombre del destino.
- [ ] **T-045** · `astro-developer` [P] — Curvas de nivel de las cuatro láminas.
  - Archivos: `src/lib/altitude/contours.ts`, `tests/unit/contours.test.ts`.
  - CA: CA-39. Depende de: T-027.
  - Hecho cuando: dos llamadas dan el mismo resultado, los cuatro pisos dan dibujos distintos y cada
    uno marca sus curvas maestras.
- [ ] **T-046** · `astro-developer` — Controles base: botón principal, secundario y sobre tinta;
  enlace de texto; enlace para saltar.
  - Archivos: `src/components/ui/Button.astro`, `TextLink.astro`, `SkipLink.astro`.
  - CA: CA-94, CA-107, CA-110. Depende de: T-017.
  - Hecho cuando: una página de prueba muestra los cuatro estados de S1 y todos miden 44 px de alto
    o más.
- [ ] **T-047** · `astro-developer` — `BaseLayout`: idioma, título, descripción, datos para redes
  sin imagen, canónica, `noindex` en vista previa, precarga de Besley, clase `js`, regiones.
  - Archivos: `src/layouts/BaseLayout.astro`.
  - CA: CA-33, CA-94, CA-95, CA-96. Depende de: T-042, T-046.
  - Hecho cuando: el HTML generado tiene `lang="es-CO"`, una sola precarga de fuente y, en vista
    previa, la etiqueta `noindex`.
- [ ] **T-048** · `astro-developer` — Cabecera con navegación y menú móvil (`<details>` por debajo de
  768 px, enlaces en línea desde 768 px), más su mejora con JavaScript (Esc y cierre al elegir).
  - Archivos: `src/components/sections/SiteHeader.astro`.
  - CA: CA-81, CA-93, CA-123. Depende de: T-047.
  - Hecho cuando: a 360 px el menú abre y cierra con teclado con JavaScript desactivado, y a 768 px
    los enlaces están en línea.
- [ ] **T-049** · `astro-developer` [P] — Pie de página.
  - Archivos: `src/components/sections/SiteFooter.astro`.
  - CA: CA-50, CA-98, CA-119, CA-121. Depende de: T-047.
  - Hecho cuando: con `completo` aparece el identificador; con `minimo` no hay línea ni hueco.
- [ ] **T-050** · `astro-developer` — Componente del perfil: SVG decorativo, capa HTML con textos y
  lista de enlaces, tres variantes, cubierta animada.
  - Archivos: `src/components/ui/AltitudeProfile.astro`.
  - CA: CA-4, CA-6, CA-8, CA-9. Depende de: T-044, T-012.
  - Hecho cuando: en cada rango de ancho se ve una sola variante, los enlaces miden 44 × 44 px y con
    movimiento reducido el perfil aparece dibujado.
- [ ] **T-051** · `astro-developer` — Sección Hero e inicio mínimo.
  - Archivos: `src/components/sections/Hero.astro`, `src/pages/index.astro`.
  - CA: CA-1, CA-2, CA-3, CA-10, CA-11, CA-102. Depende de: T-050, T-048, T-040.
  - Hecho cuando: el inicio muestra titular, explicación, botón, perfil y nota, en ese orden, sin
    JavaScript.
- [ ] **T-052** · `astro-developer` [P] — Lámina de altitud y símbolos de curvas.
  - Archivos: `src/components/ui/AltitudePlate.astro`, `ContourDefs.astro`.
  - CA: CA-38, CA-39. Depende de: T-045, T-040.
  - Hecho cuando: la cifra cambia de tamaño en 140, 280 y 480 px de ancho de lámina y los trazos
    miden 1 px en todos los tamaños.
- [ ] **T-053** · `astro-developer` [P] — Regla de altitud y etiqueta de piso.
  - Archivos: `src/components/ui/ZoneRail.astro`, `ZoneTag.astro`.
  - CA: CA-16. Depende de: T-018, T-040.
  - Hecho cuando: a 1024 px es una columna con nombre, rango y franja; por debajo, franja de 6 px
    con el nombre encima.
- [ ] **T-054** · `astro-developer` [P] — Ficha: filas en orden fijo para destino y ruta, variante
  completa y resumida; componente con `<dl>` y marcas de dificultad.
  - Archivos: `src/lib/ficha/build.ts`, `tests/unit/ficha.test.ts`, `src/components/ui/Ficha.astro`,
    `DifficultyMarks.astro`.
  - CA: CA-21, CA-22, CA-27, CA-30. Depende de: T-040.
  - Hecho cuando: las pruebas cubren dato ausente y dato parcial de distancia o desnivel, y el
    componente pasa a dos columnas a los 400 px de ancho de panel.
- [ ] **T-055** · `astro-developer` [P] — Política de fotos y componentes de foto y crédito.
  - Archivos: `src/lib/photos/policy.ts`, `tests/unit/photos.test.ts`,
    `src/components/ui/Photo.astro`, `PhotoCredit.astro`.
  - CA: CA-40 a CA-45, CA-48, CA-49, CA-117. Depende de: T-027.
  - Hecho cuando: las pruebas cubren las cuatro filas de S6.4 y "recortada" derivada; la imagen
    nunca se pinta más ancha que su original.
- [ ] **T-056** · `astro-developer` — Listado de destinos: bloques por piso, tarjeta principal y
  menor, con foto o lámina.
  - Archivos: `src/components/sections/Destinos.astro`, `DestinoCard.astro`, `src/pages/index.astro`.
  - CA: CA-12 a CA-19, CA-38, CA-42. Depende de: T-052, T-053, T-054, T-055, T-051.
  - Hecho cuando: con `completo` el principal ocupa más área que los menores y con `sin-fotos` cada
    piso muestra su lámina.
- [ ] **T-057** · `qa-engineer` — Guion de capturas: perfil a 320, 360, 768 y 1280 px (escenario
  `completo`) y las cuatro láminas en sus tamaños de cifra (escenario `sin-fotos`).
  - Archivos: `tests/e2e/capturas.spec.ts`, `specs/001-landing-completa/capturas/*.png`.
  - CA: CA-124. Depende de: T-056.
  - Hecho cuando: el guion deja las capturas en la carpeta, con nombre de variante y ancho.
- [ ] **T-058** · `ui-designer` — Comparar las capturas con S3.3 y con la tabla "Qué debe verse" de
  S6.3; pedir ajustes de parámetros y anotarlos en `design.md`; decidir qué pasa a 320 px (C6).
  - Archivos: `specs/001-landing-completa/design.md`,
    `specs/001-landing-completa/revision-capturas.md`.
  - CA: CA-124, CA-111. Depende de: T-057.
  - Hecho cuando: `revision-capturas.md` dice, por cada captura, si cumple y qué se ajustó.
- [ ] **T-059** · `astro-developer` — Aplicar los ajustes de parámetros pedidos en T-058 y regenerar
  las capturas.
  - Archivos: `src/lib/altitude/profile.ts`, `src/lib/altitude/contours.ts`, capturas.
  - CA: CA-124. Depende de: T-058.
  - Hecho cuando: `ui-designer` da por buenas las capturas nuevas.
- [ ] **T-060** · humano — **Punto de control CA-124 (bloqueante).** Revisar las capturas a 320,
  360, 768 y 1280 px y las cuatro láminas; aprobar por escrito o pedir ajustes; decidir si aplica el
  respaldo de S3.10.
  - Archivos: `specs/001-landing-completa/revision-capturas.md`.
  - CA: CA-124. Depende de: T-059.
  - Hecho cuando: el documento dice "APROBADO (fecha, quién)" o registra la decisión de aplicar el
    respaldo. **H5 no se cierra sin esto.** Si se elige el respaldo, se añade una tarea para
    construir la regla vertical antes de T-077.
- [ ] **T-061** · `astro-developer` — **Cierre de H4.**
  - Depende de: T-040 a T-059.
  - Hecho cuando: `npm run build`, `npm run lint` y `npm run test` están en verde.

---

## H5 — Páginas y secciones estáticas

Puede empezar al terminar T-056, sin esperar a T-060; no se cierra hasta que T-060 esté hecha.

- [ ] **T-062** · `astro-developer` — Sección y llamada de contacto.
  - Archivos: `src/components/sections/Contacto.astro`, `src/pages/index.astro`.
  - CA: CA-36, CA-81, CA-82, CA-83, CA-91. Depende de: T-056.
  - Hecho cuando: el número, el horario y el correo se leen como texto y el enlace funciona sin
    JavaScript.
- [ ] **T-063** · `astro-developer` — Página de detalle, bloques 1 a 6: volver, título, altitud,
  imagen o lámina, ficha, descripción.
  - Archivos: `src/components/sections/DestinoDetalle.astro`, `src/pages/destinos/[slug].astro`.
  - CA: CA-23, CA-31 a CA-34, CA-38, CA-40, CA-42. Depende de: T-056.
  - Hecho cuando: hay una página por destino publicado y la primera altitud del documento dice
    "metros de altitud".
- [ ] **T-064** · `astro-developer` [P] — Agrupación de la galería.
  - Archivos: `src/lib/gallery/group.ts`, `tests/unit/gallery-group.test.ts`.
  - CA: CA-52. Depende de: T-055.
  - Hecho cuando: las pruebas cubren piso sin fotos, piso con una o dos, unión en cadena y último
    piso.
- [ ] **T-065** · `astro-developer` — Cuadrícula de fotos y sección de galería, sin visor.
  - Archivos: `src/components/sections/PhotoGrid.astro`, `Galeria.astro`, `src/pages/index.astro`.
  - CA: CA-41, CA-51, CA-52, CA-53, CA-65. Depende de: T-064.
  - Hecho cuando: con `sin-fotos` no hay sección ni enlace de navegación; con `completo`, cada foto
    lleva etiqueta de piso y crédito.
- [ ] **T-066** · `astro-developer` — Página de detalle, bloques 7 a 9: fotos, rutas y contacto.
  - Archivos: `src/components/sections/DestinoDetalle.astro`.
  - CA: CA-35, CA-36, CA-40, CA-41. Depende de: T-063, T-065, T-062.
  - Hecho cuando: un destino sin rutas no muestra el bloque ni su título, y el mensaje de WhatsApp
    nombra el destino.
- [ ] **T-067** · `astro-developer` [P] — Utilidades de ruta: elevación por punto, distancia
  acumulada, mínimos y máximos; orden de la lista, letra clave, patrón y variante; configuración del
  mapa.
  - Archivos: `src/lib/routes/geo.ts`, `style.ts`, `map-config.ts`, y sus pruebas.
  - CA: CA-68, CA-69, CA-76. Depende de: T-027.
  - Hecho cuando: las pruebas cubren los cuatro patrones, las tres variantes y la ruta sin elevación
    por punto.
- [ ] **T-068** · `astro-developer` — Perfil de elevación: modelo y componente con alternativa en
  texto.
  - Archivos: `src/lib/routes/elevation-profile.ts`, su prueba,
    `src/components/ui/ElevationProfile.astro`.
  - CA: CA-76. Depende de: T-067.
  - Hecho cuando: una ruta sin elevación por punto devuelve `null` y no pinta nada.
- [ ] **T-069** · `astro-developer` — Sección del mapa en su forma estática: lista de rutas con
  letra clave siempre visible, ficha completa y enlace al destino; muestra de trazo y botón ocultos
  hasta que el mapa esté activo; contenido del panel por ruta en `<template>`.
  - Archivos: `src/components/sections/MapaRutas.astro`, `RouteList.astro`,
    `RoutePanelTemplates.astro`, `src/components/ui/RouteStrokeSample.astro`, `src/pages/index.astro`.
  - CA: CA-21, CA-67, CA-68, CA-80. Depende de: T-068, T-054.
  - Hecho cuando: sin JavaScript solo hay título, línea y lista a todo el ancho, con la letra clave
    en cada ruta; con `minimo` la sección y su enlace no existen.
- [ ] **T-070** · `astro-developer` [P] — Trazados para el mapa como archivo estático.
  - Archivos: `src/pages/data/rutas.json.ts`.
  - CA: CA-79. Depende de: T-067.
  - Hecho cuando: `dist/data/rutas.json` existe y pesa menos de 15 KB en gzip con `completo`.
- [ ] **T-071** · `astro-developer` [P] — Páginas legales con banda de borrador y fecha de revisión.
  - Archivos: `src/pages/legal/[slug].astro`, `src/components/ui/DraftBanner.astro`.
  - CA: CA-118, CA-119, CA-121. Depende de: T-049.
  - Hecho cuando: con `minimo` se ve la banda y no hay fecha; con `completo`, la fecha en letras y
    sin banda.
- [ ] **T-072** · `astro-developer` [P] — Página de créditos.
  - Archivos: `src/pages/creditos.astro`.
  - CA: CA-44, CA-45, CA-50. Depende de: T-055, T-049.
  - Hecho cuando: lista tantas fotos como fotos publicadas, y con `sin-fotos` muestra el mensaje de
    S12.
- [ ] **T-073** · `astro-developer` [P] — Página 404.
  - Archivos: `src/pages/404.astro`.
  - CA: CA-37. Depende de: T-049.
  - Hecho cuando: `dist/404.html` existe con los dos enlaces.
- [ ] **T-074** · `astro-developer` [P] — Mapa del sitio y `robots.txt`.
  - Archivos: `src/pages/sitemap.xml.ts`, `src/pages/robots.txt.ts`, `src/lib/seo/meta.ts`, su
    prueba.
  - CA: CA-97. Depende de: T-063.
  - Hecho cuando: en publicación el mapa lista el inicio y todos los detalles y `robots.txt` lo
    referencia; en vista previa `robots.txt` prohíbe el rastreo.
- [ ] **T-075** · `qa-engineer` [P] — Prueba que recorre `src/` y falla ante colores, tamaños de
  letra, duraciones o degradados fuera de los tokens, y ante `--font-display` sin peso 700.
  - Archivos: `tests/unit/style-tokens.test.ts`.
  - CA: CA-105. Depende de: T-056.
  - Hecho cuando: pasa sobre el código actual y falla al añadir un color hexadecimal en un
    componente.
- [ ] **T-076** · `astro-developer` — Repasar el inicio completo a 360, 768 y 1280 px sin
  JavaScript contra S1 a S13 y corregir desajustes de layout.
  - Archivos: los de `src/components/` que haga falta.
  - CA: CA-110, CA-112. Depende de: T-062 a T-074.
  - Hecho cuando: no hay desplazamiento horizontal a 360 px en ninguna página.
- [ ] **T-077** · `astro-developer` — **Cierre de H5.**
  - Depende de: T-060, T-062 a T-076.
  - Hecho cuando: `npm run build`, `npm run lint` y `npm run test` están en verde y CA-124 está
    aprobado.

---

## H6 — Islas: visor y mapa

El bloque del visor (T-079 a T-083) y el del mapa (T-084 a T-090) no comparten archivos y pueden
ir en paralelo.

- [ ] **T-078** · `astro-developer` — Cargador de islas: `IntersectionObserver` con 300 px de margen
  e `import()` dinámico.
  - Archivos: `src/components/islands/runtime/when-visible.ts`.
  - CA: CA-66, CA-79. Depende de: T-001 (**ADR 0004 aprobado**), T-077.
  - Hecho cuando: un módulo de prueba se descarga solo al acercar su contenedor a la ventana.
- [ ] **T-079** · `astro-developer` [P] — Estado del visor como funciones puras.
  - Archivos: `src/lib/gallery/viewer-state.ts`, `tests/unit/viewer-state.test.ts`.
  - CA: CA-57, CA-60, CA-64. Depende de: T-077.
  - Hecho cuando: las pruebas cubren extremos, una sola foto y el umbral de 48 px.
- [ ] **T-080** · `astro-developer` — Componente del visor: envoltorio, plantilla del diálogo,
  estilos, desvanecido y bloqueo del desplazamiento; `srcset` de la imagen ampliada en el build.
  - Archivos: `src/components/islands/GalleryLightbox.astro`,
    `src/components/sections/PhotoGrid.astro`.
  - CA: CA-55, CA-59, CA-61, CA-62, CA-65. Depende de: T-078, T-001 (**ADR 0005 aprobado**).
  - Hecho cuando: sin JavaScript no hay diálogo ni botones en el documento.
- [ ] **T-081** · `astro-developer` — Visor: miniaturas como botones, abrir, cerrar, foco de vuelta.
  - Archivos: `src/components/islands/gallery-lightbox.client.ts`.
  - CA: CA-54, CA-55, CA-56, CA-61. Depende de: T-080, T-079.
  - Hecho cuando: Enter y Espacio abren, Esc cierra y el foco vuelve a la miniatura.
- [ ] **T-082** · `astro-developer` — Visor: anterior y siguiente, flechas, extremos desactivados,
  contador, anuncios, deslizamiento.
  - Archivos: `src/components/islands/gallery-lightbox.client.ts`.
  - CA: CA-57, CA-58, CA-60, CA-64. Depende de: T-081.
  - Hecho cuando: en la primera foto "Anterior" es enfocable y se anuncia desactivado; con una foto
    no hay contador ni botones de cambio.
- [ ] **T-083** · `astro-developer` — Visor: carga diferida de la imagen ampliada, "Cargando la
  foto…" y "No pudimos cargar esta foto"; conectar el visor en el inicio y en el detalle con tres o
  más fotos.
  - Archivos: `gallery-lightbox.client.ts`, `src/components/sections/Galeria.astro`,
    `DestinoDetalle.astro`.
  - CA: CA-41, CA-63, CA-66. Depende de: T-082.
  - Hecho cuando: en la carga inicial no se pide el módulo del visor ni ninguna imagen ampliada, y el
    módulo pesa 4 KB gzip o menos.
- [ ] **T-084** · `astro-developer` [P] — Instalar `leaflet` y `@types/leaflet`.
  - Archivos: `package.json`, `package-lock.json`.
  - Depende de: T-001 (**ADR 0006 aprobado**), T-077.
  - Hecho cuando: `npm ls leaflet` muestra 1.9.4.
- [ ] **T-085** · `astro-developer` — Componente del mapa: caja reservada bajo `.js`, estados
  "Cargando el mapa…" y de fallo, controles propios, panel, región de anuncios, guion cargador.
  - Archivos: `src/components/islands/RouteMap.astro`,
    `src/components/sections/MapaRutas.astro`, `src/styles/global.css`.
  - CA: CA-75, CA-79, CA-80. Depende de: T-078, T-069.
  - Hecho cuando: sin JavaScript no hay caja; con JavaScript la caja ocupa su sitio desde el primer
    pintado.
- [ ] **T-086** · `astro-developer` — Mapa: creación, teselas con filtro y opacidad por tokens,
  atribución propia, vista inicial, límites y zoom.
  - Archivos: `src/components/islands/route-map.client.ts`, `src/styles/global.css`.
  - CA: CA-73, CA-74, CA-79. Depende de: T-084, T-085, T-070.
  - Hecho cuando: el mapa carga al acercarse la sección y la atribución es visible.
- [ ] **T-087** · `astro-developer` — Mapa: rutas con halo, patrón y variante por CSS; zona activa
  de 24 px; marcadores con letra clave, rótulo y nombre accesible.
  - Archivos: `route-map.client.ts`, `src/styles/global.css`.
  - CA: CA-69, CA-72. Depende de: T-086.
  - Hecho cuando: cada ruta se distingue por patrón y los marcadores miden 44 × 44 px.
- [ ] **T-088** · `astro-developer` — Mapa: selección desde línea, marcador y lista; encuadre;
  panel clonado de su plantilla; estado en la lista; "Ver todas las rutas".
  - Archivos: `route-map.client.ts`.
  - CA: CA-70, CA-76. Depende de: T-087.
  - Hecho cuando: elegir una ruta la resalta, encuadra y llena el panel, y se anuncia "Ruta
    seleccionada: {nombre}".
- [ ] **T-089** · `astro-developer` — Mapa: teclado, orden de tabulación, rueda tras clic, gesto de
  dos dedos con su aviso, movimiento reducido.
  - Archivos: `route-map.client.ts`.
  - CA: CA-71, CA-72, CA-113. Depende de: T-088.
  - Hecho cuando: el orden de tabulación es el de S9.5 y, con puntero táctil, un dedo desplaza la
    página.
- [ ] **T-090** · `astro-developer` — Mapa: estado de fallo por las tres causas y "Volver a cargar
  el mapa".
  - Archivos: `route-map.client.ts`, `RouteMap.astro`.
  - CA: CA-75. Depende de: T-089.
  - Hecho cuando: con las teselas bloqueadas aparece el mensaje, desaparecen panel, muestras y
    botones, y la lista conserva letras, fichas y enlaces.
- [ ] **T-091** · `astro-developer` — **Cierre de H6.**
  - Depende de: T-078 a T-090.
  - Hecho cuando: `npm run build`, `npm run lint` y `npm run test` están en verde y el JavaScript de
    la carga inicial pesa 1.5 KB gzip o menos.

---

## H7 — Pruebas (fase 7)

Todas las suites son de `qa-engineer` y pueden escribirse en paralelo. Cada una cubre los criterios
indicados según la matriz de trazabilidad del plan. Las de H4 y H5 pueden empezar cuando su hito
esté cerrado, sin esperar a H6.

- [ ] **T-092** · `qa-engineer` [P] — e2e del hero y del perfil.
  - Archivos: `tests/e2e/hero.spec.ts`. CA: CA-1, CA-3, CA-4, CA-6, CA-7, CA-9, CA-10, CA-11.
  - Depende de: T-061. Hecho cuando: una prueba por criterio pasa.
- [ ] **T-093** · `qa-engineer` [P] — e2e del listado y de la ficha.
  - Archivos: `tests/e2e/destinos.spec.ts`, `ficha.spec.ts`.
  - CA: CA-12, CA-14 a CA-19, CA-21, CA-22, CA-23, CA-103. Depende de: T-077.
  - Hecho cuando: una prueba por criterio pasa.
- [ ] **T-094** · `qa-engineer` [P] — e2e del detalle y de la página 404.
  - Archivos: `tests/e2e/detalle.spec.ts`. CA: CA-31 a CA-37. Depende de: T-077.
  - Hecho cuando: una prueba por criterio pasa.
- [ ] **T-095** · `qa-engineer` [P] — e2e de fotos, láminas y créditos.
  - Archivos: `tests/e2e/fotos.spec.ts`. CA: CA-38 a CA-45, CA-49, CA-50, CA-117.
  - Depende de: T-077. Hecho cuando: una prueba por criterio pasa.
- [ ] **T-096** · `qa-engineer` [P] — e2e de la galería y del visor.
  - Archivos: `tests/e2e/galeria.spec.ts`, `visor.spec.ts`. CA: CA-51 a CA-65.
  - Depende de: T-091. Hecho cuando: una prueba por criterio pasa.
- [ ] **T-097** · `qa-engineer` [P] — e2e del mapa, con teselas interceptadas.
  - Archivos: `tests/e2e/mapa.spec.ts`. CA: CA-67 a CA-72, CA-74, CA-75, CA-76.
  - Depende de: T-091. Hecho cuando: una prueba por criterio pasa y ninguna pide teselas reales.
- [ ] **T-098** · `qa-engineer` [P] — e2e de contacto, navegación, SEO y legales.
  - Archivos: `tests/e2e/contacto.spec.ts`, `navegacion.spec.ts`, `seo.spec.ts`, `legales.spec.ts`.
  - CA: CA-81, CA-82, CA-83, CA-91, CA-93 a CA-96, CA-98, CA-118, CA-119, CA-121, CA-123.
  - Depende de: T-077. Hecho cuando: una prueba por criterio pasa.
- [ ] **T-099** · `qa-engineer` [P] — Accesibilidad con axe: inicio, detalle con fotos, detalle sin
  fotos, 404, visor abierto, menú abierto, mapa cargado, mapa fallido.
  - Archivos: `tests/e2e/a11y.spec.ts`.
  - CA: CA-8, CA-18, CA-27, CA-30, CA-48, CA-54, CA-55, CA-71, CA-95, CA-108, CA-114, CA-123.
  - Depende de: T-091. Hecho cuando: no hay violaciones serious ni critical.
- [ ] **T-100** · `qa-engineer` [P] — Sin JavaScript.
  - Archivos: `tests/e2e/sin-js.spec.ts`. CA: CA-65, CA-68, CA-80, CA-83, CA-112, CA-123.
  - Depende de: T-091. Hecho cuando: las seis tareas de CA-112 pasan con JavaScript desactivado.
- [ ] **T-101** · `qa-engineer` [P] — 360 px: desplazamiento horizontal y tamaño de objetivos en
  todas las páginas, con la excepción de los enlaces del crédito.
  - Archivos: `tests/e2e/responsive-360.spec.ts`. CA: CA-7, CA-16, CA-60, CA-72, CA-91, CA-110.
  - Depende de: T-091. Hecho cuando: ningún control mide menos de 44 × 44 px salvo la excepción.
- [ ] **T-102** · `qa-engineer` [P] — Teclado y foco.
  - Archivos: `tests/e2e/teclado.spec.ts`. CA: CA-3, CA-19, CA-94, CA-106, CA-107.
  - Depende de: T-091. Hecho cuando: cada página se recorre completa con Tab sin trampas.
- [ ] **T-103** · `qa-engineer` [P] — Movimiento reducido.
  - Archivos: `tests/e2e/movimiento.spec.ts`. CA: CA-9, CA-62, CA-113.
  - Depende de: T-091. Hecho cuando: todas las duraciones calculadas valen cero.
- [ ] **T-104** · `qa-engineer` [P] — Red: descargas diferidas y pesos de los módulos.
  - Archivos: `tests/e2e/red.spec.ts`, `tests/build/budget.test.ts`.
  - CA: CA-66, CA-79. Depende de: T-091.
  - Hecho cuando: la carga inicial no pide visor, Leaflet, trazados, teselas ni imágenes fuera de
    pantalla, y los pesos cumplen el presupuesto del plan.
- [ ] **T-105** · `qa-engineer` [P] — Lenguaje: ausencia de "usted", "vos", "m s. n. m.", separador
  de miles y cifras sin unidad en todas las páginas.
  - Archivos: `tests/e2e/lenguaje.spec.ts`. CA: CA-23, CA-101, CA-103.
  - Depende de: T-077. Hecho cuando: pasa sobre `completo` y sobre el contenido real.
- [ ] **T-106** · `qa-engineer` [P] — Build de publicación: recuento de páginas, mapa del sitio y
  `robots.txt`.
  - Archivos: `tests/build/release.test.ts`. CA: CA-31, CA-97. Depende de: T-077.
  - Hecho cuando: `npm run test:build` pasa.
- [ ] **T-107** · `qa-engineer` — Lighthouse CI sobre el inicio, un detalle con fotos y uno sin
  fotos.
  - CA: CA-115, CA-116. Depende de: T-091, T-016.
  - Hecho cuando: `npm run test:lh` cumple las cuatro categorías ≥ 90, LCP ≤ 2.5 s, CLS ≤ 0.1 y
    TBT ≤ 200 ms.
- [ ] **T-108** · `qa-engineer` — Listas de comprobación manuales, con pasos y resultado: lector de
  pantalla (NVDA y TalkBack), reflujo a 320 px y 200 %, gestos del mapa en un celular, lenguaje y
  términos locales, contraste del anillo de foco y pares de la sección 4.3.
  - Archivos: `specs/001-landing-completa/pruebas-manuales.md`.
  - CA: CA-8, CA-30, CA-49, CA-58, CA-69, CA-72, CA-91, CA-101, CA-102, CA-105, CA-107, CA-109,
    CA-111, CA-114. Depende de: T-091.
  - Hecho cuando: cada criterio manual tiene pasos, resultado y fecha.
- [ ] **T-109** · `ui-designer` — Medir el contraste de las rutas sobre las teselas en el mapa
  construido y la legibilidad de las etiquetas; ajustar los dos tokens de teselas y la dirección
  visual en el mismo commit si hace falta.
  - Archivos: `src/styles/tokens.css`, `docs/design/direccion-visual.md`,
    `specs/001-landing-completa/pruebas-manuales.md`.
  - CA: CA-73. Depende de: T-091, T-035.
  - Hecho cuando: la medición registrada da 3:1 o más en cada ruta.
- [ ] **T-110** · `qa-engineer` — **Cierre de H7:** comprobar que cada uno de los 116 criterios
  activos tiene al menos una prueba o una entrada manual.
  - Archivos: `specs/001-landing-completa/cobertura.md`.
  - Depende de: T-092 a T-109.
  - Hecho cuando: la tabla de cobertura no tiene huecos y `npm run build`, `npm run lint`,
    `npm run test`, `npm run test:build` y `npm run test:e2e` están en verde.

---

## H8 — Revisión (fase 8) y cierre

- [ ] **T-111** · `quality-reviewer` — Revisar el sitio construido con el contenido real contra la
  dirección visual, `design.md`, las reglas de `CLAUDE.md` y la Definition of Done; segunda medición
  de CA-73.
  - Archivos: `specs/001-landing-completa/revision.md`.
  - CA: todos; en particular CA-73, CA-105. Depende de: T-110, cierre de H3.
  - Hecho cuando: el informe clasifica cada hallazgo como bloqueante o no.
- [ ] **T-112** · `astro-developer` — Corregir los hallazgos bloqueantes de código.
  - Depende de: T-111.
  - Hecho cuando: `quality-reviewer` retira cada hallazgo y todas las suites siguen en verde.
- [ ] **T-113** · `content-curator` [P] — Corregir los hallazgos bloqueantes de contenido.
  - Depende de: T-111.
  - Hecho cuando: `quality-reviewer` retira cada hallazgo y `npm run build` no da avisos.
- [ ] **T-114** · `qa-engineer` — Repetir todas las suites y Lighthouse tras las correcciones.
  - Depende de: T-112, T-113.
  - Hecho cuando: todo está en verde y la cobertura sigue completa.
- [ ] **T-115** · humano — Aprobar la revisión de la fase 8.
  - Depende de: T-114.
  - Hecho cuando: `revision.md` dice "APROBADA (fecha, quién)" y todas las tareas de este documento
    están marcadas, salvo T-038 y T-039 si el lanzamiento aún no está listo.
- [ ] **T-116** · humano — **Lanzamiento.** Con T-038 y T-039 hechas, construir con
  `npm run build:release` y publicar.
  - CA: CA-97, CA-118 a CA-121. Depende de: T-115, T-038, T-039.
  - Hecho cuando: `npm run build:release` pasa con `SITE_URL` real, sin borradores, sin
    identificadores ausentes y sin altitudes por verificar.

---

## Qué puede ir en paralelo

| Bloque | Tareas | Condición |
|---|---|---|
| Correcciones de documentos | T-002 a T-006 | Tras T-001; no bloquean el código |
| Puesta a punto | T-009, T-010, T-011, T-013, T-014, T-015 | Tras T-007 o T-001 |
| Esquema | T-019 con T-018; T-022 y T-023 tras T-020 | — |
| **Contenido frente a desarrollo** | H3 completo frente a H4, H5 y H6 | Tras T-021 y T-023 |
| Contenido | T-032 con T-033; T-031, T-035, T-036 y T-037 | — |
| Lógica de H4 | T-041, T-042, T-045 | Tras T-027 |
| Componentes de H4 | T-049, T-052, T-053, T-054, T-055 | — |
| Páginas de H5 | T-064, T-067, T-070 a T-075 | — |
| **Visor frente a mapa** | T-079 a T-083 frente a T-084 a T-090 | Tras T-078 |
| Suites de H7 | T-092 a T-106 | Cada una tras el hito que prueba |

## Tareas bloqueantes

| Tarea | Bloquea |
|---|---|
| T-001, aprobación del plan y los ADR (hecha) | — |
| T-021 y T-023, esquema y guía | El contenido (H3) |
| T-029, aprobación de la lista (PA-15) | El contenido real |
| T-060, punto de control CA-124 | El cierre de H5 y lo que sigue |
| T-038 y T-039, legales, identificadores y dominio | Solo el lanzamiento (T-116) |

---
Estado: LISTO PARA EJECUTAR (2026-10-10; plan y ADR 0003 a 0010 aprobados por el humano)
