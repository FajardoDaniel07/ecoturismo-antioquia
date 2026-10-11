# Dirección visual — Pisos térmicos

Estado: APROBADO por el humano el 2026-10-10 (Fase 0)

Este documento es la fuente de verdad del diseño del sitio. Los tokens de
[`src/styles/tokens.css`](../../src/styles/tokens.css) lo reflejan exactamente: si uno cambia, el
otro cambia en el mismo commit. Cada `design.md` de feature hereda lo que aquí se decide.

Tres avisos sobre el alcance de lo que este documento garantiza:

- **Contrastes:** se calcularon paso a paso con la fórmula de WCAG (anexo A) y se recalcularon
  con un script el 2026-10-10; las razones de la sección 4.3 coinciden. El par más ajustado da
  5.43:1. Falta la comprobación con axe sobre el sitio construido.
- **Altitudes y umbrales:** toda cifra de altitud es un ejemplo de memoria, marcada "por verificar
  por content-curator". Ninguna debe publicarse sin esa verificación.
- **Tailwind:** `tokens.css` se compiló en memoria con el Tailwind instalado el 2026-10-10: las
  utilidades de los tokens se generan y las de la paleta por defecto dejan de existir. Falta
  importarlo desde `global.css` (sección 9).

---

## 1. Brief

**Sujeto.** Salidas de ecoturismo de uno a tres días por Antioquia: caminatas, avistamiento de
aves, fincas cafeteras, ríos y páramo.

**Audiencia.** Tres grupos, todos leyendo en español y casi siempre desde el celular:

| Grupo | Qué necesita de la página |
|---|---|
| Personas de Medellín y otras ciudades colombianas | Elegir rápido un plan de fin de semana y saber cuánto exige |
| Visitantes extranjeros que leen español | Entender el territorio sin conocerlo: dónde queda, qué clima hace, cuánto se tarda en llegar |
| Familias con niños | Saber de entrada si una salida es apta para su grupo: dificultad, duración, edad sugerida |

**Trabajo de la página.** Ayudar a elegir un destino o una ruta y llevar al contacto.

**Consecuencias de diseño de esa audiencia.** No son recomendaciones; son reglas del sitio.

1. **Lenguaje claro.** Español neutro de Colombia, frases cortas, sin regionalismos que un
   extranjero no entienda. Si aparece un término local necesario ("piso térmico", "páramo",
   "silleta"), se explica en la misma frase la primera vez.
2. **El concepto rector se explica una vez, en el hero.** "Piso térmico" no es vocabulario común
   fuera de Colombia. Una sola línea lo aclara: en la montaña tropical, el clima depende de la
   altura.
3. **Unidades siempre escritas.** Metros, kilómetros, horas y grados Celsius con su unidad al lado
   de la cifra. La abreviatura "m s. n. m." no se usa en la interfaz: se escribe "metros de altitud"
   la primera vez y "m" después.
4. **Cifras sin ambigüedad.** Las altitudes de cuatro cifras se escriben sin separador de miles:
   "2500 m", no "2.500 m". Es la norma académica del español y evita que quien usa el punto como
   decimal lea dos metros y medio. Los precios llevan la moneda escrita: "COP".
5. **Cada salida tiene una ficha comparable.** Los mismos datos, en el mismo orden, en todo el
   sitio (sección 5.5).
6. **Tono cercano.** La cartografía da precisión; el sitio no debe sonar a informe técnico. El
   calor viene del lenguaje, del color de acción y del trato de la fotografía (secciones 4.4 y 6).

---

## 2. Dirección estética

### 2.1 Direcciones consideradas

| | 1. Pisos térmicos | 2. Zócalo | 3. Niebla que levanta |
|---|---|---|---|
| Idea rectora | La altitud ordena toda la página | Fachada de cal con franja de color | La fotografía se disuelve en niebla |
| Protagonista | Perfil altitudinal en SVG | Motivos ilustrados y color plano | Fotografía a sangre |
| Dependencia crítica | Datos de altitud y un SVG bien dibujado | Ilustración a medida | Fotografía excelente y propia |
| Cobertura del territorio | Todo el departamento | Sesgo hacia el Oriente | Sesgo hacia la alta montaña |
| Riesgo de rendimiento | Bajo | Bajo a medio | Medio a alto |

### 2.2 Dirección elegida

El humano eligió la **dirección 1, Pisos térmicos**, sin mezclas.

**Concepto.** Antioquia se lee de abajo hacia arriba: del cañón caliente de sus ríos al páramo. La
altitud organiza los destinos, la galería y el mapa.

**Referente.** La cartografía de naturalista: las láminas de la Comisión Corográfica y los perfiles
de vegetación por altura. El sitio toma de ahí el método (ordenar por altura, rotular con
precisión), no el aspecto antiguo. Debe leerse como una guía actual.

**Por qué encaja.**

- La altitud es información útil para los tres grupos de la audiencia: dice qué clima hace, qué
  ropa llevar y qué tan exigente es la salida.
- Cubre todo el departamento sin privilegiar un municipio.
- No depende de fotografía propia, que el proyecto no tiene (sección 6).
- El hero es texto y SVG: favorece el objetivo de Lighthouse móvil ≥ 90 y funciona sin JavaScript.

### 2.3 Dónde se gasta la audacia

En un solo lugar: **el perfil altitudinal del hero y la regla de altitud que acompaña la página.**
Todo lo demás es deliberadamente callado.

