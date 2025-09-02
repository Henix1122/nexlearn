import { Router, Response } from 'express';
import { PrismaClient, PaymentStatus } from '@prisma/client';
import { z } from 'zod';
import { AuthRequest, requireAuth } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

// Simulated Paystack init (would call Paystack API in production)
const initSchema = z.object({ purpose: z.string().min(3), amountCents: z.number().int().positive(), currency: z.string().default('USD') });
router.post('/init', requireAuth, async (req: AuthRequest, res: Response) => {
  const parsed = initSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const payment = await prisma.payment.create({ data: { userId: req.user!.id, amountCents: parsed.data.amountCents, currency: parsed.data.currency, purpose: parsed.data.purpose, status: 'INITIATED' as PaymentStatus } });
  // placeholder reference and redirect
  const providerRef = 'PYSTK_' + payment.id.slice(-8).toUpperCase();
  await prisma.payment.update({ where: { id: payment.id }, data: { providerRef } });
  res.status(201).json({ paymentId: payment.id, providerRef, redirectUrl: `/payments/mock-checkout/${providerRef}` });
});

// Simulated webhook (in production verify signature)
const webhookSchema = z.object({ providerRef: z.string(), status: z.enum(['SUCCESS','FAILED']) });
router.post('/webhook/paystack', async (req, res) => {
  const parsed = webhookSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: parsed.error.flatten() });
  const pay = await prisma.payment.findFirst({ where: { providerRef: parsed.data.providerRef } });
  if (!pay) return res.status(404).json({ error: 'Payment not found' });
  await prisma.payment.update({ where: { id: pay.id }, data: { status: parsed.data.status } });
  res.json({ ok: true });
});

export default router;
