import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { userProfileController } from "./userProfile.controller";
import { userAddressController } from './userAddress.controller';
import { userPaymentController } from "./userPayment.controller";
import { userProviderController } from "./userProvider.controller";
import { userAppServiceController } from "./userAppService.controller";
import { authorize } from "../middleware/authRole.middleware";
import { Role } from "../../domain/enums/common.enum";

const router = Router();

router.get('/appservices', authMiddleware, userAppServiceController.fetchAllAppService);

router.get('/profile', authMiddleware, userProfileController.getProfileDetails);
router.post('/profile/image', authMiddleware, userProfileController.updateProfileImage);
router.patch('/profile', authMiddleware, userProfileController.updateUserInfo);
router.patch('/profile/push-notification', authMiddleware, userProfileController.updatePushNotification)

router.post('/addresses', authMiddleware, userAddressController.createAddress);
router.patch('/addresses/:addressId', authMiddleware, userAddressController.updateAddress);

router.get('/:userId/address', 
    authMiddleware,
    authorize(Role.ADMIN), 
    userAddressController.getUserAddress
);

router.get('/providers', authMiddleware, userProviderController.fetchServiceProviders);
router.get('/providers/:providerId/service', authMiddleware, userProviderController.fetchServiceProviderServiceDetails);
router.get('/providers/:providerId/availability', authMiddleware, userProviderController.fetchServiceProviderServiceAvailability);

router.get('/payments', authMiddleware, userPaymentController.fetchPayments);

router.get('/chat/providers', authMiddleware, userProviderController.fetchProvidersForChatSidebar);

export default router;