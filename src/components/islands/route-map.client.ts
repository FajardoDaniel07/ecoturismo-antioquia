/**
 * Mapa de rutas (ADR 0006, mapa simple): módulo diferido de la isla `RouteMap`. Leaflet con sus
 * controles por defecto, teselas de OpenStreetMap con su atribución visible y las rutas como líneas
 * del color de su piso (por clase CSS; aquí no hay colores). Al activar una línea, un popup estándar
 * con el nombre de la ruta y un enlace a su entrada en la lista. Si algo falla, la caja se marca
 * `data-failed` y deja de mostrarse: queda la lista completa.
 */
import L from 'leaflet';
import leafletCss from 'leaflet/dist/leaflet.css?url';
import {
  ATTRIBUTION_HREF,
  ATTRIBUTION_TEXT,
  DETECT_RETINA,
  FIT_PADDING,
  MAX_BOUNDS,
  MAX_ZOOM,
  MIN_ZOOM,
  TILE_URL,
} from '../../lib/routes/map-config';

interface RouteData {
  id: string;
  name: string;
  zone: 'warm' | 'temperate' | 'cold' | 'paramo';
  coordinates: [number, number][];
}

const LINE_WEIGHT = 5;
/** Sin ninguna tesela tras este tiempo, el mapa se considera caído. */
const TILES_TIMEOUT_MS = 10_000;

/**
 * El CSS de Leaflet se añade desde aquí, no con un `import` de CSS: así tampoco entra en la carga
 * inicial de la página (ADR 0004, punto 4). Espera a que cargue para que el mapa mida bien.
 */
function loadLeafletCss(): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = leafletCss;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error('No cargó el CSS de Leaflet'));
    document.head.append(link);
  });
}

export async function initRouteMap(box: HTMLElement): Promise<void> {
  try {
    await loadLeafletCss();
    const response = await fetch(box.dataset.url ?? '');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const { routes } = (await response.json()) as { routes: RouteData[] };
    if (routes.length === 0) throw new Error('Sin rutas');

    // En pantallas táctiles un dedo desplaza la página (opción de Leaflet) y dos mueven el mapa.
    const touch = L.Browser.mobile || window.matchMedia('(pointer: coarse)').matches;
    const map = L.map(box, {
      attributionControl: false,
      dragging: !touch,
      scrollWheelZoom: false,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      maxBounds: L.latLngBounds(
        L.latLng(MAX_BOUNDS[0][0], MAX_BOUNDS[0][1]),
        L.latLng(MAX_BOUNDS[1][0], MAX_BOUNDS[1][1]),
      ),
    });

    // La rueda solo amplía después de hacer clic en el mapa (si no, atrapa el desplazamiento).
    map.on('click', () => map.scrollWheelZoom.enable());
    map.on('mouseout', () => map.scrollWheelZoom.disable());

    // CA-75: si las teselas son inaccesibles (ninguna llega a cargar), el mapa no se muestra.
    let tilesLoaded = 0;
    const fail = () => {
      if (tilesLoaded > 0 || box.hasAttribute('data-failed')) return;
      box.setAttribute('data-failed', '');
      map.remove();
    };
    const tiles = L.tileLayer(TILE_URL, {
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      detectRetina: DETECT_RETINA,
      keepBuffer: 0,
    });
    tiles.on('tileload', () => {
      tilesLoaded++;
    });
    tiles.on('load', fail); // terminó la carga inicial: si ninguna tesela llegó, falló
    window.setTimeout(fail, TILES_TIMEOUT_MS);
    tiles.addTo(map);

    // Atribución propia, siempre visible, sin la marca de Leaflet.
    L.control
      .attribution({ prefix: false })
      .addAttribution(`<a href="${ATTRIBUTION_HREF}">${ATTRIBUTION_TEXT}</a>`)
      .addTo(map);

    const lines = routes.map((route) => {
      const line = L.polyline(
        route.coordinates.map(([lon, lat]) => L.latLng(lat, lon)),
        { weight: LINE_WEIGHT, className: `route-line route-line--${route.zone}` },
      ).addTo(map);

      const popup = document.createElement('div');
      const title = document.createElement('strong');
      title.textContent = route.name;
      const paragraph = document.createElement('p');
      const link = document.createElement('a');
      link.href = `#ruta-${route.id}`;
      link.textContent = 'Ver en la lista';
      paragraph.append(link);
      popup.append(title, paragraph);
      line.bindPopup(popup);
      return line;
    });

    map.fitBounds(L.featureGroup(lines).getBounds(), { padding: [FIT_PADDING, FIT_PADDING] });
  } catch {
    box.setAttribute('data-failed', '');
  }
}