---

## 3. Tipografía

Dos familias, ambas con licencia SIL Open Font License y disponibles en Google Fonts.

| Familia | Rol | Por qué |
|---|---|---|
| **Besley** | Titulares y cifras de altitud | Es una Clarendon, la letra de los rótulos de mapas grabados. Tiene carácter y calidez sin ser nostálgica |
| **Instrument Sans** | Cuerpo e interfaz | Sans contemporánea, legible en pantallas pequeñas, que contrasta con Besley sin competir |

### 3.1 Uso

| Elemento | Familia | Peso | Tamaño | Interlineado |
|---|---|---|---|---|
| Titular del hero | Besley | 700 | `clamp(2.25rem, 7vw, 4.5rem)` (36 a 72 px) | 1.05 |
| Título de sección | Besley | 700 | 42 px (33 px en móvil) | 1.12 |
| Título de destino | Besley | 700 | 33 px (27 px en móvil) | 1.2 |
| Cifra de altitud destacada | Besley | 700 | 52 px (42 px en móvil). En la lámina de altitud, según su ancho: 52, 42, 33 o 21 px (sección 6.5) | 1.08 |
| Entradilla | Instrument Sans | 400 | 21 px | 1.45 |
| Cuerpo | Instrument Sans | 400 | 17 px | 1.55 |
| Botones | Instrument Sans | 600 | 17 px | 1.2 |
| Etiquetas de ficha, navegación | Instrument Sans | 500 | 17 px | 1.45 |
| Créditos de foto, notas | Instrument Sans | 400 | 14 px | 1.45 |

### 3.2 Reglas

- **Escala** de razón 1.25 sobre 17 px: 14 / 17 / 21 / 27 / 33 / 42 / 52 / 72. No hay tamaños
  intermedios.
- **Tamaño mínimo:** 14 px, solo para créditos y notas. El cuerpo nunca baja de 17 px.
- **Longitud de línea:** máximo 70 caracteres en texto corrido (`--container-prose`).
- **Alineación:** todo a la izquierda. Nada centrado ni justificado.
- **Mayúsculas:** solo las que pide la ortografía. Sin rótulos en mayúsculas espaciadas.
- **Énfasis:** un titular no resalta una sola palabra con otro color, peso o cursiva.
- **Cifras de ficha:** alineadas en columna con numerales tabulares, si Instrument Sans los
  ofrece (por verificar al cargar la fuente).
- **Espaciado entre letras:** −0.01em en titulares de Besley de 42 px o más; cero en el resto.

### 3.3 Carga

- Fuentes autoalojadas, con `font-display: swap` y subconjunto latino (cubre el español).
- Dos archivos: **Besley estática de peso 700** e **Instrument Sans variable** (pesos 400 a 600).
  No se carga cursiva de ninguna.
- Todo texto en Besley va en peso 700: titulares, cifras de altitud y nombre del sitio. No hay
  Besley en otro peso; si un diseño futuro lo necesita, es un archivo más y se decide aquí.
- Solo se precarga Besley, porque dibuja el titular del hero.
- Las pilas de respaldo están en los tokens (`--font-display`, `--font-sans`). Son respaldo de
  carga, no una opción de diseño.
- El mecanismo de carga está decidido en el ADR 0007 (fuentes autoalojadas sin dependencia).

---

## 4. Color

La paleta sale del territorio y cada piso térmico tiene su color.

### 4.1 Paleta base

| Nombre | Hex | Token | Uso |
|---|---|---|---|
| Papel | `#F5F6F0` | `--color-bg` | Fondo de página. Frío, sin tono crema |
| Superficie | `#E9ECE1` | `--color-surface` | Fichas, panel del mapa, sección de contacto |
| Tinta | `#1D2B26` | `--color-ink` | Texto principal; fondo del visor y del pie |
| Tinta suave | `#4C5A53` | `--color-ink-muted` | Texto secundario; borde de la caja del mapa |
| Línea | `#C9CFC2` | `--color-line` | Líneas decorativas y curvas de nivel |
| Blanco | `#FFFFFF` | `--color-white` | Texto sobre colores de piso |
| Cafetal | `#2F5D43` | `--color-primary` | Enlaces, botón secundario, mensajes de éxito |
| Guayacán | `#E0A526` | `--color-accent` | Botón principal y foco sobre tinta. Solo relleno |
| Error | `#A3271C` | `--color-danger` | Errores de carga |

### 4.2 Pisos térmicos

Los umbrales de altitud son los de la clasificación habitual y quedan **por verificar por
content-curator**.

| Piso | Altitud (por verificar) | Color fuerte | Token | Tinte | Token | Origen |
|---|---|---|---|---|---|---|
| Cálido | menos de 1000 m | `#7A4E0E` | `--color-zone-warm` | `#F6EBCF` | `--color-zone-warm-tint` | Tierra de cañón |
| Templado | 1000 a 2000 m | `#2F5D43` | `--color-zone-temperate` | `#E1EBDD` | `--color-zone-temperate-tint` | Cafetal |
| Frío | 2000 a 3000 m | `#33626F` | `--color-zone-cold` | `#DDE9EA` | `--color-zone-cold-tint` | Bosque de niebla |
| Páramo | más de 3000 m | `#5F4F70` | `--color-zone-paramo` | `#E8E3EC` | `--color-zone-paramo-tint` | Frailejón al atardecer |

