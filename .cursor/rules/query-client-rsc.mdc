---
description: Do not pass QueryClient from a Server Component
globs: app/layout.tsx,providers/**/*.tsx
alwaysApply: false
---

# QueryClient stays on the client

Never pass `new QueryClient()` (or `getQueryClient()`) from a Server Component into `QueryClientProvider`. It is a class instance and prerender fails:

`Only plain objects... can be passed to Client Components. {client: {}}`

Create the client inside a `"use client"` wrapper with `useState(() => new QueryClient())`.

```tsx
// providers/QueryProvider.tsx
"use client"
function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient())
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

Root layout imports `QueryProvider`, not `QueryClientProvider`.
