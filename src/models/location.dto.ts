import { z } from 'zod';
import {
  CreateLicationSchema,
  GetAllLocationSchema,
  GetLocationByIdSchema,
  UpdateLocationSchema,
  DeleteLocationSchema,
} from '../validations/location.validation';

export type CreateCategoryRequest = z.infer<typeof CreateLocationSchema>['body'];
export type GetAllCategoryRequest = z.infer<typeof GetAllLocationSchema>['query'];
export type GetCategoryByIdRequest = z.infer<typeof GetLocationByIdSchema>['params'];
export type UpdateCategoryRequest = z.infer<typeof UpdateaLocationSchema>['body'];
export type UpdateCategoryParams = z.infer<typeof UpdateLocationSchema>['params'];
export type DeleteCategoryRequest = z.infer<typeof DeleteLocationSchema>['params'];
