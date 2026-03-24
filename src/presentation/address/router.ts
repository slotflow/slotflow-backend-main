import { Router } from "express";
import { addressController } from "./controller";
import { Role } from "../../domain/enums/common.enum";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/me",
    authMiddleware,
    authorize(Role.PROVIDER, Role.USER),
    addressController.getMyAddress
);

router.post('/',
    authMiddleware,
    authorize(Role.PROVIDER, Role.USER),
    addressController.createAddress
);

router.patch('/:addressId',
    authMiddleware,
    authorize(Role.PROVIDER, Role.USER),
    addressController.updateAddress
);

export default router;