# ADR 0012 — Despliegue en Vercel sin adaptador y política de no indexación

Estado: Aceptado (2026-10-11, aprobado por el humano) · Fecha: 2026-10-11 · Feature: 001-landing-completa

## Contexto
El humano decidió el 2026-10-11 que el sitio es un ejercicio académico y que se despliega en Vercel.
El dominio sigue sin definir (PA-17). El ADR 0003 dejó dicho que el alojamiento debía usar
`npm run build:release`, pero no cómo.

Tres hechos condicionan la decisión:

- El sitio es estático (`output: 'static'`), con `trailingSlash: 'always'`.
- En modo académico el sitio no debe indexarse en ninguna compilación (CA-133). `spec-writer`
  advirtió que, si `robots.txt` bloquea el rastreo, los buscadores no leen la instrucción de no
  indexar y pueden listar la dirección igualmente.
- Vercel construye dos tipos de despliegue con la misma orden: producción y vista previa (ramas y
  solicitudes de cambio). Añade `X-Robots-Tag: noindex` a los de vista previa, pero no al dominio
  de producción `*.vercel.app`.

## Decisión
1. **Sin adaptador y sin dependencia nueva.** Vercel sirve `dist/` como archivos estáticos.
   `@astrojs/vercel` solo es necesario para renderizado bajo demanda.
2. **Un archivo `vercel.json`** en la raíz, con: `framework: "astro"`,
   `buildCommand: "npm run build:vercel"`, `outputDirectory: "dist"`, `trailingSlash: true` y dos
   reglas de cabeceras.
3. **Guion `build:vercel`**, que ejecuta `scripts/vercel-build.mjs`. El guion lee la variable de
   sistema `VERCEL_ENV`: con `production` lanza `npm run build:release`; con cualquier otro valor,
   `npm run build`. Así el despliegue de producción de Vercel es la compilación de publicación del
   proyecto y el de vista previa es la vista previa. El significado de `build` y `build:release`
   no cambia.
4. **Variables.** `SITE_URL` se define solo en el entorno Production de Vercel. En vista previa,
   `astro.config.mjs` usa `https://$VERCEL_URL` como dirección de reserva, antes del valor local.
   La comprobación de `SITE_URL` de la publicación sigue leyendo solo `SITE_URL`. No se definen
   `OUT_DIR` ni `CONTENT_ROOT`.
5. **Node.js 24.x** en los ajustes del proyecto, la misma versión mayor que en desarrollo.
6. **Barras finales.** `trailingSlash: true` redirige con 308 las rutas sin barra final a su forma
   con barra; las rutas con extensión de archivo no se redirigen.
7. **No indexar, por tres vías que no se estorban:**
   - Metaetiqueta `robots` con `noindex, nofollow` en cada página cuando el sitio no es indexable
     (modo académico, o cualquier vista previa).
   - Cabecera `X-Robots-Tag: noindex, nofollow` en todas las rutas, declarada en `vercel.json`.
     Alcanza a imágenes, fuentes y archivos de datos, que no tienen metaetiqueta.
   - `robots.txt` **no bloquea el rastreo**: `User-agent: *` con `Disallow:` vacío, sin línea
     `Sitemap` y con un comentario que dice que el sitio no debe indexarse. No existe mapa del
     sitio.
8. **Coherencia vigilada.** `vercel.json` no conoce el contenido. Una prueba de `tests/build/`
   falla si el contenido real declara `academic` y la cabecera falta, o si declara `operator` y la
   cabecera está.
9. **Caché.** `Cache-Control: public, max-age=31536000, immutable` para `/_astro/`, cuyos archivos
   llevan huella en el nombre.
10. **No se define `Referrer-Policy`**: la política de teselas de OpenStreetMap exige que el
    navegador envíe `Referer` (ADR 0006).

## Alternativas consideradas
- **Adaptador `@astrojs/vercel`.** Añade una dependencia y la salida en el formato de Vercel para
  funciones que el sitio no tiene. Aportaría las cabeceras de caché, que se resuelven con una regla.
- **Configurar la orden de build en el panel de Vercel.** Funciona, pero queda fuera del
  repositorio y de la revisión; `vercel.json` la versiona.
- **Una condición de shell dentro de `buildCommand`.** Equivalente, pero ilegible dentro de JSON y
  sin posibilidad de probarla en local.
- **Usar siempre `build:release` también en vista previa.** Exigiría `SITE_URL` en cada rama, que
  no tiene dirección fija.
- **`robots.txt` con `Disallow: /`.** Es la lectura literal de CA-133, pero impide que el buscador
  lea el `noindex` y puede dejar la dirección listada si alguien la enlaza.
- **Solo la metaetiqueta, sin cabecera.** No cubre los archivos que no son HTML.
- **`vercel.ts`, configuración programática.** Podría leer `siteKind` y decidir la cabecera, pero
  añade un mecanismo nuevo para algo que una prueba resuelve.

## Consecuencias
- (+) Un fallo de la puerta de publicación detiene el despliegue de producción y el sitio anterior
  sigue en línea.
- (+) Las ramas se pueden ver en Vercel sin dominio ni datos completos.
- (+) El sitio no se indexa por ninguna vía conocida, incluido el subdominio `*.vercel.app`.
- (−) Si el sitio pasa a operador real, hay que retirar la cabecera de `vercel.json`; la prueba lo
  recuerda fallando.
- (−) La redacción de CA-133 sobre el archivo de instrucciones no describe lo construido; conviene
  que `spec-writer` la ajuste.
- (−) El comportamiento de Vercel con `404.html`, las redirecciones y las cabeceras solo se puede
  comprobar con un despliegue real; queda como tarea de verificación.
- (−) `CLAUDE.md` necesita un guion más (`build:vercel`) y una línea de despliegue.
- (−) El dominio sigue sin definir: `SITE_URL` es un paso humano que bloquea la publicación.
