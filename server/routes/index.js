import express from "express";
import apiRoutes from "./api.js";
import adminRoutes from "./admin.js";
const router = express.Router();

// Middleware to log request duration
router.use((req, res, next) => {
    const startHrTime = process.hrtime();

    res.on("finish", () => {
        const elapsedHrTime = process.hrtime(startHrTime);
        const elapsedTimeInMs =
            elapsedHrTime[0] * 1000 + elapsedHrTime[1] / 1e6;

        console.log(
            `[${res.statusCode}] ${req.method} ${req.originalUrl
            } - ${elapsedTimeInMs.toFixed(3)} ms`
        );
    });

    next();
});

router.use("/api/v1", apiRoutes);
router.use("/admin", adminRoutes);

export default router;
