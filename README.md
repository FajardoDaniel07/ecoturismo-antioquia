# Ecoturismo Antioquia

Landing page de ecoturismo en Antioquia (Colombia): destinos ordenados por piso térmico, galería de
fotos y mapa de rutas.

**Es un ejercicio académico.** El sitio no ofrece servicios turísticos reales: no vende salidas, no
hace reservas ni cobra. Lleva un aviso en todas las páginas, no se indexa en buscadores y sus textos
legales son de muestra, sin validez legal. El contacto que muestra es de prueba.

Los datos geográficos sí son reales y llevan su fuente: altitudes, accesos, fotos y trazados.

## Qué tiene

- **Hero** con un perfil de altitud de Antioquia generado a partir de los destinos.
- **Seis destinos**, del cañón del río Claro al páramo de Belmira, cada uno con su página.
- **Galería** con visor de fotos.
- **Mapa de rutas** con tres trazados y su lista, que funciona también sin JavaScript.
- Páginas de contacto de prueba, textos legales de muestra, créditos y 404.

## Cómo está hecho

- [Astro](https://astro.build) con salida estática y TypeScript estricto.
- Contenido en colecciones validadas con Zod (`src/content/`), con una sola puerta de carga que
  decide qué se publica.
- Tailwind CSS con design tokens propios (`src/styles/tokens.css`).
- Dos islas sin framework, cargadas solo cuando su sección se acerca a la pantalla: el visor de
  fotos y el mapa (Leaflet).
- Pruebas con Vitest, Playwright y axe; Lighthouse CI.
- Despliegue en Vercel.

El proyecto sigue un flujo guiado por especificación. La especificación, el diseño, el plan y las
tareas están en [`specs/001-landing-completa/`](specs/001-landing-completa/); las decisiones de
arquitectura, en [`docs/adr/`](docs/adr/); y las reglas del proyecto, en [`CLAUDE.md`](CLAUDE.md).

## Comandos

Requiere Node.js 22.12 o superior.

```bash
npm install
npm run dev            # servidor local
npm run build          # compilación de vista previa (no se despliega)
npm run build:release  # compilación de publicación; exige la variable SITE_URL
npm run lint           # ESLint y Prettier
npm run test           # pruebas unitarias
npm run test:build     # comprueba que la compilación falla cuando el contenido no es válido
npm run test:e2e       # pruebas en navegador, con axe
npm run test:lh        # Lighthouse en móvil
```

## Licencias y créditos

- **Fotos:** son de terceros, publicadas en Wikimedia Commons bajo licencias Creative Commons
  Atribución-CompartirIgual (CC BY-SA 2.0, 3.0 y 4.0). El autor, la licencia y la fuente de cada
  una están en el frontmatter de su destino (`src/content/destinos/`) y se muestran junto a cada
  foto y en la página de créditos. El sitio las recorta y redimensiona; esas versiones se comparten
  bajo la misma licencia que el original.
- **Trazados de las rutas:** derivan de OpenStreetMap, © colaboradores de OpenStreetMap, bajo la
  [Open Database License](https://www.openstreetmap.org/copyright). Los archivos de
  `src/content/rutas/` se comparten bajo esa misma licencia.
- **Mapa base:** teselas de OpenStreetMap, con su atribución en el mapa.
- **Fuentes:** Besley e Instrument Sans, bajo la SIL Open Font License 1.1; sus textos están en
  `src/assets/fonts/`.
