# ADR 0009 — Herramientas de calidad: dependencias de desarrollo

Estado: Aceptado (2026-10-10, aprobado por el humano) · Fecha: 2026-10-10 · Feature: 001-landing-completa

## Contexto
`CLAUDE.md` nombra como parte del stack Vitest, Playwright, axe, ESLint, Prettier y Lighthouse CI.
Comprobado el 2026-10-10: Vitest 5.0.3, Playwright 1.64.0, `@axe-core/playwright` 4.13.0, ESLint
10.12.0, `eslint-plugin-astro` 3.2.1 y Prettier 3.9.10 están instalados, pero ninguno tiene
configuración, y faltan piezas para que `npm run lint` y la medición de CA-115 y CA-116 funcionen:

- ESLint no tiene `eslint.config.js` ni analizador de TypeScript: `npm run lint` falla hoy.
- Prettier no entiende archivos `.astro` sin su complemento.
- Lighthouse CI no está instalado.

## Decisión
**Dependencias de desarrollo nuevas.** Ninguna llega al navegador.

| Paquete | Versión | Licencia | Para qué |
|---|---|---|---|
| `typescript-eslint` | 8.71.x | MIT | Analizar TypeScript en ESLint, también en el frontmatter de `.astro`; regla `no-explicit-any`. Compatible con ESLint 10 y TypeScript 6.0 |
| `prettier-plugin-astro` | 1.1.x | MIT | Formatear `.astro` |
| `@lhci/cli` | 0.15.x | Apache-2.0 | Lighthouse en modo móvil con aserciones: cuatro categorías ≥ 90, LCP ≤ 2.5 s, CLS ≤ 0.1, TBT ≤ 200 ms |

**Configuración que acompaña** (archivos nuevos, sin dependencia): `eslint.config.js`, `.prettierrc`,
`.prettierignore`, `vitest.config.ts`, `playwright.config.ts`, `lighthouserc.json`.

- ESLint vigila las capas con `no-restricted-imports`: `ui/` y `lib/` no importan `astro:content`
  (salvo `lib/content/load.ts`); `lib/` no importa de `components/`.
- `.prettierignore` excluye `dist/`, `.astro/`, `.claude/`, `.agents/`, `package-lock.json`,
  `skills-lock.json` y los documentos de `specs/` y `docs/`, que no se reformatean.
- Lighthouse CI usa el Chromium que ya instaló Playwright; no descarga otro navegador.
- Guiones nuevos de `package.json`: `build:release`, `test:build` y `test:lh`. `test:e2e` no cambia.

**Dependencias que se descartan**

| Paquete | Por qué no |
|---|---|
| `@astrojs/sitemap` | El mapa del sitio y `robots.txt` son dos endpoints de unas veinte líneas |
| `jsdom` o `happy-dom` | La lógica con estado de las islas es pura y se prueba sin DOM; el DOM se prueba con Playwright |
| `stylelint` | CA-105 se comprueba con una prueba de Vitest que recorre `src/` |
| `cross-env` | El modo se pasa con `--mode`; las variables de las pruebas las fija Playwright |
| `leaflet-gesture-handling`, `photoswipe` | ADR 0006 y ADR 0005 |

## Alternativas consideradas
- **`lighthouse` directo, con un guion propio.** Evita `@lhci/cli`, pero hay que escribir las
  aserciones, la mediana de varias pasadas y el informe. `CLAUDE.md` nombra Lighthouse CI.
- **Biome en lugar de ESLint y Prettier.** Más rápido, pero su soporte de `.astro` es parcial y el
  proyecto ya tiene ESLint y Prettier instalados.
- **No formatear `.astro`.** Deja sin comprobar la mayor parte del código del sitio.

## Consecuencias
- (+) `npm run lint` pasa a ser una puerta real, y las reglas de capas de `CLAUDE.md` se comprueban
  solas.
- (+) CA-115 y CA-116 tienen una medición repetible.
- (−) `@lhci/cli` trae un árbol de dependencias grande y su última versión es de junio de 2025.
  Si deja de mantenerse, se sustituye por `lighthouse` directo.
- (−) La puntuación de Lighthouse varía entre ejecuciones; se usan tres pasadas y la mediana.
- (−) Tres guiones nuevos que conviene añadir a la sección "Comandos" de `CLAUDE.md`.
