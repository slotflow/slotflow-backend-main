import { Router } from "express";
import { Role } from "../../../domain/enums/common.enum";
import { authorize } from "../../middleware/authRole.middleware";
import { authMiddleware } from "../../middleware/auth.middleware";
import { dashboardController } from "./adminDashboard.controller";

const router = Router();

router.get('/analytics/users-stats',
    authMiddleware,
    authorize(Role.ADMIN),
    dashboardController.getUserStats
);

router.get('/analytics/providers-stats',
    authMiddleware,
    authorize(Role.ADMIN),
    dashboardController.getProviderStats
);

router.get('/analytics/subscriptions-stats',
    authMiddleware,
    authorize(Role.ADMIN),
    dashboardController.getSubscriptionStats
);

router.get('/analytics/bookings-stats',
    authMiddleware,
    authorize(Role.ADMIN),
    dashboardController.getBookingssStats
);

router.get('/analytics/bookings-chart',
    authMiddleware,
    authorize(Role.ADMIN),
    dashboardController.getBookingsChartData
);

router.get('/analytics/role-chart',
    authMiddleware,
    authorize(Role.ADMIN),
    dashboardController.getUsersChartData
);

router.get('/analytics/subscription-chart',
    authMiddleware,
    authorize(Role.ADMIN),
    dashboardController.getSubscriptionsChartData
);

export default router;