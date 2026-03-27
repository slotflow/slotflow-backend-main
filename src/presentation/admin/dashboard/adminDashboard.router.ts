import { Router } from "express";
import { Role } from "../../../domain/enums/common.enum";
import { authorize } from "../../middleware/authRole.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { dashboardController } from "./adminDashboard.controller";

const router = Router();

router.get('/users', 
    authMiddleware, 
    authorize(Role.ADMIN),
    dashboardController.fetchUserStats
);

router.get('/providers', 
    authMiddleware, 
    authorize(Role.ADMIN),
    dashboardController.fetchProviderStats
);

router.get('/subscriptions', 
    authMiddleware, 
    authorize(Role.ADMIN),
    dashboardController.fetchSubscriptionStats
);

router.get('/bookings', 
    authMiddleware, 
    authorize(Role.ADMIN),
    dashboardController.fetchBookingssStats
);

router.get('/graph', 
    authMiddleware, 
    authorize(Role.ADMIN),
    dashboardController.fetchGraphData
);

export default router;