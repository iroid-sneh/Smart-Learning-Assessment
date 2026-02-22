import express from "express";
import assignmentController from "./assignment.controller.js";
import validator from "../common/config/joiValidation.js";
import createAssignmentDto from "./dtos/createAssignmentDto.js";
import updateAssignmentDto from "./dtos/updateAssignmentDto.js";
import { authMiddleware, roleMiddleware } from "../common/middleware/authMiddleware.js";
import { validateObjectId } from "../common/middleware/validateObjectId.js";

const router = express.Router({ mergeParams: true });

router.get(
    "/",
    authMiddleware,
    roleMiddleware("faculty", "admin"),
    assignmentController.getAllAssignments
);

router.post(
    "/",
    authMiddleware,
    roleMiddleware("faculty", "admin"),
    validator.body(createAssignmentDto),
    assignmentController.createAssignment
);

router.get(
    "/course/:courseId",
    authMiddleware,
    validateObjectId("courseId"),
    assignmentController.getCourseAssignments
);

router.post(
    "/course/:courseId",
    authMiddleware,
    roleMiddleware("faculty", "admin"),
    validateObjectId("courseId"),
    validator.body(createAssignmentDto),
    assignmentController.createAssignment
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("faculty", "admin"),
    validateObjectId("id"),
    validator.body(updateAssignmentDto),
    assignmentController.updateAssignment
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("faculty", "admin"),
    validateObjectId("id"),
    assignmentController.deleteAssignment
);

export default router;
