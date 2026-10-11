/**
 * Puerta de publicación (ADR 0003). `validateSite()` es una función pura: recibe el contenido ya
 * validado por los esquemas y valida lo que cruza archivos o depende del modo. Devuelve el modelo
 * publicado (o `null` si algo detiene la construcción) y la lista completa de problemas, cada uno
 * con archivo, campo, regla y criterio (CA-99).
 *
 * Severidades:
 * - `error`: detiene siempre.
 * - `release`: detiene solo la compilación de publicación.
 * - `warning`: informa.
 */
import { zoneOf, type ZoneId } from '../altitude/zones';
import { compareByAltitude, resolveFeatured } from '../altitude/sort';
import { isPlaceholder } from './placeholders';
import type { DestinoData, LegalData, Operator, PhotoData, RutaData, Territory } from './schemas';

export type BuildMode = 'release' | 'preview';
export type Severity = 'error' | 'release' | 'warning';

export interface Issue {
  severity: Severity;
  file: string;
  field: string;
  rule: string;
  criterion: string;
  message: string;
}

/** Una entrada de colección tal como la entrega el cargador de Astro. */
export interface RawEntry<T> {
  id: string;
  /** Ruta del archivo, relativa al proyecto, para los mensajes. */
  file: string;
  data: T;
  /** Cuerpo Markdown (destinos y textos legales). */
  body?: string;
}

export interface RawSite {
  destinos: RawEntry<DestinoData>[];
  rutas: RawEntry<RutaData>[];
  legal: RawEntry<LegalData>[];
  operador: RawEntry<Operator>[];
  territorio: RawEntry<Territory>[];
}

// ---------------------------------------------------------------------------
// Modelo publicado
// ---------------------------------------------------------------------------

export interface Photo extends PhotoData {
  destinoId: string;
  destinoName: string;
  zone: ZoneId;
  /** Dimensiones tras el recorte a `ratio`. */
  width: number;
  height: number;
  /** `large`: lado mayor del archivo de 2000 px o más; `small`: de 1200 px o más (CA-42, CA-43). */
  tier: 'large' | 'small';
  isCropped: boolean;
}

export interface Destino extends Omit<DestinoData, 'photos'> {
  id: string;
  href: string;
  zone: ZoneId;
  /** Principal de su piso, ya resuelto (CA-15). */
  isFeatured: boolean;
  photos: Photo[];
  body: string;
}

export interface Ruta extends RutaData {
  id: string;
  destino: Destino;
  zone: ZoneId;
  hasPointElevation: boolean;
}

export type LegalKind = LegalData['kind'];

export interface LegalDoc extends LegalData {
  id: string;
  slug: string;
  body: string;
}

export interface PublishedIdentifier {
  label: string;
  value: string;
}

/** Solo contiene identificadores entregados y que no son de relleno (CA-119, CA-120). */
export interface PublishedOperator {
  name: string;
  whatsapp: string;
  hours: string;
  email: string;
  identifiers: PublishedIdentifier[];
}

export interface SiteModel {
  mode: BuildMode;
  territory: Territory;
  operator: PublishedOperator;
  destinos: Destino[];
  rutas: Ruta[];
  photos: Photo[];
  legal: LegalDoc[];
  sections: { galeria: boolean; mapa: boolean };
}

export interface ValidationResult {
  site: SiteModel | null;
  issues: Issue[];
}

// ---------------------------------------------------------------------------
// Constantes de las reglas
// ---------------------------------------------------------------------------

/** Identificadores que el operador debe entregar para publicar (PA-8, ADR 0003 punto 10). */
export const REQUIRED_IDENTIFIERS = [
  { key: 'rnt', label: 'Registro Nacional de Turismo (RNT)' },
  { key: 'nit', label: 'NIT' },
  { key: 'legalName', label: 'razón social' },
] as const;

export const LEGAL_SLUGS: Record<LegalKind, string> = {
  privacy: 'politica-de-datos',
  terms: 'terminos-y-condiciones',
  cancellation: 'politica-de-cancelacion',
};

