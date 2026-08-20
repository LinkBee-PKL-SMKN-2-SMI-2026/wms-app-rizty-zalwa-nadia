import { Router } from 'express';
import { getActivityLogs } from '../controllers/activity-log.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { validate } from '../middlewares/validate.middleware';
import { GetActivityLogsSchema } from '../validations/activity-log.validation';

const router = Router();

router.get('/', authenticate, validate(GetActivityLogsSchema), getActivityLogs);

export default router;