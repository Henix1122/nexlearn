// Simple in-memory cache with TTL (placeholder for Redis integration)
// For production replace with Redis client implementing same interface
interface Entry { value: any; expires: number; }
// Expose the underlying map for advanced test operations (not recommended for app logic)
const store = new Map<string, Entry>();
export function getCacheStore(){ return store; }

export function setCache(key: string, value: any, ttlMs: number) {
  store.set(key, { value, expires: Date.now() + ttlMs });
}

export function getCache<T=any>(key: string): T | undefined {
  const e = store.get(key);
  if(!e) return undefined;
  if(Date.now() > e.expires){ store.delete(key); return undefined; }
  return e.value as T;
}

export function deleteCache(key: string){ store.delete(key); }

export function clearCache(){ store.clear(); }

export function makeEtag(content: string) {
  // Weak ETag style hash
  let hash = 0, i, chr;
  for (i = 0; i < content.length; i++) { chr = content.charCodeAt(i); hash = ((hash << 5) - hash) + chr; hash |= 0; }
  return 'W/"'+Math.abs(hash).toString(36)+'-'+content.length+'"';
}

import { Request, Response, NextFunction } from 'express';

export function cacheMiddleware(req: Request, res: Response, next: NextFunction){
  const key = req.originalUrl;
  const cached = getCache<{etag:string, body: string, contentType: string}>(key);
  if(cached){
    if(req.headers['if-none-match'] === cached.etag){ res.status(304).end(); return; }
    res.setHeader('ETag', cached.etag);
    res.setHeader('Content-Type', cached.contentType);
    res.send(cached.body);
    return;
  }
  // monkey-patch send to store
  const send = res.send.bind(res);
  res.send = (body: any) => {
    if(typeof body === 'string' && res.statusCode === 200){
      const etag = makeEtag(body);
      res.setHeader('ETag', etag);
      setCache(key, { etag, body, contentType: res.getHeader('Content-Type') as string || 'text/plain' }, 10 * 60 * 1000);
    }
    return send(body);
  };
  next();
}
