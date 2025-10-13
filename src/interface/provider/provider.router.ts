import { Router } from 'express';
import upload from '../../infrastructure/lib/multer';
import { authMiddleware } from '../middleware/auth.middleware';
import { providerPlanController } from './providerPlan.controller';
import { providerUserController } from './providerUser.controller';
import { provideAddressController } from './providerAddress.controller';
import { providerServiceController } from './providerService.controller';
import { providerProfileController } from './providerProfile.controller';
import { providerPaymentController } from './providerPayment.controller';
import { providerBookingController } from './providerBooking.controller';
import { providerDashboardController } from './providerDashboard.controller';
import { providerAppServiceController } from './providerAppService.controller';
import { providerSubscriptionController } from './providerSubscription.controller';
import { providerServiceAvailabilityController } from './providerServiceAvailability.controller';
import { providerReviewController } from './providerReview.controller';
import { providerStripeController } from './providerStripe.controller';

const router = Router();

router.post('/addresses', authMiddleware, provideAddressController.addAddress);
router.get('/address', authMiddleware, provideAddressController.getAddress);
router.patch('/addresses/:addressId', authMiddleware, provideAddressController.updateAddress);

router.get('/appservices', authMiddleware, providerAppServiceController.getAllAppServices);

router.get('/bookings', authMiddleware, providerBookingController.fetchBookingAppointments);
router.patch('/bookings/:bookingId', authMiddleware, providerBookingController.updateBookingAppointmentStatus);
router.get('/bookings/:bookingId/can-join', authMiddleware, providerBookingController.validateRoom);
router.patch('/bookings/:roomId/join-left', authMiddleware, providerBookingController.providerJoinRoom);
router.get('/bookings/:bookingId', authMiddleware, providerBookingController.fetchBookingDetails);

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
router.get('/subscriptions/:subscriptionId', authMiddleware, providerSubscriptionController.getSubscriptionDetails);

router.get('/payments', authMiddleware, providerPaymentController.getPayments);

router.get('/chat/users', authMiddleware, providerUserController.fetchUsersForChatSideBar);

router.get('/dashboard/stats', authMiddleware, providerDashboardController.getDashboardStats);
router.get('/dashboard/graph-data', authMiddleware, providerDashboardController.getDashboardGraphData);

router.get('/reviews', authMiddleware, providerReviewController.findAllReviews);
router.patch('/reviews/:reviewId', authMiddleware, providerReviewController.chnageReportReview);

router.post("/stripe/connect", authMiddleware, providerStripeController.connectStripe);

export default router;  