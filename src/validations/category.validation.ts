import { z } from 'zod';

export const CreateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(3, 'Nama minimal 3 karakter'),
    description: z.string().optional(),
  }),
});