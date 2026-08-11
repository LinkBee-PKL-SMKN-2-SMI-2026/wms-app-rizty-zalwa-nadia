import { z } from 'zod';
import {
  CreateCategorySchema,
  GetAllCategorySchema,
  GetCategoryByIdSchema,
  UpdateCategorySchema,
  DeleteCategorySchema,
} from '../validations/category.validation';

export type CreateCategoryRequest = z.infer<typeof CreateCategorySchema>['body'];
export type GetAllCategoryRequest = z.infer<typeof GetAllCategorySchema>['query'];
export type GetCategoryByIdRequest = z.infer<typeof GetCategoryByIdSchema>['params'];
export type UpdateCategoryRequest = z.infer<typeof UpdateCategorySchema>['body'];
export type UpdateCategoryParams = z.infer<typeof UpdateCategorySchema>['params'];
export type DeleteCategoryRequest = z.infer<typeof DeleteCategorySchema>['params'];