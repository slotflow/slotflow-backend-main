import { Router } from "express";
import { Role } from "../../domain/enums/common.enum";
import { serviceController } from "./service.controller";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// admin or provider or user fetch services
router.get('/',
    authMiddleware,
    authorize(Role.ADMIN, Role.PROVIDER, Role.USER),
    serviceController.getServices
);

// admin create service
router.post('/',
    authMiddleware,
    authorize(Role.ADMIN),
    serviceController.createService
);

// admin block service
router.patch('/:serviceId',
    authMiddleware,
    authorize(Role.ADMIN),
    serviceController.changeServiceBlockStatus
);

export default router;