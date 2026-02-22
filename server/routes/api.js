import express from "express";
import authRoutes from "../src/auth/auth.routes.js";
import courseRoutes from "../src/course/course.routes.js";
import materialRoutes from "../src/material/material.routes.js";
import assignmentRoutes from "../src/assignment/assignment.routes.js";
import submissionRoutes from "../src/submission/submission.routes.js";
import progressRoutes from "../src/progress/progress.routes.js";
import announcementRoutes from "../src/announcement/announcement.routes.js";
import userRoutes from "../src/admin/userManagement/user.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/courses", courseRoutes);
router.use("/materials", materialRoutes);
router.use("/assignments", assignmentRoutes);
router.use("/submissions", submissionRoutes);
router.use("/students", progressRoutes);
router.use("/announcements", announcementRoutes);
router.use("/users", userRoutes);

export default router;
