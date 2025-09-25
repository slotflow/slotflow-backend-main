import { Router } from "express";
import upload from "../../infrastructure/lib/multer";
import { authMiddleware } from "../middleware/auth.middleware";
import { userProfileController } from "./userProfile.controller";
import { userAddressController } from './userAddress.controller';
import { userPaymentController } from "./userPayment.controller";
import { userBookingController } from "./userBooking.controller";
import { userProviderController } from "./userProvider.controller";
import { userAppServiceController } from "./userAppService.controller";
import { userReviewController } from "./userReview.controller";

const router = Router();

router.get('/profile', authMiddleware, userProfileController.getProfileDetails);
router.post('/profile/image', authMiddleware, upload.single("profileImage"), userProfileController.updateProfileImage);
router.patch('/profile', authMiddleware, userProfileController.updateUserInfo);

router.post('/addresses', authMiddleware, userAddressController.addAddress);
router.get('/address', authMiddleware, userAddressController.getAddress);
router.patch('/addresses/:addressId', authMiddleware, userAddressController.updateAddress);

router.get('/appservices', authMiddleware, userAppServiceController.fetchAllAppService);

router.get('/providers', authMiddleware, userProviderController.fetchServiceProviders);
router.get('/providers/:providerId', authMiddleware, userProviderController.fetchServiceProviderProfileDetails);
router.get('/providers/:providerId/address', authMiddleware, userProviderController.fetchServiceProviderAddress);
router.get('/providers/:providerId/service', authMiddleware, userProviderController.fetchServiceProviderServiceDetails);
router.get('/providers/:providerId/availability', authMiddleware, userProviderController.fetchServiceProviderServiceAvailability);

router.post('/bookings/checkout-session', authMiddleware, userBookingController.createSessionIdForbookingViaStripe);
router.post('/bookings', authMiddleware, userBookingController.saveBookingAfterStripePayment);
router.get('/bookings', authMiddleware, userBookingController.fetchBookings);
router.patch('/bookings/:bookingId', authMiddleware, userBookingController.cancelBooking);
router.get('/bookings/:bookingId/can-join', authMiddleware, userBookingController.validateRoom);
router.patch('/bookings/:roomId/join-left', authMiddleware, userBookingController.userJoinRoom);

router.get('/payments', authMiddleware, userPaymentController.fetchPayments);

router.get('/chat/providers', authMiddleware, userProviderController.fetchProvidersForChatSidebar);

router.post('/reviews', authMiddleware, userReviewController.createReview);
router.get('/reviews', authMiddleware, userReviewController.findAllReviewsOfUser);
router.delete('/reviews/:reviewId', authMiddleware, userReviewController.deleteReview);

export default router;