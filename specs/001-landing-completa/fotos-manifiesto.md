# Manifiesto de fotos (T-034, parte del curador)

Estado: **PROPUESTA DE FOTOS, lista para que otro agente descargue** (2026-10-11). Redactado por
`content-curator`, que no puede descargar archivos. Nada de esto está en `src/assets/` ni en el
frontmatter de los destinos todavía.

## Cómo se comprobó cada foto

- La **licencia, el autor, la fecha y las dimensiones** de las 18 fotos se leyeron en la **página
  del archivo en Wikimedia Commons** (cada enlace "Página" de abajo) el 2026-10-11. Ninguna página
  mostraba aviso de borrado ni de problema de derechos.
- Las URL de los archivos originales y las fuentes de Flickr salen de la API de Commons para
  esos mismos archivos.
- **El contenido de cada foto se vio** en una miniatura de 960 px y el texto alternativo
  describe lo que se ve. No se descargó ningún original.
- **Licencias presentes:** CC BY-SA 4.0 (14 fotos), CC BY-SA 3.0 (2 fotos de Paco Godoy) y CC BY-SA
  2.0 (2 fotos, ambas con origen en Flickr). Ninguna es NC ni ND, ninguna es generada por IA.
- **No busqué en Flickr ni en iNaturalist**: Commons ya da tres fotos por destino.

## Instrucciones para quien descargue

1. Descarga la **"URL a descargar"** de cada foto. Si el original mide más de 2560 px de ancho,
   la URL es una reducción de Commons a 2560 px (ADR 0008); si no, es el original. Las
   reducciones de 2560 px **no se pudieron probar** (solo se probaron las de 960 px). Si una falla,
   descarga el original y redúcelo a 2560 px de lado mayor sin recortar.
2. Guarda cada archivo con el **nombre propuesto** en `src/assets/photos/<slug-del-destino>/`.
3. Cada archivo debe pesar 1,5 MB o menos. Si pasa, baja la calidad JPEG sin cambiar las
   dimensiones, y avisa.
4. No recortes: el sitio recorta con `ratio` y `focus`. No apliques filtros.
5. Comprueba las dimensiones del archivo guardado y compáralas con la columna "Dimensiones del
   original" para detectar descargas equivocadas.

## Sobre la modificación y la licencia

Todas las fotos son CC BY-SA, y esa licencia obliga a **indicar que hay cambios** si se adapta la
obra. El sitio recorta, así que las fotos cuya proporción difiere de la prevista llevan
`modification: cropped` y el crédito dice "recortada". La reducción a 2560 px no se declara (ADR 0008). Las
copias recortadas que publica el sitio se licencian igual que el original (CC BY-SA de la misma
versión o una compatible). Este documento no es asesoría legal.

## Resumen

| Destino (slug) | Fotos propuestas | Lado mayor de 2000 px o más | Principal |
|---|---|---|---|
| `rio-claro` | 3 | 3 (la más corta, 2048 px) | `rio-claro-rio-con-balsas.jpg` |
| `santa-fe-de-antioquia` | 3 | 3 | `santa-fe-puente-sobre-el-cauca.jpg` |
| `jardin` | 3 | 3 | `jardin-canon-quebrada-volcanes.jpg` |
| `parque-arvi` | 3 | 3 | `arvi-cable-aereo-sobre-el-bosque.jpg` |
| `piedra-del-penol` | 3 | 3 | `penol-roca-y-escalera.jpg` |
| `paramo-de-belmira` | 3 | 1 | `belmira-frailejon-al-amanecer.jpg` |

Total: 18 fotos. Con tres fotos, cada destino recibe el tratamiento completo (CA-41).

## Reservas y descartadas

- **Reserva no comprobada en su página:** otras fotos grandes de la Piedra del Peñol (por ejemplo,
  de Javier Perez Montes, CC BY-SA 4.0, 8688 × 5792, y de Dtarazona, CC BY-SA 3.0, 4592 × 2576), y
  decenas de fotos más de la categoría de Commons del Cañón del Río Claro (mismo autor, misma licencia;
  solo se vieron cuatro).
- **Descartadas:** "Cueva del Esplendor.jpg" (1000 × 1318, menos de 1200 px); dos fotos "Río Claro
  (1396…)" de Alejandro Bayer Tamayo (no dicen de qué río Claro son); "Metro Cable Parque Arvi -
  panoramio.jpg" (reflejos del vidrio, mala calidad); "Reserva Natural Río Claro 15" (personas con
  cascos en primer plano); las fotos de calles y fachadas de Santa Fe de Antioquia (no son paisaje).

---

## 1. `rio-claro`

