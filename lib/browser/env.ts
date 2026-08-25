export const isBrowser = typeof window !== "undefined"
export const isServer = !isBrowser
export const hasDocument = typeof document !== "undefined"
export const hasWindow = typeof window !== "undefined"

/** Accepts Next-inlined string env and next-env.d.ts boolean flags. */
export function isEnvFlagEnabled(value: unknown): boolean {
  return value === true || value === "true"
}
