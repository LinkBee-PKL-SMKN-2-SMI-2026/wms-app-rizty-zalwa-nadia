import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import {
  type CreateProductRequest,
  type GetAllProductRequest,
  type GetProductByIdRequest,
  type UpdateProductRequest,
  type UpdateProductParams,
  type DeleteProductRequest,
} from '../models/product.dto';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const createProduct = catchAsync(async (req, res) => {
  const { name, sku, description, stock, minimumStock, categoryId, locationId } =
    req.body as CreateProductRequest;

  const existingSku = await prisma.products.findUnique({
    where: { sku },
  });

  if (existingSku) {
    throw new AppError('SKU sudah digunakan', 400);
  }

  const category = await prisma.categories.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError('Kategori tidak ditemukan', 400);
  }

  const location = await prisma.locations.findUnique({
    where: { id: locationId },
  });

  if (!location) {
    throw new AppError('Lokasi tidak ditemukan', 400);
  }

  const product = await prisma.products.create({
    data: {
      name,
      sku,
      description,
      stock,
      minimumStock,
      categoryId,
      locationId,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Produk berhasil dibuat',
    data: product,
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

export const getProductById = catchAsync(async (req, res) => {
  const { id } = req.params as GetProductByIdRequest;

  const product = await prisma.products.findUnique({
    where: { id },
    include: {
      category: true,
      location: true,
    },
  });

  if (!product) {
    throw new AppError('Produk tidak ditemukan', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Data produk berhasil diambil',
    data: product,
  });
});

export const updateProduct = catchAsync(async (req, res) => {
  const { id } = req.params as UpdateProductParams;

  const { name, sku, description, minimumStock, categoryId, locationId, isActive } =
    req.body as UpdateProductRequest;

  const product = await prisma.products.findUnique({
    where: { id },
  });

  if (!product) {
    throw new AppError('Produk tidak ditemukan', 404);
  }

  const duplicateSku = await prisma.products.findFirst({
    where: {
      sku,
      NOT: { id },
    },
  });

  if (duplicateSku) {
    throw new AppError('SKU sudah digunakan', 400);
  }

  const category = await prisma.categories.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError('Kategori tidak ditemukan', 400);
  }

  const location = await prisma.locations.findUnique({
    where: { id: locationId },
  });

  if (!location) {
    throw new AppError('Lokasi tidak ditemukan', 400);
  }

  const updatedProduct = await prisma.products.update({
    where: { id },
    data: {
      name,
      sku,
      description,
      minimumStock,
      categoryId,
      locationId,
      isActive,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Produk berhasil diperbarui',
    data: updatedProduct,
  });
});

export const deleteProduct = catchAsync(async (req, res) => {
  const { id } = req.params as DeleteProductRequest;

  const product = await prisma.products.findUnique({
    where: { id },
  });

  if (!product) {
    throw new AppError('Produk tidak ditemukan', 404);
  }

  const movementCount = await prisma.stock_Movements.count({
    where: {
      productId: id,
    },
  });

  if (movementCount > 0) {
    throw new AppError('Produk tidak dapat dihapus karena memiliki stock movement', 400);
  }

  await prisma.products.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: 'Produk berhasil dihapus',
  });
});
