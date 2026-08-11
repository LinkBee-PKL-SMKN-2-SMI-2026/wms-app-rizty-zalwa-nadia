import { z } from 'zod';

export const CreateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Nama minimal 3 karakter'),
    description: z.string().optional(),
  }),
});

export const GetAllCategorySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    sort: z.string().optional(),
  }),
});

export const GetCategoryByIdSchema = z.object({
 params: z.object({
  id: z.string().uuid(`ID kategori tidak valid`),
 }),
});