Todas por **Motero colombia**, CC BY-SA 4.0. La página de Commons solo dice "tomada en el municipio con código
05591" (Puerto Triunfo) y las ubica en la categoría "Reserva Natural Cañón del Río Claro"; la fecha
"2016-01-01" parece un valor por defecto. El lugar exacto dentro de la reserva no está descrito.

### 1.1 `rio-claro-rio-con-balsas.jpg` (principal)

- **Página:** <https://commons.wikimedia.org/wiki/File:Reserva_Natural_R%C3%ADo_Claro_128.jpg>
- **URL a descargar (original):** <https://upload.wikimedia.org/wikipedia/commons/f/f1/Reserva_Natural_R%C3%ADo_Claro_128.jpg>
- **Autor:** Motero colombia
- **Licencia:** CC BY-SA 4.0, <https://creativecommons.org/licenses/by-sa/4.0/>
- **Dimensiones del original:** 2048 × 1536. **Proporción:** 3:2 (recorte, `cropped`). **Punto de interés:** `center`.
- **Alt:** Río de aguas verdes con rocas grandes en el cauce y balsas azules amarradas a la orilla, entre árboles de bosque húmedo

### 1.2 `rio-claro-pasarela-y-poza.jpg`

- **Página:** <https://commons.wikimedia.org/wiki/File:Reserva_Natural_R%C3%ADo_Claro_129.jpg>
- **URL a descargar (original):** <https://upload.wikimedia.org/wikipedia/commons/d/d3/Reserva_Natural_R%C3%ADo_Claro_129.jpg>
- **Autor:** Motero colombia
- **Licencia:** CC BY-SA 4.0, <https://creativecommons.org/licenses/by-sa/4.0/>
- **Dimensiones del original:** 2048 × 1536. **Proporción:** 3:2 (`cropped`). **Punto de interés:** `right`.
- **Alt:** Pasarela de piedra junto a una poza de agua verde, con árboles que se cierran sobre el camino

### 1.3 `rio-claro-rocas-de-marmol.jpg`

- **Página:** <https://commons.wikimedia.org/wiki/File:Reserva_Natural_R%C3%ADo_Claro_104.jpg>
- **URL a descargar (original):** <https://upload.wikimedia.org/wikipedia/commons/0/0a/Reserva_Natural_R%C3%ADo_Claro_104.jpg>
- **Autor:** Motero colombia
- **Licencia:** CC BY-SA 4.0, <https://creativecommons.org/licenses/by-sa/4.0/>
- **Dimensiones del original:** 2048 × 1151 (16:9). **Proporción:** 3:2 (`cropped`; el recorte queda en unos 1727 × 1151 px, mejor usarla en tamaño menor). **Punto de interés:** `right`.
- **Alt:** Rocas claras de superficie ondulada en la orilla de un río verde, bajo árboles de ramas largas

## 2. `santa-fe-de-antioquia`

Fotos del **Puente de Occidente**, puente colgante sobre el río Cauca que comunica Santa Fe de
Antioquia con Olaya (descripciones de Commons; coordenadas aproximadas de las fotos: 6,53 a 6,58 N,
-75,82 a -75,80 O). Coherentes con el paisaje del Cauca y con el clima cálido del destino.

### 2.1 `santa-fe-puente-sobre-el-cauca.jpg` (principal)

- **Página:** <https://commons.wikimedia.org/wiki/File:Puente_de_occidente_(3147370781).jpg>
- **Origen:** Flickr, <https://www.flickr.com/photos/chilangoco/3147370781/> (revisada por el robot de Commons el 2014-01-25).
- **URL a descargar (reducción de 3072 a 2560 px):** <https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Puente_de_occidente_%283147370781%29.jpg/2560px-Puente_de_occidente_%283147370781%29.jpg>. Original: <https://upload.wikimedia.org/wikipedia/commons/1/12/Puente_de_occidente_%283147370781%29.jpg>
- **Autor:** Edgar Jiménez
- **Licencia:** CC BY-SA 2.0, <https://creativecommons.org/licenses/by-sa/2.0/>
- **Dimensiones del original:** 3072 × 1728 (16:9). **Proporción:** 3:2 (`cropped`). **Punto de interés:** `center`.
- **Alt:** Puente colgante que cruza un río ancho y de aguas pardas, con bancos de arena y montañas cubiertas de bosque al fondo

### 2.2 `santa-fe-puente-colgante-pasarela.jpg`

