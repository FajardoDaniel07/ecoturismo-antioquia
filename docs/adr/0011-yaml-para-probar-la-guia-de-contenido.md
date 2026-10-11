# ADR 0011 — `yaml` como dependencia de desarrollo

Estado: Aceptado (2026-10-10, aprobado por el humano) · Fecha: 2026-10-11 · Feature: 001-landing-completa

## Contexto
`tests/unit/content-guide.test.ts` comprueba que los ejemplos de la guía de contenido
(`src/content/README.md`) pasan los esquemas Zod. Para leer el frontmatter de esos ejemplos importa
`yaml`.

El paquete ya estaba en `node_modules` (versión 2.9.1), pero solo como dependencia transitiva de
`@astrojs/check`; no figuraba en `package.json`. Una actualización de esa herramienta podía
retirarlo o cambiar su versión y romper la prueba sin que nadie hubiera tocado el proyecto.

## Decisión
Declarar `yaml` como `devDependency`, en la misma versión mayor que ya está instalada.

- Licencia: ISC.
- Peso en el navegador: ninguno. Solo lo usan las pruebas unitarias.

## Alternativas descartadas
- **Seguir usando la dependencia transitiva:** frágil, por lo descrito en el contexto.
- **Escribir un lector de frontmatter propio:** más código que mantener para un caso que el paquete
  ya resuelve, y con riesgo de aceptar ejemplos que Astro rechazaría.
- **Escribir los ejemplos de la guía en JSON:** los destinos y los textos legales son Markdown con
  frontmatter YAML; la guía debe mostrar el formato real que escribe `content-curator`.

## Consecuencias
- Una dependencia de desarrollo más que mantener al día.
- La prueba de la guía deja de depender de qué instale otra herramienta.
