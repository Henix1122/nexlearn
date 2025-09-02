// Redis client (ensure redis package installed). Fallback handled by catching connection errors.
import { createClient } from 'redis';

let client: ReturnType<typeof createClient> | null = null;

export async function getRedisClient(){
  if(client) return client;
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  client = createClient({ url });
  client.on('error', (err: unknown) => console.error('Redis error', err));
  await client.connect();
  return client;
}

export async function redisGet(key: string){
  const c = await getRedisClient();
  return c.get(key);
}
export async function redisSet(key: string, value: string, ttlSeconds: number){
  const c = await getRedisClient();
  await c.set(key, value, { EX: ttlSeconds });
}
export async function redisGetBuffer(key: string){
  const c = await getRedisClient();
  const val = await c.get(key, { returnBuffers: true } as any);
  return val as unknown as Buffer | null;
}
export async function redisSetBuffer(key: string, value: Buffer, ttlSeconds: number){
  const c = await getRedisClient();
  await c.set(key, value, { EX: ttlSeconds });
}
