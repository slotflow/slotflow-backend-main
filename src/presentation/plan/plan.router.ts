import { Router } from "express";
import { planController } from "./plan.controller";
import { Role } from "../../domain/enums/common.enum";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, authorize(Role.ADMIN), planController.createPlan);

router.get("/", authMiddleware, authorize(Role.ADMIN, Role.PROVIDER), planController.getPlans);

router.patch(
  "/:planId/block",
  authMiddleware,
  authorize(Role.ADMIN),
  planController.changePlanBlockStatus,
);

router.post(
  "/:planId/resync",
  authMiddleware,
  authorize(Role.ADMIN),
  planController.resyncStripePlan,
);

router.get("/:planId", authMiddleware, authorize(Role.ADMIN), planController.getPlanDetails);

router.patch("/:planId", authMiddleware, authorize(Role.ADMIN), planController.updatePlan);

export default router;
