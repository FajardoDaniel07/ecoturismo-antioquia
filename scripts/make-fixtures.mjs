// Genera los escenarios de contenido de las pruebas en tests/fixtures/content/<escenario>/ (T-022).
// Uso: node scripts/make-fixtures.mjs
// Todo el contenido es ficticio (lugares inventados, fotos sintéticas de color plano) y la salida es
// determinista: volver a ejecutarlo deja los mismos archivos. Los escenarios se usan con
// CONTENT_ROOT=tests/fixtures/content/<escenario>.
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.join(process.cwd(), 'tests', 'fixtures', 'content');

const SOURCE = 'Fixture de pruebas (valor ficticio)';
const AUTHOR = 'Generador de fixtures';
const LICENSE = {
  kind: 'cc0',
  name: 'CC0 1.0',
  url: 'https://creativecommons.org/publicdomain/zero/1.0/',
};
const TERRITORY = {
  minM: 100,
  maxM: 3800,
  thresholds: { temperate: 1000, cold: 2000, paramo: 3000 },
  verified: true,
  source: SOURCE,
};

const ZONE_NAMES = { warm: 'cálido', temperate: 'templado', cold: 'frío', paramo: 'páramo' };

const COLORS = {
  warm: [196, 120, 60],
  temperate: [92, 150, 84],
  cold: [70, 120, 130],
  paramo: [150, 150, 170],
};

// ---------------------------------------------------------------------------
// Datos de los escenarios
// ---------------------------------------------------------------------------

/** Foto: [ancho, alto, ratio, focus]. Lado mayor >= 2000 px es "large"; entre 1200 y 1999, "small". */
const L32 = [2400, 1600, '3:2', 'center'];
const S32 = [1600, 1067, '3:2', 'center'];
const LOW = [1200, 800, '3:2', 'center'];
const L45 = [1600, 2000, '4:5', 'top'];
const L11 = [2000, 2000, '1:1', 'center'];

