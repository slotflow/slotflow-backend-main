import { Router } from "express";
import upload from "../../../infrastructure/lib/multer";
import { authMiddleware } from "../../middleware/auth.middleware";
import { providerProfileController } from "../providerProfile.controller";

const router = Router();

router.get('/', authMiddleware, providerProfileController.getProfileDetails);

router.patch('/image', authMiddleware,upload.single('profileImage'), providerProfileController.updateProfileImage);

router.patch('/', authMiddleware, providerProfileController.updateProviderInfo);

export default router;