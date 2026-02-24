import { Router } from "express";
import { Role } from "../../domain/enums/common.enum";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { subscriptionController } from "./subscription.controller";

const router = Router();

router.get('/', 
    authMiddleware, 
    authorize(Role.ADMIN, Role.PROVIDER), 
    subscriptionController.getSubscriptions
);

router.get('/:subscriptionId', 
    authMiddleware, 
    authorize(Role.ADMIN, Role.PROVIDER), 
    subscriptionController.getSubscriptionDetails
);

export default router;