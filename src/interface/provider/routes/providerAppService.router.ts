import { Router } from "express";
import { authMiddleware } from "../../middleware/auth.middleware";
import { providerAppServiceController } from "../providerAppService.controller";

const router = Router();

router.get('/', authMiddleware, providerAppServiceController.getAllAppServices);

export default router;
