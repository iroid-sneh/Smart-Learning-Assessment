import express from "express";
import progressController from "./progress.controller.js";
import { authMiddleware } from "../common/middleware/authMiddleware.js";
import { validateObjectId } from "../common/middleware/validateObjectId.js";

const router = express.Router();

router.get(
    "/:id/progress",
    authMiddleware,
    validateObjectId("id"),
    progressController.getStudentProgress
);

export default router;
