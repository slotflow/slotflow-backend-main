import { Router } from "express";
import { Role } from "../../domain/enums/common.enum";
import { serviceAvailabilityController } from "./controller";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// provider create their service availability
router.post('/',
    authMiddleware,
    authorize(Role.PROVIDER),
    serviceAvailabilityController.createServiceAvailability
);

// provider fetch their service availability
router.get('/me',
    authMiddleware,
    authorize(Role.PROVIDER),
    serviceAvailabilityController.getServiceAvailability
);

export default router;