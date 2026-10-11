# ADR 0003 — Modelo de contenido y puerta de publicación

Estado: Aceptado (2026-10-10, aprobado por el humano). Revisión del 2026-10-11 (tipo de sitio):
aceptada (2026-10-11, aprobada por el humano) · Fecha: 2026-10-10 · Feature: 001-landing-completa

Revisión del 2026-10-10: incorpora las decisiones del humano sobre el significado de `npm run build`,
`SITE_URL`, el idioma de las claves, los identificadores exigidos y CA-122.

## Contexto
La spec exige que el sitio no publique datos incompletos, de relleno o sin verificar (HU-12;
CA-20, CA-46, CA-47, CA-77, CA-78, CA-104, CA-118 a CA-120, CA-122). Algunos de esos datos no
estarán listos hasta el lanzamiento: los textos legales nacen como borrador, los identificadores
oficiales los entrega el operador y el dominio del sitio aún no está decidido. La spec distingue una
"compilación de publicación", que debe fallar, de una "de desarrollo o vista previa", que sí se
genera. A la vez, `CLAUDE.md` exige `npm run build` en verde durante la implementación.

Varias reglas cruzan archivos (dos destinos principales en un piso, ruta sin destino, destino fuera
del rango declarado) y Astro no permite validar las dimensiones de una imagen dentro del esquema
(`image().refine()` no está soportado).

## Decisión
1. **Cinco colecciones**: `destinos` y `rutas` (ya previstas), más `legal`, `operador` y
   `territorio`. `territorio` guarda la altitud mínima y máxima de Antioquia y los tres umbrales
   entre pisos, con marca de verificado y fuente.
2. **Las claves del contenido van en inglés** (`altitude`, `photos`, `difficulty`), por la convención
   de `CLAUDE.md`. Decidido por el humano.
3. **El piso térmico no se guarda en el contenido**: se deriva de la altitud con una única función.
4. **Dos niveles de validación.** Los esquemas Zod validan cada archivo. Una función pura,
   `validateSite(raw, mode)`, valida lo que cruza archivos y lo que depende del modo, y devuelve el
   modelo publicado más una lista de problemas con archivo, campo, regla y criterio.
5. **Una sola puerta.** `src/lib/content/load.ts` es el único módulo que importa `astro:content`.
   Lee las colecciones, llama a `validateSite()`, memoriza el resultado y detiene el build con todos
   los problemas juntos. Páginas y `BaseLayout` obtienen los datos de ahí; los componentes los
   reciben por props.
6. **Dos modos, por el modo de Vite.** Decidido por el humano:

   | Guion | Orden | Modo |
   |---|---|---|
   | `npm run dev` | `astro dev` | vista previa |
   | `npm run build` | `astro check && astro build --mode preview` | vista previa: permisiva, `noindex`, borradores marcados |
   | `npm run build:release` | `astro check && astro build` | publicación: estricta |

   Un `astro build` sin opciones es publicación. **El alojamiento debe configurarse con
   `npm run build:release`**; la salida de `npm run build` no es desplegable.
7. **La vista previa no es publicable**: todas sus páginas llevan `noindex` y su `robots.txt`
   prohíbe el rastreo.
8. **Tres severidades**: `error` (detiene siempre), `release` (detiene solo la publicación) y
   `warning`. La tabla completa está en el plan, decisión D1. En particular:
   - CA-122 (umbrales desordenados, destino fuera de rango) es `error`: falla también en vista
     previa.
   - CA-104 (altitud sin verificar): en vista previa el destino se excluye con aviso; en
     publicación falla.
   - CA-118, CA-119 y CA-120 (borradores, identificadores ausentes o de relleno) son `release`.
9. **`SITE_URL` es obligatoria solo en publicación.** Si falta, la compilación de publicación falla
   con un mensaje que dice qué definir. La vista previa usa `http://localhost:4321`. El sitio se
   sirve desde la raíz del dominio, sin subruta, mientras no se decida otra cosa.
