---
description: Add a Directus body block through the global registry without editing RenderBlocks
globs: components/blocks/**/*.{ts,tsx},components/page/**/*.{ts,tsx},app/(site)/**/page.tsx,types/collections/junctions/**/*.ts,services/domain/db/queries/collections/**/*.fields.ts
alwaysApply: false
---

# Page block registry

`components/blocks/register.ts` is the only component map. It is keyed by `GlobalBodyBlockCollection`. Each entry has `Component` and `Skeleton`. `components/blocks/RenderBlocks.tsx` resolves `row.collection`, keeps API order, keys by the junction row id, and wraps each block in that entry's `Suspense` skeleton. Do not add an if/switch of block types to `RenderBlocks`.

The discriminator is the Directus field `collection`. There is no Payload `blockType`.

`contact_block` is registered but is not on any body allowlist until Directus adds it.

`BlockPage` and `RecordBlockPage` in `components/page/BlockPage.tsx` render body rows through `RenderBlocks`. Service, manual, and blog field trees stay in their queries. Do not add a second map. Do not sort rows in JS; queries already set `deep.body._sort: ["sort"]`.

Optional fields and missing relations render nothing.

`setAttr` comes from `@directus/visual-editing`, never from `config/visual-editing.ts`.

A new block that fetches its own server data uses `Name/Name.tsx`, `NameClient.tsx`, and `NameSkeleton.tsx`. Do not import the server `Name.tsx` from a `"use client"` file. HeaderNav and FooterNav stay flat files. Blocks that only render the row already loaded on the body query do not need that fetch wrapper.

## Add a block

1. Add or verify the Directus collection and the body allowlist (`pages`, `services`, `manuals`, `blog_posts`).
2. Add the collection to the junction union and to `GlobalBodyBlockCollection` in `types/collections/junctions/body-blocks.ts`.
3. Add the query `fields` (and `deep` only when that relation needs its own sort or limit) on each body query that allows the collection.
4. Add the component and a skeleton that uses `components/ui/skeleton.tsx` and the same outer slot as the resolved block.
5. Register both on `components/blocks/register.ts`.
6. Do not edit `RenderBlocks.tsx`.