- **Página:** <https://commons.wikimedia.org/wiki/File:Puente_de_Occidente,_enero_de_2022_-_puente_01.jpg>
- **URL a descargar (reducción):** <https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Puente_de_Occidente%2C_enero_de_2022_-_puente_01.jpg/2560px-Puente_de_Occidente%2C_enero_de_2022_-_puente_01.jpg>. Original: <https://upload.wikimedia.org/wikipedia/commons/d/dd/Puente_de_Occidente%2C_enero_de_2022_-_puente_01.jpg>
- **Autor:** XalD
- **Licencia:** CC BY-SA 4.0, <https://creativecommons.org/licenses/by-sa/4.0/>
- **Dimensiones del original:** 3968 × 2976. **Proporción:** 3:2 (`cropped`). **Punto de interés:** `center`.
- **Alt:** Pasarela de madera de un puente colgante con torres blancas al fondo, bajo un cielo azul con nubes y colinas secas a un lado
- **Nota:** se ven personas pequeñas y una moto, de espaldas o sin rasgos identificables.

### 2.3 `santa-fe-puente-y-colinas.jpg`

- **Página:** <https://commons.wikimedia.org/wiki/File:Puente_de_Occidente_0.jpg>
- **URL a descargar (reducción):** <https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Puente_de_Occidente_0.jpg/2560px-Puente_de_Occidente_0.jpg>. Original: <https://upload.wikimedia.org/wikipedia/commons/2/29/Puente_de_Occidente_0.jpg>
- **Autor:** Xemenendura
- **Licencia:** CC BY-SA 4.0, <https://creativecommons.org/licenses/by-sa/4.0/>
- **Dimensiones del original:** 3594 × 2696. **Proporción:** 3:2 (`cropped`). **Punto de interés:** `center`.
- **Alt:** Pasarela de madera de un puente colgante frente a una ladera verde, con torres blancas y una persona caminando a lo lejos
- **Nota:** la página no da fecha.

## 3. `jardin`

### 3.1 `jardin-canon-quebrada-volcanes.jpg` (principal)

- **Página:** <https://commons.wikimedia.org/wiki/File:Ca%C3%B1%C3%B3n_de_la_Quebrada_Volcanes,_Jard%C3%ADn_-_02.jpg>
- **URL a descargar (reducción):** <https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Ca%C3%B1%C3%B3n_de_la_Quebrada_Volcanes%2C_Jard%C3%ADn_-_02.jpg/2560px-Ca%C3%B1%C3%B3n_de_la_Quebrada_Volcanes%2C_Jard%C3%ADn_-_02.jpg>. Original: <https://upload.wikimedia.org/wikipedia/commons/2/25/Ca%C3%B1%C3%B3n_de_la_Quebrada_Volcanes%2C_Jard%C3%ADn_-_02.jpg>
- **Autor:** XalD
- **Licencia:** CC BY-SA 4.0, <https://creativecommons.org/licenses/by-sa/4.0/>
- **Dimensiones del original:** 4608 × 3456. **Proporción:** 3:2 (`cropped`). **Punto de interés:** `center`. Coordenadas en Jardín (5,5947 N, -75,8188 O).
- **Alt:** Puente amarillo sobre un cañón de bosque, con laderas de cultivos y montañas bajo nubes al fondo

### 3.2 `jardin-panoramica-del-pueblo.jpg`

- **Página:** <https://commons.wikimedia.org/wiki/File:Panor%C3%A1mica_de_Jard%C3%ADn,_Antioquia,_2022.jpg>
- **Origen:** Flickr, <https://www.flickr.com/photos/gary_leavens/52039061010/> (revisada en Commons por FlickreviewR 2 el 2022-11-25).
- **URL a descargar (reducción; el original pesa casi 18 MB):** <https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Panor%C3%A1mica_de_Jard%C3%ADn%2C_Antioquia%2C_2022.jpg/2560px-Panor%C3%A1mica_de_Jard%C3%ADn%2C_Antioquia%2C_2022.jpg>. Original: <https://upload.wikimedia.org/wikipedia/commons/c/c7/Panor%C3%A1mica_de_Jard%C3%ADn%2C_Antioquia%2C_2022.jpg>
- **Autor:** Gary Leavens (en Commons, "Gary T. Leavens")
- **Licencia:** CC BY-SA 2.0, <https://creativecommons.org/licenses/by-sa/2.0/>
- **Dimensiones del original:** 5472 × 3078 (16:9). **Proporción:** 3:2 (`cropped`). **Punto de interés:** `right` (la basílica).
- **Alt:** Casco urbano de Jardín con techos de teja y la basílica de dos torres, rodeado de laderas verdes

### 3.3 `jardin-casa-de-balcones.jpg`

