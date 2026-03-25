import { Router } from "express";
import { Role } from "../../../domain/enums/common.enum";
import { providerDashboardController } from "./controller";
import { authorize } from "../../middleware/authRole.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";

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