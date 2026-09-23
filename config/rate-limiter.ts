import "server-only";
import { RateLimiterMemory, RateLimiterRedis } from "rate-limiter-flexible";
import redis from "@/config/redis";

const searchLimiterMemory = new RateLimiterMemory({
  keyPrefix: "search",
  points: 60,
  duration: 60,
});

export const searchLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: "search",
  points: 60,
  duration: 60,
  blockDuration: 60,
  inMemoryBlockOnConsumed: 60,
  inMemoryBlockDuration: 60,
  insuranceLimiter: searchLimiterMemory,
});
