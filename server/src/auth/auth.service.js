import User from "../../models/user.js";
import Admin from "../../models/admin.js";
import Course from "../../models/course.js";
import AuthHelper from "../common/authHelper.js";
import sendMail from "../common/middleware/sendMail.js";
import { randomOtpGenerator } from "../common/helper.js";
import {
    BadRequestException,
    ConflictException,
    UnauthorizedException,
    ForbiddenException,
} from "../common/utils/errorException.js";

class authServices {
    /**
     * @description: Register a new user (student or faculty)
     */
    static async register(data, req, res) {
        let createdUserId = null;
        try {
            const { name, email, password, role = "student" } = data;

            // Trim and validate
            const trimmedName = (name || "").trim();
            const trimmedEmail = (email || "").trim().toLowerCase();

            if (!trimmedName || !trimmedEmail || !password) {
                return res.status(400).json({
                    success: false,
                    message: "All fields are required",
                });
            }

            if (trimmedName.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "Name must be at least 2 characters",
                });
            }

            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: "Password must be at least 6 characters",
                });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email: trimmedEmail });
            if (existingUser) {
                if (!existingUser.isEmailVerified) {
                    const otp = randomOtpGenerator(4);
                    existingUser.otpCode = otp;
                    existingUser.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
                    await existingUser.save();

                    await sendMail(
                        {
                            to: existingUser.email,
                            subject: "Verify your email - Smart Learn",
                            otp,
                        },
                        "verify-otp"
                    );

                    return res.status(200).json({
                        success: true,
                        message: "Account exists but email is not verified. New OTP sent.",
                        data: {
                            email: existingUser.email,
                            role: existingUser.role,
                        },
                    });
                }
                return res.status(409).json({
                    success: false,
                    message: "User with this email already exists",
                });
            }

            // Hash password
            const hashedPassword = await AuthHelper.hashPassword(password);

            // Create user
            const otp = randomOtpGenerator(4);
            const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

            const user = await User.create({
                name: trimmedName,
                email: trimmedEmail,
                password: hashedPassword,
                role: role || "student",
                isActive: true,
                isEmailVerified: false,
                otpCode: otp,
                otpExpiresAt,
            });
            createdUserId = user._id;

            // Safety guard: a newly registered user must not be auto-enrolled.
            // Enrollment should happen only through explicit faculty/admin action.
            await Course.updateMany(
                { students: user._id },
                { $pull: { students: user._id } }
            );

            await sendMail(
                {
                    to: user.email,
                    subject: "Verify your email - Smart Learn",
                    otp,
                },
                "verify-otp"
            );

            return res.status(201).json({
                success: true,
                message: "OTP sent to your email. Please verify to complete registration.",
                data: {
                    email: user.email,
                    role: user.role,
                },
            });
        } catch (error) {
            if (createdUserId) {
                await User.findByIdAndDelete(createdUserId);
            }
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "User with this email already exists",
                });
            }
            console.error("Error In Register", error);
            return res.status(500).json({
                success: false,
                message: error.message || "Registration failed. OTP email could not be sent.",
                error: process.env.ENV !== "production" ? error.message : undefined,
            });
        }
    }

    static async verifyOtp(data, req, res) {
        try {
            const { email, otp } = data;
            const trimmedEmail = (email || "").trim().toLowerCase();
            const trimmedOtp = String(otp || "").trim();

            const user = await User.findOne({ email: trimmedEmail }).select(
                "+otpCode +otpExpiresAt +password"
            );
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }

            if (user.isEmailVerified) {
                return res.status(400).json({
                    success: false,
                    message: "Email already verified. Please login.",
                });
            }

            if (!user.otpCode || !user.otpExpiresAt || user.otpCode !== trimmedOtp) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid OTP",
                });
            }

            if (new Date() > new Date(user.otpExpiresAt)) {
                return res.status(400).json({
                    success: false,
                    message: "OTP has expired. Please register again to get a new OTP.",
                });
            }

            user.isEmailVerified = true;
            user.otpCode = null;
            user.otpExpiresAt = null;
            await user.save();

            const token = AuthHelper.generateToken(user._id.toString(), {
                email: user.email,
                name: user.name,
                role: user.role,
            });

            return res.status(200).json({
                success: true,
                message: "Email verified successfully",
                data: {
                    user: user.toJSON(),
                    token,
                },
            });
        } catch (error) {
            console.error("Error In Verify OTP", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: process.env.ENV !== "production" ? error.message : undefined,
            });
        }
    }

    /**
     * @description: Login a user
     */
    static async login(data, req, res) {
        try {
            const { email, password, role } = data; // accept role to differentiate admin

            const trimmedEmail = (email || "").trim().toLowerCase();

            if (!trimmedEmail || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Email and password are required",
                });
            }

            let user;
            if (role === 'admin') {
                user = await Admin.findOne({ email: trimmedEmail }).select("+password");
            } else {
                user = await User.findOne({ email: trimmedEmail }).select("+password");
            }

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password",
                });
            }

            if (role !== 'admin' && !user.isActive) {
                return res.status(403).json({
                    success: false,
                    message: "Your account has been deactivated. Contact admin.",
                });
            }

            if (role !== "admin" && user.isEmailVerified === false) {
                return res.status(403).json({
                    success: false,
                    message: "Please verify your email with OTP before logging in.",
                });
            }

            // Verify password
            const isPasswordValid = await AuthHelper.matchHashedPassword(
                password,
                user.password
            );
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid email or password",
                });
            }

            // For admin, add the role explicitly
            const userRole = role === 'admin' ? 'admin' : user.role;
            const userName = role === 'admin' ? 'System Admin' : user.name;

            // Generate token with role
            const token = AuthHelper.generateToken(user._id.toString(), {
                email: user.email,
                name: userName,
                role: userRole,
            });

            return res.status(200).json({
                success: true,
                message: "Login successful",
                data: {
                    user: { _id: user._id, email: user.email, name: userName, role: userRole },
                    token,
                },
            });
        } catch (error) {
            console.error("Error In Login", error);
            return res.status(500).json({
                success: false,
                message: "Internal Server Error",
                error: process.env.ENV !== "production" ? error.message : undefined,
            });
        }
    }
}

export default authServices;
