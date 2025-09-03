import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { providerBookingController } from '../providerBooking.controller';

const router = Router();

router.get('/', authMiddleware, providerBookingController.fetchBookingAppointments);

router.patch('/:bookingId', authMiddleware, providerBookingController.updateBookingAppointmentStatus);

router.get('/:bookingId/can-join', authMiddleware, providerBookingController.validateRoom);

export default router;  