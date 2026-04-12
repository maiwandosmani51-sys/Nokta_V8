import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { createError } from '../utils/response';
import { protectedRoutes } from '../utils/roles';
import type { RoleType } from '../types.d';
import { User } from '../models/User';

export interface AuthPayload {
  userId: string;
  role: RoleType;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json(createError('Authentication required'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json(createError('Invalid token'));
  }
}

export function authorize(allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json(createError('Access denied'));
    }
    next();
  };
}

export function checkPermission(moduleKey: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    const userId = req.user?.userId;

    if (role === 'super_admin') {
      return next();
    }

    if (!userId) {
      return res.status(401).json(createError('Authentication required'));
    }

    const user = await User.findById(userId).lean<Record<string, any>>();
    if (!user) {
      return res.status(401).json(createError('Authentication required'));
    }

    const modulePermissions = (user.permissions as Map<string, unknown> | undefined)?.get(moduleKey) as string[] | undefined;
    if (Array.isArray(modulePermissions) && modulePermissions.includes(action)) {
      return next();
    }

    return res.status(403).json(createError('Forbidden'));
  };
}

export function permissionGuard(req: Request, res: Response, next: NextFunction) {
  const pathname = req.baseUrl;
  const allowed = Object.entries(protectedRoutes).find(([prefix]) => pathname.startsWith(prefix))?.[1];
  if (!allowed) {
    return next();
  }
  return authorize(allowed)(req, res, next);
}

export function studentFilter(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role === 'student') {
    (req as any).filter = { userId: req.user.userId };
  }
  next();
}
