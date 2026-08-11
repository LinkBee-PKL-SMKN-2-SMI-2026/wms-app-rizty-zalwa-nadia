import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import {
  type CreateCategoryRequest,
  type GetAllCategoryRequest,
  type GetCategoryByIdRequest,
  type UpdateCategoryRequest,
  type UpdateCategoryParams,
  type DeleteCategoryRequest,
} from '../models/category.dto';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const createCategory = catchAsync(async (req, res) => {
  const { name, description } = req.body as CreateCategoryRequest;

  const existingCategory = await prisma.categories.findUnique({
    where: { name },
  });

  if (existingCategory) {
    throw new AppError('Nama kategori sudah digunakan', 400);
  }

  const category = await prisma.categories.create({
    data: {
      name,
      description,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Kategori berhasil dibuat',
    data: category,
  });
});
