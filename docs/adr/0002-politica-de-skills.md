# ADR 0002 — Uso de skills en el flujo SDD

Estado: Aceptado (2026-10-11, aprobado por el humano) · Fecha: 2026-10-10

## Contexto
Claude Code permite precargar skills en subagentes con el campo `skills:` del frontmatter. Una
skill precargada inyecta su `SKILL.md` completo en el contexto del agente al arrancar. Queremos
mejorar la calidad visual y aprovechar skills del ecosistema, sin perder control sobre lo que
entra al proyecto.

## Decisión
1. **`frontend-design`** (`anthropics/skills`) se precarga en tres agentes con roles distintos:
   - `ui-designer`: **decide** la dirección visual y el diseño de cada feature.
   - `astro-developer`: **ejecuta** el diseño decidido con calidad; no lo redefine.
   - `quality-reviewer`: **evalúa** el resultado contra la dirección visual.
2. **`find-skills`** (`vercel-labs/skills`) se precarga solo en `software-architect`, que puede
   buscar (`npx skills find`) pero no instalar.
3. Las skills se instalan con alcance de proyecto en `.claude/skills/` y se versionan en Git.
4. Toda skill nueva se trata como una dependencia: ADR, lectura humana del `SKILL.md` antes de
   instalar y aprobación explícita (regla `ask` en `.claude/settings.json`).

## Alternativas consideradas
- **Sin skills**: menos contexto que mantener, pero el diseño tiende a resultados genéricos.
- **Todas las skills en todos los agentes**: más contexto consumido en cada agente y
  responsabilidades difusas (todos opinan de diseño).
- **Permitir que `find-skills` instale automáticamente**: más rápido, pero una skill es texto que
  guía al agente y puede incluir scripts; instalar sin revisar es un riesgo de cadena de suministro.

## Consecuencias
- (+) Identidad visual coherente: un solo agente decide y los demás siguen esa decisión.
- (+) Cualquier persona que clone el repositorio obtiene las mismas skills.
- (−) Cada skill precargada ocupa contexto del subagente; se limita a las que aporten.
- (−) Las skills de terceros pueden cambiar; actualizar una skill también requiere revisión.
