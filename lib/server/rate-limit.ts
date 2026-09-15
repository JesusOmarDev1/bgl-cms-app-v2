import "server-only"

import { RateLimiterRes } from "rate-limiter-flexible"
import { rateLimiter } from "@/config/rate-limiter"

export type RateLimitConsumeResult =
  { ok: true } | { ok: false; msBeforeNext: number }

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for")
  if (forwardedFor) {
    const firstHop = forwardedFor.split(",")[0]?.trim()
    if (firstHop) return firstHop
  }

  const realIp = headers.get("x-real-ip")?.trim()
  if (realIp) return realIp

  return "unknown"
}

function deniedMsBeforeNext(error: unknown): number | null {
  if (error instanceof RateLimiterRes) {
    return error.msBeforeNext
  }

  if (typeof error !== "object" || error === null) {
    return null
  }

  if (
    !("msBeforeNext" in error) ||
    !("remainingPoints" in error) ||
    !("consumedPoints" in error)
  ) {
    return null
  }

  if (typeof error.msBeforeNext !== "number") {
    return null
  }

  return error.msBeforeNext
}

export async function tryConsume(ip: string): Promise<RateLimitConsumeResult> {
  try {
    await rateLimiter.consume(ip)
    return { ok: true }
  } catch (error) {
    const msBeforeNext = deniedMsBeforeNext(error)
    if (msBeforeNext === null) {
      throw error
    }

    return { ok: false, msBeforeNext }
  }
}
