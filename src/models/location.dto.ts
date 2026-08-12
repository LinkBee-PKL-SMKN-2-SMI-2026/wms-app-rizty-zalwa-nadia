import { z } from 'zod';
import {
  CreateLocationSchema,
  GetAllLocationSchema,
  GetLocationByIdSchema,
  UpdateLocationSchema,
  DeleteLocationSchema,
} from '../validations/location.validation';

export type CreateLocationRequest = z.infer<typeof CreateLocationSchema>['body'];
export type GetAllLocationRequest = z.infer<typeof GetAllLocationSchema>['query'];
export type GetLocationByIdRequest = z.infer<typeof GetLocationByIdSchema>['params'];
export type UpdateLocationRequest = z.infer<typeof UpdateaLocationSchema>['body'];
export type UpdateLocationParams = z.infer<typeof UpdateLocationSchema>['params'];
export type DeleteLocationRequest = z.infer<typeof DeleteLocationSchema>['params'];
