import { Router } from "express";
import { Role } from "../../../domain/enums/common.enum";
import { authorize } from "../../middleware/authRole.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { providerDashboardController } from "./providerDashboard.controller";

const router = Router();

router.get("/graph",
    authMiddleware,
    authorize(Role.PROVIDER),
    providerDashboardController.getDashboardGraphData
);

router.get("/",
    authMiddleware,
    authorize(Role.PROVIDER),
    providerDashboardController.getDashboardStats
);

export default router;