- **Color fuerte:** texto de piso, líneas de ruta, insignias, franja de la regla de altitud.
- **Tinte:** fondo de la lámina sin fotografía y de los estratos del perfil del hero. Siempre
  plano. Los bloques de piso van sobre papel, sin fondo de tinte: una lámina sobre un bloque de
  su mismo tinte perdería el contorno.
- El piso nunca se comunica solo con color: siempre va con su nombre o su cifra de altitud.

### 4.3 Pares de contraste

Todos los pares de texto del sitio. Umbral AA: 4.5:1 para texto, 3:1 para componentes y gráficos.
Cálculo en el anexo A. Estado de todos: **calculado paso a paso y recalculado con script el 2026-10-10**; falta la
comprobación con axe sobre el sitio construido.

| Texto | Fondo | Razón | Cumple |
|---|---|---|---|
| Tinta | Papel | 13.5:1 | AA |
| Tinta | Superficie | 12.3:1 | AA |
| Tinta suave | Papel | 6.6:1 | AA |
| Tinta suave | Superficie | 6.0:1 | AA |
| Cafetal | Papel | 6.9:1 | AA |
| Cafetal | Superficie | 6.3:1 | AA |
| Blanco | Cafetal | 7.5:1 | AA |
| Tinta | Guayacán | 6.7:1 | AA |
| Error | Papel | 6.7:1 | AA |
| Error | Superficie | 6.1:1 | AA |
| Blanco | Error | 7.3:1 | AA |
| Piso cálido | Papel | 6.6:1 | AA |
| Piso cálido | Superficie | 6.0:1 | AA |
| Piso cálido | Tinte cálido | 6.0:1 | AA |
| Blanco | Piso cálido | 7.1:1 | AA |
| Piso templado | Tinte templado | 6.1:1 | AA |
| Piso frío | Papel | 6.1:1 | AA |
| Piso frío | Superficie | 5.6:1 | AA |
| Piso frío | Tinte frío | 5.4:1 | AA |
| Blanco | Piso frío | 6.7:1 | AA |
| Páramo | Papel | 6.8:1 | AA |
| Páramo | Superficie | 6.1:1 | AA |
| Páramo | Tinte páramo | 5.8:1 | AA |
| Blanco | Páramo | 7.3:1 | AA |
| Tinta | Tinte cálido | 12.4:1 | AA |
| Tinta | Tinte templado | 12.0:1 | AA |
| Tinta | Tinte frío | 11.8:1 | AA |
| Tinta | Tinte páramo | 11.6:1 | AA |
| Tinta suave | Tinte cálido | 6.1:1 | AA |
| Tinta suave | Tinte templado | 5.9:1 | AA |
| Tinta suave | Tinte frío | 5.8:1 | AA |
| Tinta suave | Tinte páramo | 5.7:1 | AA |
| Papel | Tinta | 13.5:1 | AA |
| Línea | Tinta | 9.2:1 | AA |
| Guayacán (anillo de foco) | Tinta | 6.7:1 | AA (3:1) |

Pares **prohibidos**, porque no cumplen:

| Par | Razón | Regla |
|---|---|---|
| Guayacán sobre papel | 2.0:1 | El guayacán nunca es texto, línea ni borde sobre fondo claro. Siempre es relleno, con tinta encima y borde de tinta |
| Línea sobre papel | 1.4:1 | La línea es decorativa. Nunca es la única señal de un campo, un botón o un límite con significado |
| Blanco sobre guayacán | no calculado | No se usa |

Pendiente aparte: el contraste de las líneas de ruta sobre las teselas del mapa depende del estilo
de las teselas y debe medirse en la feature del mapa. El tratamiento de las teselas (escala de
grises, contraste, brillo y opacidad sobre papel) está en los tokens `--map-tiles-filter` y
`--map-tiles-opacity`; son valores de partida que se ajustan con esa medición.

### 4.4 De dónde sale el calor

El humano pidió un tono menos frío. La paleta lo resuelve con cuatro decisiones:

1. **El botón principal es guayacán**, el único color cálido y saturado del sitio. Aparece poco y
   siempre donde se actúa.
2. **El piso cálido abre la secuencia de destinos**, así que el primer color de piso que ve el
   visitante en el listado es el cálido.
3. **La tinta es verde oscuro**, no negro ni gris neutro.
4. **Besley** aporta formas redondeadas y robustas en los titulares.

---

## 5. Composición, textura y movimiento

### 5.1 Grilla

| Ancho | Columnas | Canal | Margen lateral |
|---|---|---|---|
| 360 a 767 px | 4 | 16 px | 20 px |
| 768 a 1023 px | 8 | 24 px | 32 px |
| 1024 px o más | 12 | 24 px | 48 px; contenido máximo 1200 px |

- **Regla de altitud.** Desde 1024 px, las dos primeras columnas son una columna fija que marca en
  qué piso térmico está cada bloque: nombre del piso, rango de altitud y franja de color. En
  móvil se reduce a una franja de 6 px del color del piso al borde izquierdo, con el nombre del
  piso sobre el bloque.
- **Bloques de piso.** Van sobre papel. Su identidad la dan la regla de altitud y el nombre del
  piso, no un fondo de color.
- **Separación entre secciones:** 64 px en móvil, 96 px en escritorio.
- **Espaciado:** solo los pasos de la escala de `tokens.css`.

### 5.2 Orden y jerarquía de los destinos

