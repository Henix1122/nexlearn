import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRouter from './routes/auth';
import coursesRouter from './routes/courses';
import enrollmentsRouter from './routes/enrollments';
import reviewsRouter from './routes/reviews';
import certificatesRouter from './routes/certificates';
import paymentsRouter from './routes/payments';
import rateLimit from 'express-rate-limit';
import { getRedisClient } from './utils/redisClient';
import { logRequest } from './utils/logger';

dotenv.config();
const app = express();
// Attempt Redis connect early (non-fatal)
(async ()=>{ if(process.env.REDIS_URL){ try { await getRedisClient(); console.log('[cache] Redis connected'); } catch(e){ console.warn('[cache] Redis connect failed, falling back to memory cache:', (e as Error).message); } } else { console.log('[cache] REDIS_URL not set, using in-memory cache'); } })();
const prisma = new PrismaClient();

app.use(helmet({
  contentSecurityPolicy: false // can customize per route; disabled here for simplicity with external CDNs
}));
// Basic global rate limit
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));
// Minimal CSP header (adjust for stricter production)
app.use((_, res, next) => { res.setHeader('Content-Security-Policy', "default-src 'self'" ); next(); });
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));
if(process.env.LOG_LEVEL === 'debug') app.use(logRequest);

app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.use('/auth', authRouter);
app.use('/courses', coursesRouter);
app.use('/enrollments', enrollmentsRouter);
app.use('/reviews', reviewsRouter);
// Specific tighter rate limits for cert rendering
const certRenderLimiter = rateLimit({ windowMs: 5 * 60 * 1000, max: 50, standardHeaders: true, legacyHeaders: false });
app.use('/certificates/render', certRenderLimiter);
app.use('/certificates', certificatesRouter);
app.use('/payments', paymentsRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});

process.on('SIGINT', async () => {await prisma.$disconnect();process.exit(0);});
process.on('SIGTERM', async () => {await prisma.$disconnect();process.exit(0);});