10. **Identificadores exigidos para publicar:** RNT, NIT y razón social. La lista vive en una
    constante; es el punto de partida y la confirmación legal sigue abierta (PA-8).
11. **Raíz de contenido configurable** con la variable `CONTENT_ROOT`, para construir escenarios de
    prueba desde `tests/fixtures/content/` sin tocar el contenido real.

## Alternativas consideradas
- **Toda la validación en los esquemas Zod.** No alcanza: un esquema ve un archivo, no el conjunto,
  y no ve las dimensiones de las fotos.
- **Un guion de validación aparte, antes del build.** Duplica la lectura del contenido y puede
  desincronizarse de lo que el sitio pinta. Con una sola puerta, lo validado es lo publicado.
- **`npm run build` estricto y `build:preview` permisivo.** Más seguro por defecto en el guion, pero
  deja `npm run build` en rojo hasta el lanzamiento y contradice las puertas de `CLAUDE.md`.
  Descartada por el humano.
- **Variable de entorno en lugar de `--mode`.** Fijarla en un guion de npm de forma portable entre
  Windows y Unix pide una dependencia (`cross-env`).
- **Guardar el piso en cada destino.** Permite que un destino diga un piso que no corresponde a su
  altitud (CA-29).
- **Claves del contenido en español.** Más cómodas para quien edita, pero mezclan idiomas en los
  tipos derivados de los esquemas.

## Consecuencias
- (+) Lo estricto es el comportamiento por defecto de la herramienta; lo permisivo hay que pedirlo.
- (+) Las reglas son funciones puras con pruebas unitarias; los criterios `[build]` se comprueban
  además construyendo escenarios inválidos.
- (+) El desarrollo no depende de que el contenido real, los textos legales, los identificadores ni
  el dominio estén listos.
- (−) La estructura de `CLAUDE.md` crece: `src/content/legal/`, `src/content/sitio/`, `tests/build/`
  y `tests/fixtures/`. Conviene reflejarlo en `CLAUDE.md`, con aprobación humana aparte.
- (−) `load.ts` es un módulo de `lib/` que no es puro. Se limita a leer y delegar, y una regla de
  ESLint impide importar `astro:content` desde cualquier otro módulo de `lib/` o de `ui/`.
- (−) Quien configure el alojamiento debe usar `build:release`. Si se despliega la vista previa, no
  se indexa, pero los borradores quedarían accesibles por enlace directo.
- (−) Tres cosas bloquean el lanzamiento y no el desarrollo: el dominio (`SITE_URL`), los
  identificadores oficiales y la revisión de los textos legales.
- (−) Cambiar el idioma de las claves después de cargar contenido obliga a migrar todos los
  archivos.

## Revisión del 2026-10-11: tipo de sitio (académico u operador real)

Estado de esta revisión: **Aceptada (2026-10-11, aprobada por el humano).** Lo decidido el 2026-10-10
sigue aceptado y construido; esta revisión lo extiende y, donde lo contradice, lo sustituye.

### Contexto
El humano decidió que el sitio es un ejercicio académico: no hay operador real, ni RNT, NIT o razón
social, y no se inventan. La spec añadió el modo de ejercicio académico (CA-125 a CA-139) y conservó
el modo de operador real (CA-138). Con la puerta tal como estaba, el sitio no podía publicarse
nunca: exigía tres identificadores y tres textos legales revisados.

### Decisión
12. **El tipo de sitio se declara en los datos**: campo obligatorio `siteKind` (`"academic"` u
    `"operator"`) en `src/content/sitio/operador.json`, sin valor por defecto. Si falta o no es
    válido, cualquier compilación falla. Nunca se deduce de otros datos (CA-125).
