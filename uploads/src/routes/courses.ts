import { Router, Request, Response } from 'express';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');
import { z } from 'zod';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { page = '1', pageSize = '24', q, category, level, sort } = req.query as Record<string,string>;
  const p = Math.max(1, parseInt(page));
  const ps = Math.min(100, Math.max(1, parseInt(pageSize)));
  const where:any = {};
  if(q){ where.OR = [
    { title: { contains: q, mode: 'insensitive' } },
    { description: { contains: q, mode: 'insensitive' } }
  ]; }
  if(category) where.category = category;
  if(level) where.level = level as any;
  let orderBy:any = { createdAt: 'desc' };
  if(sort){
    switch(sort){
      case 'new': orderBy = { createdAt: 'desc' }; break;
      case 'rating': orderBy = { ratingAverage: 'desc' }; break;
      case 'popular': orderBy = { enrollmentCount: 'desc' }; break;
      case 'price-asc': orderBy = { price: 'asc' }; break;
      case 'price-desc': orderBy = { price: 'desc' }; break;
    }
  }
  const [total, items] = await Promise.all([
    prisma.course.count({ where }),
    prisma.course.findMany({
      where,
      orderBy,
      skip: (p-1)*ps,
      take: ps,
      select: { id:true, title:true, slug:true, description:true, level:true, priceType:true, price:true, category:true, language:true, estimatedHours:true, thumbnailUrl:true, ratingAverage:true, ratingCount:true, enrollmentCount:true }
    })
  ]);
  res.json({ page: p, pageSize: ps, total, totalPages: Math.ceil(total/ps), items });
});

router.get('/:slug', async (req: Request, res: Response) => {
  const { slug } = req.params;
  const course = await prisma.course.findUnique({ where: { slug }, include: { modules: { orderBy: { index: 'asc' } } } });
  if (!course) return res.status(404).json({ error: 'Not found' });
  res.json(course);
});

const courseSchema = z.object({
  title: z.string().min(3),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().min(10),
  level: z.string(),
  priceType: z.string(),
  price: z.number().int().nonnegative().default(0)
});

router.post('/', requireAuth, requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  const parsed = courseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const existing = await prisma.course.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) return res.status(409).json({ error: 'Slug exists' });
  const course = await prisma.course.create({ data: parsed.data });
  res.status(201).json(course);
});

export default router;
