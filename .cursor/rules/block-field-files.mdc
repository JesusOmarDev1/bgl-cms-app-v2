---
description: One fields file per Directus block; parents import only their allowlist
globs: services/domain/db/queries/**/*.ts,components/blocks/register.ts
alwaysApply: false
---

# Block field files

One file per block at `services/domain/db/queries/blocks/<name>/<name>.fields.ts`, same shape as `services/domain/db/queries/collections/seo/seo.fields.ts`.

Parent queries for pages, services, manuals, and blog posts import only the constants on that parent's allowlist.

No `body-blocks.fields.ts`. No `index.ts` barrel.

`contact_block` stays typed and off every body allowlist until Directus adds it.

The content block may import content-column fields. Form sub-fields stay inside the form file. `DirectusFileQuery` stays in `directus-file/directus-file.fields.ts`.

`components/blocks/register.ts` composes the query-result map locally.
