---
description: Directus filter rules — underscore operators, nested relations, _and/_or, no _regex in API queries
globs: services/domain/db/queries/**/*.ts
alwaysApply: false
---

# Directus filter rules

Syntax is `{ field: { _op: value } }`. Never `filter: { status: "published" }` without an operator. Ops: `_eq`, `_neq`, `_in`, `_null`, `_nnull`, `_contains`, `_icontains`, `_empty`.

`_regex` is validation-permissions only — never in `readItems`. `_intersects*` is geometry-only. `_json` only on `"json"` fields.

`_some` / `_none` are O2M/M2M only (`_some` is default). M2O: nest fields. M2M: filter through the junction (`authors.authors_id.name`), never skip it.

`_and` / `_or` are arrays of rules. Nest logical ops with each other, not inside another field rule. Functions: `"year(date_created)": { _eq: 2026 }` — not `year: date_created`.

`$FOLLOW` only for reverse relations with no local alias. `$CURRENT_USER` / `$NOW` are not for this `staticToken` frontend. Filter `status: { _eq: "published" }`.

```ts
// BAD
filter: { status: "published" }
filter: { authors: { name: { _eq: "X" } } }
filter: { title: { regex: "foo" } }

// GOOD
filter: { status: { _eq: "published" }, slug: { _eq: slug } }
filter: { _and: [{ status: { _eq: "published" } }, { slug: { _eq: slug } }] }
```
