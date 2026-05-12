import { Router } from "express";
import { Role } from "../../domain/enums/common.enum";
import { creditController } from "./credits.controller";
import { authorize } from "../middleware/authRole.middleware";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

// user get credit account details
router.get('/me',
    authMiddleware,
    authorize(Role.USER, Role.PROVIDER),
    creditController.getCreditAccountDetails
);

// user get credit account transactions
router.get('/me/transactions',
    authMiddleware,
    authorize(Role.USER, Role.PROVIDER),
    creditController.getCreditTransactions
);

export default router;