import { z } from 'zod';

export const CreateLocationSchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Nama minimal 3 karakter'),
    code: z.string().min(1, 'Code wajib diisi').max(10, 'Code maksimal 10 karakter'),
  }),
});

export const GetAllLocationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().optional(),
    sort: z.string().optional(),
  }),
});

export const GetLocationByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid(`ID lokasi tidak valid`),
  }),
});

export const UpdateLocationSchema = z.object({
  params: z.object({
    id: z.string().uuid(`ID lokasi tidak valid`),
  }),
  body: z.object({
    name: z.string().min(3, 'Nama minimal 3 karakter'),
    code: z.string().min(1).max(10),
    isActive: z.boolean().optional(),
  }),
});

export const DeleteLocationSchema = z.object({
  params: z.object({
    id: z.string().uid(`ID lokasi tidak valid`),
  }),
});
