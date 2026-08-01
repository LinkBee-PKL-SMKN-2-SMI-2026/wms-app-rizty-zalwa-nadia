import { Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { AuthRequest } from '../models/auth.model';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }
    // Ambil role user dari database berdasarkan req.user.userId
    const user = await prisma.users.findUnique({
      where: { id: req.user.userId },
    });
    
    // Jika role tidak ada di dalam array roles, lempar AppError 403
    if (!user) {
      return next(new AppError('User tidak ditemukan', 404));
    }
    
    //Cek apakah role user ada di dalam daftar roles yang diizinkan
    if (!roles.includes(user.role)) {
      return next(new AppError('Forbidden: Anda tidak memiliki akses ke fitur ini', 403));
    }
    
    controller
    next();
  };
};
