import { Router, Response } from 'express';
// Use require to avoid build issues if generated types missing
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');
import { z } from 'zod';
import crypto from 'crypto';
import { AuthRequest, requireAuth } from '../middleware/auth';
import { cacheMiddleware, makeEtag, setCache, getCache, deleteCache } from '../utils/cache';
import PDFDocument from 'pdfkit';
import { redisGet, redisSet, redisGetBuffer, redisSetBuffer } from '../utils/redisClient';

const prisma = new PrismaClient();
const router = Router();

const issueSchema = z.object({ courseId: z.string().cuid() });

router.post('/issue', requireAuth, async (req: AuthRequest, res: Response) => {
  const parsed = issueSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const { courseId } = parsed.data;
  const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: req.user!.id, courseId } } });
  if (!enrollment || enrollment.progress < 100) return res.status(403).json({ error: 'Course incomplete' });
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return res.status(404).json({ error: 'Course not found' });
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  const serial = 'NXL-' + Date.now().toString(36).toUpperCase() + '-' + crypto.randomBytes(3).toString('hex').toUpperCase();
  const hash = crypto.createHash('sha256').update(serial + '|' + user!.id + '|' + course.id).digest('hex');
  const cert = await prisma.certificate.create({ data: { serial, userId: user!.id, courseId: course.id, planIssued: user!.plan as any, hash } });
  res.status(201).json({ serial: cert.serial, verifyUrl: `/certificates/verify/${cert.serial}` });
});

