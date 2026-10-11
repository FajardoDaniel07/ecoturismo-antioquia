import type { ZoneId } from '../../lib/altitude/zones';

/** Clases (completas, para que Tailwind las detecte) del color fuerte de cada piso como relleno. */
export const SWATCH: Record<ZoneId, string> = {
  warm: 'bg-zone-warm',
  temperate: 'bg-zone-temperate',
  cold: 'bg-zone-cold',
  paramo: 'bg-zone-paramo',
};
