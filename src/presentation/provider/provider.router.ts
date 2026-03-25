import { Router } from 'express';
import { Role } from '../../domain/enums/common.enum';
import { addressController } from '../address/controller';
import { authorize } from '../middleware/authRole.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { providerUserController } from './providerUser.controller';
import { providerServiceController } from './providerService.controller';
import { providerProfileController } from './providerProfile.controller';
import { providerDashboardController } from './providerDashboard.controller';
import { serviceAvailabilityController } from '../serviceAvailability/controller';

const router = Router();

router.get('/me', authMiddleware, providerProfileController.getProfileDetails);
router.get('/:providerId', authMiddleware, providerProfileController.getProfileDetails);

router.patch('/profile/image', authMiddleware, providerProfileController.updateProfileImage);
router.patch('/profile/info', authMiddleware, providerProfileController.updateInfo);
router.patch('/profile/identity', authMiddleware, providerProfileController.updateIdentityProof);
router.patch('/profile/service', authMiddleware, providerProfileController.updateServiceProof);
router.get('/profile/proofs', authMiddleware, providerProfileController.fetchProofs);
router.patch('/profile/approval', authMiddleware, providerProfileController.requestAdminApproval);
router.delete('/profile/identity', authMiddleware, providerProfileController.deleteIdentityProof);
router.delete('/profile/service', authMiddleware, providerProfileController.deleteServiceProof);
router.patch('/profile/push-notification', authMiddleware, providerProfileController.updatePushNotification);

// admin or user fetch providers address
router.get('/:providerId/address', 
    authMiddleware,
    authorize(Role.ADMIN, Role.USER), 
    addressController.getAddress
);

router.post('/service', authMiddleware, providerServiceController.createServiceDetails);
router.get('/service', authMiddleware, providerServiceController.getServiceDetails);
router.patch('/service/:serviceId', authMiddleware, providerServiceController.updateServiceDetails);

// admin or user fetch providers service availability
router.get('/:providerId/service-availability', 
    authMiddleware, 
    authorize(Role.ADMIN, Role.USER), 
    serviceAvailabilityController.getServiceAvailability
);

router.get('/chat/users', authMiddleware, providerUserController.fetchUsersForChatSideBar);

router.get('/dashboard/stats', authMiddleware, providerDashboardController.getDashboardStats);
router.get('/dashboard/graph-data', authMiddleware, providerDashboardController.getDashboardGraphData);

export default router;  