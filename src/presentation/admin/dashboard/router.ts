import { Router } from "express";
import { authorize } from "passport";
import { dashboardController } from "./controller";
import { Role } from "../../../domain/enums/common.enum";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.get('/today', 
    authMiddleware,
    authorize(Role.ADMIN),
    dashboardController.fetchTodaysData
);
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
router.get('/revenue', 
    authMiddleware, 
    authorize(Role.ADMIN),
    dashboardController.fetchRevenueStats
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