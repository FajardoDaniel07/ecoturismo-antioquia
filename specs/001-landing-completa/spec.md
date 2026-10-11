# 001 — Landing completa de Ecoturismo Antioquia

## Contexto y objetivo

Ecoturismo Antioquia es la landing de un servicio de ecoturismo regional: salidas de 1 a 3 días por
Antioquia (caminatas, avistamiento de aves, fincas cafeteras, ríos y páramo). Quien visita el sitio
casi nunca conoce el territorio en detalle y planea desde el celular, a veces con señal limitada en
zonas rurales.

**Objetivo de la página:** ayudar a elegir un destino o una ruta y llevar a la persona al contacto.

**Naturaleza del sitio (decisión del humano, 2026-10-11):** el sitio es un **ejercicio académico**.
No existe un operador real ni datos legales de un operador; el sitio no ofrece servicios turísticos
reales. Por eso la spec define un **modo de ejercicio académico**, declarado en los datos del sitio
(CA-125), que cambia lo que el sitio muestra y exige (sección N). Se conserva también el **modo de
operador real** (ver "Convenciones" y CA-138) para que las reglas estrictas para un operador real no
se pierdan; el modo académico es una variante declarada, no el reemplazo de esas reglas.

Esta feature entrega el sitio completo en una sola versión, con estas piezas:

1. Hero con el perfil altitudinal de Antioquia.
2. Destinos turísticos, ordenados por altitud, y la página de detalle de cada destino.
3. Galería interactiva con visor de fotos.
4. Mapa de rutas.
5. Contacto por WhatsApp, con correo visible de respaldo.
6. Páginas de textos legales (política de datos, términos y cancelación): en modo académico, como
   textos de muestra rotulados; en modo de operador real, como borradores hasta su revisión.
7. Aviso visible de proyecto académico en todas las páginas (modo académico).

**Principio de organización:** la altitud ordena el sitio. Cada destino tiene una altitud y
pertenece a un piso térmico (zona de clima que depende de la altura: cálido, templado, frío y
páramo). Cada ruta tiene datos de elevación. Cada salida muestra una ficha con siete datos
comparables.

**Restricciones de contenido ya decididas** (fuente: `docs/design/direccion-visual.md`, aprobada el
2026-10-10, y decisiones del humano):

- Solo español de Colombia (es-CO), trato de "tú" en el texto corrido e infinitivo en los botones.
- No hay fotografía propia. Las fotos vienen de fuentes con licencia libre (CC0, dominio público,
  CC BY, CC BY-SA) y llevan crédito visible. Un destino puede no tener fotos y debe verse completo.
- El perfil del hero y las láminas de altitud se derivan de los datos de los destinos: lo que
  cambia en los datos cambia en la página, sin intervención manual.
- Las cifras de altitud y los umbrales entre pisos están **pendientes de verificar** por
  `content-curator`. Esta spec no las da por ciertas; usa "N" como marcador donde haría falta una
  cifra.
- Los textos de destinos, rutas y contacto describen lugares y recorridos; no prometen servicios,
  guías, cupos ni precios (CA-137).

**Datos de contacto reales, confirmados por el humano (2026-10-10) y mantenidos el 2026-10-11:**

- WhatsApp: +57 312 795 1683 (Colombia). Se mantiene real porque el humano quiere probar la
  conexión con un WhatsApp real.
- Horario de atención: lunes a viernes, de 10 a. m. a 10 p. m.
- Correo de contacto: danielfajardog1902@gmail.com.
- No existe operador real: no hay Registro Nacional de Turismo, NIT ni razón social, y no se
  inventan (CA-119).

## Usuarios

| Usuario | Qué necesita | Situación típica |
|---|---|---|
| Visitante de Medellín u otra ciudad colombiana | Elegir rápido un plan de fin de semana y saber cuánto exige | Celular, datos móviles |
| Visitante extranjero que lee español | Entender dónde queda cada destino, qué clima hace y cuánto se tarda en llegar | Celular o portátil, sin conocimiento del territorio |
| Familia con niños | Saber de entrada si una salida es apta para su grupo (dificultad, duración, edad sugerida) | Celular, comparando varias opciones |
| Persona que usa lector de pantalla o solo teclado | Poder hacer todo lo anterior sin ratón ni vista | Escritorio o celular |
| Persona con señal limitada o sin JavaScript | Poder leer y comparar salidas aunque el mapa o el visor no carguen | Zona rural, conexión intermitente |
| Evaluador del ejercicio académico | Revisar el sitio y probar el contacto sabiendo que no es un servicio real | Escritorio o celular |

## Historias de usuario

- **HU-1:** Como visitante que no conoce Antioquia quiero ver de entrada un perfil de altitud con los
  destinos ubicados a su altura para entender cómo cambia el clima y elegir a qué altura quiero
  caminar.
- **HU-2:** Como visitante quiero ver los destinos ordenados de menor a mayor altitud y agrupados por
  piso térmico para comparar opciones con un criterio claro.
- **HU-3:** Como familia quiero una ficha con los mismos siete datos, en el mismo orden, en cada
  salida para saber si es apta para mi grupo sin tener que buscar en el texto.
- **HU-4:** Como visitante quiero una página por destino con su descripción, ficha, fotos y rutas
  para decidir si lo elijo.
- **HU-5:** Como visitante quiero que un destino sin fotos se vea completo y con la misma jerarquía
  que uno con fotos para no pensar que está "incompleto" o es menos confiable.
- **HU-6:** Como visitante quiero ver las fotos en grande, con su autor y licencia visibles, para
  imaginar el lugar y reconocer el trabajo de quien la tomó.
- **HU-7:** Como visitante quiero ver las rutas sobre un mapa y consultar su ficha y elevación para
  saber por dónde pasan y cuánto exigen.
- **HU-8:** Como visitante con conexión débil o sin JavaScript quiero seguir viendo las fotos como
  cuadrícula y las rutas como lista con enlaces para no quedarme sin información.
- **HU-9:** Como visitante quiero contactar por WhatsApp, o por correo si no uso WhatsApp, desde
  cualquier página para hacer mi consulta (en el modo académico, para probar la conexión).
- **HU-10:** Como persona que usa teclado o lector de pantalla quiero recorrer todo el sitio y usar
  el visor, el mapa y el contacto sin ratón ni vista.
- **HU-11:** Como visitante desde el celular quiero que el sitio sea legible y usable a 360 px de
  ancho y cargue con rapidez para planear mi salida sin frustración.
- **HU-12:** Como persona del equipo editorial quiero que el sitio no publique datos incompletos o
  sin verificar (altitud, licencia de foto, geometría de ruta, datos de contacto y, en modo de
  operador real, identificadores oficiales y textos legales sin revisar) para no mostrar información
  errónea.
- **HU-13:** Como visitante quiero encontrar en el pie la política de tratamiento de datos, los
  términos y la política de cancelación para saber qué condiciones aplican antes de contactar; en el
  modo académico, quiero que estén rotulados como textos de muestra sin validez legal.
- **HU-14:** Como visitante quiero ver en cada página un aviso de que este es un proyecto académico y
  que no ofrece servicios turísticos reales para no creer que puedo reservar o contratar una salida.

## Alcance

Dentro de esta feature:

- Página de inicio con hero, destinos, galería, mapa de rutas y contacto.
- Una página de detalle por cada destino publicado.
- Ficha de salida (siete datos) en destinos y rutas.
- Lámina de altitud como presentación de pleno derecho para destinos sin fotos.
- Créditos de fotos junto a cada imagen y una página que los reúne.
- Contacto por WhatsApp y correo visible de respaldo.
- Modo de ejercicio académico: declaración en los datos, aviso en todas las páginas, sitio no
  indexable, textos legales de muestra y política de datos veraz.
- Conservación del modo de operador real y de la puerta estricta de publicación.
- Textos legales: de muestra en modo académico; borradores de `content-curator` en modo de operador
  real.
- Navegación entre secciones, pie de página y página para direcciones inexistentes.
- Requisitos transversales de accesibilidad, rendimiento, mejora progresiva y lenguaje.

## Convenciones de esta spec

- Etiqueta de verificación al final de cada criterio: **[unit]** prueba unitaria, **[e2e]** prueba
  de extremo a extremo en navegador, **[axe]** comprobación automática de accesibilidad,
  **[manual]** revisión humana con lista de pasos concreta, **[build]** comprobación al construir
  el sitio.
- Un criterio **retirado** conserva su número para no romper referencias, pero no se implementa ni
  se prueba.
