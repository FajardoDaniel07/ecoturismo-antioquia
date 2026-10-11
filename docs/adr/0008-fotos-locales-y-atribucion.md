# ADR 0008 — Fotos de terceros locales y atribución en el contenido

Estado: Aceptado (2026-10-10, aprobado por el humano) · Fecha: 2026-10-10 · Feature: 001-landing-completa

## Contexto
El proyecto no tiene fotografía propia. Usa fotos de terceros con licencia libre (CC0, dominio
público, CC BY, CC BY-SA) de Wikimedia Commons, Flickr e iNaturalist. Cada foto necesita autor,
licencia con enlace, enlace a la fuente, dato de modificación y texto alternativo; sin ellos no se
publica (CA-46 a CA-48). El sitio recorta a 3:2, 4:5 o 1:1, nunca muestra una foto por encima de su
resolución, y distingue fotos aptas para tamaño grande (lado mayor de 2000 px o más) de las aptas
solo para tamaño menor (1200 px o más). Una página reúne todos los créditos y debe actualizarse sola
(CA-50).

## Decisión
1. **Las fotos son archivos locales del repositorio**, en `src/assets/photos/<id-del-destino>/`.
   `astro:assets` genera las variantes AVIF y WebP.
2. **Se guarda el original o una reducción sin recortar** a 2560 px de lado mayor como máximo, con
   un tope de 1.5 MB por archivo. Nunca se amplía una foto.
3. **El recorte lo hace el build**, según los campos `ratio` y `focus` de la foto. Lo que
   `content-curator` elige es la proporción y el punto de interés, no un archivo recortado.
4. **La atribución vive en el frontmatter del destino**, en la lista `photos`, junto a la referencia
   al archivo: `alt`, `author`, `license` (`kind`, `name`, `url`), `sourceUrl`, `modification`,
   `ratio`, `focus`. Es la única fuente: el pie de cada foto, el pie del visor y la página de
   créditos leen de ahí.
5. **Las dimensiones se leen del archivo**, no se escriben a mano. La regla de 1200 y 2000 px se
   aplica al archivo guardado.
6. **"Recortada" se deriva**: aparece si el contenido declara `cropped` o si la proporción pedida
   difiere de la del archivo. `modified` produce "Modificada".
7. El orden de `photos` es el orden editorial: decide la foto principal y el orden en la galería.

## Alternativas consideradas
- **Imágenes remotas (URL de Commons o Flickr) con `astro:assets`.** El build dependería de que el
  tercero responda; el archivo podría cambiar o desaparecer después de verificada la licencia; habría
  que autorizar dominios remotos.
- **Colección aparte para las fotos.** Separa la foto de su destino, obliga a mantener referencias
  y no aporta nada: toda foto pertenece a un destino.
- **Atribución en un archivo junto a cada imagen.** Dobla el número de archivos y dispersa datos que
  `content-curator` edita con el destino.
- **Guardar el archivo ya recortado.** Pierde el original, impide cambiar de proporción sin volver a
  la fuente y hace que "recortada" dependa de la memoria de quien edita.
- **Git LFS.** Innecesario con el volumen previsto (unas 25 fotos, menos de 40 MB) y añade un
  requisito a quien clona y al alojamiento.

## Consecuencias
- (+) El build es reproducible y sin red. La foto publicada es la que se verificó.
- (+) Añadir o quitar una foto actualiza a la vez el destino, la galería y la página de créditos.
- (+) El archivo conserva el encuadre original: cambiar una proporción es editar un campo.
- (−) El repositorio crece con cada foto; el tope por archivo lo contiene.
- (−) La primera compilación genera muchas variantes de imagen y es lenta; las siguientes usan la
  caché de Astro.
- (−) La reducción a 2560 px es una modificación menor que no se declara en el crédito, igual que
  las variantes que genera el build. El crédito declara solo el recorte y otras modificaciones.
  Este documento no es asesoría legal.
- (−) Que la licencia declarada sea la real no se puede comprobar en el build: lo verifica
  `content-curator` en la fuente, y el enlace a la fuente queda en el crédito.