const LEGAL_ORDER: readonly LegalKind[] = ['privacy', 'terms', 'cancellation'];
const MIN_PHOTO_SIDE = 1200;
const LARGE_PHOTO_SIDE = 2000;
const MAX_ROUTE_POINTS = 400;
const MAX_ROUTES_PER_ZONE = 3;
/** Caja aproximada de Antioquia: detecta coordenadas invertidas o mal copiadas. */
const ANTIOQUIA_BOX = { minLon: -77.6, maxLon: -73.4, minLat: 5.0, maxLat: 9.4 };
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const collator = new Intl.Collator('es');

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

function normalize(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/\s+/g, ' ').trim();
}

function ratioValue(ratio: PhotoData['ratio']): number {
  const [w, h] = ratio.split(':').map(Number);
  return (w ?? 1) / (h ?? 1);
}

function croppedSize(
  width: number,
  height: number,
  ratio: PhotoData['ratio'],
): { width: number; height: number; changed: boolean } {
  const target = ratioValue(ratio);
  const actual = width / height;
  if (Math.abs(actual - target) < 0.005) return { width, height, changed: false };
  return actual > target
    ? { width: Math.round(height * target), height, changed: true }
    : { width, height: Math.round(width / target), changed: true };
}

/** `true` si el problema detiene la construcción en ese modo. */
export function isFatal(issue: Issue, mode: BuildMode): boolean {
  return issue.severity === 'error' || (mode === 'release' && issue.severity === 'release');
}

export const SITE_URL_MISSING =
  'Falta SITE_URL: define la dirección pública del sitio antes de publicar';

/** CA-97: la dirección pública solo es obligatoria al publicar. */
export function siteUrlIssues(mode: BuildMode, siteUrl: string | undefined): Issue[] {
  if (mode !== 'release' || (siteUrl ?? '').trim() !== '') return [];
  return [
    {
      severity: 'release',
      file: '(entorno)',
      field: 'SITE_URL',
      rule: 'La compilación de publicación necesita la dirección pública del sitio',
      criterion: 'CA-97',
      message: SITE_URL_MISSING,
    },
  ];
}

/** Texto de varios problemas, uno por línea, para el error de build (CA-99). */
export function formatIssues(issues: Issue[]): string {
  return issues
    .map(
      (i) =>
        `  [${i.severity}] ${i.criterion} · ${i.file} · ${i.field}\n    regla: ${i.rule}\n    ${i.message}`,
    )
    .join('\n');
}

// ---------------------------------------------------------------------------
// validateSite
// ---------------------------------------------------------------------------

