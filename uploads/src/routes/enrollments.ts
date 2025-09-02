import { Router, Response } from 'express';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient } = require('@prisma/client');
import { z } from 'zod';
import { AuthRequest, requireAuth } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

router.post('/:courseId', requireAuth, async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;
  try {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    // check if existing enrollment
    const existing = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: req.user!.id, courseId } } });
    const enrollment = existing ? existing : await prisma.enrollment.create({ data: { userId: req.user!.id, courseId } });
    if(!existing){
      await prisma.course.update({ where: { id: courseId }, data: { enrollmentCount: { increment: 1 } } });
    }
    res.status(201).json(enrollment);
  } catch (e) { res.status(500).json({ error: 'Failed to enroll' }); }
});

const progressSchema = z.object({ progress: z.number().int().min(0).max(100) });
router.patch('/:courseId/progress', requireAuth, async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;
  const parsed = progressSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  try {
    const updated = await prisma.enrollment.update({ where: { userId_courseId: { userId: req.user!.id, courseId } }, data: { progress: parsed.data.progress } });
    res.json(updated);
  } catch { res.status(404).json({ error: 'Enrollment not found' }); }
});

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const enrollments = await prisma.enrollment.findMany({ where: { userId: req.user!.id }, include: { course: true } });
  res.json(enrollments);
});

export default router;
