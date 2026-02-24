import { Router } from "express";
import { Role } from "../../domain/enums/common.enum";
import { bookingController } from "./booking.controller";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get('/',
    authMiddleware,
    authorize(Role.ADMIN, Role.PROVIDER),
    bookingController.getBookings
);

export default router;