/**
 * Registro de terceros con los que el sitio se comunica (R4, CA-135, CA-136). La política de datos
 * debe nombrar a cada uno; no se puede añadir un tercero al código sin declararlo aquí.
 */

export interface ThirdParty {
  id: string;
  /** Nombre con el que la política de datos debe mencionarlo. */
  name: string;
  /** Orígenes (esquema y dominio) a los que puede ir una petición. Vacío: el propio sitio. */
  origins: string[];
  /** Cuándo hay contacto: siempre, al cargarse el mapa o solo al activar un enlace. */
  when: 'always' | 'map' | 'link';
}

export const THIRD_PARTIES: readonly ThirdParty[] = [
  {
    id: 'openstreetmap',
    name: 'OpenStreetMap',
    origins: ['https://tile.openstreetmap.org'],
    when: 'map',
  },
  { id: 'whatsapp', name: 'WhatsApp', origins: ['https://wa.me'], when: 'link' },
  { id: 'vercel', name: 'Vercel', origins: [], when: 'always' },
];

/** `true` si el origen es el del propio sitio o el de un tercero declarado. */
export function isDeclaredOrigin(origin: string, siteOrigin: string): boolean {
  return origin === siteOrigin || THIRD_PARTIES.some((t) => t.origins.includes(origin));
}

function plain(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '');
}

/** Terceros del registro que el texto no nombra (sin distinguir mayúsculas ni tildes). */
export function findMissingThirdParties(body: string): ThirdParty[] {
  const haystack = plain(body);
  return THIRD_PARTIES.filter((t) => !haystack.includes(plain(t.name)));
}
