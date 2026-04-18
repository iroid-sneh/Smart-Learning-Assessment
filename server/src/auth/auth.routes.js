import express from "express";
import authController from "./auth.controller.js";
import validator from "../common/config/joiValidation.js";
import registerDto from "./dtos/registerDto.js";
import loginDto from "./dtos/loginDto.js";
import verifyOtpDto from "./dtos/verifyOtpDto.js";
import forgotPasswordDto from "./dtos/forgotPasswordDto.js";
import resetPasswordDto from "./dtos/resetPasswordDto.js";
import changePasswordDto from "./dtos/changePasswordDto.js";
import { authMiddleware } from "../common/middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", validator.body(registerDto), authController.register);
router.post("/verify-otp", validator.body(verifyOtpDto), authController.verifyOtp);
router.post("/login", validator.body(loginDto), authController.login);
router.post("/forgot-password", validator.body(forgotPasswordDto), authController.forgotPassword);
router.post("/reset-password", validator.body(resetPasswordDto), authController.resetPassword);
router.post(
    "/change-password",
    authMiddleware,
    validator.body(changePasswordDto),
    authController.changePassword
);

export default router;
