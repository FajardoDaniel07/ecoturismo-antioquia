/** Metadatos de documento (CA-33). */

export const SITE_NAME = 'Ecoturismo Antioquia';
export const TITLE_MAX = 60;
export const DESCRIPTION_MAX = 160;

/** "{Página} | Ecoturismo Antioquia"; sin nombre de página, solo el del sitio. */
export function documentTitle(pageName?: string): string {
  return pageName ? `${pageName} | ${SITE_NAME}` : SITE_NAME;
}
