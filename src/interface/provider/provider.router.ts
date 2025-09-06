import multer from 'multer';
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { providerPlanController } from './providerPlan.controller';
import { providerUserController } from './providerUser.controller';
import { provideAddressController } from './providerAddress.controller';
import { providerServiceController } from './providerService.controller';
import { providerProfileController } from './providerProfile.controller';
import { providerPaymentController } from './providerPayment.controller';
import { providerBookingController } from './providerBooking.controller';
import { providerDashboardController } from './providerDashboardController';
import { providerAppServiceController } from './providerAppService.controller';
import { providerSubscriptionController } from './providerSubscription.controller';
import { providerServiceAvailabilityController } from './providerServiceAvailability.controller';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = Router();

router.post('/addresses', authMiddleware, provideAddressController.addAddress);
router.get('/address', authMiddleware, provideAddressController.getAddress);
router.patch('/addresses/:addressId', authMiddleware, provideAddressController.updateAddress);

router.get('/appservices', authMiddleware, providerAppServiceController.getAllAppServices);

router.get('/bookings', authMiddleware, providerBookingController.fetchBookingAppointments);
router.patch('/bookings/:bookingId', authMiddleware, providerBookingController.updateBookingAppointmentStatus);
router.get('/bookings/:bookingId/can-join', authMiddleware, providerBookingController.validateRoom);

router.post('/service', authMiddleware,upload.single('certificate'), providerServiceController.addServiceDetails);
router.get('/service', authMiddleware, providerServiceController.getServiceDetails);

router.post('/availabilities', authMiddleware, providerServiceAvailabilityController.addServiceAvailability);
router.get('/availability', authMiddleware, providerServiceAvailabilityController.getServiceAvailability);

router.get('/profile', authMiddleware, providerProfileController.getProfileDetails);
router.patch('/profile/image', authMiddleware,upload.single('profileImage'), providerProfileController.updateProfileImage);
router.patch('/profile', authMiddleware, providerProfileController.updateProviderInfo);

router.get('/plans', authMiddleware, providerPlanController.fetchAllPlans);

router.post('/subscriptions/checkout-session', authMiddleware, providerSubscriptionController.subscribe);
router.post('/subscriptions', authMiddleware, providerSubscriptionController.saveSubscription);
router.get('/subscriptions', authMiddleware, providerSubscriptionController.fetchProviderSubscriptions);
router.post('/subscriptions/trial', authMiddleware, providerSubscriptionController.subscribeToTrialPlan);

router.get('/payments', authMiddleware, providerPaymentController.getPayments);

router.get('/chat/users', authMiddleware, providerUserController.fetchUsersForChatSideBar);

router.get('/dashboard/stats', authMiddleware, providerDashboardController.getDashboardStats);
router.get('/dashboard/graph-data', authMiddleware, providerDashboardController.getDashboardGraphData);

export default router;  