const completo = {
  destinos: [
    {
      slug: 'canon-del-sol-quieto',
      name: 'Cañón del Sol Quieto',
      summary:
        'Un cañón inventado de paredes rojizas y agua tibia, pensado para probar el piso cálido.',
      meters: 250,
      zone: 'warm',
      featured: true,
      climate: { minC: 24, maxC: 34 },
      access: 'Acceso ficticio: veinte minutos a pie desde un estacionamiento inventado.',
      duration: { value: 5, unit: 'hours' },
      distanceKm: 7.5,
      ascentM: 180,
      difficulty: 'moderate',
      minAge: 10,
      photos: [L32, L45, L32, L11],
    },
    {
      slug: 'playon-de-las-garzas-azules',
      name: 'Playón de las Garzas Azules',
      summary:
        'Un playón ficticio junto a un río imaginario; comparte altitud con otro destino y no tiene fotos.',
      meters: 250,
      zone: 'warm',
      climate: { minC: 25, maxC: 35 },
      duration: { value: 2, unit: 'hours' },
      distanceKm: 3,
      difficulty: 'easy',
      photos: [],
    },
    {
      slug: 'salto-cinta-de-plata',
      name: 'Salto Cinta de Plata',
      summary:
        'Una cascada inventada de tres caídas, con dos fotos, para probar la galería de tamaño intermedio.',
      meters: 640,
      zone: 'warm',
      climate: { minC: 22, maxC: 31 },
      distanceKm: 4.2,
      ascentM: 240,
      difficulty: 'moderate',
      photos: [L32, L45],
    },
    {
      slug: 'cafetal-de-la-loma-alta',
      name: 'Cafetal de la Loma Alta',
      summary:
        'Una finca imaginaria de cafetales en ladera; su destino principal solo tiene fotos pequeñas.',
      meters: 1600,
      zone: 'temperate',
      featured: true,
      climate: { minC: 16, maxC: 26 },
      access: 'Acceso ficticio por una vereda inventada.',
      duration: { value: 1, unit: 'days' },
      distanceKm: 9,
      ascentM: 400,
      difficulty: 'moderate',
      minAge: 8,
      photos: [S32, S32, S32],
    },
    {
      slug: 'bosque-de-niebla-serena',
      name: 'Bosque de Niebla Serena',
      summary:
        'Un bosque ficticio de helechos y musgo; incluye una foto de baja resolución, en el límite aceptado.',
      meters: 2400,
      zone: 'cold',
      featured: true,
      climate: { minC: 8, maxC: 17 },
      duration: { value: 6, unit: 'hours' },
      distanceKm: 11.5,
      ascentM: 620,
      difficulty: 'demanding',
      minAge: 12,
      photos: [L32, LOW, L32],
    },
    {
      slug: 'mirador-del-frailejon-perdido',
      name: 'Mirador del Frailejón Perdido',
      summary:
        'Un mirador inventado sobre una quebrada fría; tiene una sola foto, para probar el caso mínimo.',
      meters: 2150,
      zone: 'cold',
      climate: { minC: 7, maxC: 15 },
      distanceKm: 5,
      difficulty: 'easy',
      photos: [L32],
    },
    {
      slug: 'laguna-espejo-gris',
      name: 'Laguna Espejo Gris',
      summary:
        'Una laguna imaginaria de páramo, rodeada de frailejones inventados, para probar el piso más alto.',
      meters: 3350,
      zone: 'paramo',
      featured: true,
      climate: { minC: 2, maxC: 11 },
      access: 'Acceso ficticio: camino de herradura desde un cruce inventado.',
      duration: { value: 8, unit: 'hours' },
      distanceKm: 14,
      ascentM: 900,
      difficulty: 'demanding',
      minAge: 14,
      photos: [L32, L45, L32],
    },
  ],
  rutas: [
    {
      slug: 'sendero-del-canon',
      name: 'Sendero del Cañón',
      destino: 'canon-del-sol-quieto',
      points: [
        [-75.5, 6.2, 250],
        [-75.495, 6.205, 290],
        [-75.49, 6.21, 340],
        [-75.484, 6.213, 420],
      ],
      elevation: { minM: 250, maxM: 420 },
      distanceKm: 7.5,
      difficulty: 'moderate',
    },
    {
      slug: 'ronda-de-las-garzas',
      name: 'Ronda de las Garzas',
      destino: 'playon-de-las-garzas-azules',
      points: [
        [-75.52, 6.18],
        [-75.516, 6.183],
        [-75.512, 6.181],
        [-75.51, 6.185],
      ],
      elevation: { minM: 250, maxM: 290 },
      distanceKm: 3,
      difficulty: 'easy',
    },
    {
      slug: 'camino-del-cafetal',
      name: 'Camino del Cafetal',
      destino: 'cafetal-de-la-loma-alta',
      points: [
        [-75.4, 6.3, 1500],
        [-75.396, 6.304, 1580],
        [-75.392, 6.309, 1690],
        [-75.388, 6.312, 1760],
      ],
      elevation: { minM: 1500, maxM: 1760 },
      distanceKm: 9,
      difficulty: 'moderate',
    },
    {
      slug: 'ascenso-a-la-laguna',
      name: 'Ascenso a la Laguna',
      destino: 'laguna-espejo-gris',
      points: [
        [-75.3, 6.4, 3100],
        [-75.296, 6.404, 3200],
        [-75.292, 6.409, 3320],
        [-75.288, 6.412, 3390],
      ],
      elevation: { minM: 3100, maxM: 3390 },
      distanceKm: 14,
      difficulty: 'demanding',
    },
  ],
  siteKind: 'operator',
  legalStatus: 'reviewed',
  identifiers: true,
};

/** Mismo contenido que `completo`, como sitio académico publicable: textos de muestra y sin identificadores. */
const academico = { ...completo, siteKind: 'academic', legalStatus: 'sample', identifiers: false };

const minimo = {
  destinos: [
    {
      slug: 'sendero-de-la-quebrada-clara',
      name: 'Sendero de la Quebrada Clara',
      summary:
        'Un sendero inventado junto a una quebrada imaginaria; el único destino del escenario mínimo.',
      meters: 1500,
      zone: 'temperate',
      featured: true,
      photos: [L32],
    },
  ],
  rutas: [],
  siteKind: 'operator',
  legalStatus: 'draft',
  identifiers: false,
};

