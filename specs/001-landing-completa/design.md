# 001 — Diseño de interfaz

Spec: [spec.md](./spec.md) · Dirección visual: [direccion-visual.md](../../docs/design/direccion-visual.md)

Este documento fija layout, estados, interacciones y textos de interfaz de la landing completa.
No decide arquitectura: nombres de archivos, librerías y mecanismos son de `software-architect`.

Estado: APROBADO por el humano el 2026-10-10. Sus decisiones están al final, en "Decisiones del
humano".

**Adición del 2026-10-11, aprobada por el humano el 2026-10-11:** el modo de ejercicio académico (S14),
con sus remisiones en S2, S3.1, S10 y S11, sus filas en "Estados" y en "Trazabilidad", y una
línea nueva en la dirección visual (sección 5.7). Todo lo demás conserva su aprobación.

**Revisión con capturas (T-058), ajustes aprobados por el humano el 2026-10-11 (R1 a R18, incluido R11 y R12); la aprobación final de CA-124 se da sobre capturas nuevas:** está al final, antes de
"Pendiente". Propone ajustes a S2, S3.4, S3.5, S3.7 y S6.3, que no cambian hasta aprobarse.

**Punto de control obligatorio: revisión con captura.** La geometría del perfil del hero (S3) y
de las láminas (S6.3) está especificada con fórmulas, pero no se ha renderizado: en la fase de
diseño no hay forma de dibujarla. Durante la implementación, antes de darla por cerrada:

1. Se construyen el perfil (sus tres variantes) y las cuatro láminas con contenido real o de
   prueba, y se capturan a 360 px, 768 px y 1280 px de ancho.
2. Se comparan con los criterios visuales de S3.3 y de la tabla "Qué debe verse" de S6.3. Los
   parámetros de las fórmulas son ajustables para cumplirlos; cualquier ajuste se anota en este
   documento.
3. **El humano revisa las capturas y aprueba.** En esa revisión decide si el perfil se queda o si
   aplica el respaldo de S3.10.

La implementación del hero y de las láminas no se considera terminada sin esa aprobación.

Referencias: las secciones de este documento se citan como S1 a S14; los criterios de la spec como
CA-n.

---

## Secciones

### S1. Base común

**Rangos de ancho**

| Nombre | Ancho de ventana | Columnas | Canal | Margen lateral |
|---|---|---|---|---|
| Móvil | 360 a 767 px | 4 | 16 px | 20 px |
| Tableta | 768 a 1023 px | 8 | 24 px | 32 px |
| Escritorio | 1024 px o más | 12 | 24 px | 48 px; contenido máximo 1200 px |

- A 320 px (reflujo, CA-111) vale el layout móvil con el mismo margen.
- Separación entre secciones: 64 px en móvil y tableta, 96 px en escritorio.
- Todo el texto va alineado a la izquierda. El texto corrido no pasa de 70 caracteres.

**Regla de altitud.** Es el recurso que une listado, detalle y galería (CA-16).

| Rango | Forma |
|---|---|
| Escritorio | Columnas 1 y 2 fijas a la izquierda del bloque: franja vertical de 6 px del color fuerte del piso, nombre del piso (17 px, peso 500, color fuerte) y debajo su rango ("De 1000 a 2000 m", 14 px, tinta suave). El contenido ocupa las columnas 3 a 12 |
| Tableta y móvil | Franja de 6 px del color fuerte en el borde izquierdo del bloque, de toda su altura. Encima del contenido, el nombre del piso y su rango en una línea. El contenido deja 16 px libres a la derecha de la franja |

Los bloques de piso van sobre papel, sin fondo de tinte. La dirección visual permite el tinte como
fondo de bloque; aquí se reserva para las láminas y para el interior del perfil, porque una lámina
de tinte sobre un bloque del mismo tinte perdería su contorno.

**Jerarquía de encabezados** (CA-95)

| Página | h1 | h2 | h3 | h4 |
|---|---|---|---|---|
| Inicio | Titular del hero | Destinos, Galería, Mapa de rutas, Contacto | Nombre de cada piso; grupos de la galería; "Ruta seleccionada", "Todas las rutas" | Nombre de cada destino; nombre de cada ruta |
| Detalle | Nombre del destino | "Datos de la salida", "Fotos de {destino}", "Rutas de {destino}", llamada a contacto | Nombre de cada ruta | — |
| Legales, créditos, 404 | Título de la página | Apartados | — | — |

**Controles**

| Control | Reposo | Hover | Activo | Foco |
|---|---|---|---|---|
| Botón principal | Relleno guayacán, texto tinta de peso 600, borde de 2 px tinta, radio 4 px, alto mínimo 48 px, relleno lateral 24 px | Relleno tinta, texto papel | Relleno tinta suave, texto papel | Anillo de 3 px tinta, separado 2 px |
| Botón secundario | Sin relleno, borde de 2 px cafetal, texto cafetal de peso 600, alto mínimo 44 px | Relleno cafetal, texto blanco | Relleno tinta, texto papel | Igual |
| Enlace de texto | Cafetal, subrayado de 1 px | Tinta, subrayado de 2 px | Tinta | Igual |
| Enlace o botón sobre tinta | Texto papel, subrayado o borde de 1 px en línea | Relleno papel, texto tinta | Igual que hover | Anillo de 3 px guayacán, separado 2 px |

- Los cambios de color duran `--duration-fast`. Nada se desplaza ni cambia de tamaño al pasar el
  cursor.
- Todo objetivo táctil mide al menos 44 × 44 px (CA-110). Un enlace suelto dentro de un texto,
  como el correo de contacto, alcanza los 44 px de alto con relleno vertical, sin cambiar el
  tamaño de la letra.
- Única excepción: los dos enlaces del crédito de una foto, que miden 24 px (S6.2).
- Ningún botón ni enlace lleva flecha, y ninguno dice solo "Ver más".
- No hay desplazamiento animado: los enlaces internos saltan a su sección de inmediato (CA-113).

**Imágenes** (CA-117). Toda imagen reserva su caja con su proporción antes de cargar; la caja es
de color superficie. Si la imagen no llega, la caja se queda y muestra el texto alternativo en
14 px, tinta suave, arriba a la izquierda.

- CA que cubre: CA-16, CA-95, CA-105, CA-106, CA-107, CA-110, CA-111, CA-113, CA-117.

---

### S2. Cabecera, navegación y pie

**Jerarquía de contenido:** enlace para saltar, nombre del sitio, navegación; al final de cada
página, el pie.

**Enlace para saltar** (CA-94). Primer elemento enfocable de toda página. Texto: "Saltar al
contenido". Invisible hasta recibir foco; entonces aparece arriba a la izquierda con el aspecto
del botón principal. Lleva al contenido principal.

**Modo académico.** Encima de la cabecera va el aviso de S14.1, y el enlace para saltar aparece
debajo de él. El pie cambia su bloque de identidad (S14.4).

**Cabecera.** Sobre papel, sin sombra. No queda fija al desplazarse: en 360 px quitaría espacio y
taparía elementos enfocados.

| Rango | Layout |
|---|---|
| Móvil | Una fila de 56 px: a la izquierda "Ecoturismo Antioquia" (Besley 700, 21 px, enlace al inicio); a la derecha un control "Menú" de 44 px de alto con aspecto de botón secundario. Al abrirlo, la lista de enlaces se despliega debajo, a todo el ancho, una fila de 44 px por enlace |
| Tableta y escritorio | Una fila de 64 px: nombre a la izquierda; a la derecha los enlaces en línea, 17 px, peso 500, tinta, separados 24 px, cada uno con 44 px de alto |

- Enlaces, en este orden y solo si su sección está publicada: "Destinos", "Galería", "Mapa de
  rutas", "Contacto" (CA-93, CA-51, CA-67, CA-81). Desde cualquier página llevan a la sección de
  la página de inicio.
- El control "Menú" abre y cierra sin JavaScript. Con JavaScript, además, se cierra al elegir un
  enlace o al pulsar Esc, y el foco vuelve al control.
- Enlace de navegación en hover: subrayado de 2 px. No hay indicador de sección activa.

**Pie** (CA-98, CA-50, CA-121). Fondo tinta, texto papel.

| Bloque | Contenido |
|---|---|
| Identidad | Modo de operador real: "Ecoturismo Antioquia". Debajo, el identificador oficial cuando exista ("Registro Nacional de Turismo N"); mientras no se entregue, no hay línea ni hueco (CA-119). Modo académico: ver S14.4 |
| Contacto | Enlace "Contacto" |
| Legales | "Política de tratamiento de datos", "Términos y condiciones", "Política de cancelación" |
| Fotos | "Créditos de las fotos" |

- Móvil: bloques apilados, un enlace por fila de 44 px. Tableta y escritorio: identidad en las
  columnas 1 a 4; los enlaces en dos columnas a su derecha.
- CA que cubre: CA-50, CA-51, CA-67, CA-81, CA-93, CA-94, CA-98, CA-119, CA-121.

---

### S3. Hero y perfil altitudinal generado

#### S3.1 Contenido y orden (CA-1, CA-2, CA-10, CA-11, CA-102)

1. **Titular** (h1, Besley 700, `--text-hero`): "Antioquia, de {mín} a {máx} metros de altitud".
   Las dos cifras salen del contenido verificado.
2. **Explicación**, en dos párrafos separados de 21 px:
   - "En la montaña tropical el clima cambia con la altura."
   - "Cada franja de altura es un piso térmico. Elige a qué altura quieres caminar."
3. **Botón principal:** "Ver destinos".
4. **Perfil.**
5. **Nota** bajo el perfil, 14 px, tinta suave: "Este perfil es un esquema: ordena los destinos
   por altura y no está a escala geográfica." En móvil, si hay destinos que el perfil no muestra,
   se añade: "Aquí ves {n} destinos. Están todos en la lista de abajo."

La explicación va en dos párrafos a propósito: así ningún bloque de texto ocupa más área que el
titular, que debe ser el elemento más grande de la primera pantalla (CA-10). El hero no tiene
ninguna fotografía.

En modo académico, el aviso de S14.1 va antes del titular, encima de la cabecera; el orden y el
contenido del hero no cambian (CA-1).

#### S3.2 Layout

| Rango | Layout |
|---|---|
| Móvil | Todo apilado en el orden de S3.1. Entre la cabecera y el titular, 24 px (`--space-6`). El perfil va a sangre: ocupa los 360 px de la ventana, sin margen lateral. Alto del perfil: 300 px |
| Tableta | Apilado. Titular en las 8 columnas. Perfil de ancho completo del contenido, 340 px de alto |
| Escritorio | Titular en las columnas 1 a 9. Debajo, en una fila: explicación en las columnas 1 a 6 y botón en la columna 8, alineado con la primera línea. Debajo, el perfil en las 12 columnas, 380 px de alto |

```
Escritorio                                         Móvil (a sangre)

| Antioquia, de 125 a 4080                |        | Antioquia, de        |
| metros de altitud                       |        | 125 a 4080           |
|                                         |        | metros de altitud    |
| En la montaña...     [ Ver destinos ]   |        | En la montaña...     |
| Cada franja...                          |        | [ Ver destinos ]     |
|                              4080 m     |        |           4080 m     |
|                        nombre  _/‾‾‾‾\__|        |       nombre _/‾‾\___|
|              nombre  o__/      Páramo  ||        |    nombre o_/ Páramo||
|             o_____/ nombre       Frío  ||        |  o___/        Frío  ||
|      o_____/ nombre          Templado  ||        | _/ nombre  Templado ||
| ____/ nombre                   Cálido  ||        |/ nombre     Cálido  ||
| 125 m                                  ||        |125 m                ||
```

#### S3.3 Qué es el perfil y qué no

Es **una montaña en corte**, no un gráfico. Esto lo distingue y es obligatorio:

- Tiene cuerpo: una silueta rellena, con los cuatro pisos como estratos planos **dentro de la
  roca**. Fuera de la silueta, el cielo es papel liso.
- Los destinos se asientan en **rellanos** de la ladera, como los pueblos de montaña.
- La montaña sigue más arriba del último destino, hasta una **cumbre** a la altitud máxima de
  Antioquia, y su lado lejano queda **cortado por el borde** de la figura.
- Los nombres de los pisos están escritos en la roca. Los de los destinos, en las dos zonas
  vacías: la roca y el cielo.
- No tiene ejes, marcas de escala, cuadrícula, leyenda ni líneas horizontales en el cielo.

#### S3.4 Variantes y constantes

El generador produce tres variantes. Cada una se calcula para el ancho mínimo de su rango; al
crecer la ventana, la figura se estira solo a lo ancho y conserva su alto. Las posiciones se
expresan como fracción del ancho, y los textos y los puntos mantienen su tamaño real, así que un
layout sin colisiones en el ancho mínimo tampoco las tiene en anchos mayores.

