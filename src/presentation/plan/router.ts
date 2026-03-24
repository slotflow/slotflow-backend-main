import { Router } from "express";
import { planController } from "./controller";
import { Role } from "../../domain/enums/common.enum";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get('/', 
    authMiddleware, 
    authorize(Role.ADMIN, Role.PROVIDER),
    planController.getPlans
);

router.post('/', 
    authMiddleware, 
    authorize(Role.ADMIN),
    planController.createPlan
);

router.patch('/:planId/block', 
    authMiddleware, 
    authorize(Role.ADMIN),
    planController.changePlanBlockStatus
);

export default router;