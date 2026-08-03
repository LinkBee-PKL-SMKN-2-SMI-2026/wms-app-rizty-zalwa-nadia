import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { logger } from '../utils/logger';
import { type LoginRequest, type RegisterRequest } from '../models/auth.dto';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { TokenPayload } from '../types/auth.type';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export const register = catchAsync(async (req, res) => {
  const { name, email, password } = req.body as RegisterRequest;

  const existingUser = await prisma.users.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError(`Email ${email} telah digunakan`, 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  //simp3n ke database
  const newUser = await prisma.users.create({
    data: { name, email, password: hashedPassword },
  });

  logger.info({ event: 'USER_REGISTERED', email }, `Staf baru terdaftar: ${name}`);
  res.status(201).json({
    success: true,
    message: 'Registrasi berhasil',
    data: { id: newUser.id, name: newUser.name, email: newUser.email },
  });
});

export const login = catchAsync(async (req, res) => {
  //qmbil data frm req body
  const { email, password } = req.body as LoginRequest;

  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) {
    throw new AppError('Email atau password salah', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Email atau password salah', 401);
  }

  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  //nyimpen r3fresh token ke Database
  await prisma.users.update({
    where: { id: user.id },
    data: { refreshToken: refreshToken },
  });

  logger.info({ event: 'USER_LOGIN', email }, 'Staf berhasil login');
  res.status(200).json({
    success: true,
    message: 'Login berhasil',
    accessToken,
    refreshToken,
  });
});