- "Destino publicado" y "ruta publicada" son los que pasan todas las reglas de validación de
  contenido de esta spec.
- "Compilación de publicación" es la que se destina al sitio público; "compilación de desarrollo o
  vista previa" es la que se usa para trabajar y revisar.
- **"Modo académico"** es el estado en que los datos del sitio declaran que es un ejercicio
  académico. **"Modo de operador real"** es el estado en que los datos declaran que hay un operador
  real. El modo se declara de forma explícita (CA-125). Los criterios sin indicación de modo aplican
  a ambos.
- "Móvil" significa 360 px de ancho de ventana.
- "Piso" es el piso térmico. Su regla de asignación según la altitud es única en todo el sitio y
  sus umbrales salen del contenido verificado (ver Decisiones, PA-12).

## Criterios de aceptación

### A. Hero y perfil altitudinal

- **CA-1** — Dado que abro la página de inicio, cuando carga, entonces el primer contenido, en este
  orden, es: un titular con el rango de altitud de Antioquia, una línea que explica que en la
  montaña tropical el clima cambia con la altura, un botón "Ver destinos" y el perfil altitudinal.
  En modo académico, el aviso de CA-126 puede ir antes del titular. **[e2e]**
- **CA-2** — Dado el titular del hero, cuando lo leo, entonces tiene la forma "de {mín} a {máx}
  metros de altitud", donde las dos cifras coinciden con los valores mínimo y máximo declarados en
  el contenido verificado; la unidad "metros de altitud" se escribe una sola vez y vale para las dos
  cifras, y eso cumple la regla de unidades de CA-23 y CA-103. **[unit]**
- **CA-3** — Dado el botón "Ver destinos", cuando lo activo con clic, toque o teclado (Enter),
  entonces la página se desplaza a la sección de destinos y el foco de teclado queda en esa
  sección. **[e2e]**
- **CA-4** — Dado el perfil, cuando lo veo, entonces muestra las cuatro bandas de piso (cálido,
  templado, frío, páramo) como franjas planas, cada una con su nombre escrito. **[e2e]**
- **CA-5** — Dado un conjunto de destinos publicados, cuando se genera el perfil, entonces hay
  exactamente un punto por destino, colocado según su altitud (a mayor altitud, más arriba), con una
  etiqueta que muestra solo el nombre del destino (la altitud se ve en el listado y se anuncia al
  lector de pantalla, según CA-8); si se cambia la altitud de un destino en los datos, su punto
  cambia de posición sin otro cambio. **[unit]**
- **CA-6** — Dado un punto del perfil, cuando lo activo, entonces navega a la página de detalle de
  ese destino; el punto es un enlace con un área táctil de al menos 44 × 44 px y su nombre es
  visible. **[e2e]**
- **CA-7** — Dado que veo la página a 360 px, cuando miro el perfil, entonces está debajo del botón
  "Ver destinos" y muestra como máximo cinco puntos: el destino principal de cada piso con destinos
  (CA-15) más el destino de mayor altitud entre los restantes, sin superar cinco en total; los demás
  destinos siguen disponibles en la sección de destinos. **[unit]** **[e2e]**
- **CA-8** — Dado un lector de pantalla, cuando llega al perfil, entonces el gráfico tiene un nombre
  accesible breve y los destinos se anuncian como una lista de enlaces, cada uno con nombre y
  altitud (por ejemplo "Nombre del destino, N metros"). **[axe]** **[manual]**
- **CA-9** — Dado que carga el hero sin preferencia de movimiento reducido, cuando aparece el
  perfil, entonces se dibuja de izquierda a derecha una sola vez en 900 ms; con
  `prefers-reduced-motion: reduce` aparece ya dibujado y sin animación; sin JavaScript o sin
  animaciones el perfil está completo. **[e2e]**
- **CA-10** — Dado el hero, cuando se mide la carga, entonces no incluye ninguna imagen de fotografía
  y el elemento más grande de la primera pantalla es el titular. **[e2e]**
- **CA-11** — Dado el perfil, cuando leo la sección, entonces una nota breve aclara que es un esquema
  que ordena los destinos por altura y que no está a escala geográfica. **[e2e]**

### B. Destinos turísticos (listado en la página de inicio)

- **CA-12** — Dado varios destinos publicados, cuando veo la sección de destinos, entonces están
  ordenados por altitud ascendente (del más bajo al más alto) y agrupados por piso, en el orden
  cálido, templado, frío, páramo. **[unit]** **[e2e]**
- **CA-13** — Dado dos destinos con la misma altitud, cuando se ordenan, entonces el orden es
  alfabético por nombre en español, de modo que el resultado es siempre el mismo. **[unit]**
- **CA-14** — Dado un piso sin destinos publicados, cuando veo la sección, entonces ese piso no
  aparece (ni encabezado, ni franja, ni bloque vacío). **[e2e]**
- **CA-15** — Dado un piso con varios destinos, cuando veo su bloque, entonces hay un destino
  principal, elegido por un campo editorial del destino, que ocupa más área que cada uno de los
  demás; un piso con un solo destino lo muestra como principal. Si dos destinos del mismo piso están
  marcados como principales, la construcción falla; si ninguno lo está, el principal es el de menor
  altitud y la construcción avisa. No hay un conjunto de tarjetas idénticas. **[unit]** **[e2e]**
- **CA-16** — Dado un ancho de 1024 px o más, cuando veo cada bloque de piso, entonces una columna
  fija a su izquierda muestra el nombre del piso, su rango de altitud y una franja de su color;
  dado un ancho menor de 1024 px (incluida la tableta de 768 a 1023 px), entonces hay una franja de 6
  px del color del piso en el borde izquierdo del bloque y el nombre del piso aparece escrito sobre
  el bloque. **[e2e]**
- **CA-17** — Dado un destino en el listado, cuando lo veo, entonces muestra: nombre, altitud con el
  nombre de su piso, descripción corta, duración, dificultad, una foto o la lámina de altitud, y un
  enlace a su página de detalle; la ficha completa va solo en el detalle. **[e2e]**
- **CA-18** — Dado los enlaces a las páginas de detalle, cuando los examino, entonces cada enlace
  tiene un nombre accesible distinto que incluye el nombre del destino (no "Ver más" repetido).
  **[axe]** **[e2e]**
- **CA-19** — Dado N destinos publicados, cuando cuento los destinos del listado, entonces aparecen
  exactamente N, cada uno una sola vez, y todos son alcanzables con teclado. **[e2e]**
- **CA-20** — Dado un destino sin altitud (o con altitud no numérica, negativa o cero), cuando se
  construye el sitio, entonces la construcción falla indicando qué destino es el inválido y ese
  destino no se publica. **[build]** **[unit]**

### C. Ficha de salida

- **CA-21** — Dado un destino o una ruta con todos sus datos, cuando veo su ficha, entonces muestra
  siete datos, cada uno con su etiqueta escrita, en este orden: altitud (con nombre del piso),
  clima habitual, cómo llegar, duración, distancia y desnivel, dificultad, edad sugerida. El orden
  es idéntico en la página de detalle y en la ficha de ruta; el listado de destinos muestra el
  subconjunto de CA-17 en el mismo orden relativo. Una ruta no tiene altitud propia: en su ficha, el
  dato de altitud es el del destino al que pertenece, con el nombre de su piso, y la elevación
  mínima y máxima de la ruta se muestran en una línea aparte. **[e2e]**
- **CA-22** — Dado un dato que falta, cuando se muestra la ficha, entonces ese dato y su etiqueta no
  aparecen, y no se escribe "N/D", "sin dato" ni un valor vacío; los demás datos conservan su
  orden. Si solo hay distancia o solo hay desnivel, se muestra lo que hay y la etiqueta pasa a
  "Distancia" o "Desnivel". **[unit]** **[e2e]**
- **CA-23** — Dado una altitud, cuando se escribe, entonces lleva la unidad "m" y las altitudes de
  cuatro cifras no llevan separador de miles ("2500 m", no "2.500 m"); la primera aparición en una
  página dice "metros de altitud" (en el titular del hero, una sola vez para sus dos cifras, según
  CA-2). La abreviatura "m s. n. m." no aparece en ninguna página. **[unit]** **[e2e]**
- **CA-24** — Dado un rango de clima, cuando se escribe, entonces tiene la forma "Entre X y Y °C",
  con X menor que Y; un rango con X mayor o igual que Y no es válido y el destino no se publica.
  **[unit]** **[build]**
