import { catchAsync } from '../utils/catchAsync';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import type { SummaryResponse, LowStockProduct } from '../models/reporting.dto';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

export const getSummary = catchAsync(async (req, res) => {
  const dateParam = req.query.date as string | undefined;

  let startOfDay: Date;
  let endOfDay: Date;

  if (dateParam) {
    const [year, month, day] = dateParam.split('-').map(Number);

    startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
  } else {
    const today = new Date();

    startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
      0,
    );

    endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999,
    );
  }

  const [
    totalProducts,
    totalCategories,
    totalLocations,
    totalUsers,
    inboundToday,
    outboundToday,
  ] = await Promise.all([
    prisma.products.count(),

    prisma.categories.count(),

    prisma.locations.count(),

    prisma.users.count(),

    prisma.stock_Movements.aggregate({
      where: {
        type: 'INBOUND',
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _sum: {
        quantity: true,
      },
    }),

    prisma.stock_Movements.aggregate({
      where: {
        type: 'OUTBOUND',
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      _sum: {
        quantity: true,
      },
    }),
  ]);

  const data: SummaryResponse = {
    totalProducts,
    totalCategories,
    totalLocations,
    totalStockInboundToday: inboundToday._sum.quantity ?? 0,
    totalStockOutboundToday: outboundToday._sum.quantity ?? 0,
    totalUsers,
  };

  res.status(200).json({
    success: true,
    message: 'Summary retrieved successfully',
    data,
  });
});

export const getLowStock = catchAsync(async (req, res) => {
  const {
    threshold = 10,
    page = 1,
    limit = 10,
  } = req.query as unknown as {
    threshold: number;
    page: number;
    limit: number;
  };

  const skip = (page - 1) * limit;

  const where = {
    stock: {
      lt: threshold,
    },
    isActive: true,
  };

  const [products, total] = await Promise.all([
    prisma.products.findMany({
      where,
      include: {
        category: {
          select: {
            name: true,
          },
        },
        location: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        stock: 'asc',
      },
      skip,
      take: limit,
    }),

    prisma.products.count({
      where,
    }),
  ]);

  const data: LowStockProduct[] = products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    stock: product.stock,
    minimumStock: product.minimumStock,
    categoryName: product.category.name,
    locationName: product.location.name,
  }));

  res.status(200).json({
    success: true,
    message: 'Low stock products retrieved successfully',
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});