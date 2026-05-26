import { Router } from "express";
import { Role } from "../../domain/enums/common.enum";
import { referralController } from "./referral.controller";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get('/me',
    authMiddleware,
    authorize(Role.USER, Role.PROVIDER),
    referralController.getReferralDetails
);

router.get('/',
    authMiddleware,
    authorize(Role.USER, Role.PROVIDER),
    referralController.getReferralsList
);

export default router;