export function validateSite(raw: RawSite, mode: BuildMode): ValidationResult {
  const issues: Issue[] = [];
  const add = (
    severity: Severity,
    file: string,
    field: string,
    criterion: string,
    rule: string,
    message: string,
  ) => {
    issues.push({ severity, file, field, rule, criterion, message });
  };
  const blocked = () => issues.some((i) => isFatal(i, mode));
  const result = (site: SiteModel | null): ValidationResult => ({
    site: blocked() ? null : site,
    issues,
  });

  // --- Archivos únicos: territorio y operador ---
  const territorioEntry = raw.territorio[0];
  if (raw.territorio.length !== 1 || !territorioEntry) {
    add(
      'error',
      'sitio/territorio.json',
      '(archivo)',
      'CA-122',
      'Debe existir exactamente un territorio.json',
      `Hay ${raw.territorio.length} archivos de territorio; crea o deja solo sitio/territorio.json.`,
    );
  }
  const operadorEntry = raw.operador[0];
  if (raw.operador.length !== 1 || !operadorEntry) {
    add(
      'error',
      'sitio/operador.json',
      '(archivo)',
      'CA-119',
      'Debe existir exactamente un operador.json',
      `Hay ${raw.operador.length} archivos de operador; crea o deja solo sitio/operador.json.`,
    );
  }
  if (!territorioEntry || !operadorEntry) return result(null);

  const territory = territorioEntry.data;
  const territoryFile = territorioEntry.file;

  // --- Territorio: verificación (CA-104) ---
  let territoryTrusted = true;
  if (!territory.verified) {
    territoryTrusted = false;
    add(
      'release',
      territoryFile,
      'verified',
      'CA-104',
      'El rango y los umbrales de altitud deben llevar la marca de verificado',
      'El territorio no está verificado: ningún destino es publicable hasta que verified sea true.',
    );
  } else if (!territory.source) {
    add(
      'release',
      territoryFile,
      'source',
      'CA-104',
      'Un territorio verificado debe citar su fuente',
      'verified es true pero falta source.',
    );
  }

  // --- Destinos ---
  const seenNames = new Map<string, string>();
  const seenSummaries = new Map<string, string>();
  const candidates: { entry: RawEntry<DestinoData>; zone: ZoneId }[] = [];

  for (const entry of raw.destinos) {
    const { data, id, file } = entry;
    let excluded = false;

    if (!KEBAB.test(id)) {
      add(
        'error',
        file,
        '(nombre de archivo)',
        'CA-31',
        'El nombre del archivo es el slug y debe ir en kebab-case, sin tildes ni mayúsculas',
        `"${id}" no es un slug válido (ejemplo: "valle-de-cocora").`,
      );
    }

    for (const [map, key, field, label] of [
      [seenNames, normalize(data.name), 'name', 'nombre'],
      [seenSummaries, normalize(data.summary), 'summary', 'descripción'],
    ] as const) {
      const first = map.get(key);
      if (first) {
        add(
          'error',
          file,
          field,
          'CA-33',
          'Cada destino necesita título y descripción únicos',
          `La ${label} de "${id}" repite la de "${first}".`,
        );
      } else {
        map.set(key, id);
      }
    }

    const meters = data.altitude.meters;
    if (meters < territory.minM || meters > territory.maxM) {
      excluded = true;
      add(
        'error',
        file,
        'altitude.meters',
        'CA-122',
        'La altitud del destino debe estar dentro del rango declarado en territorio.json',
        `"${data.name}" (${meters} m) está fuera del rango declarado de ${territory.minM} a ${territory.maxM} m.`,
      );
    }

    if (!territoryTrusted) {
      excluded = true;
    } else if (!data.altitude.verified) {
      excluded = true;
      add(
        'release',
        file,
        'altitude.verified',
        'CA-104',
        'Un destino solo se publica con la altitud verificada',
        `"${data.name}" no se publica: su altitud no tiene la marca de verificada.`,
      );
    } else if (!data.altitude.source) {
      add(
        'release',
        file,
        'altitude.source',
        'CA-104',
        'Una altitud verificada debe citar su fuente',
        `"${data.name}": altitude.verified es true pero falta altitude.source.`,
      );
    }

    data.photos.forEach((photo, index) => {
      const at = `photos[${index}]`;
      const longest = Math.max(photo.file.width, photo.file.height);
      if (longest < MIN_PHOTO_SIDE) {
        add(
          'error',
          file,
          `${at}.file`,
          'CA-43',
          `El lado mayor de la foto debe medir al menos ${MIN_PHOTO_SIDE} px`,
          `La foto ${index + 1} de "${data.name}" mide ${photo.file.width} × ${photo.file.height} px.`,
        );
      }
      const alt = normalize(photo.alt);
      const author = normalize(photo.author);
      if (author.length >= 3 && alt.includes(author)) {
        add(
          'error',
          file,
          `${at}.alt`,
          'CA-48',
          'El texto alternativo no contiene el nombre del autor',
          `El alt de la foto ${index + 1} de "${data.name}" menciona al autor "${photo.author}".`,
        );
      }
      const licenseName = normalize(photo.license.name);
      if (licenseName.length >= 2 && alt.includes(licenseName)) {
        add(
          'error',
          file,
          `${at}.alt`,
          'CA-48',
          'El texto alternativo no contiene el nombre de la licencia',
          `El alt de la foto ${index + 1} de "${data.name}" menciona la licencia "${photo.license.name}".`,
        );
      }
      if (/(^|[^a-z])(nc|nd)([^a-z]|$)/i.test(photo.license.name)) {
        add(
          'error',
          file,
          `${at}.license.name`,
          'CA-47',
          'No se aceptan licencias con NC (no comercial) ni ND (sin derivadas)',
          `La licencia "${photo.license.name}" de la foto ${index + 1} de "${data.name}" no es aceptable.`,
        );
      }
    });

    if (!excluded) candidates.push({ entry, zone: zoneOf(meters, territory.thresholds) });
  }

  candidates.sort((a, b) => compareByAltitude(a.entry.data, b.entry.data));

  // Destino principal por piso (CA-15)
  const featuredIds = new Set<string>();
  const byZone = new Map<ZoneId, typeof candidates>();
  for (const c of candidates) byZone.set(c.zone, [...(byZone.get(c.zone) ?? []), c]);
  for (const [zone, list] of byZone) {
    const { featuredIndex, issue } = resolveFeatured(list.map((c) => c.entry.data));
    const chosen = list[featuredIndex];
    if (chosen) featuredIds.add(chosen.entry.id);
    if (issue === 'two-featured') {
      const marked = list.filter((c) => c.entry.data.featured);
      add(
        'error',
        marked.map((c) => c.entry.file).join(', '),
        'featured',
        'CA-15',
        'Un piso solo puede tener un destino principal',
        `Hay ${marked.length} destinos principales en el piso ${zone}: ${marked.map((c) => c.entry.id).join(', ')}.`,
      );
    } else if (issue === 'none-featured' && chosen) {
      add(
        'warning',
        chosen.entry.file,
        'featured',
        'CA-15',
        'Un piso debería tener un destino principal marcado',
        `Ningún destino del piso ${zone} está marcado como principal; se usa "${chosen.entry.data.name}", el de menor altitud.`,
      );
    }
  }

  const destinos: Destino[] = candidates.map(({ entry, zone }) => {
    const { photos, ...rest } = entry.data;
    return {
      ...rest,
      id: entry.id,
      href: `/destinos/${entry.id}/`,
      zone,
      isFeatured: featuredIds.has(entry.id),
      body: entry.body ?? '',
      photos: photos.map((p): Photo => {
        const size = croppedSize(p.file.width, p.file.height, p.ratio);
        return {
          ...p,
          destinoId: entry.id,
          destinoName: rest.name,
          zone,
          width: size.width,
          height: size.height,
          tier: Math.max(p.file.width, p.file.height) >= LARGE_PHOTO_SIDE ? 'large' : 'small',
          isCropped: p.modification === 'cropped' || size.changed,
        };
      }),
    };
  });

  if (destinos.length === 0) {
    add(
      'error',
      'destinos',
      '(colección)',
      'CA-100',
      'Debe haber al menos un destino publicado',
      'No queda ningún destino publicable; no se genera una página de inicio vacía.',
    );
  }

  // --- Rutas ---
  const destinoById = new Map(destinos.map((d) => [d.id, d]));
  const rawIds = new Set(raw.destinos.map((d) => d.id));
  const rutas: Ruta[] = [];

  for (const entry of raw.rutas) {
    const { data, id, file } = entry;
    const name = data.properties.name;
    const destinoId = data.properties.destino.id;
    const coords = data.geometry.coordinates;

    if (!KEBAB.test(id)) {
      add(
        'error',
        file,
        '(nombre de archivo)',
        'CA-31',
        'El nombre del archivo debe ir en kebab-case',
        `"${id}" no es un identificador válido.`,
      );
    }

    const withEle = coords.filter((c) => c.length === 3).length;
    if (withEle !== 0 && withEle !== coords.length) {
      add(
        'error',
        file,
        'geometry.coordinates',
        'CA-77',
        'La elevación por punto debe estar en todos los puntos o en ninguno',
        `La ruta "${name}" tiene elevación en ${withEle} de ${coords.length} puntos.`,
      );
    }
    if (
      coords.some(
        ([lon, lat]) =>
          lon < ANTIOQUIA_BOX.minLon ||
          lon > ANTIOQUIA_BOX.maxLon ||
          lat < ANTIOQUIA_BOX.minLat ||
          lat > ANTIOQUIA_BOX.maxLat,
      )
    ) {
      add(
        'warning',
        file,
        'geometry.coordinates',
        'CA-77',
        'Los puntos deberían caer en Antioquia (GeoJSON va en orden longitud, latitud)',
        `Algún punto de "${name}" queda fuera de Antioquia: revisa que no estén invertidos.`,
      );
    }
    if (coords.length > MAX_ROUTE_POINTS) {
      add(
        'warning',
        file,
        'geometry.coordinates',
        'CA-76',
        `El trazado debería tener ${MAX_ROUTE_POINTS} puntos como máximo`,
        `"${name}" tiene ${coords.length} puntos; simplifícalo para no inflar la página.`,
      );
    }

    if (!rawIds.has(destinoId)) {
      add(
        'error',
        file,
        'properties.destino',
        'CA-78',
        'La ruta debe pertenecer a un destino existente',
        `La ruta "${name}" apunta a "${destinoId}", que no existe en destinos.`,
      );
      continue;
    }
    const destino = destinoById.get(destinoId);
    if (!destino) {
      add(
        'warning',
        file,
        'properties.destino',
        'CA-78',
        'La ruta de un destino no publicado tampoco se publica',
        `La ruta "${name}" no se publica porque su destino "${destinoId}" no se publica.`,
      );
      continue;
    }
    rutas.push({
      ...data,
      id,
      destino,
      zone: destino.zone,
      hasPointElevation: coords.length > 0 && withEle === coords.length,
    });
  }

  rutas.sort(
    (a, b) =>
      a.properties.elevation.minM - b.properties.elevation.minM ||
      collator.compare(a.properties.name, b.properties.name),
  );
  const routesPerZone = new Map<ZoneId, number>();
  for (const r of rutas) routesPerZone.set(r.zone, (routesPerZone.get(r.zone) ?? 0) + 1);
  for (const [zone, count] of routesPerZone) {
    if (count > MAX_ROUTES_PER_ZONE) {
      add(
        'warning',
        'rutas',
        '(colección)',
        'CA-68',
        `Un piso admite hasta ${MAX_ROUTES_PER_ZONE} rutas con trazos distinguibles`,
        `El piso ${zone} tiene ${count} rutas.`,
      );
    }
  }

  // --- Textos legales (CA-118) ---
  const legal: LegalDoc[] = [];
  for (const kind of LEGAL_ORDER) {
    const matches = raw.legal.filter((l) => l.data.kind === kind);
    const first = matches[0];
    if (matches.length !== 1 || !first) {
      add(
        'error',
        'legal',
        'kind',
        'CA-98',
        'Debe haber exactamente un texto legal de cada tipo',
        `Hay ${matches.length} textos de tipo "${kind}"; se necesita uno.`,
      );
      continue;
    }
    if (first.data.status === 'draft') {
      add(
        'release',
        first.file,
        'status',
        'CA-118',
        'Un texto legal en borrador no se publica',
        `"${first.data.title}" sigue como borrador pendiente de revisión.`,
      );
    }
    legal.push({ ...first.data, id: first.id, slug: LEGAL_SLUGS[kind], body: first.body ?? '' });
  }

  // --- Operador: identificadores y datos de contacto (CA-119, CA-120) ---
  const op = operadorEntry.data;
  const opFile = operadorEntry.file;
  const identifiers: PublishedIdentifier[] = [];

  for (const { key, label } of REQUIRED_IDENTIFIERS) {
    const item = op.identifiers[key];
    if (!item) {
      add(
        'release',
        opFile,
        `identifiers.${key}`,
        'CA-119',
        'Todo identificador oficial exigido debe estar entregado',
        `Falta el identificador ${label}.`,
      );
      continue;
    }
    if (item.fictitious || isPlaceholder(item.value)) {
      add(
        'release',
        opFile,
        `identifiers.${key}`,
        'CA-120',
        'Un identificador de relleno o marcado ficticio no se publica',
        `El identificador ${label} ("${item.value}") es de relleno o está marcado como ficticio.`,
      );
      continue;
    }
    identifiers.push({ label, value: item.value });
  }
  op.identifiers.others.forEach((item, index) => {
    if (item.fictitious || isPlaceholder(item.value)) {
      add(
        'release',
        opFile,
        `identifiers.others[${index}]`,
        'CA-120',
        'Un identificador de relleno o marcado ficticio no se publica',
        `El identificador "${item.label}" ("${item.value}") es de relleno o está marcado como ficticio.`,
      );
    } else {
      identifiers.push({ label: item.label, value: item.value });
    }
  });
  for (const field of ['name', 'whatsapp', 'hours', 'email'] as const) {
    if (isPlaceholder(op[field])) {
      add(
        'release',
        opFile,
        field,
        'CA-120',
        'Un dato de contacto de relleno no se publica',
        `El dato ${field} ("${op[field]}") parece de relleno.`,
      );
    }
  }

  const photos = destinos.flatMap((d) => d.photos);

  return result({
    mode,
    territory,
    operator: {
      name: op.name,
      whatsapp: op.whatsapp,
      hours: op.hours,
      email: op.email,
      identifiers,
    },
    destinos,
    rutas,
    photos,
    legal,
    sections: { galeria: photos.length > 0, mapa: rutas.length > 0 },
  });
}
