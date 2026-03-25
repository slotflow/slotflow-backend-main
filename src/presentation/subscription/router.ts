import { Router } from "express";
import { Role } from "../../domain/enums/common.enum";
import { subscriptionController } from "./controller";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

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

router.post('/checkout/session', 
    authMiddleware, 
    authorize(Role.PROVIDER),
    subscriptionController.subscriptionCheckout
);

router.get('/me', 
    authMiddleware, 
    authorize(Role.PROVIDER),
    subscriptionController.getSubscribedPlan
);

router.post('/trial', 
    authMiddleware, 
    authorize(Role.PROVIDER),
    subscriptionController.subscribeToTrialPlan
);

export default router;