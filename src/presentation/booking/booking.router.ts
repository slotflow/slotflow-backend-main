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

router.get('/check',
    authMiddleware,
    authorize(Role.USER),
    bookingController.checkBooking
);

// user
router.post('/checkout/session', 
    authMiddleware, 
    authorize(Role.USER),
    bookingController.bookingCheckout
);

// router.patch('/bookings/:bookingId', authMiddleware, userBookingController.cancelBooking);
// router.patch('/bookings/:roomId/join-left', authMiddleware, userBookingController.userJoinRoom);

// provider
// router.patch('/bookings/:bookingId', authMiddleware, providerBookingController.updateBookingAppointmentStatus);
// router.patch('/bookings/:roomId/join-left', authMiddleware, providerBookingController.providerJoinRoom);

export default router;