import { Router } from "express";
import { Role } from "../../domain/enums/common.enum";
import { bookingController } from "./booking.controller";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// user get recent booking
router.get('/recent',
    authMiddleware,
    authorize(Role.USER),
    bookingController.checkBooking
);

// user and provider get bookings
router.get('/',
    authMiddleware,
    authorize(Role.USER, Role.PROVIDER),
    bookingController.getBookings
);

// user and provider validate join room
router.get('/:bookingId/access',
    authMiddleware,
    authorize(Role.USER, Role.PROVIDER),
    bookingController.validateRoomId
);

// user and provider join or left room
router.patch('/:roomId/join-left',
    authMiddleware,
    authorize(Role.USER, Role.PROVIDER),
    bookingController.joinOrLeftRoom
);

// provider change booking status
router.patch('/:bookingId/change-status',
    authMiddleware,
    authorize(Role.PROVIDER),
    bookingController.updateBookingAppointmentStatus
);

// user and provider get booking details
router.get('/:bookingId/details',
    authMiddleware,
    authorize(Role.USER, Role.PROVIDER),
    bookingController.getBookingDetails
);

// user cancel booking
router.patch('/:bookingId/cancel',
    authMiddleware,
    authorize(Role.USER),
    bookingController.cancelBooking
);

// user booking checkout
router.post('/',
    authMiddleware,
    authorize(Role.USER),
    bookingController.bookingCheckout
);

export default router;