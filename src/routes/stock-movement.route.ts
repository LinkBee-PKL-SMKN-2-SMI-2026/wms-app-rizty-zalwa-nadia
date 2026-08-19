import { Router } from 'express';

import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/authenticate.middleware';

import {
  CreateInboundSchema,
  CreateOutboundSchema,
  GetMovementHistorySchema,
} from '../validations/stock-movement.validation';

import {
  createInbound,
  createOutbound,
  getMovementHistory,
} from '../controllers/stock-movement.controller';

const router = Router();

router.post('/inbound', authenticate, validate(CreateInboundSchema), createInbound);

router.post('/outbound', authenticate, validate(CreateOutboundSchema), createOutbound);

router.get('/history', authenticate, validate(GetMovementHistorySchema), getMovementHistory);

export default router;