- **CA-25** — Dado una duración, cuando se escribe, entonces usa horas o días con la unidad escrita y
  el singular correcto ("1 hora", "5 horas", "1 día", "2 días"). **[unit]**
- **CA-26** — Dado una distancia y un desnivel, cuando se escriben, entonces tienen la forma "8 km,
  400 m de subida", con coma como separador decimal cuando hay decimales ("8,5 km") y sin
  separador de miles en cifras de cuatro dígitos. **[unit]**
- **CA-27** — Dado una dificultad, cuando se muestra, entonces aparece la palabra "Fácil",
  "Moderada" o "Exigente" más una, dos o tres marcas rellenas respectivamente, todas del mismo color
  de texto; la dificultad se entiende sin ver colores, y un lector de pantalla anuncia la palabra
  (no las marcas por separado). Cualquier otro valor no es válido. **[unit]** **[axe]**
- **CA-28** — Dado una edad sugerida, cuando se escribe, entonces tiene la forma "Apta desde los N
  años"; con edad mínima de 1 dice "Apta desde 1 año"; si la edad mínima es 0, dice "Apta para todas las edades".
  **[unit]**
- **CA-29** — Dado una altitud, cuando se calcula su piso, entonces el resultado sale de una única
  regla con los umbrales verificados; una altitud que coincide con un umbral pertenece al piso
  superior (por ejemplo, si el umbral es N, una altitud igual a N es del piso de arriba); el mismo
  destino muestra el mismo piso en el hero, el listado, el detalle y la galería. **[unit]**
- **CA-30** — Dado la ficha, cuando la examino con un lector de pantalla, entonces cada etiqueta está
  asociada programáticamente a su valor (se anuncia "etiqueta, valor"). **[axe]** **[manual]**

### D. Página de detalle de destino

- **CA-31** — Dado N destinos publicados, cuando se construye el sitio, entonces existen exactamente
  N páginas de detalle en la ruta `/destinos/<slug>/`, con slug en kebab-case sin tildes ni
  espacios, único por destino; no existe página para destinos no publicados. **[build]** **[e2e]**
- **CA-32** — Dado una página de detalle, cuando la abro, entonces tiene un único título principal
  con el nombre del destino y contiene: descripción, ficha completa, foto(s) o lámina de altitud,
  rutas del destino (si tiene) y acceso al contacto. **[e2e]**
- **CA-33** — Dado cualquier página de detalle, cuando examino su cabecera, entonces tiene un título
  de documento y una meta descripción no vacíos, distintos de los de cualquier otra página, con
  título de máximo 60 caracteres y descripción de máximo 160. **[e2e]**
- **CA-34** — Dado una página de detalle, cuando quiero volver, entonces hay un enlace al listado de
  destinos de la página de inicio y la navegación principal sigue disponible. **[e2e]**
- **CA-35** — Dado un destino con rutas, cuando veo su página, entonces lista cada ruta con su
  nombre y su ficha completa; dado un destino sin rutas, entonces no aparece el bloque de rutas ni
  su encabezado. **[e2e]**
- **CA-36** — Dado una página de detalle, cuando uso la llamada a contacto por WhatsApp, entonces el
  mensaje inicial de la conversación nombra el destino consultado. **[e2e]**
- **CA-37** — Dado una dirección del sitio que no corresponde a ninguna página, cuando la abro,
  entonces veo una página en español que dice que la dirección no existe y ofrece enlaces al inicio
  y a los destinos. **[e2e]**

### E. Fotos, láminas de altitud y créditos

- **CA-38** — Dado un destino sin fotos, cuando veo su listado o su detalle, entonces en el lugar de
  la foto aparece una lámina de altitud con el color de tinte de su piso, curvas de nivel, la cifra
  de altitud en grande y el nombre del piso; tiene las mismas proporciones que una foto, no contiene
  el texto "imagen no disponible" ni un marcador gris, y la jerarquía del destino es la misma que la
  de uno con foto. **[e2e]**
- **CA-39** — Dado destinos de un mismo piso sin fotos, cuando veo sus láminas, entonces comparten el
  mismo dibujo de curvas; destinos de pisos distintos muestran dibujos distintos (cuatro en total);
  la cifra y el nombre del piso son los de cada destino. **[unit]** **[e2e]**
- **CA-40** — Dado un destino con una o dos fotos, cuando veo su detalle, entonces las fotos se
  muestran en tamaño menor junto a la ficha, sin carrusel ni controles de galería propios.
  **[e2e]**
- **CA-41** — Dado un destino con tres o más fotos, cuando veo su detalle, entonces hay una foto
  principal y las demás aparecen en una cuadrícula con visor dentro del propio detalle; además,
  todas las fotos publicadas del destino aparecen en la galería de la página de inicio. **[e2e]**
- **CA-42** — Dado un destino cuyas fotos son todas de baja resolución (lado mayor menor que 2000
  px), cuando veo su detalle o su lugar principal en el listado de destinos, entonces el lugar
  principal lo ocupa la lámina de altitud y las fotos se usan solo en tamaño menor. **[unit]**
  **[e2e]**
- **CA-43** — Dado cualquier foto, cuando se muestra, entonces nunca se renderiza con un ancho mayor
  que su ancho original; una foto con lado mayor menor que 1200 px no se publica. **[e2e]**
  **[build]**
- **CA-44** — Dado cualquier foto en cualquier lugar del sitio (listado, detalle, galería, visor),
  cuando se muestra, entonces su crédito está visible junto a la imagen o en el pie del visor, en una
  sola línea de texto de 14 px (o varias líneas solo si no cabe en el ancho), con autor, nombre de la
  licencia como enlace a su texto, y enlace a la fuente. Los enlaces del crédito son enlaces dentro
  de texto y pueden medir menos de 44 px de alto (excepción de WCAG 2.2 para enlaces en línea).
  **[e2e]**
- **CA-45** — Dado una foto que fue recortada o modificada, cuando veo su crédito, entonces dice
  "recortada" (o "modificada"). **[unit]** **[e2e]**
- **CA-46** — Dado una foto a la que le falta autor, nombre de licencia, enlace de la licencia,
  enlace de la fuente o el dato de si fue modificada, cuando se construye el sitio, entonces la
  construcción falla indicando cuál foto y qué dato falta, y la foto no se publica. **[build]**
  **[unit]**
- **CA-47** — Dado la licencia de una foto, cuando se valida, entonces solo se acepta CC0, dominio
  público, CC BY o CC BY-SA; cualquier otra (incluidas las que llevan "NC" o "ND") hace fallar la
  construcción. **[build]** **[unit]**
- **CA-48** — Dado cualquier foto, cuando examino su descripción alternativa, entonces no está vacía,
  describe la imagen y no contiene el nombre del autor ni de la licencia; una foto sin descripción
  alternativa no se publica. **[build]** **[axe]**
- **CA-49** — Dado cualquier foto, cuando se muestra, entonces su proporción es 3:2, 4:5 o 1:1, no
  tiene texto encima, y no se le aplican filtros ni velos de color. **[e2e]** **[manual]**
- **CA-50** — Dado el pie del sitio, cuando lo reviso, entonces ofrece un enlace a una página que
  reúne los créditos de todas las fotos publicadas, que se actualiza sola cuando se agrega o quita
  una foto. **[e2e]**

### F. Galería interactiva

- **CA-51** — Dado que no hay ninguna foto publicada, cuando construyo el sitio, entonces la sección
  de galería no se publica: no hay encabezado, ni enlace de navegación hacia ella, ni contenedor
  vacío. **[e2e]**
- **CA-52** — Dado fotos publicadas, cuando veo la galería, entonces los pisos se recorren de menor
  a mayor altitud y se agrupan con esta regla: un piso sin fotos no aparece; un piso con tres o más
  fotos forma su propio grupo; un piso con una o dos fotos se une al siguiente piso con fotos y, si
  es el último, se une al grupo anterior; si el grupo resultante aún tiene menos de tres fotos,
  sigue uniéndose al siguiente con la misma regla (si no hay más pisos, queda con las fotos que
  tenga). Cada foto lleva la etiqueta de su piso y el nombre de su destino. **[unit]** **[e2e]**
- **CA-53** — Dado la cuadrícula de la galería, cuando la veo, entonces cada foto tiene su crédito
  visible según CA-44. **[e2e]**
- **CA-54** — Dado una miniatura de la galería con JavaScript, cuando la activo con clic, toque,
  Enter o Espacio, entonces se abre el visor con esa foto en grande; la miniatura es un control
  con nombre accesible que dice que abre la foto y a qué destino pertenece. **[e2e]** **[axe]**
