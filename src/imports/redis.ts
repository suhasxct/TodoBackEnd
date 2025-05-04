import { createClient } from "redis";
export const clientRedis = createClient({
  url: process.env.REDIS_URL,
});
clientRedis.connect();