| Constante | Compacta (360 a 767) | Media (768 a 1023) | Amplia (1024 o más) |
|---|---|---|---|
| Ancho de cálculo `W` | 360 | 704 | 928 |
| Alto `H` | 300 | 340 | 380 |
| Margen superior `Pt` | 32 | 32 | 32 |
| Base bajo el valle `Pb` | 32 | 48 | 48 |
| Largo del valle `V` | 8 | 24 | 32 |
| Ancho del lado lejano `F` | 80 | 120 | 150 |
| Ancho máximo del rellano | 24 | 40 | 48 |
| Curvas de eco | 2 | 3 | 3 |
| Puntos | Selección de S3.8, máximo 5 | Todos | Todos |
| Capacidad sin avisos | 5 | 11 | 15 |

Medidas en px. Origen arriba a la izquierda; `y` crece hacia abajo.

#### S3.5 Construcción

**Entradas:** altitud mínima `aMin` y máxima `aMax` de Antioquia; umbrales entre pisos `T1 < T2 <
T3`; lista de destinos de la variante, con nombre, altitud y enlace. Todo sale del contenido
verificado.

**Orden.** Los destinos se ordenan por altitud ascendente y, a igual altitud, por nombre (el mismo
orden de CA-13). `n` es su número; `i` va de 1 a `n`.

**Escala vertical,** lineal:

```
y(a) = Pt + (aMax − a) / (aMax − aMin) × (H − Pt − Pb)
yValle = y(aMin) = H − Pb        yCumbre = y(aMax) = Pt
```

**Posición horizontal,** por orden y a intervalos iguales:

```
x0 = V                 xCumbre = W − F
s  = (xCumbre − x0) / (n + 1)
x(i) = x0 + i × s      punto del destino i: ( x(i), y(altitud i) )
```

A mayor altitud, más arriba y más a la derecha. Cambiar la altitud de un destino solo cambia su
punto y, si altera el orden, las posiciones horizontales (CA-5).

**Línea de cumbres.** Con `t = min(0.5 × s, ancho máximo del rellano)`:

1. Empieza en `(0, yValle)` y sigue recta hasta `(V, yValle)`: el fondo del valle.
2. Para cada destino, una **subida** hasta `A(i) = (x(i) − t/2, y(i))` y un **rellano** recto
   hasta `B(i) = (x(i) + t/2, y(i))`.
3. Cada subida es una curva de Bézier cúbica de `P` a `Q`, con `dx = Q.x − P.x`:
   `C1 = (P.x + 0.55 × dx, P.y)` y `C2 = (Q.x − 0.25 × dx, Q.y)`. Sale suave del rellano y llega
   más empinada al siguiente. Como los puntos de control están a la altura de los extremos, la
   curva nunca sube por encima de su destino ni baja por debajo de su origen.
4. Tras el último rellano, una subida a la cumbre `S = (xCumbre, yCumbre)` con
   `C1 = (P.x + 0.55 × dx, P.y)` y `C2 = (S.x − 0.12 × dx, yCumbre + 0.10 × (P.y − yCumbre))`.
5. El lado lejano baja de `S` a `E = (W, yCumbre + 0.10 × (yValle − yCumbre))` con
   `C1 = (S.x + 0.30 × F, yCumbre)` y `C2 = (S.x + 0.70 × F, E.y)`.

Dos destinos con la misma altitud quedan en rellanos consecutivos unidos por un tramo plano: una
meseta. Es correcto.

**Silueta.** La línea de cumbres, cerrada por `(W, H)` y `(0, H)`.

**Capas,** de abajo hacia arriba:

| Capa | Forma | Color |
|---|---|---|
| Estratos | Un rectángulo por piso, de `y(límite superior)` a `y(límite inferior)`, de lado a lado, recortado por la silueta. La base, de `yValle` a `H`, lleva el tinte del piso más bajo | Tinte de cada piso, plano |
| Curvas de eco | Copias de la línea de cumbres desplazadas hacia abajo 14 px, 28 px y 42 px, recortadas por la silueta | Línea, 1 px |
| Límites entre pisos | Una recta en `y(T1)`, `y(T2)` y `y(T3)`, recortada por la silueta: solo existe dentro de la roca | Tinta suave, 1 px |
| Franja de piso | En el borde derecho, 6 px de ancho y el alto de cada estrato, recortada por la silueta | Color fuerte de cada piso |
| Línea de cumbres | El trazo de la silueta, sin los lados inferior y derecho | Tinta, 2 px, uniones redondeadas |
| Textos y puntos | S3.6 y S3.7 | |

Los grosores de línea no cambian cuando la figura se estira.

**Datos que el generador rechaza.** Un destino con altitud fuera de `aMin` a `aMax`, o umbrales
que no cumplan `aMin < T1 < T2 < T3 < aMax`, detienen la construcción con un mensaje. La spec no
lo pide de forma expresa; ver "Contradicciones y vacíos", punto 4.

#### S3.6 Textos fijos del perfil

| Texto | Posición | Estilo |
|---|---|---|
| Nombre de cada piso: "Cálido", "Templado", "Frío", "Páramo" (CA-4) | Dentro de la roca, alineado a la derecha, a 8 px de la franja de piso; su línea base queda 8 px por encima del límite inferior de su estrato | 14 px, peso 500, color fuerte del piso sobre su tinte |
| Altitud mínima: "{aMin} m" | En la base, a 8 px del borde izquierdo y 20 px por debajo del valle | 14 px, tinta suave |
| Altitud máxima: "{aMax} m" | En el cielo, alineada a la derecha, terminando 8 px antes de la cumbre; su línea base queda 6 px por encima de la cumbre | 14 px, tinta suave |

- Los cuatro nombres de piso aparecen siempre, haya o no destinos en ese piso.
- Si un estrato mide menos de 24 px de alto, su nombre no cabe: la construcción avisa. Con los
  umbrales habituales no ocurre.
- Estos textos son texto real, no trazos, y forman parte de lo que lee un lector de pantalla.

#### S3.7 Puntos y etiquetas de destino (CA-5, CA-6)

**Punto.** Disco de 12 px en tinta con un aro de 2 px en papel, centrado en su posición. Su área
táctil es un cuadrado de 44 × 44 px centrado en el disco. Con `n` dentro de la capacidad de la
variante, `s` es de al menos 44 px y las áreas no se pisan.

**Etiqueta.** El nombre del destino, 14 px, peso 500, tinta. El punto y su etiqueta son un solo
enlace a la página de detalle.

**Lado de la etiqueta.** Hay dos posiciones que nunca cruzan la línea de cumbres, porque la
ladera siempre sube hacia la derecha:

| Posición | Dónde queda | Por qué está libre |
|---|---|---|
| En la roca | Debajo del rellano y hacia la derecha: borde izquierdo en `x(i) − 6`, borde superior 12 px bajo el punto | A la derecha de un destino la montaña siempre es igual o más alta |
| En el cielo | Encima del rellano y hacia la izquierda: borde derecho en `x(i) + 6`, borde inferior 12 px sobre el punto | A la izquierda de un destino la montaña siempre es igual o más baja |

- Posición preferida: en la roca si `x(i) < W / 2`; en el cielo si no. Así las etiquetas ocupan
  las dos grandes zonas vacías de la figura.
- Las etiquetas en la roca y las del cielo no pueden chocar entre sí: las separa la línea de
  cumbres.

**Colisiones.** El ancho de un texto se estima en la construcción como `0.58 × 14 px` por
carácter. Cada etiqueta tiene 4 px de margen. Son obstáculos fijos: los nombres de piso, las dos
cifras de altitud y los bordes de la figura.

Las etiquetas se colocan en orden ascendente. Para cada una se prueban estas opciones y se acepta
la primera que no toque ningún obstáculo ni ninguna etiqueta ya colocada:

1. Posición preferida, en una línea.
2. Posición preferida, partida en dos líneas por un espacio.
3. La otra posición, en una línea, y luego en dos.
4. Posición preferida en dos líneas, alejándola del punto de 4 en 4 px hasta 48 px (hacia abajo
   en la roca, hacia arriba en el cielo). Si se aleja más de 12 px, una línea guía de 1 px en
   tinta suave une el punto con la etiqueta.

Si nada funciona, la etiqueta queda en la última posición probada y la construcción avisa con el
nombre del destino. No se trunca ningún nombre ni se oculta ninguna etiqueta.

**Casos límite**

| Caso | Qué pasa |
|---|---|
| Altitudes muy cercanas | Los rellanos se tocan y forman una meseta. Las etiquetas se resuelven con las opciones 2 a 4 |
| Altitudes iguales | Igual; el orden entre ellas es alfabético |
| Un solo destino | Un rellano a media ladera y la subida a la cumbre |
| Más destinos que la capacidad de la variante | Se dibujan todos y la construcción avisa: las áreas táctiles empiezan a pisarse y conviene pasar al respaldo de S3.10 |
| Destino a la altitud máxima | Su rellano coincide con la cumbre |

**Estados del enlace**

| Estado | Aspecto |
|---|---|
| Reposo | Disco tinta; nombre en tinta, sin subrayado |
| Hover | Disco de 16 px en guayacán con borde de 2 px tinta; nombre subrayado |
| Foco | Lo mismo, más el anillo de 3 px tinta alrededor del área táctil y la etiqueta |
| Activo | Disco tinta suave |

#### S3.8 Variante compacta: máximo cinco puntos (CA-7)

Selección, determinista:

1. El destino principal de cada piso que tenga destinos (regla de CA-15). Son hasta cuatro.
2. Si quedan destinos fuera, se añade el de mayor altitud entre los no elegidos. Es "el destino
   principal" de CA-7; ver "Contradicciones y vacíos", punto 1.

La variante se calcula solo con esos destinos. Los demás no existen en ella: no ocupan espacio ni
son enfocables. Todos están en el listado de S4.

#### S3.9 Accesibilidad, animación y carga (CA-8, CA-9)

**Lector de pantalla y teclado**

- La figura tiene el nombre accesible "Perfil de altitud de Antioquia".
- Las formas son decorativas y quedan ocultas a la tecnología de apoyo.
- Los destinos son **una lista ordenada de enlaces**, la misma que se ve: no hay una lista
  aparte. Cada enlace se anuncia "{Nombre}, {altitud} metros"; la altitud va como texto no
  visible dentro del enlace.
- El orden de foco es el de la lista: de menor a mayor altitud, que coincide con el orden visual
  de izquierda a derecha. Viene justo después del botón "Ver destinos".

**Animación.** Una sola, al cargar, sin JavaScript:

- Una cubierta del color del papel tapa la figura y se retira hacia la derecha en 900 ms
  (`--duration-draw`), a velocidad constante. La montaña y sus destinos aparecen de izquierda a
  derecha.
- Solo se anima un desplazamiento de la cubierta: no recalcula la disposición ni bloquea nada.
- El estado por defecto es "ya dibujado": la cubierta parte retirada y la animación la trae desde
  el inicio. Sin animaciones, o sin JavaScript, el perfil está completo.
- Con `prefers-reduced-motion: reduce` no hay animación.
- La cubierta no recibe clics ni toques. El titular, la explicación y el botón nunca se tapan.

Se eligió la cubierta en lugar de animar el trazo porque la figura se estira a lo ancho con
grosores fijos, y en esa situación los navegadores no calculan igual la longitud del trazo.

**"Ver destinos"** (CA-3). Salta a la sección de destinos sin animación y el foco queda en el
título de esa sección. Funciona sin JavaScript.

#### S3.10 Respaldo: regla vertical de altitud

Solo si el humano, en la revisión con captura del punto de control inicial, decide que el perfil
construido no convence.

- Una barra vertical de 6 px, dividida en cuatro tramos del color fuerte de cada piso,
  proporcionales a su rango. Alto: 360 px en móvil, 420 px en tableta y escritorio.
- A la izquierda de la barra, el nombre de cada piso. A la derecha, una marca de 12 px por
  destino a su altitud, con su nombre como enlace.
- Las etiquetas que se pisan (menos de 24 px de separación) se reparten hacia arriba y abajo con
  líneas guía de 1 px.
- En móvil vale la misma selección de S3.8. Titular, explicación, botón, nota, lista accesible y
  animación (la cubierta se retira hacia arriba) no cambian.

- CA que cubre: CA-1 a CA-11, CA-23, CA-102, CA-112, CA-113.

---

### S4. Listado de destinos (inicio)

**Jerarquía de contenido:** título de sección; un bloque por piso con destinos; en cada bloque, un
destino principal y los demás.

- Título (h2): "Destinos". Debajo, una línea: "Del valle al páramo, de menor a mayor altura."
- Pisos en orden cálido, templado, frío, páramo; dentro de cada uno, destinos por altitud
  ascendente (CA-12, CA-13). Un piso sin destinos no deja rastro (CA-14).
- Cada bloque lleva la regla de altitud de S1 (CA-16). El nombre del piso es un h3: "Piso cálido".
- Separación entre bloques: 48 px en móvil, 64 px en escritorio.

**Contenido de cada destino** (CA-17, CA-18, CA-21), en este orden de lectura:

1. Foto o lámina (S6), con su crédito justo debajo si es foto.
2. Nombre (h4, Besley 700), que es el enlace al detalle. Su zona activa se extiende sobre la foto
   o la lámina, pero no sobre el crédito.
