/**
 * Única puerta de lectura del contenido (ADR 0003). Es el único módulo de `lib/` que importa
 * `astro:content`: lee las cinco colecciones, delega la validación en `validateSite()`, memoriza
 * el resultado y detiene el build con todos los problemas juntos.
 */
import { getCollection, getEntry, render } from 'astro:content';
import {
  formatIssues,
  isFatal,
  siteUrlIssues,
  validateSite,
  type BuildMode,
  type RawEntry,
  type RawSite,
  type SiteModel,
} from './validate';

let cached: Promise<SiteModel> | undefined;

/** `astro build` (modo "production") publica; `dev` y `build --mode preview` son vista previa. */
function currentMode(): BuildMode {
  return import.meta.env.MODE === 'production' ? 'release' : 'preview';
}

function toRaw<T extends { id: string; data: unknown; body?: string; filePath?: string }>(
  entries: T[],
  folder: string,
): RawEntry<T['data']>[] {
  return entries.map((e) => ({
    id: e.id,
    file: e.filePath ?? `${folder}/${e.id}`,
    data: e.data,
    ...(e.body !== undefined ? { body: e.body } : {}),
  }));
}

async function read(): Promise<SiteModel> {
  const mode = currentMode();
  const [destinos, rutas, legal, operador, territorio] = await Promise.all([
    getCollection('destinos'),
    getCollection('rutas'),
    getCollection('legal'),
    getCollection('operador'),
    getCollection('territorio'),
  ]);

  const raw: RawSite = {
    destinos: toRaw(destinos, 'destinos'),
    rutas: toRaw(rutas, 'rutas'),
    legal: toRaw(legal, 'legal'),
    operador: toRaw(operador, 'sitio'),
    territorio: toRaw(territorio, 'sitio'),
  };

  const { site, issues: found } = validateSite(raw, mode);
  const issues = [...found, ...siteUrlIssues(mode, process.env.SITE_URL)];
  const fatal = issues.filter((i) => isFatal(i, mode));
  const notes = issues.filter((i) => !isFatal(i, mode));

  if (notes.length > 0) {
    console.warn(`[contenido] ${notes.length} aviso(s):\n${formatIssues(notes)}`);
  }
  if (fatal.length > 0 || !site) {
    const label = mode === 'release' ? 'publicación' : 'vista previa';
    throw new Error(
      `No se puede construir el sitio (${label}): ${fatal.length} problema(s) de contenido.\n${formatIssues(fatal)}`,
    );
  }
  return site;
}

/** Devuelve el modelo publicado, o lanza un único error con todos los problemas que detienen. */
export function loadSite(): Promise<SiteModel> {
  cached ??= read();
  return cached;
}

type BodyComponent = Awaited<ReturnType<typeof render>>['Content'];

/**
 * Componente con el cuerpo Markdown renderizado de un destino o un texto legal. Las páginas lo
 * pintan con `<Content />` (o lo pasan por `slot`); solo este módulo importa `astro:content`.
 */
export async function renderBody(
  collection: 'destinos' | 'legal',
  id: string,
): Promise<BodyComponent> {
  const entry = await getEntry(collection, id);
  if (!entry) throw new Error(`No existe la entrada "${id}" en la colección "${collection}".`);
  const { Content } = await render(entry);
  return Content;
}
