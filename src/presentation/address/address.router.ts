import { Router } from "express";
import { Role } from "../../domain/enums/common.enum";
import { addressController } from "./address.controller";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// user or provider fetch their own address
router.get("/me",
    authMiddleware,
    authorize(Role.PROVIDER, Role.USER),
    addressController.getAddress
);

// user or provider create their address
router.post('/',
    authMiddleware,
    authorize(Role.PROVIDER, Role.USER),
    addressController.createAddress
);

// user or provider update their address
router.patch('/:addressId',
    authMiddleware,
    authorize(Role.PROVIDER, Role.USER),
    addressController.updateAddress
);

export default router;