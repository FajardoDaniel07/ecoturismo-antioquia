# Ecoturismo Antioquia — Landing page

Landing page de un servicio de ecoturismo regional en Antioquia (Colombia).
Secciones principales: destinos turísticos, galería interactiva y mapa de rutas.
Idioma del contenido: español (es-CO).

## Stack

- **Astro** (salida estática, `output: 'static'`) + **TypeScript** en modo `strict`.
- **Content Collections** con esquemas Zod para destinos y rutas (fuente única de datos).
- **Estilos**: Tailwind CSS + design tokens en `src/styles/tokens.css` (colores, tipografía, espaciado).
- **Islas interactivas** en TypeScript sin framework UI (web components / `<script>` de Astro):
  - Galería: lightbox accesible (PhotoSwipe o implementación propia).
  - Mapa: Leaflet + teselas de OpenStreetMap, rutas en GeoJSON.
- **Imágenes**: `astro:assets` (`<Image>` / `<Picture>`, AVIF/WebP, tamaños responsivos).
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
npm run dev        # servidor local
npm run build      # build de producción (incluye astro check)
npm run preview    # previsualizar el build
npm run test       # Vitest
npm run test:e2e   # Playwright + axe
npm run lint       # ESLint + Prettier --check
```

## Estructura

```
src/
  content/
    destinos/        # un .md por destino (frontmatter validado por Zod)
    rutas/           # un .json por ruta (GeoJSON LineString + metadatos)
  content.config.ts  # esquemas Zod de las colecciones
  components/
    ui/              # componentes presentacionales sin estado (Button, Card, Badge…)
    sections/        # secciones de la landing (Hero, Destinos, Galeria, MapaRutas, Contacto)
    islands/         # componentes con JS en el cliente (GalleryLightbox, RouteMap)
  layouts/           # BaseLayout (SEO, meta, fuentes)
  lib/               # lógica pura y tipada (filtros, formateo, utilidades geo) — testeable
  pages/
    index.astro
    destinos/[slug].astro
  styles/
    tokens.css       # generado a partir de la dirección visual (ui-designer)
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
  unit/
  e2e/
```

## Reglas de arquitectura (obligatorias)

1. **HTML primero, JS solo donde aporta.** Todo es estático salvo galería y mapa.
   Las islas se hidratan con `client:visible` (nunca `client:load` sin justificar en un ADR).
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