3. Descripción corta, 17 px.
4. Tres datos con su etiqueta, en este orden: "Altitud" ("1750 m, piso templado"), "Duración",
   "Dificultad" (formatos de S5). Un dato ausente no se muestra.

Hay un solo enlace al detalle por destino, y su nombre accesible es el nombre del destino.

**Principal y menores** (CA-15)

| Rango | Destino principal | Destinos menores |
|---|---|---|
| Escritorio | Foto o lámina 3:2 en las columnas 3 a 8; texto en las columnas 9 a 12. Nombre de 33 px | Debajo, en dos columnas (3 a 7 y 8 a 12). Cada uno: foto o lámina 1:1 de 2 columnas a la izquierda y texto a la derecha. Nombre de 27 px |
| Tableta | Foto o lámina 3:2 en las columnas 1 a 5; texto en las columnas 6 a 8. Nombre de 33 px | En dos columnas de 4. Cada uno: foto o lámina 1:1 de 120 px a la izquierda y texto a la derecha. Nombre de 21 px |
| Móvil | Foto o lámina 3:2 a todo el ancho; texto debajo. Nombre de 27 px | Apilados. Cada uno: foto o lámina 1:1 de 104 px a la izquierda y texto a la derecha; el crédito, debajo, a todo el ancho. Nombre de 21 px |

```
Escritorio, un bloque de piso              Móvil, un bloque de piso

|#| Piso     | [   foto 3:2    ] Nombre |   |#| Piso templado, de 1000 a 2000 m
|#| templado | [               ] Descr. |   |#| [      foto 3:2      ]
|#| De 1000  | [               ] Altitud|   |#| Foto: Autor. Licencia. Fuente
|#| a 2000 m | Foto: Autor...   Duración|   |#| Nombre
|#|          |                Dificultad|   |#| Descripción corta
|#|          | [1:1] Nombre  [1:1] Nombre|  |#| Altitud / Duración / Dificultad
|#|          |       Descr.        Descr.|  |#| [1:1] Nombre
                                            |#|       Descripción, datos
```

- Un piso con un solo destino lo muestra como principal, sin fila de menores.
- Con un número impar de menores, el último queda solo en la columna izquierda.
- El principal puede ser una lámina. Tiene el mismo tamaño y lugar que una foto (CA-38).
- El lugar del principal es un tamaño grande: usa foto solo si el destino tiene alguna con lado
  mayor de 2000 px o más; si no, usa la lámina. Los menores usan la primera foto publicada del
  destino. Ver "Contradicciones y vacíos", punto 6.
- Hover sobre un destino: solo cambia el subrayado del nombre. La foto no se mueve ni se amplía.
- CA que cubre: CA-12 a CA-19, CA-21, CA-38.

---

### S5. Ficha de salida

**Jerarquía de contenido:** siete filas de etiqueta y valor, siempre en este orden (CA-21).

| N.º | Etiqueta | Valor | Formato |
|---|---|---|---|
| 1 | Altitud | "1750 m, piso templado" | Sin separador de miles; nombre del piso escrito (CA-23, CA-29) |
| 2 | Clima habitual | "Entre 16 y 24 °C" | CA-24 |
| 3 | Cómo llegar | "A 3 horas de Medellín por carretera" | Texto libre del contenido |
| 4 | Duración | "5 horas", "1 día" | CA-25 |
| 5 | Distancia y desnivel | "8,5 km, 400 m de subida" | CA-26 |
| 6 | Dificultad | "Moderada" más marcas | CA-27 |
| 7 | Edad sugerida | "Apta desde los 6 años" | CA-28 |

Los valores de la tabla ilustran el formato; no son datos.

**Aspecto**

- Panel de color superficie, radio 4 px, relleno de 24 px (16 px en móvil).
- Etiqueta: 17 px, peso 500, tinta suave. Valor: 17 px, tinta, con cifras tabulares si la fuente
  las ofrece.
- Filas separadas por 12 px y por una línea de 1 px en color de línea, que es decorativa.

| Ancho del panel | Disposición de cada fila |
|---|---|
| 400 px o más | Dos columnas: etiqueta (40 %) y valor (60 %), alineadas arriba |
| Menos de 400 px | Etiqueta encima y valor debajo |

**Dificultad** (CA-27). La palabra y, a su derecha, tres marcas circulares de 10 px: rellenas en
tinta tantas como el nivel (una, dos o tres) y el resto solo con contorno de 1.5 px en tinta. Las
marcas están ocultas al lector de pantalla, que anuncia solo la palabra.

**Altitud.** Antes del nombre del piso va un cuadrado de 10 px de su color fuerte. El piso se
entiende por el nombre; el cuadrado solo lo enlaza con la regla de altitud.

**Datos que faltan** (CA-22). La fila entera desaparece, con su etiqueta y su separador. En la
fila 5, si solo hay distancia o solo desnivel, se muestra lo que hay y la etiqueta pasa a
"Distancia" o "Desnivel". Ver "Contradicciones y vacíos", punto 7.

**Lector de pantalla** (CA-30). Cada etiqueta está asociada a su valor y se anuncia "etiqueta,
valor".

**Variantes de uso**

| Lugar | Qué muestra |
|---|---|
| Listado de destinos (S4) | Filas 1, 4 y 6, sin panel de superficie |
| Detalle de destino (S7) | Las siete filas |
| Ruta, en el detalle, en la lista de rutas y en el panel del mapa (S7, S9) | Las siete filas. La fila 1 es la del destino al que pertenece la ruta; ver "Contradicciones y vacíos", punto 3 |

- CA que cubre: CA-21 a CA-30, CA-103.

---

### S6. Fotos, láminas de altitud y créditos

#### S6.1 Fotos (CA-43, CA-49)

- Proporciones: 3:2, 4:5 o 1:1, según el recorte del contenido. Radio de 2 px. Sin borde, sin
  sombra, sin filtros, sin texto encima.
- Una foto nunca se muestra más ancha que su ancho original.

| Tamaño | Ancho mostrado | Qué fotos pueden usarlo |
|---|---|---|
| Grande | Más de 480 px: lugar del principal en el listado y en el detalle | Lado mayor de 2000 px o más |
| Menor | Hasta 480 px (`--size-photo-small`) | Cualquier foto publicada (lado mayor de 1200 px o más) |

En móvil todo lugar mide 320 px o menos, pero la regla del lugar principal no cambia: se decide
por el lugar, no por el ancho de la ventana.

#### S6.2 Crédito (CA-44, CA-45, CA-48)

Va justo debajo de su foto, a 8 px, o en el pie del visor. Es **una sola línea de texto**: 14 px,
tinta suave (color atenuado sobre tinta en el visor).

- Texto: "Foto: {autor}. {licencia}. Fuente. Recortada."
- "{licencia}" es un enlace al texto de la licencia y "Fuente" es un enlace a la página de origen.
  El autor es texto.
- "Recortada." o "Modificada." aparece solo si aplica.
- Si el crédito no cabe en el ancho de su foto, sigue en la línea siguiente como cualquier texto;
  no se corta ni se abrevia.
- Nombres accesibles: "Licencia {nombre de la licencia}" y "Fuente de la foto de {destino}".
- El texto alternativo describe la imagen y no repite el crédito.

**Tamaño de los enlaces del crédito.** Es la única excepción a los 44 px de S1, decidida por el
humano.

| Qué | Medida |
|---|---|
| En qué se apoya | La excepción "en línea" del criterio 2.5.8 de WCAG 2.2 (tamaño del objetivo, nivel AA): el objetivo está dentro de una frase y su tamaño lo limita el interlineado del texto |
| Interlineado del crédito | 24 px, del token `--space-6`. Sustituye, solo en el crédito, al interlineado propio de `--text-sm` |
| Área activa de cada enlace | Al menos 24 px de alto, con 4 px (`--space-1`) de relleno arriba y abajo que no mueven el texto, y al menos 24 px de ancho |
| Separación entre los dos enlaces | Al menos 8 px (`--space-2`): el punto, el espacio y un margen |
| Foco | El anillo de S1, alrededor del texto del enlace |

Con esas medidas, los enlaces cumplen por tamaño los 24 × 24 px del criterio 2.5.8 aunque no se
invocara la excepción, y sus áreas no se pisan cuando el crédito ocupa dos líneas. Lo que no
cumplen es el mínimo propio del sitio, de 44 px.

El crédito ocupa así unos 24 px bajo cada foto, o 48 px si pasa a dos líneas.

#### S6.3 Láminas de altitud (CA-38, CA-39)

Una lámina ocupa el lugar de una foto, con su misma proporción y su mismo radio.

**Composición**

- Fondo: tinte del piso, plano.
- Curvas de nivel del piso, a toda la superficie.
- Abajo a la izquierda, a 12 px de los bordes, un bloque de texto sobre un rectángulo del mismo
  tinte que interrumpe las curvas, como hacen los mapas con sus rótulos: la cifra de altitud
  ("1750 m", Besley 700, tinta) y debajo el nombre del piso ("Templado", 14 px, peso 500, color
  fuerte del piso).
- No lleva crédito, ni texto de "imagen no disponible", ni gris.

| Ancho de la lámina | Tamaño de la cifra |
|---|---|
| 480 px o más | 52 px |
| 280 a 479 px | 42 px |
| 140 a 279 px | 33 px |
| Menos de 140 px | 21 px |

La dirección visual fija 52 px y 42 px para la cifra; los dos pasos menores se añaden para las
láminas pequeñas del listado y son tamaños de la escala.

La lámina es decorativa para el lector de pantalla: su altitud y su piso ya están en el texto del
destino.

**Regla generativa.** Cada lámina son las **curvas de nivel de una función de altura** `h(x, y)`,
una por piso, sobre un lienzo de 300 × 200 unidades. Como salen de una función, nunca se cruzan.

- Se evalúa `h` en una retícula de 4 unidades y se trazan las líneas de igual altura para los
  niveles indicados, interpolando linealmente dentro de cada celda.
- Sin azar: los mismos parámetros dan siempre el mismo dibujo. Hay cuatro dibujos, uno por piso;
  no cambian con el destino.
- El dibujo cubre la lámina y se recorta centrado para las proporciones 4:5 y 1:1.
- Trazo de 1 px, que no engrosa al escalar. Una de cada cinco curvas es **curva maestra**, en el
  color fuerte del piso; las demás van en color de línea.

Los ángulos van en radianes. `exp` es la exponencial.

| Piso | Relieve | Función | Niveles | Maestras |
|---|---|---|---|---|
| Cálido | Cañón: un río sinuoso entre dos paredes | `eje(x) = 100 + 34·sin(2π·x/300 + 0.6) + 10·sin(2π·x/110)`; `h = 100·(1 − exp(−abs(y − eje(x)) / 38))` | 10, 20, … 90 | 50 |
| Templado | Lomas: tres colinas redondeadas | `h = 0.05·x + Σ A·exp(−((x − cx)² / (2·sx²) + (y − cy)² / (2·sy²)))` con las colinas `(cx, cy, sx, sy, A)` = `(78, 128, 52, 40, 70)`, `(196, 74, 44, 34, 60)`, `(262, 150, 30, 26, 42)` | 10, 20, … 80 | 50 |
| Frío | Ladera: pendiente pareja con quebradas | `h = 0.45·(200 − y) + 0.03·x + 7·sin(2π·x/70 + 0.3) + 3·sin(2π·x/23 + 1.1)` | 6, 12, … 96 | 30, 60, 90 |
| Páramo | Altiplano: relieve suave con dos lagunas | `h = 50 + 0.06·x − 0.05·y + 6·sin(2π·x/260 + 1)·cos(2π·y/190) − 14·exp(−((x − 92)² + (y − 70)²) / 392) − 14·exp(−((x − 214)² + (y − 132)²) / 200)` | 30, 35, … 70 | 50 |

**Qué debe verse** (criterio de revisión con captura; los parámetros son ajustables para lograrlo):

| Piso | Rasgo que lo distingue | Densidad |
|---|---|---|
| Cálido | Dos haces de curvas paralelas a un eje sinuoso, apretadas junto al eje y abiertas hacia los bordes, con un corredor vacío en el centro | Alta junto al eje |
| Templado | Tres grupos de anillos cerrados y concéntricos | Media |
| Frío | Curvas abiertas que cruzan la lámina de lado a lado, casi paralelas y onduladas | Alta y uniforme: unas 15 curvas |
| Páramo | Pocas curvas muy separadas y dos anillos pequeños cerrados | Baja |

Los cuatro se distinguen por su forma, no solo por el color.

#### S6.4 Qué se muestra según las fotos del destino

| Fotos del destino | Listado (S4) | Detalle (S7) |
|---|---|---|
| Ninguna | Lámina | Lámina en el lugar principal |
| Una o dos, alguna de 2000 px o más | Foto | Sin lugar principal: las fotos van en tamaño menor junto a la ficha, sin visor ni controles (CA-40) |
| Tres o más, alguna de 2000 px o más | Foto | Foto principal y las demás en una cuadrícula que abre el visor (CA-41) |
| Solo fotos de menos de 2000 px | Lámina si es el principal del piso; foto si es menor | Lámina en el lugar principal; las fotos, en tamaño menor (CA-42). Con tres o más, la cuadrícula abre el visor |

