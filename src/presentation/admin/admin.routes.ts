import { Router } from "express";
import { adminUserController } from "./adminUser.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminServiceController } from "./adminService.controller";
import { adminPaymentController } from "./adminPayment.controller";
import { adminProviderController } from "./adminProvider.controller";

const router = Router();

router.get('/providers', authMiddleware, adminProviderController.getAllProviders);
router.patch('/providers/:providerId/approve', authMiddleware, adminProviderController.approveProvider);
router.patch('/providers/:providerId/reject', authMiddleware, adminProviderController.rejectProvider);
router.patch('/providers/:providerId/block', authMiddleware, adminProviderController.changeProviderBlockStatus);
router.patch('/providers/:providerId/trust-tag', authMiddleware, adminProviderController.changeProviderTrustedTag);
router.get('/providers/:providerId/address', authMiddleware, adminProviderController.fetchProviderAddress);
router.get('/providers/:providerId/service', authMiddleware, adminProviderController.fetchProviderService);
router.get('/providers/:providerId/availability', authMiddleware, adminProviderController.fetchProviderServiceAvailability);
router.get('/providers/:providerId/proofs', authMiddleware, adminProviderController.fetchProviderProofs);

router.get('/users', authMiddleware, adminUserController.getAllUsers);
router.get('/users/:userId/profile', authMiddleware, adminUserController.fetchUserDetails);
router.get('/users/:userId/address', authMiddleware, adminUserController.fetchUserAddress);
router.patch('/users/:userId', authMiddleware, adminUserController.changeUserBlockStatus);

router.get('/services', authMiddleware, adminServiceController.getAllServices);
router.post('/services', authMiddleware, adminServiceController.createService);
router.patch('/services/:serviceId', authMiddleware, adminServiceController.changeServiceBlockStatus);

router.get('/payments', authMiddleware, adminPaymentController.getAllPayments);
router.get('/reports/revenue', authMiddleware, adminPaymentController.fetchRevenueReport);

export default router;