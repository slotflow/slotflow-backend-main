import { Router } from "express";
import upload from "../../../infrastructure/lib/multer";
import { authMiddleware } from "../../middleware/auth.middleware";
import { providerServiceController } from "../providerService.controller";

const router = Router();

router.post('/', authMiddleware,upload.single('certificate'), providerServiceController.addServiceDetails);

router.get('/', authMiddleware, providerServiceController.getServiceDetails);

export default router;