- **Página:** <https://commons.wikimedia.org/wiki/File:Casas_en_Jard%C3%ADn_(Antioquia)_-_01.jpg>
- **URL a descargar (reducción):** <https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Casas_en_Jard%C3%ADn_%28Antioquia%29_-_01.jpg/2560px-Casas_en_Jard%C3%ADn_%28Antioquia%29_-_01.jpg>. Original: <https://upload.wikimedia.org/wikipedia/commons/4/46/Casas_en_Jard%C3%ADn_%28Antioquia%29_-_01.jpg>
- **Autor:** XalD
- **Licencia:** CC BY-SA 4.0, <https://creativecommons.org/licenses/by-sa/4.0/>
- **Dimensiones del original:** 4608 × 3456. **Proporción:** 3:2 (`cropped`). **Punto de interés:** `center`. Coordenadas en Jardín (5,5955 N, -75,8176 O).
- **Alt:** Casa de tres pisos con fachada amarilla y balcones fucsia en una calle del pueblo, con una montaña cubierta de nubes al fondo
- **Nota:** foto de pueblo, no de paisaje; hay cables visibles. Es la más débil de las tres.

## 4. `parque-arvi`

### 4.1 `arvi-cable-aereo-sobre-el-bosque.jpg` (principal)

- **Página:** <https://commons.wikimedia.org/wiki/File:Metrocable_del_Parque_Arv%C3%AD_-_Medell%C3%ADn.jpg>
- **URL a descargar (reducción):** <https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Metrocable_del_Parque_Arv%C3%AD_-_Medell%C3%ADn.jpg/2560px-Metrocable_del_Parque_Arv%C3%AD_-_Medell%C3%ADn.jpg>. Original: <https://upload.wikimedia.org/wikipedia/commons/d/df/Metrocable_del_Parque_Arv%C3%AD_-_Medell%C3%ADn.jpg>
- **Autor:** Alejandro Rojas (SajoR)
- **Licencia:** CC BY-SA 4.0, <https://creativecommons.org/licenses/by-sa/4.0/>
- **Dimensiones del original:** 5664 × 3184 (16:9). **Proporción:** 3:2 (`cropped`). **Punto de interés:** `center`.
- **Alt:** Cabina del cable aéreo suspendida sobre un bosque extenso, con nubes en el cielo abierto

### 4.2 `arvi-camino-empedrado.jpg`

- **Página:** <https://commons.wikimedia.org/wiki/File:Caminata_en_Parque_Arv%C3%AD.JPG>
- **URL a descargar (original; mide menos de 2560 px):** <https://upload.wikimedia.org/wikipedia/commons/a/ac/Caminata_en_Parque_Arv%C3%AD.JPG>
- **Autor:** Paco Godoy
- **Licencia:** CC BY-SA 3.0, <https://creativecommons.org/licenses/by-sa/3.0/>
- **Dimensiones del original:** 1944 × 2592 (vertical, 3:4). **Proporción:** 4:5 (`cropped`). **Punto de interés:** `bottom` (el camino y los caminantes).
- **Alt:** Tres caminantes de espaldas avanzan por un camino empedrado junto a un talud de musgo y árboles altos
- **Notas:** categorizada en Commons como "Arví Park" y "Zona Arqueológica de Piedras Blancas". La descripción de la
  página es genérica ("monumento colombiano") y los metadatos EXIF traen "Copyright 2009", que no coincide con la
  fecha de 2012; la página declara a Paco Godoy como autor y CC BY-SA 3.0 como licencia. Los caminantes van de
  espaldas.

### 4.3 `arvi-sendero-entre-arboles.jpg`

- **Página:** <https://commons.wikimedia.org/wiki/File:Bosque_Parque_Arv%C3%AD.JPG>
- **URL a descargar (original; mide menos de 2560 px):** <https://upload.wikimedia.org/wikipedia/commons/a/ab/Bosque_Parque_Arv%C3%AD.JPG>
- **Autor:** Paco Godoy
- **Licencia:** CC BY-SA 3.0, <https://creativecommons.org/licenses/by-sa/3.0/>
- **Dimensiones del original:** 2592 × 1944. **Proporción:** 3:2 (`cropped`). **Punto de interés:** `center`.
- **Alt:** Sendero de tierra rojiza entre árboles altos y delgados con helechos y niebla entre el follaje
- **Notas:** calidad modesta: hay una pila de leña tapada con plástico en primer plano. Mismas notas de metadatos que la anterior.

## 5. `piedra-del-penol`

### 5.1 `penol-roca-y-escalera.jpg` (principal)