La foto principal es la primera foto del destino, en el orden del contenido, que mida 2000 px o
más.

- CA que cubre: CA-38 a CA-45, CA-48, CA-49, CA-117.

---

### S7. Página de detalle de destino

**Jerarquía de contenido:** volver, nombre, altitud y piso, foto o lámina, ficha, descripción,
fotos, rutas, contacto.

| N.º | Bloque | Contenido |
|---|---|---|
| 1 | Volver | Enlace "Volver a los destinos", que lleva al listado del inicio (CA-34) |
| 2 | Título | h1 con el nombre del destino. Besley 700; 42 px en tableta y escritorio, 33 px en móvil |
| 3 | Altitud | "{altitud} metros de altitud, piso {nombre}", 21 px. Es la primera altitud de la página (CA-23) |
| 4 | Imagen | Foto principal con su crédito, o lámina, según S6.4. Proporción 3:2 |
| 5 | Ficha | h2 "Datos de la salida" y la ficha completa (S5) |
| 6 | Descripción | Texto corrido, máximo 70 caracteres por línea |
| 7 | Fotos | Solo según S6.4. h2 "Fotos de {destino}" |
| 8 | Rutas | Solo si el destino tiene rutas (CA-35). h2 "Rutas de {destino}"; por cada ruta, un h3 con su nombre, una línea "Elevación: de {mín} a {máx} m" y su ficha completa |
| 9 | Contacto | h2 "¿Te interesa {destino}?", el botón "Escribir por WhatsApp" y una línea con el correo (S10). El mensaje inicial nombra el destino (CA-36) |

**Layout**

| Rango | Disposición |
|---|---|
| Móvil | Todo apilado en el orden de la tabla. Franja de 6 px del color del piso a la izquierda de los bloques 2 a 6 |
| Tableta | Igual que móvil. La ficha usa dos columnas por fila |
| Escritorio | Regla de altitud en las columnas 1 y 2, junto a los bloques 2 a 6. Imagen en las columnas 3 a 9; ficha en las columnas 10 a 12, a la misma altura. Descripción debajo de la imagen, en las columnas 3 a 9. Fotos, rutas y contacto, en las columnas 3 a 12 |

**Con una o dos fotos** (CA-40). No hay bloque 4. Las fotos van en el bloque de la ficha:

- Escritorio: fotos en las columnas 3 a 7, una debajo de otra, cada una con su crédito; ficha en
  las columnas 8 a 12.
- Tableta y móvil: fotos apiladas a todo el ancho de la columna, hasta 480 px, y la ficha debajo.
- Son imágenes estáticas: no abren el visor.

**Con tres o más fotos** (CA-41). El bloque 7 es una cuadrícula como la de la galería (S8.1), sin
grupos de piso. Abre el visor de S8.2 con las fotos de este destino, empezando por la principal.

**Rutas.** En escritorio, dos rutas por fila si hay más de una; en tableta y móvil, apiladas.

**Cabecera del documento** (CA-33). Título: "{Nombre} | Ecoturismo Antioquia". Descripción: la
descripción corta del destino. Los límites de 60 y 160 caracteres se cumplen en el contenido.

- CA que cubre: CA-23, CA-32 a CA-36, CA-40 a CA-42.

---

### S8. Galería y visor

#### S8.1 Galería (inicio)

**Jerarquía de contenido:** título, grupos por piso, fotos con su pie.

- Título (h2): "Galería". Línea: "Fotos de los destinos, del valle al páramo."
- Si no hay ninguna foto publicada, la sección no existe y su enlace de navegación tampoco
  (CA-51).

**Grupos** (CA-52). Regla determinista:

1. Se recorren los pisos en orden ascendente. Los pisos sin fotos se saltan.
2. Un piso con tres o más fotos forma su propio grupo.
3. Un piso con una o dos fotos se une al siguiente piso con fotos. Si es el último, se une al
   grupo anterior.
4. Si tras unirse el grupo aún tiene menos de tres fotos, sigue uniéndose al siguiente con la
   misma regla.

- Cada grupo lleva un h3 con sus pisos ("Piso frío", "Pisos cálido y templado") y la regla de
  altitud de S1. Un grupo de varios pisos divide su franja en tramos iguales, uno por piso, de
  abajo hacia arriba.
- Dentro de un grupo, las fotos van por altitud del destino, luego por nombre del destino, luego
  en el orden del contenido. Las fotos de un grupo comparten las mismas filas.
- Ese orden, de grupo en grupo, es el orden del visor.

**Cuadrícula**

| Rango | Columnas | Foto 3:2 | Foto 4:5 o 1:1 |
|---|---|---|---|
| Móvil | 2 | Ocupa 2 | Ocupa 1 |
| Tableta | 4 | Ocupa 2 | Ocupa 1 |
| Escritorio | 5, en las columnas 3 a 12 del contenido | Ocupa 2 | Ocupa 1 |

Canal de 16 px (24 px desde tableta). Las filas se alinean arriba; sus alturas son distintas.

**Pie de cada foto**

1. Nombre del destino (17 px, peso 500, tinta) y etiqueta de piso: un cuadrado de 10 px del color
   fuerte y el nombre del piso (14 px, tinta suave).
2. Crédito (S6.2).

**Miniatura** (CA-54, CA-65)

- Sin JavaScript es una imagen: no es enlace ni botón.
- Con JavaScript pasa a ser un botón que abre el visor. Nombre accesible: "Abrir foto de
  {destino}: {texto alternativo}". Hover: borde de 2 px tinta. Foco: anillo de S1.
- Las miniaturas fuera de pantalla no se descargan en la carga inicial (CA-66); su caja está
  reservada.

#### S8.2 Visor

Un diálogo a pantalla completa sobre fondo tinta opaco. Nombre accesible: "Visor de fotos".

```
| 3 de 12                             [ Cerrar ] |
|                                                |
|                  [  foto  ]                    |
|                                                |
| Nombre del destino   # Templado                |
| Foto: Autor. Licencia. Fuente. Recortada.      |
| [ Anterior ]                    [ Siguiente ]  |
```

| Parte | Contenido | Medidas |
|---|---|---|
| Barra superior | Contador "3 de 12" a la izquierda; botón "Cerrar" a la derecha | 56 px de alto; botón de 44 px o más |
| Foto | Contenida y sin recortar; nunca más ancha que su original ni que la ventana | El espacio que dejan las barras |
| Pie | Nombre del destino, etiqueta de piso y crédito completo (CA-59) | Texto sobre tinta |
| Controles | "Anterior" a la izquierda, "Siguiente" a la derecha | 48 px de alto; en móvil, media pantalla cada uno |

- Texto papel sobre tinta; texto secundario en el color atenuado sobre tinta; foco en guayacán.
- Los botones llevan su palabra escrita. No hay iconos sueltos.

**Comportamiento**

| Situación | Qué pasa |
|---|---|
| Abrir (CA-55, CA-61, CA-62) | Desvanecido de 250 ms. El foco va al botón "Cerrar". La página de fondo queda inoperable y sin desplazamiento |
| Cerrar (CA-56) | Con "Cerrar" o Esc. Desvanecido de 250 ms. El foco vuelve a la miniatura que abrió el visor y la página recupera su posición |
| Cambiar de foto (CA-57, CA-58) | Con los botones o con las flechas izquierda y derecha. El cambio es inmediato, sin animación. Se anuncia "3 de 12" y el texto alternativo de la foto nueva |
| Primera o última foto (CA-57) | El botón sin destino queda desactivado: sigue enfocable, se anuncia como desactivado y se ve en el color atenuado con borde punteado. El visor no da la vuelta |
| Una sola foto (CA-64) | No hay "Anterior", "Siguiente" ni contador |
| Tabulación (CA-55) | Tab y Mayús+Tab recorren solo: Cerrar, enlaces del crédito, Anterior, Siguiente |
| Móvil (CA-60) | Un deslizamiento horizontal de más de 48 px cambia de foto. En los extremos no pasa nada. Los botones siguen disponibles |
| Foto cargando | En el lugar de la foto, arriba a la izquierda: "Cargando la foto…" |
| Foto que no carga (CA-63) | En el lugar de la foto: "No pudimos cargar esta foto". Se anuncia al lector de pantalla. Crédito y controles siguen funcionando |
| Movimiento reducido | Abrir y cerrar son inmediatos |

- La imagen ampliada se pide al abrir el visor o al llegar a esa foto, no antes (CA-66).
- CA que cubre: CA-51 a CA-66.

---

### S9. Mapa y lista de rutas

**Jerarquía de contenido:** título, mapa, ruta seleccionada, lista de todas las rutas.

- Título (h2): "Mapa de rutas". Línea: "Cada ruta parte de un destino. Aquí ves cuánto dura y
  cuánto sube cada una."
- Si no hay rutas publicadas, la sección y su enlace de navegación no existen (CA-67).

#### S9.1 Lista de rutas (CA-68, CA-80)

Siempre visible, con o sin JavaScript. Es el contenido base de la sección.

- h3: "Todas las rutas". Orden: por elevación mínima ascendente y, a igualdad, por nombre.
- Cada ruta: h4 con su nombre; línea "Elevación: de {mín} a {máx} m"; ficha completa (S5); enlace
  "Ir a {nombre del destino}".
- Cada ruta lleva a la izquierda una franja de 6 px del color fuerte del piso de su destino.

- **Letra clave** (CA-68). Cada ruta lleva siempre, junto a su nombre, una letra (A, B, C…) en un
  disco de 28 px del color fuerte del piso, con letra blanca. Se ve con y sin JavaScript, y
  también si el mapa falla. Es la misma letra de su marcador en el mapa.
- Las letras siguen el orden de la lista. No son numeración decorativa: son la clave que une cada
  elemento de la lista con su marcador. Para el lector de pantalla, la letra forma parte del
  nombre de la ruta ("Ruta A, {nombre}").

Solo cuando el mapa está activo, cada ruta gana dos cosas más:

| Añadido | Forma |
|---|---|
| Muestra de trazo | Un segmento de 48 px con el patrón de su línea en el mapa |
| Botón | "Ver en el mapa", botón secundario |

#### S9.2 Layout

| Rango | Disposición |
|---|---|
| Móvil | Apilado: mapa (1:1, 320 × 320 px), ruta seleccionada, lista |
| Tableta | Apilado: mapa (3:2), ruta seleccionada, lista en dos columnas |
| Escritorio | Mapa (4:3) en las columnas 1 a 7 y, debajo, la ruta seleccionada. Lista en las columnas 8 a 12 |

- Sin JavaScript: solo título, línea y lista; la lista ocupa todo el ancho (dos columnas desde
  tableta). No hay caja de mapa ni panel.
- Con JavaScript: la caja del mapa está reservada desde el primer pintado, para que la página no
  salte cuando el mapa llegue.
- El código del mapa y sus teselas no se piden hasta que la sección está cerca de la ventana
  (CA-79).

#### S9.3 Mapa

**Caja.** Borde de 1 px tinta suave, radio 4 px. Vista inicial: todas las rutas, con 32 px de
margen.

**Teselas** (CA-73). OpenStreetMap, desaturadas para que las rutas manden:

- Escala de grises al 100 %, contraste al 92 % y brillo al 104 %.
- Opacidad del 90 % sobre el color papel, que les da el tono del sitio.
- Los valores están en los tokens `--map-tiles-filter` y `--map-tiles-opacity`. Son de partida:
  se ajustan al medir sobre el mapa construido, en los tokens y en la dirección visual a la vez.

**Rutas** (CA-69). Cada línea lleva debajo un halo continuo del color papel, 2 px más ancho por
cada lado. La línea se lee contra su halo y no depende de la tesela que tenga debajo.

El color y el patrón salen del piso del destino de la ruta:

| Piso | Color | Patrón | Trazo y hueco, en px |
|---|---|---|---|
| Cálido | Piso cálido | Continuo | — |
| Templado | Piso templado | Trazos largos | 14, 8 |
| Frío | Piso frío | Trazo y punto | 14, 6, 2, 6 |
| Páramo | Páramo | Puntos | 1, 9, con extremos redondos |

Dos rutas del mismo piso se distinguen por la variante, asignada en el orden de la lista:

| Ruta dentro del piso | Variante |
|---|---|
| Primera | Línea de 5 px |
| Segunda | Línea doble: 7 px con un hilo central de 2 px del color papel |
| Tercera | Línea fina: 3 px |

Con más de tres rutas en un mismo piso, las variantes se repiten y la construcción avisa.

**Marcadores.** Uno por ruta, en su punto de inicio.

- Disco de 28 px del color fuerte del piso, borde de 2 px blanco, letra clave en blanco (14 px,
  peso 600). Área táctil de 44 × 44 px.
