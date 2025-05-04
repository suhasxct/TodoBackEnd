import { createClient } from "redis";

export const clientRedis = createClient({
  url: process.env.REDIS_URL,
});

const connectToRedis = async () => {
  if (!clientRedis.isOpen) {
    try {
      await clientRedis.connect();
      console.log("Connected to Redis successfully");
    } catch (error) {
      console.error("Error connecting to Redis:", error);
    }
  }
};

connectToRedis();
