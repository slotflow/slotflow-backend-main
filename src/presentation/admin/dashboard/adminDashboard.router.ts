import { Router } from "express";
import { Role } from "../../../domain/enums/common.enum";
import { authorize } from "../../middleware/authRole.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { dashboardController } from "./adminDashboard.controller";

const router = Router();

router.get('/users', 
    authMiddleware, 
    authorize(Role.ADMIN),
    dashboardController.getUserStats
);

router.get('/providers', 
    authMiddleware, 
    authorize(Role.ADMIN),
    dashboardController.getProviderStats
);

router.get('/subscriptions', 
    authMiddleware, 
    authorize(Role.ADMIN),
    dashboardController.getSubscriptionStats
);

router.get('/bookings', 
    authMiddleware, 
    authorize(Role.ADMIN),
    dashboardController.getBookingssStats
);

router.get('/graph', 
    authMiddleware, 
    authorize(Role.ADMIN),
    dashboardController.getGraphData
);

export default router;