- Los destinos se ordenan por altitud ascendente: la página sube al desplazarse, del piso cálido
  al páramo. Es una secuencia real, por eso lleva cifras.
- Dentro de cada piso hay un destino principal, a mayor tamaño, y los demás menores. No hay
  cuadrícula de tarjetas idénticas.
- Un piso sin destinos no se muestra.

### 5.3 Textura

- La única textura son las **curvas de nivel**: líneas finas en color de línea, dibujadas en SVG.
- Aparecen en el hero y en la lámina sin fotografía (sección 6.5). En ningún otro lugar.
- Los fondos son planos. Los radios son mínimos: 2 px en fotografías, 4 px en controles.
- Solo proyectan sombra los controles que flotan sobre el mapa (acercar, alejar y "Ver todas las
  rutas"), con `--shadow-overlay`. El mapa no tiene ventana emergente y el visor no lleva sombra:
  sus controles van sobre tinta opaca.

### 5.4 Movimiento

| Momento | Qué pasa | Duración | Con movimiento reducido |
|---|---|---|---|
| Carga del hero | El perfil altitudinal aparece de izquierda a derecha, una vez: una cubierta del color del papel se retira hacia la derecha | 900 ms | Aparece ya dibujado |
| Hover, foco, activo | Cambia el color | 150 ms | Cambio inmediato |
| Abrir o cerrar el visor | Cambia la opacidad | 250 ms | Cambio inmediato |

- La aparición del perfil es el único movimiento que no responde a una acción del usuario.
- No se anima el trazo del SVG: el perfil se estira a lo ancho con grosores fijos y, en esa
  situación, los navegadores no calculan igual la longitud del trazo.
- No hay animaciones al desplazarse, ni parallax, ni entradas por sección.
- Solo se animan opacidad y transformaciones. Nada que recalcule la disposición.
- Sin JavaScript y sin CSS de animación, el perfil está completo: el estado dibujado es el estado
  por defecto y la animación parte de él.
- Toda duración sale de los tokens `--duration-*`, que valen cero con `prefers-reduced-motion`.

### 5.5 Ficha de salida

Cada destino y cada ruta muestran los mismos datos, en este orden, con su etiqueta escrita:

| Dato | Formato | Para quién importa más |
|---|---|---|
| Altitud | "1750 m", con el nombre del piso | Todos |
| Clima habitual | "Entre 16 y 24 °C" | Extranjeros |
| Cómo llegar | "A 3 horas de Medellín por carretera" | Extranjeros |
| Duración | "5 horas" o "2 días" | Familias |
| Distancia y desnivel | "8 km, 400 m de subida" | Todos |
| Dificultad | "Fácil", "Moderada" o "Exigente" | Familias |
| Edad sugerida | "Apta desde los 6 años" | Familias |

- **Dificultad:** se muestra con la palabra y con una a tres marcas rellenas, todas en tinta. No
  usa colores de semáforo: el color está reservado para los pisos.
- Las etiquetas son información, no adorno: van en minúscula, peso 500, junto a su dato.
- Un dato que falta no se muestra; no se escribe "N/D".
- Los valores de ejemplo de la tabla ilustran el formato. No son datos reales.

### 5.6 Accesibilidad

- **Objetivos táctiles:** mínimo 44 × 44 px (`--size-touch-target`), incluidos los puntos del
  perfil, los marcadores del mapa y los controles del visor.
- **Única excepción: los enlaces del crédito de una foto.** Van dentro de una línea de texto de
  14 px y se acogen a la excepción "en línea" del criterio 2.5.8 de WCAG 2.2 (tamaño del
  objetivo, nivel AA). Aun así, cada uno tiene un área activa de al menos 24 × 24 px y queda a 8
  px o más del otro (sección 6.2).
- **Foco visible:** anillo de 3 px separado 2 px. Tinta sobre fondos claros; guayacán sobre tinta.
  Nunca se elimina el contorno sin reemplazarlo.
- **Color:** ninguna información depende solo del color. Las rutas del mapa se distinguen también
  por patrón de trazo y por nombre.
- **Campos de formulario** (el primer lanzamiento no tiene formulario; aplica si se añade uno):
  borde de tinta suave (6.6:1 sobre papel), nunca de color de línea.

### 5.7 Notas del proyecto (modo de ejercicio académico)

Añadido el 2026-10-11; aprobado por el humano el 2026-10-11 junto con la sección S14 del `design.md`
de la feature 001.

Cuando el sitio se declara ejercicio académico, lo dice con **notas del proyecto**: una franja
sobre la cabecera de todas las páginas, una aclaración en el contacto y un rótulo en las páginas
legales.

- Trato único: texto en tinta sobre superficie, con una línea inferior de 2 px en tinta. Sin
  iconos, sin color de error ni guayacán, sin botón para cerrar, sin animación.
- Tono de nota al pie de una lámina: dice qué es el sitio, sin alarma y sin publicidad.
- La franja no queda fija al desplazarse y no compite con el titular del hero: 14 px, peso 500.
- Textos, posición y medidas: sección S14 de `specs/001-landing-completa/design.md`.

---

## 6. Fotografía

El proyecto **no tiene fotografía propia**. La dirección se sostiene sin ella por tres vías: el
hero no usa fotos, las fotos disponibles se tratan con un sistema uniforme, y un destino sin
fotos tiene una presentación completa y deliberada.

### 6.1 Fuentes permitidas

| Fuente | Licencias aceptadas | Nota |
|---|---|---|
| Wikimedia Commons (fuente preferida) | CC0, dominio público, CC BY, CC BY-SA | Suele traer lugar y autor documentados |
| Flickr | CC0, CC BY, CC BY-SA | Verificar la licencia en la página de la foto |
| iNaturalist | CC0, CC BY | Útil para flora y fauna con localidad registrada |

**No se aceptan:**

- Licencias con "NC" (no comercial): el sitio promueve un servicio comercial.
- Licencias con "ND" (sin obras derivadas): el sitio recorta y redimensiona las fotos.
- Imágenes sin licencia explícita, capturas de redes sociales o de otros sitios.
- Imágenes generadas por IA.
- Bancos de imágenes sin ubicación comprobable.

El humano aceptó el uso de fotos CC BY-SA en este sitio (2026-10-10). Este documento no es
asesoría legal.

### 6.2 Atribución obligatoria

- Cada foto muestra su crédito **visible**, junto a la imagen o en el pie del visor: autor,
  licencia con enlace y enlace a la fuente. Tamaño 14 px, tinta suave.
- El crédito es una sola línea de texto ("Foto: autor. Licencia. Fuente."), con interlineado de
  24 px (`--space-6`). Si no cabe, sigue en la línea siguiente como cualquier texto.
- Sus dos enlaces no miden 44 px: tienen un área activa de al menos 24 × 24 px y 8 px o más de
  separación entre sí (excepción de la sección 5.6).
- Si la foto fue recortada, el crédito lo dice ("recortada").
- El texto alternativo describe la imagen; no repite el crédito.

**Requisito de datos** (entra por spec y plan; este documento no modifica esquemas): cada imagen
necesita autor, nombre y URL de la licencia, URL de la fuente y si fue modificada. Una imagen sin
esos datos no se publica.

### 6.3 Criterios de selección

1. **Lugar comprobable.** La foto es de Antioquia y del destino que ilustra, según su descripción
   o sus coordenadas. Ante la duda, se descarta.
2. **Muestra relieve.** Se prefieren fotos donde se lee la montaña: laderas, cañones, niebla
   entre cerros. Es lo que conecta la imagen con la idea de altitud.
3. **Luz natural y color creíble.** Sin HDR marcado, saturación forzada, filtros ni viñetas.
4. **Limpia.** Sin marcas de agua, textos sobrepuestos ni marcos.
5. **Resolución suficiente.** Lado mayor de al menos 2000 px para usarla en tamaño grande; al
   menos 1200 px para tamaño menor. El tamaño menor llega hasta 480 px de ancho mostrado
   (`--size-photo-small`). Una foto nunca se muestra por encima de su resolución.
6. **Sin personas identificables**, salvo que la fuente documente su consentimiento.
7. **Variedad por piso.** Cada piso térmico debe verse distinto de los otros.

### 6.4 Tratamiento

- A color, sin filtros ni velos de color. No se unifican las fotos con un tono común.
- Tres proporciones permitidas: 3:2, 4:5 y 1:1. El recorte lo elige `content-curator`.
- Radio de 2 px. Sin sombras, sin bordes.
- Ningún texto va sobre una fotografía.
- Lo que unifica fotos de autores y calidades distintas no es un filtro: son las proporciones
  fijas, el pie con lugar y altitud, y la franja de color del piso.

### 6.5 Destinos con pocas fotos o ninguna

| Fotos del destino | Cómo se ve |
|---|---|
| Ninguna | **Lámina de altitud**: en el lugar de la foto, un bloque del tinte de su piso con curvas de nivel, la cifra de altitud en Besley y el nombre del piso. La cifra mide 52 px en láminas de 480 px de ancho o más, 42 px de 280 a 479 px, 33 px de 140 a 279 px y 21 px por debajo. Mismas proporciones que una foto |
| Una o dos | La foto se muestra en tamaño menor junto a la ficha. No hay carrusel ni controles de galería para ese destino |
| Tres o más | Tratamiento completo: una foto principal y las demás en la galería |
| Solo fotos de baja resolución | Se usan únicamente en tamaño menor; el lugar principal lo ocupa la lámina de altitud |

- La lámina de altitud **no es un estado de error ni un marcador de "imagen no disponible"**. Es
  una presentación de pleno derecho, y un destino con lámina tiene la misma jerarquía que uno con
  foto.
- Hay cuatro láminas, una por piso, con un dibujo de curvas de nivel distinto cada una. No se
  genera un dibujo por destino.
- El destino principal de un piso puede ser una lámina.
- **Galería:** agrupa las fotos por piso. Un piso con menos de tres fotos comparte fila con el
  piso contiguo, y cada foto conserva su etiqueta de piso. Un piso sin fotos no aparece en la
  galería.
- **Galería vacía:** si ningún destino tiene fotos, la sección de galería no se publica.

Con esto el sitio se lee completo aunque el primer lanzamiento tenga pocas imágenes, y mejora sin
rediseño a medida que se suman fotos.

---

## 7. Hero

**Elemento que abre la página:** un perfil altitudinal de Antioquia, en SVG en línea.

- Va del punto más bajo del departamento al más alto. Las cifras del ejemplo (125 m y 4080 m)
  son **por verificar por content-curator**, igual que la altitud de cada destino.
- Es una montaña en corte, no un gráfico: una silueta rellena. Las cuatro bandas de piso térmico
  son estratos planos de su tinte dentro de la silueta, cada una con su nombre; el cielo es papel
  liso, sin ejes ni líneas.
- Cada destino es un punto sobre el perfil, a su altitud, con su nombre (solo el nombre; la
  altitud se anuncia al lector de pantalla). Cada punto es un enlace real a la ficha del destino,
  con un área táctil de 44 px.
- El perfil es esquemático: ordena los destinos por altura. No pretende ser un corte geográfico a
  escala, y el sitio no lo presenta como tal.
- Se genera con código a partir de los datos. La geometría exacta, las etiquetas y el layout por
  ancho están en la sección S3 de `specs/001-landing-completa/design.md`, que es la referencia
  para construirlo.

**Contenido, en orden:**

1. Titular en Besley: "Antioquia, de 125 a 4080 metros de altitud" (cifras por verificar).
2. La explicación, en dos párrafos: "En la montaña tropical el clima cambia con la altura." y
   "Cada franja de altura es un piso térmico. Elige a qué altura quieres caminar."
3. Botón principal en guayacán: "Ver destinos".
4. El perfil.

En todos los anchos el contenido va apilado en ese orden, con el perfil debajo del texto; no hay
texto superpuesto al perfil.

- **Móvil:** el perfil va debajo del botón, a sangre, y muestra como máximo cinco puntos: el
  destino principal de cada piso más el más alto de los restantes. Todos los destinos siguen
  disponibles en la sección siguiente.
- **Animación:** al cargar, una cubierta del color del papel se retira hacia la derecha en 900 ms
  y descubre el perfil (sección 5.4).
- **Sin JavaScript:** el hero es idéntico; no usa JavaScript.
- **Rendimiento:** el elemento más grande de la primera pantalla es el titular. No hay imagen de
  hero que cargar.
- **Lector de pantalla:** el SVG tiene un nombre accesible breve, y los destinos se exponen como
  una lista de enlaces con nombre y altitud.
- **Trato:** la interfaz usa "tú" en el texto corrido y el infinitivo en los botones.

**Requisito de datos** (entra por spec y plan): cada destino necesita su altitud en metros y cada
ruta su elevación (mínima, máxima y, si es posible, por punto). Sin altitud, un destino no puede
ubicarse en el perfil ni en la secuencia.

---

## 8. Prohibiciones

Este sitio no hará nada de lo siguiente.

**Color y fondo**

- Degradados, ni decorativos ni entre pisos térmicos. Todo color es plano.
- Fondo crema o negro.
- Guayacán como texto, línea o borde sobre fondo claro.
- Colores de semáforo para la dificultad.
- Colores fuera de `tokens.css`.

**Tipografía**

- Fuentes del sistema como elección de diseño, o una tercera familia.
- Tipografía manuscrita o monoespaciada.
- Rótulos en mayúsculas espaciadas sobre los títulos.
- Una palabra del titular resaltada con otro color, peso o cursiva.
- Texto centrado o justificado.

**Composición**

- Cuadrícula de tarjetas idénticas sin jerarquía.
- Numeración decorativa. Las únicas cifras son datos: altitud, distancia, duración.
- Flechas añadidas al texto de enlaces y botones.
- Datos unidos con puntos medios.
- Sombras bajo tarjetas o fotos.

**Referente cartográfico**

- Papel envejecido, manchas de acuarela simuladas, bordes rasgados.
- Brújulas, rosas de los vientos o cartelas ornamentales.
- Presentar el perfil del hero como un corte geográfico exacto.

**Fotografía**

- Texto sobre fotografía.
- Filtros, velos de color o tonos unificados.
- Imágenes sin licencia verificada, sin crédito visible, generadas por IA o de fuera de Antioquia.
- Un marcador gris de "imagen no disponible".

**Movimiento**

- Animaciones al desplazarse, parallax, video de fondo.
- Entradas con desvanecido y desplazamiento en cada sección.
- Animación que ignore `prefers-reduced-motion`.

**Lenguaje**

- Regionalismos sin explicar.
- Cifras sin unidad o precios sin moneda.
- Altitudes publicadas sin verificar.

---

## 9. Notas para las fases siguientes

Este documento no modifica código ni esquemas. Deja estos requisitos para spec y plan:

| Requisito | Quién lo recoge |
|---|---|
| Importar `tokens.css` desde `src/styles/global.css`, después de `@import "tailwindcss";` | `astro-developer` |
| Altitud por destino; elevación por ruta | `spec-writer`, `software-architect` |
| Piso térmico de cada destino, derivado de la altitud | `software-architect` |
| Datos de ficha: clima, cómo llegar, duración, distancia, desnivel, dificultad, edad sugerida | `spec-writer` |
| Datos de atribución por imagen: autor, licencia, fuente, modificada | `spec-writer`, `content-curator` |
| Verificar todas las altitudes y los umbrales de los pisos | `content-curator` |
| Mecanismo de carga de las dos fuentes, con ADR si implica una dependencia | `software-architect` |
| Comprobar con axe, sobre el sitio construido, los pares de la sección 4.3 | `qa-engineer` |
| Perfil del hero y cuatro láminas de altitud, generados con código (sección 10) | `ui-designer` (forma), `software-architect`, `astro-developer` |

Las duraciones no son un espacio de nombres de Tailwind v4: `--duration-fast`, `--duration-base`
y `--duration-draw` se usan con `var()` o con la sintaxis de valor arbitrario de las utilidades.
Lo mismo aplica a `--space-*`, cuyos pasos coinciden con la escala numérica de Tailwind
(`--space-4` equivale a `p-4`).

---

## 10. Preguntas abiertas

1. **Teselas del mapa.** Esta dirección pide teselas de OpenStreetMap desaturadas para que las
   rutas destaquen. Falta comprobar, sobre el mapa construido, que las etiquetas sigan legibles.

### Decisiones tomadas por el humano (2026-10-10)

- **Licencias:** se aceptan fotos CC BY-SA, además de CC0, dominio público y CC BY.
- **Trato:** "tú" en el texto corrido e infinitivo en los botones.
- **Paleta de Tailwind:** se mantiene vaciada; solo existen las utilidades de los tokens.
- **Perfil y láminas sin ilustrador:** no se dibujan a mano; se generan con código a partir de
  datos. El perfil del hero sale, en el build, de una función pura de `src/lib/` que recibe los
  destinos con su altitud y devuelve el trazado SVG (bandas de piso y un punto por destino). Las
  cuatro láminas son patrones de curvas de nivel generados por código, uno fijo por piso. La
  forma exacta la especifica `ui-designer` en el `design.md` de la feature. Plan de respaldo si
  el perfil generado no convence: una regla vertical de altitud, sin silueta de montaña.
- **Canal de contacto:** WhatsApp como canal principal más correo visible; sin formulario en el
  primer lanzamiento.
- **Página de créditos:** sí, enlazada desde el pie, además del crédito junto a cada foto.
- **Otros idiomas:** fuera de alcance del primer lanzamiento; el contenido es solo en español.
- **Crédito de las fotos:** en una línea, con enlaces de 24 px de área activa, por la excepción
  "en línea" de WCAG 2.2 (2.5.8). Es la única excepción a los 44 px (secciones 5.6 y 6.2).
- **Tokens añadidos:** `--size-photo-small`, `--map-tiles-filter` y `--map-tiles-opacity`.
- **Ajustes aceptados con el diseño de la feature 001:** bloques de piso sin fondo de tinte
  (secciones 4.2 y 5.1); dos tamaños menores para la cifra de la lámina (secciones 3.1 y 6.5);
  el perfil aparece con una cubierta que se retira, no con un trazo animado (secciones 5.4 y 7).
- **Revisión con captura:** el perfil y las láminas se revisan ya construidos, durante la
  implementación, con aprobación humana. Ahí se decide si aplica el plan de respaldo.

---

## Anexo A. Cálculo de contraste

**Estado: calculado paso a paso y recalculado con script el 2026-10-10; las razones coinciden.** Los valores
están redondeados a cuatro decimales, y las razones de la sección 4.3 están truncadas a un
decimal. El par más ajustado (piso frío sobre su tinte, 5.42:1) queda lejos de 4.5:1, así que un
error de redondeo no cambia ningún resultado.

### A.1 Fórmula (WCAG 2.2)

- Canal lineal: `c = ((v + 14.025) / 269.025) ^ 2.4`, con `v` de 0 a 255. Equivale a
  `((v/255 + 0.055) / 1.055) ^ 2.4`. Todos los canales usados superan el umbral de la rama lineal.
- Luminancia relativa: `L = 0.2126·R + 0.7152·G + 0.0722·B`.
- Contraste: `(L clara + 0.05) / (L oscura + 0.05)`.

### A.2 Canales linealizados

| v | lineal | v | lineal | v | lineal |
|---|---|---|---|---|---|
| 14 | 0.0044 | 79 | 0.0782 | 201 | 0.5841 |
| 28 | 0.0116 | 83 | 0.0865 | 207 | 0.6240 |
| 29 | 0.0123 | 90 | 0.1022 | 221 | 0.7231 |
| 38 | 0.0194 | 93 | 0.1095 | 224 | 0.7454 |
| 39 | 0.0203 | 95 | 0.1144 | 225 | 0.7529 |
| 43 | 0.0242 | 98 | 0.1221 | 227 | 0.7682 |
| 47 | 0.0284 | 111 | 0.1590 | 232 | 0.8070 |
| 51 | 0.0331 | 112 | 0.1620 | 233 | 0.8148 |
| 67 | 0.0561 | 122 | 0.1946 | 234 | 0.8228 |
| 76 | 0.0723 | 163 | 0.3663 | 235 | 0.8308 |
| 78 | 0.0762 | 165 | 0.3763 | 236 | 0.8388 |
| | | 194 | 0.5395 | 240 | 0.8714 |
| | | | | 245 | 0.9131 |
| | | | | 246 | 0.9216 |
| | | | | 255 | 1.0000 |

### A.3 Luminancia de cada color

| Color | Hex | R, G, B | 0.2126·R + 0.7152·G + 0.0722·B | L |
|---|---|---|---|---|
| Papel | `#F5F6F0` | 245, 246, 240 | 0.1941 + 0.6591 + 0.0629 | 0.9162 |
| Superficie | `#E9ECE1` | 233, 236, 225 | 0.1732 + 0.5999 + 0.0544 | 0.8275 |
| Tinta | `#1D2B26` | 29, 43, 38 | 0.0026 + 0.0173 + 0.0014 | 0.0213 |
| Tinta suave | `#4C5A53` | 76, 90, 83 | 0.0154 + 0.0731 + 0.0062 | 0.0947 |
| Línea | `#C9CFC2` | 201, 207, 194 | 0.1242 + 0.4463 + 0.0390 | 0.6094 |
| Blanco | `#FFFFFF` | 255, 255, 255 | 0.2126 + 0.7152 + 0.0722 | 1.0000 |
| Cafetal, piso templado | `#2F5D43` | 47, 93, 67 | 0.0060 + 0.0783 + 0.0041 | 0.0884 |
| Guayacán | `#E0A526` | 224, 165, 38 | 0.1585 + 0.2691 + 0.0014 | 0.4290 |
| Error | `#A3271C` | 163, 39, 28 | 0.0779 + 0.0145 + 0.0008 | 0.0932 |
| Piso cálido | `#7A4E0E` | 122, 78, 14 | 0.0414 + 0.0545 + 0.0003 | 0.0962 |
| Piso frío | `#33626F` | 51, 98, 111 | 0.0070 + 0.0874 + 0.0115 | 0.1059 |
| Páramo | `#5F4F70` | 95, 79, 112 | 0.0243 + 0.0559 + 0.0117 | 0.0920 |
| Tinte cálido | `#F6EBCF` | 246, 235, 207 | 0.1959 + 0.5942 + 0.0451 | 0.8352 |
| Tinte templado | `#E1EBDD` | 225, 235, 221 | 0.1601 + 0.5942 + 0.0522 | 0.8065 |
| Tinte frío | `#DDE9EA` | 221, 233, 234 | 0.1537 + 0.5827 + 0.0594 | 0.7959 |
| Tinte páramo | `#E8E3EC` | 232, 227, 236 | 0.1716 + 0.5494 + 0.0606 | 0.7815 |

### A.4 Razones

| Par (claro / oscuro) | (L clara + 0.05) / (L oscura + 0.05) | Razón |
|---|---|---|
| Papel / Tinta | 0.9662 / 0.0713 | 13.55 |
| Superficie / Tinta | 0.8775 / 0.0713 | 12.31 |
| Papel / Tinta suave | 0.9662 / 0.1447 | 6.68 |
| Superficie / Tinta suave | 0.8775 / 0.1447 | 6.06 |
| Papel / Cafetal | 0.9662 / 0.1384 | 6.98 |
| Superficie / Cafetal | 0.8775 / 0.1384 | 6.34 |
| Blanco / Cafetal | 1.0500 / 0.1384 | 7.59 |
| Guayacán / Tinta | 0.4790 / 0.0713 | 6.72 |
| Papel / Error | 0.9662 / 0.1432 | 6.75 |
| Superficie / Error | 0.8775 / 0.1432 | 6.13 |
| Blanco / Error | 1.0500 / 0.1432 | 7.33 |
| Papel / Piso cálido | 0.9662 / 0.1462 | 6.61 |
| Superficie / Piso cálido | 0.8775 / 0.1462 | 6.00 |
| Tinte cálido / Piso cálido | 0.8852 / 0.1462 | 6.06 |
| Blanco / Piso cálido | 1.0500 / 0.1462 | 7.18 |
| Tinte templado / Piso templado | 0.8565 / 0.1384 | 6.19 |
| Papel / Piso frío | 0.9662 / 0.1559 | 6.20 |
| Superficie / Piso frío | 0.8775 / 0.1559 | 5.63 |
| Tinte frío / Piso frío | 0.8459 / 0.1559 | 5.43 |
| Blanco / Piso frío | 1.0500 / 0.1559 | 6.74 |
| Papel / Páramo | 0.9662 / 0.1420 | 6.81 |
| Superficie / Páramo | 0.8775 / 0.1420 | 6.18 |
| Tinte páramo / Páramo | 0.8315 / 0.1420 | 5.86 |
| Blanco / Páramo | 1.0500 / 0.1420 | 7.40 |
| Tinte cálido / Tinta | 0.8852 / 0.0713 | 12.41 |
| Tinte templado / Tinta | 0.8565 / 0.0713 | 12.01 |
| Tinte frío / Tinta | 0.8459 / 0.0713 | 11.86 |
| Tinte páramo / Tinta | 0.8315 / 0.0713 | 11.66 |
| Tinte cálido / Tinta suave | 0.8852 / 0.1447 | 6.12 |
| Tinte templado / Tinta suave | 0.8565 / 0.1447 | 5.92 |
| Tinte frío / Tinta suave | 0.8459 / 0.1447 | 5.85 |
| Tinte páramo / Tinta suave | 0.8315 / 0.1447 | 5.75 |
| Línea / Tinta | 0.6594 / 0.0713 | 9.25 |
| Papel / Guayacán (prohibido) | 0.9662 / 0.4790 | 2.02 |
| Papel / Línea (decorativo) | 0.9662 / 0.6594 | 1.47 |

### A.5 Ajustes hechos por este cálculo

| Color | Antes | Ahora | Motivo |
|---|---|---|---|
| Piso frío | `#3F6E7A` | `#33626F` | Cumplía sobre papel (5.19) pero quedaba en 4.71 sobre superficie y más bajo sobre su tinte. Se oscureció para dejar margen |
| Páramo | `#6B5B7B` | `#5F4F70` | Cumplía (5.67 sobre papel), pero con poco margen sobre su tinte. Se oscureció |
| Piso cálido | solo guayacán `#E0A526`, como relleno | se añade `#7A4E0E` como color fuerte | El guayacán da 2.02 sobre papel y no sirve para texto ni para líneas de ruta |

---

Aprobado por el humano el 2026-10-10
