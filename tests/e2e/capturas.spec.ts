/**
 * Capturas del punto de control CA-124 (T-057): el perfil del hero y las láminas de altitud.
 * No comprueban el diseño; lo dejan a la vista de quien lo revisa y anotan hechos medibles
 * (recortes, solapes, desbordes) en `hechos.txt`. Se ejecutan con `npm run test:capturas`.
 *
 * Salida: .tmp/capturas/ca-124/<escenario>/<pieza>-<ancho>.png
 *   perfil-<ancho>.png          el perfil del hero (figura completa) a 320, 360, 768 y 1280 px
 *   pantalla-<ancho>x<alto>.png la primera pantalla completa, sin desplazarse (360x640 y 360x800)
 *   lamina-<piso>-natural.png   cada lámina del listado, a su tamaño real
 *   lamina-<piso>-<ancho>.png   la lámina a 120, 200, 360 y 520 px (solo `sin-fotos`), para ver
 *                               cada tamaño de cifra (21, 33, 42 y 52 px)
 *   avisos-perfil.txt           líneas `[perfil]` del build; hechos.txt: mediciones de cada captura
 */
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';
import { capturaScenarios, capturasDir, urlOf } from './scenarios';

const WIDTHS = [320, 360, 768, 1280];
const FIRST_SCREENS = [
  { width: 360, height: 640 },
  { width: 360, height: 800 },
];
const PLATE_WIDTHS = [120, 200, 360, 520];
const ZONES = [
  { id: 'warm', name: 'calido' },
  { id: 'temperate', name: 'templado' },
  { id: 'cold', name: 'frio' },
  { id: 'paramo', name: 'paramo' },
] as const;
const ANSI = new RegExp(String.fromCharCode(27) + '\\[[0-9;]*m', 'g');

async function settle(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(document.getAnimations().map((a) => a.finished));
  });
}

