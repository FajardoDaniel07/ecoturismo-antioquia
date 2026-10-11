# Ecoturismo Antioquia — Landing page

Landing page de un servicio de ecoturismo regional en Antioquia (Colombia).
Secciones principales: destinos turísticos, galería interactiva y mapa de rutas.
Idioma del contenido: español (es-CO).

## Stack

- **Astro** (salida estática, `output: 'static'`) + **TypeScript** en modo `strict`.
- **Content Collections** con esquemas Zod (fuente única de datos): `destinos`, `rutas`, `legal`,
  `operador` y `territorio`. Todo el contenido pasa por una sola puerta, `loadSite()`, que valida
  y decide qué se publica (ADR 0003).
- **Estilos**: Tailwind CSS + design tokens en `src/styles/tokens.css` (colores, tipografía, espaciado).
- **Islas interactivas** en TypeScript sin framework UI: un componente `.astro` con un guion
  cargador que importa el módulo real (`*.client.ts`) cuando la sección se acerca a la ventana
  (ADR 0004):
  - Galería: visor propio sobre `<dialog>`, sin dependencia (ADR 0005).
  - Mapa: Leaflet 1.9 + teselas de OpenStreetMap, rutas en GeoJSON (ADR 0006).
- **Imágenes**: `astro:assets` (`<Picture>`, AVIF/WebP, tamaños responsivos). Las fotos son
  archivos locales en `src/assets/photos/`; su atribución vive en el frontmatter del destino
  (ADR 0008).
- **Fuentes**: Besley (estática, peso 700) e Instrument Sans (variable), autoalojadas en
  `src/assets/fonts/` con `@font-face` en `src/styles/fonts.css`, sin dependencia (ADR 0007).
- **Pruebas**: Vitest (unitarias), Playwright (e2e) + `@axe-core/playwright` (accesibilidad).
- **Calidad**: `astro check`, ESLint, Prettier, Lighthouse CI.

## Skills del proyecto

Las skills viven en `.claude/skills/` (alcance de proyecto, versionadas en Git) y se precargan en los
subagentes con el campo `skills:` de su frontmatter.

| Skill | Origen | Para qué | Agentes que la precargan |
|---|---|---|---|
| `frontend-design` | `anthropics/skills` | Dirección visual con identidad propia: tipografía, color, composición, movimiento; evitar la estética genérica "hecha por IA" | `ui-designer`, `astro-developer`, `quality-reviewer` |
| `find-skills` | `vercel-labs/skills` | Buscar en el ecosistema skills.sh skills que resuelvan una necesidad concreta | `software-architect` |

Instalación (una vez, en la raíz del proyecto):

```bash
npx skills add https://github.com/anthropics/skills --skill frontend-design
npx skills add https://github.com/vercel-labs/skills --skill find-skills
```

Verifica que ambas queden en `.claude/skills/<nombre>/SKILL.md` y haz commit de esa carpeta.

**Política de skills nuevas** (ver `docs/adr/0002-politica-de-skills.md`): `find-skills` solo
*busca y propone*. Instalar una skill es una dependencia más: requiere ADR, revisión humana del
`SKILL.md` antes de instalar y aprobación explícita (`npx skills add` pide confirmación por
`.claude/settings.json`).

## Comandos

```bash
npm run dev            # servidor local (vista previa)
npm run build          # compilación de vista previa: permisiva, noindex, borradores marcados (incluye astro check)
npm run build:release  # compilación de publicación: estricta; la única que se despliega
npm run preview        # previsualizar el build
npm run test           # Vitest (unitarias)
npm run test:build     # criterios [build]: construye escenarios y comprueba que el build falla cuando debe
npm run test:e2e       # Playwright + axe
npm run test:lh        # Lighthouse CI en modo móvil
npm run lint           # ESLint + Prettier --check
```

`npm run build` no es desplegable. El alojamiento se configura con `npm run build:release`, que
exige `SITE_URL`, textos legales revisados, identificadores oficiales entregados y altitudes
verificadas (ADR 0003).

## Estructura

```
src/
  content/
    destinos/        # un .md por destino (frontmatter validado por Zod; incluye sus fotos y créditos)
    rutas/           # un .json por ruta (GeoJSON LineString + metadatos)
    legal/           # tres .md: política de datos, términos, cancelación (borrador o revisado)
    sitio/           # operador.json (contacto, identificadores) y territorio.json (altitudes, umbrales)
  content.config.ts  # registra las colecciones; los esquemas viven en src/lib/content/schemas.ts
  assets/
    fonts/           # dos WOFF2 y sus licencias OFL
    photos/          # una carpeta por destino; fotos de terceros con licencia libre
  components/
    ui/              # componentes presentacionales sin estado (Button, Ficha, Photo, AltitudePlate…)
    sections/        # secciones y bloques de página (Hero, Destinos, Galeria, MapaRutas, Contacto…)
    islands/         # GalleryLightbox y RouteMap: .astro + módulo *.client.ts + runtime/when-visible.ts
  layouts/           # BaseLayout (SEO, meta, fuentes)
  lib/               # lógica pura y tipada — testeable. Única excepción: lib/content/load.ts,
                     # el único módulo que importa astro:content
  pages/
    index.astro
    destinos/[slug].astro
    legal/[slug].astro
    creditos.astro
    404.astro
    sitemap.xml.ts, robots.txt.ts, data/rutas.json.ts
  styles/
    global.css       # importa Tailwind, tokens.css y fonts.css
    tokens.css       # generado a partir de la dirección visual (ui-designer)
    fonts.css        # @font-face de las dos fuentes
specs/               # artefactos SDD por feature: spec.md, design.md, plan.md, tasks.md
docs/
  adr/               # Architecture Decision Records
  design/
    direccion-visual.md   # identidad visual del sitio (fuente de verdad del diseño)
.claude/
  agents/            # subagentes del flujo SDD
  skills/            # skills instaladas (frontend-design, find-skills, …)
  settings.json      # permisos (p. ej. confirmar antes de instalar skills)
tests/
  unit/              # Vitest: una suite por módulo de src/lib/
  build/             # Vitest: construye escenarios y comprueba el resultado del build
  e2e/               # Playwright + axe
  fixtures/          # contenido de prueba (escenarios válidos e inválidos); se usa con CONTENT_ROOT
```