- **Página:** <https://commons.wikimedia.org/wiki/File:El_Pe%C3%B1%C3%B3n_de_Guatap%C3%A9_2014.jpg>
- **URL a descargar (reducción):** <https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/El_Pe%C3%B1%C3%B3n_de_Guatap%C3%A9_2014.jpg/2560px-El_Pe%C3%B1%C3%B3n_de_Guatap%C3%A9_2014.jpg>. Original: <https://upload.wikimedia.org/wikipedia/commons/9/9b/El_Pe%C3%B1%C3%B3n_de_Guatap%C3%A9_2014.jpg>
- **Autor:** Jaroslav Jelínek
- **Licencia:** CC BY-SA 4.0, <https://creativecommons.org/licenses/by-sa/4.0/>
- **Dimensiones del original:** 2912 × 2203. **Proporción:** 3:2 (`cropped`). **Punto de interés:** `top`.
- **Alt:** Enorme roca oscura con una escalera en zigzag que sube hasta una torre en la cima, y unas casas y puestos al pie

### 5.2 `penol-embalse-desde-la-cima.jpg`

- **Página:** <https://commons.wikimedia.org/wiki/File:Vista_desde_la_Piedra_del_Pe%C3%B1ol,_Guatap%C3%A9,_Antioquia,_Colombia.jpg>
- **URL a descargar (reducción):** <https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Vista_desde_la_Piedra_del_Pe%C3%B1ol%2C_Guatap%C3%A9%2C_Antioquia%2C_Colombia.jpg/2560px-Vista_desde_la_Piedra_del_Pe%C3%B1ol%2C_Guatap%C3%A9%2C_Antioquia%2C_Colombia.jpg>. Original: <https://upload.wikimedia.org/wikipedia/commons/3/39/Vista_desde_la_Piedra_del_Pe%C3%B1ol%2C_Guatap%C3%A9%2C_Antioquia%2C_Colombia.jpg>
- **Autor:** IdkSGM
- **Licencia:** CC BY-SA 4.0, <https://creativecommons.org/licenses/by-sa/4.0/>
- **Dimensiones del original:** 4000 × 2252 (16:9). **Proporción:** 3:2 (`cropped`). **Punto de interés:** `center`.
- **Alt:** Vista desde lo alto de la roca: el embalse con islas de bosque, una carretera, un puente y un estacionamiento lleno de vehículos, bajo nubes altas

### 5.3 `penol-islas-del-embalse.jpg`

- **Página:** <https://commons.wikimedia.org/wiki/File:Embalse_Guatap%C3%A9,_departamento_de_Antioqu%C3%ADa.jpg>
- **URL a descargar (original; mide menos de 2560 px):** <https://upload.wikimedia.org/wikipedia/commons/6/6c/Embalse_Guatap%C3%A9%2C_departamento_de_Antioqu%C3%ADa.jpg>
- **Autor:** MaricarmenRoa
- **Licencia:** CC BY-SA 4.0, <https://creativecommons.org/licenses/by-sa/4.0/>
- **Dimensiones del original:** 2048 × 1536. **Proporción:** 3:2 (`cropped`). **Punto de interés:** `top`.
- **Alt:** Embalse de aguas oscuras con penínsulas e islas cubiertas de pasto y árboles, bajo un cielo gris
- **Notas:** imagen sombría y de calidad modesta; la descripción de Commons la presenta como "vista de restos del casco urbano de Guatapé desde la Piedra del Peñol". Es la más débil de las tres.

## 6. `paramo-de-belmira`

Las tres fotos son de lugar comprobado en la página de Commons (descripción que nombra el páramo de
Belmira). Las dos de Elcrespodeloscuentos tienen fecha de junio de 2026; la del frailejón figura con fecha de 2013
y versión subida en julio de 2026. Ninguna tiene coordenadas.

### 6.1 `belmira-frailejon-al-amanecer.jpg` (principal)

- **Página:** <https://commons.wikimedia.org/wiki/File:Frailej%C3%B3n_P%C3%A1ramo_de_Belmira_Sandra_Ram%C3%ADrez_Giraldo.jpg>
- **URL a descargar (reducción):** <https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Frailej%C3%B3n_P%C3%A1ramo_de_Belmira_Sandra_Ram%C3%ADrez_Giraldo.jpg/2560px-Frailej%C3%B3n_P%C3%A1ramo_de_Belmira_Sandra_Ram%C3%ADrez_Giraldo.jpg>. Original: <https://upload.wikimedia.org/wikipedia/commons/c/c9/Frailej%C3%B3n_P%C3%A1ramo_de_Belmira_Sandra_Ram%C3%ADrez_Giraldo.jpg>
- **Autor:** Sandramirezgiraldo
- **Licencia:** CC BY-SA 4.0, <https://creativecommons.org/licenses/by-sa/4.0/>
- **Dimensiones del original:** 4288 × 2848 (ya es 3:2). **Proporción:** 3:2 (`none`). **Punto de interés:** `left` (el frailejón).
- **Alt:** Frailejón a contraluz sobre una ladera con cordilleras envueltas en niebla y un cielo amarillo y naranja al amanecer

