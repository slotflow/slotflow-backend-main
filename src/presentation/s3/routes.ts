import express from "express";
import { s3Controller } from "./controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/presigned-upload-url", authMiddleware, s3Controller.getFileUploadPresignedUrl);

router.get("/presigned-get-url", authMiddleware, s3Controller.getFileSignedUrl);

export default router;