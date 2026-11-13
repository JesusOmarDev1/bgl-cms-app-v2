---
description: Directus JSON query — json()/_json only on schema json literals; never on M2A aliases
globs: types/**/*.ts,services/domain/db/queries/**/*.ts
alwaysApply: false
---

# Directus JSON query paths

`json(field, path)` and `_json` only when the Schema field is `"json"` (or `"json" | null`). `seo.keywords` is `"json"`. Do not type JSON columns as `string[]`.

Never use `json()` / `_json` on M2A or M2M aliases (`body`, `fields`, `content`). Those are relations, not JSON columns. Never `json(body, ...)`.

When using `json()`, `fields` must be `as const` or the `field_path_json` alias will not infer. Path syntax: dot plus `[n]`. Forbidden: `items[]`, `[*]`, `.*`, JSONPath predicates.

```ts
// BAD
fields: ["json(body, title)"]
keywords: string[]

// GOOD
keywords: "json"
// json() later, only on a real json column, with as const fields
```
