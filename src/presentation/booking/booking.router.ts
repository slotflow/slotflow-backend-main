import { Router } from "express";
import { Role } from "../../domain/enums/common.enum";
import { bookingController } from "./booking.controller";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get('/',
    authMiddleware,
    authorize(Role.USER, Role.PROVIDER),
    bookingController.getBookings
);

router.get('/:bookingId/can-join',
    authMiddleware,
    authorize(Role.USER, Role.PROVIDER),
    bookingController.validateRoomId
);

router.get('/:bookingId',
    authMiddleware,
    authorize(Role.USER, Role.PROVIDER),
    bookingController.getBookingDetails
);

export default router;