- Nombre accesible: "Ruta {nombre}".
- A su lado, el nombre de la ruta en un rótulo: 14 px, tinta, fondo papel, borde de 1 px tinta.
  El rótulo va a la derecha del marcador; si choca con otro rótulo o con el borde, prueba a la
  izquierda, arriba y abajo. Si no cabe en ningún lado, se oculta el rótulo de la ruta no
  seleccionada y queda su letra. Ver "Contradicciones y vacíos", punto 8.

**Selección** (CA-70). Se selecciona una ruta desde su línea, su marcador o su botón de la lista.

| Elemento | Cambio |
|---|---|
| Línea | El halo pasa de papel a tinta y la línea engruesa 2 px. Las demás rutas no se atenúan |
| Marcador | Relleno tinta, letra papel; su rótulo siempre visible |
| Mapa | Encuadra la ruta completa, con 32 px de margen. Sin animación si hay movimiento reducido |
| Panel | Muestra la ruta (S9.4) y se anuncia "Ruta seleccionada: {nombre}" |
| Lista | Su elemento muestra "Seleccionada" junto al nombre y su botón queda marcado como pulsado |

- Desde la lista: la página salta al mapa y el foco va al título del panel.
- Desde el mapa: el foco se queda donde está.
- Solo hay una ruta seleccionada. "Ver todas las rutas" quita la selección y vuelve a la vista
  inicial.

**Controles.** Flotan sobre el mapa con fondo papel, borde de 1 px tinta y `--shadow-overlay`.

| Control | Lugar | Tamaño | Nombre accesible |
|---|---|---|---|
| "+" | Arriba a la izquierda | 44 × 44 px | "Acercar" |
| "−" | Debajo del anterior | 44 × 44 px | "Alejar" |
| "Ver todas las rutas" | Arriba a la derecha | 44 px de alto | El mismo texto |

**Atribución** (CA-74). Abajo a la derecha, dentro del mapa: "© colaboradores de OpenStreetMap",
14 px, tinta sobre papel, con enlace. El enlace tiene 44 px de alto de área activa. No se muestra
ninguna otra marca.

#### S9.4 Ruta seleccionada

Panel de color superficie, radio 4 px, relleno de 24 px. h3 "Ruta seleccionada".

| Estado | Contenido |
|---|---|
| Sin selección | "Elige una ruta en el mapa o en la lista para ver su recorrido y su elevación." |
| Con selección | Letra clave y nombre de la ruta; "Elevación: de {mín} a {máx} m"; perfil de elevación si hay datos; ficha completa; enlace "Ir a {nombre del destino}" |

**Perfil de elevación** (CA-76). Solo si la ruta tiene elevación por punto.

- Gráfico de 120 px de alto y todo el ancho del panel. Horizontal: distancia recorrida. Vertical:
  elevación, de la mínima a la máxima de la ruta.
- Una línea de 2 px del color fuerte del piso, con el área inferior en su tinte. Dos rótulos:
  "{mín} m" abajo y "{máx} m" arriba; en la base, "0 km" y la distancia total.
- Alternativa en texto, visible debajo: "Elevación mínima {mín} m, máxima {máx} m, {desnivel} m
  de subida."
- Sin elevación por punto no hay gráfico ni hueco: solo la línea "Elevación: de {mín} a {máx} m".
- No se anima.

#### S9.5 Teclado y tacto (CA-71, CA-72)

**Orden de tabulación:** mapa, "Acercar", "Alejar", "Ver todas las rutas", marcadores en el orden
de la lista, enlace de atribución, y sale hacia el panel.

| Tecla, con el foco en el mapa | Efecto |
|---|---|
| Flechas | Mueven el mapa 80 px |
| "+" y "−" | Acercan y alejan |
| Tab | Pasa al siguiente control; nunca queda atrapado |

- El mapa enfocado muestra el anillo de foco y tiene una instrucción asociada: "Usa las flechas
  para mover el mapa y las teclas más y menos para acercar o alejar."
- Enter o Espacio sobre un marcador selecciona su ruta.

| Gesto en móvil | Efecto |
|---|---|
| Un dedo sobre el mapa | Desplaza la página. Aparece 1.5 s el aviso "Usa dos dedos para mover el mapa" |
| Dos dedos | Mueven y amplían el mapa |
| Toque en un marcador o una línea | Selecciona la ruta |

- En escritorio, la rueda del ratón desplaza la página; amplía el mapa solo después de hacer clic
  en él.
- Las líneas tienen una zona activa de 24 px de ancho. Los marcadores y los botones de la lista
  son la alternativa de 44 px.

#### S9.6 El mapa no carga (CA-75)

Se considera que el mapa no cargó si su código falla, o si a los 10 s no ha llegado ninguna
tesela.

- La caja del mapa conserva su tamaño y muestra, sobre color superficie y con una franja de 6 px
  del color de error a la izquierda: "El mapa no está disponible en este momento. Todas las rutas
  siguen en la lista." Debajo, el botón secundario "Volver a cargar el mapa".
- El mensaje se anuncia al lector de pantalla.
- Desaparecen el panel de ruta seleccionada y, en la lista, las muestras de trazo y los botones
  "Ver en el mapa". Las letras clave se quedan. La lista queda completa y operativa, como sin
  JavaScript.
- Si alguna tesela ya había cargado y otras fallan después, el mapa sigue: los huecos se ven en
  color superficie y las rutas siguen dibujadas.

- CA que cubre: CA-67 a CA-76, CA-79, CA-80.

---

### S10. Contacto

**Jerarquía de contenido:** título, invitación, botón de WhatsApp, datos en texto.

Última sección del inicio, antes del pie (CA-81). Fondo de color superficie de lado a lado.

| N.º | Elemento | Texto |
|---|---|---|
| 1 | Título (h2) | "Escríbenos para planear tu salida" |
| 2 | Invitación | "Cuéntanos qué destino te interesa y cuántas personas van. Te respondemos por WhatsApp." |
| 3 | Botón principal | "Escribir por WhatsApp" |
| 4 | Datos | "WhatsApp: +57 312 795 1683" |
| 5 | | "Horario de atención: lunes a viernes, de 10 a. m. a 10 p. m." |
| 6 | | "Si no usas WhatsApp, escríbenos a danielfajardog1902@gmail.com" |

- El número es texto seleccionable y no se parte entre líneas. El correo es un enlace de correo
  de 44 px de alto; si no cabe, se parte solo antes de la arroba (CA-82, CA-91).
- El botón abre una conversación con el número y un mensaje inicial. Es un enlace: funciona sin
  JavaScript (CA-83).

| Página | Mensaje inicial |
|---|---|
| Inicio y demás páginas | "Hola, quiero información sobre las salidas de Ecoturismo Antioquia." |
| Detalle de destino | "Hola, quiero información sobre la salida a {nombre del destino}." |

| Rango | Disposición |
|---|---|
| Móvil | Apilado. Botón a todo el ancho |
| Tableta y escritorio | Título, invitación y botón en las columnas 1 a 6; datos en las columnas 8 a 12 |

- No hay formulario, ni colores ni logotipos de terceros.
- Los textos y mensajes de esta sección son los del modo de operador real. En modo académico
  cambian el título, la invitación y los mensajes, y se añade una aclaración (S14.2).
- CA que cubre: CA-36, CA-81 a CA-83, CA-91.

---

### S11. Páginas legales

Tres páginas con la misma plantilla: "Política de tratamiento de datos", "Términos y
condiciones", "Política de cancelación".

**Jerarquía de contenido:** aviso de borrador (si aplica), título, fecha, texto.

Lo que sigue sobre fecha, borrador e identificador es del modo de operador real. En modo académico
no hay nada de eso: hay un rótulo de texto de muestra (S14.3).

- Título (h1) propio. Texto corrido en una columna de 70 caracteres; apartados con h2. En
  escritorio, la columna empieza en la columna 3.
- **Texto revisado** (CA-121): bajo el título, "Última revisión: 10 de octubre de 2026" (la fecha
  del contenido, con el mes en letras), 14 px, tinta suave.
- **Texto en borrador** (CA-118), solo en la compilación de desarrollo o vista previa: una banda
  de lado a lado, justo debajo de la cabecera, con fondo tinta y texto papel: "Borrador pendiente
  de revisión" (17 px, peso 600) y "Este texto aún no ha sido revisado. No es la versión final."
  No se muestra fecha de revisión.
- El identificador oficial del operador aparece en la política de datos solo si fue entregado
  (CA-119).
- CA que cubre: CA-118, CA-119, CA-121.

---

### S12. Página de créditos

**Jerarquía de contenido:** título, agradecimiento, fotos agrupadas por destino.

- Título (h1): "Créditos de las fotos".
- Línea: "Todas las fotos de este sitio tienen licencia libre. Gracias a quienes las tomaron y
  las compartieron."
- Un h2 por destino con fotos, en orden de altitud, enlazado a su página.
- Por cada foto: miniatura de 96 px de ancho en su proporción y, a su derecha, su texto
  alternativo como descripción y el crédito de S6.2.
- Una foto por fila en móvil; dos columnas en tableta y escritorio.
- La página sale de las fotos publicadas: no tiene contenido propio que mantener (CA-50).
- Sin fotos publicadas, la página existe, porque el pie siempre la enlaza, y dice: "Por ahora el
  sitio no tiene fotos publicadas."
- CA que cubre: CA-44, CA-45, CA-50.

---

### S13. Página 404

- Título (h1): "Esta dirección no existe".
- Texto: "Puede que el enlace esté mal escrito o que la página ya no esté."
- Dos enlaces: "Ir al inicio" (botón principal) y "Ver destinos" (botón secundario).
- Cabecera y pie completos. Sin ilustración.
- Móvil: botones apilados a todo el ancho. Tableta y escritorio: en línea, en las columnas 1 a 6.
- CA que cubre: CA-37.

---

### S14. Modo de ejercicio académico

**Aprobada por el humano el 2026-10-11** (adición del 2026-10-11), incluidos los textos del contacto y la aclaración en el detalle.

El sitio declara en sus datos si es un ejercicio académico o tiene un operador real (CA-125). El
diseño no deduce el modo: lo recibe. Esta sección fija lo que cambia en modo académico; S14.5
resume las diferencias con el modo de operador real.

Las cuatro piezas comparten un mismo trato, el de **nota del proyecto**: texto en tinta, sin
iconos, sin colores de alerta. Dicen qué es el sitio con el tono de la nota al pie de una lámina,
no con el de un aviso de emergencia ni el de un anuncio.

#### S14.1 Aviso en todas las páginas (CA-126 a CA-130)

**Texto final:** "Proyecto académico. Este sitio no ofrece servicios turísticos reales."

Es el texto propuesto por la spec, sin cambios: es corto, literal y no usa regionalismos.

**Dónde va.** Una franja de lado a lado, lo primero de la página, encima de la cabecera. Aparece
en el inicio, en cada detalle de destino, en las tres páginas legales, en créditos y en la 404.

| Orden en el documento | Elemento |
|---|---|
| 1 | Aviso |
| 2 | Enlace "Saltar al contenido" |
| 3 | Cabecera |
| 4 | Contenido principal (en el inicio, empieza con el titular del hero) |
| 5 | Pie |

- El aviso va antes del titular del hero, como admite CA-1. El orden interno del hero no cambia.
- El aviso no contiene enlaces ni controles, así que el primer elemento enfocable sigue siendo el
  enlace para saltar (CA-94).
- Cuando el enlace para saltar recibe foco, aparece debajo de la franja, sobre el nombre del
  sitio. No tapa el aviso.

**Presentación**

| Propiedad | Valor |
|---|---|
| Fondo | Superficie (`--color-surface`), de lado a lado |
| Límite inferior | Una línea de 2 px en tinta |
| Texto | 14 px (`--text-sm`), peso 500, tinta, alineado a la izquierda con el margen del contenido |
| Contraste | Tinta sobre superficie, 12.3:1 (par de la sección 4.3 de la dirección visual) |
| Relleno | 8 px arriba y abajo (`--space-2`); a los lados, el margen de la grilla |
| Peso del texto | Uniforme: ninguna palabra va resaltada |

- No lleva icono, ni color de alerta, ni botón para cerrar, ni enlace (CA-129).
- No queda fijo al desplazarse: sube con la página. Por eso nunca tapa un control ni un elemento
  enfocado (CA-128).
- Es HTML estático: se ve igual sin JavaScript y no depende de ninguna preferencia guardada.
- No se anima.

**Cuánto ocupa.** Son estimaciones sin renderizar; el alto no es fijo y crece con el texto.

| Ancho | Líneas | Alto aproximado |
|---|---|---|
| 320 px (reflujo) | 2 o 3 | 59 a 79 px |
| 360 px | 2 | 59 px |
| 768 px | 1 | 38 px |
| 1280 px | 1 | 38 px |
| 1280 px con zoom al 200 % | 1 | 38 px de los 640 px efectivos |

Con zoom, o con un tamaño de letra mayor en el navegador, el texto pasa a más líneas y la franja
crece. No se corta, no se abrevia y no provoca desplazamiento horizontal.

**Menú móvil.** El aviso queda encima de la cabecera y el menú se despliega debajo de ella. No se
tocan. Con el menú abierto, el aviso sigue visible arriba.

