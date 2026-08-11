import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';
import {
  CreateLocationSchema,
  GetAllLocationSchema,
  GetLocationByIdSchema,
  UpdateLocationSchema,
  DeleteLocationSchema,
} from '../validations/location.validation';
import {
  createLocation,
  getAllLocations,
  getLocationById,
  updateLocation,
  deleteLocation,
} from '../controllers/location.controller';

const router = Router();

router.post('/', authenticate, authorize('ADMIN'), validate(CreateLocationSchema), createLocation);
router.get('/', authenticate, validate(GetAllLocationSchema), getAllLocations);
router.get('/:id', authenticate, validate(GetLocationByIdSchema), getLocationById);
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(UpdateLocationSchema),
  updateLocation,
);
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(DeleteLocationSchema),
  deleteLocation,
);

router.all('/*path', (_req, res) => {
  res.status(405).json({
    success: false,
    message: 'Method not allowed',
  });
});

export default router;
