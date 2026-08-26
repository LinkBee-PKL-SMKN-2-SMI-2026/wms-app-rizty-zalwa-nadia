import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { logActivity } from '../services/activity-log.service';
import {
  type CreateInboundRequest,
  type CreateOutboundRequest,
  type GetMovementHistoryRequest,
} from '../models/stock-movement.dto';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const createInbound = catchAsync(async (req, res) => {
  const { productId, quantity, notes } = req.body as CreateInboundRequest;

  const userId = req.user!.userId;

  // c3k product ada/ga
  const product = await prisma.products.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError('Produk tidak ditemukan', 404);
  }

  const result = await prisma.$transaction(async (tx) => {
    //Update stok
    const updatedProduct = await tx.products.update({
      where: { id: productId },
      data: {
        stock: {
          increment: quantity,
        },
      },
    });

    // Catat riwayat stock movement
    const movement = await tx.stock_Movements.create({
      data: {
        type: 'INBOUND',
        quantity,
        notes,
        userId,
        productId,
      },
    });

    return {
      movement,
      updatedProduct,
    };
  });

  await logActivity({
    userId,
    action: 'CREATE',
    entity: 'Stock_Movements',
    entityId: result.movement.id,
    detail: {
      type: 'INBOUND',
      productId,
      quantity,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Stock inbound berhasil dicatat',
    data: result.movement,
  });
});

export const createOutbound = catchAsync(async (req, res) => {
  const { productId, quantity, notes } = req.body as CreateOutboundRequest;

  const userId = req.user!.userId;

  const product = await prisma.products.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new AppError('Produk tidak ditemukan', 404);
  }

  // cek stok
  if (product.stock < quantity) {
    throw new AppError('Stok tidak mencukupi', 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    // Kurangi stok
    const updatedProduct = await tx.products.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });

    const movement = await tx.stock_Movements.create({
      data: {
        type: 'OUTBOUND',
        quantity,
        notes,
        userId,
        productId,
      },
    });

    return {
      movement,
      updatedProduct,
    };
  });

  await logActivity({
    userId,
    action: 'CREATE',
    entity: 'Stock_Movements',
    entityId: result.movement.id,
    detail: {
      type: 'OUTBOUND',
      productId,
      quantity,
    },
  });

  res.status(201).json({
    success: true,
    message: 'Stock outbound berhasil dicatat',
    data: result.movement,
  });
});

export const getMovementHistory = catchAsync(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    productId,
    type,
    startDate,
    endDate,
  } = req.query as unknown as GetMovementHistoryRequest;

  const skip = (page - 1) * limit;

  const where = {
    ...(productId ? { productId } : {}),

    ...(type ? { type } : {}),

    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate) } : {}),
          },
        }
      : {}),
  };

  const [movements, total] = await Promise.all([
    prisma.stock_Movements.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        product: {
          select: {
            name: true,
            sku: true,
          },
        },
        user: {
          select: {
            name: true,
          },
        },
      },
    }),

    prisma.stock_Movements.count({
      where,
    }),
  ]);

  res.status(200).json({
    success: true,
    message: 'History stock movement berhasil diambil',
    data: movements,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});