- **CA-55** — Dado el visor abierto, cuando uso el teclado o el lector de pantalla, entonces el visor
  se anuncia como diálogo con nombre accesible, el foco pasa a su interior, Tab y Mayús+Tab ciclan
  solo entre sus controles, y el resto de la página no es operable mientras está abierto.
  **[e2e]** **[axe]**
- **CA-56** — Dado el visor abierto, cuando presiono Esc o activo el botón de cerrar (de al menos 44
  × 44 px), entonces el visor se cierra y el foco vuelve a la miniatura que lo abrió. **[e2e]**
- **CA-57** — Dado el visor abierto, cuando presiono las flechas izquierda o derecha, o activo los
  botones "anterior" y "siguiente", entonces cambia a la foto previa o siguiente de la galería; en
  la primera foto el control "anterior" está desactivado y en la última el "siguiente", y esto se
  anuncia a un lector de pantalla. **[e2e]**
- **CA-58** — Dado que cambio de foto en el visor, cuando cambia, entonces se anuncia a un lector de
  pantalla la posición ("3 de 12") y la descripción alternativa de la foto nueva, y el contador
  también es visible. **[e2e]** **[manual]**
- **CA-59** — Dado el visor abierto, cuando veo una foto, entonces el pie muestra su crédito
  completo, la etiqueta de piso y el nombre del destino. **[e2e]**
- **CA-60** — Dado que abro el visor a 360 px, cuando lo uso, entonces la foto cabe sin desplazamiento
  horizontal, todos los controles miden al menos 44 × 44 px, y un deslizamiento horizontal con un
  dedo cambia de foto (los botones siguen funcionando como alternativa). **[e2e]**
- **CA-61** — Dado el visor abierto, cuando desplazo la página de fondo, entonces no se desplaza;
  al cerrar, el desplazamiento y la posición previos se restauran. **[e2e]**
- **CA-62** — Dado que abro o cierro el visor, cuando no hay preferencia de movimiento reducido,
  entonces el cambio es un desvanecido de opacidad de 250 ms; con `prefers-reduced-motion: reduce`
  el cambio es inmediato. **[e2e]**
- **CA-63** — Dado que la imagen ampliada no carga (por ejemplo, conexión cortada), cuando está el
  visor abierto, entonces se muestra el texto "No pudimos cargar esta foto" en lugar de un espacio
  en blanco, el crédito y los controles siguen funcionando, y el mensaje se anuncia a un lector de
  pantalla. **[e2e]**
- **CA-64** — Dado que la galería tiene una sola foto, cuando abro el visor, entonces no aparecen los
  controles "anterior" y "siguiente" ni el contador. **[e2e]**
- **CA-65** — Dado que JavaScript está desactivado, cuando veo la galería, entonces las fotos se
  muestran como cuadrícula con su etiqueta de piso y su crédito, no hay botones sin efecto, y no
  falta ninguna foto. **[e2e]**
- **CA-66** — Dado que cargo la página de inicio, cuando mido las descargas, entonces no se descarga
  el código del visor ni ninguna imagen ampliada antes de que la galería esté cerca de la ventana
  visible o se abra el visor, y las miniaturas fuera de pantalla no se descargan en la carga
  inicial. **[e2e]**

### G. Mapa de rutas

- **CA-67** — Dado que no hay ninguna ruta publicada, cuando construyo el sitio, entonces la sección
  de mapa no se publica (sin encabezado, ni enlace de navegación, ni contenedor vacío). **[e2e]**
- **CA-68** — Dado rutas publicadas, cuando veo la sección, con o sin JavaScript, entonces hay una
  lista de todas las rutas, siempre visible; cada elemento muestra el nombre de la ruta, su letra
  clave (la misma que la ruta lleva en el mapa), su ficha completa y un enlace a la página de
  detalle del destino al que pertenece. La repetición de la ficha completa en la lista y en el panel
  de CA-70 es intencional. **[e2e]**
- **CA-69** — Dado que JavaScript funciona, cuando veo el mapa, entonces cada ruta se dibuja con su
  nombre y se distingue de las demás por patrón de trazo además de por color, de modo que no hay
  información que dependa solo del color. A 360 px, el rótulo con el nombre de las rutas no
  seleccionadas puede ocultarse cuando no cabe, dejando visible su letra clave, que también aparece
  en la lista; el nombre sigue disponible en la lista y como nombre accesible del marcador.
  **[e2e]** **[manual]**
- **CA-70** — Dado una ruta en el mapa o en la lista, cuando la selecciono con clic, toque, Enter o
  Espacio, entonces la ruta se resalta, el mapa encuadra la ruta completa, y un panel fuera del mapa
  muestra su nombre, su ficha completa y su elevación mínima y máxima. **[e2e]**
- **CA-71** — Dado que uso solo teclado, cuando recorro el mapa, entonces puedo llegar a cada ruta y
  seleccionarla, operar los controles de acercar y alejar, mover el mapa con las flechas, y salir
  del mapa con Tab sin quedar atrapado. **[e2e]** **[axe]**
- **CA-72** — Dado que uso el celular a 360 px, cuando paso un dedo sobre el mapa para recorrer la
  página, entonces la página se desplaza sin quedar bloqueada por el mapa; los controles y
  marcadores del mapa miden al menos 44 × 44 px y el mapa no provoca desplazamiento horizontal.
  **[e2e]** **[manual]**
- **CA-73** — Dado el mapa construido, cuando mido el contraste de las líneas de ruta contra las
  teselas que quedan debajo, entonces es de al menos 3:1 y las etiquetas del mapa siguen siendo
  legibles. La medición se hace sobre el mapa construido en la fase de diseño y de revisión.
  **[manual]**
- **CA-74** — Dado el mapa, cuando lo veo, entonces la atribución obligatoria del proveedor de datos
  del mapa es visible. **[e2e]**
- **CA-75** — Dado que el mapa no puede cargar (teselas inaccesibles o fallo del código del mapa),
  cuando estoy en la sección, entonces se muestra un mensaje en español que dice que el mapa no
  está disponible, el mensaje se anuncia a un lector de pantalla, y la lista de rutas de CA-68
  sigue completa y operativa. **[e2e]**
- **CA-76** — Dado una ruta con elevación por punto, cuando la selecciono, entonces se muestra su
  perfil de elevación con una alternativa en texto (elevación mínima, máxima y desnivel); dado una
  ruta sin elevación por punto, entonces solo se muestran la elevación mínima y máxima, sin gráfico
  vacío ni mensaje de error. **[e2e]** **[unit]**
- **CA-77** — Dado una ruta sin trazado (geometría ausente, vacía o inválida), cuando se construye el
  sitio, entonces la construcción falla indicando cuál ruta y no se publica. **[build]** **[unit]**
- **CA-78** — Dado una ruta sin destino asociado, sin elevación mínima o máxima, o con mínima mayor
  que máxima, cuando se construye el sitio, entonces la construcción falla indicando cuál ruta y no
  se publica. **[build]** **[unit]**
- **CA-79** — Dado que cargo la página de inicio, cuando mido las descargas, entonces no se descargan
  el código del mapa ni sus teselas antes de que la sección esté cerca de la ventana visible.
  **[e2e]**
- **CA-80** — Dado que JavaScript está desactivado, cuando veo la sección, entonces solo hay la lista
  de rutas con sus enlaces, sin contenedor de mapa vacío, y cada enlace lleva a la página del
  destino correspondiente. **[e2e]**

### H. Contacto

Canal confirmado por el humano el 2026-10-10 y mantenido el 2026-10-11: WhatsApp como principal más
correo visible de respaldo; no hay formulario en esta feature. El WhatsApp y el correo son reales
aunque el sitio sea un ejercicio académico (ver CA-131 y CA-132).

- **CA-81** — Dado cualquier página, cuando busco cómo contactar, entonces hay un enlace "Contacto"
  en la navegación principal y, en la página de inicio, una sección de contacto como última sección
  antes del pie, con título y una acción principal visible para escribir por WhatsApp. **[e2e]**
- **CA-82** — Dado la sección de contacto, cuando la leo, entonces muestra, como texto (no solo
  dentro de un botón o imagen): el número de WhatsApp "+57 312 795 1683", el horario de atención
  "lunes a viernes, de 10 a. m. a 10 p. m." y el correo "danielfajardog1902@gmail.com" como enlace
  de correo. **[e2e]**
