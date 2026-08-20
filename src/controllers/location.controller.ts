import { catchAsync } from '../utils/catchAsync';
import { AppError } from '../utils/AppError';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { logActivity } from '../services/activity-log.service';
import {
  type CreateLocationRequest,
  type GetAllLocationRequest,
  type GetLocationByIdRequest,
  type UpdateLocationRequest,
  type UpdateLocationParams,
  type DeleteLocationRequest,
} from '../models/location.dto';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

//CRETAE
export const createLocation = catchAsync(async (req, res) => {
  const { name, code } = req.body as CreateLocationRequest;

  const existingName = await prisma.locations.findUnique({
    where: { name },
  });

  if (existingName) {
    throw new AppError('Nama lokasi sudah digunakan', 400);
  }

  const existingCode = await prisma.locations.findUnique({
    where: { code },
  });

  if (existingCode) {
    throw new AppError('Code lokasi sudah digunakan', 400);
  }

  const location = await prisma.locations.create({
    data: {
      name,
      code,
    },
  });

  const userId = req.user?.userId;

  if (userId) {
    await logActivity({
      userId,
      action: 'CREATE',
      entity: 'Locations',
      entityId: location.id,
      detail: {
        name,
        code,
      },
    });
  }

  res.status(201).json({
    success: true,
    message: 'Lokasi berhasil dibuat',
    data: location,
  });
});

//GET ALL
export const getAllLocations = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search, sort } = req.query as unknown as GetAllLocationRequest;

  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
          {
            code: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }
    : {};

  const orderBy =
    sort === 'name_asc'
      ? { name: 'asc' }
      : sort === 'name_desc'
        ? { name: 'desc' }
        : sort === 'code_asc'
          ? { code: 'asc' }
          : { createdAt: 'desc' };

  const [locations, total] = await Promise.all([
    prisma.locations.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    }),
    prisma.locations.count({ where }),
  ]);

  res.status(200).json({
    success: true,
    message: 'Data lokasi berhasil diambil',
    data: locations,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

//GET BY ID
export const getLocationById = catchAsync(async (req, res) => {
  const { id } = req.params as GetLocationByIdRequest;

  const location = await prisma.locations.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!location) {
    throw new AppError('Lokasi tidak ditemukan', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Data lokasi berhasil diambil',
    data: location,
  });
});

//UPDA3E
export const updateLocation = catchAsync(async (req, res) => {
  const { id } = req.params as UpdateLocationParams;
  const { name, code, isActive } = req.body as UpdateLocationRequest;

  const location = await prisma.locations.findUnique({
    where: { id },
  });

  if (!location) {
    throw new AppError('Lokasi tidak ditemukan', 404);
  }

  const duplicateName = await prisma.locations.findFirst({
    where: {
      name,
      NOT: { id },
    },
  });

  if (duplicateName) {
    throw new AppError('Nama lokasi sudah digunakan', 400);
  }

  const duplicateCode = await prisma.locations.findFirst({
    where: {
      code,
      NOT: { id },
    },
  });

  if (duplicateCode) {
    throw new AppError('Code lokasi sudah digunakan', 400);
  }

  const updatedLocation = await prisma.locations.update({
    where: { id },
    data: {
      name,
      code,
      isActive,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Lokasi berhasil diperbarui',
    data: updatedLocation,
  });
});

//DELETE
export const deleteLocation = catchAsync(async (req, res) => {
  const { id } = req.params as DeleteLocationRequest;

  const location = await prisma.locations.findUnique({
    where: { id },
  });

  if (!location) {
    throw new AppError('Lokasi tidak ditemukan', 404);
  }

  const productCount = await prisma.products.count({
    where: {
      locationId: id,
    },
  });

  if (productCount > 0) {
    throw new AppError('Lokasi tidak dapat dihapus karena masih digunakan oleh produk', 400);
  }

  await prisma.locations.delete({
    where: { id },
  });

  res.status(200).json({
    success: true,
    message: 'Lokasi berhasil dihapus',
  });
});
asil dihapus',
  });
});
