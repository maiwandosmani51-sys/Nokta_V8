import type { Request, Response, NextFunction } from 'express';
import { createError } from '../utils/response';

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  const message = err instanceof Error ? err.message : 'Server error';
  res.status(500).json(createError(message));
}
