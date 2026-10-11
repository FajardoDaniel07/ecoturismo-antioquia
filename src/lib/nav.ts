/** Enlaces de la navegación principal (CA-93, CA-51, CA-67, CA-81). */

export interface NavLink {
  label: string;
  href: string;
}

/** Identificadores de las secciones de la página de inicio. */
export const SECTION_IDS = {
  destinos: 'destinos',
  galeria: 'galeria',
  mapa: 'mapa-de-rutas',
  contacto: 'contacto',
} as const;

/**
 * Destinos, Galería, Mapa de rutas y Contacto, en ese orden y solo si su sección está
 * publicada. Los enlaces son absolutos ("/#…") para que funcionen desde cualquier página.
 */
export function navLinks(sections: { galeria: boolean; mapa: boolean }): NavLink[] {
  const links: (NavLink | null)[] = [
    { label: 'Destinos', href: `/#${SECTION_IDS.destinos}` },
    sections.galeria ? { label: 'Galería', href: `/#${SECTION_IDS.galeria}` } : null,
    sections.mapa ? { label: 'Mapa de rutas', href: `/#${SECTION_IDS.mapa}` } : null,
    { label: 'Contacto', href: `/#${SECTION_IDS.contacto}` },
  ];
  return links.filter((l): l is NavLink => l !== null);
}
