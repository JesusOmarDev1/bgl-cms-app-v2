export const isBrowser = typeof window !== "undefined"
export const isServer = !isBrowser
export const hasDocument = typeof document !== "undefined"
export const hasWindow = typeof window !== "undefined"
