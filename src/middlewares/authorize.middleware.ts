import type { Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import type { AuthRequest } from '../models/auth.model';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export const authorize = (...roles: string[]) => {
  return async (req: AuthRequest, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }
    // Ambil role user dari database
    const user = await prisma.users.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return next(new AppError('User tidak ditemukan', 404));
    }

    if (!roles.includes(user.role)) {
      return next(new AppError('Forbidden: Anda tidak memiliki akses ke fitur ini', 403));
    }

    next();
  };
};