- **CA-83** — Dado la acción de WhatsApp, cuando la activo, entonces abre una conversación con el
  número +57 312 795 1683 y un mensaje inicial en español; si vengo de una página de detalle, el
  mensaje nombra el destino; funciona sin JavaScript. **[e2e]**
- **CA-84** — retirado (campos de formulario; el formulario está fuera de alcance).
- **CA-85** — retirado (validación de formulario).
- **CA-86** — retirado (conservar datos del formulario).
- **CA-87** — retirado (confirmación de envío del formulario).
- **CA-88** — retirado (error de envío del formulario).
- **CA-89** — retirado (formulario sin JavaScript).
- **CA-90** — retirado (aviso de datos junto al formulario; los textos legales se cubren en
  CA-98 y CA-118 a CA-121).
- **CA-91** — Dado el contacto a 360 px, cuando lo uso, entonces la acción de WhatsApp y el enlace del
  correo miden al menos 44 px de alto, el número y el correo se leen completos en texto sin
  desplazamiento horizontal, y tocar el número o el correo no los corta ni los trunca.
  **[e2e]** **[manual]**
- **CA-92** — retirado (estados de error del formulario).

### I. Navegación, estructura y SEO

- **CA-93** — Dado cualquier página, cuando veo la navegación principal, entonces enlaza, en este
  orden, a las secciones publicadas: Destinos, Galería, Mapa de rutas y Contacto; una sección no
  publicada no tiene enlace; cada enlace lleva a su sección en la página de inicio. **[e2e]**
- **CA-94** — Dado que navego con teclado, cuando presiono Tab por primera vez en cualquier página,
  entonces el primer elemento enfocado es un enlace "Saltar al contenido" visible al recibir foco
  que lleva al contenido principal. **[e2e]**
- **CA-95** — Dado cualquier página, cuando la analizo, entonces declara el idioma es-CO, tiene
  exactamente un título principal, una jerarquía de encabezados sin saltos de nivel y regiones
  identificables (encabezado, navegación, contenido principal, pie). **[axe]** **[e2e]**
- **CA-96** — Dado la página de inicio, cuando examino su cabecera, entonces tiene título y meta
  descripción propios y no vacíos, y datos para compartir en redes con el título y la descripción,
  sin imagen asociada. **[e2e]**
- **CA-97** — Dado el sitio construido en modo de operador real, cuando reviso sus archivos de
  rastreo, entonces hay un mapa del sitio que lista la página de inicio y todas las páginas de
  detalle publicadas, y un archivo de instrucciones para buscadores que lo referencia. En modo
  académico no hay mapa del sitio y rige CA-133. **[build]**
- **CA-98** — Dado cualquier página, cuando llego al pie, entonces contiene el nombre del sitio (en
  modo de operador real, el nombre del operador; en modo académico, el nombre del proyecto con la
  indicación "proyecto académico"), enlace a contacto, enlaces a las páginas de política de
  tratamiento de datos, términos y condiciones y política de cancelación, y enlace a la página de
  créditos. **[e2e]**
- **CA-99** — Dado un destino o ruta con datos inválidos según esta spec, cuando se construye el
  sitio, entonces el mensaje de error indica el archivo de contenido, el campo y la regla
  incumplida. **[build]**
- **CA-100** — Dado que no hay ningún destino publicado, cuando se construye el sitio, entonces la
  construcción falla con un mensaje claro, en lugar de publicar una página de inicio vacía.
  **[build]**

### J. Lenguaje y contenido

- **CA-101** — Dado todo el texto de la interfaz, cuando se revisa, entonces está en español de
  Colombia, usa "tú" (sin "usted" ni "vos") en el texto corrido, y los botones y enlaces de acción
  usan infinitivo ("Ver destinos", "Contactar"). **[manual]** con lista de revisión; **[e2e]** busca
  de "usted" y "vos".
- **CA-102** — Dado un término local ("piso térmico", "páramo", "silleta", etc.), cuando aparece por
  primera vez en una página, entonces se explica en la misma frase; "piso térmico" se explica una
  sola vez, en el hero. **[manual]**
- **CA-103** — Dado cualquier cifra del sitio, cuando se muestra, entonces lleva su unidad escrita
  (m, km, horas, días, °C, años), salvo dos cifras seguidas que comparten una unidad escrita una sola
  vez (el titular del hero, según CA-2), y cualquier precio lleva la moneda escrita ("COP"). No se
  muestran precios en el primer lanzamiento. **[unit]** **[e2e]**
- **CA-104** — Dado un destino con altitud o una altitud de umbral sin marca de "verificada" en el
  contenido, cuando se construye el sitio, entonces ese destino no se publica y la construcción
  indica el motivo; ninguna cifra de altitud aparece en la página sin esa marca. **[build]**
- **CA-105** — Dado el código de estilos del sitio, cuando se revisa, entonces ningún color,
  tamaño de letra ni duración de animación está definido fuera de los tokens de diseño, y no hay
  degradados. **[build]** **[manual]**

### K. Requisitos transversales verificables

- **CA-106** — Dado que uso solo teclado, cuando recorro cada página (inicio con el visor y el mapa
  abiertos y cerrados, detalle, 404), entonces puedo alcanzar y operar todo control e enlace, el
  orden de foco coincide con el orden visual, y no hay trampas de teclado. **[e2e]**
- **CA-107** — Dado cualquier elemento enfocable, cuando recibe foco, entonces muestra un anillo de
  3 px separado 2 px del elemento, con contraste de al menos 3:1 sobre su fondo. **[e2e]**
  **[manual]**
- **CA-108** — Dado la página de inicio, una página de detalle con fotos, una sin fotos, las tres
  páginas legales, la página de créditos y la página 404, cuando se analizan con axe (también con el
  visor abierto, el mapa cargado y el mapa fallido), entonces no hay violaciones serious ni
  critical contra WCAG 2.2 AA. **[axe]**
- **CA-109** — Dado un lector de pantalla (NVDA con navegador de escritorio; TalkBack en Android),
  cuando completo estas tareas sin ver la pantalla: encontrar un destino de piso templado, leer su
  ficha, abrir una foto y volver, elegir una ruta, y encontrar cómo contactar; entonces puedo
  hacerlas todas sin ayuda. **[manual]**
- **CA-110** — Dado un ancho de 360 px, cuando recorro cada página, entonces no hay desplazamiento
  horizontal, ningún texto o control queda cortado, y todo control táctil mide al menos 44 × 44 px.
  Las únicas excepciones son los enlaces en línea del crédito de las fotos (CA-44) y las líneas de
  ruta dibujadas sobre el mapa, cuya zona activa puede medir menos de 44 px porque cada ruta se
  puede seleccionar también con su marcador y con su botón en la lista, que sí miden al menos
  44 × 44 px. Ningún otro control ni enlace queda exceptuado. **[e2e]**
- **CA-111** — Dado un zoom del navegador al 200 % y un ancho equivalente a 320 px (reflujo a 400 %),
  cuando recorro cada página, entonces el contenido sigue legible, sin pérdida de información ni de
  funciones y sin desplazamiento horizontal. **[manual]**
- **CA-112** — Dado que JavaScript está desactivado, cuando uso el sitio, entonces puedo: leer el
  hero completo, recorrer los destinos, abrir cada página de detalle, ver la galería como cuadrícula,
  ver el mapa como lista de rutas con enlaces, y contactar por el enlace de WhatsApp y ver el correo;
  ningún control aparece roto o sin efecto. **[e2e]**
- **CA-113** — Dado `prefers-reduced-motion: reduce`, cuando uso el sitio, entonces ninguna animación
  de trazo, transición o desplazamiento animado se ejecuta (las duraciones son cero). **[e2e]**
- **CA-114** — Dado todos los pares de texto y fondo de la sección 4.3 de la dirección visual, cuando
  se miden con una herramienta de contraste sobre el sitio construido, entonces cada par cumple 4.5:1
  (texto) o 3:1 (componentes y gráficos). **[axe]** **[manual]**
- **CA-115** — Dado la página de inicio y dos páginas de detalle (una con fotos, una sin), cuando se
  analizan con Lighthouse en modo móvil, entonces cada una obtiene al menos 90 en Rendimiento,
  Accesibilidad, Buenas prácticas y SEO. En modo académico, la categoría SEO se calcula sin la
  auditoría de "la página es indexable", porque falla a propósito por CA-133; todas las demás
  auditorías de SEO deben pasar y la nota resultante debe ser de al menos 90. **[e2e]** (Lighthouse)
