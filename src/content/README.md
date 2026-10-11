# Guía de contenido

Para quien escribe el contenido del sitio (`content-curator`). No hace falta leer el código: aquí están los archivos, los campos, los valores permitidos, un ejemplo válido de cada uno y los errores más probables.

Los ejemplos de esta guía se validan con los esquemas reales en `tests/unit/content-guide.test.ts`; si un ejemplo deja de ser válido, esa prueba falla.

## Reglas generales

- Las **claves** van en inglés (`altitude`, `photos`); los **textos** que lee el público, en español de Colombia.
- El **nombre del archivo es el identificador** (slug) y va en `kebab-case`: minúsculas, números y guiones, sin tildes ni espacios ni guion bajo. Ejemplo: `valle-de-cocora.md`.
- El **piso térmico no se escribe**: el sitio lo calcula con la altitud. Tampoco se escriben precios ni fechas de salida.
- Nada se inventa. Una altitud, un identificador o una licencia que no se pueda comprobar no se escribe: se deja `verified: false` o se omite la clave.
- Los cambios no se ven hasta construir: `npm run dev` (vista previa) o `npm run build`.

## Dos modos de construcción

| Orden                   | Modo         | Qué hace con lo incompleto                                                              |
| ----------------------- | ------------ | --------------------------------------------------------------------------------------- |
| `npm run dev` / `build` | Vista previa | Se genera. Marca las páginas como no indexables y avisa de lo que impediría publicar.   |
| `npm run build:release` | Publicación  | Falla si queda algo en borrador, ausente, de relleno o sin verificar. Es el que se usa. |

Los problemas se informan **todos juntos**, cada uno con archivo, campo, regla y criterio (por ejemplo `CA-20`).

## Estructura

```
src/content/
  destinos/<slug>.md          un destino por archivo (frontmatter YAML + texto largo)
  rutas/<slug>.json           una ruta por archivo (GeoJSON)
  legal/<slug>.md             exactamente tres textos legales
  sitio/territorio.json       rango de altitud y umbrales entre pisos
  sitio/operador.json         datos de contacto e identificadores del operador
src/assets/photos/<slug-del-destino>/<archivo>.jpg     fotos (ADR 0008)
```

## 1. `sitio/territorio.json`

Define el rango de altitud de Antioquia (el que muestra el titular de la portada) y los tres umbrales que separan los pisos. **Una altitud igual a un umbral pertenece al piso de arriba.**

| Campo                  | Tipo     | Notas                                                                                        |
| ---------------------- | -------- | -------------------------------------------------------------------------------------------- |
| `minM`, `maxM`         | entero   | Metros. Altitud mínima y máxima declaradas.                                                  |
| `thresholds.temperate` | entero   | Donde empieza el piso templado.                                                              |
| `thresholds.cold`      | entero   | Donde empieza el piso frío.                                                                  |
| `thresholds.paramo`    | entero   | Donde empieza el páramo.                                                                     |
| `verified`             | booleano | `true` solo si las cifras se comprobaron en una fuente. Sin esto, ningún destino se publica. |
| `source`               | texto    | Fuente de las cifras. Obligatoria si `verified` es `true`.                                   |

Orden obligatorio: `minM < temperate < cold < paramo < maxM`. Si no se cumple, falla incluso la vista previa (CA-122).

<!-- ejemplo:territorio -->

```json
{
  "minM": 100,
  "maxM": 3800,
  "thresholds": { "temperate": 1000, "cold": 2000, "paramo": 3000 },
  "verified": false,
  "source": "Pendiente de comprobar en una fuente oficial"
}
```

Las cifras de este ejemplo son solo de forma, no son datos reales.

## 2. `destinos/<slug>.md`

Frontmatter YAML entre líneas `---`, y debajo el texto largo del destino en Markdown (varios párrafos; sin encabezado `#`, la página ya trae el título).