13. **Dos ejes independientes.** El modo de compilación (`preview` o `release`) sale de la orden; el
    tipo de sitio sale del contenido. `validateSite()` entrega ambos en el modelo, más
    `indexable = siteKind === 'operator' && mode === 'release'`.
14. **En modo académico:**
    - Ningún identificador oficial se exige ni se muestra. Si alguno aparece cargado, la compilación
      falla en ambos modos de compilación (CA-119 b). Sustituye al punto 10 para este tipo de sitio.
    - Los tres textos legales llevan `status: "sample"`, un estado nuevo. La página pinta el rótulo
      de texto de muestra siempre que el estado es `sample`; si un texto no lo tiene, la compilación
      falla (CA-134). No hay fecha de revisión.
    - El sitio no es indexable en ninguna compilación (ADR 0012).
15. **En modo de operador real** rige todo lo decidido el 2026-10-10. Un texto legal `sample` es un
    error: un operador real no publica textos de muestra.
16. **Lo demás sigue estricto en los dos tipos de sitio** (CA-139): altitudes y umbrales
    verificados, fotos, rutas, destino principal, al menos un destino, contacto no de relleno y
    `SITE_URL`, cuyo problema pasa a etiquetarse CA-139.
17. **Sustituye al punto 7:** una compilación no indexable no cierra `robots.txt`; declara
    `noindex` en cada página y por cabecera (ADR 0012).
18. **Dos reglas nuevas en la puerta:** la política de datos debe nombrar a cada tercero de un
    registro en código (CA-135), como error; y una búsqueda de términos de promesa comercial sobre
    los textos (CA-137), como aviso.
19. **Campo opcional `sources`** en destinos y rutas, para las citas de datos que no son la altitud.
    No se pinta. Los comentarios HTML en el cuerpo Markdown producen aviso, porque acabarían en el
    HTML publicado.
20. **`territorio.minM` admite 0** (nivel del mar). La altitud de un destino sigue siendo mayor
    que cero.
21. **`load.ts` entrega también el cuerpo renderizado** con `renderBody(coleccion, id)`. Sigue
    siendo el único módulo que importa `astro:content`.
22. **Límites que se documentan y no se resuelven en el esquema:** una sola altitud por destino,
    aunque el lugar abarque un rango; y clima solo como rango, sin temperatura media.

### Alternativas consideradas
- **Un archivo o una colección aparte para el tipo de sitio.** Más limpio de nombre, pero añade una
  pieza a cada escenario de prueba y a la puerta sin cambiar el comportamiento.
- **Deducir el modo académico de la ausencia de identificadores.** Prohibido por CA-125: un operador
  real al que le faltan datos pasaría por académico.
- **Reutilizar `reviewed` para los textos de muestra.** Diría que un asesor revisó un texto que
  nadie revisó, y pintaría una fecha de revisión.
- **Rótulo escrito a mano en el cuerpo de cada texto.** Dependería de que el curador lo copie igual
  tres veces; con el estado `sample` lo pinta la plantilla y no puede faltar.
- **Quitar el modo de operador real.** Perdería reglas ya construidas y probadas; la spec lo
  conserva (CA-138).
- **Altitud como rango en el esquema.** Cambiaría la ficha, el perfil y el orden; es un cambio de
  spec y de diseño, no de esta revisión.

### Consecuencias
- (+) El sitio académico se puede publicar sin inventar datos legales, y la puerta sigue impidiendo
  publicar cifras sin verificar.
- (+) Un error al declarar el tipo de sitio falla de forma visible y segura en los dos sentidos.
- (−) Todos los escenarios de prueba deben declarar `siteKind`; hace falta uno nuevo, `academico`.
- (−) El contenido real debe añadir `siteKind`, pasar los legales a `sample` y mover sus citas de
  los comentarios HTML a `sources`.
- (−) El archivo se sigue llamando `operador.json` aunque en modo académico no haya operador.
- (−) PA-8 deja de bloquear la publicación; el dominio (PA-17) sigue bloqueándola.