// Purge/invalidate certificate caches (admin only placeholder)
router.delete('/purge/:serial', requireAuth, async (req: AuthRequest, res: Response) => {
  // Simple role check; assuming req.user injected
  if(req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  const { serial } = req.params;
  // Nothing persisted besides caches: instruct clients to refetch by bumping a version header
  // For Redis we remove keys; for memory we rely on expiry (could add explicit delete if stored references maintained)
  try {
    const { getRedisClient } = require('../utils/redisClient');
    const redis = await getRedisClient();
    await redis.del(`/certificates/render/${serial}`, `/certificates/render/${serial}.pdf`, `/certificates/render/${serial}:etag`, `/certificates/render/${serial}.pdf:etag`);
  } catch(_) {}
  // remove from in-memory cache explicitly
  deleteCache(`/certificates/render/${serial}`);
  deleteCache(`/certificates/render/${serial}.pdf`);
  res.json({ purged: true, serial });
});

router.get('/verify/:serial', async (req, res) => {
  const { serial } = req.params;
  const cert = await prisma.certificate.findUnique({ where: { serial }, include: { user: true, course: true } });
  if (!cert) return res.status(404).json({ valid: false });
  res.json({ valid: true, serial: cert.serial, user: { id: cert.userId, email: cert.user.email }, course: { id: cert.courseId, title: cert.course.title }, issuedAt: cert.issuedAt, plan: cert.planIssued });
});

// Placeholder for a future certificate render (e.g., dynamic image/PDF). Could integrate Puppeteer or an image service.
// Lightweight HTML render; future: swap to PDF/image using Playwright/Puppeteer
router.get('/render/:serial', cacheMiddleware, async (req, res) => {
  const { serial } = req.params;
  const cert = await prisma.certificate.findUnique({ where: { serial }, include: { user: true, course: true } });
  if (!cert) return res.status(404).send('Not found');
  const html = `<!DOCTYPE html><html><head><meta charset='utf-8'><title>Certificate ${cert.serial}</title>
  <style>body{font-family:system-ui,-apple-system,sans-serif;background:#f8fafc;padding:40px;} .card{background:#fff;border:4px solid #4f46e5;padding:60px;max-width:900px;margin:0 auto;text-align:center;border-radius:12px;} h1{margin:0 0 4px;font-size:40px;} .muted{color:#64748b;font-size:14px;} .serial{margin-top:30px;font-size:11px;color:#475569;} .sig-row{display:flex;justify-content:space-between;margin-top:70px;font-size:12px;color:#475569} .sig{width:40%;border-top:1px solid #94a3b8;padding-top:8px;} </style></head><body>
  <div class='card'>
    <h1>NexLearn</h1>
    <p class='muted'>Certificate of Achievement</p>
    <p class='muted' style='margin-top:40px'>This certifies that</p>
  <h2 style='margin:4px 0;font-size:30px;'>${(cert.user.name || cert.user.email).replace(/[<>]/g,'')}</h2>
    <p class='muted' style='margin-top:30px'>has successfully completed the course</p>
  <h3 style='margin:6px 0 0;font-size:22px;'>${cert.course.title.replace(/[<>]/g,'')}</h3>
    <p class='muted' style='margin-top:30px'>Membership Tier Issued: ${cert.planIssued}</p>
  <p class='muted' style='margin-top:20px'>Issued on ${new Intl.DateTimeFormat((req.headers['accept-language']?.split(',')[0]) || 'en-US',{ dateStyle:'long' }).format(cert.issuedAt)}</p>
    <div class='sig-row'><div class='sig'>Instructor</div><div class='sig'>Director of Education</div></div>
    <div class='serial'>Serial: ${cert.serial} · Hash: ${cert.hash.substring(0,16)}…</div>
  </div>
  </body></html>`;
  res.setHeader('Content-Type','text/html; charset=utf-8');
  // Try Redis cache store manually (cacheMiddleware used only for in-memory ETag on subsequent hits)
  try { await redisSet(req.originalUrl, html, 600); } catch(_) {}
  res.send(html);
});

// PDF endpoint (headless browser). Caches binary in memory (replace with Redis / object store later)
router.get('/render/:serial.pdf', async (req, res) => {
  const { serial } = req.params;
  const cacheKey = req.originalUrl;
  // Prefer Redis first
  try {
    const redisBuf = await redisGetBuffer(cacheKey);
    const redisEtag = await redisGet(cacheKey+':etag');
    if(redisBuf && redisEtag){
      if(req.headers['if-none-match'] === redisEtag){ return res.status(304).end(); }
      res.setHeader('Content-Type','application/pdf');
      res.setHeader('ETag', redisEtag);
      return res.send(redisBuf);
    }
  } catch(_) {}
  const cached = getCache<{ etag: string; buffer: Buffer }>(cacheKey);
  if(cached){ if(req.headers['if-none-match'] === cached.etag){ return res.status(304).end(); } res.setHeader('Content-Type','application/pdf'); res.setHeader('ETag', cached.etag); return res.send(cached.buffer); }
  const cert = await prisma.certificate.findUnique({ where: { serial }, include: { user: true, course: true } });
  if(!cert) return res.status(404).json({ error: 'Not found' });
    const locale = (req.headers['accept-language']?.split(',')[0]) || 'en-US';
    const dateFmt = new Intl.DateTimeFormat(locale,{ dateStyle:'long' }).format(cert.issuedAt);
    const displayName = (cert.user.name || cert.user.email).replace(/[<>]/g,'');
    const courseTitle = cert.course.title.replace(/[<>]/g,'');
    const html = `<!DOCTYPE html><html><head><meta charset='utf-8'><title>${cert.serial}</title><style>body{font-family:system-ui,sans-serif;padding:60px;}h1{margin:0;font-size:38px;}h2{margin:0;font-size:26px;} .muted{color:#555;font-size:14px;} .card{border:4px solid #4f46e5;padding:50px;border-radius:12px;text-align:center;} .serial{margin-top:30px;font-size:11px;color:#555} .sig-row{display:flex;justify-content:space-between;margin-top:60px;font-size:12px;color:#333} .sig{width:40%;border-top:1px solid #999;padding-top:6px;} </style></head><body><div class='card'><h1>NexLearn</h1><p class='muted'>Certificate of Achievement</p><p class='muted' style='margin-top:40px'>This certifies that</p><h2 style='margin:4px 0;font-size:30px;'>${displayName}</h2><p class='muted' style='margin-top:30px'>has successfully completed the course</p><h3 style='margin:6px 0 0;font-size:22px;'>${courseTitle}</h3><p class='muted' style='margin-top:30px'>Membership Tier Issued: ${cert.planIssued}</p><p class='muted' style='margin-top:20px'>Issued on ${dateFmt}</p><div class='sig-row'><div class='sig'>Instructor</div><div class='sig'>Director of Education</div></div><div class='serial'>Serial: ${cert.serial} · Hash: ${cert.hash.substring(0,16)}…</div></div></body></html>`;
  const disablePlaywright = process.env.DISABLE_PDF_BROWSER === '1';
  if(!disablePlaywright){
    try {
      const { chromium } = require('playwright');
      const browser = await chromium.launch({ args: ['--no-sandbox'] });
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load' });
      const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      await browser.close();
      const etag = makeEtag(pdfBuffer.toString('binary'));
      setCache(cacheKey, { etag, buffer: pdfBuffer }, 60 * 60 * 1000);
      try { await redisSetBuffer(cacheKey, pdfBuffer, 3600); await redisSet(cacheKey+':etag', etag, 3600); } catch(_) {}
      res.setHeader('Content-Type','application/pdf');
      res.setHeader('ETag', etag);
      res.setHeader('Content-Disposition', `attachment; filename="${serial}.pdf"`);
      return res.send(pdfBuffer);
    } catch (e){
      console.warn('[certificates] Playwright PDF failed, falling back to streaming PDFKit:', (e as Error).message);
    }
  }
  // Streaming fallback with PDFKit (does not replicate styled HTML precisely but ensures availability)
  res.setHeader('Content-Type','application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${serial}.pdf"`);
  const doc = new PDFDocument({ margin: 60 });
  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer)=>chunks.push(c));
  doc.on('end', async ()=>{
    const buf = Buffer.concat(chunks);
    const etag = makeEtag(buf.toString('binary'));
    res.setHeader('ETag', etag);
    setCache(cacheKey, { etag, buffer: buf }, 60 * 60 * 1000);
    try { await redisSetBuffer(cacheKey, buf, 3600); await redisSet(cacheKey+':etag', etag, 3600); } catch(_) {}
    res.end(buf);
  });
  doc.fontSize(32).text('NexLearn', { align:'center' });
  doc.moveDown().fontSize(16).text('Certificate of Achievement', { align:'center' });
  doc.moveDown(2).fontSize(12).text('This certifies that', { align:'center' });
  doc.moveDown(0.5).fontSize(22).text(displayName, { align:'center' });
  doc.moveDown().fontSize(12).text('has successfully completed the course', { align:'center' });
  doc.moveDown(0.5).fontSize(18).text(courseTitle, { align:'center' });
  doc.moveDown().fontSize(10).text(`Membership Tier Issued: ${cert.planIssued}`, { align:'center' });
  doc.moveDown().fontSize(10).text(`Issued on ${dateFmt}`, { align:'center' });
  doc.moveDown(2).fontSize(8).text(`Serial: ${cert.serial}`, { align:'center' });
  doc.moveDown(0.5).fontSize(8).text(`Hash: ${cert.hash.substring(0,32)}…`, { align:'center' });
  doc.end();
});

// HEAD route for quick metadata presence (returns headers only if found)
router.head('/verify/:serial', async (req, res) => {
  const { serial } = req.params;
  const cert = await prisma.certificate.findUnique({ where: { serial } });
  if(!cert) return res.status(404).end();
  res.setHeader('X-Certificate-Serial', cert.serial);
  res.setHeader('X-Certificate-User', cert.userId);
  res.setHeader('X-Certificate-Course', cert.courseId);
  res.setHeader('Last-Modified', cert.issuedAt.toUTCString());
  res.status(200).end();
});

export default router;
