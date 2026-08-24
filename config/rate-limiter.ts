import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: false,
  timeout: 30000,
  prefix: "@bglbasculas/ratelimit",
})

export default ratelimit
