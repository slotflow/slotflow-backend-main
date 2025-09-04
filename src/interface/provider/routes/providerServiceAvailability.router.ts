import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { providerServiceAvailabilityController } from "../providerServiceAvailability.controller";

const router = Router();

router.post('/', authMiddleware, providerServiceAvailabilityController.addServiceAvailability);

router.get('/', authMiddleware, providerServiceAvailabilityController.getServiceAvailability);

export default router;