interface Box {
  text: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

/** Mide los textos visibles de la figura: cuáles salen de ella y cuáles se encimen entre sí. */
async function profileFacts(page: Page): Promise<string[]> {
  const data = await page.evaluate(() => {
    const figure = document.querySelector('figure[aria-label="Perfil de altitud de Antioquia"]');
    if (!figure) return null;
    const f = figure.getBoundingClientRect();
    const boxes: Box[] = [];
    const walker = document.createTreeWalker(figure, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const text = (node.textContent ?? '').trim();
      const parent = node.parentElement;
      if (!text || !parent || parent.closest('svg')) continue;
      const style = getComputedStyle(parent);
      if (style.display === 'none' || style.visibility === 'hidden') continue;
      if (parent.getClientRects().length === 0) continue;
      // Texto solo para lectores de pantalla (recortado a 1 px): no se ve, no cuenta.
      let hidden = false;
      for (let el: Element | null = parent; el && el !== figure; el = el.parentElement) {
        const r = el.getBoundingClientRect();
        if (r.width <= 2 && r.height <= 2) hidden = true;
      }
      if (hidden) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      const r = range.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      boxes.push({ text, left: r.left, top: r.top, right: r.right, bottom: r.bottom });
    }
    return {
      figure: { left: f.left, top: f.top, right: f.right, bottom: f.bottom },
      boxes,
      overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  if (!data) return ['no hay figura de perfil'];
  const { figure, boxes, overflowX } = data;
  const facts: string[] = [`textos visibles en la figura: ${boxes.length}`];
  facts.push(`desborde horizontal de la página: ${Math.max(0, overflowX)} px`);
  for (const b of boxes) {
    const out = [
      b.left < figure.left - 0.5 ? `izquierda ${Math.round(figure.left - b.left)} px` : '',
      b.right > figure.right + 0.5 ? `derecha ${Math.round(b.right - figure.right)} px` : '',
      b.top < figure.top - 0.5 ? `arriba ${Math.round(figure.top - b.top)} px` : '',
      b.bottom > figure.bottom + 0.5 ? `abajo ${Math.round(b.bottom - figure.bottom)} px` : '',
    ].filter(Boolean);
    if (out.length > 0) facts.push(`FUERA de la figura: "${b.text}" (${out.join(', ')})`);
  }
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]!;
      const b = boxes[j]!;
      const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (w > 1 && h > 1) {
        facts.push(`ENCIMADOS: "${a.text}" y "${b.text}" (${Math.round(w)} x ${Math.round(h)} px)`);
      }
    }
  }
  return facts;
}

for (const scenario of capturaScenarios) {
  const outDir = path.join(capturasDir, scenario.name);
  const base = urlOf(scenario);
  const note = (line: string) => appendFileSync(path.join(outDir, 'hechos.txt'), `${line}\n`);

  test.describe(`CA-124: capturas del escenario ${scenario.name}`, () => {
    test.describe.configure({ mode: 'serial' });

    test.beforeAll(() => {
      mkdirSync(outDir, { recursive: true });
      writeFileSync(path.join(outDir, 'hechos.txt'), `Escenario ${scenario.name}\n`);
      const log = readFileSync(path.join(outDir, 'build.log'), 'utf8');
      const warnings = log
        .split(/\r?\n/)
        .filter((line) => line.includes('[perfil]'))
        .map((line) => line.replace(ANSI, '').trim());
      writeFileSync(
        path.join(outDir, 'avisos-perfil.txt'),
        warnings.length > 0 ? `${warnings.join('\n')}\n` : '(sin avisos [perfil])\n',
      );
    });

    for (const width of WIDTHS) {
      test(`CA-124: perfil del hero a ${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(`${base}/`);
        await settle(page);
        const figure = page.getByRole('figure', { name: 'Perfil de altitud de Antioquia' });
        await expect(figure).toBeVisible();
        await figure.screenshot({ path: path.join(outDir, `perfil-${width}.png`) });
        const box = await figure.boundingBox();
        note(
          `\nperfil-${width}.png (figura ${Math.round(box?.width ?? 0)} x ${Math.round(box?.height ?? 0)} px)`,
        );
        for (const fact of await profileFacts(page)) note(`  ${fact}`);
      });
    }

    for (const { width, height } of FIRST_SCREENS) {
      test(`CA-124: primera pantalla a ${width} x ${height} px`, async ({ page }) => {
        await page.setViewportSize({ width, height });
        await page.goto(`${base}/`);
        await settle(page);
        await page.screenshot({ path: path.join(outDir, `pantalla-${width}x${height}.png`) });
        const figure = page.getByRole('figure', { name: 'Perfil de altitud de Antioquia' });
        const box = await figure.boundingBox();
        const visible = box
          ? Math.max(0, Math.min(box.y + box.height, height) - Math.max(box.y, 0))
          : 0;
        note(
          `\npantalla-${width}x${height}.png: del perfil (${Math.round(box?.height ?? 0)} px de alto) se ven ${Math.round(visible)} px sin desplazarse; empieza en y = ${Math.round(box?.y ?? 0)}`,
        );
      });
    }

    for (const zone of ZONES) {
      test(`CA-124: lámina del piso ${zone.name}`, async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 900 });
        await page.goto(`${base}/`);
        await settle(page);
        // La lámina es decorativa (aria-hidden) y no tiene rol ni nombre: se localiza por el dibujo que usa.
        const plate = page
          .locator(`[aria-hidden="true"]:has(use[href="#contours-${zone.id}"])`)
          .first();
        if ((await plate.count()) === 0) {
          note(`\nlamina-${zone.name}: el escenario no muestra lámina de este piso`);
          return;
        }
        await plate.scrollIntoViewIfNeeded();
        await plate.screenshot({ path: path.join(outDir, `lamina-${zone.name}-natural.png`) });
        const natural = await plate.boundingBox();
        note(
          `\nlamina-${zone.name}-natural.png: ${Math.round(natural?.width ?? 0)} x ${Math.round(natural?.height ?? 0)} px`,
        );

        if (scenario.name !== 'sin-fotos') return;
        for (const width of PLATE_WIDTHS) {
          // Copia fuera del listado, con el ancho pedido: la cifra depende del ancho de la propia lámina.
          const handle = await plate.evaluateHandle((el, w) => {
            const clone = el.cloneNode(true) as HTMLElement;
            clone.style.cssText += `;position:fixed;top:0;left:0;z-index:9999;width:${w}px;max-width:none`;
            document.body.append(clone);
            return clone;
          }, width);
          const clone = handle.asElement();
          if (!clone) throw new Error('no se pudo crear la copia de la lámina');
          await clone.screenshot({ path: path.join(outDir, `lamina-${zone.name}-${width}.png`) });
          const size = await clone.evaluate((el) => {
            const figure = el.querySelector('p');
            return figure ? getComputedStyle(figure).fontSize : '?';
          });
          note(`lamina-${zone.name}-${width}.png: cifra de ${size}`);
          await clone.evaluate((el) => el.remove());
        }
      });
    }
  });
}
