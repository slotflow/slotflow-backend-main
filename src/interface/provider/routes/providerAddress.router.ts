import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { provideAddressController } from '../providerAddress.controller';

const router = Router();

router.post('/', authMiddleware, provideAddressController.addAddress);

router.get('/', authMiddleware, provideAddressController.getAddress);

router.patch('/:addressId', authMiddleware, provideAddressController.updateAddress);

export default router;
