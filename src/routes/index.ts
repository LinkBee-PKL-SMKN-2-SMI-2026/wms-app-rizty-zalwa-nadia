import { Router } from 'express';
import auth from './auth.route';
import category from './category.route';
import location from './location.route';
import product from './product.route';
import movement from './stock-movement.route';
import report from './reporting.route';
import dashboard from './dashboard.route';
import activityLog from './activity-log.route';

const router = Router();

router.use('/auth', auth);
router.use('/categories', category);
router.use('/locations', location);
router.use('/products', product);
router.use('/movements', movement);
router.use('/reports', report);
router.use('/dashboard', dashboard);
router.use('/activity-logs', activityLog);

export default router;
