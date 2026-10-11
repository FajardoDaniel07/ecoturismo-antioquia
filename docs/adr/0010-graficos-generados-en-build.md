# ADR 0010 — Perfil, láminas y gráficos generados en el build

Estado: Aceptado (2026-10-10, aprobado por el humano) · Fecha: 2026-10-10 · Feature: 001-landing-completa

## Contexto
El humano decidió que no hay ilustrador: el perfil del hero sale de una función pura de `src/lib/`
a partir de los destinos, y las cuatro láminas son curvas de nivel deterministas generadas por
código. `design.md` fija la geometría (S3.4 a S3.8, S6.3) y varias condiciones:

- El perfil se estira solo a lo ancho; textos y puntos conservan su tamaño y los trazos su grosor.
- Los destinos del perfil son una lista de enlaces, "la misma que se ve", con área de 44 × 44 px.
- Hay tres variantes de perfil, una por rango de ancho, y la de móvil muestra cinco puntos como
  máximo.
- La cifra de una lámina cambia de tamaño según el ancho de la lámina, no de la ventana.
- Todo debe funcionar sin JavaScript, y el hero no puede retrasar la carga.

## Decisión
1. **Las funciones de `lib/` devuelven modelos de datos, no HTML ni SVG**: `buildAltitudeProfile()`,
   `buildContourPlate()` y `buildElevationProfile()` devuelven trazados, posiciones y avisos. Los
   componentes de `ui/` los pintan. Así la geometría se prueba con Vitest sin navegador.
2. **Perfil en dos capas.** Un SVG decorativo, oculto a la tecnología de apoyo, con
   `preserveAspectRatio="none"` y `vector-effect: non-scaling-stroke`, para la silueta, los
   estratos y las curvas. Encima, HTML: los textos fijos y una `<ol>` de enlaces, colocados con
   `left` en porcentaje del ancho y `top` en px.
3. **Las tres variantes se pintan en el HTML** y CSS muestra la de su rango. Las otras dos quedan
   con `display: none`: fuera del foco y del árbol de accesibilidad.
4. **La aparición es CSS puro**: una cubierta del color del papel cuyo estado por defecto es
   retirada; una animación de `--duration-draw` la trae desde el inicio una sola vez.
5. **Láminas con `<symbol>` y `<use>`.** Los dibujos que una página necesita se definen una vez; cada
   lámina los referencia con `preserveAspectRatio="xMidYMid slice"`. Los colores entran por
   variables CSS heredadas.
6. **Consultas de contenedor** para el tamaño de la cifra de la lámina y para el paso de una a dos
   columnas de la ficha.
7. **El perfil de elevación de cada ruta y el contenido del panel "Ruta seleccionada" se generan en
   el build** y viajan en un `<template>` por ruta. La isla del mapa solo clona.
8. **El respaldo de S3.10 no se construye por adelantado.** Si el humano lo pide en la revisión con
   capturas (CA-124), se añade una función `buildAltitudeRule()` con el mismo contrato de entrada.
9. **Los avisos de geometría** (etiqueta sin sitio, estrato demasiado bajo, más destinos que la
   capacidad) se devuelven en el modelo y `loadSite()` los muestra en el build.

## Alternativas consideradas
- **Todo el perfil dentro del SVG, con `<text>` y `<a>`.** Al estirar la figura a lo ancho se
  deforman los textos y los puntos; las áreas táctiles y el foco en SVG son menos fiables.
- **Generar el perfil en el navegador según el ancho real.** Necesita JavaScript en el hero,
  retrasa el primer pintado y rompe "sin JavaScript el perfil está completo".
- **Una sola variante que se adapta con CSS.** Las variantes cambian el número de puntos y la
  colocación de etiquetas, no solo medidas.
- **Láminas como archivos SVG externos.** Se guardan en caché, pero no pueden leer los tokens: habría
  que escribir colores dentro del archivo.
- **Curvas de nivel repetidas en cada lámina.** Multiplica el HTML por el número de destinos sin
  foto.
- **Animar el trazo del SVG.** Descartado en la dirección visual: con la figura estirada y grosores
  fijos, los navegadores no calculan igual la longitud del trazo.

## Consecuencias
- (+) El hero es HTML, SVG y CSS: cero JavaScript, y el titular sigue siendo el mayor elemento.
- (+) Cambiar la altitud de un destino cambia el perfil sin tocar nada más (CA-5).
- (+) La geometría es determinista y tiene pruebas unitarias; los parámetros de las fórmulas son
  constantes con nombre, fáciles de ajustar tras la revisión con capturas.
- (−) El HTML del inicio carga las tres variantes del perfil (como máximo 5, 11 y 15 enlaces) y
  hasta cuatro símbolos de curvas. Presupuesto: 45 KB gzip para toda la página.
- (−) La estimación de ancho de las etiquetas (0.58 × 14 px por carácter) es aproximada; una
  etiqueta larga puede necesitar ajuste. Por eso CA-124 exige revisar capturas.
- (−) A 320 px la variante compacta queda por debajo de su ancho de cálculo (360 px). Se incluye esa
  captura en la revisión.
- (−) Las consultas de contenedor requieren navegadores de 2023 en adelante; en uno anterior la
  cifra de la lámina usa su tamaño menor y la ficha queda en una columna.
