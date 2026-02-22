import express from "express";
import materialController from "./material.controller.js";
import validator from "../common/config/joiValidation.js";
import createMaterialDto from "./dtos/createMaterialDto.js";
import updateMaterialDto from "./dtos/updateMaterialDto.js";
import { authMiddleware, roleMiddleware } from "../common/middleware/authMiddleware.js";
import { validateObjectId } from "../common/middleware/validateObjectId.js";
import storeFiles from "../common/middleware/storeFiles.js";

// mergeParams: true is needed if we mount this router on "/api/courses/:courseId/materials" later
const router = express.Router({ mergeParams: true });

// Students, Faculty, Admin can view course materials
router.get(
    "/course/:courseId",
    authMiddleware,
    validateObjectId("courseId"),
    materialController.getCourseMaterials
);

// Only Faculty and Admin can upload, edit, delete
router.post(
    "/course/:courseId",
    authMiddleware,
    roleMiddleware("faculty", "admin"),
    validateObjectId("courseId"),
    storeFiles("public/uploads/materials", "file"),
    validator.body(createMaterialDto),
    materialController.createMaterial
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("faculty", "admin"),
    validateObjectId("id"),
    validator.body(updateMaterialDto),
    materialController.updateMaterial
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("faculty", "admin"),
    validateObjectId("id"),
    materialController.deleteMaterial
);

export default router;
