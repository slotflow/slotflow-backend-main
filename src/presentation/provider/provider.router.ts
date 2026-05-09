import { Router } from 'express';
import { Role } from '../../domain/enums/common.enum';
import { authorize } from '../middleware/authRole.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { providerProfileController } from './provider.controller';
import { providerServiceController } from '../providerService/providerService.controller';
import { serviceAvailabilityController } from '../serviceAvailability/serviceAvailability.controller';

const router = Router();

// provider get profile details
router.get('/me',
    authMiddleware,
    authorize(Role.PROVIDER),
    providerProfileController.getProfileDetails
);

// provider update identity proof
router.patch('/me/identity',
    authMiddleware,
    authorize(Role.PROVIDER, Role.USER),
    providerProfileController.updateIdentityProof
);

// provider update service proof
router.patch('/me/service',
    authMiddleware,
    authorize(Role.PROVIDER, Role.USER),
    providerProfileController.updateServiceProof
);

// provider get proofs
router.get('/me/proofs',
    authMiddleware,
    authorize(Role.PROVIDER),
    providerProfileController.getProofs
);

// provider delete identity proof
router.delete('/me/identity',
    authMiddleware,
    authorize(Role.PROVIDER, Role.USER),
    providerProfileController.deleteIdentityProof
);

// 
router.delete('/me/service',
    authMiddleware,
    authorize(Role.PROVIDER, Role.USER),
    providerProfileController.deleteServiceProof
);

// provider request admin approval
router.patch('/me/approval',
    authMiddleware,
    authorize(Role.USER),
    providerProfileController.requestAdminApproval
);

// admin or user get providers service availability
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

// admin or user get provider details
router.get('/:providerId',
    authMiddleware,
    authorize(Role.ADMIN, Role.USER),
    providerProfileController.getProfileDetails
);

router.get('/',
    authMiddleware,
    authorize(Role.ADMIN),
    providerProfileController.getProviders
);

export default router;  