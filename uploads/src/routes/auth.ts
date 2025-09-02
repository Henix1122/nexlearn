import { Router, Request, Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();
const router = Router();

const passwordPolicy = {
  minLength: 10,
  requireUpper: true,
  requireLower: true,
  requireNumber: true,
  requireSymbol: true
};

function validatePassword(pw: string): string[] {
  const issues: string[] = [];
  if (pw.length < passwordPolicy.minLength) issues.push(`min length ${passwordPolicy.minLength}`);
  if (passwordPolicy.requireUpper && !/[A-Z]/.test(pw)) issues.push('missing uppercase');
  if (passwordPolicy.requireLower && !/[a-z]/.test(pw)) issues.push('missing lowercase');
  if (passwordPolicy.requireNumber && !/\d/.test(pw)) issues.push('missing number');
  if (passwordPolicy.requireSymbol && !/[!@#$%^&*(),.?":{}|<>]/.test(pw)) issues.push('missing symbol');
  return issues;
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(passwordPolicy.minLength),
  name: z.string().min(1).optional(),
  institution: z.string().optional()
});

router.post('/register', async (req: Request, res: Response) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const { email, password, name, institution } = parsed.data;
  const pwIssues = validatePassword(password);
  if (pwIssues.length) return res.status(400).json({ error: 'Weak password', details: pwIssues });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({ data: { email, passwordHash, name, institution } });
  return res.status(201).json({ id: user.id, email: user.email });
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

router.get('/password-policy', (_req: Request, res: Response) => {
  res.json(passwordPolicy);
});

router.post('/login', async (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return res.status(423).json({ error: 'Account locked. Try later.' });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    const attempts = user.failedLoginAttempts + 1;
    let lockData: any = { failedLoginAttempts: attempts };
    if (attempts >= 5) {
      lockData = { failedLoginAttempts: 0, lockedUntil: new Date(Date.now() + 15 * 60 * 1000) }; // 15 min lock
    }
    await prisma.user.update({ where: { id: user.id }, data: lockData });
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  await prisma.user.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '1h' });
  return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

// Simple admin seed route (DEV ONLY) - remove in production
router.post('/dev/seed-admin', async (_req: Request, res: Response) => {
  const adminEmail = 'admin@nexlearn.local';
  const exists = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (exists) return res.json({ ok: true });
  const passwordHash = await bcrypt.hash('AdminPass123!', 12);
  await prisma.user.create({ data: { email: adminEmail, passwordHash, role: Role.ADMIN, name: 'Administrator' } });
  res.json({ seeded: true });
});

export default router;
