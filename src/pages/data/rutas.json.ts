/**
 * Trazados de las rutas para el mapa, como archivo estático (CA-79): la isla del mapa lo pide solo
 * cuando la sección se acerca a la ventana. Lleva lo mínimo: id, nombre, piso y puntos
 * [longitud, latitud] con cinco decimales. El color de cada línea sale del piso, por CSS.
 */
import type { APIRoute } from 'astro';
import { loadSite } from '../../lib/content/load';
import { ATTRIBUTION_HREF, ATTRIBUTION_TEXT } from '../../lib/routes/map-config';
import { orderRoutes } from '../../lib/routes/style';

export const GET: APIRoute = async () => {
  const site = await loadSite();
  const routes = orderRoutes(site.rutas).map((r) => ({
    id: r.id,
    name: r.properties.name,
    zone: r.zone,
    coordinates: r.geometry.coordinates.map(([lon, lat]) => [
      Math.round(lon * 1e5) / 1e5,
      Math.round(lat * 1e5) / 1e5,
    ]),
  }));
  const attribution = { text: ATTRIBUTION_TEXT, href: ATTRIBUTION_HREF };
  return new Response(JSON.stringify({ attribution, routes }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
