import { Router } from "express";
import { authController } from "./auth.controller";
import { googleAuthController } from "./googleAuth.controller";

const router = Router();

router.post("/signup", authController.register);

router.post("/verify-otp", authController.registerOtpVerification);

router.post("/resend-otp", authController.resendOtp);

router.post("/verify-email", authController.verifyEmail);

router.post("/verify-reset-otp", authController.verifyResetOtp);

router.patch("/password", authController.resetPassword);

router.post("/signin", authController.login);

router.post("/refresh", authController.refresh);

router.post("/signout", authController.logout);

router.get("/google", googleAuthController.googleAuth);

router.get("/google/callback", googleAuthController.googleAuthCallback);

export default router;
