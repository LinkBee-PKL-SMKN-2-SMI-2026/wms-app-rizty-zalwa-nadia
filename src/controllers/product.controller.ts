import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { PrismaClient } from '../generated/prisma/client';
import type { Prisma } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  type CreateProductRequest,
  type GetAllProductRequest,
  type GetProductByIdRequest,
  type UpdateProductRequest,
  type UpdateProductParams,
  type DeleteProductRequest,
} from '../models/product.dto';
import type { AuthRequest } from '../models/auth.model';
import { logActivity } from '../services/activity-log.service';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

// CREATE
export const createProduct = catchAsync(async (req: AuthRequest, res) => {
  const { name, sku, description, stock, minimumStock, categoryId, locationId } =
    req.body as CreateProductRequest;

  const userId = req.user?.userId;

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

  if (userId) {
    await logActivity({
      userId,
      action: 'CREATE',
      entity: 'Products',
      entityId: product.id,
      detail: {
        name,
        sku,
      },
    });
  }

  res.status(201).json({
    success: true,
    message: 'Produk berhasil dibuat',
    data: product,
  });
});

// GET ALL
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

  const orderBy: Prisma.ProductsOrderByWithRelationInput =
    sort === 'name_asc'
      ? { name: 'asc' }
      : sort === 'name_desc'
        ? { name: 'desc' }
        : sort === 'stock_asc'
          ? { stock: 'asc' }
          : sort === 'stock_desc'
            ? { stock: 'desc' }
            : { createdAt: 'desc' };

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

// GET BY ID
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

// UPDATE
export const updateProduct = catchAsync(async (req: AuthRequest, res) => {
  const { id } = req.params as UpdateProductParams;
  const { name, sku, description, minimumStock, categoryId, locationId, isActive } =
    req.body as UpdateProductRequest;

  const userId = req.user?.userId;

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

  if (userId) {
    await logActivity({
      userId,
      action: 'UPDATE',
      entity: 'Products',
      entityId: id,
      detail: {
        changes: {
          name,
          sku,
          description,
          minimumStock,
          categoryId,
          locationId,
          isActive,
        },
      },
    });
  }

  res.status(200).json({
    success: true,
    message: 'Produk berhasil diperbarui',
    data: updatedProduct,
  });
});

// DELETE
export const deleteProduct = catchAsync(async (req: AuthRequest, res) => {
  const { id } = req.params as DeleteProductRequest;
  const userId = req.user?.userId;

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

  if (userId) {
    await logActivity({
      userId,
      action: 'DELETE',
      entity: 'Products',
      entityId: id,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Produk berhasil dihapus',
  });
});

// GET PRODUCT STOCK
export const getProductStock = catchAsync(async (req, res) => {
  const { id } = req.params as { id: string };

  const product = await prisma.products.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      sku: true,
      stock: true,
      minimumStock: true,
    },
  });

  if (!product) {
    throw new AppError('Produk tidak ditemukan', 404);
  }

  let status: 'safe' | 'low' | 'out';

  if (product.stock === 0) {
    status = 'out';
  } else if (product.stock <= product.minimumStock) {
    status = 'low';
  } else {
    status = 'safe';
  }

  res.status(200).json({
    success: true,
    message: 'Informasi stok produk berhasil diambil',
    data: {
      productId: product.id,
      name: product.name,
      sku: product.sku,
      currentStock: product.stock,
      minimumStock: product.minimumStock,
      status,
    },
  });
});
