/** Metadatos de documento y archivos de rastreo (CA-33, CA-97, CA-133). */

export const SITE_NAME = 'Ecoturismo Antioquia';
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 160;

/** "{Página} | Ecoturismo Antioquia"; sin nombre de página, solo el del sitio. */
export function documentTitle(pageName?: string): string {
  return pageName ? `${pageName} | ${SITE_NAME}` : SITE_NAME;
}

function escapeXml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/** Mapa del sitio con las direcciones absolutas dadas (CA-97). */
export function buildSitemapXml(urls: readonly string[]): string {
  const items = urls.map((u) => `  <url><loc>${escapeXml(u)}</loc></url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`;
}

/**
 * `robots.txt` (CA-133, ADR 0012). Sitio indexable: permite el rastreo y anuncia el mapa. Sitio no
 * indexable: NO bloquea el rastreo (si lo bloqueara, los buscadores no leerían la instrucción de no
 * indexar de la metaetiqueta y la cabecera), no anuncia mapa y lo explica en un comentario.
 */
export function buildRobotsTxt(indexable: boolean, sitemapUrl: string): string {
  if (indexable) return `User-agent: *\nAllow: /\n\nSitemap: ${sitemapUrl}\n`;
  return [
    '# Este sitio no debe indexarse (ejercicio académico o vista previa).',
    '# Se declara con la metaetiqueta robots y la cabecera X-Robots-Tag, no aquí:',
    '# bloquear el rastreo impediría a los buscadores leer esa instrucción.',
    'User-agent: *',
    'Disallow:',
    '',
  ].join('\n');
}