**Visor de fotos.** El visor es un diálogo a pantalla completa y cubre toda la página, aviso
incluido, mientras está abierto. Al cerrarlo, el aviso está donde estaba.

**Lector de pantalla** (CA-127)

- Es una región con el nombre accesible "Aviso del sitio".
- Su texto es texto real y está antes del contenido principal en el orden de lectura.
- No es una alerta ni una región que se anuncie sola: se lee al llegar a ella.

**Efecto sobre el hero a 360 px**

- El titular, la explicación, el botón y el perfil bajan 59 px (38 px desde 768 px).
- La geometría, las variantes y la selección de puntos de S3 no cambian.
- El titular sigue siendo el elemento más grande de la primera pantalla (CA-10): el aviso ocupa
  cerca de un tercio de su área.
- Lo que cambia es cuánto perfil se ve sin desplazarse. Estimación: en una ventana de 360 × 640
  px, de unos 120 px a unos 60 px; en una de 360 × 800 px, de unos 280 px a unos 220 px, de los
  300 px del perfil.
- Para no perder más, S3.2 fija ahora un dato que no tenía: en móvil, el espacio entre la
  cabecera y el titular es de 24 px (`--space-6`), en los dos modos.

#### S14.2 Contacto (CA-131, CA-132)

**Aclaración, texto final:** "Este contacto es de prueba: no se reservan ni se venden salidas."

En modo académico, la sección de S10 queda así:

| N.º | Elemento | Texto en modo académico |
|---|---|---|
| 1 | Título (h2) | "Contacto de prueba" |
| 2 | Invitación | "Puedes escribirnos para probar cómo funciona el contacto de este proyecto." |
| 3 | Aclaración | "Este contacto es de prueba: no se reservan ni se venden salidas." |
| 4 | Botón principal | "Escribir por WhatsApp" |
| 5 | Datos | Los mismos de S10: número, horario y correo |

- La aclaración va justo encima del botón, a 12 px, y antes de los datos en el orden de lectura:
  se lee antes de pulsar el botón y antes de llegar al correo.
- Estilo: 17 px, peso 600, tinta. Sin icono ni fondo propio.
- El título y la invitación cambian porque los de S10 ("planear tu salida", "te respondemos")
  ofrecen un servicio, y en modo académico los textos no pueden prometerlo (CA-137).

| Rango | Disposición |
|---|---|
| Móvil | Apilado en el orden de la tabla |
| Tableta y escritorio | Título, invitación y aclaración en las columnas 1 a 8. Debajo, en una fila: botón en las columnas 1 a 6 y datos en las columnas 8 a 12 |

**Llamada a contacto del detalle de destino** (S7, bloque 9). En modo académico:

- Título (h2): "Escribir sobre {destino}".
- La misma aclaración, encima del botón.

**Mensaje inicial de WhatsApp en modo académico**

| Página | Mensaje inicial |
|---|---|
| Inicio y demás páginas | "Hola. Escribo desde el sitio Ecoturismo Antioquia, un proyecto académico de prueba." |
| Detalle de destino | "Hola. Escribo desde el sitio Ecoturismo Antioquia, un proyecto académico de prueba. Vi el destino {nombre del destino}." |

#### S14.3 Páginas legales (CA-121, CA-134)

**Rótulo, texto final:** "Texto de muestra de un ejercicio académico. No tiene validez legal."

| Orden | Elemento |
|---|---|
| 1 | Título (h1) de la página |
| 2 | Rótulo |
| 3 | Texto de muestra |

- El rótulo va justo debajo del título, en la columna de lectura, antes de cualquier contenido.
- Estilo: bloque de color superficie con una línea inferior de 2 px en tinta y 16 px de relleno;
  texto de 17 px, peso 500, tinta. Es el mismo trato que el aviso de S14.1, a tamaño de cuerpo.
- Es texto real, visible sin JavaScript.

**Relación con la banda de borrador de S11.** Son de modos distintos y nunca coinciden.

| | Modo de operador real | Modo académico |
|---|---|---|
| Banda "Borrador pendiente de revisión" | Sí, mientras el texto esté en borrador, en vista previa | Nunca |
| Rótulo de texto de muestra | Nunca | Siempre, en las tres páginas |
| "Última revisión: {fecha}" | Sí, cuando el texto está revisado | Nunca |
| Identificador oficial | Sí, si fue entregado | Nunca |

#### S14.4 Pie (CA-98, CA-119)

En modo académico, el bloque de identidad del pie es:

- "Ecoturismo Antioquia", como en S2.
- Debajo: "Proyecto académico" (14 px, color atenuado sobre tinta).
- Ningún identificador oficial, ni línea ni hueco para él.

Los enlaces del pie no cambian.

#### S14.5 Qué cambia entre los dos modos

| Pieza | Modo académico | Modo de operador real |
|---|---|---|
| Aviso sobre la cabecera | En todas las páginas (S14.1) | No existe; no se reserva espacio |
| Hero | Empieza 59 px más abajo en móvil | Como en S3 |
| Contacto: título e invitación | "Contacto de prueba" y su invitación (S14.2) | Los de S10 |
| Contacto: aclaración | Sí, encima del botón | No |
| Mensaje inicial de WhatsApp | Los de S14.2 | Los de S10 |
| Detalle: llamada a contacto | "Escribir sobre {destino}" y aclaración | "¿Te interesa {destino}?" |
| Páginas legales | Rótulo de muestra; sin fecha ni identificador | Banda de borrador o fecha de revisión; identificador si existe |
| Pie: identidad | Nombre y "Proyecto académico" | Nombre e identificador si existe |
| Cabecera, navegación, destinos, galería, mapa, créditos, 404 | Sin cambios | Sin cambios |

- CA que cubre: CA-1, CA-98, CA-119, CA-121, CA-126 a CA-132, CA-134, CA-138.

---

## Estados

| Elemento | Vacío | Cargando | Error | Sin JS | Foco / hover / activo |
|---|---|---|---|---|---|
| Menú móvil | — | — | — | Abre y cierra igual | Control con estados de botón secundario |
| Perfil del hero | Sin destinos el sitio no se construye (CA-100) | Se dibuja en 900 ms | — | Completo, con animación | Puntos: S3.7 |
| Bloque de piso | No se muestra (CA-14) | — | — | Igual | — |
| Destino del listado | Sin fotos: lámina. Dato ausente: fila omitida | Caja de la foto reservada | Foto que no carga: caja con texto alternativo | Igual | Nombre subrayado; anillo de foco |
| Ficha | Fila ausente omitida, sin "N/D" | — | — | Igual | — |
| Foto | — | Caja en color superficie | Texto alternativo en la caja | Igual | — |
| Lámina | Es la presentación de "sin fotos" | Inmediata, sin descarga | — | Igual | Hereda del enlace del destino |
| Fotos del detalle | Bloque omitido | Cajas reservadas | Texto alternativo | Imágenes estáticas | Miniatura: borde de 2 px tinta |
| Rutas del detalle | Bloque y título omitidos (CA-35) | — | — | Igual | — |
| Galería | Sección y enlace omitidos (CA-51) | Cajas reservadas | Texto alternativo | Cuadrícula de imágenes, sin botones (CA-65) | Miniatura: borde de 2 px tinta; anillo de foco |
| Visor | Una foto: sin contador ni botones de cambio | "Cargando la foto…" | "No pudimos cargar esta foto" | No existe | Botones sobre tinta; anillo guayacán; extremo desactivado |
| Mapa | Sección y enlace omitidos (CA-67) | Caja reservada con "Cargando el mapa…" | S9.6 | No hay caja de mapa (CA-80) | Anillo en el mapa, controles y marcadores |
| Ruta seleccionada | Invitación a elegir | — | Se retira si el mapa falla | No existe | Recibe foco al elegir desde la lista |
| Perfil de elevación | Sin datos por punto: no se dibuja (CA-76) | — | — | No existe | — |
| Lista de rutas | Sección omitida | — | Completa aunque el mapa falle, con sus letras clave; sin muestras de trazo ni botones | Completa, con sus letras clave (CA-68); sin muestras de trazo ni botones | Botón "Ver en el mapa" con estado pulsado |
| Contacto | — | — | — | Igual | Botón principal; enlace de correo |
| Aclaración del contacto (modo académico) | Modo de operador real: no existe | — | — | Igual | No es interactiva |
| Aviso académico | Modo de operador real: no existe ni reserva espacio | Inmediato: es HTML estático | — | Igual, completo (CA-128) | No es interactivo; no se puede cerrar (CA-129) |
| Rótulo de texto de muestra (modo académico) | Modo de operador real: no existe | — | Si falta, el sitio no se construye (CA-134) | Igual | No es interactivo |
| Pie: identidad | Modo académico: nombre y "Proyecto académico", sin identificador | — | — | Igual | — |
| Página legal | — | — | Modo de operador real, borrador: banda de aviso. Modo académico: nunca | Igual | — |
| Página de créditos | "Por ahora el sitio no tiene fotos publicadas." | Cajas reservadas | Texto alternativo | Igual | Enlaces |
| Identificador oficial | No se muestra nada (CA-119) | — | — | Igual | — |

---

## Interacciones

| Interacción | Ratón | Teclado | Tacto | Movimiento reducido |
|---|---|---|---|---|
| Saltar al contenido | — | Primer Tab lo muestra; Enter salta | — | Igual |
| Menú móvil | Clic abre y cierra | Enter o Espacio; Esc cierra con JS | Toque | Sin animación en ningún caso |
| "Ver destinos" | Clic salta a la sección | Enter salta y deja el foco en el título de destinos | Toque | Salto inmediato siempre |
| Punto del perfil | Clic abre el detalle; hover resalta | Tab en orden de altitud; Enter abre | Toque en el área de 44 px o en el nombre | Perfil ya dibujado |
| Destino del listado | Clic en la foto, la lámina o el nombre | Tab al nombre; Enter abre | Toque en la foto o el nombre | Igual |
| Enlaces del crédito | Clic abre la licencia o la fuente | Tab; Enter | Toque en el área de 24 px (S6.2) | Igual |
| Miniatura de galería | Clic abre el visor | Enter o Espacio | Toque | Apertura inmediata |
| Visor: cerrar | Clic en "Cerrar" | Esc, o Enter en "Cerrar" | Toque en "Cerrar" | Cierre inmediato |
| Visor: cambiar de foto | Clic en "Anterior" o "Siguiente" | Flechas izquierda y derecha; Enter en los botones | Deslizar más de 48 px, o los botones | Igual: el cambio nunca se anima |
| Mapa: mover | Arrastrar | Flechas, con el foco en el mapa | Dos dedos | Igual |
| Mapa: acercar y alejar | Botones; rueda tras hacer clic en el mapa | "+" y "−", o los botones | Pellizco con dos dedos, o los botones | Sin transición de zoom |
| Mapa: elegir ruta | Clic en la línea o el marcador | Tab al marcador; Enter o Espacio | Toque en el marcador o la línea | Encuadre inmediato |
| Lista: "Ver en el mapa" | Clic | Enter o Espacio; el foco va al panel | Toque | Salto y encuadre inmediatos |
| "Ver todas las rutas" | Clic | Enter o Espacio | Toque | Encuadre inmediato |
| "Volver a cargar el mapa" | Clic | Enter o Espacio | Toque | Igual |
| WhatsApp | Clic abre la conversación | Enter | Toque abre la aplicación | Igual |
| Correo | Clic abre el programa de correo | Enter | Toque | Igual |

---

## Tokens usados

**Existentes**

| Grupo | Tokens |
|---|---|
| Color base | `--color-bg`, `--color-surface`, `--color-ink`, `--color-ink-muted`, `--color-line`, `--color-white` |
| Color de acción | `--color-primary`, `--color-accent`, `--color-danger` |
| Pisos | `--color-zone-warm`, `--color-zone-temperate`, `--color-zone-cold`, `--color-zone-paramo` y sus cuatro `-tint` |
| Sobre tinta | `--color-on-ink`, `--color-on-ink-muted` |
| Foco | `--color-focus`, `--color-focus-on-ink`, `--focus-ring-width`, `--focus-ring-offset` |
| Tipografía | `--font-display`, `--font-sans`; `--text-sm`, `--text-base`, `--text-lg`, `--text-xl`, `--text-2xl`, `--text-3xl`, `--text-4xl`, `--text-hero`; los cuatro pesos; `--tracking-display` |
| Medidas | `--container-prose`, `--container-page`, `--size-touch-target`, `--size-zone-rail`, `--size-photo-small`; `--space-1` a `--space-24` |
| Mapa | `--map-tiles-filter`, `--map-tiles-opacity` |
| Radios y sombra | `--radius-sm`, `--radius-md`, `--radius-full`, `--shadow-overlay` |
| Movimiento | `--duration-fast`, `--duration-base`, `--duration-draw`, `--ease-out`, `--ease-linear` |

`--text-5xl`, `--space-32` y `--shadow-none` no se usan en esta feature.

