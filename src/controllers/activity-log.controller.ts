import type { Response } from 'express';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import type { AuthRequest } from '../models/auth.model';
import { catchAsync } from '../utils/catchAsync';
import type { GetActivityLogsQuery } from '../models/activity-log.dto';

export const getActivityLogs = catchAsync(
  async (req: AuthRequest, res: Response): Promise<void> => {
    const {
      page = 1,
      limit = 10,
      userId,
      action,
      entity,
      startDate,
      endDate,
    } = req.query as unknown as GetActivityLogsQuery;

    const where: Record<string, unknown> = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    if (entity) {
      where.entity = entity;
    }

    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate && {
          gte: new Date(startDate),
        }),
        ...(endDate && {
          lte: new Date(endDate),
        }),
      };
    }

    const [logs, total] = await Promise.all([
      prisma.activity_Logs.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.activity_Logs.count({
        where,
      }),
    ]);

    const data = logs.map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      detail: log.detail as Record<string, unknown> | null,
      userName: log.user.name,
      createdAt: log.createdAt,
    }));

    res.status(200).json({
      success: true,
      message: 'Activity logs berhasil diambil',
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  },
);
