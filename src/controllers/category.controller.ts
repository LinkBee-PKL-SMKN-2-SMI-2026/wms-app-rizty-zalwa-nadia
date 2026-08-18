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
import type { AuthRequest } from '../models/auth.model';
import { logActivity } from '../services/activity-log.service';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

// CREATE
export const createCategory = catchAsync(async (req: AuthRequest, res) => {
  const { name, description } = req.body as CreateCategoryRequest;
  const userId = req.user?.userId;

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

  if (userId) {
    await logActivity({
      userId,
      action: 'CREATE',
      entity: 'Categories',
      entityId: category.id,
      detail: {
        name,
      },
    });
  }

  res.status(201).json({
    success: true,
    message: 'Kategori berhasil dibuat',
    data: category,
  });
});

// GET ALL
export const getAllCategories = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search, sort } = req.query as unknown as GetAllCategoryRequest;

  const skip = (page - 1) * limit;

  const where = {
    ...(search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {}),
  };

  const orderBy: {
    name?: 'asc' | 'desc';
    createdAt?: 'asc' | 'desc';
  } =
    sort === 'name_asc'
      ? { name: 'asc' }
      : sort === 'name_desc'
        ? { name: 'desc' }
        : sort === 'created_asc'
          ? { createdAt: 'asc' }
          : { createdAt: 'desc' };

  const [categories, total] = await Promise.all([
    prisma.categories.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    }),
    prisma.categories.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Data kategori berhasil diambil',
    data: categories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const getCategoryById = catchAsync(async (req, res) => {
  const { id } = req.params as GetCategoryByIdRequest;

  const category = await prisma.categories.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!category) {
    throw new AppError('Kategori tidak ditemukan', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Data kategori berhasil diambil',
    data: category,
  });
});

// UPDATE
export const updateCategory = catchAsync(async (req: AuthRequest, res) => {
  const { id } = req.params as UpdateCategoryParams;
  const { name, description, isActive } = req.body as UpdateCategoryRequest;
  const userId = req.user?.userId;

  const category = await prisma.categories.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError('Kategori tidak ditemukan', 404);
  }

  const duplicate = await prisma.categories.findFirst({
    where: {
      name,
      NOT: {
        id,
      },
    },
  });

  if (duplicate) {
    throw new AppError('Nama kategori sudah digunakan', 400);
  }

  const updatedCategory = await prisma.categories.update({
    where: { id },
    data: {
      name,
      description,
      isActive,
    },
  });

  if (userId) {
    await logActivity({
      userId,
      action: 'UPDATE',
      entity: 'Categories',
      entityId: id,
      detail: {
        changes: {
          name,
          description,
          isActive,
        },
      },
    });
  }

  res.status(200).json({
    success: true,
    message: 'Kategori berhasil diperbarui',
    data: updatedCategory,
  });
});

// DELETE
export const deleteCategory = catchAsync(async (req: AuthRequest, res) => {
  const { id } = req.params as DeleteCategoryRequest;
  const userId = req.user?.userId;

  const category = await prisma.categories.findUnique({
    where: { id },
  });

  if (!category) {
    throw new AppError('Kategori tidak ditemukan', 404);
  }

  const productCount = await prisma.products.count({
    where: {
      categoryId: id,
    },
  });

  if (productCount > 0) {
    throw new AppError('Kategori tidak dapat dihapus karena masih digunakan oleh produk', 400);
  }

  await prisma.categories.delete({
    where: { id },
  });

  if (userId) {
    await logActivity({
      userId,
      action: 'DELETE',
      entity: 'Categories',
      entityId: id,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Kategori berhasil dihapus',
  });
});
