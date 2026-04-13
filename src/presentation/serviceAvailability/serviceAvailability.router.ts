import { Router } from "express";
import { Role } from "../../domain/enums/common.enum";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { serviceAvailabilityController } from "./serviceAvailability.controller";

const router = Router();

// provider create their service availability
router.post('/',
    authMiddleware,
    authorize(Role.PROVIDER),
    serviceAvailabilityController.createServiceAvailability
);

// provider get their service availability
router.get('/me',
    authMiddleware,
    authorize(Role.PROVIDER),
    serviceAvailabilityController.getServiceAvailability
);

export default router;