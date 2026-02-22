import express from "express";
import userManagementController from "./user.controller.js";
import { authMiddleware, roleMiddleware } from "../../common/middleware/authMiddleware.js";
import { validateObjectId } from "../../common/middleware/validateObjectId.js";

const router = express.Router();

router.use(authMiddleware);

// Both Admin and Faculty can fetch users (faculty needs to fetch students to enroll them)
router.get(
    "/",
    roleMiddleware("admin", "faculty"),
    userManagementController.getAllUsers
);

// Only Admins can update/delete users
router.put(
    "/:id",
    roleMiddleware("admin"),
    validateObjectId("id"),
    userManagementController.updateUser
);

router.delete(
    "/:id",
    roleMiddleware("admin"),
    validateObjectId("id"),
    userManagementController.deleteUser
);

export default router;
