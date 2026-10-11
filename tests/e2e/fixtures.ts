import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test as base, expect } from '@playwright/test';

const tile = readFileSync(path.join(process.cwd(), 'tests', 'fixtures', 'tile.png'));

/** Dominio de teselas de OpenStreetMap, incluidos los subdominios a, b y c. */
const OSM_TILES = /^https:\/\/([a-c]\.)?tile\.openstreetmap\.org\//;

/**
 * `test` del proyecto. Intercepta las teselas de OpenStreetMap en todos los contextos y sirve una
 * tesela local: la política de uso de OSM prohíbe los navegadores automatizados (ADR 0006, CA-79).
 * Las pruebas importan `test` y `expect` de este archivo, nunca de `@playwright/test`.
 * `tileRequests` lista las URL de teselas que la página pidió.
 */
export const test = base.extend<{ tileRequests: string[] }>({
  tileRequests: [
    async ({ context }, use) => {
      const urls: string[] = [];
      await context.route(OSM_TILES, async (route) => {
        urls.push(route.request().url());
        await route.fulfill({ status: 200, contentType: 'image/png', body: tile });
      });
      await use(urls);
    },
    { auto: true },
  ],
});

export { expect };
