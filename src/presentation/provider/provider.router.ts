import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { providerPlanController } from './providerPlan.controller';
import { providerUserController } from './providerUser.controller';
import { providerReviewController } from './providerReview.controller';
import { providerStripeController } from './providerStripe.controller';
import { provideAddressController } from './providerAddress.controller';
import { providerServiceController } from './providerService.controller';
import { providerProfileController } from './providerProfile.controller';
import { providerBookingController } from './providerBooking.controller';
import { providerDashboardController } from './providerDashboard.controller';
import { providerAppServiceController } from './providerAppService.controller';
import { providerSubscriptionController } from './providerSubscription.controller';
import { providerServiceAvailabilityController } from './providerServiceAvailability.controller';

const router = Router();

router.get('/', authMiddleware, providerProfileController.getProfileDetails);
router.patch('/profile/image', authMiddleware,providerProfileController.updateProfileImage);
router.patch('/profile/info', authMiddleware, providerProfileController.updateInfo);
router.patch('/profile/identity', authMiddleware, providerProfileController.updateIdentityProof);
router.patch('/profile/service', authMiddleware, providerProfileController.updateServiceProof);
router.get('/profile/proofs', authMiddleware,providerProfileController.fetchProofs);
router.patch('/profile/approval', authMiddleware, providerProfileController.requestAdminApproval);
router.delete('/profile/identity', authMiddleware, providerProfileController.deleteIdentityProof);
router.delete('/profile/service', authMiddleware, providerProfileController.deleteServiceProof);
router.patch('/profile/push-notification', authMiddleware, providerProfileController.updatePushNotification);

router.post('/addresses', authMiddleware, provideAddressController.createAddress);
router.get('/address', authMiddleware, provideAddressController.getAddress);
router.patch('/addresses/:addressId', authMiddleware, provideAddressController.updateAddress);

router.get('/appservices', authMiddleware, providerAppServiceController.getAllAppServices);

router.get('/bookings', authMiddleware, providerBookingController.fetchBookingAppointments);
router.patch('/bookings/:bookingId', authMiddleware, providerBookingController.updateBookingAppointmentStatus);
router.get('/bookings/:bookingId/can-join', authMiddleware, providerBookingController.validateRoom);
router.patch('/bookings/:roomId/join-left', authMiddleware, providerBookingController.providerJoinRoom);
router.get('/bookings/:bookingId', authMiddleware, providerBookingController.fetchBookingDetails);

router.post('/service', authMiddleware,providerServiceController.createServiceDetails);
router.get('/service', authMiddleware, providerServiceController.getServiceDetails);
router.patch('/service/:serviceId', authMiddleware, providerServiceController.updateServiceDetails);

router.post('/availabilities', authMiddleware, providerServiceAvailabilityController.createServiceAvailability);
router.get('/availability', authMiddleware, providerServiceAvailabilityController.getServiceAvailability);

router.get('/plans', authMiddleware, providerPlanController.fetchAllPlans);

router.post('/subscriptions/checkout/session', authMiddleware, providerSubscriptionController.subscribscriptionCheckout);
router.get('/subscriptions/me', authMiddleware, providerSubscriptionController.getSubscribedPlan);
router.post('/subscriptions/trial', authMiddleware, providerSubscriptionController.subscribeToTrialPlan);

router.get('/chat/users', authMiddleware, providerUserController.fetchUsersForChatSideBar);

router.get('/dashboard/stats', authMiddleware, providerDashboardController.getDashboardStats);
router.get('/dashboard/graph-data', authMiddleware, providerDashboardController.getDashboardGraphData);

router.get('/reviews', authMiddleware, providerReviewController.findAllReviews);
router.patch('/reviews/:reviewId', authMiddleware, providerReviewController.chnageReportReview);

router.post("/stripe/connect", authMiddleware, providerStripeController.connectStripe);

export default router;  