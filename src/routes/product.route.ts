import { Router } from 'express';

import { validate } from '../middlewares/validate.middleware';
import { authenticate } from '../middlewares/authenticate.middleware';
import { authorize } from '../middlewares/authorize.middleware';

import {
  CreateProductSchema,
  GetAllProductSchema,
  GetProductByIdSchema,
  UpdateProductSchema,
  DeleteProductSchema,
} from '../validations/product.validation';

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller';

const router = Router();

router.post('/', authenticate, authorize('ADMIN'), validate(CreateProductSchema), createProduct);

router.get('/', authenticate, validate(GetAllProductSchema), getAllProducts);

router.get('/:id', authenticate, validate(GetProductByIdSchema), getProductById);

router.put('/:id', authenticate, authorize('ADMIN'), validate(UpdateProductSchema), updateProduct);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  validate(DeleteProductSchema),
  deleteProduct,
);

router.all('/*path', (_req, res) => {
  res.status(405).json({
    success: false,
    message: 'Method not allowed',
  });
});

export default router;
