import { Router } from "express";
import { Role } from "../../domain/enums/common.enum";
import { addressController } from "../address/controller";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { userProfileController } from "./userProfile.controller";
import { userProviderController } from "./userProvider.controller";
import { userAppServiceController } from "./userAppService.controller";

const router = Router();

router.get('/appservices', authMiddleware, userAppServiceController.fetchAllAppService);

router.get('/profile', authMiddleware, userProfileController.getProfileDetails);
router.post('/profile/image', authMiddleware, userProfileController.updateProfileImage);
router.patch('/profile', authMiddleware, userProfileController.updateUserInfo);
router.patch('/profile/push-notification', authMiddleware, userProfileController.updatePushNotification)

// admin fetch user address
router.get('/:userId/address',
    authMiddleware,
    authorize(Role.ADMIN),
    addressController.getAddress
);

router.get('/providers', authMiddleware, userProviderController.fetchServiceProviders);
router.get('/providers/:providerId/service', authMiddleware, userProviderController.fetchServiceProviderServiceDetails);
router.get('/providers/:providerId/availability', authMiddleware, userProviderController.fetchServiceProviderServiceAvailability);


router.get('/chat/providers', authMiddleware, userProviderController.fetchProvidersForChatSidebar);

export default router;