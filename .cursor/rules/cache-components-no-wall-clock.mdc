---
description: Cache Components — no wall clock during prerender
alwaysApply: true
---

# Cache Components — no wall clock during prerender

Process-relative ms. Wall clock (`new Date()` / `Date.now()`) is illegal during Cache Components prerender.

`cacheComponents: true` is on. Keep it on.

Next flags `new Date()` and `Date.now()` as `blocking-prerender-current-time`. `export const instant = false` does **not** bypass this.

Never call wall clock in server modules that can run while prerendering (loggers, query `catch` paths, RSC without `await connection()` first). Blast radius is every route that hits that code — not one page.

```ts
// BAD — Blocking Route if this runs during prerender
function formatTime(d = new Date()): string {
  return d.toISOString().slice(11, 19)
}
const now = Date.now()

// GOOD — telemetry / throttle (Next does not guard performance.now())
function formatTime(): string {
  return `${Math.floor(performance.now())}ms`
}
const now = performance.now()
```

Do **not**:

- `await connection()` inside a sync logger (or in `getRequestConfig` / root `<html>` / `<body>`)
- try/catch Next postpone errors to hide `new Date()`
- dynamize one route with `connection()` to mask a shared logger Date

`"use client"` may use `new Date()`. Request-time wall clock in a Server Component: `await connection()` **inside a `<Suspense>` child**, then Date is allowed.

Client display of CMS datetimes: parse the string from Directus; do not sample the live clock to format it during RSC prerender.
