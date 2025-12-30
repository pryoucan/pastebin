import { Redis } from "@upstash/redis";
console.log("REDIS_URL =", process.env.REDIS_URL);
export const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
