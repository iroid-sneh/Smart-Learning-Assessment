import User from "../../models/user.js";
import Admin from "../../models/admin.js";
import AuthHelper from "../common/authHelper.js";
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
                return res.status(409).json({
                    success: false,
                    message: "User with this email already exists",
                });
            }

            // Hash password
            const hashedPassword = await AuthHelper.hashPassword(password);

            // Create user
            const user = await User.create({
                name: trimmedName,
                email: trimmedEmail,
                password: hashedPassword,
                role: role || "student",
                isActive: true,
            });

            // Generate token
            const token = AuthHelper.generateToken(user._id.toString(), {
                email: user.email,
                name: user.name,
                role: user.role,
            });

            // Remove password from response (toJSON handles it)
            return res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: {
                    user: user.toJSON(),
                    token,
                },
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({
                    success: false,
                    message: "User with this email already exists",
                });
            }
            console.error("Error In Register", error);
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
