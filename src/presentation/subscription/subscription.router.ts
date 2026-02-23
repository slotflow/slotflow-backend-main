import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { subscriptionController } from "./subscription.controller";

const router = Router();

router.get('/', authMiddleware, subscriptionController.getSubscriptions);

router.get('/:subscriptionId', authMiddleware, subscriptionController.getSubscriptionDetails);

export default router;