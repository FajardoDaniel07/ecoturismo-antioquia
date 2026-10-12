// @ts-check
import { defineConfig } from 'astro/config';
import { readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';

/**
 * Quita de la salida las imágenes de `_astro/` que ninguna página, hoja de estilos ni guion
 * referencia. Astro emite como archivo el original de cada foto que el contenido importa con
 * `image()` aunque las páginas solo usen sus variantes (`<Picture>`); en el contenido real eran 18
 * originales y casi 15 MB. Solo toca imágenes rasterizadas: nada que se cargue por nombre se pierde.
 */
const pruneUnusedImages = {
  name: 'prune-unused-images',
  hooks: {
    /** @param {{ dir: URL }} options */
    'astro:build:done': ({ dir }) => {
      const root = fileURLToPath(dir);
      const assets = `${root}/_astro`;
      /** @type {string[]} */
      const texts = [];
      /** @param {string} folder */
      const walk = (folder) => {
        for (const name of readdirSync(folder)) {
          const path = `${folder}/${name}`;
          if (statSync(path).isDirectory()) walk(path);
          else if (/\.(html|css|js|mjs|json|xml|txt|webmanifest)$/.test(name)) {
            texts.push(readFileSync(path, 'utf8'));
          }
        }
      };
      walk(root.endsWith('/') ? root.slice(0, -1) : root);
      const referenced = texts.join(' ');
      let removed = 0;
      for (const name of readdirSync(assets)) {
        if (/\.(avif|webp|jpe?g|png)$/.test(name) && !referenced.includes(name)) {
          rmSync(`${assets}/${name}`);
          removed++;
        }
      }
      if (removed > 0)
        console.log(
          `[prune-unused-images] ${removed} imágenes sin referencia retiradas de _astro/`,
        );
    },
  },
};

// En Vercel, las vistas previas no tienen SITE_URL: se usa su propia dirección (https://$VERCEL_URL).
// La publicación sigue exigiendo SITE_URL (la comprueba loadSite(), que solo lee esa variable).
const site =
  process.env.SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:4321');

// SITE_URL solo es obligatoria en la compilación de publicación (la valida el contenido, ADR 0003).
// OUT_DIR permite a las pruebas construir cada escenario en su propia carpeta.
// CACHE_DIR les da además un almacén de contenido propio: sin él, dos builds simultáneos con
// distinta raíz de contenido comparten node_modules/.astro y pueden leer entradas del otro.
// https://astro.build/config
export default defineConfig({
  site,
  trailingSlash: 'always',
  outDir: process.env.OUT_DIR ?? 'dist',
  cacheDir: process.env.CACHE_DIR ?? './node_modules/.astro',
  integrations: [pruneUnusedImages],
  vite: {
    plugins: [tailwindcss()],
  },
});
