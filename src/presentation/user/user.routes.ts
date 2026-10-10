import { Router } from "express";
import { userController } from "./user.controller";
import { Role } from "../../domain/enums/common.enum";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { addressController } from "../address/address.controller";

const router = Router();

router.patch(
  "/me/profile-setup",
  authMiddleware,
  authorize(Role.USER),
  userController.profileSetup,
);

// user get profile details
router.get("/me", authMiddleware, authorize(Role.USER), userController.getProfileDetails);

// user / provider update profile image
router.patch(
  "/me/image",
  authMiddleware,
  authorize(Role.USER, Role.PROVIDER),
  userController.updateProfileImage,
);

// user update user info
router.patch(
  "/me",
  authMiddleware,
  authorize(Role.USER, Role.PROVIDER),
  userController.updateUserInfo,
);

// admin get user address
router.get(
  "/:userId/address",
  authMiddleware,
  authorize(Role.ADMIN, Role.USER),
  addressController.getAddress,
);

// admin block user
router.patch(
  "/:userId/block",
  authMiddleware,
  authorize(Role.ADMIN),
  userController.changeUserBlockStatus,
);

// admin get user details
router.get("/:userId", authMiddleware, authorize(Role.ADMIN), userController.getProfileDetails);

// user update password
router.patch(
  "/password",
  authMiddleware,
  authorize(Role.USER, Role.PROVIDER),
  userController.updatePassword,
);

// admin get users for listing  and user and provider get users for chat
router.get(
  "/",
  authMiddleware,
  authorize(Role.ADMIN, Role.PROVIDER, Role.USER),
  userController.getUsers,
);

export default router;
