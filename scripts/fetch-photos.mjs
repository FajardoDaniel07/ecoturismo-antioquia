// Descarga las fotos del manifiesto (specs/001-landing-completa/fotos-manifiesto.md) a
// src/assets/photos/<destino>/ y comprueba que cumplen la política de fotos (ADR 0008, CA-42, CA-43).
//
// Uso:
//   node scripts/fetch-photos.mjs                      descarga todo y escribe el informe
//   node scripts/fetch-photos.mjs --check              solo comprueba lo que ya está guardado
//   node scripts/fetch-photos.mjs --only <archivo>     limita a una foto (repetible); no escribe informe
//   node scripts/fetch-photos.mjs --out <carpeta>      carpeta de destino (por defecto src/assets/photos)
//   node scripts/fetch-photos.mjs --report <ruta>      informe (por defecto specs/.../fotos-descargadas.md)
//   node scripts/fetch-photos.mjs --no-report          no escribe informe
//   node scripts/fetch-photos.mjs --list               solo lista lo que leyó del manifiesto
//
// Política de uso de Wikimedia: una petición a la vez, con agente de usuario identificable, una
// pausa entre peticiones, un solo intento por archivo (más un único respaldo al original si la
// reducción falla) y parada inmediata ante 429 o un error del servidor. Nunca reintenta en bucle.
// El contacto del agente de usuario se puede dar con FETCH_PHOTOS_CONTACT (correo o URL).
//
// Topes (ADR 0008): lado mayor de 2560 px como máximo, 1.5 MB por archivo; mínimo 1200 px (CA-43).
// Nunca se amplía ni se recorta. Si el original excede los topes, se reduce (sin recortar).
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const MANIFEST = path.join(ROOT, 'specs', '001-landing-completa', 'fotos-manifiesto.md');
const DEFAULT_REPORT = path.join(ROOT, 'specs', '001-landing-completa', 'fotos-descargadas.md');
const DEFAULT_OUT = path.join(ROOT, 'src', 'assets', 'photos');

const MAX_SIDE = 2560;
const LARGE_SIDE = 2000;
const MIN_SIDE = 1200;
const MAX_BYTES = 1.5 * 1024 * 1024;
const PAUSE_MS = 2000;
const TIMEOUT_MS = 60_000;

// ---------------------------------------------------------------------------------------------
// Argumentos
// ---------------------------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { check: false, list: false, only: [], out: DEFAULT_OUT, report: DEFAULT_REPORT };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--check') opts.check = true;
    else if (a === '--list') opts.list = true;
    else if (a === '--no-report') opts.report = null;
    else if (a === '--only') opts.only.push(argv[++i]);
    else if (a === '--out') opts.out = path.resolve(argv[++i]);
    else if (a === '--report') opts.report = path.resolve(argv[++i]);
    else fail(`Argumento desconocido: ${a}`);
  }
  // Una descarga parcial no debe pisar el informe del conjunto.
  if (opts.only.length > 0 && opts.report === DEFAULT_REPORT) opts.report = null;
  return opts;
}

