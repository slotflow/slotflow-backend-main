import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { googleCalendarController } from "./googleCalendar.controller";

const router = Router();

router.get('/calendar/:userId',authMiddleware, googleCalendarController.getUserEvents);

export default router;