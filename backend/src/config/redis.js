import { createClient } from 'redis';

export let redis;

export const redisConnection = async () => {
  const redisURI = process.env.REDIS_URI || 'redis://redis:6379';

  try {
    redis = createClient({ url: redisURI });
    await redis.connect();
  } catch (error) {
    throw new Error('Error al configurar redis ' + error.message);
  }
};

export const redisClose = async () => {
  if (redis) {
    await redis.disconnect();
  }
};
