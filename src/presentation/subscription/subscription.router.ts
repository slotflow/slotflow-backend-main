import { Router } from "express";
import { Role } from "../../domain/enums/common.enum";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { subscriptionController } from "./subscription.controller";

const router = Router();

// admin or provider get subscriptions
router.get('/',
    authMiddleware,
    authorize(Role.ADMIN, Role.PROVIDER),
    subscriptionController.getSubscriptions
);

// provider get subscribed plan
router.get('/me',
    authMiddleware,
    authorize(Role.PROVIDER),
    subscriptionController.getSubscribedPlan
);

// provider create subscription checkout session
router.post('/checkout/session',
    authMiddleware,
    authorize(Role.PROVIDER),
    subscriptionController.subscriptionCheckout
);

// provider subscribe to trial plan
router.post('/trial',
    authMiddleware,
    authorize(Role.PROVIDER),
    subscriptionController.subscribeToTrialPlan
);

// admin or provider get subscription details
router.get('/:subscriptionId',
    authMiddleware,
    authorize(Role.ADMIN, Role.PROVIDER),
    subscriptionController.getSubscriptionDetails
);

export default router;