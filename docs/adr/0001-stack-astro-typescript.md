# ADR 0001 — Astro + TypeScript como stack base

Estado: Propuesto · Fecha: 2026-10-10

## Contexto
Landing page de ecoturismo en Antioquia con tres bloques: destinos, galería interactiva y mapa de
rutas. Es un sitio mayormente de contenido, con mucho peso en imágenes, consumido sobre todo
desde móvil y a veces con conectividad limitada. No hay usuarios autenticados, pagos ni datos
que cambien en tiempo real en la primera versión.

## Decisión
Astro con salida estática y TypeScript estricto. Contenido en Content Collections validadas con
Zod. Interactividad solo en dos islas (galería y mapa) hidratadas con `client:visible`.
Mapa con Leaflet + OpenStreetMap; rutas en GeoJSON.

## Alternativas consideradas
- **Next.js / Nuxt (SPA o SSR)**: más JS enviado al cliente por defecto y más complejidad de la
  que el problema necesita.
- **HTML + JS sin framework**: liviano, pero sin componentes reutilizables, sin optimización de
  imágenes ni validación de contenido.
- **.NET / Razor Pages**: conocido por el equipo, pero requiere servidor para algo que puede ser
  estático y pierde la optimización de imágenes integrada.
- **Mapbox / Google Maps**: más pulidos, pero requieren API key y tienen costo por uso.

## Consecuencias
- (+) HTML estático: rendimiento alto, SEO fuerte y hosting gratuito (Netlify, Vercel, Cloudflare
  Pages, GitHub Pages).
- (+) Imágenes optimizadas automáticamente (AVIF/WebP, tamaños responsivos).
- (+) Errores de contenido detectados en build gracias a Zod; TypeScript en todo el proyecto.
- (−) Si en el futuro se necesitan reservas, pagos o un panel de administración, habrá que
  añadir un adaptador SSR o un backend/CMS aparte (decisión que irá en un ADR nuevo).
- (−) Las teselas de OpenStreetMap tienen política de uso justo; con tráfico alto conviene un
  proveedor de teselas dedicado.