| Campo               | Tipo              | Obligatorio | Notas                                                                                                      |
| ------------------- | ----------------- | ----------- | ---------------------------------------------------------------------------------------------------------- |
| `name`              | texto             | sí          | Hasta **37** caracteres. Único entre destinos.                                                             |
| `summary`           | texto             | sí          | Hasta **160** caracteres. Única. Es la descripción de la tarjeta y del buscador.                           |
| `altitude.meters`   | entero > 0        | sí          | Metros sobre el nivel del mar. Debe caer entre `minM` y `maxM` del territorio.                             |
| `altitude.verified` | booleano          | sí          | `true` solo si se comprobó. Con `false` el destino **no se publica** (vista previa: se excluye con aviso). |
| `altitude.source`   | texto             | si verified | Fuente de la cifra.                                                                                        |
| `featured`          | booleano          | no          | `true` marca el destino principal de su piso. Solo uno por piso; si ninguno, se usa el de menor altitud.   |
| `climate`           | `{ minC, maxC }`  | no          | Grados Celsius. `minC` debe ser menor que `maxC`.                                                          |
| `access`            | texto             | no          | Cómo llegar.                                                                                               |
| `duration`          | `{ value, unit }` | no          | `unit`: `hours` o `days`.                                                                                  |
| `distanceKm`        | número > 0        | no          | Kilómetros.                                                                                                |
| `ascentM`           | entero >= 0       | no          | Metros de ascenso acumulado.                                                                               |
| `difficulty`        | lista cerrada     | no          | `easy` (Fácil), `moderate` (Moderada), `demanding` (Exigente).                                             |
| `minAge`            | entero >= 0       | no          | Edad mínima, en años.                                                                                      |
| `photos`            | lista             | no          | El orden es el editorial: la primera es la foto principal. Ver más abajo.                                  |

Un campo opcional que no se conoce **se omite**; no se escribe "N/D" ni un valor de relleno.

### Fotos de un destino

Las fotos son archivos del repositorio (no enlaces), en `src/assets/photos/<slug-del-destino>/`. Guarda el original o una reducción sin recortar, de **2560 px de lado mayor como máximo y 1,5 MB**. El recorte lo hace el sitio según `ratio` y `focus`.

| Campo          | Valores                                                            | Notas                                                                                      |
| -------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `file`         | ruta relativa al `.md`: `../../assets/photos/<slug>/<archivo>.jpg` | El lado mayor debe medir **al menos 1200 px**; con 2000 px o más se permite tamaño grande. |
| `alt`          | texto                                                              | Describe la imagen. **No** debe nombrar al autor ni la licencia. Nunca vacío.              |
| `author`       | texto                                                              | Autor tal como lo pide la licencia.                                                        |
| `license.kind` | `cc0`, `public-domain`, `cc-by`, `cc-by-sa`                        | Nunca NC (no comercial) ni ND (sin derivadas).                                             |
| `license.name` | texto, p. ej. `CC BY-SA 4.0`                                       | No puede contener NC ni ND.                                                                |
| `license.url`  | enlace                                                             | Texto de la licencia.                                                                      |
| `sourceUrl`    | enlace                                                             | Página de la foto en Commons, Flickr o iNaturalist.                                        |
| `modification` | `none`, `cropped`, `modified`                                      | Obligatorio, sin valor por defecto. `modified` aparece como "Modificada" en el crédito.    |
| `ratio`        | `3:2`, `4:5`, `1:1`                                                | Proporción con la que se muestra.                                                          |
| `focus`        | `center`, `top`, `bottom`, `left`, `right`                         | Punto de interés del recorte. Por defecto `center`.                                        |

<!-- ejemplo:destino -->

```md
---
name: Destino de ejemplo
summary: Una frase que dice qué es el lugar y por qué se visita, de menos de 160 caracteres.
altitude:
  meters: 1500
  verified: false
  source: Pendiente de comprobar
featured: false
climate: { minC: 12, maxC: 22 }
access: Cómo llegar desde el punto de partida más cercano.
duration: { value: 4, unit: hours }
distanceKm: 6.5
ascentM: 320
difficulty: moderate
minAge: 8
photos:
  - file: ../../assets/photos/destino-de-ejemplo/sendero.jpg
    alt: Sendero de tierra entre helechos y árboles cubiertos de musgo
    author: Nombre del autor
    license:
      kind: cc-by
      name: CC BY 4.0
      url: https://creativecommons.org/licenses/by/4.0/
    sourceUrl: https://commons.wikimedia.org/wiki/File:Ejemplo.jpg
    modification: none
    ratio: '3:2'
    focus: center
---

Primer párrafo del texto largo: qué se ve y qué se siente en el lugar.

Segundo párrafo: qué se hace, cuánto dura y qué conviene llevar.
```

