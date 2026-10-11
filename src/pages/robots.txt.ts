/** `robots.txt` según `indexable` (CA-133, ADR 0012). */
import type { APIRoute } from 'astro';
import { loadSite } from '../lib/content/load';
import { buildRobotsTxt } from '../lib/seo/meta';

export const GET: APIRoute = async ({ site: base }) => {
  const site = await loadSite();
  const sitemapUrl = new URL('/sitemap.xml', base).href;
  return new Response(buildRobotsTxt(site.indexable, sitemapUrl), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
