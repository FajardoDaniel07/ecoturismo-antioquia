# ADR 0006 — Leaflet y teselas de OpenStreetMap

Estado: Aceptado (2026-10-10, aprobado por el humano) · Fecha: 2026-10-10 · Feature: 001-landing-completa

## Contexto
El ADR 0001 eligió Leaflet con teselas de OpenStreetMap, pero la librería no está instalada y
`CLAUDE.md` pide un ADR por cada dependencia. `design.md` S9 fija el comportamiento del mapa:
teselas desaturadas, rutas con patrón y halo, teclado completo, un dedo desplaza la página y dos
mueven el mapa, y un estado para cuando el mapa no carga.

## Decisión
**Dependencias nuevas**

| Paquete | Versión | Tipo | Licencia | Peso |
|---|---|---|---|---|
| `leaflet` | 1.9.4 | ejecución | BSD-2-Clause | 42.3 KB gzip de JS y 3.5 KB gzip de CSS (medido el 2026-10-10) |
| `@types/leaflet` | 1.9.22 | desarrollo | MIT | No llega al navegador |

La 1.9.4 es la última estable; la 2.0 sigue en alfa. Leaflet se carga de forma diferida (ADR 0004)
y solo en la página de inicio. No se añade ningún complemento.

**Cómo se usa**

- Sin las imágenes de marcador por defecto: los marcadores son `L.divIcon` con HTML propio.
- El aspecto de las rutas está en CSS, por clases, con los tokens del sitio. El JavaScript no
  contiene colores.
- El filtro y la opacidad de las teselas se aplican por CSS al panel de teselas, con los tokens
  `--map-tiles-filter` y `--map-tiles-opacity`.
- Se desactivan el control de zoom y la atribución de fábrica y se sustituyen por controles propios,
  para cumplir el orden de tabulación, los tamaños de 44 px y los textos en español.
- En punteros táctiles el mapa se crea con `dragging: false` y `touchZoom: true`: Leaflet deja
  `touch-action: pan-x pan-y`, de modo que un dedo desplaza la página y dos dedos mueven y amplían.
- `scrollWheelZoom` se activa solo después de un clic en el mapa.

**Política de uso de teselas de OpenStreetMap** (operations.osmfoundation.org/policies/tiles,
consultada el 2026-10-10)

- Se usa la URL exacta `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, guardada en una constante.
- La atribución "© colaboradores de OpenStreetMap", con enlace, está siempre visible dentro del mapa.
- El sitio no define una `Referrer-Policy` que suprima la cabecera `Referer`.
- Solo se piden las teselas de la vista: zoom limitado de 8 a 16, límites ceñidos a Antioquia,
  `detectRetina` en falso, sin precarga.
- **Las pruebas automáticas no piden teselas reales**: Playwright intercepta el dominio y sirve una
  tesela local. La política prohíbe los navegadores automatizados que fuerzan el render.

## Alternativas consideradas
- **MapLibre GL JS con teselas vectoriales.** Mejor control del estilo, pero unas cinco veces el peso
  de Leaflet y exige un proveedor de teselas vectoriales con clave.
- **Mapa estático (imagen) con las rutas dibujadas en SVG.** Sin dependencia y sin terceros, pero no
  cumple CA-70 (encuadrar la ruta) ni CA-71 (mover y ampliar).
- **Complemento `leaflet-gesture-handling`.** Resuelve el gesto de dos dedos, pero su última versión
  es de 2022 y Leaflet ya lo resuelve con sus propias opciones.
- **Proveedor de teselas comercial (Stadia, MapTiler, Thunderforest).** Con acuerdo de servicio,
  pero pide clave y cuenta. Se deja como salida si OpenStreetMap limita el uso.
- **Leaflet 2.0 alfa.** Módulos ES y menos peso, pero sin versión estable.

## Consecuencias
- (+) Sin clave de API ni costo; una sola dependencia de ejecución en todo el sitio.
- (+) Cambiar de proveedor de teselas es cambiar una constante y la atribución.
- (−) El servicio de teselas no tiene garantía y puede bloquear sin aviso, en particular a sitios
  comerciales. El estado "el mapa no está disponible" (S9.6) y la lista de rutas siempre visible
  cubren ese caso. Con tráfico alto habrá que pasar a un proveedor dedicado.
- (−) Al cargar el mapa, el navegador del visitante se conecta a OpenStreetMap, que recibe su
  dirección IP. La política de tratamiento de datos debe mencionarlo.
- (−) El contraste de las rutas sobre las teselas (CA-73) solo se puede medir con el mapa construido;
  puede cambiar los dos tokens de teselas.
- (−) 42 KB es el mayor bloque de JavaScript del sitio; por eso no se descarga hasta que la sección
  está cerca de la ventana.
