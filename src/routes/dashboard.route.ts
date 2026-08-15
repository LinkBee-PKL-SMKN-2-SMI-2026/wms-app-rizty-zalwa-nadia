import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.middleware';
import { validate } from '../middlewares/validate.middleware';
import { getDashboardStats, getRecentMovements } from '../controllers/dashboard.controller';
import {
  GetDashboardStatsSchema,
  GetRecentMovementsSchema,
} from '../validations/dashboard.validation';

const router = Router();

router.get('/stats', authenticate, validate(GetDashboardStatsSchema), getDashboardStats);

router.get(
  '/recent-movements',
  authenticate,
  validate(GetRecentMovementsSchema),
  getRecentMovements,
);

export default router;
