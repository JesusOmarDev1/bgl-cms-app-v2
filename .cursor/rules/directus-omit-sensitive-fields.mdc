---
description: Omit sensitive Directus fields from TS types and queries (price, PII, user_*)
globs: types/**/*.ts,services/domain/db/**/*.ts
alwaysApply: false
---

# Omit sensitive Directus fields

These must **not exist** on Schema interfaces or query `fields`: `price`, `stock`, `rfc` / fiscal data, form-response payloads, `user_created`, `user_updated`, client/supplier PII (emails, phones of private parties). Public footer `emails`/`phones` stay if marked public.

Do not `fields: ["*"]` on collections whose `*` would return those columns. Never expand `user_*`. Inspector and repos must not request those keys. If Schema omits them, QueryFields will not suggest them.

Never put `directus_users`, sessions, or oauth collections on `Schema`.

```ts
// BAD
interface ProductsTypes {
  id: string;
  price: number;
  stock: number;
}
interface PagesTypes {
  user_created: string;
}

// GOOD
interface ProductsTypes {
  id: string;
  title: string;
  slug: string;
}
```