Todos los pares de color de este documento están en la sección 4.3 de la dirección visual. Dos
usos nuevos son pares ya medidos con otro nombre: texto papel sobre tinta suave (botón activo) es
el par "tinta suave sobre papel", 6.6:1; el borde blanco de los marcadores no transmite
información.

**Nuevos (aprobados por el humano el 2026-10-10 y añadidos a `tokens.css` y a la dirección visual)**

| Token | Valor | Justificación |
|---|---|---|
| `--size-photo-small` | `30rem` (480 px) | Es el límite del "tamaño menor" de S6.1, que deciden CA-40 y CA-42. Lo usan el listado, el detalle y la validación de fotos; conviene un solo lugar |
| `--map-tiles-filter` | `grayscale(1) contrast(0.92) brightness(1.04)` | Tratamiento de las teselas de S9.3. Se ajustará al medir CA-73 y debe cambiar en un solo sitio |
| `--map-tiles-opacity` | `0.9` | Igual que el anterior |

---

## Trazabilidad

Los 131 criterios activos (CA-1 a CA-83, CA-91 y CA-93 a CA-139; 139 números, 8 retirados). Los criterios de validación de contenido no tienen interfaz propia: el
diseño fija qué se ve cuando el dato falta, que es siempre "nada".

| Criterios | Tema | Sección |
|---|---|---|
| CA-1, CA-2 | Orden del hero y cifras del titular; en modo académico, el aviso va antes del titular | S3.1, S14.1 |
| CA-3 | "Ver destinos" y foco | S3.9 |
| CA-4 | Cuatro bandas con nombre | S3.5, S3.6 |
| CA-5, CA-6 | Un punto por destino, enlace de 44 px con nombre | S3.5, S3.7 |
| CA-7 | Perfil en 360 px, máximo cinco puntos | S3.2, S3.8 |
| CA-8 | Nombre accesible y lista de enlaces | S3.9 |
| CA-9 | Dibujo en 900 ms y movimiento reducido | S3.9 |
| CA-10 | Sin fotografía; el titular es el mayor elemento | S3.1 |
| CA-11 | Nota de esquema | S3.1 |
| CA-12, CA-13 | Orden por altitud y desempate | S4, S3.5 |
| CA-14 | Piso sin destinos | S4, Estados |
| CA-15 | Destino principal y menores | S4 |
| CA-16 | Regla de altitud por rango de ancho | S1, S4 |
| CA-17, CA-18, CA-19 | Contenido del destino, enlaces con nombre propio, uno por destino | S4 |
| CA-20 | Destino sin altitud válida | Sin interfaz; S3.5 rechaza los mismos datos |
| CA-21, CA-22 | Siete datos en orden; dato ausente | S5 |
| CA-23 | Escritura de la altitud | S3.1, S5, S7 |
| CA-24, CA-25, CA-26, CA-28 | Formatos de clima, duración, distancia y edad | S5 |
| CA-27 | Dificultad con palabra y marcas | S5 |
| CA-29 | Un mismo piso en todo el sitio | S5, S3.5, S8.1 |
| CA-30 | Etiqueta asociada al valor | S5 |
| CA-31 | Una página por destino publicado | S7; sin decisiones de interfaz |
| CA-32, CA-34, CA-35, CA-36 | Contenido del detalle, volver, rutas, contacto | S7, S10 |
| CA-33 | Título y descripción del documento | S7 |
| CA-37 | Página 404 | S13 |
| CA-38, CA-39 | Lámina de altitud y sus cuatro dibujos | S6.3, S4 |
| CA-40, CA-41, CA-42 | Detalle según el número y la resolución de las fotos | S6.4, S7 |
| CA-43 | Ancho máximo de una foto | S6.1 |
| CA-44, CA-45 | Crédito visible y "recortada" | S6.2, S8, S12 |
| CA-46, CA-47 | Foto sin datos o con licencia no aceptada | Sin interfaz: la foto no se publica |
| CA-48 | Texto alternativo | S6.2, S1 |
| CA-49 | Proporciones, sin texto ni filtros | S6.1 |
| CA-50 | Página de créditos | S12, S2 |
| CA-51 | Sin fotos no hay galería | S8.1, S2 |
| CA-52, CA-53 | Grupos por piso y crédito en la cuadrícula | S8.1, S6.2 |
| CA-54 | Miniatura que abre el visor | S8.1 |
| CA-55 a CA-64 | Visor | S8.2 |
| CA-65 | Galería sin JavaScript | S8.1, Estados |
| CA-66 | Descargas diferidas de la galería | S8.1, S8.2 |
| CA-67 | Sin rutas no hay sección | S9, S2 |
| CA-68 | Lista de rutas siempre visible | S9.1 |
| CA-69 | Rutas con nombre y patrón | S9.3 |
| CA-70 | Selección, encuadre y panel | S9.3, S9.4 |
| CA-71, CA-72 | Teclado y tacto en el mapa | S9.5, S9.3 |
| CA-73 | Contraste de rutas y legibilidad de teselas | S9.3 |
| CA-74 | Atribución del mapa | S9.3 |
| CA-75 | El mapa no carga | S9.6 |
| CA-76 | Perfil de elevación y su alternativa | S9.4 |
| CA-77, CA-78 | Ruta sin trazado o con datos inválidos | Sin interfaz: la ruta no se publica |
| CA-79 | Descarga diferida del mapa | S9.2 |
| CA-80 | Mapa sin JavaScript | S9.1, S9.2 |
| CA-81, CA-82, CA-83 | Sección de contacto, datos en texto, WhatsApp | S10, S2 |
| CA-91 | Contacto en 360 px | S10 |
| CA-93, CA-94 | Navegación y enlace para saltar | S2 |
| CA-95 | Idioma, encabezados y regiones | S1 |
| CA-96 | Título, descripción y datos para redes del inicio | Sin decisiones de interfaz; sin imagen, como en S3.1 |
| CA-97 | Mapa del sitio e instrucciones para buscadores, solo en modo de operador real | Sin interfaz |
| CA-98 | Contenido del pie, con la identidad de cada modo | S2, S14.4 |
| CA-99, CA-100 | Mensajes de error de la construcción | Sin interfaz; Estados |
| CA-101 | "Tú" e infinitivo | Todos los textos de S2 a S13 |
| CA-102 | Términos locales explicados | S3.1 |
| CA-103 | Cifras con unidad; sin precios | S5, S3.6 |
| CA-104 | Altitudes sin verificar | Sin interfaz: el destino no se publica |
| CA-105 | Solo tokens; sin degradados | Tokens usados; S3.5 y S6.3 usan colores planos |
| CA-106, CA-107 | Teclado y anillo de foco | S1, Interacciones |
| CA-108, CA-109 | Análisis automático y lector de pantalla | S1 a S13 (nombres accesibles y estados) |
| CA-110, CA-111 | 360 px y reflujo | S1, y la fila de móvil de cada sección. Los enlaces del crédito son la excepción de S6.2 |
| CA-112 | Sin JavaScript | Columna "Sin JS" de Estados |
| CA-113 | Movimiento reducido | S1, S3.9, S8.2, Interacciones |
| CA-114 | Pares de contraste | Tokens usados |
| CA-115, CA-116 | Lighthouse y métricas de carga | S3.1, S1, S8.1, S9.2 |
| CA-117 | Imagen que no carga | S1, Estados |
| CA-118 | Aviso de borrador (modo de operador real); en modo académico rige CA-134 | S11, S14.3 |
| CA-119, CA-120 | Identificadores ausentes, de relleno o, en modo académico, nunca mostrados | S2, S11, S14.4; sin interfaz para el relleno |
| CA-121 | Páginas legales: revisadas (operador real) o de muestra (académico) | S11, S14.3, S2 |
| CA-122 | Altitud fuera del rango declarado o umbrales desordenados | Sin interfaz: la construcción falla; S3.5 ("Datos que el generador rechaza") |
| CA-123 | Control "Menú" en 360 px | S2 |
| CA-124 | Revisión humana con capturas del perfil y las láminas | Punto de control, al inicio; S3.3, S3.10, S6.3 |
| CA-125 | Declaración explícita del modo | Sin interfaz; S14 recibe el modo, no lo deduce |
| CA-126 | Aviso académico en todas las páginas, en la primera pantalla | S14.1 |
| CA-127 | Aviso: texto real, región con nombre, antes del contenido | S14.1 |
| CA-128 | Aviso completo sin JavaScript y a 360 px, sin tapar nada | S14.1 |
| CA-129 | Aviso sin control para cerrarlo | S14.1 |
| CA-130 | Aviso: contraste y tamaño de letra | S14.1 |
| CA-131 | Aclaración de contacto de prueba | S14.2 |
| CA-132 | Mensaje inicial de WhatsApp en modo académico | S14.2 |
| CA-133 | Sitio no indexable en modo académico | Sin interfaz |
| CA-134 | Rótulo de texto de muestra en las páginas legales | S14.3 |
| CA-135 | Contenido veraz de la política de datos | Sin interfaz propia: es contenido; usa la plantilla de S11 y S14.3 |
| CA-136 | Orígenes externos contactados | Sin interfaz. El diseño solo pide un origen externo: las teselas del mapa (S9.3); las fuentes son autoalojadas |
| CA-137 | Textos que no prometen servicios | S14.2 (título, invitación y mensajes del contacto); el resto es contenido |
| CA-138 | Modo de operador real | S14.5 |
| CA-139 | Puerta de publicación común a los dos modos | Sin interfaz |

---

## Contradicciones y vacíos detectados

Ninguno se resolvió en silencio. Cada punto dice qué asume este diseño.

**Resolución (2026-10-10):** el humano aceptó los trece puntos tal como se asumieron, salvo el
punto 5, que decidió en el otro sentido. `spec-writer` lleva estos supuestos a la spec.

**Registro histórico:** esta sección describe la spec tal como estaba antes de esa revisión. La
spec vigente ya recoge los trece puntos; ante cualquier diferencia, manda la spec. La zona activa
de 24 px de las líneas de ruta (S9.5) queda cubierta por la excepción de CA-110.

1. **CA-7, "el destino principal".** Dice "uno por cada piso con destinos más el destino
   principal", pero CA-15 define un principal por piso, no uno del sitio. Este diseño toma el
   principal de cada piso y añade el destino más alto de los restantes (S3.8).
2. **CA-2 y CA-23, titular del hero.** CA-23 pide que la primera altitud de una página diga
   "metros de altitud"; CA-2 pide que cada cifra del titular lleve la unidad "metros". Este diseño
   escribe "de {mín} a {máx} metros de altitud": una sola unidad para las dos cifras. Leído al pie
   de la letra, CA-2 pediría repetir "metros".
3. **CA-21, altitud de una ruta.** La ficha de ruta debe abrir con "altitud (con nombre del
   piso)", pero una ruta tiene elevación mínima y máxima, no una altitud. Este diseño muestra en
   esa fila la altitud y el piso del destino al que pertenece la ruta, y la elevación en una línea
   aparte (S5, S9).
4. **Altitudes fuera del rango declarado.** Nada impide que un destino tenga una altitud menor que
   la mínima o mayor que la máxima del titular, ni que los umbrales estén desordenados. El perfil
   no puede dibujarse con esos datos; S3.5 propone que la construcción falle.
5. **CA-44 contra CA-110.** El crédito debe ir en 14 px con dos enlaces, y todo control táctil
   debe medir 44 × 44 px. **Decidido:** el crédito va en una línea y sus enlaces miden 24 px, por
   la excepción "en línea" de WCAG 2.2 (2.5.8). Es la única excepción a CA-110 y la spec debe
   recogerla (S6.2).
6. **CA-42 solo habla del detalle.** No dice qué muestra el listado cuando el destino principal de
   un piso solo tiene fotos de baja resolución. Este diseño aplica la misma regla: lámina (S4).
7. **CA-22, dato parcial.** No define qué pasa si hay distancia pero no desnivel, o al revés. Este
   diseño muestra lo que hay y ajusta la etiqueta (S5).
8. **CA-69, "cada ruta se dibuja con su nombre".** En 360 px los rótulos pueden no caber. Este
   diseño oculta el rótulo de las rutas no seleccionadas que no quepan y deja su letra clave; el
   nombre sigue en la lista y en el nombre accesible del marcador (S9.3).
9. **CA-41, "la galería".** No aclara si las demás fotos van en la galería del inicio o en el
   detalle. Este diseño las muestra en las dos: todas las fotos están en la galería del inicio y
   el detalle tiene su propia cuadrícula con visor (S7).
10. **CA-52, "comparte fila".** No define qué pasa si el piso contiguo tampoco llega a tres fotos,
    ni si no hay piso contiguo. Regla propuesta en S8.1.
11. **CA-68 y CA-70 duplican la ficha.** La lista siempre muestra la ficha completa de cada ruta
    y el panel la repite al seleccionar. Se diseñó como pide la spec; en móvil alarga la sección.
