import express from "express";
import announcementController from "./announcement.controller.js";
import validator from "../common/config/joiValidation.js";
import createAnnouncementDto from "./dtos/createAnnouncementDto.js";
import updateAnnouncementDto from "./dtos/updateAnnouncementDto.js";
import { authMiddleware, roleMiddleware } from "../common/middleware/authMiddleware.js";
import { validateObjectId } from "../common/middleware/validateObjectId.js";

const router = express.Router();

// Everyone (authenticated) can view announcements
router.get(
    "/",
    authMiddleware,
    announcementController.getAllAnnouncements
);

// Admin only
router.post(
    "/",
    authMiddleware,
    roleMiddleware("admin"),
    validator.body(createAnnouncementDto),
    announcementController.createAnnouncement
);

router.put(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    validateObjectId("id"),
    validator.body(updateAnnouncementDto),
    announcementController.updateAnnouncement
);

router.delete(
    "/:id",
    authMiddleware,
    roleMiddleware("admin"),
    validateObjectId("id"),
    announcementController.deleteAnnouncement
);

export default router;
