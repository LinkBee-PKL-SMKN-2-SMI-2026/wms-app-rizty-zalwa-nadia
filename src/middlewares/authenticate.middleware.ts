import type { NextFunction, Response } from 'express';

import type { AuthRequest } from '../models/auth.model';
import { AppError } from '../utils/AppError';
import { verifyAccessToken } from '../utils/jwt';

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new AppError('Token tidak ditemukan', 401));
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(new AppError('Token tidak valid', 401));
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = payload;

    next();
  } catch {
    next(new AppError('Invalid or expired token', 401));
  }
};
