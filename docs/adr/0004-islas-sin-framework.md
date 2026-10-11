# ADR 0004 — Islas sin framework con carga diferida

Estado: Aceptado (2026-10-10, aprobado por el humano) · Fecha: 2026-10-10 · Feature: 001-landing-completa

## Contexto
`CLAUDE.md` pide dos cosas que, leídas al pie de la letra, no caben juntas:

- "Islas interactivas en TypeScript sin framework UI (web components / `<script>` de Astro)".
- "Las islas se hidratan con `client:visible` (nunca `client:load` sin justificar en un ADR)".

Las directivas `client:*` de Astro solo se aplican a componentes de un framework de interfaz
(React, Svelte, etc.). Un componente `.astro` con un `<script>` no las admite: su guion se ejecuta
al cargar la página.

La intención de la regla es clara y la spec la hace medible: el código del visor y del mapa no se
descarga hasta que su sección está cerca de la ventana (CA-66, CA-79).

## Decisión
1. **No se añade ningún framework de interfaz.**
2. Cada isla es un componente `.astro` de `src/components/islands/` con un guion cargador mínimo.
   El cargador usa `whenVisible(elemento, cargar)`: un `IntersectionObserver` con 300 px de margen
   que, la primera vez que el contenedor se acerca a la ventana, hace `import()` dinámico del módulo
   real (`*.client.ts`). Vite separa ese módulo, y sus dependencias, en archivos propios.
3. Esto es el equivalente de `client:visible`. No hay `client:load` ni carga anticipada.
4. Los estilos de una dependencia de isla (el CSS de Leaflet) se importan desde el módulo diferido,
   de modo que tampoco entran en la carga inicial.
5. Tres ayudas mínimas no son islas y se permiten, con un tope conjunto de 1.5 KB gzip:
   - una línea en `<head>` que añade la clase `js` a `<html>`, para reservar la caja del mapa solo
     cuando hay JavaScript (CA-80 y la reserva de espacio de S9.2);
   - el cierre del menú móvil con Esc y al elegir un enlace, que `design.md` S2 pide como mejora
     sobre un menú que ya funciona sin JavaScript;
   - el propio cargador de islas.
6. La lógica con estado de las islas que se pueda expresar sin DOM (índice del visor, extremos,
   umbral de deslizamiento) vive en `src/lib/` como funciones puras con pruebas unitarias.

## Alternativas consideradas
- **Añadir un framework ligero (Preact, Svelte) para usar `client:visible` literal.** Suma una
  dependencia y un runtime para dos piezas que no lo necesitan, y contradice "sin framework UI".
- **`<script>` normal de Astro en cada componente.** Descarga y ejecuta el visor y Leaflet en la
  carga inicial; incumple CA-66 y CA-79.
- **Web components con registro perezoso.** Válido, pero el cargador sigue siendo necesario; el
  elemento personalizado no aporta nada que el plan use.
- **`<noscript><style>` en lugar de la clase `js`.** Evita la línea de JavaScript, pero deja estilos
  fuera de la hoja del sitio y no sirve como gancho para el diseño de la sección del mapa.

## Consecuencias
- (+) Cero JavaScript de visor y de mapa en la carga inicial; se comprueba con pruebas de red.
- (+) Sin runtime de framework.
- (−) El patrón es propio: hay que mantener `when-visible.ts` (unas quince líneas) y documentarlo.
- (−) `CLAUDE.md`, regla 1, debería reescribirse para decir "carga diferida al acercarse a la
  ventana (equivalente a `client:visible`)" y para admitir las tres ayudas mínimas.
- (−) Si el guion cargador no llega a ejecutarse (fallo de red del propio guion), la caja del mapa
  queda en "Cargando el mapa…". La lista de rutas sigue completa debajo.
