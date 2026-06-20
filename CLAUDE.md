<!-- SPECKIT START -->
For additional context about technologies to be used, project structure,
shell commands, and other important information, read the current plan
at specs/001-fluent-platform/plan.md
<!-- SPECKIT END -->

## Content authoring rules

**Concept `status` must always be `"published"`** — never `"wip"`. Both `listConcepts` and `startPlacement` filter `where: { status: "published" }`. A concept with `status: "wip"` in config.json is invisible everywhere: the dashboard, placement, and the track page will all silently omit it.

To seed the DB with all content: `pnpm --filter api db:seed`
