import { Router } from 'express';
import { authController } from './controller';
import { googleAuthController } from './googleAuth.controller';

const router = Router();

router.post('/signup', authController.register);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resendOtp', authController.resendOtp);
router.post("/signin", authController.login);
router.post('/signout', authController.logout);
router.patch('/password',authController.updatePassword);
router.get('/google', googleAuthController.googleAuth);
router.get('/google/callback', googleAuthController.googleAuthCallback);

export default router;
 