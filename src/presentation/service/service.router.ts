import { Router } from "express";
import { Role } from "../../domain/enums/common.enum";
import { serviceController } from "./service.controller";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// admin or provider or user get services
router.get(
  "/",
  authMiddleware,
  authorize(Role.ADMIN, Role.PROVIDER, Role.USER),
  serviceController.getServices,
);

// admin create service
router.post("/", authMiddleware, authorize(Role.ADMIN), serviceController.createServices);

// admin block service
router.patch(
  "/:serviceId/block",
  authMiddleware,
  authorize(Role.ADMIN),
  serviceController.changeServiceBlockStatus,
);

// admin update service
router.patch("/:serviceId", authMiddleware, authorize(Role.ADMIN), serviceController.updateService);

export default router;
