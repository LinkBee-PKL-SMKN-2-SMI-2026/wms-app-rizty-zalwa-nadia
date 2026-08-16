import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { startOfDay, subDays } from 'date-fns';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

// GET DASHBOARD STATS
export const getDashboardStats = async (req: Request, res: Response): Promise<Response> => {
  const period = (req.query.period as 'today' | 'week' | 'month') || 'week';

  let dateFilter: Date;

  switch (period) {
    case 'today':
      dateFilter = startOfDay(new Date());
      break;

    case 'month':
      dateFilter = subDays(new Date(), 30);
      break;

    case 'week':
    default:
      dateFilter = subDays(new Date(), 7);
      break;
  }

  const [productsOverview, inboundResult, outboundResult, movements, categoryDistribution] =
    await Promise.all([
      // Overview products
      prisma.products.findMany({
        where: {
          isActive: true,
        },
        select: {
          id: true,
          stock: true,
          minimumStock: true,
        },
      }),

      // Total inbound
      prisma.stock_Movements.aggregate({
        _sum: {
          quantity: true,
        },
        where: {
          type: 'INBOUND',
          createdAt: {
            gte: dateFilter,
          },
        },
      }),

      // Total outbound
      prisma.stock_Movements.aggregate({
        _sum: {
          quantity: true,
        },
        where: {
          type: 'OUTBOUND',
          createdAt: {
            gte: dateFilter,
          },
        },
      }),

      // Movement untuk top products
      prisma.stock_Movements.findMany({
        where: {
          createdAt: {
            gte: dateFilter,
          },
        },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
            },
          },
        },
      }),

      // Distribusi kategori
      prisma.categories.findMany({
        where: {
          isActive: true,
        },
        select: {
          name: true,
          products: {
            where: {
              isActive: true,
            },
            select: {
              stock: true,
            },
          },
        },
      }),
    ]);

  // Overview
  const totalProducts = productsOverview.length;

  const totalStock = productsOverview.reduce((total, product) => total + product.stock, 0);

  // stock < minimumStock
  const lowStockCount = productsOverview.filter(
    (product) => product.stock < product.minimumStock,
  ).length;

  // stock = 0
  const outOfStockCount = productsOverview.filter((product) => product.stock === 0).length;

  // Total movement
  const totalInbound = inboundResult._sum.quantity ?? 0;
  const totalOutbound = outboundResult._sum.quantity ?? 0;

  // Hitung total movement setiap product
  const movementMap = new Map<
    string,
    {
      id: string;
      name: string;
      sku: string;
      totalMovement: number;
    }
  >();

  for (const movement of movements) {
    const product = movement.product;

    const existing = movementMap.get(product.id);

    if (existing) {
      existing.totalMovement += movement.quantity;
    } else {
      movementMap.set(product.id, {
        id: product.id,
        name: product.name,
        sku: product.sku,
        totalMovement: movement.quantity,
      });
    }
  }

  // Top 5 products berdasarkan jumlah movement
  const topProducts = Array.from(movementMap.values())
    .sort((a, b) => b.totalMovement - a.totalMovement)
    .slice(0, 5);

  // Category distribution
  const formattedCategoryDistribution = categoryDistribution.map((category) => ({
    categoryName: category.name,
    productCount: category.products.length,
    totalStock: category.products.reduce((total, product) => total + product.stock, 0),
  }));

  return res.status(200).json({
    success: true,
    message: 'Dashboard stats retrieved successfully',
    data: {
      overview: {
        totalProducts,
        totalStock,
        lowStockCount,
        outOfStockCount,
      },
      movements: {
        totalInbound,
        totalOutbound,
        netMovement: totalInbound - totalOutbound,
      },
      topProducts,
      categoryDistribution: formattedCategoryDistribution,
    },
  });
};

// GET RECENT MOVEMENTS
export const getRecentMovements = async (req: Request, res: Response): Promise<Response> => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const [movements, total] = await Promise.all([
    prisma.stock_Movements.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    prisma.stock_Movements.count(),
  ]);

  return res.status(200).json({
    success: true,
    message: 'Recent movements retrieved successfully',
    data: movements,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};
