---
description: Directus SDK root Schema — pure lookup table, relational unions, literal field types
globs: types/**/*.ts,config/directus.ts
alwaysApply: false
---

# Directus SDK root Schema

Root Schema is a lookup table. Arrays = collections. Singular = singletons. Include M2M/M2A junctions of **included** collections only (`pages_body`).

Forbidden on root: `Collection | null`, `optional?:`, inline types, `any` / `any[]` / `{}` / `never` / `void`. Sensitive omit-fields must be absent from interfaces.

Relations: M2O `string | Related`. O2M/M2M/M2A `number[] | Junction[]`. M2A junction: `collection` literal union; `item: string | A | B | ...`.

Literals: `"datetime"` / `"date"` / `"time"` / `"json"` / `"csv"`. Not `Date | string`. No stub `{ id: string }` when queries request `"*"`.

`createDirectus<Schema>` imports `Schema` from `types/schema.ts`. Do not redefine Schema in `config/directus.ts`.

```ts
// BAD
type Schema = { pages: PagesTypes[]; site_settings: SiteSettingsType }
date_created: Date | string
item: string | { id: string }

// GOOD
pages_body: PagesBodyJunction[]
date_created: "datetime"
item: string | FormBlock | HeroBlock
```
