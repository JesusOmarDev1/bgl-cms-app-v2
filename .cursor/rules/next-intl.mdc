---
description: next-intl static locale es; catalogs only assembled in i18n/request.ts
globs: i18n/**,app/**,components/**,services/**
alwaysApply: false
---

# next-intl

This app is single-locale. `getRequestConfig` uses `locale: "es"` with no cookie.

Catalogs live at `i18n/messages/es/<namespace>.json` and already wrap the namespace key. Import and spread them into `messages` in `i18n/request.ts` (do not wrap again):

```ts
messages: {
  ...(await import(`./messages/${locale}/email-validator.json`)).default,
}
```

Keep `<html lang="es-MX">`. Document language (`es-MX`) and next-intl locale (`es`) may differ.

`i18n/request.ts` is the only place that assembles the full message catalog. Direct imports of individual catalogs are allowed where a consumer needs them (for example, Storybook or error fallbacks).

- Client components: `useTranslations("<namespace>")`
- Server contexts: `await getTranslations("<namespace>")` from `next-intl/server`

Query files do not import `next-intl` or call `getTranslations`. The repository calls `getTranslations` and passes the string into the query.
