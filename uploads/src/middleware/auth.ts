import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request { user?: { id: string; role: string } }

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  // Test bypass: if NODE_ENV=test and a special header is provided, inject user
  if(process.env.NODE_ENV === 'test' || process.env.TEST_AUTH_BYPASS === '1'){
    const testUser = req.header('x-test-user');
    const testRole = req.header('x-test-role') || 'USER';
    if(testUser){
      req.user = { id: testUser, role: testRole };
      return next();
    }
  }
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret') as { id: string; role: string };
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export function requireRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}
