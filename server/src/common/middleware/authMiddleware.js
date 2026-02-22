import AuthHelper from "../authHelper.js";
import User from "../../../models/user.js";
import Admin from "../../../models/admin.js";
import {
    UnauthorizedException,
    ForbiddenException,
} from "../utils/errorException.js";

/**
 * @description Verify JWT token and attach user to request
 */
export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next(
                new UnauthorizedException(
                    "Access denied. No token provided."
                )
            );
        }

        const token = authHeader.split(" ")[1];
        if (!token || token.trim() === "") {
            return next(new UnauthorizedException("Access denied. Invalid token format."));
        }

        let decoded;
        try {
            decoded = AuthHelper.verifyToken(token);
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return next(new UnauthorizedException("Token has expired. Please login again."));
            }
            return next(new UnauthorizedException("Invalid token."));
        }

        // Fetch fresh user from DB to check isActive
        // Fetch fresh user from DB to check isActive
        let user;
        if (decoded.role === "admin") {
            const adminDoc = await Admin.findById(decoded.id).select("-password");
            if (adminDoc) {
                user = adminDoc.toObject();
                user.role = "admin";
                user.isActive = true; // Admins are always active
            }
        } else {
            user = await User.findById(decoded.id).select("-password");
        }

        if (!user) {
            return next(new UnauthorizedException("User no longer exists."));
        }
        if (!user.isActive) {
            return next(new ForbiddenException("Your account has been deactivated. Contact admin."));
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * @description Restrict route access to specific roles
 * @param {...string} roles - Allowed roles
 */
export const roleMiddleware = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new UnauthorizedException("Authentication required."));
        }
        if (!roles.includes(req.user.role)) {
            return next(
                new ForbiddenException(
                    `Access denied. Required role: ${roles.join(" or ")}`
                )
            );
        }
        next();
    };
};
