/**
 * Mapa del sitio (CA-97, CA-133). Ruta dinámica: si el sitio es indexable devuelve la ruta
 * `sitemap`; si no, ninguna, de modo que el archivo no existe (no existe vacío).
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { loadSite } from '../lib/content/load';
import { buildSitemapXml } from '../lib/seo/meta';

export const getStaticPaths: GetStaticPaths = async () => {
  const site = await loadSite();
  return site.indexable ? [{ params: { sitemap: 'sitemap' } }] : [];
};

export const GET: APIRoute = async ({ site: base }) => {
  const site = await loadSite();
  const root = new URL('/', base);
  const urls = [root.href, ...site.destinos.map((d) => new URL(d.href, root).href)];
  return new Response(buildSitemapXml(urls), {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
