import { Router } from "express";
import { userController } from "./user.controller";
import { Role } from "../../domain/enums/common.enum";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { addressController } from "../address/address.controller";

const router = Router();

// user fetch profile details
router.get('/me',
    authMiddleware,
    authorize(Role.USER),
    userController.getProfileDetails
);

// user update profile image
router.patch('/me/image',
    authMiddleware,
    authorize(Role.USER),
    userController.updateProfileImage
);

// user update user info
router.patch('/me',
    authMiddleware,
    authorize(Role.USER),
    userController.updateUserInfo
);

// user update push notification
router.patch('/me/notification-settings',
    authMiddleware,
    authorize(Role.USER),
    userController.updatePushNotification
)

// admin fetch user address
router.get('/:userId/address',
    authMiddleware,
    authorize(Role.ADMIN),
    addressController.getAddress
);

// admin block user
router.patch('/:userId/block',
    authMiddleware,
    authorize(Role.ADMIN),
    userController.changeUserBlockStatus
);

// admin fetch users
router.get('/',
    authMiddleware,
    authorize(Role.ADMIN, Role.PROVIDER),
    userController.getUsers
);

// admin fetch user details
router.get('/:userId',
    authMiddleware,
    authorize(Role.ADMIN),
    userController.getProfileDetails
);

export default router;