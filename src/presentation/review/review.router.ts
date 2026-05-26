import { Router } from "express";
import { Role } from "../../domain/enums/common.enum";
import { reviewController } from "./review.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authRole.middleware";

const router = Router();

// admin or user or provider get reviews
router.get('/',
    authMiddleware,
    authorize(Role.ADMIN, Role.USER, Role.PROVIDER),
    reviewController.getReviews
);

// user create review
router.post('/',
    authMiddleware,
    authorize(Role.USER),
    reviewController.createReview
);

// user delete review
router.delete('/:reviewId',
    authMiddleware,
    authorize(Role.USER),
    reviewController.deleteReview
);

// provider report review
router.patch('/:reviewId/report',
    authMiddleware,
    authorize(Role.PROVIDER),
    reviewController.reportReview
);

// admin block review
router.patch("/:reviewId/block",
    authMiddleware,
    authorize(Role.ADMIN),
    reviewController.toggleReviewBlockStatus
);

export default router;