- **CA-116** — Dado la página de inicio medida en móvil con red 4G lenta simulada, cuando carga,
  entonces el mayor elemento visible aparece en 2.5 s o menos, el desplazamiento acumulado de
  diseño es 0.1 o menos y el tiempo total de bloqueo es 200 ms o menos. **[e2e]** (Lighthouse)
- **CA-117** — Dado que una imagen no carga por conexión intermitente, cuando se muestra la página,
  entonces el espacio de la imagen está reservado (el diseño no se mueve), su descripción
  alternativa está disponible, y el resto del contenido se puede leer y usar. **[e2e]**

### L. Textos legales e identificación del operador

Los textos legales (política de tratamiento de datos personales, términos y condiciones, política de
cancelación) existen siempre. En **modo académico** son textos de muestra (CA-134); en **modo de
operador real** los redacta `content-curator` como borradores y requieren revisión. Los
identificadores oficiales (número de Registro Nacional de Turismo, NIT, razón social y cualquier otro
identificador oficial) nunca se inventan. Esta spec no es asesoría legal.

- **CA-118** — Dado cada texto legal, cuando se construye el sitio, entonces: (a) en **modo de
  operador real** está marcado en el contenido como "borrador pendiente de revisión" hasta que el
  humano o su asesor lo marquen como revisado; mientras esté en borrador, la compilación de
  desarrollo o vista previa lo muestra con un aviso visible "Borrador pendiente de revisión" y la
  compilación de publicación falla indicando cuál texto sigue en borrador; (b) en **modo académico**
  no se exige revisión: se aplica CA-134 en lugar de este criterio. **[build]** **[e2e]**
- **CA-119** — Dado un identificador oficial del operador (Registro Nacional de Turismo, NIT, razón
  social u otro): (a) en **modo de operador real**, cuando el dato no ha sido entregado, el sitio no
  lo muestra (ni "N/D", ni un número de ejemplo, ni un texto de relleno) y la compilación de
  publicación falla indicando cuál identificador falta; la compilación de desarrollo o vista previa
  sí se genera; (b) en **modo académico**, ningún identificador oficial se muestra ni se exige para
  publicar, y la construcción falla si alguno aparece cargado en los datos, de modo que no se
  adjunte un identificador a un operador que no existe. **[build]** **[unit]**
- **CA-120** — Dado cualquier identificador oficial o dato de contacto cargado en el contenido, cuando
  se construye el sitio, entonces la construcción de publicación falla (en ambos modos) si su valor
  coincide con un marcador de relleno conocido (por ejemplo "000", "123456", "XXXX", "ejemplo",
  "pendiente", "NIT 000.000.000-0") o con un valor marcado como "ficticio", de modo que un dato de
  prueba no llega al sitio público. El WhatsApp y el correo reales de CA-82 no son relleno.
  **[unit]** **[build]**
- **CA-121** — Dado el pie de cualquier página: (a) en **modo de operador real**, cuando los textos
  legales ya están marcados como revisados, los tres enlaces del pie (CA-98) llevan a páginas con
  título principal propio, con la fecha de la última revisión escrita, y el identificador oficial del
  operador figura junto al nombre en el pie o en la política de datos; (b) en **modo académico**, los
  tres enlaces llevan a páginas con título principal propio y el rótulo de CA-134, sin fecha de
  revisión legal ni identificador oficial. **[e2e]**

### M. Adiciones de la revisión del 2026-10-10 (fase 2)

- **CA-122** — Dado un destino con altitud menor que la mínima o mayor que la máxima declaradas para
  el titular del hero, o umbrales entre pisos que no están en orden estrictamente ascendente, cuando
  se construye el sitio, entonces la construcción falla indicando qué destino o qué umbral incumple
  y qué rango está declarado, y ese destino no se publica. **[build]** **[unit]**
- **CA-123** — Dado que veo cualquier página a 360 px, cuando miro la navegación principal, entonces
  sus enlaces están tras un control "Menú" de al menos 44 × 44 px; el control se puede abrir y
  cerrar con teclado, anuncia a un lector de pantalla si está abierto o cerrado, y también funciona
  con JavaScript desactivado (los enlaces siguen alcanzables). **[e2e]** **[axe]**
- **CA-124** — Dado el sitio construido durante la implementación, cuando el humano revisa capturas
  del perfil altitudinal en los tres rangos de ancho (360 px, tableta y escritorio) y de las cuatro
  láminas de altitud, entonces las aprueba por escrito o pide ajustes; la implementación no se da
  por cerrada sin esa aprobación. **[manual]**

### N. Modo de ejercicio académico (revisión del 2026-10-11, aprobada por el humano el 2026-10-11)

Texto propuesto del aviso (el texto exacto y su presentación los fija `ui-designer`):
**"Proyecto académico. Este sitio no ofrece servicios turísticos reales."**

- **CA-125** — Dado los datos del sitio, cuando se construye (cualquier compilación), entonces
  declaran de forma explícita si el sitio es un ejercicio académico o tiene un operador real; si la
  declaración falta o no es válida, la construcción falla indicando el motivo, y el modo nunca se
  deduce de otros datos. **[build]** **[unit]**
- **CA-126** — Dado el modo académico, cuando abro cualquier página (inicio, cada página de detalle,
  las tres páginas legales, créditos y la 404), entonces veo el aviso "Proyecto académico. Este sitio
  no ofrece servicios turísticos reales." (texto propuesto) dentro de la primera pantalla a 360 px, y
  el aviso aparece en todas esas páginas sin excepción. **[e2e]**
- **CA-127** — Dado el aviso, cuando lo examino con un lector de pantalla, entonces es texto real (no
  una imagen, ni texto generado solo por estilos), está en el árbol de accesibilidad, se lee en el
  orden de lectura antes del contenido principal, está en una región identificable con nombre, y no
  se anuncia de forma automática e insistente al cargar. **[axe]** **[e2e]**
- **CA-128** — Dado que JavaScript está desactivado o que el ancho es de 360 px, cuando veo cualquier
  página, entonces el aviso se ve completo, sin cortarse ni provocar desplazamiento horizontal, y no
  tapa ningún control, enlace ni elemento que reciba foco de teclado. **[e2e]**
- **CA-129** — Dado el aviso, cuando intento quitarlo, entonces no hay ningún control para cerrarlo,
  minimizarlo ni "no volver a mostrar"; reaparece al recargar la página, al navegar a otra y en una
  visita nueva, y no depende de ninguna preferencia guardada. **[e2e]**
- **CA-130** — Dado el aviso, cuando mido su contraste, entonces el texto cumple al menos 4.5:1 sobre
  su fondo y su tamaño de letra es de al menos 14 px, según los tokens del diseño. **[axe]**
  **[manual]**
