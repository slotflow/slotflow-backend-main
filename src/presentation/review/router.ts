import { Router } from "express";
import { reviewController } from "./controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authRole.middleware";
import { Role } from "../../domain/enums/common.enum";

const router = Router();

router.get('/', 
    authMiddleware, 
    authorize(Role.ADMIN, Role.USER, Role.PROVIDER),
    reviewController.getReviews
);

router.post('/', 
    authMiddleware, 
    authorize(Role.USER),
    reviewController.createReview
);

router.delete('/:reviewId', 
    authMiddleware, 
    authorize(Role.USER),
    reviewController.deleteReview
);

router.patch('/:reviewId/report', 
    authMiddleware, 
    authorize(Role.PROVIDER),
    reviewController.reportReview
);

router.patch("/:reviewId/block", 
    authMiddleware, 
     authorize(Role.ADMIN),
    reviewController.toggleReviewBlockStatus
);

export default router;