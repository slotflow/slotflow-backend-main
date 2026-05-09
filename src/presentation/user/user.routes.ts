import { Router } from "express";
import { userController } from "./user.controller";
import { Role } from "../../domain/enums/common.enum";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { addressController } from "../address/address.controller";

const router = Router();

router.patch('/me/preboarding',
    authMiddleware,
    authorize(Role.USER),
    userController.preBoarding
)

// user get profile details
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

// admin get user address
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

// admin get users
router.get('/',
    authMiddleware,
    authorize(Role.ADMIN, Role.PROVIDER, Role.USER),
    userController.getUsers
);

// admin get user details
router.get('/:userId',
    authMiddleware,
    authorize(Role.ADMIN),
    userController.getProfileDetails
);

export default router;