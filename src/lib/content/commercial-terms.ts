/**
 * Búsqueda de promesas comerciales (R5, CA-137). El sitio es un ejercicio académico: no promete
 * reservas, cupos, precios ni tarifas. Compara sin tildes y por palabra completa; "COP" solo en
 * mayúsculas. La función es pura; `validateSite()` la usa para emitir avisos.
 */

export interface CommercialTerm {
  id: string;
  pattern: RegExp;
  /** Si es verdadero, se aplica al texto original; si no, al texto en minúsculas y sin tildes. */
  exact?: boolean;
}

export const COMMERCIAL_TERMS: readonly CommercialTerm[] = [
  { id: 'reserva', pattern: /\breserv\w*/g },
  { id: 'cupo', pattern: /\bcupos?\b/g },
  { id: 'precio', pattern: /\bprecios?\b/g },
  { id: 'tarifa', pattern: /\btarifas?\b/g },
  { id: 'cop', pattern: /\bCOP\b/g, exact: true },
  { id: 'guia-incluido', pattern: /\bguias? incluid[oa]s?\b/g },
];

export interface CommercialMatch {
  term: string;
  /** El texto encontrado, tal como aparece. */
  text: string;
  index: number;
  /** Unos 30 caracteres a cada lado, para revisar el uso. */
  context: string;
}

const CONTEXT = 30;

/** Misma longitud que el original: cada carácter pierde su tilde pero conserva su posición. */
function fold(text: string): string {
  return Array.from(text.toLowerCase(), (c) => c.normalize('NFD')[0] ?? c).join('');
}

export function findCommercialTerms(text: string): CommercialMatch[] {
  const folded = fold(text);
  const matches: CommercialMatch[] = [];
  for (const { id, pattern, exact } of COMMERCIAL_TERMS) {
    const source = exact ? text : folded;
    for (const m of source.matchAll(new RegExp(pattern.source, pattern.flags))) {
      const index = m.index ?? 0;
      matches.push({
        term: id,
        text: text.slice(index, index + m[0].length),
        index,
        context: text.slice(Math.max(0, index - CONTEXT), index + m[0].length + CONTEXT),
      });
    }
  }
  return matches.sort((a, b) => a.index - b.index);
}