### 6.2 `belmira-laguna-de-paramo.jpg`

- **Página:** <https://commons.wikimedia.org/wiki/File:Laguna_p%C3%A1ramo_de_Belmira_amanecer_28,6,26.jpg>
- **URL a descargar (original; mide menos de 2560 px):** <https://upload.wikimedia.org/wikipedia/commons/2/22/Laguna_p%C3%A1ramo_de_Belmira_amanecer_28%2C6%2C26.jpg>
- **Autor:** Elcrespodeloscuentos
- **Licencia:** CC BY-SA 4.0, <https://creativecommons.org/licenses/by-sa/4.0/>
- **Dimensiones del original:** 1600 × 1196. **Proporción:** 3:2 (`cropped`). **Punto de interés:** `center`. **Solo tamaño menor** (lado mayor de 1600 px).
- **Alt:** Laguna tranquila de páramo con frailejones en la orilla y un cerro cubierto de vegetación al fondo, con luz suave de amanecer

### 6.3 `belmira-orquidea-y-frailejon.jpg`

- **Página:** <https://commons.wikimedia.org/wiki/File:Epidendrum_arachnoglossum_28,06,26_P%C3%A1ramo_de_Belmira.jpg>
- **URL a descargar (original; mide menos de 2560 px):** <https://upload.wikimedia.org/wikipedia/commons/b/b2/Epidendrum_arachnoglossum_28%2C06%2C26_P%C3%A1ramo_de_Belmira.jpg>
- **Autor:** Elcrespodeloscuentos
- **Licencia:** CC BY-SA 4.0, <https://creativecommons.org/licenses/by-sa/4.0/>
- **Dimensiones del original:** 1600 × 1196. **Proporción:** 3:2 (`cropped`). **Punto de interés:** `center`. **Solo tamaño menor** (lado mayor de 1600 px).
- **Alt:** Flor rosada de una orquídea de páramo sobre un tallo delgado, con las hojas de un frailejón desenfocadas al fondo

---

## 7. Bloques de frontmatter listos para pegar

Son los bloques `photos:` de la guía. Cada `file` es relativo al `.md` del destino. Se pegan
**solo después de que el archivo exista**: una ruta a un archivo ausente falla el build. El orden de la lista es el
editorial (la primera es la principal).

### `rio-claro.md`

```yaml
photos:
  - file: ../../assets/photos/rio-claro/rio-claro-rio-con-balsas.jpg
    alt: Río de aguas verdes con rocas grandes en el cauce y balsas azules amarradas a la orilla, entre árboles de bosque húmedo
    author: Motero colombia
    license:
      kind: cc-by-sa
      name: CC BY-SA 4.0
      url: https://creativecommons.org/licenses/by-sa/4.0/
    sourceUrl: https://commons.wikimedia.org/wiki/File:Reserva_Natural_R%C3%ADo_Claro_128.jpg
    modification: cropped
    ratio: '3:2'
    focus: center
  - file: ../../assets/photos/rio-claro/rio-claro-pasarela-y-poza.jpg
    alt: Pasarela de piedra junto a una poza de agua verde, con árboles que se cierran sobre el camino
    author: Motero colombia
    license:
      kind: cc-by-sa
      name: CC BY-SA 4.0
      url: https://creativecommons.org/licenses/by-sa/4.0/
    sourceUrl: https://commons.wikimedia.org/wiki/File:Reserva_Natural_R%C3%ADo_Claro_129.jpg
    modification: cropped
    ratio: '3:2'
    focus: right
  - file: ../../assets/photos/rio-claro/rio-claro-rocas-de-marmol.jpg
    alt: Rocas claras de superficie ondulada en la orilla de un río verde, bajo árboles de ramas largas
    author: Motero colombia
    license:
      kind: cc-by-sa
      name: CC BY-SA 4.0
      url: https://creativecommons.org/licenses/by-sa/4.0/
    sourceUrl: https://commons.wikimedia.org/wiki/File:Reserva_Natural_R%C3%ADo_Claro_104.jpg
    modification: cropped
    ratio: '3:2'
    focus: right
```

### `santa-fe-de-antioquia.md`

