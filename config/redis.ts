import "server-only"
import Redis from "ioredis"
import { REDIS_URL } from "@/lib/env/constants"

if (!REDIS_URL) {
  throw new Error("You must set REDIS_URL in the environment variables")
}

const redis = new Redis(REDIS_URL, {
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  lazyConnect: true,
})
redis.on("error", () => {})

export default redis
