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

// router.post('/addresses', authMiddleware, provideAddressController.createAddress);
// router.get('/address', authMiddleware, provideAddressController.getAddress); // replaced with /me
// router.patch('/addresses/:addressId', authMiddleware, provideAddressController.updateAddress);

// router.post('/addresses', authMiddleware, userAddressController.createAddress);
// router.get('/address', authMiddleware, userAddressController.getAddress); // replaced with /me
// router.patch('/addresses/:addressId', authMiddleware, userAddressController.updateAddress);


export default router;