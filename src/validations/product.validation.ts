import { z } from 'zod';

export const CreateProductSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Nama minimal 3 karakter'),
    sku: z.string().min(1, 'SKU wajib diisi'),
    description: z.string().optional(),
    stock: z.coerce.number().int().min(0),
    minimumStock: z.coerce.number().int().min(0),
    categoryId: z.string().uuid('Category ID tidak valid'),
    locationId: z.string().uuid('Location ID tidak valid'),
  }),
});

export const GetAllProductSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    sort: z.string().optional(),
    categoryId: z.string().uuid().optional(),
    locationId: z.string().uuid().optional(),
  }),
});

export const GetProductByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID produk tidak valid'),
  }),
});

export const UpdateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID produk tidak valid'),
  }),
  body: z.object({
    name: z.string().min(3),
    sku: z.string().min(1),
    description: z.string().optional(),
    minimumStock: z.coerce.number().int().min(0),
    categoryId: z.string().uuid(),
    locationId: z.string().uuid(),
    isActive: z.boolean().optional(),
  }),
});

export const DeleteProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID produk tidak valid'),
  }),
});
