---
description: Expand every Directus relation in fields and type readers with the query result, not the schema union
globs: services/domain/db/**/*.ts,components/**/*.tsx
alwaysApply: false
---

# Expand Directus relations

The schema union is the unexpanded relation: `number | Junction` or `string | Related`. `title` is not on that union. Leave the union on the schema. Expand the relation in `fields`, then type the reader with the query result.

M2M: nest the junction field (`clients_id`, `brands_id`, `services_id`). M2A: nest `collection` and `item: { <collection>: [...] }` per `one_allowed_collections`. M2O: nest the object (`{ logo: ["*"] }`). A bare key or `["*"]` on the relation returns the PK.

Readers take `XQuery` (`ApplyQueryFields`) or `NonNullable<XQueryResult>`. Read `row.clients_id` or `row.item`. Do not read `title` on the junction row. Do not rebuild an array or check `status` / `active` to narrow the schema union. A missing optional file (`logo?.id`) may `return null`. That is a render skip.

```ts
// BAD — schema union, relation left as an id
function List({ data }: { data: ServicesButtonType }) {
  data.services.map((row) => row.title)
}
fields: ["*", { services: ["*"] }]

// GOOD
function List({ data }: { data: NonNullable<ServicesButtonQueryResult> }) {
  data.services?.map((row) => row.item?.title)
}
services: ["id", "collection", { item: { services: ["id", "title"] } }]
```
