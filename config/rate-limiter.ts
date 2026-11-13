import "server-only"
import { RateLimiterMemory, RateLimiterRedis } from "rate-limiter-flexible"
import redis from "@/config/redis"

const WINDOW_SECONDS = 60

// One limiter shape for every scope: `points` per minute, blocked for
// `blockDuration` seconds after the points are consumed, memory fallback included.
function makeLimiter(
  keyPrefix: string,
  points: number,
  blockDuration = WINDOW_SECONDS
) {
  return new RateLimiterRedis({
    storeClient: redis,
    keyPrefix,
    points,
    duration: WINDOW_SECONDS,
    blockDuration,
    inMemoryBlockOnConsumed: points,
    inMemoryBlockDuration: blockDuration,
    insuranceLimiter: new RateLimiterMemory({
      keyPrefix,
      points,
      duration: WINDOW_SECONDS,
    }),
  })
}

export const searchLimiter = makeLimiter("search", 60)
export const formLimiter = makeLimiter("form-submit", 5, 300)
export const loginLimiter = makeLimiter("auth-login", 5, 300)