```yaml
photos:
  - file: ../../assets/photos/santa-fe-de-antioquia/santa-fe-puente-sobre-el-cauca.jpg
    alt: Puente colgante que cruza un río ancho y de aguas pardas, con bancos de arena y montañas cubiertas de bosque al fondo
    author: Edgar Jiménez
    license:
      kind: cc-by-sa
      name: CC BY-SA 2.0
      url: https://creativecommons.org/licenses/by-sa/2.0/
    sourceUrl: https://commons.wikimedia.org/wiki/File:Puente_de_occidente_(3147370781).jpg
    modification: cropped
    ratio: '3:2'
    focus: center
  - file: ../../assets/photos/santa-fe-de-antioquia/santa-fe-puente-colgante-pasarela.jpg
    alt: Pasarela de madera de un puente colgante con torres blancas al fondo, bajo un cielo azul con nubes y colinas secas a un lado
    author: XalD
    license:
      kind: cc-by-sa
      name: CC BY-SA 4.0
      url: https://creativecommons.org/licenses/by-sa/4.0/
    sourceUrl: https://commons.wikimedia.org/wiki/File:Puente_de_Occidente,_enero_de_2022_-_puente_01.jpg
    modification: cropped
    ratio: '3:2'
    focus: center
  - file: ../../assets/photos/santa-fe-de-antioquia/santa-fe-puente-y-colinas.jpg
    alt: Pasarela de madera de un puente colgante frente a una ladera verde, con torres blancas y una persona caminando a lo lejos
    author: Xemenendura
    license:
      kind: cc-by-sa
      name: CC BY-SA 4.0
      url: https://creativecommons.org/licenses/by-sa/4.0/
    sourceUrl: https://commons.wikimedia.org/wiki/File:Puente_de_Occidente_0.jpg
    modification: cropped
    ratio: '3:2'
    focus: center
```

### `jardin.md`

```yaml
photos:
  - file: ../../assets/photos/jardin/jardin-canon-quebrada-volcanes.jpg
    alt: Puente amarillo sobre un cañón de bosque, con laderas de cultivos y montañas bajo nubes al fondo
    author: XalD
    license:
      kind: cc-by-sa
      name: CC BY-SA 4.0
      url: https://creativecommons.org/licenses/by-sa/4.0/
    sourceUrl: https://commons.wikimedia.org/wiki/File:Ca%C3%B1%C3%B3n_de_la_Quebrada_Volcanes,_Jard%C3%ADn_-_02.jpg
    modification: cropped
    ratio: '3:2'
    focus: center
  - file: ../../assets/photos/jardin/jardin-panoramica-del-pueblo.jpg
    alt: Casco urbano de Jardín con techos de teja y la basílica de dos torres, rodeado de laderas verdes
    author: Gary Leavens
    license:
      kind: cc-by-sa
      name: CC BY-SA 2.0
      url: https://creativecommons.org/licenses/by-sa/2.0/
    sourceUrl: https://commons.wikimedia.org/wiki/File:Panor%C3%A1mica_de_Jard%C3%ADn,_Antioquia,_2022.jpg
    modification: cropped
    ratio: '3:2'
    focus: right
  - file: ../../assets/photos/jardin/jardin-casa-de-balcones.jpg
    alt: Casa de tres pisos con fachada amarilla y balcones fucsia en una calle del pueblo, con una montaña cubierta de nubes al fondo
    author: XalD
    license:
      kind: cc-by-sa
      name: CC BY-SA 4.0
      url: https://creativecommons.org/licenses/by-sa/4.0/
    sourceUrl: https://commons.wikimedia.org/wiki/File:Casas_en_Jard%C3%ADn_(Antioquia)_-_01.jpg
    modification: cropped
    ratio: '3:2'
    focus: center
```

### `parque-arvi.md`

```yaml
photos:
  - file: ../../assets/photos/parque-arvi/arvi-cable-aereo-sobre-el-bosque.jpg
    alt: Cabina del cable aéreo suspendida sobre un bosque extenso, con nubes en el cielo abierto
    author: Alejandro Rojas (SajoR)
    license:
      kind: cc-by-sa
      name: CC BY-SA 4.0
      url: https://creativecommons.org/licenses/by-sa/4.0/
    sourceUrl: https://commons.wikimedia.org/wiki/File:Metrocable_del_Parque_Arv%C3%AD_-_Medell%C3%ADn.jpg
    modification: cropped
    ratio: '3:2'
    focus: center
  - file: ../../assets/photos/parque-arvi/arvi-camino-empedrado.jpg
    alt: Tres caminantes de espaldas avanzan por un camino empedrado junto a un talud de musgo y árboles altos
    author: Paco Godoy
    license:
      kind: cc-by-sa
      name: CC BY-SA 3.0
      url: https://creativecommons.org/licenses/by-sa/3.0/
    sourceUrl: https://commons.wikimedia.org/wiki/File:Caminata_en_Parque_Arv%C3%AD.JPG
    modification: cropped
    ratio: '4:5'
    focus: bottom
  - file: ../../assets/photos/parque-arvi/arvi-sendero-entre-arboles.jpg
    alt: Sendero de tierra rojiza entre árboles altos y delgados con helechos y niebla entre el follaje
    author: Paco Godoy
    license:
      kind: cc-by-sa
      name: CC BY-SA 3.0
      url: https://creativecommons.org/licenses/by-sa/3.0/
    sourceUrl: https://commons.wikimedia.org/wiki/File:Bosque_Parque_Arv%C3%AD.JPG
    modification: cropped
    ratio: '3:2'
    focus: center
```

