import app from "../../app";
import { Router } from 'express';
import s3Routes from '../s3/s3.routes';
import planRouter from '../plan/plan.router';
import authRoutes from '../auth/auth.routes';
import userRouter from '../user/user.routes';
import googleRouter from '../google/google.router';
import reviewRouter from '../review/review.router';
import bookingRouter from '../booking/booking.router';
import addressRouter from '../address/address.router';
import servicesRouter from '../service/service.router';
import providerRouter from '../provider/provider.router';
import subscriptionRouter from '../subscription/subscription.router';
import adminDashboardRouter from '../admin/dashboard/adminDashboard.router';
import providerServiceRouter from '../providerService/providerService.router';
import providerDashboardRouter from '../provider/dashboard/providerDashboard.router';
import serviceAvailabilityRouter from '../serviceAvailability/serviceAvailability.router';

const router = Router();

router.use('/s3', s3Routes);
router.use('/auth', authRoutes);
router.use('/users', userRouter);
router.use('/plans', planRouter);
router.use('/google', googleRouter);
router.use('/reviews', reviewRouter);
router.use('/bookings', bookingRouter);
router.use('/services', servicesRouter);
router.use('/addresses', addressRouter);
router.use('/providers', providerRouter);
router.use('/subscriptions', subscriptionRouter);
router.use('/admin-dashboard', adminDashboardRouter);
router.use('/provider-services', providerServiceRouter);
router.use('/provider-dashboard', providerDashboardRouter);
router.use('/service-availabilities', serviceAvailabilityRouter);

export default router;