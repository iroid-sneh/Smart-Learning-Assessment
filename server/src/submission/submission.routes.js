import express from "express";
import submissionController from "./submission.controller.js";
import validator from "../common/config/joiValidation.js";
import createSubmissionDto from "./dtos/createSubmissionDto.js";
import evaluateSubmissionDto from "./dtos/evaluateSubmissionDto.js";
import { authMiddleware, roleMiddleware } from "../common/middleware/authMiddleware.js";
import { validateObjectId } from "../common/middleware/validateObjectId.js";

import storeFiles from "../common/middleware/storeFiles.js";

const router = express.Router({ mergeParams: true });

// Student creating submission
router.post(
    "/assignment/:assignmentId",
    authMiddleware,
    roleMiddleware("student"),
    validateObjectId("assignmentId"),
    storeFiles("public/uploads/submissions", "file"),
    submissionController.createSubmission
);

// Student viewing their own submissions
router.get(
    "/my",
    authMiddleware,
    roleMiddleware("student"),
    submissionController.getMySubmissions
);

// Faculty viewing submissions for an assignment
router.get(
    "/assignment/:assignmentId",
    authMiddleware,
    roleMiddleware("faculty", "admin"),
    validateObjectId("assignmentId"),
    submissionController.getAssignmentSubmissions
);

// Faculty evaluating a submission
router.put(
    "/:id/evaluate",
    authMiddleware,
    roleMiddleware("faculty", "admin"),
    validateObjectId("id"),
    validator.body(evaluateSubmissionDto),
    submissionController.evaluateSubmission
);

export default router;
