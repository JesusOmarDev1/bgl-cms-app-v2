import "server-only"
import Redis from "ioredis"

const REDIS_URL = process.env.REDIS_URL
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
