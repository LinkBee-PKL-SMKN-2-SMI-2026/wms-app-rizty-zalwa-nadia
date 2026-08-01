import { Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { verifyAccessToken } from '../utils/jwt';
import { catchAsync } from '../utils/catchAsync';
import { AuthRequest } from '../types/auth.type';

export const authenticate = catchAsync(async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  //Cek is there header & formatnya "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Token tidak ditemukan atau format salah', 401);
  }

  //Ambil token
  const token = authHeader.split(' ')[1];

  //Verify token
  try {
    const payload = verifyAccessToken(token); //Asumsi verifyAccessToken ngembalikan payload
    // Simpan payload ke req.user
    req.user = payload; 
    next();
  } catch (error) {
    throw new AppError('Token tidak valid atau kadaluwarsa', 401);
  }
});
