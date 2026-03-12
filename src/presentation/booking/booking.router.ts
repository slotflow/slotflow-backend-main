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

router.get('/recent',
    authMiddleware,
    authorize(Role.USER),
    bookingController.checkBooking
);

router.get('/:bookingId',
    authMiddleware,
    authorize(Role.USER, Role.PROVIDER),
    bookingController.getBookingDetails
);

router.get('/:bookingId/access',
    authMiddleware,
    authorize(Role.USER, Role.PROVIDER),
    bookingController.validateRoomId
);

router.patch('/:roomId/join-left', 
    authMiddleware, 
    authorize(Role.USER, Role.PROVIDER),
    bookingController.joinOrLeftRoom
);

router.post('/', 
    authMiddleware, 
    authorize(Role.USER),
    bookingController.bookingCheckout
);

router.patch('/:bookingId', 
    authMiddleware, 
    authorize(Role.USER),
    bookingController.cancelBooking
);

router.patch('/:bookingId/change-status', 
    authMiddleware, 
    authorize(Role.PROVIDER),
    bookingController.updateBookingAppointmentStatus
);

export default router;