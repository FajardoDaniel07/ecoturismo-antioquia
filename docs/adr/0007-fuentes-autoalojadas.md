# ADR 0007 — Fuentes autoalojadas sin dependencia

Estado: Aceptado (2026-10-10, aprobado por el humano) · Fecha: 2026-10-10 · Feature: 001-landing-completa

Revisión del 2026-10-10: el humano aceptó Besley estática de peso 700, condicionada a que ningún
texto en Besley use otro peso. Se comprobó y se aplicó (decisión 1).

## Contexto
La dirección visual (sección 3.3) pide Besley e Instrument Sans autoalojadas, con
`font-display: swap`, subconjunto latino, dos archivos variables en romana y precarga solo de
Besley. Deja el mecanismo a este plan, "con ADR si implica una dependencia".

`tokens.css` nombra las familias literalmente: `--font-display: "Besley", "Rockwell", …` y
`--font-sans: "Instrument Sans", system-ui, …`.

## Decisión
1. Dos archivos WOFF2 guardados en el repositorio, en `src/assets/fonts/`, cada uno con el texto de
   su licencia (SIL Open Font License 1.1) al lado:

   | Archivo | Tipo | Peso |
   |---|---|---|
   | `besley-latin-700-normal.woff2` | Estática, peso 700 | 18.9 KB |
   | `instrument-sans-latin-wght-normal.woff2` | Variable, peso de 400 a 700 | 30.1 KB |

   Proceden de los paquetes `@fontsource/besley` e `@fontsource-variable/instrument-sans`, versión
   5.3.0. Se descargan una vez; **no se instalan como dependencia**.

   **Comprobación de los pesos de Besley.** Se revisaron todos sus usos en `design.md`, en la
   dirección visual y en `tokens.css`: titular del hero, títulos de sección, títulos de destino
   (33, 27 y 21 px), nombre del sitio en la cabecera, título de la página de detalle, y cifra de
   altitud destacada y de las láminas. Todos son de peso 700. No hay Besley en otro peso ni en
   cursiva, y el único peso que los tokens asocian a Besley es `--font-weight-bold`.
2. Dos reglas `@font-face` escritas a mano en `src/styles/fonts.css`, con los nombres de familia
   "Besley" (`font-weight: 700`) e "Instrument Sans" (`font-weight: 400 700`), `font-display: swap`
   y el `unicode-range` del subconjunto latino. `global.css` importa ese archivo.
3. `BaseLayout` precarga solo Besley con `<link rel="preload" as="font" type="font/woff2"
   crossorigin>`, tomando la URL final del archivo con una importación `?url`.
4. **No implica dependencia nueva.**
5. **Regla derivada:** todo texto en `--font-display` va en peso 700. Una prueba de Vitest
   (`style-tokens.test.ts`) lo vigila.

## Alternativas consideradas
- **API de fuentes de Astro (`fonts` en la configuración y `<Font />`).** Está integrada y no añade
  dependencia; genera la precarga y fuentes de respaldo con métricas ajustadas. Se descarta porque
  nombra las familias con un sufijo (`Besley-<hash>`) y las expone por una variable CSS propia:
  obligaría a redefinir `--font-display` y `--font-sans`, que son tokens aprobados, o a
  sobrescribirlos por orden de cascada. Además, para una familia con respaldo `serif`, como Besley,
  su respaldo ajustado se basa en Times New Roman (comprobado en el código de Astro 7.3.8), que no
  existe en Android, la plataforma principal de la audiencia: en el titular, que es donde importa,
  la ventaja no llegaría.
- **Paquetes `@fontsource/*` como dependencia.** Dos dependencias para dos archivos, y su CSS trae
  todos los subconjuntos.
- **Google Fonts por CDN.** No es autoalojado; añade una conexión a un tercero.
- **Besley variable (36.6 KB).** Es lo que dice hoy la dirección visual. Carga 17.7 KB de más en la
  fuente precargada para pesos que el sitio no usa.

## Consecuencias
- (+) Sin dependencia y sin red en el build. Los tokens no cambian.
- (+) 49.0 KB en total; solo 18.9 KB en la ruta crítica.
- (−) Si una feature futura necesita Besley en otro peso, hay que añadir otro archivo o volver a la
  variable. Mientras tanto, un texto en Besley con otro peso se vería en negrita igualmente.
- (−) La dirección visual 3.3 dice "dos archivos variables" y debe corregirse (`ui-designer`); este
  ADR no la edita.
- (−) Actualizar una fuente es un paso manual: sustituir el archivo y revisar el `unicode-range`.
- (−) No hay fuente de respaldo con métricas ajustadas: el cambio de fuente del titular puede mover
  el contenido. Si la medición de CLS (CA-116) supera 0.05, se añade una regla de respaldo con
  `size-adjust`; eso cambia la pila de `--font-display` y pasa por `ui-designer`.
- (−) Falta confirmar, al cargar la fuente, que el subconjunto de Instrument Sans conserva los
  numerales tabulares que la dirección visual pide "si la fuente los ofrece".
