import { Router, Response } from 'express';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');
import { z } from 'zod';
import { AuthRequest, requireAuth } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

const reviewSchema = z.object({ courseId: z.string().cuid(), rating: z.number().int().min(1).max(5), text: z.string().min(5).max(1000) });

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const { courseId, rating, text } = parsed.data;
  const exists = await prisma.course.findUnique({ where: { id: courseId } });
  if (!exists) return res.status(404).json({ error: 'Course not found' });
  // Optional: ensure enrollment before review
  const enrollment = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: req.user!.id, courseId } } });
  if (!enrollment) return res.status(403).json({ error: 'Enroll first' });
  const review = await prisma.review.create({ data: { courseId, userId: req.user!.id, rating, text } });
  // recompute rating stats
  const agg = await prisma.review.aggregate({ where: { courseId }, _avg: { rating: true }, _count: { rating: true } });
  await prisma.course.update({ where: { id: courseId }, data: { ratingAverage: agg._avg.rating || 0, ratingCount: agg._count.rating } });
  res.status(201).json(review);
});

router.get('/course/:courseId', async (req, res) => {
  const { courseId } = req.params;
  const reviews = await prisma.review.findMany({ where: { courseId }, orderBy: { createdAt: 'desc' }, take: 50 });
  res.json(reviews);
});

export default router;