const sinFotos = {
  destinos: [
    {
      slug: 'vega-del-rio-manso',
      name: 'Vega del Río Manso',
      summary:
        'Una vega inventada de aguas lentas; destino cálido sin fotos que se muestra con lámina de altitud.',
      meters: 300,
      zone: 'warm',
      featured: true,
      photos: [],
    },
    {
      slug: 'terraza-del-guayabo-dulce',
      name: 'Terraza del Guayabo Dulce',
      summary: 'Una terraza ficticia entre guayabos inventados; destino templado sin fotos.',
      meters: 1400,
      zone: 'temperate',
      featured: true,
      photos: [],
    },
    {
      slug: 'cumbre-del-musgo-callado',
      name: 'Cumbre del Musgo Callado',
      summary: 'Una cumbre imaginaria cubierta de musgo; destino frío sin fotos.',
      meters: 2500,
      zone: 'cold',
      featured: true,
      photos: [],
    },
    {
      slug: 'paramo-de-la-bruma-larga',
      name: 'Páramo de la Bruma Larga',
      summary: 'Un páramo inventado de bruma persistente; destino de páramo sin fotos.',
      meters: 3400,
      zone: 'paramo',
      featured: true,
      photos: [],
    },
  ],
  rutas: [
    {
      slug: 'camino-de-la-vega',
      name: 'Camino de la Vega',
      destino: 'vega-del-rio-manso',
      points: [
        [-75.6, 6.1, 300],
        [-75.597, 6.104, 340],
        [-75.594, 6.108, 380],
      ],
      elevation: { minM: 300, maxM: 380 },
      distanceKm: 4,
      difficulty: 'easy',
    },
  ],
  siteKind: 'academic',
  legalStatus: 'sample',
  identifiers: false,
};

// ---------------------------------------------------------------------------
// Escritura
// ---------------------------------------------------------------------------

const q = (value) => JSON.stringify(value);
const write = (file, text) => {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, text);
};

function destinoMarkdown(d) {
  const lines = ['---', `name: ${q(d.name)}`, `summary: ${q(d.summary)}`];
  // `meters: null` omite la altitud entera (defecto de CA-20); `verified: false` quita la marca (CA-104).
  if (d.meters !== null) {
    lines.push(
      'altitude:',
      `  meters: ${d.meters}`,
      `  verified: ${d.verified !== false}`,
      `  source: ${q(SOURCE)}`,
    );
  }
  if (d.featured) lines.push('featured: true');
  if (d.climate) lines.push(`climate: { minC: ${d.climate.minC}, maxC: ${d.climate.maxC} }`);
  if (d.access) lines.push(`access: ${q(d.access)}`);
  if (d.duration) lines.push(`duration: { value: ${d.duration.value}, unit: ${d.duration.unit} }`);
  if (d.distanceKm) lines.push(`distanceKm: ${d.distanceKm}`);
  if (d.ascentM !== undefined) lines.push(`ascentM: ${d.ascentM}`);
  if (d.difficulty) lines.push(`difficulty: ${d.difficulty}`);
  if (d.minAge !== undefined) lines.push(`minAge: ${d.minAge}`);
  if (d.photos.length > 0) {
    lines.push('photos:');
    d.photos.forEach(([, , ratio, focus], i) => {
      lines.push(
        `  - file: ${q(`../photos/${d.slug}/foto-${i + 1}.jpg`)}`,
        `    alt: ${q(`Franja de color plano número ${i + 1} que representa un paisaje del piso ${ZONE_NAMES[d.zone]}`)}`,
        `    author: ${q(AUTHOR)}`,
        '    license:',
        `      kind: ${LICENSE.kind}`,
        `      name: ${q(LICENSE.name)}`,
        `      url: ${q(LICENSE.url)}`,
        `    sourceUrl: ${q(`https://fixtures.invalid/fotos/${d.slug}/foto-${i + 1}`)}`,
        '    modification: none',
        `    ratio: ${q(ratio)}`,
        `    focus: ${focus}`,
      );
    });
  }
  lines.push(
    '---',
    '',
    `${d.name} es un lugar inventado para las pruebas del sitio. Nada de lo que se cuenta aquí existe.`,
    '',
    'Este segundo párrafo existe para que el texto largo tenga más de un bloque y se pueda comprobar su maquetación.',
    '',
  );
  return lines.join('\n');
}

function rutaJson(r) {
  return (
    JSON.stringify(
      {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: r.points },
        properties: {
          name: r.name,
          destino: r.destino,
          elevation: r.elevation,
          distanceKm: r.distanceKm,
          difficulty: r.difficulty,
        },
      },
      null,
      2,
    ) + '\n'
  );
}

const LEGALS = [
  ['privacy', 'politica-de-datos', 'Política de datos'],
  ['terms', 'terminos-y-condiciones', 'Términos y condiciones'],
  ['cancellation', 'politica-de-cancelacion', 'Política de cancelación'],
];

