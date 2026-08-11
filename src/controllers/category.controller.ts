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

export const getAllProducts = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    sort,
    categoryId,
    locationId,
  } = req.query as unknown as GetAllProductRequest;

  const skip = (page - 1) * limit;

  const where = {
    ...(search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
            {
              sku: {
                contains: search,
                mode: 'insensitive' as const,
              },
            },
          ],
        }
      : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(locationId ? { locationId } : {}),
  };

  let orderBy = {};

  if (sort === 'name_asc') {
    orderBy = { name: 'asc' };
  } else if (sort === 'name_desc') {
    orderBy = { name: 'desc' };
  } else if (sort === 'stock_asc') {
    orderBy = { stock: 'asc' };
  } else if (sort === 'stock_desc') {
    orderBy = { stock: 'desc' };
  } else {
    orderBy = { createdAt: 'desc' };
  }

  const [products, total] = await Promise.all([
    prisma.products.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        category: true,
        location: true,
      },
    }),
    prisma.products.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Data produk berhasil diambil',
    data: products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