- **CA-131** — Dado el modo académico, cuando veo la sección de contacto del inicio o la llamada a
  contacto de la página de un destino (ampliado el 2026-10-11 por decisión del humano; en modo
  académico el título y la invitación del contacto tampoco ofrecen un servicio, ver `design.md`
  S14.2), entonces junto a la acción
  de WhatsApp y al correo hay una frase que aclara que el contacto es de prueba y que no se reservan
  ni se venden salidas (texto propuesto: "Este contacto es de prueba: no se reservan ni se venden
  salidas."), de modo que nadie crea que contrata un servicio. *Recomendación del analista; no se
  deduce de las decisiones del humano.* **[e2e]**
- **CA-132** — Dado el modo académico, cuando activo la acción de WhatsApp, entonces el mensaje
  inicial indica que la consulta viene de un proyecto académico de prueba (además de nombrar el
  destino si vengo de uno, según CA-83), de modo que quien recibe el mensaje sabe de dónde viene.
  *Recomendación del analista.* **[e2e]**
- **CA-133** — Dado el modo académico, cuando examino cualquier página (inicio, detalle, legales,
  créditos, 404) en la compilación de publicación, entonces declara que no debe indexarse, el archivo
  de instrucciones para buscadores pide no indexar el sitio, y no existe mapa del sitio. **[build]**
  **[e2e]**
- **CA-134** — Dado el modo académico, cuando abro la política de datos, los términos o la política
  de cancelación, entonces existen como textos de muestra y cada uno lleva, antes del contenido, un
  rótulo visible que dice que es un texto de muestra de un ejercicio académico y que no tiene
  validez legal (texto propuesto: "Texto de muestra de un ejercicio académico. No tiene validez
  legal."); la publicación no exige revisión de un asesor; si a alguno de los tres le falta el
  rótulo, la construcción falla. **[build]** **[e2e]**
- **CA-135** — Dado la política de datos de muestra, cuando la leo, entonces dice con veracidad qué
  hace el sitio con los datos: que el enlace de WhatsApp lleva a una conversación en WhatsApp con el
  número del sitio y el mensaje que escriba el visitante; que el enlace de correo abre el programa de
  correo del visitante; que al cargar el mapa el navegador envía la dirección IP y las zonas
  consultadas al proveedor de las teselas (OpenStreetMap); que el proveedor de alojamiento puede
  registrar datos técnicos de la conexión; y que el sitio no guarda datos de visitantes, no usa
  cookies de seguimiento ni analítica. **[e2e]** **[manual]**
- **CA-136** — Dado cualquier página del sitio, incluida la sección del mapa ya cargada, cuando
  registro las conexiones del navegador a otros orígenes durante la carga, entonces cada origen
  externo contactado está nombrado en la política de datos; si una página contacta un origen no
  nombrado, la prueba falla. **[e2e]**
- **CA-137** — Dado los textos de destinos, rutas, contacto y legales, cuando se revisan, entonces
  describen lugares y recorridos y no prometen servicios, guías, cupos, reservas ni precios;
  una búsqueda automática de "reserva", "reservar", "cupo", "precio", "tarifa", "COP" y "guía
  incluido" no encuentra ninguna oferta, y cualquier coincidencia se revisa a mano. **[manual]**
  **[e2e]**
- **CA-138** — Dado datos que declaran **modo de operador real**, cuando se construye el sitio,
  entonces el aviso académico no aparece (CA-126 a CA-130 no aplican), las páginas pueden indexarse y
  hay mapa del sitio (CA-97), los textos legales exigen revisión (CA-118), los identificadores
  oficiales son obligatorios para publicar (CA-119) y rige CA-121 (a); es decir, las reglas estrictas
  anteriores a esta revisión siguen vigentes y comprobables en ese modo. **[build]** **[e2e]**
- **CA-139** — Dado cualquiera de los dos modos, cuando se hace la compilación de publicación,
  entonces falla si: una altitud o un umbral no está verificado (CA-104, CA-122); una foto no cumple
  licencia, atribución o texto alternativo (CA-46 a CA-48); una ruta es inválida (CA-77, CA-78); hay
  dos destinos principales en un piso o ningún destino publicado (CA-15, CA-100); los datos de
  contacto están incompletos o son de relleno (CA-82, CA-120); o no se ha declarado la dirección
  pública completa del sitio. **[build]**

## Requisitos no funcionales

- **Accesibilidad:** WCAG 2.2 AA; teclado completo; lector de pantalla; contraste (CA-106 a
  CA-109, CA-114, CA-127, CA-130).
- **Rendimiento:** Lighthouse móvil ≥ 90 en las cuatro categorías; LCP ≤ 2.5 s, CLS ≤ 0.1, TBT ≤
  200 ms en móvil con 4G lenta simulada (CA-115, CA-116). Las imágenes fuera de pantalla y los
  códigos de galería y mapa no se descargan en la carga inicial (CA-66, CA-79).
- **Responsive:** usable desde 360 px (CA-110, CA-111, CA-128).
- **Sin JavaScript:** hero, destinos, detalle, galería como cuadrícula, mapa como lista de rutas con
  enlaces, menú de navegación, aviso académico y contacto (WhatsApp y correo) siguen funcionando
  (CA-65, CA-80, CA-112, CA-123, CA-128).
- **Movimiento:** solo el dibujo del perfil y el desvanecido del visor; todo se anula con
  `prefers-reduced-motion` (CA-9, CA-62, CA-113).
- **SEO:** títulos y descripciones únicos e idioma es-CO (CA-33, CA-95, CA-96). En modo de operador
  real, mapa del sitio e indexación (CA-97); en modo académico, sitio no indexable (CA-133).
- **Conectividad limitada:** el texto y las fichas son legibles aunque las imágenes, el visor o el
  mapa no carguen (CA-63, CA-75, CA-117).
- **Datos:** el sitio no publica destinos, rutas, fotos, datos de contacto, textos legales ni
  identificadores oficiales incompletos, de relleno o sin verificar, según el modo (CA-20, CA-46,
  CA-47, CA-77, CA-78, CA-104, CA-118 a CA-120, CA-122, CA-139).
- **Transparencia:** el sitio dice qué es (CA-126), con qué datos trabaja y a qué terceros se
  conecta (CA-135, CA-136).

## Fuera de alcance

- Formulario de contacto (confirmado el 2026-10-10). Los criterios CA-84 a CA-90 y CA-92 están
  retirados por esto.
- Operación real del servicio: prestar salidas, atender reservas, cobrar o asignar guías. El sitio es
  un ejercicio académico (2026-10-11).
- Obtener o mostrar identificadores oficiales de un operador (Registro Nacional de Turismo, NIT,
  razón social) mientras el sitio sea un ejercicio académico.
- Asesoría legal y revisión jurídica de los textos mientras el sitio sea un ejercicio académico.
- Versión en inglés u otros idiomas.
- Reservas, pagos, precios, cupos, calendario de salidas y panel de administración.
- Cuentas de usuario, reseñas o comentarios.
- Filtros o búsqueda de destinos.
- Página de detalle propia para cada ruta (la ruta se consulta en el mapa y en el destino al que
  pertenece).
- Descarga de trazados para dispositivos GPS o enlace para abrir la ruta en otra aplicación de
  mapas.
- Imagen para compartir en redes.
- Mapa sin conexión o aplicación instalable.
- Analítica de visitas y banner de cookies.
- Idioma de los guías y accesibilidad para movilidad reducida como datos opcionales del destino
  (no resueltos por el humano; se reconsideran en una feature posterior).
- Fotografía propia, ilustraciones a mano e imágenes generadas por inteligencia artificial.
- Blog, noticias o contenido editorial recurrente.

## Decisiones tomadas (2026-10-10)

El humano aprobó la spec y aceptó las recomendaciones del analista tal como estaban formuladas.

- **PA-1 — Canal de contacto:** WhatsApp como canal principal más correo visible de respaldo;
  sin formulario.
- **PA-2 — Datos del operador:** WhatsApp +57 312 795 1683; horario de lunes a viernes, de 10 a. m.
  a 10 p. m.; correo danielfajardog1902@gmail.com. Datos completos y publicables.
- **PA-3 — Créditos:** página que reúne los créditos de todas las fotos, enlazada desde el pie
  (CA-50, CA-98).
- **PA-4 — Inglés:** fuera de alcance; se decide en una feature futura según la demanda.
- **PA-5 — Filtros de destinos:** sin filtros en el primer lanzamiento.
- **PA-6 — Destino principal por piso:** campo editorial en cada destino; dos principales en un
  piso hacen fallar la construcción, ninguno hace que el principal sea el de menor altitud con aviso
  (CA-15). *Nota del analista:* la recomendación original decía "falla o elige"; se fijó esta
  regla para que sea comprobable.
- **PA-7 — Listado de destinos:** muestra altitud con piso, duración y dificultad; la ficha
  completa va en el detalle (CA-17, CA-21).
- **PA-9 — Imagen para compartir en redes:** sin imagen en el primer lanzamiento (CA-96).
- **PA-10 — Rutas:** cada ruta pertenece a un destino y enlaza a él; sin detalle propio ni descarga;
  lista de rutas siempre visible (CA-68, CA-78).
- **PA-11 — Tableta (768 a 1023 px):** franja de 6 px, igual que móvil (CA-16).
- **PA-12 — Altitudes y umbrales:** `content-curator` verifica cada cifra con fuente citada, el
  contenido lleva marca de "verificada" y el umbral pertenece al piso superior (CA-2, CA-29,
  CA-104). Hasta entonces no se publica ninguna altitud.
- **PA-13 — Teselas del mapa:** la legibilidad y el contraste de las líneas de ruta se miden sobre
  el mapa construido, en la fase de diseño y de revisión (CA-73).
- **PA-14 — Analítica y cookies:** sin analítica ni banner de cookies en el primer lanzamiento.
- **PA-16 — Seguridad, precios y preparación:** sin precios ni reserva en el primer lanzamiento (el
  contacto cotiza). El idioma de los guías y la accesibilidad para movilidad reducida como datos
  opcionales del destino quedan fuera de alcance.
- **Decisiones propias del analista aceptadas:** desempate alfabético de altitudes iguales (CA-13);
  visor no circular (CA-57); decimales con coma (CA-26); "Apta para todas las edades" cuando la edad
  mínima es 0 (CA-28); lista de rutas siempre visible (CA-68); página 404 en español (CA-37);
  umbrales LCP ≤ 2.5 s, CLS ≤ 0.1 y TBT ≤ 200 ms (CA-116); HU-13; no publicar datos de contacto
  o identificadores incompletos o de relleno (CA-119, CA-120).

### Supuestos de la fase 2 (diseño) aceptados por el humano (2026-10-10)

Cubren vacíos de la spec que `ui-designer` señaló en `design.md`. Ya están incorporados a los
criterios indicados.

1. Principal del perfil a 360 px: el principal de cada piso más el destino más alto restante,
   máximo cinco puntos (CA-7).
2. Titular del hero: "de {mín} a {máx} metros de altitud", unidad escrita una sola vez, que cumple
   la regla de unidades (CA-2, CA-23, CA-103).
3. Ficha de ruta: muestra la altitud y el piso de su destino, más la elevación mínima y máxima en
   una línea aparte (CA-21).
4. Validación nueva: falla la construcción si un destino queda fuera del rango declarado o si los
   umbrales están desordenados (CA-122).
5. Crédito de foto en una sola línea, con enlaces que pueden medir menos de 44 px por la excepción
   de WCAG 2.2 para enlaces en línea; la excepción no se extiende a otros controles (CA-44, CA-110).
6. Destino con solo fotos de baja resolución: lámina en el lugar principal también en el listado
   (CA-42).
7. Dato parcial de distancia o desnivel: se muestra lo que hay y la etiqueta se ajusta (CA-22).
8. Rutas no seleccionadas a 360 px: pueden ocultar el rótulo y dejar su letra clave, repetida en la
   lista (CA-68, CA-69).
9. Fotos de un destino: en la galería del inicio y, en el detalle, en una cuadrícula con visor
   (CA-41).
10. Piso contiguo con menos de tres fotos: regla de agrupación en cadena (CA-52).
11. La ficha completa de ruta se repite en la lista y en el panel a propósito (CA-68, CA-70).
12. Otras decisiones del humano: las etiquetas del perfil muestran solo el nombre (CA-5); menú móvil
    como control "Menú" que funciona sin JavaScript (CA-123); revisión humana con captura del
    perfil y las láminas construidos (CA-124).

## Decisiones tomadas (2026-10-11): modo de ejercicio académico

Decisión de alcance aprobada por el humano. La redacción de los criterios que la desarrollan (sección
N y los criterios ajustados) fue **aprobada por el humano el 2026-10-11**, incluidas las confirmaciones de PA-18.

- El sitio es un **ejercicio académico**: no hay operador real ni datos legales; no hay Registro
  Nacional de Turismo, NIT ni razón social, y no se inventan.
- Se añade un **modo de ejercicio académico** declarado en los datos del sitio (CA-125).
- **Aviso visible en todas las páginas**, no cerrable, accesible, con contraste AA y visible sin
  JavaScript y a 360 px (CA-126 a CA-130). Texto propuesto: "Proyecto académico. Este sitio no
  ofrece servicios turísticos reales."
- **Sin indexar** en buscadores, también en la compilación de publicación (CA-133).
- **Identificadores oficiales:** no se muestran ni se exigen para publicar en modo académico; sigue
  prohibido inventarlos o publicar relleno (CA-119, CA-120).
- **Textos legales de muestra:** existen las tres páginas, rotuladas como muestra sin validez legal,
  sin revisión de asesor (CA-134); la política de datos dice la verdad sobre lo que el sitio hace con
  los datos (CA-135, CA-136).
- **El resto de la puerta de publicación sigue estricto** en ambos modos (CA-139).
- **WhatsApp y correo reales se mantienen**, para probar la conexión; el horario no cambia (CA-82).
  Se propone aclarar en el contacto que es una prueba (CA-131, CA-132).
- **Lista de destinos y rutas aprobada** (PA-15 cerrada). Los textos describen lugares y recorridos
  y no prometen servicios, guías, cupos ni precios (CA-137).
- El sitio se desplegará en un servicio de alojamiento con dominio por definir; la dirección pública
  del sitio es un dato obligatorio para publicar (CA-139) y queda como pregunta abierta (PA-17).
- **El modo de operador real se conserva** en la spec como comportamiento verificable (CA-138). Razón
  del analista: las reglas estrictas ya están construidas y probadas, y el modo académico es una
  variante declarada en los datos; así no se pierden. Riesgo señalado: un sitio de operador real que
  quedara por error declarado como académico mostraría el aviso y no sería indexable (falla
  visible y segura); un sitio académico declarado por error como real fallaría la publicación por
  faltar identificadores (falla segura). Por eso la declaración es obligatoria y explícita
  (CA-125).

## Preguntas abiertas

Ninguna bloquea el desarrollo.

- **PA-8 (parte legal) — reclasificada el 2026-10-11.** En modo académico ya no hay documentos ni
  identificadores legales pendientes: los textos son de muestra (CA-134) y los identificadores no se
  muestran (CA-119). La pregunta solo vuelve a aplicar si el sitio pasa a un operador real: confirmar
  entonces con asesoría legal qué documentos e identificadores son obligatorios (Ley 1581 de 2012,
  Registro Nacional de Turismo, seguros) y entregar los identificadores reales (CA-118, CA-119,
  CA-138).
- **PA-15 — cerrada el 2026-10-11.** El humano aprobó la lista de destinos y rutas.
- **PA-17 — Dominio y dirección pública del sitio.** El dominio está por definir; es un dato
  obligatorio para la compilación de publicación (CA-139). Bloquea la publicación, no el desarrollo.
  Recomendación: definirlo antes de publicar y registrarlo como dato del sitio.
- **PA-18 — Confirmaciones pedidas al humano sobre la revisión del 2026-10-11 (cerrada: el humano
  las aceptó todas el 2026-10-11, tal como se proponen):**
  1. **CA-115 y CA-133:** que el sitio no sea indexable hace fallar a propósito la auditoría de
     indexación de Lighthouse; se propone medir SEO ≥ 90 sin esa auditoría. Alternativa: aceptar que
     la categoría SEO quede por debajo de 90 en modo académico.
  2. **CA-97 y CA-133:** en modo académico no hay mapa del sitio. Alternativa: publicarlo, lo que
     contradice no indexar.
  3. **CA-119 (b):** en modo académico la construcción falla si aparece cargado un identificador
     oficial. Alternativa: simplemente no mostrarlo.
  4. **CA-131 y CA-132:** aclaración de prueba en el contacto y en el mensaje inicial de WhatsApp,
     propuestas por el analista; no se dedujeron de las decisiones del humano.
  5. **Texto del aviso** de CA-126 y presentación (lo fija `ui-designer`); texto de CA-131 y CA-134.
  6. **Horario** en la sección de contacto: "lunes a viernes, de 10 a. m. a 10 p. m." sugiere un
     servicio de atención; se mantiene por decisión del humano, y CA-131 aclara que es una prueba.

---
Estado: APROBADA (2026-10-10, aprobada por el humano). Revisión del 2026-10-11 (modo de ejercicio
académico): APROBADA (2026-10-11, por el humano).

Nota de revisión (2026-10-10, tras la fase 2): se incorporaron los supuestos de diseño aceptados por
el humano. Criterios cambiados: CA-2, CA-5, CA-7, CA-21, CA-22, CA-23, CA-41, CA-42, CA-44, CA-52,
CA-68, CA-69, CA-70, CA-103 y CA-110. Criterios añadidos: CA-122, CA-123 y CA-124. Sin renumerar.

Nota de revisión (2026-10-10, tras la fase 3): CA-110 exceptúa también las líneas de ruta del mapa
del mínimo de 44 px, por decisión del humano.

Nota de revisión (2026-10-11, modo de ejercicio académico; aprobada por el humano el 2026-10-11): el sitio
pasa a ser un ejercicio académico. Criterios cambiados: CA-1, CA-97, CA-98, CA-108, CA-115, CA-118,
CA-119, CA-120 y CA-121 (los de modo, con ramas académica y de operador real), y HU-9, HU-12 y HU-13.
Criterios añadidos: CA-125 a CA-139 (sección N) y HU-14. Ninguno retirado ni renumerado.

Diseño de la fase 2 aprobado (2026-10-10). Lista para continuar con `software-architect` (fase 3).
