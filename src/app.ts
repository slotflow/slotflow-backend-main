import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import express from 'express';
// import client from 'prom-client';
import cookieParser from 'cookie-parser';
import s3Routes from './interface/s3/s3.routes';
import authRoutes from './interface/auth/auth.routes';
import userRouter from './interface/user/user.routes';
import adminRoutes from './interface/admin/admin.routes';
import googleRouter from './interface/google/google.router';
import providerRouter from './interface/provider/provider.router';
import { errorHandler } from './interface/middleware/error.middleware';

dotenv.config();

const app = express();

// const collectDefaultMetrics = client.collectDefaultMetrics;
// collectDefaultMetrics({ register: client.register });

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

// app.get('/metrics', async (req, res) => {
//     res.setHeader('Content-Type', client.register.contentType);
//     const metrics = await client.register.metrics();
//     res.send(metrics);
// })

app.use('/api/s3',s3Routes); 
app.use('/api/auth',authRoutes);
app.use('/api/user',userRouter);
app.use("/api/admin",adminRoutes);
app.use('/api/google',googleRouter); 
app.use('/api/provider',providerRouter); 
app.use(errorHandler);

export default app;