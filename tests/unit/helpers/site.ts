import type { RawEntry, RawSite, Issue } from '../../../src/lib/content/validate';
import type { DestinoData, LegalData, Operator, RutaData } from '../../../src/lib/content/schemas';
import { destino, legal, operator, ruta, territory } from './content';

export const entry = <T>(id: string, data: T, folder: string, body = ''): RawEntry<T> => ({
  id,
  file: `${folder}/${id}`,
  data,
  body,
});

export const dest = (id: string, over: Partial<DestinoData> = {}) =>
  entry(id, destino({ name: `Destino ${id}`, summary: `Resumen de ${id}.`, ...over }), 'destinos');

/** Cuerpo de una política de datos que nombra a los tres terceros del registro (CA-135). */
export const PRIVACY_BODY =
  'Usamos teselas de OpenStreetMap, un enlace a WhatsApp y el alojamiento de Vercel.';

export const legals = (status: LegalData['status'] = 'reviewed'): RawEntry<LegalData>[] =>
  (
    [
      ['privacy', 'politica-de-datos', 'Política de datos'],
      ['terms', 'terminos-y-condiciones', 'Términos y condiciones'],
      ['cancellation', 'politica-de-cancelacion', 'Política de cancelación'],
    ] as const
  ).map(([kind, id, title]) =>
    entry(
      id,
      legal({
        kind,
        title,
        summary: `Resumen de ${title}.`,
        status,
        ...(status === 'reviewed' ? { reviewedOn: new Date('2026-11-01') } : {}),
      }),
      'legal',
      kind === 'privacy' ? PRIVACY_BODY : '',
    ),
  );

export const fullOperator = (over: Partial<Operator> = {}): Operator =>
  operator({
    identifiers: {
      rnt: { value: 'RNT 84521', fictitious: false },
      nit: { value: 'NIT 901.234.567-8', fictitious: false },
      legalName: { value: 'Ecoturismo Montaña S. A. S.', fictitious: false },
      others: [],
    },
    ...over,
  });

export const rutaEntry = (
  id: string,
  destinoId: string,
  over: { geometry?: RutaData['geometry']; properties?: Partial<RutaData['properties']> } = {},
) => {
  const base = ruta();
  return entry(
    id,
    {
      ...base,
      ...(over.geometry ? { geometry: over.geometry } : {}),
      properties: {
        ...base.properties,
        name: `Ruta ${id}`,
        destino: { collection: 'destinos', id: destinoId },
        ...over.properties,
      },
    },
    'rutas',
  );
};

/** Sitio válido y completo: un destino por piso, una ruta, textos revisados y operador completo. */
export function validRaw(): RawSite {
  return {
    destinos: [
      dest('playa', { altitude: { meters: 300, verified: true, source: 'IGAC' } }),
      dest('valle', { altitude: { meters: 1500, verified: true, source: 'IGAC' } }),
      dest('bosque', { altitude: { meters: 2500, verified: true, source: 'IGAC' } }),
      dest('laguna', { altitude: { meters: 3500, verified: true, source: 'IGAC' } }),
    ],
    rutas: [rutaEntry('sendero-valle', 'valle')],
    legal: legals('reviewed'),
    operador: [entry('operador', fullOperator(), 'sitio')],
    territorio: [entry('territorio', territory(), 'sitio')],
  };
}

export const rules = (issues: Issue[], criterion: string) =>
  issues.filter((i) => i.criterion === criterion);
