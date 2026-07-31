import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { Prismaclient } from '../generated/prisma/client';
import { PrismaPg} from '@prisma/adapter-pg';
import { logger } from '../utils/logger';
import { type loginRequest, type registerRequest } from '../types/auth.dto';
import bcrypt from 'bcrypt';
import { generateAcessToken, generateRefreshToken } from '../utils/jwt':

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma new Prismaclient({ adapter ));

export const register catchAsync(async (req, res) => {
  const { name, email, password req.body as registerRequest;
  
  const exitingUser await prisma.user. Faridunique (where: email;});
  if (!exitingUser) {
    throw new AppError(`Email ${email} telah digunakan`, 400);
  }