function fail(message) {
  console.error(`fetch-photos: ${message}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------------------------
// Lectura del manifiesto
// ---------------------------------------------------------------------------------------------

/**
 * Lee el manifiesto en Markdown. Estructura que espera (una por foto):
 *   ## N. `slug-del-destino`
 *   ### N.M `archivo-destino.jpg`
 *   - **Página:** <url>
 *   - **URL a descargar (...):** <url> [. Original: <url>]
 *   - **Autor:** texto
 *   - **Licencia:** nombre, <url>
 *   - **Dimensiones del original:** 2048 × 1536 ...
 * Si a una foto le falta algún dato, no se adivina: se informa y el guion se detiene.
 */
export function parseManifest(markdown) {
  const entries = [];
  const problems = [];
  let slug = null;
  let current = null;

  const close = () => {
    if (!current) return;
    const missing = [
      'page',
      'url',
      'author',
      'licenseName',
      'licenseUrl',
      'width',
      'height',
    ].filter((k) => current[k] === undefined);
    if (missing.length > 0) {
      problems.push(`${current.file}: faltan datos (${missing.join(', ')})`);
    } else {
      entries.push(current);
    }
    current = null;
  };

  for (const line of markdown.split(/\r?\n/)) {
    const dest = /^## \d+\. `([^`]+)`/.exec(line);
    if (dest) {
      close();
      slug = dest[1];
      continue;
    }
    const photo = /^### \d+\.\d+ `([^`]+)`/.exec(line);
    if (photo) {
      close();
      if (!slug) problems.push(`${photo[1]}: aparece antes de un destino`);
      current = { slug, file: photo[1] };
      continue;
    }
    if (!current) continue;

    let m;
    if ((m = /^- \*\*Página:\*\* <([^>]+)>/.exec(line))) current.page = m[1];
    else if (
      (m = /^- \*\*URL a descargar[^:]*:\*\* <([^>]+)>(?:.*?Original: <([^>]+)>)?/.exec(line))
    ) {
      current.url = m[1];
      if (m[2]) current.originalUrl = m[2];
    } else if ((m = /^- \*\*Autor:\*\* (.+)$/.exec(line))) current.author = m[1].trim();
    else if ((m = /^- \*\*Licencia:\*\* (.+?), <([^>]+)>/.exec(line))) {
      current.licenseName = m[1].trim();
      current.licenseUrl = m[2];
    } else if ((m = /^- \*\*Dimensiones del original:\*\* (\d+) × (\d+)/.exec(line))) {
      current.width = Number(m[1]);
      current.height = Number(m[2]);
    }
  }
  close();

  // Una licencia NC o ND nunca se descarga (CA-47).
  for (const e of entries) {
    if (/(^|[^a-z])(nc|nd)([^a-z]|$)/i.test(e.licenseName)) {
      problems.push(`${e.file}: la licencia "${e.licenseName}" no es aceptable (NC o ND)`);
    }
  }
  return { entries, problems };
}

// ---------------------------------------------------------------------------------------------
// Imágenes
// ---------------------------------------------------------------------------------------------

/** Dimensiones tal como las verá el navegador (con la orientación EXIF aplicada). */
async function inspect(buffer) {
  const meta = await sharp(buffer).metadata();
  const swap = (meta.orientation ?? 1) >= 5;
  const width = swap ? meta.height : meta.width;
  const height = swap ? meta.width : meta.height;
  return { width, height, format: meta.format, orientation: meta.orientation ?? 1 };
}

/** Reduce a MAX_SIDE y/o recomprime hasta MAX_BYTES, sin recortar ni ampliar. */
async function fit(buffer, info) {
  const side = Math.max(info.width, info.height);
  let action = 'original';
  let out = buffer;
  let quality = 90;

  if (side > MAX_SIDE) {
    out = await sharp(buffer)
      .rotate()
      .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    action = `reducida a ${MAX_SIDE} px`;
  }
  // Recomprime (mismas dimensiones) mientras pese más del tope; el bucle es local, sin red.
  for (let tries = 0; out.length > MAX_BYTES && tries < 6; tries++) {
    quality -= 6;
    out = await sharp(out).rotate().jpeg({ quality, mozjpeg: true }).toBuffer();
    action = `${action === 'original' ? 'recomprimida' : `${action}, recomprimida`} (calidad ${quality})`;
  }
  return { buffer: out, action };
}

// ---------------------------------------------------------------------------------------------
// Red
// ---------------------------------------------------------------------------------------------

function userAgent() {
  const contact = process.env.FETCH_PHOTOS_CONTACT;
  return (
    'EcoturismoAntioquia-FetchPhotos/1.0 (proyecto academico; scripts/fetch-photos.mjs' +
    (contact ? `; ${contact}` : '') +
    ')'
  );
}

class HttpError extends Error {
  constructor(status, url) {
    super(`HTTP ${status} en ${url}`);
    this.status = status;
  }
}

async function get(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': userAgent(), Accept: 'image/*' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new HttpError(res.status, url);
  return Buffer.from(await res.arrayBuffer());
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Ancho de la miniatura estándar de Wikimedia que se pide cuando el original es más ancho. */
const THUMB_WIDTH = 3840;

/**
 * URL del archivo original. Si el manifiesto trae una reducción, el original va en `originalUrl`;
 * si no, `url` ya es el original.
 */
export function originalUrlOf(entry) {
  return entry.originalUrl ?? entry.url;
}

/**
 * Wikimedia solo sirve miniaturas en anchos estándar. Deriva la de 3840 px a partir del original
 * (`.../commons/a/ab/Nombre.jpg` -> `.../commons/thumb/a/ab/Nombre.jpg/3840px-Nombre.jpg`). No
 * depende de la URL de reducción que traiga el manifiesto.
 */
export function thumbUrlOf(originalUrl, width = THUMB_WIDTH) {
  const m =
    /^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/([0-9a-f]\/[0-9a-f]{2})\/([^/]+)$/.exec(
      originalUrl,
    );
  return m ? `${m[1]}/thumb/${m[2]}/${m[3]}/${width}px-${m[3]}` : null;
}

/**
 * Qué URL pedir primero: la miniatura de 3840 px si el original es más ancho que eso (se reduce
 * después en local a 2560 px); si no, el original. Un único respaldo: el original.
 */
export function planDownload(entry) {
  const original = originalUrlOf(entry);
  const thumb = entry.width > THUMB_WIDTH ? thumbUrlOf(original) : null;
  return { first: thumb ?? original, fallback: thumb ? original : null };
}

/** Pide la primera URL; si falla (y no es 429 ni 5xx) hace un único intento con el original. */
async function download(entry) {
  const { first, fallback } = planDownload(entry);
  try {
    return { buffer: await get(first), from: first };
  } catch (error) {
    const stop = error instanceof HttpError && (error.status === 429 || error.status >= 500);
    if (stop || !fallback) throw error;
    console.warn(`  ${error.message}; se prueba el original (un solo intento).`);
    await sleep(PAUSE_MS);
    return { buffer: await get(fallback), from: fallback };
  }
}

// ---------------------------------------------------------------------------------------------
// Modos
// ---------------------------------------------------------------------------------------------

const sha = (buffer) => createHash('sha256').update(buffer).digest('hex').slice(0, 12);

async function describe(file, entry) {
  const buffer = readFileSync(file);
  const info = await inspect(buffer);
  const side = Math.max(info.width, info.height);
  const problems = [];
  if (side < MIN_SIDE) problems.push(`lado mayor de ${side} px (mínimo ${MIN_SIDE})`);
  if (side > MAX_SIDE) problems.push(`lado mayor de ${side} px (máximo ${MAX_SIDE})`);
  if (buffer.length > MAX_BYTES) {
    problems.push(`pesa ${(buffer.length / 1024 / 1024).toFixed(2)} MB (máximo 1.5 MB)`);
  }
  return { ...info, bytes: buffer.length, hash: sha(buffer), side, problems, entry };
}

function targetPath(opts, entry) {
  return path.join(opts.out, entry.slug, entry.file);
}

async function check(entries, opts) {
  let bad = 0;
  const rows = [];
  for (const e of entries) {
    const file = targetPath(opts, e);
    if (!existsSync(file)) {
      console.error(`FALTA   ${e.slug}/${e.file}`);
      bad++;
      continue;
    }
    const d = await describe(file, e);
    rows.push(d);
    const note = d.side >= LARGE_SIDE ? 'grande' : 'menor';
    if (d.problems.length > 0) {
      console.error(`ERROR   ${e.slug}/${e.file}: ${d.problems.join('; ')}`);
      bad++;
    } else {
      console.log(
        `OK      ${e.slug}/${e.file}  ${d.width}×${d.height}  ${(d.bytes / 1024).toFixed(0)} KB  ${note}`,
      );
    }
  }
  console.log(`\n${entries.length - bad} de ${entries.length} fotos correctas.`);
  return { bad, rows };
}

function reportMarkdown(results) {
  const lines = [
    '# Fotos descargadas',
    '',
    `Generado por \`scripts/fetch-photos.mjs\` el ${new Date().toISOString().slice(0, 10)}. Fuente: \`fotos-manifiesto.md\`.`,
    '',
    `Topes (ADR 0008): lado mayor de ${MAX_SIDE} px y 1.5 MB por archivo; mínimo ${MIN_SIDE} px (CA-43). "Grande" = ${LARGE_SIDE} px o más (CA-42).`,
    '',
    '| Destino | Archivo | Declaradas | Guardadas | Peso | Tamaño | Acción | Huella (sha256) |',
    '|---|---|---|---|---|---|---|---|',
  ];
  for (const r of results) {
    const e = r.entry;
    lines.push(
      `| ${e.slug} | ${e.file} | ${e.width} × ${e.height} | ${r.width} × ${r.height} | ${(r.bytes / 1024).toFixed(0)} KB | ${r.side >= LARGE_SIDE ? 'grande' : 'menor'} | ${r.action} | \`${r.hash}\` |`,
    );
  }
  const large = results.filter((r) => r.side >= LARGE_SIDE).length;
  lines.push('', `${results.length} fotos; ${large} llegan a ${LARGE_SIDE} px o más.`, '');
  return lines.join('\n');
}

async function fetchAll(entries, opts) {
  console.log(`Agente de usuario: ${userAgent()}`);
  const results = [];
  let first = true;
  for (const e of entries) {
    const file = targetPath(opts, e);
    if (!first) await sleep(PAUSE_MS);
    first = false;
    console.log(`Descargando ${e.slug}/${e.file}`);
    let downloaded;
    try {
      downloaded = await download(e);
    } catch (error) {
      console.error(`  Falló: ${error.message}. Me detengo (un solo intento por archivo).`);
      process.exitCode = 1;
      break;
    }
    const info = await inspect(downloaded.buffer);
    const side = Math.max(info.width, info.height);
    if (e.width && e.height && Math.max(e.width, e.height) < side) {
      console.warn(
        `  Aviso: la descarga es mayor que lo declarado (${info.width}×${info.height}).`,
      );
    }
    if (side < MIN_SIDE) {
      console.error(
        `  Rechazada: ${info.width}×${info.height} px (mínimo ${MIN_SIDE}). No se guarda.`,
      );
      process.exitCode = 1;
      continue;
    }
    const { buffer, action } = await fit(downloaded.buffer, info);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, buffer);
    const d = await describe(file, e);
    results.push({ ...d, action });
    console.log(`  ${d.width}×${d.height}, ${(d.bytes / 1024).toFixed(0)} KB, ${action}`);
  }
  return results;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!existsSync(MANIFEST)) fail(`no encuentro el manifiesto: ${MANIFEST}`);
  const { entries: all, problems } = parseManifest(readFileSync(MANIFEST, 'utf8'));
  if (problems.length > 0) {
    console.error('Problemas en el manifiesto (no se adivina nada):');
    for (const p of problems) console.error(`  - ${p}`);
    process.exit(1);
  }
  const entries = opts.only.length > 0 ? all.filter((e) => opts.only.includes(e.file)) : all;
  for (const name of opts.only) {
    if (!all.some((e) => e.file === name)) fail(`"${name}" no está en el manifiesto`);
  }

  if (opts.list) {
    for (const e of entries) {
      console.log(`${e.slug}/${e.file}  ${e.width}×${e.height}  ${e.licenseName}  ${e.url}`);
    }
    console.log(`\n${entries.length} fotos en el manifiesto.`);
    return;
  }
  if (opts.check) {
    const { bad } = await check(entries, opts);
    if (bad > 0) process.exitCode = 1;
    return;
  }

  const results = await fetchAll(entries, opts);
  if (opts.report && results.length > 0) {
    mkdirSync(path.dirname(opts.report), { recursive: true });
    writeFileSync(opts.report, reportMarkdown(results));
    console.log(`Informe: ${path.relative(ROOT, opts.report)}`);
  }
}

// Solo corre como guion; la lectura del manifiesto se puede importar en pruebas.
const entry = process.argv[1];
if (entry && import.meta.url === new URL(`file:///${entry.replace(/\\/g, '/')}`).href) {
  await main();
}
