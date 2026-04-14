import { Router } from "express";
import { Role } from "../../domain/enums/common.enum";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { providerServiceController } from "./providerService.controller";

const router = Router();

// provider create service details
router.post('/',
    authMiddleware,
    authorize(Role.PROVIDER),
    providerServiceController.createServiceDetails
);

// provider get service details
router.get('/me',
    authMiddleware,
    authorize(Role.PROVIDER, Role.USER),
    providerServiceController.getServiceDetails
);

// user search service providers
router.get('/',
    authMiddleware,
    authorize(Role.USER),
    providerServiceController.getProvidersServices
);

// provider update service details
router.patch('/:serviceId',
    authMiddleware,
    authorize(Role.PROVIDER),
    providerServiceController.updateServiceDetails
);

export default router;