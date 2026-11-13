---
description: Directus SDK queries — as-const fields, satisfies Query, M2A collection-scope, no request generic
globs: services/domain/db/**/*.ts,config/directus.ts
alwaysApply: false
---

# Directus SDK queries

`fields` must be a literal with `as const`. Without it, TypeScript widens to `string[]` and selected fields are lost. Do not build `fields` at runtime.

Queries that pass `fields` must use `satisfies Query<Schema, CollectionType>`. Never `directus.request<T[]>(...)` — that generic kills SDK output inference.

Export `type XQueryResult = Awaited<ReturnType<typeof getXQuery>>`. Repos use that type.

`fields: ["*"]` is top-level columns only. Relations default to PK. Expand M2A with collection-scope `item: { form_block: ["*"] }` per `one_allowed_collections`. `body: ["*"]` leaves `item` as UUID. No `*.*` (overfetches `user_created`).

```ts
// BAD
fields: ["*"];
await directus.request<PagesTypes[]>(readItems("pages", { fields }));

// GOOD
const PAGES_FIELDS = [
  "*",
  { body: ["id", "collection", { item: { form_block: ["*"] } }] },
] as const;
readItems("pages", { fields: PAGES_FIELDS } satisfies Query<Schema, PagesTypes>);
```
