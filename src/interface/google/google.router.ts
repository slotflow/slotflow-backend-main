import { Router } from "express";
import { googleController } from "./google.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get('/calendar',authMiddleware, googleController.getUserEvents);
router.get("/connect", authMiddleware, googleController.connectGoogle);

export default router;