function legalMarkdown([kind, , title], status) {
  const privacy =
    kind === 'privacy'
      ? [
          'El sitio no guarda datos de quien lo visita. El alojamiento está en Vercel; el mapa pide sus teselas a OpenStreetMap solo cuando se carga; y el enlace de contacto abre WhatsApp solo cuando se activa.',
          '',
        ]
      : [];
  const lines = [
    '---',
    `kind: ${kind}`,
    `title: ${q(title)}`,
    `summary: ${q(`Texto de prueba: ${title.toLowerCase()} de un operador inventado.`)}`,
    `status: ${status}`,
  ];
  if (status === 'reviewed') lines.push('reviewedOn: 2026-10-10');
  lines.push(
    '---',
    '',
    `Texto de prueba de la ${title.toLowerCase()}. No tiene validez legal.`,
    '',
    ...privacy,
    'Segundo párrafo del texto, para comprobar la maquetación de las páginas legales.',
    '',
  );
  return lines.join('\n');
}

async function photo(file, [width, height], zone, index) {
  const [r, g, b] = COLORS[zone];
  const shift = (index % 3) * 18;
  const band = await sharp({
    create: {
      width: Math.round(width / 2),
      height: Math.round(height / 5),
      channels: 3,
      background: { r: r + shift, g: g + shift, b: b + shift },
    },
  })
    .png()
    .toBuffer();
  mkdirSync(path.dirname(file), { recursive: true });
  await sharp({ create: { width, height, channels: 3, background: { r, g, b } } })
    .composite([{ input: band, gravity: 'center' }])
    .jpeg({ quality: 70 })
    .toFile(file);
}

async function build(name, scenario) {
  const dir = path.join(root, name);
  rmSync(dir, { recursive: true, force: true });

  write(
    path.join(dir, 'sitio', 'territorio.json'),
    JSON.stringify({ ...TERRITORY, ...scenario.territory }, null, 2) + '\n',
  );

  const academic = scenario.siteKind === 'academic';
  const operator = {
    siteKind: scenario.siteKind,
    name: academic ? 'Ejercicio Montes de Niebla' : 'Operadora Montes de Niebla S. A. S.',
    whatsapp: '+573105550142',
    hours: 'Lunes a viernes, de 9 a. m. a 5 p. m.',
    email: 'contacto@operadora-fixture.invalid',
  };
  if (scenario.identifiers) {
    operator.identifiers = {
      rnt: { value: '99871' },
      nit: { value: '900.555.321-7' },
      legalName: { value: 'Operadora Montes de Niebla S. A. S.' },
    };
  }
  // `undefined` quita la clave al serializar (por ejemplo, `siteKind: undefined`).
  write(
    path.join(dir, 'sitio', 'operador.json'),
    JSON.stringify({ ...operator, ...scenario.operator }, null, 2) + '\n',
  );

  for (const item of LEGALS) {
    write(path.join(dir, 'legal', `${item[1]}.md`), legalMarkdown(item, scenario.legalStatus));
  }
  for (const d of scenario.destinos) {
    write(path.join(dir, 'destinos', `${d.slug}.md`), destinoMarkdown(d));
    for (const [i, size] of d.photos.entries()) {
      await photo(path.join(dir, 'photos', d.slug, `foto-${i + 1}.jpg`), size, d.zone, i);
    }
  }
  // Git no guarda carpetas vacías; las colecciones necesitan que su carpeta exista.
  if (scenario.rutas.length === 0) write(path.join(dir, 'rutas', '.gitkeep'), '');
  if (scenario.destinos.length === 0) write(path.join(dir, 'destinos', '.gitkeep'), '');
  for (const r of scenario.rutas) {
    write(path.join(dir, 'rutas', `${r.slug}.json`), rutaJson(r));
  }
  scenario.post?.(dir);
  console.log(`${name}: ${scenario.destinos.length} destinos, ${scenario.rutas.length} rutas`);
}

// ---------------------------------------------------------------------------
// Escenarios inválidos (T-027): cada uno parte de una base pequeña y publicable y le añade un solo
// defecto. Los prueba tests/build/gates.test.ts.
// ---------------------------------------------------------------------------

/** Edita un archivo ya escrito: defectos de formato que el generador no produce por sí mismo. */
const edit = (dir, rel, fn) => {
  const file = path.join(dir, rel);
  const before = readFileSync(file, 'utf8');
  const after = fn(before);
  if (after === before) throw new Error(`La edición de ${rel} no cambió nada`);
  writeFileSync(file, after);
};

const BASE_SLUGS = [
  'canon-del-sol-quieto',
  'cafetal-de-la-loma-alta',
  'bosque-de-niebla-serena',
  'laguna-espejo-gris',
];

