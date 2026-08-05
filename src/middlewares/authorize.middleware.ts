import type { Response, NextFunction } from 'express';

import type { AuthRequest } from '../models/auth.model';
import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';

export const authorize =
  (...roles: string[]) =>
  async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    try {
      const user = await prisma.users.findUnique({
        where: { id: req.user.userId },
      });

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      if (!roles.includes(user.role.toString())) {
        return next(new AppError('Forbidden', 403));
      }

      next();
    } catch (error) {
      next(error);
    }
  };
