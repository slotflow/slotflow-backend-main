import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import express from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import authRoutes from './interface/auth/auth.routes';
import userRouter from './interface/user/user.routes';
import adminRoutes from './interface/admin/admin.routes';
import providerRouter from './interface/provider/provider.router';

import providerBookingRoutes from './interface/provider/routes/providerBooking.router';
import providerAddressRoutes from './interface/provider/routes/providerAddress.router';
import providerServicesRoutes from './interface/provider/routes/providerService.router';
import providerAppServicesRoutes from './interface/provider/routes/providerAppService.router';
import providerServiceAvailabilitiesRoutes from './interface/provider/routes/providerServiceAvailability.router';

dotenv.config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
}));

app.use(helmet());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/auth',authRoutes);
app.use("/api/admin",adminRoutes);
app.use('/api/user',userRouter);


app.use('/api/provider',providerRouter);

app.use('/api/provider/bookings',providerBookingRoutes);
app.use('/api/provider/addresses',providerAddressRoutes);
app.use('/api/provider/services',providerServicesRoutes);
app.use('/api/provider/appservices',providerAppServicesRoutes);
app.use('/api/provider/service-availabilities',providerServiceAvailabilitiesRoutes);

export default app;