12. **Dirección visual desactualizada.** Su sección 10 aún lista como abiertas tres preguntas que
    la spec ya resolvió (contacto, página de créditos, teselas); la sección 4.1 menciona un
    formulario que ya no existe; y el encabezado de la sección 4.3 dice "por verificar con
    herramienta" aunque el aviso inicial dice que ya se recalculó. **Corregido** en la dirección
    visual el 2026-10-10.
13. **Diferencias con la dirección visual, a propósito.** Los bloques de piso no llevan fondo de
    tinte (S1); la cifra de la lámina tiene dos tamaños menores (S6.3); la animación del perfil es
    una cubierta que se retira, no un trazo (S3.9). **Aceptadas** y ya reflejadas en la dirección
    visual (secciones 3.1, 4.2, 5.1, 5.4, 6.5 y 7).

---

## Decisiones del humano (2026-10-10)

| N.º | Tema | Decisión | Dónde queda |
|---|---|---|---|
| 1 | Crédito de las fotos | En una línea, con enlaces de 24 px, por la excepción "en línea" de WCAG 2.2 (2.5.8) | S6.2, S1 |
| 2 | Tokens nuevos | Aprobados los tres y añadidos a `tokens.css` y a la dirección visual | Tokens usados |
| 3 | Etiquetas del perfil | Solo el nombre del destino; la altitud se anuncia al lector de pantalla | S3.7, S3.9 |
| 4 | Menú móvil | Control "Menú" que abre sin JavaScript | S2 |
| 5 | Perfil y láminas construidos | Revisión con captura y aprobación humana, obligatoria durante la implementación; ahí se decide el respaldo | Punto de control, al inicio; S3.10 |
| 6 | Contradicciones y vacíos | Aceptados como se asumieron; el punto 5, según la decisión 1 | Sección anterior |
| 7 | Diferencias con la dirección visual | Aceptadas las tres | Punto 13 |

## Revisión con capturas (T-058)

**Ajustes R1 a R18 aprobados por el humano el 2026-10-11** (incluidos el opcional R11 y R12). Falta la aprobación final de CA-124 sobre capturas nuevas. Es el paso 2 del punto de control inicial
(CA-124): comparación de las capturas del perfil y las láminas construidos con S3 y S6.3.

Capturas revisadas: escenarios `completo` (7 destinos de prueba), `sin-fotos` (4) y `real` (6), a
320, 360, 768 y 1280 px, más la primera pantalla a 360 × 640 y 360 × 800 px y las láminas. No se
generaron capturas nuevas: los ajustes de abajo no se han visto dibujados.

**Recomendación: aprobar con ajustes, sin aplicar el respaldo de S3.10.** Los ajustes R1 a R9,
R12 a R14 y R16 a R17 son necesarios; el humano aprueba sobre capturas nuevas hechas con ellos.

Al aprobarse, los valores de esta sección sustituyen a los de S2, S3.4, S3.5, S3.7 y S6.3.

### Juicio general

- **A 768 y 1280 px el perfil se lee como una montaña en corte**, no como un gráfico: tiene
  cuerpo, estratos dentro de la roca, rellanos, cumbre por encima del último destino y lado lejano
  cortado. Con el contenido real no hay recortes ni avisos.
- **A 360 px es la variante débil.** Con contenido real funciona. Con nombres largos (`completo`,
  `sin-fotos`) hay etiquetas cortadas y líneas guía sin texto, y la ladera se ve como una escalera
  apretada. Se corrige con reglas generales (R1 a R6); no hace falta cambiar la estructura de S3.
- **Tres láminas cumplen y una no:** la de piso frío sale quebrada, como un sismograma.
- Si tras los ajustes la variante compacta sigue dando avisos con `completo`, se aplica el
  respaldo de S3.10 solo en esa variante.

### Perfil: qué cumple y qué no

| Variante | Cumple | No cumple |
|---|---|---|
| Amplia (1280 px) | Silueta, estratos, rellanos, cumbre, etiquetas en roca y cielo sin colisiones, en los tres escenarios | Las curvas de eco y los límites entre pisos pasan por debajo de varios textos ("100 m", "Cañón del Sol Quieto", "Bosque de Niebla Serena"). Los nombres de piso salen en minúscula |
| Media (768 px) | Lo mismo con `real` y `sin-fotos` | Con `completo`, "Salto Cinta de Plata" baja 13 px fuera de la figura y se corta. Un límite entre pisos cruza "Bosque de Niebla Serena" |
| Compacta (360 y 320 px) | Con `real`: cinco puntos, todas las etiquetas visibles | Con `completo`: dos etiquetas fuera de la figura y dos guías sin texto. Con `sin-fotos`: una etiqueta fuera. Rellanos y subidas casi verticales. Límites entre pisos sobre las etiquetas |

Lecturas de `astro-developer` que se aceptan y pasan a ser parte de S3: los discos de los puntos
son obstáculos para las etiquetas; el interlineado de etiqueta es de 20 px con la línea base a 15
px; la franja de piso del borde derecho se recorta con la altura de la silueta en `x = W`; la base
bajo el valle es una capa aparte.

### Ajustes del perfil

Todos son reglas generales. Ninguno cambia la estructura de S3: R1 a R3 y R7 a R8 completan el
procedimiento de etiquetas de S3.7; R4 a R6 cambian constantes de S3.4.

| N.º | Qué cambia | Antes | Ahora | Por qué |
|---|---|---|---|---|
| R1 | Límite de la figura | Si ninguna opción servía, la etiqueta quedaba en la última posición probada, aunque saliera | Ninguna opción puede salir de la figura. El paso 4 de S3.7 deja de alejarse al tocar un borde | Lo que sale se recorta: es la causa de todas las etiquetas cortadas |
| R2 | Qué hacer cuando no hay sitio (paso 5, nuevo) | No existía | **Rótulo al margen.** La etiqueta va a la franja superior (de `y = 4` a `Pt − 4`) si su posición preferida es el cielo, o a la franja de la base (de `yValle + 4` a `H − 4`) si es la roca. Se desliza en horizontal de 4 en 4 px hasta quedar libre, sin salir de la figura y sin dejar de cubrir la vertical del punto. Una guía vertical de 1 px en tinta suave une el punto con el borde del rótulo | Encima de un punto siempre hay cielo y debajo siempre hay roca: la guía nunca cruza la línea de cumbres |
| R3 | Guías | Podía quedar una guía sin texto | Una guía solo se dibuja si su rótulo está completo dentro de la figura, y termina tocándolo. Las guías ya dibujadas son obstáculos para las etiquetas siguientes | Evita las guías huérfanas |
| R4 | Partición de la etiqueta en la variante compacta | Hasta dos líneas | Hasta tres líneas | A 360 px un nombre de 20 caracteres o más no cabe en dos |
| R5 | Márgenes y alto | Compacta: `Pt` 32, `Pb` 32, `H` 300. Media: `Pb` 48, `H` 340 | Compacta: `Pt` 56, `Pb` 56, `H` 340. Media: `Pb` 56, `H` 348 | Una etiqueta de dos líneas a 12 px de su punto necesita 56 px; con 32 o 48 no cabía bajo el punto más bajo ni sobre el más alto. Los altos suben para no encoger la montaña |
| R6 | Rellano máximo de la variante compacta | 24 px | 12 px | Deja más ancho para las subidas, que hoy son casi verticales |
| R7 | Líneas bajo los textos | Curvas de eco y límites entre pisos pasaban por debajo | Se interrumpen a 3 px de cada texto de la figura: etiquetas, cifras de altitud y nombres de piso | Es la convención de los mapas y la misma de la lámina (S6.3). La línea de cumbres nunca se interrumpe |
| R8 | Línea de cumbres como obstáculo | No lo era de forma expresa | Ninguna etiqueta puede quedar a menos de 4 px de la línea de cumbres | Con R2 una etiqueta puede moverse lejos de su zona segura |
| R9 | Nombres de piso | Salen en minúscula ("páramo") | Con mayúscula inicial, como fija S3.6 ("Páramo") | Coherencia con la lámina y el listado |
| R10 | Condición de aprobación | — | La revisión de CA-124 no se aprueba mientras la construcción emita algún aviso del perfil con `completo`, `sin-fotos` o `real` | Un aviso significa una etiqueta sin sitio |
| R11 | Llegada de cada subida al rellano (opcional) | `C2 = (Q.x − 0.25 × dx, Q.y)`: llega horizontal | `C2 = (Q.x − 0.25 × dx, Q.y + 0.25 × (P.y − Q.y))`: llega con pendiente y forma un hombro | Las subidas son todas una misma S suave, lo que recuerda a un gráfico escalonado. No bloquea la aprobación; se juzga con captura |

Si, con R1 a R8, un rótulo al margen tampoco encuentra sitio, la construcción avisa (R10) y el
caso vuelve a diseño.

### Primera pantalla a 360 px

| Ventana | Perfil visible hoy (`real` / `completo`) | Con el aviso académico de S14.1 (59 px) |
|---|---|---|
| 360 × 640 px | 141 px / 104 px | Unos 82 px / 45 px |
| 360 × 800 px | 300 px / 264 px | Unos 241 px / 205 px |

| N.º | Qué cambia | Antes | Ahora | Por qué |
|---|---|---|---|---|
| R12 | Tamaño de la explicación del hero en móvil | 21 px | 17 px (`--text-base`) por debajo de 768 px | Recupera unos 46 px, casi todo lo que quita el aviso. El titular sigue siendo el elemento mayor (CA-10). Cambia una regla de la dirección visual (sección 3.1) |

### Láminas

| Piso | ¿Se ve su rasgo? | Observación |
|---|---|---|
| Cálido | Sí | Dos haces de curvas junto a un eje sinuoso, con corredor central. Es la mejor de las cuatro |
| Templado | A medias | Se ven dos lomas con dos anillos cada una y la tercera como un solo círculo. Las curvas comunes casi no se distinguen del tinte |
| Frío | No | Las curvas salen en zigzag anguloso. Se lee como una señal o un sismograma, no como una ladera |
| Páramo | Sí | Pocas curvas y dos anillos. Los anillos salen poligonales |

Las cuatro se distinguen entre sí a simple vista por su forma. A 120 px el dibujo queda recortado
y la lámina se reconoce por el color, la cifra y el nombre, que es lo previsto. Los cuatro tamaños
de cifra (21, 33, 42 y 52 px) coinciden con S6.3.

| N.º | Qué cambia | Antes | Ahora | Por qué |
|---|---|---|---|---|
| R13 | Retícula y trazo de las cuatro láminas | Retícula de 4 unidades; segmentos rectos | Retícula de 2 unidades; cada curva se suaviza (curva que pasa por los puntos, sin esquinas) | Quita los quiebros del frío y los anillos poligonales del páramo |
| R14 | Función del piso frío | `… + 7·sin(2π·x/70 + 0.3) + 3·sin(2π·x/23 + 1.1)` | `h = 0.45·(200 − y) + 0.03·x + 6·sin(2π·x/90 + 0.3) + 2.5·sin(2π·x/41 + 1.1)`; mismos niveles y maestras | La onda de periodo 23 es demasiado corta para la retícula y produce el zigzag |
| R15 | Piso templado | Niveles 10, 20, … 80; maestra 50; tercera colina con `A = 42` | Niveles 6, 12, … 84; maestras 18, 36, 54 y 72; tercera colina con `A = 55` | Más anillos por loma y más curvas en color fuerte, porque el color de línea apenas se ve sobre este tinte |
| R16 | Zona del texto | — | Comprobar en la captura nueva que ninguna curva pasa bajo la cifra ni bajo el nombre del piso, en los cuatro tamaños | En las capturas a tamaño natural no se distingue con certeza |

### Cabecera a 320 y 360 px (CA-110, CA-111)

| N.º | Qué cambia | Antes | Ahora | Por qué |
|---|---|---|---|---|
| R17 | Nombre del sitio | 21 px en móvil; sin tamaño fijado en tableta y escritorio | 21 px en todos los anchos. Si no cabe junto al control "Menú", se parte en dos líneas ("Ecoturismo" y "Antioquia"); la cabecera crece en alto | A 320 px la página desborda 15 px por la cabecera. El nombre es lo único que puede ceder: el control no puede encogerse |
| R18 | Control "Menú" | Relleno lateral de 24 px, el del botón secundario | Relleno lateral de 12 px (`--space-3`); sigue midiendo al menos 44 × 44 px y no se encoge ni se parte | Confirma el ajuste de `astro-developer` para que quepa a 360 px |

Con R17 la página no debe desbordar a 320 px. El perfil no causa desbordamiento en ningún ancho.

## Pendiente

- La aprobación humana de la revisión con capturas (T-058) y las capturas nuevas con sus ajustes.
- La revisión con captura del perfil y las láminas (punto de control inicial).
- La medición de CA-73 sobre el mapa construido, que puede cambiar los dos tokens de teselas.
- La aprobación humana de la adición del 2026-10-11 (S14 y sus remisiones).

---
Estado: APROBADO (2026-10-10, aprobado por el humano). Adición del 2026-10-11 (modo de ejercicio
académico, S14): aprobada por el humano el 2026-10-11. Revisión con capturas (T-058): pendiente de
aprobación humana
