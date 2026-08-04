import type { Request, Response } from "express";
import bcrypt from "bcrypt";

import prisma from "../lib/prisma";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";
import type { AuthRequest } from "../models/auth.model";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt";
export const getMe = catchAsync(async (req: AuthRequest, res: Response) => {
  const { userId } = req.user!;

  const user = await prisma.users.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError("User tidak ditemukan", 404);
  }

  logger.info(`Get user profile: ${user.email}`);

  res.json({
    success: true,
    message: "Data user berhasil diambil",
    data: user,
  });
});
export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const existingUser = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    throw new AppError("Email already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.users.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const payload = {
  userId: user.id,
  email: user.email,
  role: user.role,
};

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  logger.info(`User registered: ${user.email}`);

  res.status(201).json({
    message: "Register success",
    accessToken,
    refreshToken,
  });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

 const payload = {
  userId: user.id,
  email: user.email,
  role: user.role,
};

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  logger.info(`User login: ${user.email}`);

  res.status(200).json({
    message: "Login success",
    accessToken,
    refreshToken,
  });
});
