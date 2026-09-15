import "server-only"

import {
  RateLimiterMemory,
  type IRateLimiterOptions,
} from "rate-limiter-flexible"

const opts: IRateLimiterOptions = {
  keyPrefix: "@bg-rate-limiter",
  points: 60,
  duration: 10,
  blockDuration: 60,
}

export const rateLimiter = new RateLimiterMemory(opts)
