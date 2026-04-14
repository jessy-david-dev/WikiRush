import Redis from "ioredis";

const url = process.env.REDIS_URL!;

// Client global pour publish/get (réutilisé entre les requêtes via le module cache Node.js)
const globalForRedis = globalThis as unknown as { redis: Redis | undefined };

export const redis =
  globalForRedis.redis ??
  new Redis(url, { lazyConnect: false, maxRetriesPerRequest: 3 });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

// Crée toujours un nouveau client pour subscribe (ioredis interdit de mixer pub et sub)
export function createSubscriber(): Redis {
  return new Redis(url, { lazyConnect: false, maxRetriesPerRequest: 3 });
}

export function roomChannel(code: string): string {
  return `room:${code}`;
}
