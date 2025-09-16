import { Router } from "express";
import { adminUserController } from "./adminUser.Controller";
import { adminPlanController } from "./adminPlan.Controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { adminServiceController } from "./adminService.Controller";
import { adminPaymentController } from "./adminPayment.Controller";
import { adminProviderController } from "./adminProvider.controller";
import { adminDashboardController } from "./adminDashboard.controller";
import { adminSubscriptionController } from "./adminSubscription.Controller";

const router = Router();

router.get('/providers',authMiddleware, adminProviderController.getAllProviders);
router.patch('/providers/:providerId/approve',authMiddleware,adminProviderController.approveProvider);
router.patch('/providers/:providerId/block',authMiddleware,adminProviderController.changeProviderBlockStatus);
router.patch('/providers/:providerId/trust-tag', authMiddleware, adminProviderController.changeProviderTrustedTag);
router.get('/providers/:providerId/profile', authMiddleware, adminProviderController.fetchProviderDetails);
router.get('/providers/:providerId/address', authMiddleware, adminProviderController.fetchProviderAddress);
router.get('/providers/:providerId/service', authMiddleware, adminProviderController.fetchProviderService);
router.get('/providers/:providerId/availability', authMiddleware, adminProviderController.fetchProviderServiceAvailability);
router.get('/providers/:providerId/subscriptions', authMiddleware, adminProviderController.fetchProviderSubscriptions);
router.get('/providers/:providerId/payments', authMiddleware,adminProviderController.fetchProviderPayments);

router.get('/users',authMiddleware, adminUserController.getAllUsers);
router.patch('/users/:userId',authMiddleware,adminUserController.changeUserBlockStatus);

router.get('/services',authMiddleware, adminServiceController.getAllServices);
router.post('/services',authMiddleware,adminServiceController.addService);
router.patch('/services/:serviceId',authMiddleware, adminServiceController.changeServiceBlockStatus);

router.get('/plans', authMiddleware,adminPlanController.getAllPlans);
router.post('/plans', authMiddleware, adminPlanController.addNewPlan);
router.patch('/plans/:planId', authMiddleware, adminPlanController.changePlanBlockStatus);

router.get('/subscriptions', authMiddleware, adminSubscriptionController.getAllSubscriptions);
router.get('/subscriptions/:subscriptionId', authMiddleware, adminSubscriptionController.getSubscriptionDetails);

router.get('/payments', authMiddleware, adminPaymentController.getAllPayments);

router.get('/dashboard/today', authMiddleware, adminDashboardController.fetchTodaysData);
router.get('/dashboard/users', authMiddleware, adminDashboardController.fetchUserStats);
router.get('/dashboard/providers', authMiddleware, adminDashboardController.fetchProviderStats);
router.get('/dashboard/subscriptions', authMiddleware, adminDashboardController.fetchSubscriptionStats);
router.get('/dashboard/revenue', authMiddleware, adminDashboardController.fetchRevenueStats);
router.get('/dashboard/appointments', authMiddleware, adminDashboardController.fetchAppointmentsStats);
router.get('/dashboard/graph', authMiddleware, adminDashboardController.fetchAppointmentsStats); // TODO

export default router;