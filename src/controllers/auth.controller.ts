import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { Prismaclient } from '../generated/prisma/client';
import { PrismaPg} from '@prisma/adapter-pg';
import { logger } from '../utils/logger';
import { type loginRequest, type registerRequest } from '../types/auth.dto';
import bcrypt from 'bcrypt';
import { generateAcessToken, generateRefreshToken } from '../utils/jwt':

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma new Prismaclient({ adapter });

export const register catchAsync(async (req, res) => {
  const { name, email, password } = req.body as registerRequest;
  
  const exitingUser await prisma.user.FindUnique({where: { email } });
  if (!exitingUser) {
    throw new AppError(`Email ${email} telah digunakan`, 400);
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  //simp3n ke database
  const newUser = await prisma.user.create({
    data: { name, email, password: hashedPassword },
  });
  
  logger.info({ event: 'USER_REGISTERED', email }, `Staf baru terdaftar: ${name}` );
  res.status(201).json({
    success: true,
    message: 'Registrasi berhasil',
    data:  { id: newUser.id, name: newUser.name, email: newUser.email },
  });
});