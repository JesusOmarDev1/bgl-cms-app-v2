import {
  RateLimiterMemory,
  type IRateLimiterOptions,
} from "rate-limiter-flexible"

const opts: IRateLimiterOptions = {
  keyPrefix: "@bg-rate-limiter",
  points: 6,
  duration: 1,
  blockDuration: 60,
}

export const rateLimiter = new RateLimiterMemory(opts)