El ejemplo no es un destino real: su `altitude.verified` es `false` para que no se publique por descuido. Cámbialo a `true` solo con la fuente a la mano.

## 3. `rutas/<slug>.json`

Una ruta por archivo, en formato GeoJSON (`Feature` con una `LineString`). **Las coordenadas van en orden longitud, latitud** (al revés de como las muestra Google Maps); el tercer valor, opcional, es la elevación en metros. Si hay elevación, debe estar en **todos** los puntos o en ninguno. El trazado debería tener 400 puntos como máximo.

| Campo                  | Notas                                                                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `type`                 | Siempre `"Feature"`.                                                                                                                     |
| `geometry.type`        | Siempre `"LineString"`.                                                                                                                  |
| `geometry.coordinates` | Al menos 2 puntos `[lon, lat]` o `[lon, lat, elevación]`. Longitud -180 a 180, latitud -90 a 90.                                         |
| `properties.name`      | Nombre de la ruta.                                                                                                                       |
| `properties.destino`   | Slug de un destino existente (el nombre de su archivo sin `.md`).                                                                        |
| `properties.elevation` | `{ "minM": entero, "maxM": entero }`. `minM` no puede superar `maxM`.                                                                    |
| `properties.*`         | Opcionalmente, los mismos campos de ficha del destino: `climate`, `access`, `duration`, `distanceKm`, `ascentM`, `difficulty`, `minAge`. |

Una ruta de un destino que no se publica tampoco se publica.

<!-- ejemplo:ruta -->

```json
{
  "type": "Feature",
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [-75.5, 6.2, 1500],
      [-75.49, 6.21, 1540],
      [-75.48, 6.22, 1620]
    ]
  },
  "properties": {
    "name": "Sendero de ejemplo",
    "destino": "destino-de-ejemplo",
    "elevation": { "minM": 1500, "maxM": 1620 },
    "distanceKm": 3.2,
    "difficulty": "easy"
  }
}
```

## 4. `legal/<slug>.md`

Exactamente **tres** textos, uno de cada `kind`, con estos nombres de archivo: `politica-de-datos.md` (`privacy`), `terminos-y-condiciones.md` (`terms`) y `politica-de-cancelacion.md` (`cancellation`).

| Campo        | Valores                            | Notas                                                                                                                                    |
| ------------ | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `kind`       | `privacy`, `terms`, `cancellation` | Uno de cada.                                                                                                                             |
| `title`      | texto                              | Hasta 37 caracteres.                                                                                                                     |
| `summary`    | texto                              | Hasta 160 caracteres.                                                                                                                    |
| `status`     | `draft` o `reviewed`               | **Todo texto nace en `draft`.** Solo el humano o su asesor lo pasa a `reviewed`. En publicación, un `draft` hace fallar la construcción. |
| `reviewedOn` | fecha `AAAA-MM-DD`                 | Obligatoria si `status` es `reviewed`.                                                                                                   |

<!-- ejemplo:legal -->

```md
---
kind: privacy
title: Política de datos
summary: Cómo se recogen, usan y protegen los datos personales de quien nos escribe.
status: draft
---

Texto del borrador en Markdown. Este texto no es asesoría legal y debe revisarlo quien corresponda.
```

## 5. `sitio/operador.json`

Datos de contacto e identificadores oficiales del operador.