### `piedra-del-penol.md`

```yaml
photos:
  - file: ../../assets/photos/piedra-del-penol/penol-roca-y-escalera.jpg
    alt: Enorme roca oscura con una escalera en zigzag que sube hasta una torre en la cima, y unas casas y puestos al pie
    author: Jaroslav Jelínek
    license:
      kind: cc-by-sa
      name: CC BY-SA 4.0
      url: https://creativecommons.org/licenses/by-sa/4.0/
    sourceUrl: https://commons.wikimedia.org/wiki/File:El_Pe%C3%B1%C3%B3n_de_Guatap%C3%A9_2014.jpg
    modification: cropped
    ratio: '3:2'
    focus: top
  - file: ../../assets/photos/piedra-del-penol/penol-embalse-desde-la-cima.jpg
    alt: Vista desde lo alto de la roca con el embalse y sus islas de bosque, una carretera, un puente y un estacionamiento lleno de vehículos, bajo nubes altas
    author: IdkSGM
    license:
      kind: cc-by-sa
      name: CC BY-SA 4.0
      url: https://creativecommons.org/licenses/by-sa/4.0/
    sourceUrl: https://commons.wikimedia.org/wiki/File:Vista_desde_la_Piedra_del_Pe%C3%B1ol,_Guatap%C3%A9,_Antioquia,_Colombia.jpg
    modification: cropped
    ratio: '3:2'
    focus: center
  - file: ../../assets/photos/piedra-del-penol/penol-islas-del-embalse.jpg
    alt: Embalse de aguas oscuras con penínsulas e islas cubiertas de pasto y árboles, bajo un cielo gris
    author: MaricarmenRoa
    license:
      kind: cc-by-sa
      name: CC BY-SA 4.0
      url: https://creativecommons.org/licenses/by-sa/4.0/
    sourceUrl: https://commons.wikimedia.org/wiki/File:Embalse_Guatap%C3%A9,_departamento_de_Antioqu%C3%ADa.jpg
    modification: cropped
    ratio: '3:2'
    focus: top
```

### `paramo-de-belmira.md`

```yaml
photos:
  - file: ../../assets/photos/paramo-de-belmira/belmira-frailejon-al-amanecer.jpg
    alt: Frailejón a contraluz sobre una ladera con cordilleras envueltas en niebla y un cielo amarillo y naranja al amanecer
    author: Sandramirezgiraldo
    license:
      kind: cc-by-sa
      name: CC BY-SA 4.0
      url: https://creativecommons.org/licenses/by-sa/4.0/
    sourceUrl: https://commons.wikimedia.org/wiki/File:Frailej%C3%B3n_P%C3%A1ramo_de_Belmira_Sandra_Ram%C3%ADrez_Giraldo.jpg
    modification: none
    ratio: '3:2'
    focus: left
  - file: ../../assets/photos/paramo-de-belmira/belmira-laguna-de-paramo.jpg
    alt: Laguna tranquila de páramo con frailejones en la orilla y un cerro cubierto de vegetación al fondo, con luz suave de amanecer
    author: Elcrespodeloscuentos
    license:
      kind: cc-by-sa
      name: CC BY-SA 4.0
      url: https://creativecommons.org/licenses/by-sa/4.0/
    sourceUrl: https://commons.wikimedia.org/wiki/File:Laguna_p%C3%A1ramo_de_Belmira_amanecer_28,6,26.jpg
    modification: cropped
    ratio: '3:2'
    focus: center
  - file: ../../assets/photos/paramo-de-belmira/belmira-orquidea-y-frailejon.jpg
    alt: Flor rosada de una orquídea de páramo sobre un tallo delgado, con las hojas de un frailejón desenfocadas al fondo
    author: Elcrespodeloscuentos
    license:
      kind: cc-by-sa
      name: CC BY-SA 4.0
      url: https://creativecommons.org/licenses/by-sa/4.0/
    sourceUrl: https://commons.wikimedia.org/wiki/File:Epidendrum_arachnoglossum_28,06,26_P%C3%A1ramo_de_Belmira.jpg
    modification: cropped
    ratio: '3:2'
    focus: center
```
