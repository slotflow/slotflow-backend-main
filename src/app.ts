// import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import express from 'express';
// import client from 'prom-client';
import cookieParser from 'cookie-parser';
import s3Routes from './presentation/s3/routes';
import planRouter from './presentation/plan/router';
import authRoutes from './presentation/auth/routes';
import userRouter from './presentation/user/user.routes';
import googleRouter from './presentation/google/router';
import reviewRouter from './presentation/review/router';
import bookingRouter from './presentation/booking/router';
import addressRouter from './presentation/address/router';
import servicesRouter from './presentation/service/router';
import adminRoutes from './presentation/admin/admin.routes';
import sunscriptionRouter from './presentation/subscription/router';
import dashboardRouter from './presentation/admin/dashboard/router';
import providerRouter from './presentation/provider/provider.router';
import { errorHandler } from './presentation/middleware/error.middleware';
import serviceAvailabilityRouter from './presentation/serviceAvailability/router';

dotenv.config();

const app = express();

// const collectDefaultMetrics = client.collectDefaultMetrics;
// collectDefaultMetrics({ register: client.register });

// app.use(cors({
//     origin: "http://localhost:3000",
//     credentials: true,
//     allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
//     methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
// }));

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.get('/metrics', async (req, res) => {
//     res.setHeader('Content-Type', client.register.contentType);
//     const metrics = await client.register.metrics();
//     res.send(metrics);
// })

app.use('/api/s3',s3Routes); 
app.use('/api/auth',authRoutes);
app.use('/api/user',userRouter);
app.use('/api/plans',planRouter);
app.use('/api/admin',adminRoutes);
app.use('/api/google',googleRouter); 
app.use('/api/reviews',reviewRouter);
app.use('/api/bookings',bookingRouter);
app.use('/api/services',servicesRouter);
app.use('/api/addresses',addressRouter);
app.use('/api/provider',providerRouter); 
app.use('/api/dashboard',dashboardRouter);
app.use('/api/subscriptions',sunscriptionRouter);
app.use('/api/service-availability',serviceAvailabilityRouter);

app.use(errorHandler);

export default app;