/** Cuatro destinos (uno por piso, solo el primero con una foto grande) y una ruta. */
function baseOf(kind) {
  const operator = kind === 'operator';
  return {
    siteKind: kind,
    legalStatus: operator ? 'reviewed' : 'sample',
    identifiers: operator,
    destinos: structuredClone(completo.destinos)
      .filter((d) => BASE_SLUGS.includes(d.slug))
      .map((d) => ({ ...d, photos: d.slug === BASE_SLUGS[0] ? [L32] : [] })),
    rutas: structuredClone(completo.rutas).filter((r) => r.slug === 'sendero-del-canon'),
  };
}

const PHOTO_FILE = () => `destinos/${BASE_SLUGS[0]}.md`;

/**
 * Defectos. `kinds` dice en qué tipos de sitio se genera: los que pide CA-139 para los dos, y el resto
 * solo en académico (plan, R8). Cada defecto lleva `change(scenario)` y, si hace falta, `post(dir)`.
 */
const DEFECTS = {
  // --- error en ambas compilaciones ---
  'sin-modo': { kinds: ['academic'], change: (s) => (s.operator = { siteKind: undefined }) },
  'modo-desconocido': { kinds: ['academic'], change: (s) => (s.operator = { siteKind: 'otro' }) },
  'identificador-en-academico': {
    kinds: ['academic'],
    change: (s) => (s.operator = { identifiers: { rnt: { value: '99871' } } }),
  },
  'legal-sin-rotulo': {
    kinds: ['academic'],
    change: () => {},
    post: (dir) =>
      edit(dir, 'legal/politica-de-cancelacion.md', (t) =>
        t.replace('status: sample', 'status: draft'),
      ),
  },
  'muestra-en-operador': {
    kinds: ['operator'],
    change: () => {},
    post: (dir) =>
      edit(dir, 'legal/politica-de-cancelacion.md', (t) =>
        t.replace('status: reviewed', 'status: sample').replace('reviewedOn: 2026-10-10\n', ''),
      ),
  },
  'muestra-con-fecha': {
    kinds: ['academic'],
    change: () => {},
    post: (dir) =>
      edit(dir, 'legal/politica-de-cancelacion.md', (t) =>
        t.replace('status: sample', 'status: sample\nreviewedOn: 2026-10-10'),
      ),
  },
  'politica-sin-terceros': {
    kinds: ['academic'],
    change: () => {},
    post: (dir) =>
      edit(dir, 'legal/politica-de-datos.md', (t) => t.replace('Vercel', 'el proveedor')),
  },
  'altitud-ausente': { kinds: ['academic'], change: (s) => (s.destinos[1].meters = null) },
  'altitud-cero': { kinds: ['academic'], change: (s) => (s.destinos[1].meters = 0) },
  'clima-invertido': {
    kinds: ['academic'],
    change: (s) => (s.destinos[1].climate = { minC: 30, maxC: 10 }),
  },
  'dificultad-invalida': {
    kinds: ['academic'],
    change: (s) => (s.destinos[1].difficulty = 'extrema'),
  },
  'slug-con-tilde': {
    kinds: ['academic'],
    change: (s) => {
      s.destinos[0].slug = 'cañón-del-sol-quieto';
      s.rutas[0].destino = 'cañón-del-sol-quieto';
    },
  },
  'nombre-largo': {
    kinds: ['academic'],
    change: (s) => (s.destinos[1].name = 'Cafetal de la Loma Alta de Nunca Acabar'),
  },
  'nombre-repetido': {
    kinds: ['academic'],
    change: (s) => (s.destinos[1].name = s.destinos[0].name),
  },
  'foto-pequena': {
    kinds: ['academic', 'operator'],
    change: (s) => (s.destinos[0].photos = [[1000, 667, '3:2', 'center']]),
  },
  'foto-sin-autor': {
    kinds: ['academic'],
    change: () => {},
    post: (dir) => edit(dir, PHOTO_FILE(), (t) => t.replace(/ {4}author: .*\n/, '')),
  },
  'licencia-tipo-nc': {
    kinds: ['academic'],
    change: () => {},
    post: (dir) => edit(dir, PHOTO_FILE(), (t) => t.replace('kind: cc0', 'kind: cc-by-nc')),
  },
  'licencia-nombre-nc': {
    kinds: ['academic', 'operator'],
    change: () => {},
    post: (dir) =>
      edit(dir, PHOTO_FILE(), (t) =>
        t.replace('kind: cc0', 'kind: cc-by').replace('name: "CC0 1.0"', 'name: "CC BY-NC 4.0"'),
      ),
  },
  'alt-vacio': {
    kinds: ['academic'],
    change: () => {},
    post: (dir) => edit(dir, PHOTO_FILE(), (t) => t.replace(/ {4}alt: .*\n/, '    alt: ""\n')),
  },
  'alt-con-autor': {
    kinds: ['academic', 'operator'],
    change: () => {},
    post: (dir) =>
      edit(dir, PHOTO_FILE(), (t) =>
        t.replace(/ {4}alt: "(.*)"\n/, '    alt: "$1 de Generador de fixtures"\n'),
      ),
  },
  'ruta-sin-trazado': { kinds: ['academic', 'operator'], change: (s) => (s.rutas[0].points = []) },
  'ruta-un-punto': {
    kinds: ['academic'],
    change: (s) => (s.rutas[0].points = [[-75.5, 6.2, 250]]),
  },
  'ruta-elevacion-parcial': {
    kinds: ['academic', 'operator'],
    change: (s) =>
      (s.rutas[0].points = [
        [-75.5, 6.2, 250],
        [-75.49, 6.21],
        [-75.48, 6.22, 400],
      ]),
  },
  'ruta-sin-destino': {
    kinds: ['academic', 'operator'],
    change: (s) => (s.rutas[0].destino = 'no-existe'),
  },
  'ruta-sin-elevacion': { kinds: ['academic'], change: (s) => (s.rutas[0].elevation = undefined) },
  'ruta-elevacion-invertida': {
    kinds: ['academic'],
    change: (s) => (s.rutas[0].elevation = { minM: 500, maxM: 100 }),
  },
  'dos-principales': {
    kinds: ['academic', 'operator'],
    change: (s) =>
      s.destinos.push({
        ...structuredClone(s.destinos[0]),
        slug: 'playon-del-sol-quieto',
        name: 'Playón del Sol Quieto',
        summary: 'Otro destino cálido que también se marca como principal.',
        meters: 400,
        photos: [],
      }),
  },
  'sin-destinos': {
    kinds: ['academic', 'operator'],
    change: (s) => {
      s.destinos = [];
      s.rutas = [];
    },
  },
  'fuera-de-rango': { kinds: ['academic'], change: (s) => (s.destinos[3].meters = 4200) },
  'umbrales-desordenados': {
    kinds: ['academic'],
    change: (s) => (s.territory = { thresholds: { temperate: 2000, cold: 1000, paramo: 3000 } }),
  },
  // --- error solo en publicación ---
  'altitud-sin-verificar': {
    kinds: ['academic', 'operator'],
    change: (s) => (s.destinos[1].verified = false),
  },
  'territorio-sin-verificar': {
    kinds: ['academic', 'operator'],
    change: (s) => (s.territory = { verified: false }),
  },
  'contacto-de-relleno': {
    kinds: ['academic', 'operator'],
    change: (s) => (s.operator = { hours: 'Por definir' }),
  },
  'identificador-de-relleno': {
    kinds: ['operator'],
    change: (s) =>
      (s.operator = {
        identifiers: {
          rnt: { value: '000' },
          nit: { value: '123456' },
          legalName: { value: 'Operadora Montes de Niebla S. A. S.' },
        },
      }),
  },
  'identificador-ficticio': {
    kinds: ['operator'],
    change: (s) =>
      (s.operator = {
        identifiers: {
          rnt: { value: '99871', fictitious: true },
          nit: { value: '900.555.321-7' },
          legalName: { value: 'Operadora Montes de Niebla S. A. S.' },
        },
      }),
  },
};

/** Nombre del escenario: `invalido-<defecto>`; con sufijo `-operador` cuando el sitio es de operador y el defecto existe en los dos tipos. */
const invalid = Object.entries(DEFECTS).flatMap(([name, defect]) =>
  defect.kinds.map((kind) => {
    const both = defect.kinds.length === 2;
    const scenario = baseOf(kind);
    defect.change(scenario);
    if (defect.post) scenario.post = defect.post;
    return [`invalido-${name}${both && kind === 'operator' ? '-operador' : ''}`, scenario];
  }),
);

for (const dir of readdirSync(root)) {
  if (dir.startsWith('invalido-')) rmSync(path.join(root, dir), { recursive: true, force: true });
}
await build('academico', academico);
await build('completo', completo);
await build('minimo', minimo);
await build('sin-fotos', sinFotos);
for (const [name, scenario] of invalid) await build(name, scenario);
