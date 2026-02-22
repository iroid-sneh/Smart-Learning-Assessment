import express from "express";
import courseController from "./course.controller.js";
import validator from "../common/config/joiValidation.js";
import createCourseDto from "./dtos/createCourseDto.js";
import updateCourseDto from "./dtos/updateCourseDto.js";
import { authMiddleware, roleMiddleware } from "../common/middleware/authMiddleware.js";
import { validateObjectId } from "../common/middleware/validateObjectId.js";

const router = express.Router();

// Publicly available to authenticated users (or you could restrict view to admin/faculty)
router.get("/", authMiddleware, courseController.getAllCourses);
router.get("/:id", authMiddleware, validateObjectId("id"), courseController.getCourseById);

// Restricted to faculty and admin
router.post(
    "/",
    authMiddleware,
    roleMiddleware("faculty", "admin"),
    validator.body(createCourseDto),
    courseController.createCourse
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("faculty", "admin"),
    validateObjectId("id"),
    validator.body(updateCourseDto),
    courseController.updateCourse
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("faculty", "admin"),
    validateObjectId("id"),
    courseController.deleteCourse
);

export default router;
