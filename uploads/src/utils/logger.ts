import pino from 'pino';
import { Request, Response, NextFunction } from 'express';

const level = process.env.LOG_LEVEL || 'info';
export const logger = pino({ level, base: undefined, timestamp: pino.stdTimeFunctions.isoTime });

export function logRequest(req: Request, _res: Response, next: NextFunction){
  logger.debug({ method: req.method, url: req.originalUrl }, 'req');
  next();
}
