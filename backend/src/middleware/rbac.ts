import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      } as ApiResponse);
    }

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      } as ApiResponse);
    }

    next();
  };
};

export const requireSuperAdmin = requireRole('super_admin');
export const requireAdmin = requireRole('super_admin', 'admin');
export const requireTeacher = requireRole('super_admin', 'admin', 'teacher');
export const requireFamily = requireRole('super_admin', 'admin', 'teacher', 'family');