# ADR 0003 — Modelo de contenido y puerta de publicación

Estado: Aceptado (2026-10-10, aprobado por el humano) · Fecha: 2026-10-10 · Feature: 001-landing-completa

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