| Campo                   | Notas                                                             |
| ----------------------- | ----------------------------------------------------------------- |
| `name`                  | Nombre del operador.                                              |
| `whatsapp`              | `+57` y 10 dígitos, **sin espacios ni guiones**: `+573127951683`. |
| `hours`                 | Horario de atención, como se lee en la página.                    |
| `email`                 | Correo de contacto.                                               |
| `identifiers.rnt`       | Registro Nacional de Turismo. `{ "value": "..." }`.               |
| `identifiers.nit`       | NIT. `{ "value": "..." }`.                                        |
| `identifiers.legalName` | Razón social. `{ "value": "..." }`.                               |
| `identifiers.others`    | Lista opcional de `{ "label": "...", "value": "..." }`.           |

**Los identificadores no se inventan.** Si el operador no los ha entregado, la clave `identifiers.rnt` (o `nit`, o `legalName`) **se omite**: la vista previa se genera sin mostrarlos y la publicación falla nombrando cuál falta (CA-119). Un valor de relleno ("000", "123456", "XXXX", "ejemplo", "pendiente", "NIT 000.000.000-0") o marcado `"fictitious": true` también hace fallar la publicación (CA-120).

Datos de contacto ya acordados: WhatsApp +57 312 795 1683, correo danielfajardog1902@gmail.com, atención de lunes a viernes de 10 a. m. a 10 p. m.

<!-- ejemplo:operador -->

```json
{
  "name": "Nombre del operador",
  "whatsapp": "+573127951683",
  "hours": "Lunes a viernes, de 10 a. m. a 10 p. m.",
  "email": "danielfajardog1902@gmail.com"
}
```

Cuando el operador entregue los identificadores, se añaden así (los valores son los que él entregue, tal cual):

```json
"identifiers": {
  "rnt": { "value": "<el RNT entregado>" },
  "nit": { "value": "<el NIT entregado>" },
  "legalName": { "value": "<la razón social entregada>" }
}
```

## Errores más probables

Cada mensaje trae el archivo, el campo, la regla y el criterio.

| Mensaje (resumen)                                                              | Qué hacer                                                             |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| `CA-20 altitude.meters debe ser mayor que cero`                                | Escribe la altitud en metros como número.                             |
| `CA-122 fuera del rango declarado` / `orden estrictamente ascendente`          | Revisa `territorio.json` o la altitud del destino.                    |
| `CA-104 no se publica: su altitud no tiene la marca de verificada`             | Comprueba la cifra, cita la fuente y pon `verified: true`.            |
| `CA-15 Hay 2 destinos principales en el piso ...`                              | Deja `featured: true` en uno solo por piso.                           |
| `CA-31 no es un slug válido`                                                   | Renombra el archivo en kebab-case, sin tildes.                        |
| `CA-33 repite ...` / `admite hasta 37 caracteres`                              | Cambia el nombre o la descripción; respeta los límites.               |
| `CA-43 La foto mide ... px`                                                    | Usa un archivo con el lado mayor de 1200 px o más.                    |
| `CA-46 la foto necesita autor / enlace a su fuente / modification`             | Completa la atribución de la foto.                                    |
| `CA-47 ... nunca NC ni ND`                                                     | Cambia de foto: esa licencia no se acepta.                            |
| `CA-48 el texto alternativo menciona al autor`                                 | Reescribe `alt` describiendo solo lo que se ve.                       |
| `CA-77 el trazado necesita al menos dos puntos` / `elevación en 3 de 5 puntos` | Completa el trazado; elevación en todos los puntos o en ninguno.      |
| `CA-78 apunta a "x", que no existe en destinos`                                | Usa el slug exacto de un destino.                                     |
| `CA-100 No queda ningún destino publicable`                                    | Verifica el territorio y al menos una altitud.                        |
| `CA-118 sigue como borrador`                                                   | Solo bloquea la publicación; lo resuelve la revisión legal.           |
| `CA-119 Falta el identificador ...`                                            | Solo bloquea la publicación; lo entrega el operador.                  |
| `CA-120 ... es de relleno`                                                     | Quita el valor de relleno o pide el real.                             |
| `Falta SITE_URL: define la dirección pública del sitio antes de publicar`      | Define la variable de entorno `SITE_URL` al ejecutar `build:release`. |
