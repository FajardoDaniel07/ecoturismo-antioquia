/**
 * Trazados de las rutas para el mapa, como archivo estático (CA-79): la isla del mapa lo pide solo
 * cuando la sección se acerca a la ventana. Lleva lo mínimo: id, letra clave, nombre, piso, estilo
 * y puntos [longitud, latitud] con cinco decimales.
 */
import type { APIRoute } from 'astro';
import { loadSite } from '../../lib/content/load';
import { styleRoutes } from '../../lib/routes/style';

export const GET: APIRoute = async () => {
  const site = await loadSite();
  const routes = styleRoutes(site.rutas).map((r) => ({
    id: r.id,
    key: r.key,
    name: r.properties.name,
    zone: r.zone,
    style: {
      pattern: r.style.pattern,
      variant: r.style.variant,
      dashArray: r.style.dashArray,
      weight: r.style.weight,
    },
    coordinates: r.geometry.coordinates.map(([lon, lat]) => [
      Math.round(lon * 1e5) / 1e5,
      Math.round(lat * 1e5) / 1e5,
    ]),
  }));
  return new Response(JSON.stringify({ routes }), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
