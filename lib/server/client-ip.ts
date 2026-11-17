import "server-only"

import { headers } from "next/headers"

/** Trimmed, lowercased, IPv4-mapped IPv6 prefix removed; blank becomes undefined. */
function normalize(value: string | undefined): string | undefined {
  return (
    value
      ?.trim()
      .toLowerCase()
      .replace(/^::ffff:/, "") || undefined
  )
}

/**
 * Client IP for authentication: a multi-hop forwarding header cannot be
 * verified, so it yields undefined and every caller fails closed.
 */
export async function getClientIp(): Promise<string | undefined> {
  const forwarded = (await headers()).get("x-forwarded-for")
  if (forwarded?.includes(",")) return undefined
  return normalize(forwarded ?? undefined)
}

/**
 * Last hop of the forwarding header, for public rate limits where a false
 * positive blocks a real lead. It never rejects a multi-hop header, which is
 * why authentication must not use it.
 */
export async function getClientIpTrusted(): Promise<string | undefined> {
  return normalize((await headers()).get("x-forwarded-for")?.split(",").at(-1))
}
