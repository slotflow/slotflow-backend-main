import { Router } from 'express';
import { Role } from '../../domain/enums/common.enum';
import { authorize } from '../middleware/authRole.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { addressController } from '../address/address.controller';
import { providerProfileController } from './provider.controller';
import { providerServiceController } from '../providerService/providerService.controller';
import { serviceAvailabilityController } from '../serviceAvailability/serviceAvailability.controller';

const router = Router();

// provider fetch profile details
router.get('/me',
    authMiddleware,
    authorize(Role.PROVIDER),
    providerProfileController.getProfileDetails
);

// provider update profile image
router.patch('/me/image',
    authMiddleware,
    authorize(Role.PROVIDER),
    providerProfileController.updateProfileImage
);

// provider update info
router.patch('/me',
    authMiddleware,
    authorize(Role.PROVIDER),
    providerProfileController.updateInfo
);

// provider update identity proof
router.patch('/me/identity',
    authMiddleware,
    authorize(Role.PROVIDER),
    providerProfileController.updateIdentityProof
);

// provider update service proof
router.patch('/me/service',
    authMiddleware,
    authorize(Role.PROVIDER),
    providerProfileController.updateServiceProof
);

// provider fetch proofs
router.get('/me/proofs',
    authMiddleware,
    authorize(Role.PROVIDER),
    providerProfileController.getProofs
);

// provider delete identity proof
router.delete('/me/identity',
    authMiddleware,
    authorize(Role.PROVIDER),
    providerProfileController.deleteIdentityProof
);

// 
router.delete('/me/service',
    authMiddleware,
    authorize(Role.PROVIDER),
    providerProfileController.deleteServiceProof
);

// provider request admin approval
router.patch('/me/approval',
    authMiddleware,
    authorize(Role.PROVIDER),
    providerProfileController.requestAdminApproval
);

// provider update push notification settings
router.patch('/me/notification-settings',
    authMiddleware,
    authorize(Role.PROVIDER),
    providerProfileController.updatePushNotification
);

// admin or user fetch provider details
router.get('/:providerId',
    authMiddleware,
    authorize(Role.ADMIN, Role.USER),
    providerProfileController.getProfileDetails
);

// admin or user fetch providers address
router.get('/:providerId/address',
    authMiddleware,
    authorize(Role.ADMIN, Role.USER),
    addressController.getAddress
);

// admin or user fetch providers service availability
router.get('/:providerId/service-availability',
    authMiddleware,
    authorize(Role.ADMIN, Role.USER),
    serviceAvailabilityController.getServiceAvailability
);

router.get('/:providerId/provider-service',
    authMiddleware,
    authorize(Role.ADMIN, Role.USER),
    providerServiceController.getServiceDetails
);

router.get('/chat',
    authMiddleware,
    authorize(Role.USER),
    providerProfileController.getProvidersForChat
);

router.get('/',
    authMiddleware,
    authorize(Role.ADMIN, Role.USER),
    providerProfileController.getProviders
);


router.patch('/:providerId/approve',
    authMiddleware,
    authorize(Role.ADMIN),
    providerProfileController.approveProvider
);

router.patch('/:providerId/reject',
    authMiddleware,
    authorize(Role.ADMIN),
    providerProfileController.rejectProvider
);

router.patch('/:providerId/block',
    authMiddleware,
    authorize(Role.ADMIN),
    providerProfileController.changeProviderBlockStatus
);

router.patch('/:providerId/trust-tag',
    authMiddleware,
    authorize(Role.ADMIN),
    providerProfileController.changeProviderTrustedTag
);

export default router;  