## Reglas de arquitectura (obligatorias)

1. **HTML primero, JS solo donde aporta.** Todo es estático salvo galería y mapa. El código de una
   isla no se descarga hasta que su sección se acerca a la ventana: un guion cargador con
   `IntersectionObserver` hace `import()` dinámico del módulo. Es el equivalente de `client:visible`
   para islas sin framework (ADR 0004). Cargar una isla al abrir la página requiere un ADR.
   Fuera de las islas solo se admiten tres ayudas mínimas (1.5 KB gzip en total): la clase `js` en
   `<html>`, el cierre del menú móvil con Esc o al elegir enlace, y el propio cargador.
2. **Una sola fuente de verdad para el contenido.** Ningún componente tiene datos de destinos
   "quemados"; todo sale de `getCollection()`.
3. **Lógica fuera de los componentes.** Filtros, cálculos de distancia, ordenamiento, etc. van en
   `src/lib/` como funciones puras con pruebas unitarias.
4. **Mejora progresiva.** Sin JS, la galería muestra las imágenes en una cuadrícula y el mapa muestra
   una lista de rutas con enlaces. El sitio debe ser usable sin JavaScript.
5. **Tipos estrictos.** Sin `any`. Los tipos de dominio se derivan de los esquemas Zod
   (`CollectionEntry<'destinos'>`), no se duplican a mano.
6. **Dependencias mínimas.** Cada dependencia nueva requiere un ADR corto en `docs/adr/`.

## Flujo SDD (Spec-Driven Development)

**Fase 0 (una sola vez, antes de la primera feature):** `ui-designer` crea
`docs/design/direccion-visual.md` y `src/styles/tokens.css` usando `frontend-design`. El humano la
aprueba. Todas las features posteriores heredan esa identidad.

Cada feature pasa por estas fases, en orden, dentro de `specs/NNN-nombre-feature/`:

| Fase | Agente | Skill precargada | Artefacto | Puerta de salida |
|---|---|---|---|---|
| 1. Especificar | `spec-writer` | — | `spec.md` | Criterios de aceptación verificables, sin decisiones técnicas |
| 2. Diseñar UI | `ui-designer` | `frontend-design` | `design.md` | Layout, estados e interacciones de cada sección, coherentes con la dirección visual |
| 3. Planear | `software-architect` | `find-skills` | `plan.md` (+ ADRs) | Cada criterio de aceptación tiene un componente/archivo responsable |
| 4. Desglosar | `software-architect` | `find-skills` | `tasks.md` | Tareas atómicas, ordenadas, con verificación |
| 5. Contenido | `content-curator` | — | `src/content/**` | Pasa validación Zod, alt text en todas las imágenes |
| 6. Implementar | `astro-developer` | `frontend-design` | código | `npm run build` y `npm run lint` en verde |
| 7. Probar | `qa-engineer` | — | `tests/**` | Cada criterio de aceptación tiene al menos una prueba |
| 8. Revisar | `quality-reviewer` | `frontend-design` | informe | Sin hallazgos bloqueantes |

**El humano aprueba al final de las fases 0, 1, 2, 3 y 8.** No se escribe código antes de que `plan.md`
esté aprobado. Si durante la implementación se descubre que la spec está mal, se actualiza la spec
primero y luego el código (la spec nunca queda desactualizada).

## Definition of Done

- [ ] Criterios de aceptación de `spec.md` cubiertos por pruebas que pasan.
- [ ] `npm run build`, `npm run lint`, `npm run test` y `npm run test:e2e` en verde.
- [ ] Lighthouse móvil ≥ 90 en Performance, Accessibility, Best Practices y SEO.
- [ ] Sin violaciones axe de nivel serious/critical (WCAG 2.2 AA).
- [ ] Funciona sin JavaScript (mejora progresiva) y a 360 px de ancho.
- [ ] La UI respeta `docs/design/direccion-visual.md` y `design.md` (sin estilos fuera de los tokens).
- [ ] `tasks.md` con todas las tareas marcadas.

## Convenciones

- Commits: Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`).
- Ramas: `feat/NNN-nombre-feature`.
- Componentes en PascalCase; funciones de `lib/` en camelCase; slugs en kebab-case.
- Textos de interfaz en español; identificadores de código en inglés, salvo los nombres de dominio
  ya acordados (`destinos`, `rutas`).

@AGENTS.md
