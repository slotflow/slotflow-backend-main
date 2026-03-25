import { Router } from "express";
import { serviceController } from "./controller";
import { Role } from "../../domain/enums/common.enum";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get('/',
    authMiddleware,
    authorize(Role.ADMIN, Role.PROVIDER, Role.USER),
    serviceController.getServices
);

router.post('/',
    authMiddleware,
    authorize(Role.ADMIN),
    serviceController.createService
);

router.patch('/:serviceId',
    authMiddleware,
    authorize(Role.ADMIN),
    serviceController.changeServiceBlockStatus
);

export default router;