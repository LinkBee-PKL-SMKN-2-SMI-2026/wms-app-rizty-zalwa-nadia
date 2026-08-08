import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { verifyAccessToken } from '../utils/jwt';
import { AuthRequest } from '../models/auth.model';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Token tidak ditemukan atau format salah', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyAccessToken(token!);
    (req as AuthRequest).user = payload;

    next();
  } catch {
    return next(new AppError('Token tidak valid atau telah kadaluwarsa', 401));
  }
};
